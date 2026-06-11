import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { RawPost } from "@/declaration";
import {
  INSTAGRAM_DEFAULT_OUTPUT_DIR,
  INSTAGRAM_WEB_PROFILE_INFO_URL
} from "@/config";
import { extractInstagramUsername, normalizeHandle } from "@/fetcherUtils";
import { InstagramScraper, ScraperInput, ScraperResult } from "@/scrapers/base-scraper.interface";

type InstagramPostNode = {
  id: string;
  shortcode: string;
  is_video?: boolean;
  taken_at_timestamp?: number;
  video_url?: string;
  video_view_count?: number;
  video_play_count?: number;
  thumbnail_src?: string;
  display_url?: string;
  edge_liked_by?: { count?: number };
  edge_media_preview_like?: { count?: number };
  edge_media_to_comment?: { count?: number };
  edge_media_to_caption?: {
    edges?: Array<{ node?: { text?: string } }>;
  };
};

type InstagramProfileResponse = {
  data?: {
    user?: {
      username?: string;
      full_name?: string;
      edge_followed_by?: { count?: number };
      edge_owner_to_timeline_media?: {
        edges?: Array<{ node: InstagramPostNode }>;
      };
    };
  };
};

function requestHeaders(referer = "https://www.instagram.com/") {
  const headers: Record<string, string> = {
    accept: "application/json,text/html;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    referer,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "x-asbd-id": "129477",
    "x-ig-app-id": "936619743392459",
    "x-requested-with": "XMLHttpRequest"
  };

  if (process.env.IG_SESSIONID) {
    headers.cookie = `sessionid=${process.env.IG_SESSIONID}`;
  }

  return headers;
}

async function fetchJson<T>(url: string, referer?: string): Promise<T> {
  const response = await fetch(url, { headers: requestHeaders(referer), cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Instagram request failed: ${response.status} ${response.statusText}\n${body.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

async function fetchText(url: string) {
  const response = await fetch(url, { headers: requestHeaders(url), cache: "no-store" });
  if (!response.ok) return "";
  return response.text();
}

function decodeEscapedUrl(value: string) {
  return value
    .replaceAll("\\u0026", "&")
    .replaceAll("\\/", "/")
    .replaceAll("&amp;", "&")
    .replaceAll("\\u003d", "=");
}

function findVideoUrlInHtml(html: string) {
  const ogMatch = html.match(/property=["']og:video["']\s+content=["']([^"']+)["']/i);
  if (ogMatch?.[1]) return decodeEscapedUrl(ogMatch[1]);

  const jsonMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/i);
  if (jsonMatch?.[1]) return decodeEscapedUrl(jsonMatch[1]);

  return "";
}

async function fetchVideoUrlFromMediaInfo(mediaId: string) {
  const url = `https://i.instagram.com/api/v1/media/${encodeURIComponent(mediaId)}/info/`;
  try {
    const data = await fetchJson<{
      items?: Array<{
        video_versions?: Array<{ url?: string }>;
        carousel_media?: Array<{ video_versions?: Array<{ url?: string }> }>;
      }>;
    }>(url, "https://www.instagram.com/");
    const item = data.items?.[0];
    const directVideo = item?.video_versions?.[0]?.url;
    if (directVideo) return directVideo;

    return item?.carousel_media?.find((media) => media.video_versions?.[0]?.url)?.video_versions?.[0]?.url ?? "";
  } catch {
    return "";
  }
}

async function fetchVideoUrl(shortcode: string, mediaId: string) {
  const mediaInfoUrl = await fetchVideoUrlFromMediaInfo(mediaId);
  if (mediaInfoUrl) return mediaInfoUrl;

  for (const type of ["reel", "p"]) {
    const html = await fetchText(`https://www.instagram.com/${type}/${shortcode}/`);
    const videoUrl = findVideoUrlInHtml(html);
    if (videoUrl) return videoUrl;
  }

  return "";
}

function getCaption(node: InstagramPostNode) {
  return node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";
}

function isWithinDateWindow(postedAt: string, input: ScraperInput) {
  const postedAtTime = new Date(postedAt).getTime();
  const dateFrom = input.dateFrom ? new Date(input.dateFrom).getTime() : null;
  const dateTo = input.dateTo ? new Date(input.dateTo) : null;
  if (dateTo) {
    dateTo.setHours(23, 59, 59, 999);
  }

  if (dateFrom && postedAtTime < dateFrom) return false;
  if (dateTo && postedAtTime > dateTo.getTime()) return false;

  const cutoff = Date.now() - input.lookbackDays * 24 * 60 * 60 * 1000;
  return postedAtTime >= cutoff;
}

async function downloadVideo(videoUrl: string, destination: string) {
  const response = await fetch(videoUrl, { headers: requestHeaders("https://www.instagram.com/"), cache: "no-store" });
  if (!response.ok || !response.body) {
    throw new Error(`Video download failed: ${response.status} ${response.statusText}`);
  }

  await pipeline(Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(destination));
}

export class InstagramWebScraper implements InstagramScraper {
  async fetchPosts(input: ScraperInput): Promise<ScraperResult> {
    const username = extractInstagramUsername(input.handle);
    const handle = normalizeHandle(username);
    const limit = input.limit ?? 5;
    const outputRoot = input.outputDir ?? INSTAGRAM_DEFAULT_OUTPUT_DIR;
    const outputDir = path.join(outputRoot, username);

    if (input.downloadVideos) {
      await mkdir(outputDir, { recursive: true });
    }

    const profileUrl = `${INSTAGRAM_WEB_PROFILE_INFO_URL}?username=${encodeURIComponent(username)}`;
    const profile = await fetchJson<InstagramProfileResponse>(profileUrl, `https://www.instagram.com/${username}/`);
    const user = profile.data?.user;
    const edges = user?.edge_owner_to_timeline_media?.edges ?? [];

    if (!user || edges.length === 0) {
      throw new Error(`No public posts found for ${username}. The account may be private, blocked, or rate-limited.`);
    }

    const posts: RawPost[] = [];
    for (const edge of edges) {
      if (posts.length >= limit) break;

      const node = edge.node;
      if (input.contentType === "reels" && !node.is_video) continue;
      if (input.contentType === "posts" && node.is_video) continue;

      const postedAt = node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : new Date().toISOString();
      if (!isWithinDateWindow(postedAt, input)) continue;

      let videoUrl = node.video_url ?? "";
      if (node.is_video && !videoUrl) {
        videoUrl = await fetchVideoUrl(node.shortcode, node.id);
      }

      if (input.downloadVideos && videoUrl) {
        await downloadVideo(videoUrl, path.join(outputDir, `${node.shortcode}.mp4`));
      }

      posts.push({
        id: node.id,
        shortcode: node.shortcode,
        account: handle,
        accountName: user.full_name || username,
        followers: user.edge_followed_by?.count ?? 0,
        url: `https://www.instagram.com/p/${node.shortcode}/`,
        thumbnailUrl: node.thumbnail_src ?? node.display_url ?? "",
        videoUrl,
        downloadedVideoPath: input.downloadVideos && videoUrl ? path.join(outputDir, `${node.shortcode}.mp4`) : undefined,
        caption: getCaption(node),
        postedAt,
        views: node.video_view_count ?? node.video_play_count ?? 0,
        likes: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? 0,
        commentsCount: node.edge_media_to_comment?.count ?? 0,
        contentType: node.is_video ? "reel" : "post",
        comments: [],
        rawData: node
      });
    }

    return {
      handle,
      fetchedAt: new Date().toISOString(),
      source: "instagram_web",
      posts
    };
  }
}

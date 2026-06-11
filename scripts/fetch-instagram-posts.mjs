import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const DEFAULT_ACCOUNT_URL = "https://www.instagram.com/groww_official/";
const WEB_PROFILE_INFO_URL = "https://www.instagram.com/api/v1/users/web_profile_info/";

function getArgValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) return fallback;
  return process.argv[index + 1];
}

function getAccountInput() {
  return process.argv.find((arg) => arg.startsWith("http") || arg.startsWith("@")) ?? DEFAULT_ACCOUNT_URL;
}

function logStep(message, details = {}) {
  const suffix = Object.keys(details).length ? ` ${JSON.stringify(details)}` : "";
  console.error(`[instagram-fetch] ${message}${suffix}`);
}

function extractUsername(input) {
  if (input.startsWith("@")) return input.slice(1);
  const url = new URL(input);
  const username = url.pathname.split("/").filter(Boolean)[0];
  if (!username) throw new Error(`Could not extract username from ${input}`);
  return username;
}

function requestHeaders(referer = "https://www.instagram.com/") {
  const headers = {
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

async function fetchJson(url, referer) {
  const response = await fetch(url, { headers: requestHeaders(referer) });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Instagram request failed: ${response.status} ${response.statusText}\n${body.slice(0, 300)}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: requestHeaders(url) });
  if (!response.ok) return "";
  return response.text();
}

function decodeEscapedUrl(value) {
  return value
    .replaceAll("\\u0026", "&")
    .replaceAll("\\/", "/")
    .replaceAll("&amp;", "&")
    .replaceAll("\\u003d", "=");
}

function findVideoUrlInHtml(html) {
  const ogMatch = html.match(/property=["']og:video["']\s+content=["']([^"']+)["']/i);
  if (ogMatch?.[1]) return decodeEscapedUrl(ogMatch[1]);

  const jsonMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/i);
  if (jsonMatch?.[1]) return decodeEscapedUrl(jsonMatch[1]);

  return "";
}

async function fetchVideoUrlFromMediaInfo(mediaId) {
  const url = `https://i.instagram.com/api/v1/media/${encodeURIComponent(mediaId)}/info/`;
  try {
    const data = await fetchJson(url, "https://www.instagram.com/");
    const item = data.items?.[0];
    const directVideo = item?.video_versions?.[0]?.url;
    if (directVideo) return directVideo;

    const carouselVideo = item?.carousel_media?.find((media) => media.video_versions?.[0]?.url)?.video_versions?.[0]?.url;
    return carouselVideo ?? "";
  } catch {
    return "";
  }
}

async function fetchVideoUrl(shortcode, mediaId) {
  const mediaInfoUrl = await fetchVideoUrlFromMediaInfo(mediaId);
  if (mediaInfoUrl) return mediaInfoUrl;

  for (const type of ["reel", "p"]) {
    const html = await fetchText(`https://www.instagram.com/${type}/${shortcode}/`);
    const videoUrl = findVideoUrlInHtml(html);
    if (videoUrl) return videoUrl;
  }

  return "";
}

function firstCaption(node) {
  return node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";
}

function normalizePost(node) {
  const takenAt = node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : null;

  return {
    shortcode: node.shortcode,
    mediaId: node.id,
    permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    isVideo: Boolean(node.is_video),
    caption: firstCaption(node),
    postedAt: takenAt,
    metrics: {
      views: node.video_view_count ?? node.video_play_count ?? null,
      likes: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? null,
      comments: node.edge_media_to_comment?.count ?? null
    },
    thumbnailUrl: node.thumbnail_src ?? node.display_url ?? "",
    videoUrl: node.video_url ?? "",
    downloadedVideoPath: null
  };
}

async function downloadVideo(videoUrl, destination) {
  const response = await fetch(videoUrl, { headers: requestHeaders("https://www.instagram.com/") });
  if (!response.ok || !response.body) {
    throw new Error(`Video download failed: ${response.status} ${response.statusText}`);
  }

  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination));
}

async function main() {
  const accountInput = getAccountInput();
  const username = extractUsername(accountInput);
  const limit = Number(getArgValue("--limit", "5"));
  const shouldDownload = !process.argv.includes("--no-download");
  const outRoot = getArgValue("--out", "downloads/instagram");
  const outDir = path.join(outRoot, username);

  await mkdir(outDir, { recursive: true });

  const profileUrl = `${WEB_PROFILE_INFO_URL}?username=${encodeURIComponent(username)}`;
  logStep("starting profile fetch", {
    username,
    limit,
    shouldDownload,
    outDir,
    hasSession: Boolean(process.env.IG_SESSIONID)
  });

  const profile = await fetchJson(profileUrl, `https://www.instagram.com/${username}/`);
  const user = profile.data?.user;
  const edges = user?.edge_owner_to_timeline_media?.edges ?? [];

  logStep("profile response received", {
    username,
    profileFound: Boolean(user),
    timelineEdges: edges.length,
    requestedLimit: limit,
    followers: user?.edge_followed_by?.count ?? 0
  });

  if (!user || edges.length === 0) {
    throw new Error(`No public posts found for ${username}. The account may be private, blocked, or rate-limited.`);
  }

  const posts = edges.slice(0, limit).map((edge) => normalizePost(edge.node));
  logStep("selected posts from timeline edges", {
    selectedPosts: posts.length,
    limitedByInstagramResponse: edges.length < limit
  });

  let videosWithResolvedUrl = 0;
  let videosMissingUrl = 0;
  let videosDownloaded = 0;
  for (const post of posts) {
    if (post.isVideo && !post.videoUrl) {
      logStep("resolving video url", { shortcode: post.shortcode });
      post.videoUrl = await fetchVideoUrl(post.shortcode, post.mediaId);
    }
    if (post.isVideo && post.videoUrl) videosWithResolvedUrl += 1;
    if (post.isVideo && !post.videoUrl) {
      videosMissingUrl += 1;
      logStep("video url unavailable", { shortcode: post.shortcode });
    }

    if (shouldDownload && post.videoUrl) {
      const filename = `${post.shortcode}.mp4`;
      const destination = path.join(outDir, filename);
      logStep("downloading video", { shortcode: post.shortcode, destination });
      await downloadVideo(post.videoUrl, destination);
      post.downloadedVideoPath = destination;
      videosDownloaded += 1;
    }
  }

  logStep("finished posts fetch", {
    username,
    requestedLimit: limit,
    timelineEdges: edges.length,
    postCount: posts.length,
    videosWithResolvedUrl,
    videosMissingUrl,
    videosDownloaded
  });

  const result = {
    username,
    accountUrl: `https://www.instagram.com/${username}/`,
    fetchedAt: new Date().toISOString(),
    postCount: posts.length,
    note:
      "Uses Instagram public web endpoints. If Instagram rate-limits or withholds video URLs, set IG_SESSIONID or rerun later.",
    posts
  };

  const reportPath = path.join(outDir, "last-5-posts.json");
  await writeFile(reportPath, JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
  console.log(`\nSaved report to ${reportPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

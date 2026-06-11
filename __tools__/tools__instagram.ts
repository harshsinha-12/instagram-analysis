import { z } from "zod";
import { ContentType, ToolDefinition } from "@/declaration";
import { InstagramWebScraper } from "@/scrapers/instagram-web-scraper";

export const TOOL_FETCH_INSTAGRAM_POSTS = "fetchInstagramPosts";

export const FetchInstagramPostsInputSchema = z.object({
  handle: z.string().min(1),
  contentType: z.enum(["reels", "posts", "both"]),
  lookbackDays: z.number().int().positive(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().int().positive(),
  downloadVideos: z.boolean().default(true)
});

export const DEF_FETCH_INSTAGRAM_POSTS: ToolDefinition = {
  type: "function",
  function: {
    name: TOOL_FETCH_INSTAGRAM_POSTS,
    description:
      "Fetch public Instagram posts or reels for a competitor handle, including available public metrics and downloadable video URLs when present.",
    parameters: {
      type: "object",
      properties: {
        handle: {
          type: "string",
          description:
            "The Instagram competitor handle or profile URL to fetch, for example '@zerodhaonline' or 'https://www.instagram.com/zerodhaonline/'."
        },
        contentType: {
          type: "string",
          enum: ["reels", "posts", "both"],
          description:
            "The type of Instagram content to collect. Use 'reels' for video-only analysis, 'posts' for static feed posts, and 'both' for mixed collection."
        },
        lookbackDays: {
          type: "number",
          description:
            "Maximum age of posts to include when explicit date bounds do not exclude them."
        },
        dateFrom: {
          type: "string",
          description:
            "Optional inclusive YYYY-MM-DD lower date bound for post collection."
        },
        dateTo: {
          type: "string",
          description:
            "Optional inclusive YYYY-MM-DD upper date bound for post collection."
        },
        limit: {
          type: "number",
          description:
            "Maximum number of posts to fetch for this competitor handle."
        },
        downloadVideos: {
          type: "boolean",
          description:
            "Whether to download available reel/video media for transcription and frame analysis."
        }
      },
      required: ["handle", "contentType", "lookbackDays", "limit"],
      additionalProperties: false
    }
  }
};

export async function fetchInstagramPostsTool(params: z.infer<typeof FetchInstagramPostsInputSchema>) {
  const input = FetchInstagramPostsInputSchema.parse(params);
  const scraper = new InstagramWebScraper();

  return scraper.fetchPosts({
    handle: input.handle,
    contentType: input.contentType as ContentType,
    lookbackDays: input.lookbackDays,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    limit: input.limit,
    downloadVideos: input.downloadVideos
  });
}

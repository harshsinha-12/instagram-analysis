import { ContentType, RawPost } from "@/lib/types";

export type ScraperInput = {
  handle: string;
  lookbackDays: number;
  dateFrom?: string;
  dateTo?: string;
  contentType: ContentType;
  limit?: number;
  downloadVideos?: boolean;
  outputDir?: string;
};

export type ScraperResult = {
  handle: string;
  fetchedAt: string;
  source: "instagram_web" | "meta_ads";
  posts: RawPost[];
};

export interface InstagramScraper {
  fetchPosts(input: ScraperInput): Promise<ScraperResult>;
}

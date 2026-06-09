import { ContentType, RawPost } from "@/lib/types";

export type ScraperInput = {
  handle: string;
  lookbackDays: number;
  contentType: ContentType;
};

export type ScraperResult = {
  handle: string;
  fetchedAt: string;
  source: "csv" | "apify" | "rapidapi" | "meta_ads";
  posts: RawPost[];
};

export interface InstagramScraper {
  fetchPosts(input: ScraperInput): Promise<ScraperResult>;
}

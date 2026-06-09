import { samplePosts } from "@/lib/sample-data";
import { normalizeHandle } from "@/lib/report";
import { InstagramScraper, ScraperInput, ScraperResult } from "@/scrapers/base-scraper.interface";

export class CsvImportScraper implements InstagramScraper {
  async fetchPosts(input: ScraperInput): Promise<ScraperResult> {
    const handle = normalizeHandle(input.handle);
    return {
      handle,
      fetchedAt: new Date().toISOString(),
      source: "csv",
      posts: samplePosts.filter((post) => post.account === handle)
    };
  }
}

import { InstagramScraper, ScraperInput, ScraperResult } from "@/scrapers/base-scraper.interface";

export class ApifyScraper implements InstagramScraper {
  async fetchPosts(_input: ScraperInput): Promise<ScraperResult> {
    throw new Error("Apify scraper is not wired yet. Use CsvImportScraper for the demo path.");
  }
}

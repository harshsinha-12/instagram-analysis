import { InstagramScraper, ScraperInput, ScraperResult } from "@/scrapers/base-scraper.interface";

export class RapidApiScraper implements InstagramScraper {
  async fetchPosts(_input: ScraperInput): Promise<ScraperResult> {
    throw new Error("RapidAPI scraper is not wired yet. Use CsvImportScraper for the demo path.");
  }
}

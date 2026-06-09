import { AnalysisInput } from "@/lib/types";
import { ScraperResult } from "@/scrapers/base-scraper.interface";
import { InstagramWebScraper } from "@/scrapers/instagram-web-scraper";
import { logger } from "@/__tools__/logger";

export type DataCollectionResult = {
  results: ScraperResult[];
  fetchErrors: Array<{ handle: string; error: string }>;
};

export async function runDataCollectionAgent(input: AnalysisInput): Promise<DataCollectionResult> {
  const scraper = new InstagramWebScraper();
  const handles = input.competitors.length > 0 ? input.competitors : [];
  const results: ScraperResult[] = [];
  const fetchErrors: Array<{ handle: string; error: string }> = [];

  await Promise.all(
    handles.map(async (handle) => {
      try {
        logger.info({ handle, contentType: input.contentType, limit: input.postsToFetchPerCompetitor }, "fetching instagram posts");
        const result = await scraper.fetchPosts({
          handle,
          lookbackDays: input.lookbackDays,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          contentType: input.contentType,
          limit: input.postsToFetchPerCompetitor,
          downloadVideos: true
        });
        logger.info({ handle, posts: result.posts.length }, "fetched instagram posts");
        results.push(result);
      } catch (error) {
        logger.warn({ handle, error: error instanceof Error ? error.message : error }, "instagram fetch failed");
        fetchErrors.push({
          handle,
          error: error instanceof Error ? error.message : "Unknown scraper error"
        });
      }
    })
  );

  return { results, fetchErrors };
}

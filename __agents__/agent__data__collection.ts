import { AGENT_DATA_COLLECTION } from "@/config";
import { AnalysisInput } from "@/declaration";
import { getErrorMessage } from "@/fetcherUtils";
import { ScraperResult } from "@/scrapers/base-scraper.interface";
import { logger } from "@/__tools__/tools__logger";
import {
  DEF_FETCH_INSTAGRAM_POSTS,
  TOOL_FETCH_INSTAGRAM_POSTS,
  fetchInstagramPostsTool
} from "@/__tools__/tools__instagram";

export type DataCollectionResult = {
  results: ScraperResult[];
  fetchErrors: Array<{ handle: string; error: string }>;
};

type FetchCompetitorResult =
  | { ok: true; handle: string; result: ScraperResult }
  | { ok: false; handle: string; error: string };

async function fetchCompetitorPosts(input: AnalysisInput, handle: string) {
  logger.info(
    {
      agent: AGENT_DATA_COLLECTION,
      handle,
      contentType: input.contentType,
      limit: input.postsToFetchPerCompetitor,
      tool: TOOL_FETCH_INSTAGRAM_POSTS,
      toolDefinition: DEF_FETCH_INSTAGRAM_POSTS.function.name
    },
    "fetching instagram posts"
  );

  const result = await fetchInstagramPostsTool({
    handle,
    lookbackDays: input.lookbackDays,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    contentType: input.contentType,
    limit: input.postsToFetchPerCompetitor,
    downloadVideos: true
  });

  logger.info({ agent: AGENT_DATA_COLLECTION, handle, posts: result.posts.length }, "fetched instagram posts");
  return result;
}

export async function runDataCollectionAgent(input: AnalysisInput): Promise<DataCollectionResult> {
  const settled: FetchCompetitorResult[] = await Promise.all(
    input.competitors.map(async (handle) => {
      try {
        return {
          ok: true,
          handle,
          result: await fetchCompetitorPosts(input, handle)
        };
      } catch (error) {
        const message = getErrorMessage(error, "Unknown scraper error");
        logger.warn({ agent: AGENT_DATA_COLLECTION, handle, error: message }, "instagram fetch failed");
        return {
          ok: false,
          handle,
          error: message
        };
      }
    })
  );

  const results: ScraperResult[] = [];
  const fetchErrors: Array<{ handle: string; error: string }> = [];

  for (const item of settled) {
    if (item.ok) {
      results.push(item.result);
    } else {
      fetchErrors.push({ handle: item.handle, error: item.error });
    }
  }

  return { results, fetchErrors };
}

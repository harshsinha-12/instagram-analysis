import { scorePosts } from "@/lib/scoring";
import { AnalysisInput, RawPost } from "@/declaration";
import { logger } from "@/__tools__/tools__logger";
import { AGENT_SCORING } from "@/config";

function getDateRange(input: AnalysisInput) {
  const dateFrom = input.dateFrom ? new Date(input.dateFrom) : null;
  const dateTo = input.dateTo ? new Date(input.dateTo) : null;

  if (dateTo) {
    dateTo.setHours(23, 59, 59, 999);
  }

  return { dateFrom, dateTo };
}

function isInsideDateRange(post: RawPost, dateRange: ReturnType<typeof getDateRange>) {
  const postedAt = new Date(post.postedAt);

  if (dateRange.dateFrom && postedAt < dateRange.dateFrom) return false;
  if (dateRange.dateTo && postedAt > dateRange.dateTo) return false;

  return true;
}

export function runScoringAgent(input: AnalysisInput, fetchedPosts: RawPost[]) {
  const dateRange = getDateRange(input);
  const maxPosts = input.postsToFetchPerCompetitor * Math.max(input.competitors.length, 1);

  const posts = fetchedPosts
    .filter((post) => isInsideDateRange(post, dateRange))
    .slice(0, maxPosts);

  if (posts.length === 0) {
    logger.warn(
      {
        agent: AGENT_SCORING,
        fetchedPosts: fetchedPosts.length,
        postsAfterDateFilterAndLimit: posts.length,
        maxPosts,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo
      },
      "no posts available for scoring"
    );
    return [];
  }

  const scored = scorePosts(posts);
  logger.info(
    {
      agent: AGENT_SCORING,
      fetchedPosts: fetchedPosts.length,
      postsAfterDateFilterAndLimit: posts.length,
      maxPosts,
      scoredPosts: scored.length,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo
    },
    "scoring completed"
  );

  return scored;
}

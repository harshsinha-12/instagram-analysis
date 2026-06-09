import { scorePosts } from "@/lib/scoring";
import { AnalysisInput, RawPost } from "@/lib/types";

export function runScoringAgent(input: AnalysisInput, fetchedPosts: RawPost[]) {
  const dateFrom = input.dateFrom ? new Date(input.dateFrom) : null;
  const dateTo = input.dateTo ? new Date(input.dateTo) : null;
  if (dateTo) {
    dateTo.setHours(23, 59, 59, 999);
  }

  const posts = fetchedPosts
    .filter((post) => {
      const postedAt = new Date(post.postedAt);
      if (dateFrom && postedAt < dateFrom) return false;
      if (dateTo && postedAt > dateTo) return false;
      return true;
    })
    .slice(0, input.postsToFetchPerCompetitor * Math.max(input.competitors.length, 1));

  if (posts.length === 0) return [];
  return scorePosts(posts);
}

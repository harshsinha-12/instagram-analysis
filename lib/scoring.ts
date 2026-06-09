import { RawPost, ScoredPost } from "@/lib/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SCORE_WEIGHTS = {
  relativeViews: 0.35,
  relativeEngagement: 0.25,
  velocity: 0.2,
  commentRate: 0.12,
  likeRate: 0.08
};

function safeDivide(value: number, divisor: number) {
  if (!divisor || !Number.isFinite(divisor)) return 0;
  return value / divisor;
}

function daysSince(date: string) {
  const age = Math.ceil((Date.now() - new Date(date).getTime()) / MS_PER_DAY);
  return Math.max(age, 1);
}

function minMax(value: number, values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 1;
  return (value - min) / (max - min);
}

export function scorePosts(posts: RawPost[]): ScoredPost[] {
  const accountAverages = new Map<string, { avgViews: number; avgEngagement: number }>();

  for (const account of Array.from(new Set(posts.map((post) => post.account)))) {
    const accountPosts = posts.filter((post) => post.account === account);
    const avgViews = safeDivide(
      accountPosts.reduce((sum, post) => sum + post.views, 0),
      accountPosts.length
    );
    const avgEngagement = safeDivide(
      accountPosts.reduce((sum, post) => sum + safeDivide(post.likes + post.commentsCount, post.views), 0),
      accountPosts.length
    );
    accountAverages.set(account, { avgViews, avgEngagement });
  }

  const base = posts.map((post) => {
    const averages = accountAverages.get(post.account) ?? { avgViews: post.views, avgEngagement: 0 };
    const likeRate = safeDivide(post.likes, post.views || post.followers);
    const commentRate = safeDivide(post.commentsCount, post.views || post.followers);
    const engagementRate = safeDivide(post.likes + post.commentsCount, post.views || post.followers);
    const velocityPerDay = safeDivide(post.views, daysSince(post.postedAt));

    return {
      ...post,
      viewRate: safeDivide(post.views, post.followers),
      likeRate,
      commentRate,
      engagementRate,
      velocityPerDay,
      relativeViews: safeDivide(post.views, averages.avgViews),
      relativeEngagement: safeDivide(engagementRate, averages.avgEngagement),
      velocityNormalized: 0,
      commentRateNormalized: 0,
      likeRateNormalized: 0,
      finalScore: 0,
      isTopPost: false,
      isOutlier: false
    };
  });

  const velocityValues = base.map((post) => post.velocityPerDay);
  const commentRateValues = base.map((post) => post.commentRate);
  const likeRateValues = base.map((post) => post.likeRate);
  const relativeViewsValues = base.map((post) => post.relativeViews);
  const relativeEngagementValues = base.map((post) => post.relativeEngagement);

  const scored = base.map((post) => {
    const relativeViewsNormalized = minMax(post.relativeViews, relativeViewsValues);
    const relativeEngagementNormalized = minMax(post.relativeEngagement, relativeEngagementValues);
    const velocityNormalized = minMax(post.velocityPerDay, velocityValues);
    const commentRateNormalized = minMax(post.commentRate, commentRateValues);
    const likeRateNormalized = minMax(post.likeRate, likeRateValues);

    const finalScore =
      SCORE_WEIGHTS.relativeViews * relativeViewsNormalized +
      SCORE_WEIGHTS.relativeEngagement * relativeEngagementNormalized +
      SCORE_WEIGHTS.velocity * velocityNormalized +
      SCORE_WEIGHTS.commentRate * commentRateNormalized +
      SCORE_WEIGHTS.likeRate * likeRateNormalized;

    return {
      ...post,
      velocityNormalized,
      commentRateNormalized,
      likeRateNormalized,
      finalScore
    };
  });

  const topPostIds = new Set(scored.toSorted((a, b) => b.finalScore - a.finalScore).slice(0, 20).map((post) => post.id));
  const outlierIds = new Set(scored.toSorted((a, b) => b.relativeViews - a.relativeViews).slice(0, 5).map((post) => post.id));

  return scored
    .map((post) => ({
      ...post,
      isTopPost: topPostIds.has(post.id),
      isOutlier: outlierIds.has(post.id)
    }))
    .toSorted((a, b) => b.finalScore - a.finalScore);
}

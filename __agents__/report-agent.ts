import { runCreativeAnalysisAgent } from "@/__agents__/creative-analysis-agent";
import { runDataCollectionAgent } from "@/__agents__/data-collection-agent";
import { runMediaProcessingAgent } from "@/__agents__/media-processing-agent";
import { runPatternAggregationAgent } from "@/__agents__/pattern-aggregation-agent";
import { runRecommendationAgent } from "@/__agents__/recommendation-agent";
import { runScoringAgent } from "@/__agents__/scoring-agent";
import { logger } from "@/__tools__/logger";
import { createRunId, saveRunJson } from "@/lib/run-storage";
import { AnalysisInput, ProgressCallback, Report, ScoredPost } from "@/lib/types";

function buildEmptyReport(input: AnalysisInput, id: string, runId: string, rawDataPath?: string, fetchErrors: Array<{ handle: string; error: string }> = []): Report {
  return {
    id,
    runId,
    input,
    createdAt: new Date().toISOString(),
    rawDataPath,
    fetchErrors,
    competitors: [],
    topPosts: [],
    patterns: [],
    contentPillars: [],
    reelIdeas: [],
    actionPlan: ["No public posts were available from the configured Instagram handles for this run."]
  };
}

function selectPostsForAnalysis(scored: ScoredPost[], input: AnalysisInput) {
  const selected = new Map<string, ScoredPost>();
  const accountCount = new Set(scored.map((post) => post.account)).size;
  const targetCount = Math.min(scored.length, Math.max(input.reelsToAnalyze, accountCount));

  for (const account of Array.from(new Set(scored.map((post) => post.account)))) {
    const bestAccountPost = scored.find((post) => post.account === account);
    if (bestAccountPost) {
      selected.set(bestAccountPost.id, bestAccountPost);
    }
  }

  for (const post of scored) {
    if (selected.size >= targetCount) break;
    selected.set(post.id, post);
  }

  return Array.from(selected.values()).toSorted((a, b) => b.finalScore - a.finalScore);
}

function buildCompetitorSummaries(posts: ScoredPost[]) {
  const accounts = Array.from(new Set(posts.map((post) => post.account)));

  return accounts.map((account) => {
    const accountPosts = posts.filter((post) => post.account === account);
    return {
      handle: account,
      name: accountPosts[0]?.accountName ?? account,
      followers: accountPosts[0]?.followers ?? 0,
      postsAnalyzed: accountPosts.length,
      avgViews: Math.round(accountPosts.reduce((sum, post) => sum + post.views, 0) / accountPosts.length),
      avgEngagement: accountPosts.reduce((sum, post) => sum + post.engagementRate, 0) / accountPosts.length,
      bestScore: Math.max(...accountPosts.map((post) => post.finalScore)),
      postingFrequency: `${Math.max(2, Math.round(accountPosts.length * 1.8))} posts/week`
    };
  });
}

export async function runReportAgent(input: AnalysisInput, id = "demo-report", onProgress?: ProgressCallback): Promise<Report> {
  const runId = createRunId();
  logger.info({ id, runId, competitors: input.competitors }, "starting report agent");
  await onProgress?.("Fetching competitor posts from Instagram...");
  const collection = await runDataCollectionAgent(input);
  const rawDataPath = (await saveRunJson({ id, runId, input, createdAt: new Date().toISOString(), ...collection }, 1, runId, "raw")).filePath;

  const fetchedPosts = collection.results.flatMap((result) => result.posts);
  await onProgress?.(`Scoring ${fetchedPosts.length} fetched posts...`);
  const scored = runScoringAgent(input, fetchedPosts);
  logger.info({ id, runId, fetchedPosts: fetchedPosts.length, scoredPosts: scored.length }, "scored posts");
  const scoredDataPath = (await saveRunJson({ id, runId, scored }, 2, runId, "scored")).filePath;

  if (scored.length === 0) {
    logger.warn({ id, runId, fetchErrors: collection.fetchErrors }, "empty report generated");
    return buildEmptyReport(input, id, runId, rawDataPath, collection.fetchErrors);
  }

  const selectedForAnalysis = selectPostsForAnalysis(scored, input);
  await onProgress?.(`Processing media for ${selectedForAnalysis.length} selected posts...`);
  const mediaByPostId = await runMediaProcessingAgent(selectedForAnalysis, runId);
  const mediaDataPath = (await saveRunJson({ id, runId, media: Array.from(mediaByPostId.values()) }, 3, runId, "media")).filePath;

  await onProgress?.("Running OpenAI creative analysis...");
  const analyzed = await runCreativeAnalysisAgent(input, selectedForAnalysis, mediaByPostId);
  const aiDataPath = (await saveRunJson({ id, runId, analyzed }, 4, runId, "ai")).filePath;

  const competitors = buildCompetitorSummaries(scored);

  await onProgress?.("Aggregating winning creative patterns...");
  const { patterns, contentPillars } = await runPatternAggregationAgent(input, analyzed);
  await onProgress?.("Generating brand-specific recommendations...");
  const { reelIdeas, actionPlan } = await runRecommendationAgent(input, patterns, analyzed);

  const report: Report = {
    id,
    runId,
    input,
    createdAt: new Date().toISOString(),
    rawDataPath,
    scoredDataPath,
    mediaDataPath,
    aiDataPath,
    fetchErrors: collection.fetchErrors,
    competitors,
    topPosts: analyzed.slice(0, input.topPostsToSelect),
    patterns,
    contentPillars,
    reelIdeas,
    actionPlan
  };

  report.reportDataPath = (await saveRunJson(report, 5, runId, "report")).filePath;
  logger.info({ id, runId, reportDataPath: report.reportDataPath }, "report agent complete");
  await onProgress?.("Report artifacts saved.");
  return report;
}

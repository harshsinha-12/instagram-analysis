import { runCreativeAnalysisAgent } from "@/__agents__/agent__creative__analysis";
import { runDataCollectionAgent } from "@/__agents__/agent__data__collection";
import { runMediaProcessingAgent } from "@/__agents__/agent__media__processing";
import { runPatternAggregationAgent } from "@/__agents__/agent__pattern__aggregation";
import { runRecommendationAgent } from "@/__agents__/agent__recommendation";
import { runScoringAgent } from "@/__agents__/agent__scoring";
import { logger } from "@/__tools__/tools__logger";
import { createRunId, saveRunJson } from "@/lib/run-storage";
import { AnalyzedPost, AnalysisInput, MediaArtifacts, ProgressCallback, Report, ScoredPost } from "@/declaration";
import { AGENT_MASTER } from "@/config";
import { DataCollectionResult } from "./agent__data__collection";

type AgentRunContext = {
  id: string;
  runId: string;
  input: AnalysisInput;
  onProgress?: ProgressCallback;
};

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

async function collectPosts(context: AgentRunContext) {
  const { id, input, onProgress, runId } = context;
  await onProgress?.("Fetching competitor posts from Instagram...");
  const collection = await runDataCollectionAgent(input);
  const rawDataPath = (
    await saveRunJson({ id, runId, input, createdAt: new Date().toISOString(), ...collection }, 1, runId, "raw")
  ).filePath;
  const fetchedPosts = collection.results.flatMap((result) => result.posts);

  return { collection, fetchedPosts, rawDataPath };
}

async function scoreFetchedPosts(context: AgentRunContext, fetchedPosts: DataCollectionResult["results"][number]["posts"]) {
  const { id, input, onProgress, runId } = context;
  await onProgress?.(`Scoring ${fetchedPosts.length} fetched posts...`);

  const scored = runScoringAgent(input, fetchedPosts);
  const scoredDataPath = (await saveRunJson({ id, runId, scored }, 2, runId, "scored")).filePath;

  logger.info({ id, runId, fetchedPosts: fetchedPosts.length, scoredPosts: scored.length }, "scored posts");
  return { scored, scoredDataPath };
}

async function processSelectedMedia(context: AgentRunContext, scored: ScoredPost[]) {
  const { input, onProgress, runId } = context;
  const selectedForAnalysis = selectPostsForAnalysis(scored, input);
  await onProgress?.(`Processing media for ${selectedForAnalysis.length} selected posts...`);
  const mediaByPostId = await runMediaProcessingAgent(selectedForAnalysis, runId);

  const mediaDataPath = (
    await saveRunJson({ id: context.id, runId, media: Array.from(mediaByPostId.values()) }, 3, runId, "media")
  ).filePath;

  return { selectedForAnalysis, mediaByPostId, mediaDataPath };
}

async function analyzeSelectedPosts(
  context: AgentRunContext,
  selectedForAnalysis: ScoredPost[],
  mediaByPostId: Map<string, MediaArtifacts>
) {
  const { id, input, onProgress, runId } = context;

  await onProgress?.("Running OpenAI creative analysis...");
  const analyzed = await runCreativeAnalysisAgent(input, selectedForAnalysis, mediaByPostId);
  const aiDataPath = (await saveRunJson({ id, runId, analyzed }, 4, runId, "ai")).filePath;

  return { analyzed, aiDataPath };
}

async function buildRecommendationBlocks(context: AgentRunContext, analyzed: AnalyzedPost[]) {
  const { input, onProgress } = context;
  await onProgress?.("Aggregating winning creative patterns...");
  const { patterns, contentPillars } = await runPatternAggregationAgent(input, analyzed);

  await onProgress?.("Generating brand-specific recommendations...");
  const { reelIdeas, actionPlan } = await runRecommendationAgent(input, patterns, analyzed);

  return { patterns, contentPillars, reelIdeas, actionPlan };
}

export async function runMasterAgent(input: AnalysisInput, id = "demo-report", onProgress?: ProgressCallback): Promise<Report> {
  const runId = createRunId();
  const context: AgentRunContext = { id, runId, input, onProgress };

  logger.info({ id, runId, competitors: input.competitors, agent: AGENT_MASTER }, "starting master agent");

  const { collection, fetchedPosts, rawDataPath } = await collectPosts(context);
  const { scored, scoredDataPath } = await scoreFetchedPosts(context, fetchedPosts);

  if (scored.length === 0) {
    logger.warn({ id, runId, fetchErrors: collection.fetchErrors }, "empty report generated");
    return buildEmptyReport(input, id, runId, rawDataPath, collection.fetchErrors);
  }

  const { selectedForAnalysis, mediaByPostId, mediaDataPath } = await processSelectedMedia(context, scored);
  const { analyzed, aiDataPath } = await analyzeSelectedPosts(context, selectedForAnalysis, mediaByPostId);
  const { patterns, contentPillars, reelIdeas, actionPlan } = await buildRecommendationBlocks(context, analyzed);
  const competitors = buildCompetitorSummaries(scored);

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
  logger.info({ id, runId, reportDataPath: report.reportDataPath, agent: AGENT_MASTER }, "master agent complete");
  await onProgress?.("Report artifacts saved.");
  return report;
}

export const runReportAgent = runMasterAgent;

import { buildPatternAggregationPrompt, patternAggregationSchema } from "@/__prompts__/prompt__pattern__aggregation";
import { logger } from "@/__tools__/tools__logger";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/tools__openai";
import { AGENT_PATTERN_AGGREGATION, SCHEMA_PATTERN_AGGREGATION } from "@/config";
import { AnalyzedPost, AnalysisInput, Pattern } from "@/declaration";
import { getErrorMessage } from "@/fetcherUtils";

function buildFallbackPatternAggregation(posts: AnalyzedPost[]) {
  return {
    patterns: [
      {
        name: "Clear opening premise",
        count: posts.length,
        psychology: "Top posts usually make the viewer understand the topic or tension quickly.",
        replicability: "High" as const
      },
      {
        name: "High relative performance",
        count: posts.filter((post) => post.relativeViews > 1).length,
        psychology: "Posts beating account baseline are stronger creative signals than raw reach alone.",
        replicability: "High" as const
      }
    ],
    contentPillars: ["Highest-scoring competitor themes", "Audience questions and objections", "Reusable hooks and formats"]
  };
}

export async function runPatternAggregationAgent(input: AnalysisInput, posts: AnalyzedPost[]) {
  const model = getOpenAIModels().reasoning;
  try {
    logger.info({ agent: AGENT_PATTERN_AGGREGATION, posts: posts.length, model }, "aggregating patterns with openai");
    return await requestStructuredJson<{ patterns: Pattern[]; contentPillars: string[] }>({
      model,
      prompt: buildPatternAggregationPrompt(input, posts),
      schemaName: SCHEMA_PATTERN_AGGREGATION,
      schema: patternAggregationSchema
    });
  } catch (error) {
    logger.warn({ agent: AGENT_PATTERN_AGGREGATION, error: getErrorMessage(error) }, "pattern aggregation fallback used");
    return buildFallbackPatternAggregation(posts);
  }
}

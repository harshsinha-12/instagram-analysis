import { buildPatternAggregationPrompt, patternAggregationSchema } from "@/__prompts__/pattern-aggregation";
import { logger } from "@/__tools__/logger";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/openai-client";
import { AnalyzedPost, AnalysisInput, Pattern } from "@/lib/types";

export async function runPatternAggregationAgent(input: AnalysisInput, posts: AnalyzedPost[]) {
  try {
    logger.info({ posts: posts.length, model: getOpenAIModels().reasoning }, "aggregating patterns with openai");
    return await requestStructuredJson<{ patterns: Pattern[]; contentPillars: string[] }>({
      model: getOpenAIModels().reasoning,
      prompt: buildPatternAggregationPrompt(input, posts),
      schemaName: "pattern_aggregation",
      schema: patternAggregationSchema
    });
  } catch (error) {
    logger.warn({ error: error instanceof Error ? error.message : error }, "pattern aggregation fallback used");
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
}

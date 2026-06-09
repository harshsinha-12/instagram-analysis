import { buildRecommendationsPrompt, recommendationsSchema } from "@/__prompts__/recommendations";
import { logger } from "@/__tools__/logger";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/openai-client";
import { AnalyzedPost, AnalysisInput, Pattern, ReelIdea } from "@/lib/types";

export async function runRecommendationAgent(input: AnalysisInput, patterns: Pattern[], posts: AnalyzedPost[]) {
  try {
    logger.info({ patterns: patterns.length, posts: posts.length, model: getOpenAIModels().reasoning }, "generating recommendations with openai");
    return await requestStructuredJson<{ reelIdeas: ReelIdea[]; actionPlan: string[] }>({
      model: getOpenAIModels().reasoning,
      prompt: buildRecommendationsPrompt(input, patterns, posts),
      schemaName: "recommendations",
      schema: recommendationsSchema
    });
  } catch (error) {
    logger.warn({ error: error instanceof Error ? error.message : error }, "recommendation fallback used");
    return {
      reelIdeas: [
        {
          title: `Adapt ${posts[0]?.analysis.topic ?? "the top competitor theme"}`,
          inspiredBy: posts[0]?.accountName ?? "competitor winner",
          patternReused: "Strong opening premise + account-relative overperformance",
          format: "Short-form video or carousel, depending on source post",
          duration: "20-35 seconds for reels",
          hook: `A ${input.brand}-specific angle on the top-performing competitor topic.`,
          structure: "Hook -> context -> key insight -> brand-safe takeaway -> engagement CTA",
          cta: "Save or share if this is useful.",
          brandNote: `Use ${input.brand}'s ${input.brandTone || "brand"} tone and avoid ${input.brandAvoid || "copying competitor execution"}.`
        }
      ],
      actionPlan: [
        "Fetch competitor posts, score them mathematically, and only analyze selected winners.",
        "Use AI analysis to explain creative patterns, not to decide ranking.",
        "Translate each winning pattern into brand-specific examples and visuals.",
        "Track relative views, comment rate, and recurring audience themes before scaling."
      ]
    };
  }
}

import { AnalyzedPost, AnalysisInput, Pattern } from "@/lib/types";

export const recommendationsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reelIdeas", "actionPlan"],
  properties: {
    reelIdeas: {
      type: "array",
      minItems: 3,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "inspiredBy", "patternReused", "format", "duration", "hook", "structure", "cta", "brandNote"],
        properties: {
          title: { type: "string" },
          inspiredBy: { type: "string" },
          patternReused: { type: "string" },
          format: { type: "string" },
          duration: { type: "string" },
          hook: { type: "string" },
          structure: { type: "string" },
          cta: { type: "string" },
          brandNote: { type: "string" }
        }
      }
    },
    actionPlan: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: { type: "string" }
    }
  }
};

export function buildRecommendationsPrompt(input: AnalysisInput, patterns: Pattern[], posts: AnalyzedPost[]) {
  const postSummaries = posts.map((post) => ({
    account: post.account,
    topic: post.analysis.topic,
    hook: post.analysis.hookText,
    suggestedHook: post.analysis.suggestedHook,
    score: post.finalScore
  }));

  return `Generate brand-specific Instagram content recommendations for ${input.brand}.

Do not copy competitor creative. Reuse only the strategic pattern, then change examples, wording, visuals, tone, and CTA.

Brand context:
- Handle: ${input.brandHandle}
- Industry: ${input.industry || "Not specified"}
- Audience: ${input.targetAudience || "Not specified"}
- Tone: ${input.brandTone || "Not specified"}
- Avoid: ${input.brandAvoid || "Not specified"}

Winning patterns:
${JSON.stringify(patterns, null, 2)}

Top post summaries:
${JSON.stringify(postSummaries, null, 2)}

Return only structured JSON with reel ideas and action plan.`;
}

import { AnalyzedPost, AnalysisInput } from "@/lib/types";

export const patternAggregationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["patterns", "contentPillars"],
  properties: {
    patterns: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "count", "psychology", "replicability"],
        properties: {
          name: { type: "string" },
          count: { type: "integer" },
          psychology: { type: "string" },
          replicability: { type: "string", enum: ["High", "Medium", "Low"] }
        }
      }
    },
    contentPillars: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    }
  }
};

export function buildPatternAggregationPrompt(input: AnalysisInput, posts: AnalyzedPost[]) {
  const summaries = posts.map((post) => ({
    account: post.account,
    shortcode: post.shortcode,
    score: post.finalScore,
    relativeViews: post.relativeViews,
    topic: post.analysis.topic,
    hookType: post.analysis.hookType,
    whyWorked: post.analysis.whyWorked,
    brandAdaptation: post.analysis.brandAdaptation
  }));

  return `Analyze these top-performing competitor Instagram posts for ${input.brand}.

Find recurring creative patterns that explain why posts overperformed and can be adapted without copying.

Brand context:
- Industry: ${input.industry || "Not specified"}
- Audience: ${input.targetAudience || "Not specified"}
- Tone: ${input.brandTone || "Not specified"}
- Avoid: ${input.brandAvoid || "Not specified"}

Post analyses:
${JSON.stringify(summaries, null, 2)}

Return only structured JSON.`;
}

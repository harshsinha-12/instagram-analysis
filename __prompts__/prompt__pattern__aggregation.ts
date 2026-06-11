import { AnalyzedPost, AnalysisInput } from "@/declaration";

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

  return `Analyze these top-performing Instagram reference posts for ${input.brand}.

This analyzer must work for any account, creator, brand, niche, or industry. Do not assume a specific category unless the provided context proves it.
Find recurring creative patterns that explain why posts overperformed and can be adapted without copying the source accounts.
Focus on underlying mechanisms, not surface topics. A good pattern should describe a repeatable reason the content worked, such as audience identity, tension, novelty, proof, utility, humor, transformation, status, urgency, cultural timing, production format, or distribution fit.

Target account context:
- Account or brand name: ${input.brand}
- Handle: ${input.brandHandle}
- Category or industry: ${input.industry || "Not specified"}
- Audience: ${input.targetAudience || "Not specified"}
- Desired tone: ${input.brandTone || "Not specified"}
- Must avoid: ${input.brandAvoid || "Not specified"}

Post analyses:
${JSON.stringify(summaries, null, 2)}

Return only structured JSON matching the schema.

Pattern requirements:
- patterns: Provide 3-7 distinct patterns. Each pattern name should be specific enough to guide content creation, not generic labels like "educational content" or "engaging hook".
- count: Count how many analyzed posts support the pattern.
- psychology: Explain the audience behavior or decision trigger behind the pattern. Mention what makes people stop, watch, save, share, comment, trust, or click.
- replicability: Use High when the target account can apply it repeatedly without heavy production or rare timing, Medium when it needs a specific asset/context, and Low when it depends on a hard-to-repeat event, person, meme, controversy, or production setup.
- contentPillars: Give 3-5 broad but practical pillars the target account can use across future posts. Each pillar should be account-agnostic enough for any niche but tailored to the provided context.`;
}

import { AnalyzedPost, AnalysisInput, Pattern } from "@/declaration";

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
    score: post.finalScore,
    format: post.analysis.format,
    whyWorked: post.analysis.whyWorked,
    brandAdaptation: post.analysis.brandAdaptation
  }));

  return `Generate Instagram content recommendations for ${input.brand}.

This analyzer must work for any target account, creator, brand, niche, or industry. Do not assume a specific category unless the provided context proves it.
Use the reference posts as creative evidence, not as templates to copy. Reuse only the strategic pattern, then change the premise, examples, wording, visual execution, pacing, tone, and CTA for the target account.

Target account context:
- Account or brand name: ${input.brand}
- Handle: ${input.brandHandle}
- Category or industry: ${input.industry || "Not specified"}
- Audience: ${input.targetAudience || "Not specified"}
- Desired tone: ${input.brandTone || "Not specified"}
- Must avoid: ${input.brandAvoid || "Not specified"}

Winning patterns:
${JSON.stringify(patterns, null, 2)}

Top post summaries:
${JSON.stringify(postSummaries, null, 2)}

Return only structured JSON matching the schema.

Recommendation requirements:
- reelIdeas: Create 3-10 ideas that are specific enough to produce. They can be reels, posts, carousels, shorts, explainers, creator videos, demos, skits, founder POVs, community prompts, or caption-led formats depending on what fits the target account.
- title: Make the idea immediately understandable.
- inspiredBy: Name the source account or pattern, but do not copy the source concept.
- patternReused: Explain the strategic pattern being reused in one concise phrase.
- format: Specify execution style, shot type, asset needs, and whether it is creator-led, product-led, text-led, meme-led, proof-led, or story-led.
- duration: Give a practical range. For static posts/carousels, describe slide count or reading time instead of forcing a video duration.
- hook: Write a usable opening line or on-screen text tailored to the target account.
- structure: Give a concrete sequence such as Hook -> proof -> contrast -> example -> CTA. Include enough detail for production.
- cta: Make it natural for the target account. Avoid generic "follow for more" unless it is the best fit.
- brandNote: Include account-fit guidance: tone, visual style, risk to avoid, and how to make it feel native to ${input.brand}.
- actionPlan: Give 4-8 prioritized next steps. Include what to test, what metric to watch, what creative variable to isolate, and how to turn winners into repeatable series.`;
}

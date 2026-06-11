import { AnalysisInput, FrameDescription, ScoredPost, Transcript } from "@/declaration";

export const postAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "topic",
    "contentPillar",
    "format",
    "funnelStage",
    "hookType",
    "hookText",
    "hookStrength",
    "opening",
    "middle",
    "ending",
    "pacing",
    "visualStyle",
    "primaryDriver",
    "secondaryDriver",
    "shareability",
    "commentPattern",
    "whyWorked",
    "brandAdaptation",
    "suggestedTitle",
    "suggestedHook",
    "transcriptAvailable",
    "framesAnalyzed"
  ],
  properties: {
    topic: { type: "string" },
    contentPillar: { type: "string" },
    format: { type: "string" },
    funnelStage: { type: "string" },
    hookType: { type: "string" },
    hookText: { type: "string" },
    hookStrength: { type: "integer", minimum: 1, maximum: 10 },
    opening: { type: "string" },
    middle: { type: "string" },
    ending: { type: "string" },
    pacing: { type: "string" },
    visualStyle: { type: "string" },
    primaryDriver: { type: "string" },
    secondaryDriver: { type: "string" },
    shareability: { type: "string" },
    commentPattern: { type: "string" },
    whyWorked: { type: "string" },
    brandAdaptation: { type: "string" },
    suggestedTitle: { type: "string" },
    suggestedHook: { type: "string" },
    transcriptAvailable: { type: "boolean" },
    framesAnalyzed: { type: "integer", minimum: 0 }
  }
};

export function buildPostAnalysisPrompt(input: AnalysisInput, post: ScoredPost, transcript?: Transcript, frames: FrameDescription[] = []) {
  return `You are a senior social media strategist analyzing Instagram content for ${input.brand}.

This analyzer must work for any account, creator, brand, niche, or industry. Do not assume the account is fintech, ecommerce, SaaS, education, entertainment, personal branding, or consumer goods unless the provided context proves it.
Treat the analyzed post as an external reference post. It may be from a competitor, creator, publisher, community page, founder account, meme page, or adjacent inspiration account.
Your job is to explain the creative mechanics behind performance and translate them into useful strategic insight for the target account without copying the source post.

Target account context:
- Account or brand name: ${input.brand}
- Handle: ${input.brandHandle}
- Category or industry: ${input.industry || "Not specified"}
- Audience: ${input.targetAudience || "Not specified"}
- Desired tone: ${input.brandTone || "Not specified"}
- Must avoid: ${input.brandAvoid || "Not specified"}

Reference post:
- Account: ${post.account}
- Posted at: ${post.postedAt}
- Content type: ${post.contentType}
- Views: ${post.views}
- Likes: ${post.likes}
- Comments: ${post.commentsCount}
- Final score: ${post.finalScore.toFixed(4)}
- Relative views: ${post.relativeViews.toFixed(2)}x
- Engagement rate: ${(post.engagementRate * 100).toFixed(2)}%

Caption:
${post.caption || "No caption available"}

Transcript:
${transcript?.text || "Transcript unavailable"}

Frame descriptions:
${frames.length ? frames.map((frame) => `- ${frame.timestampSeconds}s: ${frame.description}`).join("\n") : "Frame descriptions unavailable"}

Top comments:
${post.comments.length ? post.comments.map((comment) => `- ${comment}`).join("\n") : "Comment text unavailable; only comment count is available."}

Analysis requirements:
- Return only structured JSON matching the schema.
- Make every field insight-dense. Avoid generic phrases like "engaging content", "good visuals", or "clear message" unless you explain the mechanism.
- topic: identify the real audience problem, desire, belief, event, product moment, cultural reference, or curiosity gap being addressed.
- contentPillar: name a reusable strategic pillar that could work for many accounts in this niche, not just a literal topic label.
- format: describe the actual execution format, for example talking-head explainer, meme, screen recording, transformation, founder POV, product demo, street interview, carousel-style video, skit, testimonial, behind-the-scenes, or news reaction.
- funnelStage: infer awareness, consideration, conversion, retention, trust-building, community, or recruitment only from evidence.
- hookType and hookText: explain the hook pattern and include the closest hook text from caption, transcript, or visible frame text. If unavailable, infer conservatively from the opening evidence.
- hookStrength: score 1-10 based on specificity, tension, speed to context, novelty, audience relevance, and clarity.
- opening, middle, ending: describe the narrative arc and information sequence, not just "starts/middle/ends".
- pacing: mention cuts, density, tempo, repetition, text overlays, scene changes, or whether the idea is caption-led.
- visualStyle: include composition, color, setting, production level, creator presence, text treatment, screenshots, UI, props, and brand/product visibility when available.
- primaryDriver and secondaryDriver: identify why it likely overperformed using metrics plus creative evidence, such as novelty, utility, controversy, identity, social proof, timeliness, aspiration, humor, relatability, proof, authority, or participation.
- shareability: explain why someone would save, share, comment, or send it to a peer.
- commentPattern: summarize likely audience reaction from comments when available. If comments are unavailable, state that and infer only from comment count and post topic.
- whyWorked: write a compact but detailed synthesis with evidence from caption, transcript, frames, comments, and metrics. Include what is known and what is uncertain.
- brandAdaptation: explain how ${input.brand} could adapt the underlying pattern for its own account, audience, tone, and constraints without copying the source idea.
- suggestedTitle and suggestedHook: make them usable for the target account, not a clone of the source post.
- If transcript, frames, or comments are unavailable, be explicit and avoid pretending they were analyzed.`;
}

import { AnalysisInput, FrameDescription, ScoredPost, Transcript } from "@/lib/types";

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
  return `You are a senior social media strategist analyzing competitor Instagram content for ${input.brand}.

Brand context:
- Brand handle: ${input.brandHandle}
- Industry: ${input.industry || "Not specified"}
- Target audience: ${input.targetAudience || "Not specified"}
- Brand tone: ${input.brandTone || "Not specified"}
- Brand must avoid: ${input.brandAvoid || "Not specified"}

Competitor post:
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

Return only structured JSON. Explain why the post likely worked using the available evidence. If transcript, frames, or comments are unavailable, be explicit and avoid pretending they were analyzed.`;
}

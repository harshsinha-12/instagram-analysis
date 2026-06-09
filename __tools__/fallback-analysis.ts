import { PostAnalysis, ScoredPost } from "@/lib/types";

function firstSentence(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Untitled post";
  return cleaned.split(/[.!?\n]/)[0]?.trim() || cleaned;
}

export function fallbackPostAnalysis(post: ScoredPost, brand: string, reason?: string): PostAnalysis {
  const topic = firstSentence(post.caption).slice(0, 80);
  const hookText = firstSentence(post.caption);

  return {
    topic,
    contentPillar: "competitor content theme",
    format: post.contentType === "reel" ? "short-form video" : "feed post",
    funnelStage: "awareness",
    hookType: hookText.length < 45 ? "short direct hook" : "caption-led hook",
    hookText,
    hookStrength: Math.max(5, Math.min(10, Math.round(5 + post.finalScore * 5))),
    opening: "The post opens with the first visible/caption premise.",
    middle: "The body likely develops the premise through examples, proof, contrast, or explanation.",
    ending: "The post closes with a takeaway, discussion prompt, or engagement action.",
    pacing: "Exact pacing requires video/frame analysis.",
    visualStyle: "Exact visual style requires frame analysis.",
    primaryDriver: post.relativeViews > 1.2 ? "relative overperformance versus account baseline" : "steady audience engagement",
    secondaryDriver: "caption clarity, topic relevance, and public interaction signals",
    shareability: post.commentRateNormalized > 0.7 ? "high, based on comment rate" : "medium, based on public engagement signals",
    commentPattern: post.comments.length ? post.comments.slice(0, 3).join(" | ") : "comment text unavailable",
    whyWorked: `Fallback analysis used${reason ? ` because ${reason}` : ""}. The post is explained from public metrics and caption text only.`,
    brandAdaptation: `${brand} can adapt the strategic angle while changing examples, wording, visuals, and tone.`,
    suggestedTitle: `${brand}: ${topic}`,
    suggestedHook: `A ${brand}-specific version of: ${hookText}`,
    transcriptAvailable: false,
    framesAnalyzed: 0
  };
}

export function fallbackPatterns() {
  return [
    {
      name: "Clear opening premise",
      count: 1,
      psychology: "Top posts usually make the viewer understand the topic quickly, which reduces scroll-away risk.",
      replicability: "High" as const
    }
  ];
}

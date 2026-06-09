import { PostAnalysis, ScoredPost } from "@/lib/types";

function firstSentence(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Untitled post";
  return cleaned.split(/[.!?\n]/)[0]?.trim() || cleaned;
}

function describeTopic(post: ScoredPost) {
  return firstSentence(post.caption).slice(0, 80);
}

function describeHook(post: ScoredPost) {
  const hookText = firstSentence(post.caption);
  if (hookText.length < 45) return "short direct hook";
  if (/[?]/.test(post.caption)) return "question-led hook";
  if (/\d/.test(hookText)) return "number-led hook";
  return "caption-led hook";
}

function describeShareability(post: ScoredPost) {
  if (post.commentRateNormalized > 0.7) return "high, based on unusually strong comment rate";
  if (post.likeRateNormalized > 0.7) return "medium-high, based on strong like rate";
  return "medium, based on public engagement signals";
}

export function analyzePost(post: ScoredPost, brand: string): PostAnalysis {
  const topic = describeTopic(post);
  const hookType = describeHook(post);
  const hookText = firstSentence(post.caption);
  const isOutlier = post.relativeViews > 1.2 || post.finalScore > 0.7;

  return {
    topic,
    contentPillar: "competitor content theme",
    format: post.contentType === "reel" ? "short-form video" : "feed post",
    funnelStage: "awareness",
    hookType,
    hookText,
    hookStrength: Math.max(5, Math.min(10, Math.round(5 + post.finalScore * 5))),
    opening: "The post opens with the first caption or visible creative premise.",
    middle: "The body likely develops the premise through examples, proof, contrast, or explanation.",
    ending: "The post closes with an engagement action, informational takeaway, or implicit discussion prompt.",
    pacing: post.contentType === "reel" ? "requires video/transcript analysis for exact pacing" : "static or carousel pacing depends on slide sequence",
    visualStyle: "requires media frame analysis for exact visual style",
    primaryDriver: isOutlier ? "relative overperformance versus the account baseline" : "steady audience engagement",
    secondaryDriver: "caption clarity, topic relevance, and public interaction signals",
    shareability: describeShareability(post),
    commentPattern:
      post.comments.length > 0
        ? `Sample comments suggest audience reactions such as: ${post.comments.slice(0, 3).join(" | ")}`
        : "comment text was unavailable in the mock data",
    whyWorked:
      "This placeholder analysis explains the post using only public metrics and caption text. A production AI adapter should replace it with transcript, frame, and comment-level reasoning.",
    brandAdaptation: `${brand} can adapt the observed content pattern by keeping the strategic angle, changing the execution, examples, tone, and visual treatment.`,
    suggestedTitle: `${brand}: ${topic}`,
    suggestedHook: `A ${brand}-specific version of: ${hookText}`,
    transcriptAvailable: false,
    framesAnalyzed: 0
  };
}

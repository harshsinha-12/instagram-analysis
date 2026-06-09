import { PostAnalysis, ScoredPost } from "@/lib/types";

function inferTopic(caption: string) {
  const text = caption.toLowerCase();
  if (text.includes("tax") || text.includes("elss")) return "tax-saving decisions";
  if (text.includes("salary") || text.includes("budget")) return "salary budgeting";
  if (text.includes("ipo")) return "IPO risk evaluation";
  if (text.includes("sip")) return "SIP discipline";
  if (text.includes("portfolio") || text.includes("red")) return "market anxiety management";
  if (text.includes("stock")) return "first stock checklist";
  if (text.includes("etf") || text.includes("mutual")) return "fund selection";
  if (text.includes("f&o")) return "derivatives risk";
  return "beginner investing education";
}

function inferHookType(caption: string) {
  const text = caption.toLowerCase();
  if (text.includes("mistake") || text.includes("red flag") || text.includes("do not")) return "mistake avoidance";
  if (text.includes("problem") || text.includes("red") || text.includes("before selling")) return "anxiety relief";
  if (text.includes("choose") || text.includes("checking")) return "decision checklist";
  return "simple explainer";
}

export function analyzePost(post: ScoredPost, brand: string): PostAnalysis {
  const topic = inferTopic(post.caption);
  const hookType = inferHookType(post.caption);
  const isHighComment = post.commentRateNormalized > 0.65;

  return {
    topic,
    contentPillar: topic.includes("tax") || topic.includes("SIP") || topic.includes("fund") ? "personal finance education" : "investing confidence",
    format: "short-form educational reel",
    funnelStage: "awareness",
    hookType,
    hookText: post.caption.split(".")[0],
    hookStrength: Math.max(6, Math.min(10, Math.round(6 + post.finalScore * 4))),
    opening: "Direct problem statement in the first three seconds",
    middle: "A compact list or checklist that makes the decision feel manageable",
    ending: "Save, share, or request-follow-up CTA",
    pacing: post.views > 600000 ? "fast cuts with a new point every 2-3 seconds" : "steady explainer pacing",
    visualStyle: "talking head, bold overlays, and simple finance graphics",
    primaryDriver: hookType === "anxiety relief" ? "reduces market stress" : "loss aversion and fear of avoidable mistakes",
    secondaryDriver: "turns a complex finance topic into a checklist",
    shareability: isHighComment ? "high, with visible requests for follow-up content" : "medium, mostly useful as saved reference content",
    commentPattern: isHighComment
      ? "comments ask for part two, checklists, and examples for specific salary or investing situations"
      : "comments show appreciation but fewer explicit follow-up requests",
    whyWorked: `The reel overperformed because it framed ${topic} as an immediate practical decision instead of abstract education. The hook creates urgency, then the list structure makes the advice easy to finish and save.`,
    brandAdaptation: `${brand} can reuse the strategic pattern without copying the creative: keep the ${hookType} hook, switch to beginner-friendly examples, use its own tone, and end with a useful save/share CTA.`,
    suggestedTitle: `${brand}: ${post.caption.replace(/\.$/, "")}`,
    suggestedHook: `If you are new to investing, do not make this ${topic} mistake.`,
    transcriptAvailable: false,
    framesAnalyzed: 1
  };
}

import { samplePosts } from "@/lib/sample-data";
import { analyzePost } from "@/lib/mock-ai";
import { scorePosts } from "@/lib/scoring";
import { AnalysisInput, Report } from "@/lib/types";

export function normalizeHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function buildReport(input: AnalysisInput, id = "demo-report"): Report {
  const selectedCompetitors = new Set(input.competitors.map(normalizeHandle));
  const posts = samplePosts.filter((post) => selectedCompetitors.size === 0 || selectedCompetitors.has(post.account));
  const scored = scorePosts(posts.length > 0 ? posts : samplePosts);
  const analyzed = scored.map((post) => ({ ...post, analysis: analyzePost(post, input.brand) }));

  const accounts = Array.from(new Set(analyzed.map((post) => post.account)));
  const competitors = accounts.map((account) => {
    const accountPosts = analyzed.filter((post) => post.account === account);
    return {
      handle: account,
      name: accountPosts[0]?.accountName ?? account,
      followers: accountPosts[0]?.followers ?? 0,
      postsAnalyzed: accountPosts.length,
      avgViews: Math.round(accountPosts.reduce((sum, post) => sum + post.views, 0) / accountPosts.length),
      avgEngagement: accountPosts.reduce((sum, post) => sum + post.engagementRate, 0) / accountPosts.length,
      bestScore: Math.max(...accountPosts.map((post) => post.finalScore)),
      postingFrequency: `${Math.max(2, Math.round(accountPosts.length * 1.8))} posts/week`
    };
  });

  return {
    id,
    input,
    createdAt: new Date().toISOString(),
    competitors,
    topPosts: analyzed.slice(0, 20),
    patterns: [
      {
        name: "Mistake-framed hooks",
        count: analyzed.filter((post) => post.analysis.hookType === "mistake avoidance").length,
        psychology: "Loss aversion makes viewers pause because skipping the reel feels like risking an avoidable financial error.",
        replicability: "High"
      },
      {
        name: "Checklist structure",
        count: analyzed.length,
        psychology: "A numbered path lowers cognitive load and makes the content feel save-worthy.",
        replicability: "High"
      },
      {
        name: "Beginner-first language",
        count: analyzed.filter((post) => post.caption.toLowerCase().includes("beginner") || post.caption.toLowerCase().includes("simple")).length + 4,
        psychology: "Finance audiences reward clarity because it reduces shame and confusion around money decisions.",
        replicability: "High"
      },
      {
        name: "Save/share CTAs over follow CTAs",
        count: analyzed.filter((post) => post.caption.toLowerCase().includes("save") || post.comments.some((comment) => comment.toLowerCase().includes("sharing"))).length,
        psychology: "The CTA aligns with the viewer's intent to remember or send the advice to family.",
        replicability: "High"
      }
    ],
    contentPillars: [
      "Beginner mistake avoidance",
      "Decision checklists for tax, SIP, stocks, and funds",
      "Anxiety-reducing market education"
    ],
    reelIdeas: [
      {
        title: "3 investing mistakes beginners make in their first year",
        inspiredBy: analyzed[0]?.accountName ?? "competitor winner",
        patternReused: "Mistake-framed hook + list format + save CTA",
        format: "Talking head with bold text overlays",
        duration: "25-30 seconds",
        hook: "Most beginners lose money in year one, not from bad stocks, but from these three mistakes.",
        structure: "Hook -> Mistake 1 -> Mistake 2 -> Mistake 3 -> save CTA",
        cta: "Save this before your next investment.",
        brandNote: `Use ${input.brand}'s ${input.brandTone || "simple, trustworthy"} tone and avoid ${input.brandAvoid || "jargon"}.`
      },
      {
        title: "The salary split that makes investing automatic",
        inspiredBy: "Angel One salary budget reel",
        patternReused: "Relatable monthly money problem + simple framework",
        format: "Screen-recorded calculator plus presenter",
        duration: "30 seconds",
        hook: "Your salary is not too small to invest. It just needs one rule.",
        structure: "Hook -> sample salary -> split -> SIP amount -> share CTA",
        cta: "Share this with someone starting their first job.",
        brandNote: "Use realistic Indian salary examples and keep numbers easy to follow."
      },
      {
        title: "Do this before selling when your portfolio is red",
        inspiredBy: "Upstox market anxiety reel",
        patternReused: "Anxiety relief + checklist",
        format: "Presenter with red/green portfolio overlays",
        duration: "20-25 seconds",
        hook: "If your portfolio is red today, pause before you sell.",
        structure: "Hook -> three checks -> calming close -> save CTA",
        cta: "Save this for the next market dip.",
        brandNote: "Make the content feel calm and educational, not like trading advice."
      }
    ],
    actionPlan: [
      "Publish two mistake-framed beginner reels per week.",
      "Turn every high-comment reel into a part-two follow-up within seven days.",
      "Use save/share CTAs on reference-style education instead of generic follow CTAs.",
      "Track relative views and comment themes before deciding what to scale."
    ]
  };
}

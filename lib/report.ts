import { analyzePost } from "@/lib/mock-ai";
import { saveRunJson } from "@/lib/run-storage";
import { scorePosts } from "@/lib/scoring";
import { AnalysisInput, Report } from "@/lib/types";
import { ScraperResult } from "@/scrapers/base-scraper.interface";
import { InstagramWebScraper } from "@/scrapers/instagram-web-scraper";

export function normalizeHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function buildEmptyReport(input: AnalysisInput, id: string, rawDataPath?: string, fetchErrors: Array<{ handle: string; error: string }> = []): Report {
  return {
    id,
    input,
    createdAt: new Date().toISOString(),
    rawDataPath,
    fetchErrors,
    competitors: [],
    topPosts: [],
    patterns: [],
    contentPillars: [],
    reelIdeas: [],
    actionPlan: ["No public posts were available from the configured Instagram handles for this run."]
  };
}

async function fetchCompetitorPosts(input: AnalysisInput) {
  const scraper = new InstagramWebScraper();
  const handles = input.competitors.length > 0 ? input.competitors : [];
  const results: ScraperResult[] = [];
  const fetchErrors: Array<{ handle: string; error: string }> = [];

  await Promise.all(
    handles.map(async (handle) => {
      try {
        const result = await scraper.fetchPosts({
          handle,
          lookbackDays: input.lookbackDays,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          contentType: input.contentType,
          limit: input.postsToFetchPerCompetitor,
          downloadVideos: true
        });
        results.push(result);
      } catch (error) {
        fetchErrors.push({
          handle,
          error: error instanceof Error ? error.message : "Unknown scraper error"
        });
      }
    })
  );

  return { results, fetchErrors };
}

export async function buildReport(input: AnalysisInput, id = "demo-report"): Promise<Report> {
  const dateFrom = input.dateFrom ? new Date(input.dateFrom) : null;
  const dateTo = input.dateTo ? new Date(input.dateTo) : null;
  if (dateTo) {
    dateTo.setHours(23, 59, 59, 999);
  }
  const { results, fetchErrors } = await fetchCompetitorPosts(input);
  const fetchedPosts = results.flatMap((result) => result.posts);
  const rawDataPath = await saveRunJson({
    id,
    input,
    fetchedAt: new Date().toISOString(),
    results,
    fetchErrors
  });

  const posts = fetchedPosts
    .filter((post) => {
      const postedAt = new Date(post.postedAt);
      if (dateFrom && postedAt < dateFrom) return false;
      if (dateTo && postedAt > dateTo) return false;
      return true;
    })
    .slice(0, input.postsToFetchPerCompetitor * Math.max(input.competitors.length, 1));

  if (posts.length === 0) {
    return buildEmptyReport(input, id, rawDataPath, fetchErrors);
  }

  const scored = scorePosts(posts);
  const selectedForAnalysis = scored.slice(0, input.reelsToAnalyze);
  const analyzed = selectedForAnalysis.map((post) => ({ ...post, analysis: analyzePost(post, input.brand) }));

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
    rawDataPath,
    fetchErrors,
    competitors,
    topPosts: analyzed.slice(0, input.topPostsToSelect),
    patterns: [
      {
        name: "Clear opening premise",
        count: analyzed.length,
        psychology: "Top posts usually make the viewer understand the topic or tension quickly, which reduces scroll-away risk.",
        replicability: "High"
      },
      {
        name: "High relative performance",
        count: analyzed.length,
        psychology: "Posts that beat their account baseline are stronger creative signals than posts with only large raw numbers.",
        replicability: "High"
      },
      {
        name: "Comment-generating topics",
        count: analyzed.filter((post) => post.commentRateNormalized > 0.6).length,
        psychology: "A higher comment rate suggests the post created questions, opinions, objections, or social proof.",
        replicability: "Medium"
      },
      {
        name: "Reusable creative angle",
        count: analyzed.filter((post) => post.finalScore > 0.5).length,
        psychology: "A strong topic, hook, or format can be adapted by changing the brand context rather than copying the post.",
        replicability: "High"
      }
    ],
    contentPillars: [
      "Highest-scoring competitor themes",
      "Audience questions and objections",
      "Reusable hooks and formats"
    ],
    reelIdeas: [
      {
        title: `Adapt ${analyzed[0]?.analysis.topic ?? "the top competitor theme"}`,
        inspiredBy: analyzed[0]?.accountName ?? "competitor winner",
        patternReused: "Strong opening premise + account-relative overperformance",
        format: "Short-form video or carousel, depending on the source post",
        duration: "20-35 seconds for reels",
        hook: `A ${input.brand}-specific angle on the top-performing competitor topic.`,
        structure: "Hook -> context -> key insight -> brand-safe takeaway -> engagement CTA",
        cta: "Save or share if this is useful.",
        brandNote: `Use ${input.brand}'s ${input.brandTone || "brand"} tone and avoid ${input.brandAvoid || "copying competitor execution"}.`
      },
      {
        title: "Turn a high-comment post into a follow-up",
        inspiredBy: analyzed.find((post) => post.commentRateNormalized > 0.6)?.accountName ?? "highest comment-rate competitor post",
        patternReused: "Audience reaction -> follow-up content",
        format: "Direct response reel or carousel",
        duration: "20-40 seconds",
        hook: "People had one big question about this topic.",
        structure: "Question/comment signal -> answer -> example -> next-step CTA",
        cta: "Comment with the next question to cover.",
        brandNote: "Use real audience language from comments once live comment fetching is connected."
      },
      {
        title: "Reframe the best competitor hook for your brand",
        inspiredBy: analyzed[1]?.accountName ?? "second-best competitor post",
        patternReused: "Hook format reuse without creative copying",
        format: "Native brand creative",
        duration: "15-30 seconds",
        hook: analyzed[1]?.analysis.suggestedHook ?? "A brand-specific version of a proven competitor hook.",
        structure: "Hook -> brand example -> proof or explanation -> CTA",
        cta: "Save this for later.",
        brandNote: "Keep the strategic premise but change examples, words, visuals, and tone."
      }
    ],
    actionPlan: [
      "Fetch competitor posts, score them mathematically, and only analyze the selected winners.",
      "Use AI analysis to explain creative patterns, not to decide the ranking.",
      "Translate each winning pattern into brand-specific examples and visuals.",
      "Track relative views, comment rate, and recurring audience themes before deciding what to scale."
    ]
  };
}

import { AnalysisInput } from "@/lib/types";

export const analysisConfig = {
  brand: {
    name: "Groww",
    instagramHandle: "@groww_official",
    industry: "Fintech / Investing",
    targetAudience: "Young Indian retail investors aged 22-35",
    tone: "Simple, trustworthy, beginner-friendly",
    avoid: "Jargon, aggressive CTAs, complexity"
  },
  competitors: [
    { name: "Zerodha", instagramHandle: "@zerodhaonline" },
    { name: "Angel One", instagramHandle: "@angelone" },
    { name: "Upstox", instagramHandle: "@upstox.pro" }
  ],
  collection: {
    contentType: "reels" as const,
    lookbackDays: 30,
    dateFrom: "",
    dateTo: "",
    postsToFetchPerCompetitor: 20
  },
  selection: {
    topPostsToSelect: 20,
    outlierPostsToSelect: 5,
    reelsToAnalyze: 5
  }
};

export const defaultInput: AnalysisInput = {
  brand: analysisConfig.brand.name,
  brandHandle: analysisConfig.brand.instagramHandle,
  competitors: analysisConfig.competitors.map((competitor) => competitor.instagramHandle),
  platform: "Instagram",
  contentType: analysisConfig.collection.contentType,
  lookbackDays: analysisConfig.collection.lookbackDays,
  dateFrom: analysisConfig.collection.dateFrom,
  dateTo: analysisConfig.collection.dateTo,
  postsToFetchPerCompetitor: analysisConfig.collection.postsToFetchPerCompetitor,
  topPostsToSelect: analysisConfig.selection.topPostsToSelect,
  reelsToAnalyze: analysisConfig.selection.reelsToAnalyze,
  industry: analysisConfig.brand.industry,
  targetAudience: analysisConfig.brand.targetAudience,
  brandTone: analysisConfig.brand.tone,
  brandAvoid: analysisConfig.brand.avoid
};

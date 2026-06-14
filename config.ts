import { z } from "zod";
import type { AnalysisInput } from "@/declaration";

export const PLATFORM_INSTAGRAM = "Instagram";

export const AGENT_MASTER = "master";
export const AGENT_DATA_COLLECTION = "data_collection";
export const AGENT_SCORING = "scoring";
export const AGENT_MEDIA_PROCESSING = "media_processing";
export const AGENT_CREATIVE_ANALYSIS = "creative_analysis";
export const AGENT_PATTERN_AGGREGATION = "pattern_aggregation";
export const AGENT_RECOMMENDATION = "recommendation";

export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";

export const DEFAULT_OPENAI_REASONING_MODEL = "gpt-5.5";
export const DEFAULT_OPENAI_FAST_MODEL = "gpt-5.4-mini";
export const DEFAULT_OPENAI_TRANSCRIBE_MODEL = "gpt-4o-transcribe";

export const INSTAGRAM_WEB_PROFILE_INFO_URL =
  "https://www.instagram.com/api/v1/users/web_profile_info/";
export const INSTAGRAM_DEFAULT_OUTPUT_DIR = "downloads/instagram";
export const RUN_OUTPUT_DIR = "downloads/instagram/runs";
export const MEDIA_OUTPUT_DIR = "downloads/instagram/media";
export const SAMPLE_REPORT_PATH = "sample-data/sample-report.json";

export const DEFAULT_FRAME_INTERVAL_SECONDS = 5;
export const MAX_FRAMES_TO_EXTRACT = 20;
export const MAX_FRAMES_TO_DESCRIBE = 20;
export const REPORT_PROGRESS_TOTAL_STEPS = 9;

export const SCHEMA_POST_ANALYSIS = "post_analysis";
export const SCHEMA_PATTERN_AGGREGATION = "pattern_aggregation";
export const SCHEMA_RECOMMENDATIONS = "recommendations";

export const TRANSCRIPTION_PROMPT = [
  "Transcribe this Instagram audio accurately for social media creative analysis.",
  "Preserve the spoken words as closely as possible.",
  "Keep brand names, creator names, product names, account handles, slang, Hinglish, Hindi, regional phrases, numbers, prices, percentages, and acronyms when audible.",
  "Do not summarize, rewrite, translate, add analysis, or clean up the message into marketing copy.",
  "If words are unclear, transcribe the closest audible phrase without inventing missing context."
].join(" ");

export const ANALYSIS_CONFIG = {
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

export const DEFAULT_ANALYSIS_INPUT: AnalysisInput = {
  analysisMode: "competitor",
  brand: ANALYSIS_CONFIG.brand.name,
  brandHandle: ANALYSIS_CONFIG.brand.instagramHandle,
  competitors: ANALYSIS_CONFIG.competitors.map((competitor) => competitor.instagramHandle),
  platform: PLATFORM_INSTAGRAM,
  contentType: ANALYSIS_CONFIG.collection.contentType,
  lookbackDays: ANALYSIS_CONFIG.collection.lookbackDays,
  dateFrom: ANALYSIS_CONFIG.collection.dateFrom,
  dateTo: ANALYSIS_CONFIG.collection.dateTo,
  postsToFetchPerCompetitor: ANALYSIS_CONFIG.collection.postsToFetchPerCompetitor,
  topPostsToSelect: ANALYSIS_CONFIG.selection.topPostsToSelect,
  reelsToAnalyze: ANALYSIS_CONFIG.selection.reelsToAnalyze,
  industry: ANALYSIS_CONFIG.brand.industry,
  targetAudience: ANALYSIS_CONFIG.brand.targetAudience,
  brandTone: ANALYSIS_CONFIG.brand.tone,
  brandAvoid: ANALYSIS_CONFIG.brand.avoid
};

export const ANALYZE_INPUT_SCHEMA = z.object({
  analysisMode: z.enum(["competitor", "single", "chat"]).default("competitor"),
  brand: z.string().min(1),
  brandHandle: z.string().min(1),
  competitors: z.array(z.string().min(1)).min(1),
  platform: z.literal(PLATFORM_INSTAGRAM).default(PLATFORM_INSTAGRAM),
  contentType: z.enum(["reels", "posts", "both"]).default(ANALYSIS_CONFIG.collection.contentType),
  lookbackDays: z.coerce.number().int().positive().default(ANALYSIS_CONFIG.collection.lookbackDays),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  postsToFetchPerCompetitor: z.coerce
    .number()
    .int()
    .positive()
    .default(ANALYSIS_CONFIG.collection.postsToFetchPerCompetitor),
  topPostsToSelect: z.coerce
    .number()
    .int()
    .positive()
    .default(ANALYSIS_CONFIG.selection.topPostsToSelect),
  reelsToAnalyze: z.coerce.number().int().positive().default(ANALYSIS_CONFIG.selection.reelsToAnalyze),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandTone: z.string().optional(),
  brandAvoid: z.string().optional(),
  chatQuery: z.string().optional(),
  chatPlan: z.array(z.string()).optional()
});

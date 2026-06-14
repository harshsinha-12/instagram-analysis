import { getOpenAIModels, requestStructuredJson } from "@/__tools__/tools__openai";
import { logger } from "@/__tools__/tools__logger";
import { DEFAULT_ANALYSIS_INPUT } from "@/config";
import type { AnalysisInput } from "@/declaration";
import { getErrorMessage } from "@/fetcherUtils";
import { normalizeHandle } from "@/lib/report";

type ChatAnalysisPlan = {
  brand: string;
  brandHandle: string;
  handles: string[];
  contentType: "reels" | "posts" | "both";
  lookbackDays: number;
  postsToFetchPerCompetitor: number;
  topPostsToSelect: number;
  reelsToAnalyze: number;
  industry?: string;
  targetAudience?: string;
  brandTone?: string;
  brandAvoid?: string;
  reasoningFocus: string[];
};

const chatPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    brand: { type: "string" },
    brandHandle: { type: "string" },
    handles: { type: "array", items: { type: "string" } },
    contentType: { type: "string", enum: ["reels", "posts", "both"] },
    lookbackDays: { type: "number" },
    postsToFetchPerCompetitor: { type: "number" },
    topPostsToSelect: { type: "number" },
    reelsToAnalyze: { type: "number" },
    industry: { type: "string" },
    targetAudience: { type: "string" },
    brandTone: { type: "string" },
    brandAvoid: { type: "string" },
    reasoningFocus: { type: "array", items: { type: "string" } }
  },
  required: [
    "brand",
    "brandHandle",
    "handles",
    "contentType",
    "lookbackDays",
    "postsToFetchPerCompetitor",
    "topPostsToSelect",
    "reelsToAnalyze",
    "industry",
    "targetAudience",
    "brandTone",
    "brandAvoid",
    "reasoningFocus"
  ]
};

function extractTaggedHandles(query: string) {
  return Array.from(new Set((query.match(/@[A-Za-z0-9._]+/g) ?? []).map(normalizeHandle)));
}

function inferContentType(query: string): AnalysisInput["contentType"] {
  const lower = query.toLowerCase();
  if (lower.includes("post") && lower.includes("reel")) return "both";
  if (lower.includes("post")) return "posts";
  return "reels";
}

function inferLookbackDays(query: string) {
  const lower = query.toLowerCase();
  const daysMatch = lower.match(/(\d+)\s*(day|days)/);
  if (daysMatch) return Number(daysMatch[1]);
  const monthMatch = lower.match(/(\d+)\s*(month|months)/);
  if (monthMatch) return Number(monthMatch[1]) * 30;
  return DEFAULT_ANALYSIS_INPUT.lookbackDays;
}

function fallbackPlan(query: string): ChatAnalysisPlan {
  const handles = extractTaggedHandles(query);
  return {
    brand: DEFAULT_ANALYSIS_INPUT.brand,
    brandHandle: DEFAULT_ANALYSIS_INPUT.brandHandle,
    handles,
    contentType: inferContentType(query),
    lookbackDays: inferLookbackDays(query),
    postsToFetchPerCompetitor: DEFAULT_ANALYSIS_INPUT.postsToFetchPerCompetitor,
    topPostsToSelect: Math.min(DEFAULT_ANALYSIS_INPUT.topPostsToSelect, DEFAULT_ANALYSIS_INPUT.postsToFetchPerCompetitor),
    reelsToAnalyze: DEFAULT_ANALYSIS_INPUT.reelsToAnalyze,
    industry: DEFAULT_ANALYSIS_INPUT.industry,
    targetAudience: DEFAULT_ANALYSIS_INPUT.targetAudience,
    brandTone: DEFAULT_ANALYSIS_INPUT.brandTone,
    brandAvoid: DEFAULT_ANALYSIS_INPUT.brandAvoid,
    reasoningFocus: [query.replace(/@[A-Za-z0-9._]+/g, "").trim() || "Analyze creative reasons behind high-performing content."]
  };
}

function sanitizePlan(query: string, plan: ChatAnalysisPlan): ChatAnalysisPlan {
  const taggedHandles = extractTaggedHandles(query);
  const handles = (plan.handles.length > 0 ? plan.handles : taggedHandles).map(normalizeHandle).filter(Boolean);
  return {
    ...plan,
    handles,
    lookbackDays: Math.max(1, Math.round(plan.lookbackDays || DEFAULT_ANALYSIS_INPUT.lookbackDays)),
    postsToFetchPerCompetitor: Math.max(1, Math.round(plan.postsToFetchPerCompetitor || DEFAULT_ANALYSIS_INPUT.postsToFetchPerCompetitor)),
    topPostsToSelect: Math.max(1, Math.round(plan.topPostsToSelect || DEFAULT_ANALYSIS_INPUT.topPostsToSelect)),
    reelsToAnalyze: Math.max(1, Math.round(plan.reelsToAnalyze || DEFAULT_ANALYSIS_INPUT.reelsToAnalyze)),
    reasoningFocus: plan.reasoningFocus.filter(Boolean)
  };
}

export function buildChatProgressPlan(input: AnalysisInput) {
  return [
    "Read the natural-language request and detected tagged accounts.",
    `Prepared ${input.competitors.length === 1 ? "single-account" : "multi-account"} scrape for ${input.competitors.join(", ")}.`,
    `Using ${input.contentType} from the last ${input.lookbackDays} days unless date filters override it.`,
    "Will scrape public metrics, score each reel/post, and export a CSV of all scraped rows.",
    "Will run deeper creative reasoning on the selected top posts and generate the report."
  ];
}

export async function runChatbotPlanningAgent(query: string): Promise<AnalysisInput> {
  const fallback = fallbackPlan(query);
  let plan = fallback;

  try {
    plan = await requestStructuredJson<ChatAnalysisPlan>({
      model: getOpenAIModels().fast,
      schemaName: "instagram_chat_analysis_plan",
      schema: chatPlanSchema,
      prompt: [
        "Convert this Instagram analysis request into a strict execution plan.",
        "Use only accounts explicitly tagged with @ in the request as handles.",
        "If the user gives qualitative conditions, preserve them in reasoningFocus.",
        "Keep defaults when the request omits a setting.",
        "",
        `Defaults: ${JSON.stringify(fallback)}`,
        `Request: ${query}`
      ].join("\n")
    });
  } catch (error) {
    logger.warn({ error: getErrorMessage(error), agent: "chatbot_planning" }, "chatbot planner fallback used");
  }

  const sanitized = sanitizePlan(query, plan);
  if (sanitized.handles.length === 0) {
    throw new Error("Tag at least one Instagram account with @handle in the chat request.");
  }

  const topPostsToSelect = Math.min(sanitized.topPostsToSelect, sanitized.postsToFetchPerCompetitor * sanitized.handles.length);
  const reelsToAnalyze = Math.min(sanitized.reelsToAnalyze, topPostsToSelect);

  const input: AnalysisInput = {
    analysisMode: "chat",
    brand: sanitized.brand || fallback.brand,
    brandHandle: normalizeHandle(sanitized.brandHandle || fallback.brandHandle),
    competitors: sanitized.handles,
    platform: "Instagram",
    contentType: sanitized.contentType || fallback.contentType,
    lookbackDays: sanitized.lookbackDays,
    postsToFetchPerCompetitor: sanitized.postsToFetchPerCompetitor,
    topPostsToSelect,
    reelsToAnalyze,
    industry: sanitized.industry,
    targetAudience: sanitized.targetAudience,
    brandTone: sanitized.brandTone,
    brandAvoid: [sanitized.brandAvoid, `User focus: ${sanitized.reasoningFocus.join("; ")}`].filter(Boolean).join(" | "),
    chatQuery: query
  };

  input.chatPlan = buildChatProgressPlan(input);
  return input;
}

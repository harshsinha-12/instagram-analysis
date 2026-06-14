import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AnalyzedPost, Report, ScoredPost } from "@/declaration";
import { RUN_OUTPUT_DIR, SAMPLE_REPORT_PATH } from "@/config";

const RUN_OUTPUT_PATH = path.join(process.cwd(), RUN_OUTPUT_DIR);
const SAMPLE_REPORT_FILE_PATH = path.join(process.cwd(), SAMPLE_REPORT_PATH);

export function createRunId() {
  return randomUUID();
}

export async function saveRunJson(payload: unknown, step = 1, runId: string = createRunId(), label?: string) {
  await mkdir(RUN_OUTPUT_PATH, { recursive: true });

  const suffix = label ? `-${label}` : "";
  const filePath = path.join(RUN_OUTPUT_PATH, `${runId}-run-${step}${suffix}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 2));

  return { runId, filePath };
}

function csvCell(value: unknown) {
  if (value === undefined || value === null) return "";
  const normalized = Array.isArray(value) ? value.join(" | ") : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

export async function saveRunCsv(params: {
  runId: string;
  id: string;
  scored: ScoredPost[];
  analyzed?: AnalyzedPost[];
}) {
  await mkdir(RUN_OUTPUT_PATH, { recursive: true });

  const analyzedById = new Map((params.analyzed ?? []).map((post) => [post.id, post]));
  const headers = [
    "run_id",
    "report_id",
    "account",
    "account_name",
    "followers",
    "shortcode",
    "url",
    "posted_at",
    "content_type",
    "caption",
    "views",
    "likes",
    "comments_count",
    "view_rate",
    "like_rate",
    "comment_rate",
    "engagement_rate",
    "velocity_per_day",
    "relative_views",
    "relative_engagement",
    "final_score",
    "is_top_post",
    "is_outlier",
    "selection_reason",
    "analysis_topic",
    "content_pillar",
    "hook_type",
    "hook_text",
    "primary_driver",
    "secondary_driver",
    "why_worked",
    "brand_adaptation",
    "transcript_available",
    "frames_analyzed"
  ];

  const rows = params.scored.map((post) => {
    const analyzed = analyzedById.get(post.id);
    const selectionReason = [
      post.isTopPost ? "Top scored post" : "",
      post.isOutlier ? "Outlier against account baseline" : "",
      analyzed ? "Selected for media and creative analysis" : "Scored only"
    ].filter(Boolean).join("; ");

    return [
      params.runId,
      params.id,
      post.account,
      post.accountName,
      post.followers,
      post.shortcode,
      post.url,
      post.postedAt,
      post.contentType,
      post.caption,
      post.views,
      post.likes,
      post.commentsCount,
      post.viewRate,
      post.likeRate,
      post.commentRate,
      post.engagementRate,
      post.velocityPerDay,
      post.relativeViews,
      post.relativeEngagement,
      post.finalScore,
      post.isTopPost,
      post.isOutlier,
      selectionReason,
      analyzed?.analysis.topic,
      analyzed?.analysis.contentPillar,
      analyzed?.analysis.hookType,
      analyzed?.analysis.hookText,
      analyzed?.analysis.primaryDriver,
      analyzed?.analysis.secondaryDriver,
      analyzed?.analysis.whyWorked,
      analyzed?.analysis.brandAdaptation,
      analyzed?.analysis.transcriptAvailable,
      analyzed?.analysis.framesAnalyzed
    ].map(csvCell).join(",");
  });

  const filePath = path.join(RUN_OUTPUT_PATH, `${params.runId}-run-6-reels.csv`);
  await writeFile(filePath, [headers.map(csvCell).join(","), ...rows].join("\n"));
  return { runId: params.runId, filePath };
}

export async function loadSampleReportJson(id = "demo-report") {
  try {
    const report = JSON.parse(await readFile(SAMPLE_REPORT_FILE_PATH, "utf8")) as Report;
    return { ...report, id };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

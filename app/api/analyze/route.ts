import { NextResponse } from "next/server";
import { z } from "zod";
import { createJob } from "@/lib/jobs";
import { analysisConfig } from "@/lib/analysis-config";
import { AnalysisInput } from "@/lib/types";

const AnalyzeSchema = z.object({
  brand: z.string().min(1),
  brandHandle: z.string().min(1),
  competitors: z.array(z.string().min(1)).min(1),
  platform: z.literal("Instagram").default("Instagram"),
  contentType: z.enum(["reels", "posts", "both"]).default(analysisConfig.collection.contentType),
  lookbackDays: z.coerce.number().int().positive().default(analysisConfig.collection.lookbackDays),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  postsToFetchPerCompetitor: z.coerce.number().int().positive().default(analysisConfig.collection.postsToFetchPerCompetitor),
  topPostsToSelect: z.coerce.number().int().positive().default(analysisConfig.selection.topPostsToSelect),
  reelsToAnalyze: z.coerce.number().int().positive().default(analysisConfig.selection.reelsToAnalyze),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandTone: z.string().optional(),
  brandAvoid: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = AnalyzeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analysis input", details: parsed.error.flatten() }, { status: 400 });
  }

  const input: AnalysisInput = parsed.data;
  const jobId = createJob(input);

  return NextResponse.json({ jobId });
}

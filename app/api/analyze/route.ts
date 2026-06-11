import { NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";
import { ANALYZE_INPUT_SCHEMA } from "@/config";
import { AnalysisInput } from "@/declaration";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ANALYZE_INPUT_SCHEMA.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analysis input", details: parsed.error.flatten() }, { status: 400 });
  }

  const input: AnalysisInput = parsed.data;
  const jobId = createJob(input);

  return NextResponse.json({ jobId });
}

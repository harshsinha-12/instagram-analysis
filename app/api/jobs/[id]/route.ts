import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    reportId: job.report?.id
  });
}

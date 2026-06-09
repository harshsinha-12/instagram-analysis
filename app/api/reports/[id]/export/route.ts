import { NextResponse } from "next/server";
import { getReport } from "@/lib/jobs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${params.id}-instagram-analysis.json"`
    }
  });
}

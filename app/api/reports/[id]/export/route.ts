import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { getReport } from "@/lib/jobs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  const format = new URL(request.url).searchParams.get("format");

  if (format === "csv") {
    if (!report.csvDataPath) {
      return NextResponse.json({ error: "CSV export is not available for this report." }, { status: 404 });
    }

    const csv = await readFile(report.csvDataPath, "utf8");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${params.id}-instagram-reels.csv"`
      }
    });
  }

  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${params.id}-instagram-analysis.json"`
    }
  });
}

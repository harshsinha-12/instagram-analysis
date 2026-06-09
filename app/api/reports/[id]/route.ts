import { NextResponse } from "next/server";
import { getReport } from "@/lib/jobs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(await getReport(params.id));
}

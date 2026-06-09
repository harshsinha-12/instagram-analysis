import { NextResponse } from "next/server";
import { getReport } from "@/lib/jobs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const handle = decodeURIComponent(params.id);
  const report = await getReport("demo-report");
  const posts = report.topPosts.filter((post) => post.account === handle || post.account.replace("@", "") === handle);

  return NextResponse.json({ posts });
}

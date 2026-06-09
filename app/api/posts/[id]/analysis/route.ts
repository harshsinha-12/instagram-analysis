import { NextResponse } from "next/server";
import { getReport } from "@/lib/jobs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const report = await getReport("demo-report");
  const post = report.topPosts.find((item) => item.id === params.id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post.analysis);
}

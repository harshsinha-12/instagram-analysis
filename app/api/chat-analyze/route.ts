import { NextResponse } from "next/server";
import { runChatbotPlanningAgent } from "@/__agents__/agent__chatbot";
import { createJob } from "@/lib/jobs";

export async function POST(request: Request) {
  const body = await request.json();
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "Chat query is required." }, { status: 400 });
  }

  try {
    const input = await runChatbotPlanningAgent(query);
    const jobId = createJob(input);
    return NextResponse.json({ jobId, input, steps: input.chatPlan ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not plan chat analysis." },
      { status: 400 }
    );
  }
}

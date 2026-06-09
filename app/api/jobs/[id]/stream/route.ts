import { completeJob, getJob, getProgressEvents } from "@/lib/jobs";

const encoder = new TextEncoder();

function sse(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id);

  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const events = getProgressEvents(job.input, params.id);

      for (const event of events) {
        if (event.status === "completed") {
          completeJob(params.id);
        }
        controller.enqueue(sse(event));
        await wait(650);
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}

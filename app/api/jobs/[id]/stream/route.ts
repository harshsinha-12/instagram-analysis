import { completeJob, getJob } from "@/lib/jobs";
import { REPORT_PROGRESS_TOTAL_STEPS } from "@/config";
import { wait } from "@/fetcherUtils";

const encoder = new TextEncoder();

function sse(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id);

  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let step = 1;
      const totalSteps = REPORT_PROGRESS_TOTAL_STEPS + (job.input.chatPlan?.length ?? 0);

      controller.enqueue(sse({ status: "running", message: `Job created for ${job.input.brand}`, step, totalSteps }));

      for (const message of job.input.chatPlan ?? []) {
        step += 1;
        controller.enqueue(sse({ status: "running", message, step: Math.min(step, totalSteps - 1), totalSteps }));
        await wait(100);
      }

      try {
        const completed = await completeJob(params.id, async (message) => {
          step += 1;
          controller.enqueue(sse({ status: "running", message, step: Math.min(step, totalSteps - 1), totalSteps }));
          await wait(100);
        });

        controller.enqueue(
          sse({
            status: "completed",
            message: "Done. Report ready.",
            step: totalSteps,
            totalSteps,
            reportId: completed?.report?.id ?? params.id
          })
        );
      } catch (error) {
        controller.enqueue(
          sse({
            status: "failed",
            message: error instanceof Error ? error.message : "Analysis failed.",
            step,
            totalSteps
          })
        );
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { ProgressEvent } from "@/declaration";

export default function JobProgressPage({ params }: { params: { id: string } }) {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    const source = new EventSource(`/api/jobs/${params.id}/stream`);

    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as ProgressEvent;
      setEvents((current) => [...current, event]);
      if (event.reportId) {
        setReportId(event.reportId);
        source.close();
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [params.id]);

  const latest = events.at(-1);
  const progress = latest ? Math.round((latest.step / latest.totalSteps) * 100) : 0;

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">Live analysis</p>
        <h1 className="mt-2 text-3xl font-semibold">Job {params.id}</h1>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ece8df]">
          <div className="h-full bg-leaf transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">{progress}% complete</p>

        <div className="mt-6 grid gap-3">
          {events.map((event, index) => {
            const isComplete = event.status === "completed";
            return (
              <div key={`${event.step}-${index}`} className="flex items-start gap-3 rounded-md border border-line bg-paper p-3">
                {isComplete ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                ) : index === events.length - 1 ? (
                  <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-coral" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                )}
                <div>
                  <p className="font-medium">{event.message}</p>
                  <p className="text-sm text-muted">
                    Step {event.step} of {event.totalSteps}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {reportId ? (
          <Link className="mt-6 inline-flex rounded-md bg-leaf px-4 py-2 font-semibold text-white" href={`/reports/${reportId}`}>
            Open report
          </Link>
        ) : null}
      </section>
    </main>
  );
}

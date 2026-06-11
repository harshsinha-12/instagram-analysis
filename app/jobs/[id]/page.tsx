"use client";

import { useEffect, useState } from "react";
import { ProgressEvent } from "@/declaration";
import { ProgressTimeline } from "@/components/ProgressTimeline";

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

  return (
    <main className="min-h-screen bg-paper">
      <ProgressTimeline jobId={params.id} events={events} reportId={reportId} />
    </main>
  );
}

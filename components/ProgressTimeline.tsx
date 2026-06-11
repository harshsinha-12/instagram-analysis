"use client";

import { CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressEvent } from "@/declaration";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressTimelineProps {
  jobId: string;
  events: ProgressEvent[];
  reportId: string;
}

export function ProgressTimeline({ jobId, events, reportId }: ProgressTimelineProps) {
  const latest = events.at(-1);
  const progress = latest ? Math.round((latest.step / latest.totalSteps) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl pt-24 sm:pt-32">
      <div className="mb-8 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-coral">Live Analysis</h2>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Analyzing competitor content</h1>
        <p className="mt-4 text-sm text-muted font-mono">Job ID: {jobId}</p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-8 shadow-soft">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Overall Progress</span>
            <span className="text-sm font-medium text-leaf">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
            <motion.div
              className="h-full bg-leaf"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-line" />
          <div className="space-y-6">
            <AnimatePresence>
              {events.map((event, index) => {
                const isComplete = event.status === "completed" || index < events.length - 1;
                const isActive = index === events.length - 1 && event.status !== "completed";
                const isError = event.status === "failed";

                return (
                  <motion.div
                    key={`${event.step}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex items-start gap-4 pl-8"
                  >
                    <div className="absolute left-0 top-1 -ml-1">
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-leaf bg-white" />
                      ) : isError ? (
                        <Circle className="h-6 w-6 text-red-500 fill-white bg-white" />
                      ) : isActive ? (
                        <Loader2 className="h-6 w-6 animate-spin text-coral bg-white" />
                      ) : (
                        <Circle className="h-6 w-6 text-line fill-white bg-white" />
                      )}
                    </div>
                    
                    <div>
                      <p className={`font-medium ${isComplete ? "text-ink" : isActive ? "text-ink" : "text-muted"}`}>
                        {event.message}
                      </p>
                      {isActive && (
                        <p className="mt-1 text-xs text-muted">
                          This may take a moment depending on the volume of posts...
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {reportId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 pt-6 border-t border-line text-center"
          >
            <Link 
              href={`/reports/${reportId}`}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-leaf px-8 font-semibold text-white transition-colors hover:bg-leaf/90 focus:outline-none focus:ring-2 focus:ring-leaf/50"
            >
              View Strategy Report
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

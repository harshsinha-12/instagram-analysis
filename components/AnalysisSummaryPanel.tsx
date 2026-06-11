"use client";

import { UseFormReturn } from "react-hook-form";
import { type FormSchemaType } from "./AnalyzerForm";

interface AnalysisSummaryPanelProps {
  form: UseFormReturn<FormSchemaType>;
}

export function AnalysisSummaryPanel({ form }: AnalysisSummaryPanelProps) {
  const values = form.watch();

  const compCount = values.competitors?.length || 0;
  const postsFetched = compCount * (values.postsToFetchPerCompetitor || 0);
  const reelsAnalyzed = compCount * (values.reelsToAnalyze || 0);

  return (
    <div className="sticky top-24 rounded-xl border border-line bg-white p-6 shadow-soft">
      <h3 className="font-semibold text-ink mb-4">Analysis Scope Summary</h3>
      
      <dl className="space-y-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Brand</dt>
          <dd className="font-medium text-ink">{values.brand || "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Competitors</dt>
          <dd className="font-medium text-ink">{compCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Lookback</dt>
          <dd className="font-medium text-ink">{values.lookbackDays === 0 ? "Custom" : `${values.lookbackDays} days`}</dd>
        </div>
        
        <div className="pt-4 border-t border-line">
          <div className="flex justify-between mb-2">
            <dt className="text-muted">Estimated posts fetched</dt>
            <dd className="font-medium text-ink">{postsFetched}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Estimated reels analyzed</dt>
            <dd className="font-medium text-ink">{reelsAnalyzed}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6 rounded-lg bg-leaf/5 p-4">
        <p className="text-xs text-leaf font-medium">
          Note: This analysis will fetch public metrics and run AI transcription on the selected reels. It may take 2-4 minutes depending on the volume.
        </p>
      </div>
    </div>
  );
}

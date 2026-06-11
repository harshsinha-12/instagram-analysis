"use client";

import { useEffect, useState } from "react";
import { Report } from "@/declaration";
import { Loader2 } from "lucide-react";
import { 
  generateExecutiveSummary, 
  generateStrategicTakeaways, 
  generateCompetitorMatrix, 
  generateOpportunityMap, 
  generateFinalRecommendation 
} from "@/lib/mock-strategy";

// Import all new components
import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportTOC } from "@/components/report/ReportTOC";
import { ExecutiveSummary } from "@/components/report/ExecutiveSummary";
import { MetricScorecard } from "@/components/report/MetricScorecard";
import { StrategicTakeaways } from "@/components/report/StrategicTakeaways";
import { CompetitorMatrix } from "@/components/report/CompetitorMatrix";
import { CompetitorBreakdownCards } from "@/components/report/CompetitorBreakdownCards";
import { PatternLibrary } from "@/components/report/PatternLibrary";
import { TopReelsAnalysisTable } from "@/components/report/TopReelsAnalysisTable";
import { ContentPillarFramework } from "@/components/report/ContentPillarFramework";
import { OpportunityMap } from "@/components/report/OpportunityMap";
import { ActionPlanTimeline } from "@/components/report/ActionPlanTimeline";
import { CreativeBriefCards } from "@/components/report/CreativeBriefCards";
import { FinalRecommendation } from "@/components/report/FinalRecommendation";

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${params.id}`);
        if (!res.ok) throw new Error("Failed to load report");
        const data = await res.json();
        setReport(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      }
    }
    fetchReport();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="bg-surface border border-coral/20 p-6 rounded shadow-sm text-center max-w-md w-full">
          <p className="text-coral font-medium mb-2">Error loading report</p>
          <p className="text-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-leaf animate-spin mb-4" />
        <p className="text-muted font-medium">Assembling strategy report...</p>
      </div>
    );
  }

  // Generate mock strategy data
  const execInsights = generateExecutiveSummary(report);
  const takeaways = generateStrategicTakeaways(report);
  const matrixData = generateCompetitorMatrix(report);
  const opportunities = generateOpportunityMap(report);
  const finalRec = generateFinalRecommendation(report);

  return (
    <div className="min-h-screen bg-white">
      {/* Top sticky header for print compatibility */}
      <div className="hidden print:block fixed top-0 left-0 right-0 h-12 bg-white border-b border-line z-50 pt-4 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-ink">Instagram Creative Intelligence</span>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24 pt-8 md:pt-16">
        <ReportHeader report={report} />

        <div className="flex flex-col lg:flex-row gap-12 relative">
          <ReportTOC />

          <div className="flex-1 min-w-0">
            <ExecutiveSummary insights={execInsights} />
            <MetricScorecard report={report} />
            <StrategicTakeaways takeaways={takeaways} />
            <CompetitorMatrix matrixData={matrixData} brand={report.input.brand} />
            <PatternLibrary patterns={report.patterns} />
            <CompetitorBreakdownCards report={report} />
            <TopReelsAnalysisTable posts={report.topPosts} />
            <ContentPillarFramework pillars={report.contentPillars} />
            <OpportunityMap opportunities={opportunities} />
            <ActionPlanTimeline plan={report.actionPlan} />
            <CreativeBriefCards ideas={report.reelIdeas} />
            <FinalRecommendation recommendation={finalRec} />
          </div>
        </div>
      </main>

      {/* Print footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-line z-50 flex items-center justify-between px-8">
        <span className="text-[10px] text-muted uppercase">Internal Strategy Document</span>
        <span className="text-[10px] text-muted">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

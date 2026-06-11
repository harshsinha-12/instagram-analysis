import { ExecutiveInsight } from "@/lib/mock-strategy";

export function ExecutiveSummary({ insights }: { insights: ExecutiveInsight[] }) {
  return (
    <section id="executive-summary" className="mb-16 scroll-mt-12">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Executive Summary</h2>
      <div className="space-y-6">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-surface border border-line p-6 shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-3 tracking-tight">
              {idx + 1}. {insight.finding}
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Why It Matters</h4>
                <p className="text-sm text-ink leading-relaxed">{insight.whyItMatters}</p>
              </div>
              <div className="bg-paper p-4 border border-line">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-leaf mb-2">Recommended Action</h4>
                <p className="text-sm font-medium text-ink leading-relaxed">{insight.recommendedAction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

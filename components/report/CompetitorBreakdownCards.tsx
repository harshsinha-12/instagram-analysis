import { Report } from "@/declaration";

export function CompetitorBreakdownCards({ report }: { report: Report }) {
  if (!report.competitors || report.competitors.length === 0) return null;

  return (
    <section id="competitor-breakdown" className="mb-16 scroll-mt-12">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Competitor Breakdown</h2>
      <div className="space-y-6">
        {report.competitors.map((competitor, idx) => (
          <div key={idx} className="bg-surface border border-line p-0 shadow-sm print-break-inside-avoid">
            <div className="bg-paper border-b border-line p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-ink tracking-tight">{competitor.name}</h3>
                <p className="text-sm text-muted">@{competitor.handle}</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Followers</p>
                  <p className="font-medium text-ink">{competitor.followers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Avg Views</p>
                  <p className="font-medium text-ink">{competitor.avgViews > 1000 ? (competitor.avgViews/1000).toFixed(1) + 'k' : competitor.avgViews.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Best Score</p>
                  <p className="font-medium text-ink">{competitor.bestScore}/100</p>
                </div>
              </div>
            </div>
            
            {/* Mocked deep dive data since we don't have it explicitly per competitor from the backend yet */}
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-leaf mb-3">Content Strengths</h4>
                <ul className="list-disc pl-4 space-y-2 text-sm text-ink mb-6">
                  <li>Strong initial visual hooks (fast cuts, bold text).</li>
                  <li>Effective use of meme formats and trending audio.</li>
                </ul>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-coral mb-3">Content Weaknesses</h4>
                <ul className="list-disc pl-4 space-y-2 text-sm text-ink">
                  <li>Lacks deep educational payoff after the hook.</li>
                  <li>Overly sales-focused CTAs in captions.</li>
                </ul>
              </div>
              <div className="bg-paper p-4 border border-line">
                <h4 className="text-sm font-bold text-ink mb-2">What to Borrow</h4>
                <p className="text-sm text-muted mb-4 pb-4 border-b border-line">
                  Their ability to simplify complex topics into 3-step checklists. The pacing of their first 3 seconds is optimal for retention.
                </p>
                <h4 className="text-sm font-bold text-ink mb-2">What to Avoid</h4>
                <p className="text-sm text-muted">
                  The aggressive product-pushing at the end of every video, which erodes trust.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Report } from "@/declaration";

export function MetricScorecard({ report }: { report: Report }) {
  const topScoreRaw = Math.max(...report.topPosts.map(p => p.finalScore || 0));
  const avgScoreRaw = report.topPosts.reduce((acc, p) => acc + (p.finalScore || 0), 0) / (report.topPosts.length || 1);
  const topScore = (topScoreRaw * 100).toFixed(2);
  const avgScore = (avgScoreRaw * 100).toFixed(2);
  const topViews = Math.max(...report.topPosts.map(p => p.views || 0));
  const topEngRate = Math.max(...report.topPosts.map(p => p.engagementRate || 0));
  const formatNumber = (num: number) => num > 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

  const metrics = [
    {
      label: "Competitors Analyzed",
      value: report.competitors.length,
      interpretation: "Accounts generating relevant overlap."
    },
    {
      label: "Posts Scanned",
      value: report.competitors.reduce((acc, c) => acc + c.postsAnalyzed, 0),
      interpretation: "Total content universe reviewed."
    },
    {
      label: "Reels Analyzed",
      value: report.topPosts.length,
      interpretation: "Top outliers isolated for strategy."
    },
    {
      label: "Highest View Count",
      value: formatNumber(topViews),
      interpretation: "Ceiling for viral reach in this niche."
    },
    {
      label: "Best Creative Score",
      value: topScore.toString(),
      interpretation: "Indicates strongest hook-message fit."
    },
    {
      label: "Avg Creative Score",
      value: avgScore.toString(),
      interpretation: "Baseline quality of competitor content."
    },
    {
      label: "Top Engagement Rate",
      value: `${(topEngRate * 100).toFixed(1)}%`,
      interpretation: "Highest community interaction found."
    },
    {
      label: "Dominant Pattern",
      value: report.patterns[0]?.name || "N/A",
      interpretation: "Most frequent winning creative strategy."
    }
  ];

  return (
    <section id="kpi-snapshot" className="mb-16 scroll-mt-12 print-break-inside-avoid">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">KPI Snapshot</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-surface p-5 flex flex-col justify-between group hover:bg-paper transition-colors">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">{metric.label}</p>
              <p className="text-3xl font-light tracking-tight text-ink mb-3">{metric.value}</p>
            </div>
            <p className="text-xs text-muted leading-snug border-t border-line/50 pt-3 mt-auto">
              {metric.interpretation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

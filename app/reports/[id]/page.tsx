import Link from "next/link";
import { Download } from "lucide-react";
import { CompetitorChart } from "@/components/CompetitorChart";
import { MetricCard } from "@/components/MetricCard";
import { PrintButton } from "@/components/PrintButton";
import { TopPostsTable } from "@/components/TopPostsTable";
import { getReport } from "@/lib/jobs";

function compact(value: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const report = getReport(params.id);
  const bestPost = report.topPosts[0];
  const avgScore = report.topPosts.reduce((sum, post) => sum + post.finalScore, 0) / report.topPosts.length;

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-leaf">
              New analysis
            </Link>
            <h1 className="mt-1 text-3xl font-semibold">{report.input.brand} competitor strategy report</h1>
            <p className="mt-1 text-sm text-muted">
              {report.input.competitors.join(", ")} · {report.input.lookbackDays} day lookback · {report.input.contentType}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold" href={`/api/reports/${report.id}/export`}>
              <Download className="h-4 w-4" />
              Export JSON
            </a>
            <PrintButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Competitors" value={String(report.competitors.length)} detail="represented in top posts" />
          <MetricCard label="Top views" value={compact(bestPost.views)} detail={bestPost.account} />
          <MetricCard label="Best score" value={(bestPost.finalScore * 100).toFixed(0)} detail={bestPost.analysis.hookType} />
          <MetricCard label="Avg score" value={(avgScore * 100).toFixed(0)} detail="across analyzed posts" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="mb-3 text-xl font-semibold">Competitor Overview</h2>
            <CompetitorChart competitors={report.competitors} />
          </div>
          <div>
            <h2 className="mb-3 text-xl font-semibold">Winning Patterns</h2>
            <div className="grid gap-3">
              {report.patterns.map((pattern) => (
                <div key={pattern.name} className="rounded-lg border border-line bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <span className="rounded-full bg-[#ece8df] px-2.5 py-1 text-xs font-semibold">{pattern.replicability}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{pattern.psychology}</p>
                  <p className="mt-2 text-sm font-medium">{pattern.count} top posts show this pattern</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Top Performing Reels</h2>
          <TopPostsTable posts={report.topPosts} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Content Pillars</h2>
            <div className="mt-4 grid gap-3">
              {report.contentPillars.map((pillar) => (
                <div key={pillar} className="rounded-md bg-paper px-3 py-2 text-sm font-medium">
                  {pillar}
                </div>
              ))}
            </div>
            <h2 className="mt-6 text-xl font-semibold">Action Plan</h2>
            <ol className="mt-4 grid gap-3">
              {report.actionPlan.map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-6">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-leaf text-xs font-semibold text-white">{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Suggested Reel Ideas</h2>
            <div className="mt-4 grid gap-4">
              {report.reelIdeas.map((idea) => (
                <article key={idea.title} className="rounded-lg border border-line p-4">
                  <h3 className="font-semibold">{idea.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{idea.hook}</p>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <p>
                      <span className="font-semibold">Pattern:</span> {idea.patternReused}
                    </p>
                    <p>
                      <span className="font-semibold">Format:</span> {idea.format}
                    </p>
                    <p>
                      <span className="font-semibold">Duration:</span> {idea.duration}
                    </p>
                    <p>
                      <span className="font-semibold">CTA:</span> {idea.cta}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{idea.brandNote}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

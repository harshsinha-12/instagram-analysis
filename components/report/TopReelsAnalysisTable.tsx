import { AnalyzedPost } from "@/declaration";
import { PlayCircle, FileText, CheckCircle2 } from "lucide-react";

export function TopReelsAnalysisTable({ posts }: { posts: AnalyzedPost[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section id="top-reels" className="mb-16 scroll-mt-12">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Top Performing Reels</h2>
      <div className="overflow-x-auto border border-line bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper border-b border-line sticky top-0">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted font-sans">Creative</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted font-sans">Account</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted font-sans text-right">Score</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted font-sans text-right">Views</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted font-sans">Hook & Strategy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.map((post, idx) => (
              <tr key={idx} className="group hover:bg-black/5 transition-colors">
                <td className="px-4 py-4 w-48 align-top">
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} alt="Thumbnail" className="w-full aspect-[9/16] object-cover rounded-md border border-line mb-3" />
                  ) : (
                    <div className="w-full aspect-[9/16] bg-paper rounded-md border border-line flex items-center justify-center mb-3 text-xs text-muted">No Thumb</div>
                  )}
                  <div className="flex flex-col gap-2 no-print">
                    <a href={post.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-leaf hover:text-ink transition-colors">
                      <PlayCircle className="w-3.5 h-3.5" /> Watch Reel
                    </a>
                    {post.analysis?.transcriptAvailable && (
                      <button className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors text-left">
                        <FileText className="w-3.5 h-3.5" /> View Transcript
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="font-medium text-ink">@{post.account}</span>
                </td>
                <td className="px-4 py-4 align-top text-right">
                  <span className="inline-flex items-center justify-center bg-navy text-white font-bold px-2 py-1 rounded text-xs">
                    {post.finalScore}
                  </span>
                </td>
                <td className="px-4 py-4 align-top text-right">
                  <span className="text-ink font-medium">{post.views > 1000 ? (post.views/1000).toFixed(1) + 'k' : post.views}</span>
                  <p className="text-[10px] text-muted mt-1">{(post.engagementRate * 100).toFixed(1)}% ER</p>
                </td>
                <td className="px-4 py-4 align-top min-w-[300px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Creative Hook</h4>
                      <p className="text-sm text-ink italic">&quot;{post.analysis?.hookText || "Relatable financial situation"}&quot;</p>
                      <p className="text-xs text-muted mt-1">Type: {post.analysis?.hookType || "Curiosity gap"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Strategic Interpretation</h4>
                      <p className="text-sm text-ink leading-relaxed">
                        {post.analysis?.whyWorked || "Effectively balances entertainment and education."}
                      </p>
                    </div>
                    {post.analysis?.brandAdaptation && (
                      <div className="bg-paper p-3 border border-line rounded flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-leaf shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-leaf mb-0.5">Brand Implication</h4>
                          <p className="text-xs text-ink">{post.analysis.brandAdaptation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { AnalyzedPost } from "@/declaration";
import { PlayCircle, FileText, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

export function TopReelsAnalysisTable({ posts }: { posts: AnalyzedPost[] }) {
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);

  if (!posts || posts.length === 0) return null;

  return (
    <section id="top-reels" className="mb-16 scroll-mt-12 top-reels-print-section">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Top Performing Reels</h2>
      <div className="overflow-x-auto border border-line rounded-lg bg-surface shadow-sm top-reels-print-wrap">
        <table className="w-full text-left text-sm top-reels-print-table">
          <thead className="bg-paper border-b border-line sticky top-0">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans top-reels-print-creative">Creative</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans top-reels-print-account">Account</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans text-right top-reels-print-score">Score</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans text-right top-reels-print-views">Views</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans top-reels-print-strategy">Hook & Strategy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.map((post, idx) => (
              <tr key={idx} className="group hover:bg-black-[0.02] transition-colors top-reels-print-row">
                <td className="px-6 py-5 w-48 align-top top-reels-print-creative">
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} alt="Thumbnail" className="w-full aspect-[9/16] object-cover rounded-md border border-line mb-3 top-reels-print-thumb" />
                  ) : (
                    <div className="w-full aspect-[9/16] bg-paper rounded-md border border-line flex items-center justify-center mb-3 text-xs text-muted top-reels-print-thumb">No Thumb</div>
                  )}
                  <div className="flex flex-col gap-2 no-print">
                    <a href={post.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-leaf hover:text-ink transition-colors">
                      <PlayCircle className="w-3.5 h-3.5" /> Watch Reel
                    </a>
                    {post.analysis?.transcriptAvailable && (
                      <button 
                        onClick={() => setSelectedTranscript(post.media?.transcript?.text || "Transcript text not available in payload.")}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors text-left"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Transcript
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 align-top top-reels-print-account">
                  <span className="font-medium text-ink">{post.account.startsWith('@') ? post.account : `@${post.account}`}</span>
                </td>
                <td className="px-6 py-5 align-top text-right top-reels-print-score">
                  <span className="inline-flex items-center justify-center bg-navy text-white font-bold px-2 py-1 rounded text-xs">
                    {(post.finalScore * 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-5 align-top text-right top-reels-print-views">
                  <span className="text-ink font-medium">{post.views > 1000 ? (post.views/1000).toFixed(1) + 'k' : post.views}</span>
                  <p className="text-[10px] text-muted mt-1">{(post.engagementRate * 100).toFixed(1)}% ER</p>
                </td>
                <td className="px-6 py-5 align-top min-w-[300px] top-reels-print-strategy">
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

      {/* Transcript Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-line">
            <div className="flex items-center justify-between p-4 border-b border-line bg-paper rounded-t-xl">
              <h3 className="font-bold text-ink">Video Transcript</h3>
              <button 
                onClick={() => setSelectedTranscript(null)} 
                className="p-1 hover:bg-black/5 rounded text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed font-sans">
                {selectedTranscript}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

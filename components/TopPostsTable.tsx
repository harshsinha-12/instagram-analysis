"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { AnalyzedPost } from "@/lib/types";

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function compact(value: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  if (!minutes) return `${remainingSeconds}s`;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function TopPostsTable({ posts }: { posts: AnalyzedPost[] }) {
  const [transcriptPost, setTranscriptPost] = useState<AnalyzedPost | null>(null);
  const transcript = transcriptPost?.media?.transcript;
  const transcriptDuration = transcript?.durationSeconds ?? transcriptPost?.media?.audioDurationSeconds ?? transcriptPost?.media?.videoDurationSeconds;

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#ece8df] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-3">Creative</th>
                <th className="p-3">Account</th>
                <th className="p-3">Score</th>
                <th className="p-3">Views</th>
                <th className="p-3">Relative</th>
                <th className="p-3">Engagement</th>
                <th className="p-3">Hook</th>
                <th className="p-3">Topic</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const hasTranscript = Boolean(post.media?.transcript?.text);

                return (
                  <tr key={post.id} className="border-t border-line align-top">
                    <td className="flex items-center gap-3 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="h-[68px] w-[68px] rounded-md object-cover"
                      />
                      <div>
                        <p className="max-w-[240px] font-medium text-ink">{post.caption}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <a className="text-xs font-semibold text-leaf" href={post.url} target="_blank">
                            Open reel
                          </a>
                          <button
                            type="button"
                            disabled={!hasTranscript}
                            onClick={() => setTranscriptPost(post)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink transition hover:border-leaf hover:text-leaf disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Transcript
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{post.account}</td>
                    <td className="p-3">{(post.finalScore * 100).toFixed(0)}</td>
                    <td className="p-3">{compact(post.views)}</td>
                    <td className="p-3">{post.relativeViews.toFixed(2)}x</td>
                    <td className="p-3">{percent(post.engagementRate)}</td>
                    <td className="p-3">{post.analysis.hookType}</td>
                    <td className="p-3">{post.analysis.topic}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {transcriptPost && transcript ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-line p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{transcriptPost.account}</p>
                <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-ink">{transcriptPost.caption}</h3>
                <p className="mt-1 text-xs text-muted">
                  {transcript.provider}
                  {transcript.model ? ` · ${transcript.model}` : ""}
                  {transcript.language ? ` · ${transcript.language}` : ""}
                  {transcriptDuration ? ` · ${formatDuration(transcriptDuration)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTranscriptPost(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line text-muted transition hover:border-ink hover:text-ink"
                aria-label="Close transcript"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[58vh] overflow-y-auto p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-ink">{transcript.text}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

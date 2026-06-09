import { AnalyzedPost } from "@/lib/types";

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function compact(value: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function TopPostsTable({ posts }: { posts: AnalyzedPost[] }) {
  return (
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
            {posts.map((post) => (
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
                    <a className="mt-1 inline-block text-xs font-semibold text-leaf" href={post.url} target="_blank">
                      Open reel
                    </a>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

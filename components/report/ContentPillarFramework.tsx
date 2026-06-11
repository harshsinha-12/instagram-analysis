export function ContentPillarFramework({ pillars }: { pillars: string[] }) {
  if (!pillars || pillars.length === 0) return null;

  return (
    <section id="content-pillars" className="mb-16 scroll-mt-12">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Content Pillar Strategy Framework</h2>
      <div className="bg-surface border border-line shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper border-b border-line">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans w-1/4">Strategic Pillar</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans w-1/3">Audience Job-to-be-done</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted font-sans">Recommended Formats</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pillars.map((pillar, idx) => (
              <tr key={idx}>
                <td className="px-6 py-5 align-top">
                  <p className="font-bold text-ink mb-2 leading-snug">{pillar}</p>
                </td>
                <td className="px-6 py-5 align-top text-muted">
                  {idx % 2 === 0 
                    ? "Help me understand why the market is behaving differently than I expected, without using jargon."
                    : "Give me a simple checklist I can use to feel more confident about my next financial decision."}
                </td>
                <td className="px-6 py-5 align-top text-muted">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Creator-led skits</li>
                    <li>Simple analogy explainers</li>
                    <li>Text-on-screen hook + voiceover</li>
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { Pattern } from "@/declaration";

export function PatternLibrary({ patterns }: { patterns: Pattern[] }) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <section id="creative-patterns" className="mb-16 scroll-mt-12">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Creative Pattern Analysis</h2>
      <div className="space-y-6">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="bg-surface border border-line shadow-sm print-break-inside-avoid">
            <div className="bg-paper border-b border-line p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-ink tracking-tight">{pattern.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-white px-2 py-1 rounded border border-line">
                {pattern.replicability} Replicability
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Strategic Role</h4>
                  <p className="text-sm text-ink leading-relaxed">
                    Acts as an attention anchor. It lowers the barrier to entry by using familiar contexts before delivering financial payloads.
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Audience Psychology</h4>
                  <p className="text-sm text-ink leading-relaxed">
                    {pattern.psychology}
                  </p>
                </div>
              </div>
              
              <div className="bg-navy text-white p-4 rounded-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">Groww Adaptation Strategy</h4>
                <p className="text-sm font-medium leading-relaxed">
                  Implement this pattern using relatable creator-led skits. Use everyday Indian moments (UPI payments, group chat stock tips) as the hook, transitioning into a clear, branded UI walkthrough. Avoid overly complex charts.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

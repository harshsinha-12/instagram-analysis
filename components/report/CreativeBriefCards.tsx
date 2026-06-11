import { ReelIdea } from "@/declaration";
import { Film, Target, AlertTriangle } from "lucide-react";

export function CreativeBriefCards({ ideas }: { ideas: ReelIdea[] }) {
  if (!ideas || ideas.length === 0) return null;

  return (
    <section id="reel-ideas" className="mb-16 scroll-mt-12">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Creative Briefs (Suggested Concepts)</h2>
      <div className="space-y-6">
        {ideas.map((idea, idx) => (
          <div key={idx} className="bg-surface border border-line shadow-sm print-break-inside-avoid">
            <div className="bg-paper border-b border-line p-4 md:p-6">
              <h3 className="text-xl font-bold text-ink tracking-tight mb-2">{idea.title}</h3>
              <p className="text-sm font-medium text-leaf flex items-center gap-2">
                <Target className="w-4 h-4" />
                Pattern: {idea.patternReused}
              </p>
            </div>
            
            <div className="p-4 md:p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">The Hook (First 3s)</h4>
                  <p className="text-lg text-ink font-serif italic border-l-2 border-leaf pl-4 py-1 leading-snug">
                    &quot;{idea.hook}&quot;
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Format</h4>
                    <p className="text-sm text-ink flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-muted" />
                      {idea.format}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Target Duration</h4>
                    <p className="text-sm text-ink">{idea.duration}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Structure</h4>
                  <p className="text-sm text-ink leading-relaxed">{idea.structure}</p>
                </div>
              </div>
              
              <div className="space-y-6 flex flex-col">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Call to Action (CTA)</h4>
                  <div className="bg-paper p-3 border border-line rounded">
                    <p className="text-sm font-medium text-ink">{idea.cta}</p>
                  </div>
                </div>
                
                <div className="mt-auto bg-coral/5 border border-coral/20 p-4 rounded">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-coral flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Brand Safety Note
                  </h4>
                  <p className="text-sm text-ink leading-relaxed">{idea.brandNote}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

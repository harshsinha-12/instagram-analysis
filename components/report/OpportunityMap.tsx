import { Opportunity } from "@/lib/mock-strategy";
import { Zap, FlaskConical, TrendingUp } from "lucide-react";

export function OpportunityMap({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <section id="opportunity-map" className="mb-16 scroll-mt-12 print-break-inside-avoid">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Growth Opportunity Map</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        {opportunities.map((opp, idx) => (
          <div key={idx} className="bg-surface border border-line p-6 flex flex-col h-full print-break-inside-avoid shadow-sm relative overflow-hidden">
            {/* Priority Banner */}
            <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-wider border-b border-l border-line ${
              opp.priority === "Immediate" ? "bg-coral text-white border-coral" :
              opp.priority === "Test-and-learn" ? "bg-leaf/10 text-leaf" :
              "bg-paper text-muted"
            }`}>
              {opp.priority}
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-8 h-8 rounded bg-paper border border-line flex items-center justify-center shrink-0">
                {opp.priority === "Immediate" && <Zap className="w-4 h-4 text-coral" />}
                {opp.priority === "Test-and-learn" && <FlaskConical className="w-4 h-4 text-leaf" />}
                {opp.priority === "Long-term" && <TrendingUp className="w-4 h-4 text-muted" />}
              </div>
              <h3 className="text-lg font-bold text-ink tracking-tight pr-12">{opp.title}</h3>
            </div>

            <p className="text-sm text-ink mb-6 leading-relaxed flex-grow">{opp.rationale}</p>

            <div className="bg-paper p-4 border border-line mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Suggested Experiment</h4>
              <p className="text-sm font-medium text-ink">{opp.experiment}</p>
            </div>

            <div className="flex justify-between items-center text-xs font-medium pt-4 border-t border-line">
              <div className="text-muted">Effort: <span className="text-ink">{opp.effort}</span></div>
              <div className="text-muted">Metric: <span className="text-ink">{opp.metric}</span></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

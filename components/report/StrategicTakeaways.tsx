import { StrategicTakeaway } from "@/lib/mock-strategy";

export function StrategicTakeaways({ takeaways }: { takeaways: StrategicTakeaway[] }) {
  return (
    <section id="strategic-takeaways" className="mb-16 scroll-mt-12 print-break-inside-avoid">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Strategic Takeaways</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {takeaways.map((takeaway, idx) => (
          <div key={idx} className="bg-surface border border-line p-6 shadow-sm flex flex-col h-full print-break-inside-avoid">
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 className="text-lg font-bold text-ink tracking-tight">{takeaway.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${
                  takeaway.confidence === "High" ? "bg-leaf/10 text-leaf" : 
                  takeaway.confidence === "Medium" ? "bg-gold/10 text-gold" : 
                  "bg-coral/10 text-coral"
                }`}>
                  {takeaway.confidence} Confidence
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted mb-4 pb-4 border-b border-line">
              Evidence: Seen in {takeaway.evidenceCount} top posts
            </p>

            <div className="space-y-4 flex-grow">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Business Implication</h4>
                <p className="text-sm text-ink leading-relaxed">{takeaway.implication}</p>
              </div>
              <div className="bg-paper p-3 border border-line mt-auto">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-leaf mb-1">Recommended Response</h4>
                <p className="text-sm font-medium text-ink leading-relaxed">{takeaway.response}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

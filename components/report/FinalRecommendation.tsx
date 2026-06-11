export function FinalRecommendation({ recommendation }: { recommendation: string }) {
  return (
    <section id="final-recommendation" className="mb-16 scroll-mt-12 print-break-inside-avoid">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">Executive Recommendation</h2>
      <div className="bg-navy p-6 md:p-8 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4">Recommended Strategic Direction</h3>
        <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
          {recommendation}
        </p>
      </div>
    </section>
  );
}

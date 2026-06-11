export function ActionPlanTimeline({ plan }: { plan: string[] }) {
  if (!plan || plan.length === 0) return null;

  const weeks = [
    {
      title: "Week 1: Strategy & Setup",
      tasks: plan.slice(0, 2),
    },
    {
      title: "Week 2: Production & Testing",
      tasks: plan.slice(2, 4),
    },
    {
      title: "Week 3: Distribution & Analysis",
      tasks: plan.slice(4, 6),
    },
    {
      title: "Week 4: Optimization",
      tasks: plan.slice(6),
    }
  ];

  return (
    <section id="action-plan" className="mb-16 scroll-mt-12 print-break-inside-avoid">
      <h2 className="text-2xl font-serif text-ink mb-6 border-b border-line pb-2">30-Day Action Plan</h2>
      <div className="relative border-l-2 border-line ml-4 md:ml-6 space-y-8 pb-4">
        {weeks.map((week, wIdx) => {
          if (week.tasks.length === 0) return null;
          return (
            <div key={wIdx} className="relative pl-6 md:pl-10 print-break-inside-avoid">
              <div className="absolute w-4 h-4 bg-white border-2 border-leaf rounded-full -left-[9px] top-1"></div>
              <h3 className="text-lg font-bold text-ink tracking-tight mb-4">{week.title}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {week.tasks.map((task, tIdx) => (
                  <div key={tIdx} className="bg-surface border border-line p-4 shadow-sm group hover:border-leaf/30 transition-colors">
                    <p className="text-sm text-ink leading-relaxed">{task}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

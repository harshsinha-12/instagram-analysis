import { FileText, LayoutList, Target, Zap, Lightbulb, FileJson } from "lucide-react";

const features = [
  {
    name: "Winning patterns",
    description: "Discover exact hook structures and visual styles that are over-performing right now.",
    icon: Zap,
  },
  {
    name: "Top reel breakdowns",
    description: "Detailed analysis of outlier reels, including transcript excerpts and pacing notes.",
    icon: LayoutList,
  },
  {
    name: "Content pillars",
    description: "See which broader topics are resonating with your shared target audience.",
    icon: Target,
  },
  {
    name: "Action plan",
    description: "A step-by-step strategy to adapt competitor wins into your own unique brand voice.",
    icon: FileText,
  },
  {
    name: "Suggested reel ideas",
    description: "Ready-to-use creative briefs with hooks, body scripts, and visual directions.",
    icon: Lightbulb,
  },
  {
    name: "Exportable reports",
    description: "Download the full analysis as JSON or print to PDF for stakeholder meetings.",
    icon: FileJson,
  },
];

export function FeatureCards() {
  return (
    <section id="product" className="bg-paper py-24 sm:py-32 w-full overflow-x-auto">
      <div className="w-full px-6 md:px-12">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-leaf">What you get</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Everything you need for your next content sprint
          </p>
          <p className="mt-6 text-lg leading-8 text-muted">
            Stop guessing what works. Get data-backed creative intelligence delivered in a readable, actionable format.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-ink">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-leaf/10">
                    <feature.icon className="h-6 w-6 text-leaf" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

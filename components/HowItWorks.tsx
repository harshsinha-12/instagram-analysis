import { Search, Trophy, BrainCircuit, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Connect public handles",
    description: "Input your brand and up to 5 competitors. We fetch recent reels and posts directly from public Instagram profiles.",
  },
  {
    icon: Trophy,
    title: "2. Rank top-performing posts",
    description: "We calculate relative engagement and velocity to identify statistically significant outliers in your niche.",
  },
  {
    icon: BrainCircuit,
    title: "3. Decode hooks & topics",
    description: "AI extracts transcripts, analyzes visual hooks, and categorizes content pillars to see what keeps audiences watching.",
  },
  {
    icon: Lightbulb,
    title: "4. Generate action plan",
    description: "Get a concrete strategy report with recommended content pillars, winning patterns, and ready-to-shoot reel ideas.",
  },
];

export function HowItWorks() {
  return (
    <section id="workflow" className="bg-surface py-24 sm:py-32 border-y border-line">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-coral">Workflow</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            From raw data to creative brief in 4 steps
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.title} className="flex flex-col relative group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-paper border border-line group-hover:border-leaf group-hover:shadow-soft transition-all">
                  <step.icon className="h-6 w-6 text-leaf" aria-hidden="true" />
                </div>
                <dt className="text-lg font-semibold leading-7 text-ink">
                  {step.title}
                </dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-muted">
                  <p className="flex-auto">{step.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

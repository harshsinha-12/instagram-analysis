"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, FileText, Loader2, LucideIcon, PlayCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const competitors = String(formData.get("competitors") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: formData.get("brand"),
        brandHandle: formData.get("brandHandle"),
        competitors,
        platform: "Instagram",
        contentType: formData.get("contentType"),
        lookbackDays: Number(formData.get("lookbackDays")),
        industry: formData.get("industry"),
        targetAudience: formData.get("targetAudience"),
        brandTone: formData.get("brandTone"),
        brandAvoid: formData.get("brandAvoid")
      })
    });

    if (!response.ok) {
      setError("Could not start analysis. Check the inputs and try again.");
      setIsSubmitting(false);
      return;
    }

    const data = (await response.json()) as { jobId: string };
    router.push(`/jobs/${data.jobId}`);
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">Creative intelligence agent</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Instagram competitor analyzer</h1>
          </div>
          <a className="text-sm font-semibold text-leaf" href="/reports/demo-report">
            View demo report
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Brand
              <input className="focus-ring rounded-md border border-line px-3 py-2" name="brand" defaultValue="Groww" required />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Brand handle
              <input className="focus-ring rounded-md border border-line px-3 py-2" name="brandHandle" defaultValue="@groww" required />
            </label>
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Competitors
              <input
                className="focus-ring rounded-md border border-line px-3 py-2"
                name="competitors"
                defaultValue="@zerodha, @angelone_official, @upstox"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Lookback
              <select className="focus-ring rounded-md border border-line px-3 py-2" name="lookbackDays" defaultValue="30">
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Content type
              <select className="focus-ring rounded-md border border-line px-3 py-2" name="contentType" defaultValue="reels">
                <option value="reels">Reels</option>
                <option value="posts">Posts</option>
                <option value="both">Both</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Industry
              <input className="focus-ring rounded-md border border-line px-3 py-2" name="industry" defaultValue="Fintech / Investing" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Target audience
              <input
                className="focus-ring rounded-md border border-line px-3 py-2"
                name="targetAudience"
                defaultValue="Young Indian retail investors aged 22-35"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Brand tone
              <input
                className="focus-ring rounded-md border border-line px-3 py-2"
                name="brandTone"
                defaultValue="Simple, trustworthy, beginner-friendly"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Avoid
              <input className="focus-ring rounded-md border border-line px-3 py-2" name="brandAvoid" defaultValue="Jargon, aggressive CTAs, complexity" />
            </label>
          </div>

          {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-leaf px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Analyze competitors
          </button>
        </form>

        <aside className="grid gap-4">
          {highlights.map(({ title, detail, Icon }) => (
            <div key={title} className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <Icon className="h-5 w-5 text-coral" />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
            </div>
          ))}
        </aside>
      </section>
    </main>
  );
}
  const highlights: Array<{ title: string; detail: string; Icon: LucideIcon }> = [
    {
      title: "Manual CSV first",
      detail: "Demo-safe data source adapter before scraper dependencies.",
      Icon: FileText
    },
    {
      title: "Math before AI",
      detail: "Relative views, engagement, velocity, and outlier selection.",
      Icon: BarChart3
    },
    {
      title: "Live progress",
      detail: "SSE stream keeps the analysis flow visible while jobs run.",
      Icon: Loader2
    }
  ];

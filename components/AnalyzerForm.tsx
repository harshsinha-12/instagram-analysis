"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlayCircle, Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { CompetitorTagInput } from "./CompetitorTagInput";
import { AnalysisSummaryPanel } from "./AnalysisSummaryPanel";
import { ANALYSIS_CONFIG } from "@/config";

const formSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  brandHandle: z.string().startsWith("@", "Handle must start with @").min(2, "Handle is required"),
  competitors: z.array(z.string().startsWith("@", "Handle must start with @")).min(1, "At least 1 competitor required"),
  lookbackDays: z.number(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  contentType: z.enum(["reels", "posts", "both"]),
  postsToFetchPerCompetitor: z.number().min(1),
  topPostsToSelect: z.number().min(1),
  reelsToAnalyze: z.number().min(1),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandTone: z.string().optional(),
  brandAvoid: z.string().optional()
}).refine((data) => data.topPostsToSelect <= data.postsToFetchPerCompetitor, {
  message: "Top posts cannot exceed fetched posts",
  path: ["topPostsToSelect"]
}).refine((data) => data.reelsToAnalyze <= data.topPostsToSelect, {
  message: "Reels to analyze cannot exceed top posts selected",
  path: ["reelsToAnalyze"]
});

export type FormSchemaType = z.infer<typeof formSchema>;

export function AnalyzerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const defaultValues: FormSchemaType = {
    brand: ANALYSIS_CONFIG.brand.name || "Groww",
    brandHandle: ANALYSIS_CONFIG.brand.instagramHandle || "@groww_official",
    competitors: ANALYSIS_CONFIG.competitors.map(c => c.instagramHandle),
    lookbackDays: ANALYSIS_CONFIG.collection.lookbackDays,
    contentType: ANALYSIS_CONFIG.collection.contentType as "reels" | "posts" | "both",
    dateFrom: ANALYSIS_CONFIG.collection.dateFrom,
    dateTo: ANALYSIS_CONFIG.collection.dateTo,
    postsToFetchPerCompetitor: ANALYSIS_CONFIG.collection.postsToFetchPerCompetitor,
    topPostsToSelect: ANALYSIS_CONFIG.selection.topPostsToSelect,
    reelsToAnalyze: ANALYSIS_CONFIG.selection.reelsToAnalyze,
    industry: ANALYSIS_CONFIG.brand.industry || "Fintech / Investing",
    targetAudience: ANALYSIS_CONFIG.brand.targetAudience,
    brandTone: ANALYSIS_CONFIG.brand.tone,
    brandAvoid: ANALYSIS_CONFIG.brand.avoid
  };

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  });

  const lookbackValue = form.watch("lookbackDays");

  async function onSubmit(values: FormSchemaType) {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          platform: "Instagram"
        })
      });

      if (!response.ok) {
        throw new Error("Could not start analysis. Check the inputs and try again.");
      }

      const data = await response.json();
      router.push(`/jobs/${data.jobId}`);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  const InputLabel = ({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) => (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink mb-1.5">{children}</label>
  );

  const InputError = ({ name }: { name: keyof FormSchemaType }) => {
    const error = form.formState.errors[name];
    if (!error) return null;
    return <p className="text-xs text-red-500 mt-1">{error.message}</p>;
  };

  return (
    <div id="analyzer-form" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Create a competitor analysis run</h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Tell us the brand, competitors, and creative constraints. We&apos;ll fetch public posts, score outliers, and generate a strategy report.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Brand Setup */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf/10 text-leaf text-sm">1</span>
              Brand Setup
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <InputLabel>Brand Name</InputLabel>
                <input {...form.register("brand")} className="w-full focus-ring rounded-md border border-line px-3 py-2" placeholder="e.g. Groww" />
                <InputError name="brand" />
              </div>
              <div>
                <InputLabel>Brand Handle</InputLabel>
                <input {...form.register("brandHandle")} className="w-full focus-ring rounded-md border border-line px-3 py-2" placeholder="@brand_handle" />
                <InputError name="brandHandle" />
              </div>
            </div>
          </div>

          {/* Section 2: Competitor Set */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf/10 text-leaf text-sm">2</span>
              Competitor Set
            </h3>
            <div>
              <InputLabel>Competitor Handles</InputLabel>
              <p className="text-sm text-muted mb-3">Add handles starting with @ and press Enter.</p>
              <CompetitorTagInput 
                value={form.watch("competitors")} 
                onChange={(val) => form.setValue("competitors", val, { shouldValidate: true })}
                error={form.formState.errors.competitors?.message}
              />
            </div>
          </div>

          {/* Section 3: Analysis Scope */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf/10 text-leaf text-sm">3</span>
              Analysis Scope
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <InputLabel>Lookback Period</InputLabel>
                <div className="flex flex-wrap gap-2">
                  {[7, 14, 30, 0].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => form.setValue("lookbackDays", days)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        lookbackValue === days ? "bg-leaf text-white" : "bg-paper text-muted hover:bg-line/50"
                      }`}
                    >
                      {days === 0 ? "Custom" : `${days} days`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <InputLabel>Content Type</InputLabel>
                <div className="flex bg-paper p-1 rounded-md">
                  {["reels", "posts", "both"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => form.setValue("contentType", type as FormSchemaType["contentType"])}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded capitalize transition-all ${
                        form.watch("contentType") === type ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {lookbackValue === 0 && (
              <div className="grid sm:grid-cols-2 gap-6 mb-6 p-4 bg-paper rounded-lg border border-line">
                <div>
                  <InputLabel>Date From</InputLabel>
                  <input type="date" {...form.register("dateFrom")} className="w-full focus-ring rounded-md border border-line px-3 py-2 bg-white" />
                </div>
                <div>
                  <InputLabel>Date To</InputLabel>
                  <input type="date" {...form.register("dateTo")} className="w-full focus-ring rounded-md border border-line px-3 py-2 bg-white" />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-line">
              <div>
                <InputLabel>Posts to fetch</InputLabel>
                <input type="number" {...form.register("postsToFetchPerCompetitor", { valueAsNumber: true })} className="w-full focus-ring rounded-md border border-line px-3 py-2" />
                <InputError name="postsToFetchPerCompetitor" />
              </div>
              <div>
                <InputLabel>Top posts to select</InputLabel>
                <input type="number" {...form.register("topPostsToSelect", { valueAsNumber: true })} className="w-full focus-ring rounded-md border border-line px-3 py-2" />
                <InputError name="topPostsToSelect" />
              </div>
              <div>
                <InputLabel>Reels to analyze</InputLabel>
                <input type="number" {...form.register("reelsToAnalyze", { valueAsNumber: true })} className="w-full focus-ring rounded-md border border-line px-3 py-2" />
                <InputError name="reelsToAnalyze" />
              </div>
            </div>
          </div>

          {/* Section 4: Audience & Tone */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf/10 text-leaf text-sm">4</span>
              Audience & Tone
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <InputLabel>Industry</InputLabel>
                <input {...form.register("industry")} className="w-full focus-ring rounded-md border border-line px-3 py-2" placeholder="e.g. Fintech" />
              </div>
              <div>
                <InputLabel>Target Audience</InputLabel>
                <input {...form.register("targetAudience")} className="w-full focus-ring rounded-md border border-line px-3 py-2" placeholder="e.g. Gen Z investors" />
              </div>
              <div>
                <InputLabel>Brand Tone</InputLabel>
                <input {...form.register("brandTone")} className="w-full focus-ring rounded-md border border-line px-3 py-2" placeholder="e.g. Trustworthy, friendly" />
              </div>
              <div>
                <InputLabel>Avoid</InputLabel>
                <input {...form.register("brandAvoid")} className="w-full focus-ring rounded-md border border-line px-3 py-2" placeholder="e.g. Cringe memes, aggressive sales" />
              </div>
            </div>
          </div>

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-leaf px-8 font-semibold text-white transition-colors hover:bg-leaf/90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-leaf/50"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              Run competitor analysis
            </button>
            <button
              type="button"
              onClick={() => form.reset(defaultValues)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-6 font-semibold text-ink transition-colors hover:bg-paper focus:outline-none focus:ring-2 focus:ring-leaf/50"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

        </form>

        <aside className="hidden lg:block">
          <AnalysisSummaryPanel form={form} />
        </aside>
      </div>
    </div>
  );
}

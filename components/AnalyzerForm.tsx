"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageSquareText, PlayCircle, Loader2, RefreshCcw, UserRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { CompetitorTagInput } from "./CompetitorTagInput";
import { AnalysisSummaryPanel } from "./AnalysisSummaryPanel";
import { ANALYSIS_CONFIG } from "@/config";

const formSchema = z.object({
  analysisMode: z.enum(["competitor", "single", "chat"]),
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
  const [chatQuery, setChatQuery] = useState("Analyze @groww_official reels from the last 30 days and explain which hooks, topics, and formats are working.");

  const defaultValues: FormSchemaType = {
    analysisMode: "competitor",
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
  const analysisMode = form.watch("analysisMode");

  async function onSubmit(values: FormSchemaType) {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const isChatMode = values.analysisMode === "chat";
      const response = await fetch(isChatMode ? "/api/chat-analyze" : "/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isChatMode ? { query: chatQuery } : {
          ...values,
          competitors: values.analysisMode === "single" ? values.competitors.slice(0, 1) : values.competitors,
          platform: "Instagram"
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Could not start analysis. Check the inputs and try again.");
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

  const highlightedChatQuery = chatQuery.split(/(@[A-Za-z0-9._]+)/g).map((part, index) => {
    if (!part) return null;
    if (part.startsWith("@")) {
      return (
        <span key={`${part}-${index}`} className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700">
          {part}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });

  return (
    <div id="analyzer-form" className="w-full px-6 md:px-12 py-24 sm:py-32 overflow-x-auto">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Create a competitor analysis run</h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Tell us the brand, competitors, and creative constraints. We&apos;ll fetch public posts, score outliers, and generate a strategy report.
        </p>
      </div>

      <div className={`grid gap-8 items-start ${analysisMode === "chat" ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_360px]"}`}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-ink mb-6">Analysis Mode</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  mode: "competitor" as const,
                  icon: UsersRound,
                  title: "Competitor set",
                  copy: "Compare multiple handles and build a strategy report."
                },
                {
                  mode: "single" as const,
                  icon: UserRound,
                  title: "Single account",
                  copy: "Scrape one account and create a focused account report."
                },
                {
                  mode: "chat" as const,
                  icon: MessageSquareText,
                  title: "Agentic chat",
                  copy: "Use @ tags and natural-language conditions."
                }
              ].map((option) => {
                const Icon = option.icon;
                const active = analysisMode === option.mode;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => form.setValue("analysisMode", option.mode, { shouldValidate: true })}
                    className={`rounded-lg border p-4 text-left transition-colors focus-ring ${
                      active ? "border-leaf bg-leaf/5" : "border-line bg-white hover:bg-paper"
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className={active ? "h-5 w-5 text-leaf" : "h-5 w-5 text-muted"} />
                      <span className="font-semibold text-ink">{option.title}</span>
                    </div>
                    <p className="text-sm text-muted">{option.copy}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {analysisMode === "chat" && (
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-ink mb-4">Agentic Chat Request</h3>
              <textarea
                value={chatQuery}
                onChange={(event) => setChatQuery(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-md border border-line px-3 py-2 focus-ring"
                placeholder="Tag accounts with @handle and describe what you want analyzed."
              />
              <div className="mt-3 rounded-md border border-sky-100 bg-sky-50/50 px-3 py-2 text-sm leading-7 text-ink">
                {highlightedChatQuery}
              </div>
              <div className="mt-4 rounded-lg border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Steps shown during run</p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>Read @ tags and natural-language conditions.</li>
                  <li>Plan scrape settings with the fast model when available.</li>
                  <li>Scrape public Instagram data and export all rows to CSV.</li>
                  <li>Analyze selected posts and create the strategy report.</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Section 1: Brand Setup */}
          <div className={`rounded-xl border border-line bg-white p-6 shadow-sm ${analysisMode === "chat" ? "hidden" : ""}`}>
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
          <div className={`rounded-xl border border-line bg-white p-6 shadow-sm ${analysisMode === "chat" ? "hidden" : ""}`}>
            <h3 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf/10 text-leaf text-sm">2</span>
              {analysisMode === "single" ? "Account to Analyze" : "Competitor Set"}
            </h3>
            <div>
              <InputLabel>{analysisMode === "single" ? "Instagram Handle" : "Competitor Handles"}</InputLabel>
              <p className="text-sm text-muted mb-3">
                {analysisMode === "single"
                  ? "Enter one handle starting with @ and press Enter."
                  : "Add handles starting with @ and press Enter."}
              </p>
              <CompetitorTagInput 
                value={analysisMode === "single" ? form.watch("competitors").slice(0, 1) : form.watch("competitors")} 
                onChange={(val) => form.setValue("competitors", analysisMode === "single" ? val.slice(-1) : val, { shouldValidate: true })}
                error={form.formState.errors.competitors?.message}
              />
            </div>
          </div>

          {/* Section 3: Analysis Scope */}
          <div className={`rounded-xl border border-line bg-white p-6 shadow-sm ${analysisMode === "chat" ? "hidden" : ""}`}>
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
          <div className={`rounded-xl border border-line bg-white p-6 shadow-sm ${analysisMode === "chat" ? "hidden" : ""}`}>
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
              {analysisMode === "chat" ? "Run agentic analysis" : analysisMode === "single" ? "Run single account analysis" : "Run competitor analysis"}
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

        {analysisMode !== "chat" && (
          <aside className="hidden lg:block">
            <AnalysisSummaryPanel form={form} />
          </aside>
        )}
      </div>
    </div>
  );
}

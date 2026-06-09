import { AnalysisInput, JobStatus, ProgressEvent, Report } from "@/lib/types";
import { buildReport } from "@/lib/report";
import { defaultInput } from "@/lib/analysis-config";

type Job = {
  id: string;
  input: AnalysisInput;
  status: JobStatus;
  report?: Report;
  createdAt: string;
};

const globalForJobs = globalThis as typeof globalThis & {
  instagramAnalysisJobs?: Map<string, Job>;
};

export const jobs = globalForJobs.instagramAnalysisJobs ?? new Map<string, Job>();
globalForJobs.instagramAnalysisJobs = jobs;

export function createJob(input: AnalysisInput) {
  const id = `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  jobs.set(id, {
    id,
    input,
    status: "pending",
    createdAt: new Date().toISOString()
  });
  return id;
}

export function getJob(id: string) {
  return jobs.get(id);
}

export async function completeJob(id: string) {
  const job = jobs.get(id);
  if (!job) return undefined;
  const report = await buildReport(job.input, id);
  const completed = { ...job, status: "completed" as const, report };
  jobs.set(id, completed);
  return completed;
}

export async function getReport(id: string): Promise<Report> {
  const existing = jobs.get(id);
  if (existing?.report) return existing.report;
  if (existing) {
    return (await completeJob(id))?.report ?? buildReport(existing.input, id);
  }
  return buildReport(defaultInput, id);
}

export function getProgressEvents(input: AnalysisInput, reportId: string): ProgressEvent[] {
  const competitors = input.competitors.length ? input.competitors : defaultInput.competitors;
  const competitorEvents = competitors.map((competitor, index) => ({
    status: "running" as const,
    message: `Fetched up to ${input.postsToFetchPerCompetitor} recent ${input.contentType} from ${competitor}`,
    step: 2 + index,
    totalSteps: competitors.length + 6
  }));

  return [
    { status: "running", message: `Job created for ${input.brand}`, step: 1, totalSteps: competitors.length + 6 },
    ...competitorEvents,
    { status: "running", message: "Scoring posts with relative views, engagement, and velocity", step: competitors.length + 2, totalSteps: competitors.length + 6 },
    { status: "running", message: `Selecting top ${input.topPostsToSelect} posts and outliers for creative analysis`, step: competitors.length + 3, totalSteps: competitors.length + 6 },
    { status: "running", message: `Analyzing ${input.reelsToAnalyze} reels for hooks, structure, comments, and brand adaptation`, step: competitors.length + 4, totalSteps: competitors.length + 6 },
    { status: "running", message: "Aggregating competitor patterns into a strategy report", step: competitors.length + 5, totalSteps: competitors.length + 6 },
    { status: "completed", message: "Done. Report ready.", step: competitors.length + 6, totalSteps: competitors.length + 6, reportId }
  ];
}

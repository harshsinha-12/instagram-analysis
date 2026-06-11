import { AnalysisInput, JobStatus, ProgressCallback, Report } from "@/declaration";
import { buildReport } from "@/lib/report";
import { DEFAULT_ANALYSIS_INPUT } from "@/config";

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

export async function completeJob(id: string, onProgress?: ProgressCallback) {
  const job = jobs.get(id);
  if (!job) return undefined;
  jobs.set(id, { ...job, status: "running" });
  const report = await buildReport(job.input, id, onProgress);
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
  return buildReport(DEFAULT_ANALYSIS_INPUT, id);
}

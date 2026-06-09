import { runReportAgent } from "@/__agents__/report-agent";
import { AnalysisInput, ProgressCallback } from "@/lib/types";

export function normalizeHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export async function buildReport(input: AnalysisInput, id = "demo-report", onProgress?: ProgressCallback) {
  return runReportAgent(input, id, onProgress);
}

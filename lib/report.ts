import { runMasterAgent } from "@/__agents__/agent__master";
import { AnalysisInput, ProgressCallback } from "@/declaration";

export function normalizeHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export async function buildReport(input: AnalysisInput, id = "demo-report", onProgress?: ProgressCallback) {
  return runMasterAgent(input, id, onProgress);
}

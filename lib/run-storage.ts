import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Report } from "@/declaration";
import { RUN_OUTPUT_DIR, SAMPLE_REPORT_PATH } from "@/config";

const RUN_OUTPUT_PATH = path.join(process.cwd(), RUN_OUTPUT_DIR);
const SAMPLE_REPORT_FILE_PATH = path.join(process.cwd(), SAMPLE_REPORT_PATH);

export function createRunId() {
  return randomUUID();
}

export async function saveRunJson(payload: unknown, step = 1, runId: string = createRunId(), label?: string) {
  await mkdir(RUN_OUTPUT_PATH, { recursive: true });

  const suffix = label ? `-${label}` : "";
  const filePath = path.join(RUN_OUTPUT_PATH, `${runId}-run-${step}${suffix}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 2));

  return { runId, filePath };
}

export async function loadSampleReportJson(id = "demo-report") {
  try {
    const report = JSON.parse(await readFile(SAMPLE_REPORT_FILE_PATH, "utf8")) as Report;
    return { ...report, id };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

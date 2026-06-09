import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const RUN_OUTPUT_DIR = path.join(process.cwd(), "downloads", "instagram", "runs");

export function createRunId() {
  return randomUUID();
}

export async function saveRunJson(payload: unknown, step = 1, runId = createRunId(), label?: string) {
  await mkdir(RUN_OUTPUT_DIR, { recursive: true });

  const suffix = label ? `-${label}` : "";
  const filePath = path.join(RUN_OUTPUT_DIR, `${runId}-run-${step}${suffix}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 2));

  return { runId, filePath };
}

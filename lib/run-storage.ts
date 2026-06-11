import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { RUN_OUTPUT_DIR } from "@/config";

const RUN_OUTPUT_PATH = path.join(process.cwd(), RUN_OUTPUT_DIR);

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

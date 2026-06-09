import { readFile } from "node:fs/promises";
import path from "node:path";
import { Transcript } from "@/lib/types";
import { getOpenAIModels, transcribeWithOpenAI } from "@/__tools__/openai-client";

export async function transcribeAudio(audioPath?: string): Promise<Transcript | undefined> {
  if (!audioPath) return undefined;

  try {
    const buffer = await readFile(audioPath);
    const file = new Blob([buffer], { type: "audio/wav" });
    const result = await transcribeWithOpenAI(file, path.basename(audioPath));

    return {
      text: result.text || "",
      language: result.language,
      durationSeconds: result.duration,
      provider: "openai",
      model: getOpenAIModels().transcribe
    };
  } catch (error) {
    return {
      text: "",
      provider: "fallback",
      error: error instanceof Error ? error.message : "Unknown transcription error"
    };
  }
}

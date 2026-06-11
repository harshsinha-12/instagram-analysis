import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { ToolDefinition, Transcript } from "@/declaration";
import { getOpenAIModels, transcribeWithOpenAI } from "@/__tools__/tools__openai";

export const TOOL_TRANSCRIBE_AUDIO = "transcribeAudio";

export const TranscribeAudioInputSchema = z.object({
  audioPath: z.string().min(1).optional()
});

export const DEF_TRANSCRIBE_AUDIO: ToolDefinition = {
  type: "function",
  function: {
    name: TOOL_TRANSCRIBE_AUDIO,
    description:
      "Transcribe an extracted Instagram reel audio file into text for creative analysis. Returns a fallback transcript object when the audio path is unavailable or transcription fails.",
    parameters: {
      type: "object",
      properties: {
        audioPath: {
          type: "string",
          description:
            "Local path to the extracted WAV audio file for the Instagram reel."
        }
      },
      required: [],
      additionalProperties: false
    }
  }
};

export async function transcribeAudio(audioPath?: string): Promise<Transcript | undefined> {
  audioPath = TranscribeAudioInputSchema.parse({ audioPath }).audioPath;
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

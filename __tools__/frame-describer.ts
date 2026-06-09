import { readFile } from "node:fs/promises";
import { buildFrameDescriptionPrompt, frameDescriptionSchema } from "@/__prompts__/frame-description";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/openai-client";
import { FrameDescription } from "@/lib/types";

async function imageToDataUrl(framePath: string) {
  const buffer = await readFile(framePath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export async function describeFrame(framePath: string, timestampSeconds: number): Promise<FrameDescription> {
  try {
    const result = await requestStructuredJson<{ description: string }>({
      model: getOpenAIModels().fast,
      prompt: buildFrameDescriptionPrompt(timestampSeconds),
      schemaName: "frame_description",
      schema: frameDescriptionSchema,
      imageDataUrl: await imageToDataUrl(framePath)
    });

    return {
      framePath,
      timestampSeconds,
      description: result.description,
      model: getOpenAIModels().fast
    };
  } catch (error) {
    return {
      framePath,
      timestampSeconds,
      description: "Frame description unavailable.",
      error: error instanceof Error ? error.message : "Unknown frame description error"
    };
  }
}

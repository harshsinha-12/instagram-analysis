import { readFile } from "node:fs/promises";
import { z } from "zod";
import { buildFrameDescriptionPrompt, frameDescriptionSchema } from "@/__prompts__/prompt__frame__description";
import { getOpenAIModels, requestStructuredJson } from "@/__tools__/tools__openai";
import { FrameDescription, ToolDefinition } from "@/declaration";

export const TOOL_DESCRIBE_FRAME = "describeFrame";

export const DescribeFrameInputSchema = z.object({
  framePath: z.string().min(1),
  timestampSeconds: z.number().nonnegative()
});

export const DEF_DESCRIBE_FRAME: ToolDefinition = {
  type: "function",
  function: {
    name: TOOL_DESCRIBE_FRAME,
    description:
      "Describe a sampled Instagram reel frame using vision input, focusing only on visible factual details such as people, setting, text, objects, layout, and style.",
    parameters: {
      type: "object",
      properties: {
        framePath: {
          type: "string",
          description:
            "Local path to the sampled frame image that should be described."
        },
        timestampSeconds: {
          type: "number",
          description:
            "The frame timestamp in seconds from the start of the reel/video."
        }
      },
      required: ["framePath", "timestampSeconds"],
      additionalProperties: false
    }
  }
};

async function imageToDataUrl(framePath: string) {
  const buffer = await readFile(framePath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export async function describeFrame(framePath: string, timestampSeconds: number): Promise<FrameDescription> {
  const input = DescribeFrameInputSchema.parse({ framePath, timestampSeconds });
  framePath = input.framePath;
  timestampSeconds = input.timestampSeconds;

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

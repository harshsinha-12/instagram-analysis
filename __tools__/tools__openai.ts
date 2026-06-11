import {
  DEFAULT_OPENAI_FAST_MODEL,
  DEFAULT_OPENAI_REASONING_MODEL,
  DEFAULT_OPENAI_TRANSCRIBE_MODEL,
  OPENAI_RESPONSES_URL,
  OPENAI_TRANSCRIPTIONS_URL,
  TRANSCRIPTION_PROMPT
} from "@/config";
import { ToolDefinition } from "@/declaration";
import { z } from "zod";

type JsonSchema = Record<string, unknown>;
type OpenAIResponseContent = {
  text?: unknown;
  output_text?: unknown;
};
type OpenAIResponseItem = {
  content?: unknown;
};
type OpenAIResponseBody = {
  output_text?: unknown;
  output?: unknown;
};

export const TOOL_REQUEST_STRUCTURED_JSON = "requestStructuredJson";
export const TOOL_TRANSCRIBE_WITH_OPENAI = "transcribeWithOpenAI";

export const RequestStructuredJsonInputSchema = z.object({
  model: z.string().min(1),
  prompt: z.string().min(1),
  schemaName: z.string().min(1),
  schema: z.record(z.unknown()),
  imageDataUrl: z.string().optional()
});

export const TranscribeWithOpenAIInputSchema = z.object({
  file: z.custom<Blob>(),
  filename: z.string().min(1),
  prompt: z.string().min(1).optional()
});

export const DEF_REQUEST_STRUCTURED_JSON: ToolDefinition = {
  type: "function",
  function: {
    name: TOOL_REQUEST_STRUCTURED_JSON,
    description:
      "Call the OpenAI Responses API with a strict JSON schema and return parsed structured JSON for prompt-driven analysis tasks.",
    parameters: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description:
            "The OpenAI model id to use for the structured JSON request."
        },
        prompt: {
          type: "string",
          description:
            "The full task prompt sent as input text to the Responses API."
        },
        schemaName: {
          type: "string",
          description:
            "Stable schema name sent to the Responses API text.format JSON schema config."
        },
        schema: {
          type: "object",
          description:
            "Strict JSON schema that defines the expected response shape."
        },
        imageDataUrl: {
          type: "string",
          description:
            "Optional image data URL used for vision tasks such as Instagram frame description."
        }
      },
      required: ["model", "prompt", "schemaName", "schema"],
      additionalProperties: false
    }
  }
};

export const DEF_TRANSCRIBE_WITH_OPENAI: ToolDefinition = {
  type: "function",
  function: {
    name: TOOL_TRANSCRIBE_WITH_OPENAI,
    description:
      "Send an audio file to OpenAI audio transcription and return text, language, and duration metadata when available.",
    parameters: {
      type: "object",
      properties: {
        file: {
          type: "object",
          description:
            "Audio file blob to transcribe, usually a WAV file extracted from an Instagram reel."
        },
        filename: {
          type: "string",
          description:
            "Original filename to send with the multipart transcription request."
        },
        prompt: {
          type: "string",
          description:
            "Optional transcription guidance. Use this to preserve social-media language, names, acronyms, slang, and audible mixed-language phrases without summarizing."
        }
      },
      required: ["file", "filename"],
      additionalProperties: false
    }
  }
};

export function getOpenAIModels() {
  return {
    reasoning: process.env.OPENAI_REASONING_MODEL || DEFAULT_OPENAI_REASONING_MODEL,
    fast: process.env.OPENAI_FAST_MODEL || DEFAULT_OPENAI_FAST_MODEL,
    transcribe: process.env.OPENAI_TRANSCRIBE_MODEL || DEFAULT_OPENAI_TRANSCRIBE_MODEL
  };
}

function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

function extractResponseText(data: OpenAIResponseBody): string {
  if (typeof data.output_text === "string") return data.output_text;

  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const responseItem = item as OpenAIResponseItem;
    const contentItems = Array.isArray(responseItem.content) ? responseItem.content : [];
    for (const contentItem of contentItems) {
      const content = contentItem as OpenAIResponseContent;
      if (typeof content.text === "string") return content.text;
      if (typeof content.output_text === "string") return content.output_text;
    }
  }

  return "";
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenAI response did not contain JSON.");
    return JSON.parse(match[0]);
  }
}

export async function requestStructuredJson<T>(params: {
  model: string;
  prompt: string;
  schemaName: string;
  schema: JsonSchema;
  imageDataUrl?: string;
}): Promise<T> {
  params = RequestStructuredJsonInputSchema.parse(params) as typeof params;
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const content: Array<Record<string, unknown>> = [{ type: "input_text", text: params.prompt }];
  if (params.imageDataUrl) {
    content.push({ type: "input_image", image_url: params.imageDataUrl });
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: params.model,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: params.schemaName,
          schema: params.schema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI Responses request failed: ${response.status} ${response.statusText} ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  return parseJsonObject(extractResponseText(data)) as T;
}

export async function transcribeWithOpenAI(file: Blob, filename: string, prompt = TRANSCRIPTION_PROMPT) {
  const input = TranscribeWithOpenAIInputSchema.parse({ file, filename, prompt });
  file = input.file;
  filename = input.filename;
  prompt = input.prompt || TRANSCRIPTION_PROMPT;

  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const formData = new FormData();
  formData.append("model", getOpenAIModels().transcribe);
  formData.append("file", file, filename);
  formData.append("prompt", prompt);

  const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI transcription failed: ${response.status} ${response.statusText} ${body.slice(0, 500)}`);
  }

  return response.json() as Promise<{ text?: string; language?: string; duration?: number }>;
}

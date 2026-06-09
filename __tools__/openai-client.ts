type JsonSchema = Record<string, unknown>;

const RESPONSES_URL = "https://api.openai.com/v1/responses";
const TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";

export function getOpenAIModels() {
  return {
    reasoning: process.env.OPENAI_REASONING_MODEL || "gpt-5.5",
    fast: process.env.OPENAI_FAST_MODEL || "gpt-5.5-mini",
    transcribe: process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe"
  };
}

function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

function extractResponseText(data: any): string {
  if (typeof data.output_text === "string") return data.output_text;

  const output = data.output ?? [];
  for (const item of output) {
    for (const content of item.content ?? []) {
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
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const content: Array<Record<string, unknown>> = [{ type: "input_text", text: params.prompt }];
  if (params.imageDataUrl) {
    content.push({ type: "input_image", image_url: params.imageDataUrl });
  }

  const response = await fetch(RESPONSES_URL, {
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

export async function transcribeWithOpenAI(file: Blob, filename: string) {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const formData = new FormData();
  formData.append("model", getOpenAIModels().transcribe);
  formData.append("file", file, filename);

  const response = await fetch(TRANSCRIPTIONS_URL, {
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

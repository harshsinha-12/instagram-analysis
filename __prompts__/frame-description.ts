export const frameDescriptionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["description"],
  properties: {
    description: { type: "string" }
  }
};

export function buildFrameDescriptionPrompt(timestampSeconds: number) {
  return `Describe this Instagram reel frame at ${timestampSeconds}s in 1-2 factual sentences.

Focus on visible people, setting, on-screen text, graphics, objects, layout, and visual style.
Do not infer strategy or performance.`;
}

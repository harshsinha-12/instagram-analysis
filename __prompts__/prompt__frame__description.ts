export const frameDescriptionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["description"],
  properties: {
    description: { type: "string" }
  }
};

export function buildFrameDescriptionPrompt(timestampSeconds: number) {
  return `Describe this Instagram video or post frame at ${timestampSeconds}s in 2-3 factual sentences.

Focus on visible people, setting, on-screen text, graphics, objects, layout, editing style, brand cues, product cues, and any action happening in the frame.
Mention exact visible text when readable.
Do not infer strategy or performance. Stay factual so another analyst can use this as evidence later.`;
}

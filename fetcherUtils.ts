export function normalizeHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function extractInstagramUsername(input: string) {
  if (input.startsWith("@")) return input.slice(1);
  if (!input.startsWith("http")) return input;

  const url = new URL(input);
  const username = url.pathname.split("/").filter(Boolean)[0];
  if (!username) throw new Error(`Could not extract username from ${input}`);

  return username;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getErrorMessage(error: unknown, fallback = "Unknown error") {
  return error instanceof Error ? error.message : fallback;
}

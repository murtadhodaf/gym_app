/**
 * Thin wrapper around Anthropic Messages API using raw fetch.
 * No SDK required — avoids the need to install @ai-sdk/anthropic in the build env.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
}

/**
 * Call Anthropic and return the first text content block.
 * Throws on non-2xx responses.
 */
export async function callAnthropic(
  messages: AnthropicMessage[],
  opts: AnthropicOptions = {}
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const body: Record<string, unknown> = {
    model: opts.model ?? "claude-haiku-4-5-20251001",
    max_tokens: opts.maxTokens ?? 4096,
    messages,
  };
  if (opts.system) body.system = opts.system;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const block = data.content?.[0];
  if (block?.type === "text") return block.text as string;
  throw new Error("No text content in Anthropic response");
}

/** Parse a JSON response from the LLM, stripping any markdown fences. */
export function parseJsonResponse<T>(text: string): T {
  // Strip ```json ... ``` fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as T;
}

import "server-only";

// Minimal OpenAI Responses API client.
//
// No SDK: this is one POST with a JSON body. Pulling in a package to build it
// would add weight without removing any of the code that matters — the schema,
// the clamping, and the failure handling all live in product-analysis.ts.

const ENDPOINT = "https://api.openai.com/v1/responses";

/**
 * gpt-5.5 is the default because it is the only model tested here that
 * declines to invent a price when the file gives no basis for one — cheaper
 * tiers confidently returned made-up taka figures. Override per environment
 * if that trade-off changes.
 */
const DEFAULT_MODEL = "gpt-5.5";

/** Well past the ~3-6s observed, short enough to fail before the route does. */
const REQUEST_TIMEOUT_MS = 45_000;

export class AiUnavailableError extends Error {}
export class AiRequestError extends Error {}

export function getAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

/** Whether the feature can run at all. Callers degrade to manual entry. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export interface ResponsesInputPart {
  type: "input_text" | "input_image" | "input_file";
  text?: string;
  image_url?: string;
  filename?: string;
  file_data?: string;
  detail?: "auto" | "low" | "high";
}

export interface StructuredResponse {
  text: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

interface ResponsesBody {
  error?: { message?: string } | null;
  status?: string;
  incomplete_details?: { reason?: string };
  output?: { content?: { type?: string; text?: string }[] | null }[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

/**
 * Ask for a response that conforms to `schema`, and return the raw JSON text.
 *
 * Parsing and validating is the caller's job — a strict schema constrains the
 * shape but says nothing about whether the contents are usable.
 */
export async function requestStructured(input: {
  parts: ResponsesInputPart[];
  schemaName: string;
  schema: Record<string, unknown>;
}): Promise<StructuredResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new AiUnavailableError("OPENAI_API_KEY is not set.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getAiModel(),
        input: [{ role: "user", content: input.parts }],
        // Low effort is deliberate: this is extraction, not reasoning, and
        // the creator is waiting on it.
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: input.schemaName,
            strict: true,
            schema: input.schema,
          },
        },
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiRequestError("Timed out reading the file.");
    }
    throw new AiRequestError(
      error instanceof Error ? error.message : "Network error.",
    );
  } finally {
    clearTimeout(timeout);
  }

  let body: ResponsesBody;
  try {
    body = (await response.json()) as ResponsesBody;
  } catch {
    throw new AiRequestError(`Unreadable response (HTTP ${response.status}).`);
  }

  if (!response.ok || body.error) {
    // Provider wording is for our logs only — callers map this to their own
    // user-facing copy.
    throw new AiRequestError(
      body.error?.message ?? `Request failed (HTTP ${response.status}).`,
    );
  }

  if (body.status === "incomplete") {
    throw new AiRequestError(
      `Response cut short (${body.incomplete_details?.reason ?? "unknown"}).`,
    );
  }

  const text = (body.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((part) => part?.type === "output_text")
    .map((part) => part.text ?? "")
    .join("");

  if (!text.trim()) throw new AiRequestError("Empty response.");

  return {
    text,
    inputTokens: body.usage?.input_tokens ?? null,
    outputTokens: body.usage?.output_tokens ?? null,
  };
}

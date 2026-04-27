"use server";

import { handleIsTaken } from "@/db/queries/creators";
import { normalizeHandle, validateHandle } from "@/lib/handle";

export interface CheckHandleResult {
  available: boolean;
  reason?: string;
  normalized: string;
}

/**
 * Live availability check for a candidate handle.
 * Called from the client as the user types (debounced).
 * Never throws — returns a structured result for the form to render.
 */
export async function checkHandle(input: string): Promise<CheckHandleResult> {
  const normalized = normalizeHandle(input);
  const validation = validateHandle(normalized);
  if (!validation.ok) {
    return { available: false, reason: validation.reason, normalized };
  }
  const taken = await handleIsTaken(normalized);
  if (taken) {
    return {
      available: false,
      reason: "That handle is already taken.",
      normalized,
    };
  }
  return { available: true, normalized };
}

"use server";

import { redirect } from "next/navigation";

import {
  clearLibraryAccess,
  findSupporterByLibraryCode,
  grantLibraryAccess,
} from "@/lib/library-codes";

export interface LibraryCodeState {
  error: string | null;
}

function safeLibraryPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/library";
  if (
    !value.startsWith("/library") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/library";
  }
  return value;
}

export async function openLibraryWithCode(
  _previous: LibraryCodeState,
  formData: FormData,
): Promise<LibraryCodeState> {
  const rawCode = formData.get("code");
  const code = typeof rawCode === "string" ? rawCode.trim() : "";
  if (!code) return { error: "Enter your Library Code." };

  const supporter = await findSupporterByLibraryCode(code);
  if (!supporter) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return { error: "That code was not found. Check it and try again." };
  }

  await grantLibraryAccess(supporter.id);
  redirect(safeLibraryPath(formData.get("next")));
}

export async function forgetLibraryCode(): Promise<void> {
  await clearLibraryAccess();
  redirect("/library?code=1");
}

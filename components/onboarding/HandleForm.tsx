"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  claimHandle,
  type ClaimHandleState,
} from "@/app/onboarding/_actions/claim-handle";
import { SITE_HOST } from "@/lib/site";
import {
  checkHandle,
  type CheckHandleResult,
} from "@/app/onboarding/_actions/check-handle";
import { normalizeHandle, validateHandle } from "@/lib/handle";

const initialState: ClaimHandleState = { ok: false };

type LiveStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available"; normalized: string }
  | { kind: "unavailable"; reason: string };

function deriveLocalStatus(value: string): LiveStatus {
  const normalized = normalizeHandle(value);
  if (!normalized) return { kind: "idle" };
  const validation = validateHandle(normalized);
  if (!validation.ok) {
    return { kind: "unavailable", reason: validation.reason ?? "Invalid handle." };
  }
  return { kind: "checking" };
}

export default function HandleForm() {
  const [state, formAction, isPending] = useActionState(
    claimHandle,
    initialState,
  );
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<LiveStatus>({ kind: "idle" });

  const normalized = useMemo(() => normalizeHandle(value), [value]);

  useEffect(() => {
    const local = deriveLocalStatus(value);
    setStatus(local);
    if (local.kind !== "checking") return;

    let cancelled = false;
    const t = setTimeout(() => {
      startTransition(async () => {
        const result: CheckHandleResult = await checkHandle(value);
        if (cancelled) return;
        if (result.available) {
          setStatus({ kind: "available", normalized: result.normalized });
        } else {
          setStatus({
            kind: "unavailable",
            reason: result.reason ?? "Not available.",
          });
        }
      });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  const previewHandle = normalized || "yourname";
  const canSubmit =
    status.kind === "available" && !isPending && normalized.length > 0;

  const helper = (() => {
    if (state.error && !isPending) return { tone: "error", text: state.error };
    switch (status.kind) {
      case "idle":
        return {
          tone: "muted",
          text: "Lowercase letters, numbers, hyphens, or underscores. 2–30 characters.",
        };
      case "checking":
        return { tone: "muted", text: "Checking availability…" };
      case "available":
        return { tone: "success", text: "Handle is available." };
      case "unavailable":
        return { tone: "error", text: status.reason };
    }
  })();

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="handle" value={normalized} />

      <div>
        <label
          htmlFor="handle-input"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Your handle
        </label>
        <div className="flex items-stretch rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white focus-within:border-[#0e0f0c] transition-colors overflow-hidden">
          <span className="px-4 inline-flex items-center text-[15px] font-medium text-[#868685] bg-[#f7f9f5] border-r border-[rgba(14,15,12,0.08)] whitespace-nowrap">
            {SITE_HOST}/
          </span>
          <input
            id="handle-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={value}
            onChange={onChange}
            placeholder="yourname"
            disabled={isPending}
            aria-describedby="handle-helper"
            className="flex-1 px-4 h-12 text-[15px] font-semibold text-[#0e0f0c] placeholder:text-[#868685] outline-none disabled:opacity-60"
          />
        </div>
        <p
          id="handle-helper"
          className={[
            "mt-2 text-[13px] leading-[1.5]",
            helper.tone === "error"
              ? "text-[#da291c]"
              : helper.tone === "success"
                ? "text-[#163300] font-semibold"
                : "text-[#868685]",
          ].join(" ")}
          role={helper.tone === "error" ? "alert" : undefined}
        >
          {helper.text}
        </p>
      </div>

      <div className="rounded-2xl bg-[#f7f9f5] border border-[rgba(14,15,12,0.06)] px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685] mb-1">
          Preview
        </p>
        <p className="text-[15px] font-medium text-[#0e0f0c] tabular-nums">
          {SITE_HOST}/
          <span className="text-[#163300]">{previewHandle}</span>
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-12 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isPending ? "Saving…" : "Claim handle"}
        {!isPending && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

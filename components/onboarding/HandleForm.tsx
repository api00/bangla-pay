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
  // Only the *server* answer lives in state. The local verdict (too short,
  // bad characters, reserved) is a pure function of `value`, so deriving it
  // during render keeps the two from fighting and removes a render cascade:
  // the old effect pushed the local verdict into state on every keystroke.
  const [remoteStatus, setRemoteStatus] = useState<LiveStatus | null>(null);

  const normalized = useMemo(() => normalizeHandle(value), [value]);
  const localStatus = useMemo(() => deriveLocalStatus(value), [value]);

  // A server answer only counts while the local verdict still says "checking";
  // any edit that changes the local verdict supersedes it immediately.
  const status: LiveStatus =
    localStatus.kind === "checking" ? remoteStatus ?? localStatus : localStatus;

  useEffect(() => {
    const local = deriveLocalStatus(value);
    if (local.kind !== "checking") return;

    let cancelled = false;
    const t = setTimeout(() => {
      startTransition(async () => {
        const result: CheckHandleResult = await checkHandle(value);
        if (cancelled) return;
        if (result.available) {
          setRemoteStatus({
            kind: "available",
            normalized: result.normalized,
          });
        } else {
          setRemoteStatus({
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
    // Drop the previous server answer — it described the old handle.
    setRemoteStatus(null);
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
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark mb-2"
        >
          Your handle
        </label>
        <div className="flex items-stretch rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white focus-within:border-near-black transition-colors overflow-hidden">
          <span className="px-4 inline-flex items-center text-[15px] font-medium text-gray bg-off-white border-r border-[rgba(14,15,12,0.08)] whitespace-nowrap">
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
            className="flex-1 px-4 h-12 text-[15px] font-semibold text-near-black placeholder:text-gray outline-none disabled:opacity-60"
          />
        </div>
        <p
          id="handle-helper"
          className={[
            "mt-2 text-[13px] leading-[1.5]",
            helper.tone === "error"
              ? "text-heritage-red"
              : helper.tone === "success"
                ? "text-dark-green font-semibold"
                : "text-gray",
          ].join(" ")}
          role={helper.tone === "error" ? "alert" : undefined}
        >
          {helper.text}
        </p>
      </div>

      <div className="rounded-2xl bg-off-white border border-[rgba(14,15,12,0.06)] px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray mb-1">
          Preview
        </p>
        <p className="text-[15px] font-medium text-near-black tabular-nums">
          {SITE_HOST}/
          <span className="text-dark-green">{previewHandle}</span>
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-12 rounded-full bg-wise-green text-dark-green font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isPending ? "Saving…" : "Claim handle"}
        {!isPending && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

"use client";

import {
  useActionState,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  startTip,
  type StartTipState,
} from "@/app/[handle]/_actions/start-tip";
import type { TipPreset } from "@/db/schema";
import { formatTaka, parseTakaInput } from "@/lib/money";

import ChaVisual from "./ChaVisual";

const initialState: StartTipState = { ok: false };

interface TipJarProps {
  handle: string;
  displayName: string;
  themeColor: string;
  chaLabel: string;
  chaEmoji: string;
  /** One cha = N paisa (default 5000 → ৳50). Drives the cup fill curve. */
  chaUnitPaisa?: number;
  bnNumerals: boolean;
  presets: TipPreset[];
}

const FALLBACK_PRESETS: Pick<TipPreset, "amountPaisa" | "label">[] = [
  { amountPaisa: 5_000, label: "1 cha" },
  { amountPaisa: 10_000, label: "5 cha" },
  { amountPaisa: 50_000, label: "25 cha" },
];

export default function TipJar({
  handle,
  displayName,
  themeColor,
  chaLabel,
  chaEmoji,
  chaUnitPaisa = 5_000,
  bnNumerals,
  presets,
}: TipJarProps) {
  const presetList = presets.length > 0 ? presets : FALLBACK_PRESETS;
  const [state, formAction, isPending] = useActionState(
    startTip,
    initialState,
  );
  const [selectedPaisa, setSelectedPaisa] = useState<number>(
    presetList[0]?.amountPaisa ?? 5_000,
  );
  const [customRaw, setCustomRaw] = useState("");
  const [isInteracting, setIsInteracting] = useState(false);

  const customPaisa = useMemo(() => parseTakaInput(customRaw), [customRaw]);
  const isCustom = selectedPaisa === 0;
  const effectivePaisa = isCustom ? customPaisa ?? 0 : selectedPaisa;

  function pickPreset(amountPaisa: number) {
    setSelectedPaisa(amountPaisa);
    // Clearing here rather than in an effect keyed on isCustom: the field is
    // only ever emptied by choosing a preset, so the event is the honest place
    // for it and it avoids a second render pass.
    setCustomRaw("");
    flashInteraction();
  }

  function pickCustom() {
    setSelectedPaisa(0);
  }

  function onCustomChange(event: ChangeEvent<HTMLInputElement>) {
    setCustomRaw(event.target.value);
    flashInteraction();
  }

  function flashInteraction() {
    setIsInteracting(true);
    window.setTimeout(() => setIsInteracting(false), 320);
  }

  const ctaLabel = effectivePaisa
    ? `Buy ${displayName} a ${chaLabel} · ${formatTaka(effectivePaisa, { bengaliNumerals: bnNumerals })}`
    : `Buy ${displayName} a ${chaLabel}`;

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-[rgba(14,15,12,0.08)] bg-white p-5 sm:p-7 shadow-[0_2px_0_0_rgba(14,15,12,0.04),0_30px_80px_-40px_rgba(14,15,12,0.18)]"
    >
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="amount_paisa" value={selectedPaisa} />

      {/* Hero visual — fills, scales, steams as the supporter chooses more */}
      <div className="-mt-2 mb-3 flex justify-center" aria-hidden>
        <ChaVisual
          amountPaisa={effectivePaisa}
          chaUnitPaisa={chaUnitPaisa}
          themeColor={themeColor}
          bnNumerals={bnNumerals}
          isInteracting={isInteracting}
        />
      </div>

      <h2 className="text-center text-[18px] font-bold text-[#0e0f0c] mb-1 flex items-center justify-center gap-2">
        <span aria-hidden className="text-[18px]">
          {chaEmoji}
        </span>
        Buy {displayName} a {chaLabel}
      </h2>
      <p className="text-center text-[13px] text-[#868685] mb-5">
        Pick an amount or write your own.
      </p>

      {/* Preset grid */}
      <div
        role="group"
        aria-label="Tip amount"
        className="grid grid-cols-3 gap-2 sm:gap-3 mb-3"
      >
        {presetList.map((preset, idx) => {
          const isActive = selectedPaisa === preset.amountPaisa;
          return (
            <button
              key={preset.amountPaisa + ":" + idx}
              type="button"
              aria-pressed={isActive}
              onClick={() => pickPreset(preset.amountPaisa)}
              className={[
                "h-14 rounded-2xl border-[1.5px] text-left px-3 transition-all flex flex-col justify-center",
                isActive
                  ? "border-[#0e0f0c] bg-[#f7f9f5] shadow-[0_1px_0_0_rgba(14,15,12,0.06),0_8px_22px_-12px_rgba(14,15,12,0.18)]"
                  : "border-[rgba(14,15,12,0.10)] bg-white hover:border-[#454745]",
              ].join(" ")}
            >
              <span className="text-[15px] font-semibold text-[#0e0f0c] tabular-nums">
                {formatTaka(preset.amountPaisa, {
                  bengaliNumerals: bnNumerals,
                })}
              </span>
              {preset.label && (
                <span className="text-[11px] font-medium text-[#868685]">
                  {preset.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom amount */}
      <div className="mb-5">
        <button
          type="button"
          aria-pressed={isCustom}
          onClick={pickCustom}
          className={[
            "w-full h-14 rounded-2xl border-[1.5px] flex items-center transition-colors",
            isCustom
              ? "border-[#0e0f0c] bg-[#f7f9f5]"
              : "border-[rgba(14,15,12,0.10)] bg-white hover:border-[#454745]",
          ].join(" ")}
        >
          <span className="px-4 text-[#868685]" aria-hidden>
            ৳
          </span>
          <input
            type="text"
            inputMode="decimal"
            name="custom_amount"
            placeholder="Custom amount"
            value={customRaw}
            onChange={onCustomChange}
            onFocus={pickCustom}
            disabled={isPending}
            aria-label="Custom tip amount in taka"
            className="flex-1 h-full text-[15px] font-semibold text-[#0e0f0c] placeholder:text-[#868685] bg-transparent outline-none disabled:opacity-60"
          />
        </button>
      </div>

      {/* Supporter name + message */}
      <div className="space-y-3 mb-5">
        <input
          type="text"
          name="supporter_name"
          placeholder="Your name (optional)"
          maxLength={60}
          disabled={isPending}
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.10)] bg-white text-[14px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors disabled:opacity-60"
        />
        <textarea
          name="message"
          rows={3}
          maxLength={500}
          placeholder="Say something nice (optional)"
          disabled={isPending}
          className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.10)] bg-white text-[14px] text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors disabled:opacity-60 resize-none leading-[1.5]"
        />
        <label className="flex items-center gap-2 text-[13px] text-[#454745] select-none cursor-pointer">
          <input
            type="checkbox"
            name="message_is_public"
            defaultChecked
            disabled={isPending}
            className="w-4 h-4 rounded border-[#454745] accent-[#163300]"
          />
          Show my message on {displayName}&rsquo;s page
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending || effectivePaisa <= 0}
        className="w-full h-12 rounded-full font-semibold text-[15px] text-[#163300] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.18),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ backgroundColor: themeColor }}
      >
        {isPending ? "Preparing checkout…" : ctaLabel}
        {!isPending && <span aria-hidden>→</span>}
      </button>

      {state.error && (
        <p
          role="alert"
          className={[
            "mt-4 text-[13px] leading-[1.55]",
            state.ok
              ? "text-[#454745]"
              : "text-[#da291c] font-medium",
          ].join(" ")}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}

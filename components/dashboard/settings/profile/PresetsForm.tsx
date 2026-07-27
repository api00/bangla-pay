"use client";

import { useActionState, useState } from "react";

import {
  updateTipPresets,
  type UpdatePresetsState,
} from "@/app/dashboard/settings/profile/_actions";
import Card from "@/components/dashboard/settings/Card";
import Field, { inputClass } from "@/components/dashboard/settings/Field";
import SaveBadge from "@/components/dashboard/settings/SaveBadge";
import SubmitButton from "@/components/dashboard/settings/SubmitButton";
import type { TipPreset } from "@/db/schema";

const initialState: UpdatePresetsState = { ok: false };
const MAX_PRESETS = 6;
const FALLBACK = ["50", "100", "500"];

interface PresetsFormProps {
  presets: TipPreset[];
}

export default function PresetsForm({ presets }: PresetsFormProps) {
  const [state, formAction] = useActionState(updateTipPresets, initialState);

  const initial =
    presets.length > 0
      ? presets.map((p) => (p.amountPaisa / 100).toString())
      : FALLBACK;

  const [values, setValues] = useState<string[]>(initial);

  const setAt = (idx: number, v: string) => {
    setValues((prev) => prev.map((x, i) => (i === idx ? v : x)));
  };

  const addOne = () => {
    if (values.length >= MAX_PRESETS) return;
    setValues((prev) => [...prev, ""]);
  };

  const removeAt = (idx: number) => {
    setValues((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <form action={formAction}>
      <Card
        title="Tip presets"
        description="The default amounts shown on your tip jar. Up to 6."
        footer={
          <>
            <SaveBadge savedAt={state.savedAt} error={state.error} />
            <SubmitButton label="Save presets" />
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {values.map((v, i) => (
            <Field key={i} label={`Preset ${i + 1} (taka)`} htmlFor={`preset_${i}`}>
              <div className="flex items-center gap-2">
                <input
                  id={`preset_${i}`}
                  name={`preset_${i}`}
                  value={v}
                  onChange={(e) => setAt(i, e.target.value)}
                  inputMode="numeric"
                  placeholder="100"
                  className={inputClass}
                />
                {values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="h-11 w-11 shrink-0 rounded-2xl border border-[rgba(14,15,12,0.1)] text-warm-dark hover:border-near-black hover:text-near-black transition-colors"
                    aria-label="Remove preset"
                  >
                    ×
                  </button>
                )}
              </div>
            </Field>
          ))}
        </div>
        {values.length < MAX_PRESETS && (
          <button
            type="button"
            onClick={addOne}
            className="mt-4 text-[13px] font-semibold text-dark-green underline underline-offset-4 decoration-wise-green decoration-[2px] hover:decoration-pastel-green"
          >
            + Add preset
          </button>
        )}
      </Card>
    </form>
  );
}

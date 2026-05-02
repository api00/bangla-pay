"use client";

import { useState, type ChangeEvent } from "react";

interface ThemeColorPickerProps {
  name: string;
  defaultValue: string;
  /** Optional id for the form label association. */
  id?: string;
}

// Curated palette — drawn from BanglaPay's design language plus warm/cool
// accents that look great as button backgrounds.
const PRESETS: Array<{ value: string; label: string }> = [
  { value: "#9fe870", label: "Wise green" },
  { value: "#cdffad", label: "Pastel green" },
  { value: "#054d28", label: "Forest" },
  { value: "#e2f6d5", label: "Mint" },
  { value: "#da291c", label: "Heritage red" },
  { value: "#ff8a65", label: "Coral" },
  { value: "#ffd166", label: "Marigold" },
  { value: "#ffe5b4", label: "Cream" },
  { value: "#7dd3fc", label: "Sky" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#ec4899", label: "Hibiscus" },
  { value: "#0e0f0c", label: "Near-black" },
];

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function normalize(hex: string): string {
  const trimmed = hex.trim().toLowerCase();
  if (!trimmed) return "#9fe870";
  return HEX_REGEX.test(trimmed) ? trimmed : "#9fe870";
}

export default function ThemeColorPicker({
  name,
  defaultValue,
  id,
}: ThemeColorPickerProps) {
  const [color, setColor] = useState(normalize(defaultValue));
  const [text, setText] = useState(color);

  function setBoth(next: string) {
    const safe = normalize(next);
    setColor(safe);
    setText(safe);
  }

  function onTextChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setText(value);
    if (HEX_REGEX.test(value.trim())) {
      setColor(value.trim().toLowerCase());
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden form input — name matches the existing action's expected key */}
      <input type="hidden" name={name} value={color} />

      {/* Live preview + native picker + hex input */}
      <div className="flex items-center gap-3">
        <label
          className="relative inline-flex items-center justify-center w-14 h-14 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgba(14,15,12,0.12),0_8px_22px_-12px_rgba(14,15,12,0.18)] cursor-pointer overflow-hidden"
          style={{ backgroundColor: color }}
          aria-label="Pick a color"
        >
          <input
            id={id}
            type="color"
            value={color}
            onChange={(e) => setBoth(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        <div className="flex-1 flex items-center gap-2 h-12 px-3 rounded-2xl border border-[rgba(14,15,12,0.1)] bg-white focus-within:border-[#163300] transition-colors">
          <span className="text-[#868685] tabular-nums text-[13px] font-mono">
            HEX
          </span>
          <input
            type="text"
            value={text}
            onChange={onTextChange}
            onBlur={() => setBoth(text)}
            maxLength={7}
            className="flex-1 h-full bg-transparent text-[14px] font-mono text-[#0e0f0c] outline-none uppercase tabular-nums"
          />
        </div>
      </div>

      {/* Curated palette */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#868685] mb-2">
          Suggested
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {PRESETS.map((preset) => {
            const isActive = preset.value === color;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setBoth(preset.value)}
                aria-label={preset.label}
                title={preset.label}
                className={[
                  "relative w-9 h-9 rounded-full transition-transform",
                  isActive
                    ? "ring-2 ring-[#0e0f0c] ring-offset-2 ring-offset-white scale-105"
                    : "ring-1 ring-[rgba(14,15,12,0.08)] hover:scale-110",
                ].join(" ")}
                style={{ backgroundColor: preset.value }}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center text-[12px] font-bold"
                    style={{
                      color: needsDarkText(preset.value) ? "#0e0f0c" : "#fff",
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Rough perceived-luminance check so we draw the active checkmark in a
 *  legible color over both light and dark swatches. */
function needsDarkText(hex: string): boolean {
  const m = HEX_REGEX.exec(hex);
  if (!m) return true;
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  // sRGB luminance approximation
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6;
}

"use client";

import { useMemo, useState, type ChangeEvent } from "react";

interface ChaEmojiPickerProps {
  name: string;
  defaultValue: string;
  id?: string;
}

interface EmojiCategory {
  label: string;
  emojis: string[];
}

// Curated by hand — heavy on cha/food/sweet vibes with a Bangla cultural
// thread (lotus, hibiscus, peacock, marigold) plus warm hearts and sparkles.
const CATEGORIES: EmojiCategory[] = [
  {
    label: "Cha & drinks",
    emojis: ["☕", "🍵", "🧋", "🥤", "🍶", "🥃", "🍷", "🧉"],
  },
  {
    label: "Sweet stuff",
    emojis: ["🍰", "🧁", "🍩", "🍪", "🍫", "🍯", "🍡", "🥮"],
  },
  {
    label: "Bangla vibes",
    emojis: ["🌹", "🪷", "🌺", "🌻", "🦚", "🥥", "🌿", "🍃"],
  },
  {
    label: "Hearts",
    emojis: ["❤️", "🩷", "💛", "💚", "💜", "🤎", "💖", "💝"],
  },
  {
    label: "Sparkle",
    emojis: ["⭐", "🌟", "✨", "💫", "🌠", "🎉", "🎊", "🪄"],
  },
  {
    label: "Nature",
    emojis: ["🌸", "🌷", "🌼", "🌱", "🌳", "🌴", "🍀", "🪴"],
  },
];

export default function ChaEmojiPicker({
  name,
  defaultValue,
  id,
}: ChaEmojiPickerProps) {
  const [value, setValue] = useState(defaultValue || "☕");
  const [custom, setCustom] = useState(
    isCurated(defaultValue) ? "" : defaultValue ?? "",
  );

  const allCurated = useMemo(
    () => CATEGORIES.flatMap((c) => c.emojis),
    [],
  );

  function pick(emoji: string) {
    setValue(emoji);
    setCustom("");
  }

  function onCustomChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.slice(0, 4);
    setCustom(next);
    if (next.trim()) setValue(next.trim());
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={value} />

      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#cdffad] to-[#e2f6d5] flex items-center justify-center text-[28px] shadow-[0_0_0_1px_rgba(14,15,12,0.06)]"
        >
          {value}
        </div>
        <div className="text-[13px] text-[#454745] leading-[1.5]">
          <div className="text-[#0e0f0c] font-semibold">Pick your icon</div>
          <div className="text-[12px] text-[#868685]">
            Used on your tip jar button & supporter notes.
          </div>
        </div>
      </div>

      <div id={id} className="space-y-3">
        {CATEGORIES.map((category) => (
          <div key={category.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#868685] mb-1.5">
              {category.label}
            </p>
            <div className="grid grid-cols-8 gap-1.5">
              {category.emojis.map((emoji) => {
                const isActive = emoji === value;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => pick(emoji)}
                    aria-label={emoji}
                    aria-pressed={isActive}
                    className={[
                      "w-full aspect-square rounded-xl text-[20px] flex items-center justify-center transition-all",
                      isActive
                        ? "bg-[#163300] text-white scale-105 shadow-[0_8px_22px_-12px_rgba(22,51,0,0.6)]"
                        : "bg-white border border-[rgba(14,15,12,0.06)] hover:border-[#0e0f0c] hover:scale-105",
                    ].join(" ")}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.1)] bg-[#f7f9f5] px-4 py-3">
        <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#868685] mb-1.5">
          Or use any emoji
        </label>
        <input
          type="text"
          value={custom}
          onChange={onCustomChange}
          placeholder="Paste any emoji"
          maxLength={4}
          className="w-full h-10 px-3 rounded-xl border border-[rgba(14,15,12,0.1)] bg-white text-[16px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#163300] transition-colors"
        />
        <p className="text-[11px] text-[#868685] mt-1.5 leading-[1.4]">
          Paste any emoji from your keyboard (e.g. 🦋, 🪕, 🥟). Up to 4 characters.
        </p>
      </div>
    </div>
  );

  function isCurated(emoji: string): boolean {
    return allCurated.includes(emoji);
  }
}

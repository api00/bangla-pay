"use client";

import { useState, type ChangeEvent } from "react";

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
    label: "Sweet",
    emojis: ["🍰", "🧁", "🍩", "🍪", "🍫", "🍯", "🍡", "🥮"],
  },
  {
    label: "Bangla",
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

// Module-scope so the hooks below never see it in TDZ.
const ALL_CURATED = new Set(CATEGORIES.flatMap((c) => c.emojis));

function isCurated(emoji: string | undefined | null): boolean {
  return Boolean(emoji && ALL_CURATED.has(emoji));
}

function findCategoryIndexFor(emoji: string): number {
  const idx = CATEGORIES.findIndex((c) => c.emojis.includes(emoji));
  return idx >= 0 ? idx : 0;
}

export default function ChaEmojiPicker({
  name,
  defaultValue,
  id,
}: ChaEmojiPickerProps) {
  const seed = defaultValue || "☕";
  const [value, setValue] = useState(seed);
  const [custom, setCustom] = useState(
    isCurated(defaultValue) ? "" : (defaultValue ?? ""),
  );
  const [activeCategory, setActiveCategory] = useState<number>(
    findCategoryIndexFor(seed),
  );
  const [showCustom, setShowCustom] = useState(false);

  function pick(emoji: string) {
    setValue(emoji);
    setCustom("");
  }

  function onCustomChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.slice(0, 4);
    setCustom(next);
    if (next.trim()) setValue(next.trim());
  }

  const category = CATEGORIES[activeCategory];

  return (
    <div className="rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white overflow-hidden">
      <input type="hidden" name={name} value={value} />

      {/* Selected preview header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-[#f7f9f5] border-b border-[rgba(14,15,12,0.05)]">
        <div
          aria-hidden
          className="w-14 h-14 rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] flex items-center justify-center text-[30px] shadow-[0_1px_0_0_rgba(14,15,12,0.04)]"
        >
          {value}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#868685]">
            Currently using
          </div>
          <div className="text-[14px] font-semibold text-[#0e0f0c] truncate mt-0.5">
            {isCurated(value)
              ? CATEGORIES[findCategoryIndexFor(value)].label
              : "Custom emoji"}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div
        id={id}
        role="tablist"
        aria-label="Emoji categories"
        className="flex gap-1 px-3 pt-3 pb-2 overflow-x-auto"
      >
        {CATEGORIES.map((cat, idx) => {
          const isActive = idx === activeCategory;
          return (
            <button
              key={cat.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(idx)}
              className={[
                "shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap",
                isActive
                  ? "bg-[#0e0f0c] text-white"
                  : "text-[#454745] hover:bg-[#f2f6ec] hover:text-[#0e0f0c]",
              ].join(" ")}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active category grid */}
      <div className="grid grid-cols-8 gap-1.5 px-3 pb-3" role="tabpanel">
        {category?.emojis.map((emoji) => {
          const isActive = emoji === value;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => pick(emoji)}
              aria-label={emoji}
              aria-pressed={isActive}
              className={[
                "w-full aspect-square rounded-xl text-[22px] flex items-center justify-center transition-all",
                isActive
                  ? "bg-[#e2f6d5] ring-2 ring-[#9fe870] ring-offset-2 ring-offset-white scale-[1.06]"
                  : "bg-[#f7f9f5] hover:bg-[#e2f6d5] hover:scale-[1.06]",
              ].join(" ")}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {/* Custom emoji — collapsed by default */}
      <div className="border-t border-[rgba(14,15,12,0.05)] bg-[#f7f9f5]">
        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          aria-expanded={showCustom}
          className="w-full flex items-center justify-between gap-2 px-5 py-3 text-[12px] font-semibold text-[#454745] hover:text-[#0e0f0c] transition-colors"
        >
          <span>Or paste any emoji from your keyboard</span>
          <span
            aria-hidden
            className="text-[14px] transition-transform"
            style={{
              transform: showCustom ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▾
          </span>
        </button>
        {showCustom && (
          <div className="px-5 pb-4">
            <input
              type="text"
              value={custom}
              onChange={onCustomChange}
              placeholder="🦋"
              maxLength={4}
              className="w-full h-11 px-3 rounded-xl border border-[rgba(14,15,12,0.1)] bg-white text-[18px] font-medium text-[#0e0f0c] placeholder:text-[#c8c8c7] outline-none focus:border-[#163300] transition-colors text-center"
            />
            <p className="text-[11px] text-[#868685] mt-1.5 leading-[1.4]">
              e.g. 🦋, 🪕, 🥟. Up to 4 characters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

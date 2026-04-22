"use client";

import { useState } from "react";

export default function LangToggle() {
  const [lang, setLang] = useState<"bn" | "en">("en");
  return (
    <button
      type="button"
      role="switch"
      aria-checked={lang === "bn"}
      aria-label={`Language: ${lang === "en" ? "English" : "Bangla"}. Click to switch.`}
      onClick={() => setLang(lang === "en" ? "bn" : "en")}
      className="press relative inline-flex items-center gap-1 h-9 pl-1 pr-1 rounded-full bg-[rgba(22,51,0,0.08)] hover:bg-[rgba(22,51,0,0.14)]"
    >
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[#9fe870] transition-all duration-300 ease-out ${
          lang === "en" ? "left-1" : "left-[calc(50%+1px)]"
        }`}
      />
      <span
        className={`relative z-10 px-3 h-7 inline-flex items-center rounded-full text-xs font-semibold transition-colors ${
          lang === "en" ? "text-[#163300]" : "text-[#454745]"
        }`}
      >
        EN
      </span>
      <span
        className={`bangla-display relative z-10 px-3 h-7 inline-flex items-center rounded-full text-sm transition-colors ${
          lang === "bn" ? "text-[#163300]" : "text-[#454745]"
        }`}
      >
        বাং
      </span>
    </button>
  );
}

"use client";

import { useMemo } from "react";

interface ChaVisualProps {
  /** Selected tip amount in paisa. */
  amountPaisa: number;
  /** Paisa per "cha" — drives how full the cup gets. */
  chaUnitPaisa: number;
  /** Hex color for the liquid + steam tint. */
  themeColor: string;
  /** Render numerals in Bengali (০–৯). */
  bnNumerals?: boolean;
  /** True while the user hovers/clicks a preset — adds a tiny lift. */
  isInteracting?: boolean;
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBengaliNumerals(input: string): string {
  return input.replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/**
 * Hero-sized visual for the tip jar. The cup fills, scales, and starts
 * steaming as the supporter increases their tip. Pure SVG — no images,
 * resolution-independent, gracefully degrades under prefers-reduced-motion.
 */
export default function ChaVisual({
  amountPaisa,
  chaUnitPaisa,
  themeColor,
  bnNumerals = false,
  isInteracting = false,
}: ChaVisualProps) {
  // How many "chas" the supporter is buying. Float so half-amounts read nicely.
  const chaCount = useMemo(() => {
    if (chaUnitPaisa <= 0) return 0;
    return amountPaisa / chaUnitPaisa;
  }, [amountPaisa, chaUnitPaisa]);

  // Fill level 0..1. We saturate at 5 cha so going from ৳500 to ৳5,000 still
  // shows visible fill change (curve flattens but never plateaus until 8+).
  const fillPct = useMemo(() => {
    if (chaCount <= 0) return 0;
    if (chaCount >= 8) return 1;
    if (chaCount >= 5) return 0.92 + (chaCount - 5) * 0.026;
    return Math.pow(chaCount / 5, 0.7);
  }, [chaCount]);

  // Cup grows subtly with amount — keeps the layout stable while still
  // rewarding generosity.
  const scale = useMemo(() => {
    if (chaCount <= 0) return 0.92;
    if (chaCount >= 5) return 1.06;
    return 0.92 + (chaCount / 5) * 0.14;
  }, [chaCount]);

  const showSteam = chaCount >= 2;
  const showHeavySteam = chaCount >= 5;

  // Liquid Y position: cup body inside SVG ranges roughly y=58..130.
  // fill=0 → liquid lives at y≈124 (just visible); fill=1 → y≈62 (near rim).
  const liquidTop = 124 - fillPct * 62;
  // Slight color shimmer at higher fills.
  const liquidGradId = "liquid-grad";
  const cupShadowId = "cup-shadow";

  const countLabel = useMemo(() => {
    if (chaCount <= 0) return null;
    const rounded =
      chaCount < 10
        ? chaCount.toFixed(chaCount % 1 === 0 ? 0 : 1)
        : Math.round(chaCount).toString();
    const formatted = bnNumerals ? toBengaliNumerals(rounded) : rounded;
    return formatted;
  }, [chaCount, bnNumerals]);

  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: 200,
        height: 200,
        transform: `scale(${scale})${isInteracting ? " translateY(-1px)" : ""}`,
        transformOrigin: "bottom center",
        transition:
          "transform 480ms cubic-bezier(0.16, 1, 0.3, 1), filter 480ms ease",
        filter: chaCount >= 5 ? "drop-shadow(0 18px 22px rgba(22,51,0,0.18))" : "none",
      }}
      aria-hidden
    >
      {/* Steam — three wisps, layered, fade-in at 2 cha, intensify at 5+ */}
      <svg
        viewBox="0 0 200 80"
        width="200"
        height="80"
        className="absolute top-0 left-0"
        style={{
          opacity: showSteam ? (showHeavySteam ? 0.85 : 0.55) : 0,
          transition: "opacity 600ms ease",
        }}
      >
        <defs>
          <linearGradient id="steam-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0" />
            <stop offset="40%" stopColor={themeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <SteamWisp x={78} delay="0s" duration="3.4s" />
        <SteamWisp x={100} delay="-1.2s" duration="3s" amplitude={9} />
        <SteamWisp x={122} delay="-0.6s" duration="3.8s" amplitude={5} />
      </svg>

      {/* Cup */}
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        className="absolute top-0 left-0"
      >
        <defs>
          <linearGradient id={liquidGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0.78" />
          </linearGradient>

          <radialGradient id={cupShadowId} cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="rgba(14,15,12,0.16)" />
            <stop offset="100%" stopColor="rgba(14,15,12,0)" />
          </radialGradient>

          <clipPath id="cup-clip">
            {/* Mug shape interior — slight taper top→bottom */}
            <path d="M 64,58 L 130,58 L 124,140 Q 100,148 70,140 Z" />
          </clipPath>
        </defs>

        {/* Soft shadow under the cup */}
        <ellipse cx="100" cy="172" rx="58" ry="9" fill={`url(#${cupShadowId})`} />

        {/* Saucer */}
        <ellipse
          cx="100"
          cy="170"
          rx="62"
          ry="9"
          fill="#ffffff"
          stroke="#0e0f0c"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="168" rx="48" ry="5" fill="#f2f6ec" />

        {/* Handle */}
        <path
          d="M 130,72 Q 158,76 156,98 Q 154,118 132,116"
          fill="none"
          stroke="#0e0f0c"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 130,82 Q 148,84 147,98 Q 146,110 132,108"
          fill="none"
          stroke="#0e0f0c"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Cup body outline */}
        <path
          d="M 64,58 L 130,58 L 124,140 Q 100,148 70,140 Z"
          fill="#ffffff"
          stroke="#0e0f0c"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Liquid (clipped to cup interior) */}
        <g clipPath="url(#cup-clip)">
          <rect
            x="60"
            y={liquidTop}
            width="80"
            height="100"
            fill={`url(#${liquidGradId})`}
            style={{
              transition: "y 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          {/* Surface highlight ripple */}
          <ellipse
            cx="100"
            cy={liquidTop + 1}
            rx="32"
            ry="4"
            fill="#ffffff"
            opacity={fillPct > 0 ? 0.25 : 0}
            style={{
              transition:
                "cy 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease",
            }}
          />
          {/* Tiny bubbles when there's enough liquid */}
          {chaCount >= 1 && (
            <>
              <circle
                cx="86"
                cy={liquidTop + 9}
                r="2"
                fill="#ffffff"
                opacity="0.7"
              >
                <animate
                  attributeName="cy"
                  values={`${liquidTop + 9};${liquidTop - 2}`}
                  dur="2.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.7;0"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="112"
                cy={liquidTop + 14}
                r="1.4"
                fill="#ffffff"
                opacity="0.7"
              >
                <animate
                  attributeName="cy"
                  values={`${liquidTop + 14};${liquidTop - 1}`}
                  dur="3.2s"
                  begin="-0.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.6;0"
                  dur="3.2s"
                  begin="-0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </g>

        {/* Decorative band on cup */}
        <line
          x1="68"
          y1="68"
          x2="128"
          y2="68"
          stroke="#0e0f0c"
          strokeWidth="1.5"
          opacity="0.18"
        />
      </svg>

      {/* Cha count badge */}
      {countLabel && (
        <div
          className="absolute"
          style={{
            top: 132,
            left: "50%",
            transform: "translateX(-50%)",
            transition: "opacity 300ms ease",
          }}
        >
          <div className="flex items-baseline gap-1 tabular-nums">
            <span
              className="display"
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#163300",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              ×{countLabel}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#454745",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              cha
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface SteamWispProps {
  x: number;
  delay: string;
  duration: string;
  amplitude?: number;
}

function SteamWisp({ x, delay, duration, amplitude = 7 }: SteamWispProps) {
  // A vertical wisp drawn as a quadratic curve, animated to drift up + sway
  const path = `M ${x},70 q ${amplitude},-12 0,-24 q -${amplitude},-12 0,-24`;
  return (
    <path
      d={path}
      fill="none"
      stroke="url(#steam-grad)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    >
      <animate
        attributeName="opacity"
        values="0;0.85;0"
        dur={duration}
        begin={delay}
        repeatCount="indefinite"
      />
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; 0,-22"
        dur={duration}
        begin={delay}
        repeatCount="indefinite"
      />
    </path>
  );
}

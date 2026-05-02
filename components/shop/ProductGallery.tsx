"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (images.length === 0) return null;

  const active = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className="mb-6">
      <div className="rounded-[24px] overflow-hidden bg-[#f2f6ec] border border-[rgba(14,15,12,0.06)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={alt}
          className="w-full aspect-[16/9] object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-pressed={isActive}
                className={[
                  "shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all",
                  isActive
                    ? "ring-2 ring-[#0e0f0c] ring-offset-2 ring-offset-[#f7f9f5]"
                    : "ring-1 ring-[rgba(14,15,12,0.08)] opacity-80 hover:opacity-100",
                ].join(" ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

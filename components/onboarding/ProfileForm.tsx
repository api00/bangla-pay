"use client";

import { useActionState, useState, type ChangeEvent } from "react";

import {
  saveProfile,
  type SaveProfileState,
} from "@/app/onboarding/_actions/save-profile";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "writer", label: "Writer" },
  { value: "illustrator", label: "Illustrator" },
  { value: "musician", label: "Musician" },
  { value: "educator", label: "Educator" },
  { value: "developer", label: "Developer" },
  { value: "podcaster", label: "Podcaster" },
  { value: "video_creator", label: "Video creator" },
  { value: "photographer", label: "Photographer" },
  { value: "other", label: "Something else" },
];

const initialState: SaveProfileState = { ok: false };
const BIO_MAX = 280;

interface ProfileFormProps {
  defaultDisplayName: string;
  defaultCategory?: string;
  defaultBio?: string;
}

export default function ProfileForm({
  defaultDisplayName,
  defaultCategory = "other",
  defaultBio = "",
}: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveProfile,
    initialState,
  );
  const [bio, setBio] = useState(defaultBio);

  function onBioChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setBio(event.target.value.slice(0, BIO_MAX));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="display_name"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark mb-2"
        >
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          maxLength={60}
          required
          defaultValue={defaultDisplayName}
          disabled={isPending}
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-near-black placeholder:text-gray outline-none focus:border-near-black transition-colors disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark mb-2"
        >
          What do you create?
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultCategory}
          disabled={isPending}
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-near-black outline-none focus:border-near-black transition-colors disabled:opacity-60 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23454745%22 stroke-width=%221.8%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_1rem_center] pr-12"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor="bio"
            className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark"
          >
            Bio (optional)
          </label>
          <span className="text-[12px] text-gray tabular-nums">
            {bio.length} / {BIO_MAX}
          </span>
        </div>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={BIO_MAX}
          value={bio}
          onChange={onBioChange}
          disabled={isPending}
          placeholder="A short line about what you make."
          className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] text-near-black placeholder:text-gray outline-none focus:border-near-black transition-colors disabled:opacity-60 resize-none leading-[1.5]"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="text-[13px] font-medium text-heritage-red leading-[1.55]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-full bg-wise-green text-dark-green font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isPending ? "Saving…" : "Continue"}
        {!isPending && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

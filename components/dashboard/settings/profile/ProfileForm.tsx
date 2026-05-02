"use client";

import { useActionState } from "react";

import {
  updateProfile,
  type UpdateProfileState,
} from "@/app/dashboard/settings/profile/_actions";
import Card from "@/components/dashboard/settings/Card";
import Field, {
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/dashboard/settings/Field";
import SaveBadge from "@/components/dashboard/settings/SaveBadge";
import SubmitButton from "@/components/dashboard/settings/SubmitButton";
import type { Creator, CreatorPage } from "@/db/schema";

const initialState: UpdateProfileState = { ok: false };

const CATEGORIES: Array<{ value: Creator["category"]; label: string }> = [
  { value: "writer", label: "Writer" },
  { value: "illustrator", label: "Illustrator" },
  { value: "musician", label: "Musician" },
  { value: "educator", label: "Educator" },
  { value: "developer", label: "Developer" },
  { value: "podcaster", label: "Podcaster" },
  { value: "video_creator", label: "Video creator" },
  { value: "photographer", label: "Photographer" },
  { value: "other", label: "Other" },
];

interface ProfileFormProps {
  creator: Creator;
  page: CreatorPage;
}

export default function ProfileForm({ creator, page }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <Card
        title="About you"
        description="This shows up at the top of your public page."
        footer={
          <>
            <SaveBadge savedAt={state.savedAt} error={state.error} />
            <SubmitButton label="Save profile" />
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Display name"
            htmlFor="display_name"
            error={errors.display_name}
          >
            <input
              id="display_name"
              name="display_name"
              defaultValue={creator.displayName}
              maxLength={60}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Category" htmlFor="category" error={errors.category}>
            <select
              id="category"
              name="category"
              defaultValue={creator.category}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field
              label="Bio"
              htmlFor="bio"
              hint="Up to 280 characters."
              error={errors.bio}
            >
              <textarea
                id="bio"
                name="bio"
                defaultValue={page.bio ?? ""}
                rows={3}
                maxLength={280}
                className={textareaClass}
              />
            </Field>
          </div>

        </div>
      </Card>

      <Card
        title="Page styling"
        description="Make your page feel like yours."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Field
            label="Theme color"
            htmlFor="theme_color"
            hint="Hex like #9fe870."
            error={errors.theme_color}
          >
            <div className="flex items-center gap-2">
              <input
                id="theme_color"
                name="theme_color"
                type="text"
                defaultValue={page.themeColor}
                maxLength={7}
                className={inputClass}
              />
            </div>
          </Field>

          <Field
            label='"Cha" label'
            htmlFor="cha_label"
            hint='Singular, e.g. "cha" or "coffee".'
          >
            <input
              id="cha_label"
              name="cha_label"
              defaultValue={page.chaLabel}
              maxLength={20}
              className={inputClass}
            />
          </Field>

          <Field label="Cha emoji" htmlFor="cha_emoji">
            <input
              id="cha_emoji"
              name="cha_emoji"
              defaultValue={page.chaEmoji}
              maxLength={4}
              className={inputClass}
            />
          </Field>

          <Field
            label="Cha unit (taka)"
            htmlFor="cha_unit_taka"
            hint="One cha = this many taka. ৳50 by default."
            error={errors.cha_unit_taka}
          >
            <input
              id="cha_unit_taka"
              name="cha_unit_taka"
              defaultValue={(page.chaUnitPaisa / 100).toString()}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>

          <div className="md:col-span-2 grid gap-2 content-center">
            <Toggle
              name="show_supporters"
              defaultChecked={page.showSupporters}
              label="Show supporter wall"
            />
            <Toggle
              name="show_total_raised"
              defaultChecked={page.showTotalRaised}
              label="Show total raised"
            />
            <Toggle
              name="bn_numerals"
              defaultChecked={page.bnNumerals}
              label="Use Bangla numerals (০–৯)"
            />
          </div>
        </div>
      </Card>

      <Card title="Social links" description="Optional. Shown under your bio.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Twitter / X" htmlFor="social_twitter">
            <input
              id="social_twitter"
              name="social_twitter"
              type="url"
              defaultValue={page.socialLinks?.twitter ?? ""}
              placeholder="https://x.com/…"
              className={inputClass}
            />
          </Field>
          <Field label="Instagram" htmlFor="social_instagram">
            <input
              id="social_instagram"
              name="social_instagram"
              type="url"
              defaultValue={page.socialLinks?.instagram ?? ""}
              placeholder="https://instagram.com/…"
              className={inputClass}
            />
          </Field>
          <Field label="YouTube" htmlFor="social_youtube">
            <input
              id="social_youtube"
              name="social_youtube"
              type="url"
              defaultValue={page.socialLinks?.youtube ?? ""}
              placeholder="https://youtube.com/@…"
              className={inputClass}
            />
          </Field>
          <Field label="Facebook" htmlFor="social_facebook">
            <input
              id="social_facebook"
              name="social_facebook"
              type="url"
              defaultValue={page.socialLinks?.facebook ?? ""}
              placeholder="https://facebook.com/…"
              className={inputClass}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Website" htmlFor="social_website">
              <input
                id="social_website"
                name="social_website"
                type="url"
                defaultValue={page.socialLinks?.website ?? ""}
                placeholder="https://"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Card>
    </form>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative w-10 h-6 rounded-full bg-[#e8ebe6] peer-checked:bg-[#9fe870] transition-colors after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:shadow-[0_1px_2px_rgba(0,0,0,0.15)] after:transition-transform peer-checked:after:translate-x-4" />
      <span className="text-[13px] font-medium text-[#0e0f0c]">{label}</span>
    </label>
  );
}

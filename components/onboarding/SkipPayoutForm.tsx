"use client";

import { useFormStatus } from "react-dom";

import { finishOnboarding } from "@/app/onboarding/_actions/finish";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {pending ? "Setting up…" : "Take me to my dashboard"}
      {!pending && <span aria-hidden>→</span>}
    </button>
  );
}

export default function SkipPayoutForm() {
  return (
    <form action={finishOnboarding}>
      <SubmitButton />
    </form>
  );
}

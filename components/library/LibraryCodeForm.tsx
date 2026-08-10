"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  openLibraryWithCode,
  type LibraryCodeState,
} from "@/app/library/_actions";

const INITIAL_STATE: LibraryCodeState = { error: null };

export function LibraryCodeForm({ nextPath }: { nextPath?: string }) {
  const [state, action] = useActionState(openLibraryWithCode, INITIAL_STATE);

  return (
    <form action={action} className="mt-7 text-left">
      <label
        htmlFor="library-code"
        className="text-[13px] font-semibold text-near-black"
      >
        Library Code
      </label>
      <input
        id="library-code"
        name="code"
        type="text"
        required
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        placeholder="BUYER-K7M4-Q2X9-PW"
        aria-describedby="library-code-help library-code-error"
        className="mt-2 h-14 w-full rounded-2xl border border-[rgba(14,15,12,0.16)] bg-white px-4 font-mono text-[16px] uppercase tracking-[0.08em] text-near-black placeholder:text-warm-dark/55 focus:border-dark-green focus:outline-2 focus:outline-offset-2 focus:outline-dark-green"
      />
      <p
        id="library-code-help"
        className="mt-2 text-[12px] leading-[1.5] text-warm-dark"
      >
        One code opens every purchase made with the same email.
      </p>
      <p
        id="library-code-error"
        role="alert"
        className="mt-2 min-h-5 text-[13px] font-semibold text-red-700"
      >
        {state.error}
      </p>
      {nextPath && <input type="hidden" name="next" value={nextPath} />}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-wise-green px-6 text-[14px] font-semibold text-dark-green transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-wait disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green motion-reduce:transform-none"
    >
      {pending ? "Opening library…" : "Open my library"}
    </button>
  );
}

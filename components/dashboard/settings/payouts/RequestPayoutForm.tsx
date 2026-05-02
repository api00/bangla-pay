"use client";

import { useActionState } from "react";

import {
  requestPayout,
  type RequestPayoutState,
} from "@/app/dashboard/settings/payouts/_actions";
import Card from "@/components/dashboard/settings/Card";
import Field, {
  inputClass,
  selectClass,
} from "@/components/dashboard/settings/Field";
import SaveBadge from "@/components/dashboard/settings/SaveBadge";
import SubmitButton from "@/components/dashboard/settings/SubmitButton";
import type { PayoutMethod } from "@/db/schema";
import { formatTaka } from "@/lib/money";

const initialState: RequestPayoutState = { ok: false };

interface RequestPayoutFormProps {
  methods: PayoutMethod[];
  availablePaisa: number;
}

export default function RequestPayoutForm({
  methods,
  availablePaisa,
}: RequestPayoutFormProps) {
  const [state, formAction] = useActionState(requestPayout, initialState);
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const canRequest = methods.length > 0 && availablePaisa >= 100_00;

  return (
    <form action={formAction}>
      <Card
        title="Withdraw your earnings"
        description={
          methods.length === 0
            ? "Add a payout method first to enable withdrawals."
            : `Available: ${formatTaka(availablePaisa)}. Minimum payout is ৳100.`
        }
        footer={
          <>
            <SaveBadge savedAt={state.savedAt} error={state.error} />
            <SubmitButton
              label="Request payout"
              pendingLabel="Submitting…"
              disabled={!canRequest}
            />
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Pay to" htmlFor="payout_method_id">
            <select
              id="payout_method_id"
              name="payout_method_id"
              defaultValue={defaultMethod?.id ?? ""}
              disabled={methods.length === 0}
              className={selectClass}
            >
              {methods.length === 0 && (
                <option value="">No methods on file</option>
              )}
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.accountLabel}
                  {m.isDefault ? " · default" : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Amount (taka)"
            htmlFor="amount_taka"
            hint={
              availablePaisa > 0
                ? `Up to ${formatTaka(availablePaisa)}.`
                : undefined
            }
          >
            <input
              id="amount_taka"
              name="amount_taka"
              inputMode="numeric"
              placeholder="500"
              disabled={!canRequest}
              className={inputClass}
            />
          </Field>
        </div>

        {state.ok && state.savedAt ? (
          <div className="mt-5 rounded-2xl bg-[#f2f6ec] border border-[#cdffad] px-4 py-3 text-[13px] text-[#163300] font-medium">
            Payout request submitted. We&rsquo;ll process it within 1–3
            business days.
          </div>
        ) : null}
      </Card>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";

import {
  addPayoutMethod,
  type AddPayoutMethodState,
} from "@/app/dashboard/settings/payouts/_actions";
import Card from "@/components/dashboard/settings/Card";
import Field, {
  inputClass,
  selectClass,
} from "@/components/dashboard/settings/Field";
import SaveBadge from "@/components/dashboard/settings/SaveBadge";
import SubmitButton from "@/components/dashboard/settings/SubmitButton";

const initialState: AddPayoutMethodState = { ok: false };

type Method = "bkash" | "nagad" | "rocket" | "beftn" | "rtgs";

const METHODS: Array<{ value: Method; label: string; group: "MFS" | "Bank" }> = [
  { value: "bkash", label: "bKash", group: "MFS" },
  { value: "nagad", label: "Nagad", group: "MFS" },
  { value: "rocket", label: "Rocket", group: "MFS" },
  { value: "beftn", label: "Bank — BEFTN", group: "Bank" },
  { value: "rtgs", label: "Bank — RTGS", group: "Bank" },
];

export default function AddMethodForm({
  hasMethods,
}: {
  hasMethods: boolean;
}) {
  const [state, formAction] = useActionState(addPayoutMethod, initialState);
  const [method, setMethod] = useState<Method>("bkash");
  const errors = state.fieldErrors ?? {};
  const isMfs = method === "bkash" || method === "nagad" || method === "rocket";

  return (
    <form action={formAction}>
      <Card
        title="Add a payout method"
        description="bKash, Nagad, Rocket, or a bank account. We encrypt account details at rest."
        footer={
          <>
            <SaveBadge savedAt={state.savedAt} error={state.error} />
            <SubmitButton label="Add method" pendingLabel="Adding…" />
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Method" htmlFor="method">
            <select
              id="method"
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className={selectClass}
            >
              <optgroup label="Mobile financial services">
                {METHODS.filter((m) => m.group === "MFS").map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bank account">
                {METHODS.filter((m) => m.group === "Bank").map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>

          <div className="md:col-span-2">
            {isMfs ? (
              <Field
                label="Phone number"
                htmlFor="msisdn"
                hint="11-digit Bangladeshi number, e.g. 01712345678."
                error={errors.msisdn}
              >
                <input
                  id="msisdn"
                  name="msisdn"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01712345678"
                  className={inputClass}
                />
              </Field>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Account holder"
                  htmlFor="account_name"
                  error={errors.account_name}
                >
                  <input
                    id="account_name"
                    name="account_name"
                    className={inputClass}
                    placeholder="As printed on your cheque"
                  />
                </Field>
                <Field
                  label="Account number"
                  htmlFor="account_number"
                  error={errors.account_number}
                >
                  <input
                    id="account_number"
                    name="account_number"
                    inputMode="numeric"
                    className={inputClass}
                    placeholder="1234567890"
                  />
                </Field>
                <Field
                  label="Bank name"
                  htmlFor="bank_name"
                  error={errors.bank_name}
                >
                  <input
                    id="bank_name"
                    name="bank_name"
                    className={inputClass}
                    placeholder="Brac Bank"
                  />
                </Field>
                <Field
                  label="Branch"
                  htmlFor="branch_name"
                  error={errors.branch_name}
                >
                  <input
                    id="branch_name"
                    name="branch_name"
                    className={inputClass}
                    placeholder="Gulshan"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field
                    label="Routing number"
                    htmlFor="routing_number"
                    hint="9-digit BB routing number for your branch."
                    error={errors.routing_number}
                  >
                    <input
                      id="routing_number"
                      name="routing_number"
                      inputMode="numeric"
                      maxLength={9}
                      className={inputClass}
                      placeholder="060270847"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none md:col-span-2">
            <input
              type="checkbox"
              name="set_default"
              defaultChecked={!hasMethods}
              className="peer sr-only"
            />
            <span className="relative w-10 h-6 rounded-full bg-[#e8ebe6] peer-checked:bg-[#9fe870] transition-colors after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:shadow-[0_1px_2px_rgba(0,0,0,0.15)] after:transition-transform peer-checked:after:translate-x-4" />
            <span className="text-[13px] font-medium text-[#0e0f0c]">
              Make this my default payout method
            </span>
          </label>
        </div>
      </Card>
    </form>
  );
}

import PageHeader from "@/components/dashboard/PageHeader";
import AddMethodForm from "@/components/dashboard/settings/payouts/AddMethodForm";
import MethodsList from "@/components/dashboard/settings/payouts/MethodsList";
import PayoutHistory from "@/components/dashboard/settings/payouts/PayoutHistory";
import RequestPayoutForm from "@/components/dashboard/settings/payouts/RequestPayoutForm";
import {
  getCreatorBalance,
  listPayoutMethods,
  listPayouts,
} from "@/db/queries/payouts";
import { requireCreator } from "@/lib/auth";
import { formatTaka } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payouts · Settings · BanglaPay" };

export default async function PayoutsSettingsPage() {
  const { creator } = await requireCreator();

  const [methods, payouts, balance] = await Promise.all([
    listPayoutMethods(creator.id),
    listPayouts(creator.id),
    getCreatorBalance(creator.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts"
        subtitle="Withdraw your tips to bKash, Nagad, Rocket, or a Bangladeshi bank account."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <BalanceTile
          label="Available"
          value={formatTaka(balance.availablePaisa)}
          tone="primary"
          sub="Ready to withdraw"
        />
        <BalanceTile
          label="In flight"
          value={formatTaka(balance.inFlightPaisa)}
          sub="Requested + processing"
        />
        <BalanceTile
          label="Lifetime raised"
          value={formatTaka(balance.totalRaisedPaisa)}
        />
      </div>

      <RequestPayoutForm
        methods={methods}
        availablePaisa={balance.availablePaisa}
      />

      <MethodsList methods={methods} />

      <AddMethodForm hasMethods={methods.length > 0} />

      <PayoutHistory payouts={payouts} />

      <p className="text-[12px] text-gray leading-[1.6]">
        We process payouts manually right now while we finish wiring our
        provider integrations. Most withdrawals settle in 1–3 business days.
        Account details are encrypted at rest.
      </p>
    </div>
  );
}

function BalanceTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "primary";
}) {
  const isPrimary = tone === "primary";
  return (
    <div
      className={`rounded-2xl border px-5 py-4 transition-colors ${
        isPrimary
          ? "bg-mint-surface border-wise-green"
          : "bg-white border-[rgba(14,15,12,0.06)]"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray">
        {label}
      </div>
      <div
        className={`mt-1 text-[24px] font-semibold tabular-nums ${
          isPrimary ? "text-dark-green" : "text-near-black"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[12px] mt-0.5 text-gray">{sub}</div>
      )}
    </div>
  );
}

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SkipPayoutForm from "@/components/onboarding/SkipPayoutForm";

export const metadata = {
  title: "Set up payouts · BanglaPay",
};

export default function OnboardingPayoutPage() {
  return (
    <OnboardingLayout
      step="payout"
      title={
        <>
          Where should we <span className="text-dark-green">send your money</span>?
        </>
      }
      subtitle="You can add a payout method now or later. You'll need one before requesting your first withdrawal."
      aside={
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gray mb-4">
            Coming soon
          </p>
          <ul className="space-y-3 text-[15px] text-near-black leading-[1.5]">
            <li className="flex gap-3">
              <span aria-hidden className="text-dark-green">•</span>
              <span>bKash, Nagad, Rocket — direct to your wallet</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-dark-green">•</span>
              <span>Bank transfer via BEFTN</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-dark-green">•</span>
              <span>RTGS for larger amounts</span>
            </li>
          </ul>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[rgba(14,15,12,0.08)] bg-off-white px-5 py-5">
          <p className="text-[15px] font-semibold text-near-black">
            Payout setup is launching with our first payment provider.
          </p>
          <p className="mt-1 text-[14px] text-warm-dark leading-[1.55]">
            For now, your tips will accumulate as a balance. We&rsquo;ll email
            you when payouts open so you can withdraw at any time.
          </p>
        </div>

        <SkipPayoutForm />

        <p className="text-[12px] text-gray leading-[1.55]">
          You can always come back to{" "}
          <span className="font-semibold text-near-black">
            Settings → Payouts
          </span>{" "}
          from the dashboard.
        </p>
      </div>
    </OnboardingLayout>
  );
}

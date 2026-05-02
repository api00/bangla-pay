import HandleForm from "@/components/onboarding/HandleForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { SITE_HOST } from "@/lib/site";

export const metadata = {
  title: "Claim your handle · BanglaPay",
};

export default function OnboardingHandlePage() {
  return (
    <OnboardingLayout
      step="handle"
      title={
        <>
          Pick your <span className="text-[#163300]">handle</span>.
        </>
      }
      subtitle="This is your public address on BanglaPay. Choose carefully — you can change it later, but old links will break."
      aside={
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685] mb-4">
            What you get
          </p>
          <ul className="space-y-3 text-[15px] text-[#0e0f0c] leading-[1.5]">
            <li className="flex gap-3">
              <span aria-hidden className="text-[#163300]">✓</span>
              <span>
                A clean public page at{" "}
                <span className="font-semibold">{SITE_HOST}/yourname</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[#163300]">✓</span>
              <span>Tip jar with default amounts ৳50, ৳100, ৳500</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[#163300]">✓</span>
              <span>Shop for digital products, ready when you are</span>
            </li>
          </ul>
        </div>
      }
    >
      <HandleForm />
    </OnboardingLayout>
  );
}

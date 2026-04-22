import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create your page · BanglaPay",
  description:
    "Start your BanglaPay page in under a minute. Free forever for Bangladeshi creators.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title={
        <>
          Start your cha jar.{" "}
          <span aria-hidden className="inline-block align-middle text-[1.4em] leading-none">
            ☕
          </span>
        </>
      }
      subtitle="Create your page in under a minute. Free, forever, for creators in Bangladesh."
      footer={
        <p className="text-[14px] text-[#454745]">
          Already on BanglaPay?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0e0f0c] underline underline-offset-4 decoration-[#9fe870] decoration-[3px] hover:decoration-[#cdffad]"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AuthForm submitLabel="Create my page" />
    </AuthLayout>
  );
}

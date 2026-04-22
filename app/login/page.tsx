import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign in · BanglaPay",
  description: "Sign in to your BanglaPay creator dashboard.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to your dashboard and see what your supporters are up to."
      footer={
        <p className="text-[14px] text-[#454745]">
          New to BanglaPay?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#0e0f0c] underline underline-offset-4 decoration-[#9fe870] decoration-[3px] hover:decoration-[#cdffad]"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <AuthForm submitLabel="Continue with email" />
    </AuthLayout>
  );
}

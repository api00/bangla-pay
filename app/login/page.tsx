import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign in or sign up · BanglaPay",
  description:
    "One page for sign in and sign up. Enter your email — we'll send a 6-digit code.",
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const isLibraryLogin = next?.startsWith("/library");

  return (
    <AuthLayout
      title={
        <>
          {isLibraryLogin ? "Open your private library." : "Sign in or start your page."}{" "}
          <span aria-hidden className="inline-block align-middle text-[1.4em] leading-none">
            ☕
          </span>
        </>
      }
      subtitle={
        isLibraryLogin
          ? "Use the same email you entered at checkout. We’ll send a 6-digit code."
          : "Enter your email — we'll send a 6-digit code. New here? We'll set up your page automatically."
      }
      footer={
        <p className="text-[13px] text-gray leading-[1.55]">
          By continuing, you agree to BanglaPay&rsquo;s Terms and Privacy
          Policy.
        </p>
      }
    >
      <AuthForm submitLabel="Continue with email" />
    </AuthLayout>
  );
}

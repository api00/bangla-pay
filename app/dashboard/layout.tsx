import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Sidebar, { type SidebarUser } from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { getCreatorByUserId } from "@/db/queries/creators";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Dashboard · BanglaPay",
};

function deriveSidebarUser(email: string, metadata: Record<string, unknown>): SidebarUser {
  const rawName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : "";
  const displayName = rawName.trim() || email.split("@")[0];
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || email[0]?.toUpperCase() || "?";

  return { email, displayName, initials };
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const creator = await getCreatorByUserId(user.id);
  if (!creator) {
    redirect("/onboarding/handle");
  }
  if (creator.onboardingStep !== "done") {
    redirect(`/onboarding/${creator.onboardingStep}`);
  }

  const sidebarUser = deriveSidebarUser(
    user.email ?? "unknown@banglapay.com",
    user.user_metadata ?? {},
  );

  return (
    <div className="min-h-screen bg-[#f7f9f5] flex">
      <Sidebar user={sidebarUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8">
          <div className="max-w-[1200px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

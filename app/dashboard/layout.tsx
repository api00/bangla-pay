import type { ReactNode } from "react";
import Sidebar, { type SidebarUser } from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { countUnreadMessages } from "@/db/queries/messages";
import { requireCreator } from "@/lib/auth";

export const metadata = {
  title: "Dashboard · BanglaPay",
};

function deriveSidebarUser(
  email: string,
  handle: string,
  metadata: Record<string, unknown>,
): SidebarUser {
  const rawName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : "";
  const displayName = rawName.trim() || email.split("@")[0];
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ||
    email[0]?.toUpperCase() ||
    "?";

  return { email, displayName, initials, handle };
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The dashboard layout calls requireCreator(); each page below also calls it.
  // React's cache() de-dupes — one Supabase + one Drizzle round-trip per render.
  const { user, creator } = await requireCreator();

  const unreadMessages = await countUnreadMessages(creator.id);

  const sidebarUser = deriveSidebarUser(
    user.email ?? "unknown@banglapay.com",
    creator.handle,
    user.user_metadata ?? {},
  );

  return (
    <div className="min-h-screen bg-[#f7f9f5] flex">
      <Sidebar user={sidebarUser} unreadMessages={unreadMessages} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar handle={creator.handle} unreadMessages={unreadMessages} />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8">
          <div className="max-w-[1200px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

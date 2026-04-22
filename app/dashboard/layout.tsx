import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import type { ReactNode } from "react";

export const metadata = {
  title: "Dashboard · BanglaPay",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9f5] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8">
          <div className="max-w-[1200px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

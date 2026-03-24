import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

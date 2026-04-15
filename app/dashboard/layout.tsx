import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="w-full flex-1 pb-20 lg:pb-0">
        <Topbar email={user.email ?? ""} />
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

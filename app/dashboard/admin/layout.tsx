import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SidebarAdmin from "@/app/components/SidebarAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // 1. GERBANG KEAMANAN UTAMA
  if (!session) redirect("/login");

  const userRole = (session.user as any).role;

  // Jika bukan Super Admin, tendang ke dashboard masing-masing!
  if (userRole !== "SUPER_ADMIN") {
    if (userRole === "GURU") redirect("/dashboard/guru");
    if (userRole === "SISWA") redirect("/dashboard/siswa");
    redirect("/login");
  }

  // 2. TAMPILAN SIDEBAR & LAYOUT ADMIN RESPONSIVE
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar yang sudah diekstrak ke Client Component */}
      <SidebarAdmin userName={(session.user as any).name} />

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto flex flex-col w-full relative">
        
        {/* Container children dengan padding top ekstra di Mobile untuk mengimbangi Mobile Header */}
        <div className="flex-1 p-4 md:p-6 mt-16 md:mt-0">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="mt-auto py-6 px-4 md:px-6 text-center text-xs md:text-sm font-medium text-slate-400 border-t border-slate-200">
          © 2026 Smart Step Learning Center. All Rights Reserved.
        </footer>
      </main>

    </div>
  );
}
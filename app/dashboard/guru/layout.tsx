import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SidebarGuru } from "../../components/SidebarGuru";
import ContactAdmin from "../../components/ContactAdmin"; 

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  // 1. GERBANG KEAMANAN UTAMA
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const userRole = (session.user as any).role;

  if (userRole !== "GURU") {
    if (userRole === "SUPER_ADMIN") redirect("/dashboard/admin");
    if (userRole === "SISWA") redirect("/dashboard/siswa");
    redirect("/login");
  }

  // 2. TAMPILAN KERANGKA LAYOUT RESPONSIF
  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      {/* Sidebar Guru */}
      <SidebarGuru />

      {/* Area Utama Dashboard */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative w-full">
        {/* Container Isi Konten */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 mt-14 md:mt-0">
          {children}
        </div>
        
        {/* Footer Konsisten */}
        <footer className="py-4 px-6 text-center text-xs md:text-sm font-medium text-slate-400 border-t border-slate-200 bg-white shrink-0">
          © 2026 Smart Step Learning Center. All Rights Reserved.
        </footer>

        {/* Floating Contact Admin */}
        <ContactAdmin />
      </main>
    </div>
  );
}
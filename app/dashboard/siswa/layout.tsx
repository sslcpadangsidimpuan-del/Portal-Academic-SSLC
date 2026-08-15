import { SidebarSiswa } from "@/app/components/SidebarSiswa";
import ContactAdmin from "../../components/ContactAdmin"; 

export default function DashboardSiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      {/* Sidebar Siswa */}
      <SidebarSiswa />
      
      {/* Area Utama Dashboard */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative w-full">
        {/* Container Isi Konten (mt-16 di mobile agar tidak tertutup header mobile) */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 mt-14 md:mt-0">
          {children}
        </div>

        {/* Footer Konsisten */}
        <footer className="py-4 px-6 text-center text-xs md:text-sm font-medium text-slate-400 border-t border-slate-200 bg-white shrink-0">
          © 2026 Smart Step Learning Center. All Rights Reserved.
        </footer> 

        {/* Floating Contact Admin (Di dalam container main agar posisi presisi) */}
        <ContactAdmin />
      </main>
    </div>
  );
}
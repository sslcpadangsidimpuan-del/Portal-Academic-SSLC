"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SidebarAdmin({ userName }: { userName: string }) {
  // State untuk buka/tutup menu di tampilan Mobile
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fungsi pembantu agar menu otomatis tertutup saat link diklik di HP
  const closeMenu = () => setIsOpen(false);

  // Fungsi pembantu untuk efek aktif (opsional tapi bagus untuk UI)
  const isActive = (path: string) => pathname === path ? "bg-slate-800 text-white border-l-4 border-indigo-500" : "hover:bg-slate-800 hover:text-white";

  return (
    <>
      {/* 1. MOBILE HEADER (Hanya tampil di layar kecil) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <Image src="/logoallwhite.png" alt="Logo" width={100} height={20} className="object-contain" />
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-300 hover:text-white focus:outline-none"
        >
          {/* Ikon Hamburger / Close */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 2. OVERLAY GELAP (Muncul di belakang sidebar saat menu HP terbuka) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* 3. SIDEBAR UTAMA */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl 
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logoallwhite.png"
              alt="Next.js logo"
              width={200}
              height={40}
              priority
              className="h-auto w-auto object-contain"
            />
          </div>
         
          <p className="text-xs text-slate-500 mt-1">Super User Control Panel</p>
        </div>

        {/* User Profile di HP (Pindah ke atas agar mudah dijangkau) */}
        <div className="p-4 border-b border-slate-800 md:hidden bg-slate-800/50 mt-16">
           <p className="text-sm font-semibold text-white truncate">👋 Hallo, {userName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard/admin" onClick={closeMenu} className={`block px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/admin')}`}>
            🏠 Dashboard
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Managament</p>
          </div>
          
          <Link href="/dashboard/admin/users" onClick={closeMenu} className={`block px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/admin/users')}`}>
            👥 User Managament
          </Link>
          <Link href="/dashboard/admin/classes" onClick={closeMenu} className={`block px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/admin/classes')}`}>
            📚 Class Management
          </Link>

          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monitoring</p>
          </div>
          <Link href="/dashboard/admin/reports" onClick={closeMenu} className={`block px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/admin/reports')}`}>
            📊 Student Report
          </Link>
          <Link href="/dashboard/admin/notifications" onClick={closeMenu} className={`block px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/admin/notifications')}`}>
            📢 Announcement
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 hidden md:block">
          <div className="bg-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <Link href="/api/auth/signout" className="text-xs text-rose-400 hover:text-rose-300 font-medium w-fit">
               Logout
            </Link>
          </div>
        </div>

        {/* Tombol Logout untuk HP */}
        <div className="p-4 border-t border-slate-800 md:hidden">
            <Link href="/api/auth/signout" className="block w-full text-center py-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors font-medium">
               Log out
            </Link>
        </div>
      </aside>
    </>
  );
}
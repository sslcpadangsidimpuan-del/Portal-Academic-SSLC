"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function SidebarSiswa() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  // Menu navigasi untuk akun siswa/orang tua (Sudah Ditambahkan Biodata Siswa)
  const menuItems = [
    { name: "Home", href: "/dashboard/siswa", icon: "🏠" },
    { name: "Profile", href: "/dashboard/siswa/biodata", icon: "👤" },
    { name: "Semester Report", href: "/dashboard/siswa/report", icon: "📈" },
    { name: "Attendance & Daily Report", href: "/dashboard/siswa/absensi", icon: "📅" },
    { name: "Galery", href: "/dashboard/siswa/photos", icon: "📸" }
  ];

  return (
    <>
      {/* 1. MOBILE HEADER (Hanya muncul di layar HP/Tablet) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <Image src="/logotnsp.png" alt="Logo" width={64} height={20} priority className="object-contain mx-auto" />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 2. OVERLAY GELAP (Saat menu mobile terbuka) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-opacity" onClick={closeMenu} />
      )}

      {/* 3. SIDEBAR UTAMA */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-indigo-50/60 border-r border-indigo-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* LOGO UNTUK DESKTOP */}
        <div className="p-6 hidden md:block">
          <div className="mb-4 flex justify-center">
            <Image src="/logotnsp.png" alt="Logo" width={200} height={5} priority className="h-auto w-auto object-contain" />
          </div>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider text-center">Student Portal</p>
        </div>

        {/* LOGO BUFFER UNTUK MOBILE */}
        <div className="md:hidden mt-16 p-4 border-b border-indigo-100">
           <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Student Portal</p>
        </div>

        {/* NAVIGASI MENU */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "text-slate-600 hover:bg-indigo-100/70 hover:text-indigo-700"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* TOMBOL LOGOUT */}
        <div className="p-4 border-t border-indigo-100">
          <button
            onClick={() => { closeMenu(); signOut({ callbackUrl: "/login" }); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
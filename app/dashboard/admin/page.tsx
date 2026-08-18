import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const totalGuru = await prisma.user.count({ where: { role: 'GURU' } });
  const totalSiswa = await prisma.user.count({ where: { role: 'SISWA' } });
  const totalKelas = await prisma.level.count();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const totalLaporanHariIni = await prisma.dailyReport.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay }
    }
  });

  const absensiHariIni = await prisma.absensi.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay }
    }
  });

  const totalHadir = absensiHariIni.filter(a => a.status.toUpperCase() === "HADIR").length;
  const totalSakit = absensiHariIni.filter(a => a.status.toUpperCase() === "SAKIT").length;
  const totalIzin = absensiHariIni.filter(a => a.status.toUpperCase() === "IZIN").length;
  const totalAlpha = absensiHariIni.filter(a => ["ALPA", "ALPHA"].includes(a.status.toUpperCase())).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full box-border">
      {/* Header Salam */}
      <div className="mb-5 sm:mb-8 text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          Selamat datang, Admin! 👋
        </h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm md:text-base leading-relaxed">
          Berikut adalah ringkasan operasional Smart Step Learning Center saat ini.
        </p>
      </div>

      {/* Ringkasan Angka Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-sky-50 text-sky-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0">🧑‍🏫</div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Guru</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800">{totalGuru}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0">👦</div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800">{totalSiswa}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0">📚</div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kelas</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800">{totalKelas}</p>
          </div>
        </div>
      </div>

      {/* Section Pantauan Hari Ini */}
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Pantauan Hari Ini
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
        {/* Status Kehadiran */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 sm:mb-4">
            Status Kehadiran Siswa
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100 text-center">
              <p className="text-xl sm:text-2xl font-black text-emerald-700">{totalHadir}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase mt-0.5">Hadir</p>
            </div>
            <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100 text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-700">{totalSakit}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-amber-600 uppercase mt-0.5">Sakit</p>
            </div>
            <div className="bg-sky-50 p-3 sm:p-4 rounded-xl border border-sky-100 text-center">
              <p className="text-xl sm:text-2xl font-black text-sky-700">{totalIzin}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-sky-600 uppercase mt-0.5">Izin</p>
            </div>
            <div className="bg-rose-50 p-3 sm:p-4 rounded-xl border border-rose-100 text-center">
              <p className="text-xl sm:text-2xl font-black text-rose-700">{totalAlpha}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-rose-600 uppercase mt-0.5">Alpha</p>
            </div>
          </div>
        </div>

        {/* Laporan Pembelajaran Masuk */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-center items-center text-center">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Laporan Pembelajaran Masuk
          </p>
          <div className="text-4xl sm:text-5xl font-black text-indigo-600 my-1">{totalLaporanHariIni}</div>
          <p className="text-slate-500 text-xs">Dokumen tersimpan hari ini</p>
        </div>
      </div>

      {/* Jalan Pintas */}
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">Jalan Pintas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link href="/dashboard/admin/users" className="bg-slate-800 hover:bg-slate-900 text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between transition-colors group">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Kelola Pengguna</h3>
            <p className="text-slate-400 text-xs mt-0.5">Tambah, edit, atau hapus Guru & Siswa</p>
          </div>
          <span className="text-xl sm:text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        
        <Link href="/dashboard/admin/classes" className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between transition-colors group">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Manajemen Kelas</h3>
            <p className="text-indigo-200 text-xs mt-0.5">Atur kategori, level, dan penempatan</p>
          </div>
          <span className="text-xl sm:text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
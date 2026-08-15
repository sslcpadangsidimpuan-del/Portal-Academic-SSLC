import { prisma } from "@/lib/db";
import Link from "next/link"; // Pastikan Link di-import untuk navigasi

export default async function AdminDashboard() {
  // ==========================================
  // 1. STATISTIK MAKRO (DATA TOTAL)
  // ==========================================
  const totalGuru = await prisma.user.count({ where: { role: 'GURU' } });
  const totalSiswa = await prisma.user.count({ where: { role: 'SISWA' } });
  const totalKelas = await prisma.level.count();

  // ==========================================
  // 2. STATISTIK HARIAN (OPERASIONAL HARI INI)
  // ==========================================
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Menghitung jumlah laporan harian yang di-submit hari ini
  const totalLaporanHariIni = await prisma.dailyReport.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay }
    }
  });

  // Mengambil data absensi khusus hari ini lalu mengelompokkannya
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
    <div className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">Selamat datang, Admin! 👋</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Berikut adalah ringkasan operasional Smart Step Learning Center saat ini.
        </p>
      </div>

      {/* 1. KARTU STATISTIK MAKRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-3xl">🧑‍🏫</div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Guru</p>
            <p className="text-4xl font-black text-slate-800">{totalGuru}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">👦</div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Siswa</p>
            <p className="text-4xl font-black text-slate-800">{totalSiswa}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">📚</div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Kelas</p>
            <p className="text-4xl font-black text-slate-800">{totalKelas}</p>
          </div>
        </div>
      </div>

      {/* 2. PANTAUAN OPERASIONAL HARI INI */}
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
        Pantauan Hari Ini
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Rekap Kehadiran Harian */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Status Kehadiran Siswa</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p className="text-2xl font-black text-emerald-700">{totalHadir}</p>
              <p className="text-[11px] font-bold text-emerald-600 uppercase mt-1">Hadir</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
              <p className="text-2xl font-black text-amber-700">{totalSakit}</p>
              <p className="text-[11px] font-bold text-amber-600 uppercase mt-1">Sakit</p>
            </div>
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-center">
              <p className="text-2xl font-black text-sky-700">{totalIzin}</p>
              <p className="text-[11px] font-bold text-sky-600 uppercase mt-1">Izin</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
              <p className="text-2xl font-black text-rose-700">{totalAlpha}</p>
              <p className="text-[11px] font-bold text-rose-600 uppercase mt-1">Alpha</p>
            </div>
          </div>
        </div>

        {/* Laporan Harian */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Laporan Pembelajaran Masuk</p>
          <div className="text-6xl font-black text-indigo-600 mb-2">{totalLaporanHariIni}</div>
          <p className="text-slate-500 text-sm">Dokumen tersimpan hari ini</p>
        </div>
      </div>

      {/* 3. JALAN PINTAS (BERFUNGSI) */}
      <h2 className="text-xl font-bold text-slate-800 mb-6">Jalan Pintas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/admin/users" className="bg-slate-800 hover:bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between transition-colors group">
          <div>
            <h3 className="font-bold text-lg">Kelola Pengguna</h3>
            <p className="text-slate-400 text-sm mt-1">Tambah, edit, atau hapus Guru & Siswa</p>
          </div>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        
        <Link href="/dashboard/admin/classes" className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl flex items-center justify-between transition-colors group">
          <div>
            <h3 className="font-bold text-lg">Manajemen Kelas</h3>
            <p className="text-indigo-200 text-sm mt-1">Atur kategori, level, dan penempatan</p>
          </div>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

    </div>
  );
}
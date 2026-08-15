import { prisma } from "@/lib/db";
import Link from "next/link";
import ReportViewer from "./ReportViewer";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ search?: string, siswaId?: string }> }) {
  const { search, siswaId } = await searchParams;
  const searchQuery = search || "";
  const selectedSiswaId = siswaId || null;

  // 1. Ambil daftar siswa untuk kolom pencarian (Gunakan levels: true untuk multi-kelas)
  const students = await prisma.user.findMany({
    where: {
      role: "SISWA",
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { username: { contains: searchQuery, mode: "insensitive" } }
      ]
    },
    include: { 
      siswaProfile: { 
        include: { 
          levels: true 
        } 
      } 
    },
    orderBy: { name: 'asc' },
    take: 30
  });

  // 2. Deklarasi variabel penampung data
  let selectedStudent = null;
  let dailyReports: any[] = [];
  let semesterReports: any[] = [];
  let absensiData: any[] = [];

  if (selectedSiswaId) {
    selectedStudent = await prisma.user.findUnique({
      where: { id: selectedSiswaId },
      include: { 
        siswaProfile: { 
          include: { 
            levels: true 
          } 
        } 
      }
    });

    if (selectedStudent?.siswaProfile) {
      // Ambil Laporan Harian
      dailyReports = await prisma.dailyReport.findMany({
        where: { siswaId: selectedStudent.siswaProfile.id },
        include: { 
          level: true, 
          guru: { include: { user: true } } 
        },
        orderBy: { date: 'desc' }
      });

      // Ambil Laporan Semester
      semesterReports = await prisma.semesterReport.findMany({
        where: { siswaId: selectedStudent.siswaProfile.id },
        include: { 
          level: true, 
          guru: { include: { user: true } } 
        },
        orderBy: { createdAt: 'desc' }
      });

      // Ambil Data Absensi Siswa
      absensiData = await prisma.absensi.findMany({
        where: { siswaId: selectedStudent.siswaProfile.id },
        include: { level: true }
      });
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 lg:h-[calc(100vh-4rem)] flex flex-col">
      
      {/* HEADER PAGE */}
      <div className="mb-4 sm:mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Pantau Laporan</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lacak rekam jejak akademik, evaluasi, dan absensi siswa secara historis.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        
        {/* KOLOM KIRI: PENCARIAN & DAFTAR SISWA */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden shrink-0 lg:shrink max-h-[380px] lg:max-h-none">
          
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50">
            <form method="GET" className="flex gap-2">
              {selectedSiswaId && <input type="hidden" name="siswaId" value={selectedSiswaId} />}
              <input 
                type="text" 
                name="search" 
                defaultValue={searchQuery} 
                placeholder="Cari Nama / NIS..." 
                className="flex-1 p-2 sm:p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-slate-800 text-white px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold hover:bg-slate-700 transition-colors">
                Cari
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {students.length === 0 ? (
              <p className="text-center text-slate-400 text-xs sm:text-sm p-4 mt-6">Siswa tidak ditemukan.</p>
            ) : (
              <ul className="space-y-1">
                {students.map(siswa => {
                  const isSelected = selectedSiswaId === siswa.id;
                  const studentLevels = siswa.siswaProfile?.levels || [];

                  return (
                    <li key={siswa.id}>
                      <Link 
                        href={`?search=${searchQuery}&siswaId=${siswa.id}`}
                        className={`block p-2.5 sm:p-3 rounded-xl transition-all border ${
                          isSelected 
                            ? "bg-indigo-50 border-indigo-200 shadow-xs" 
                            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`font-bold text-xs sm:text-sm truncate ${isSelected ? "text-indigo-800" : "text-slate-800"}`}>
                              {siswa.name}
                            </p>
                            <p className="text-[10px] sm:text-xs font-mono text-slate-500 mt-0.5">
                              NIS: {siswa.username}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            {studentLevels.length > 0 ? (
                              <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
                                {studentLevels.map((lvl) => (
                                  <span key={lvl.id} className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md font-bold bg-sky-100 text-sky-700">
                                    {lvl.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-500">
                                Belum Ada
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: DISPLAY LAPORAN (CLIENT COMPONENT) */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-[450px] lg:min-h-0">
          {selectedStudent ? (
            <ReportViewer 
              student={selectedStudent} 
              dailyReports={dailyReports} 
              semesterReports={semesterReports} 
              absensiData={absensiData}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl mb-4 opacity-20">📂</div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">Belum Ada Siswa yang Dipilih</h2>
              <p className="text-xs sm:text-sm max-w-md text-slate-400">
                Pilih salah satu nama siswa pada daftar di atas untuk mulai memantau riwayat laporan akademik mereka.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
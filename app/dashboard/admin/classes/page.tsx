import { prisma } from "@/lib/db";
import Link from "next/link";
import AddClassForm from "./AddClassForm";
import MoveStudentForm from "./MoveStudentForm";
import MoveTeacherForm from "./MoveTeacherForm"; // <-- Komponen baru yang akan kita buat
import DeleteButton from "./DeleteButton";

export default async function ManageClassesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const activeTab = rawTab || "Regular";

  // Tambahkan kategori PINDAH_GURU
  const categories = ["Regular", "Nursery", "Preschool", "Bimbel", "Former Students", "PINDAH_SISWA", "PINDAH_GURU"];

  // Ambil daftar kelas untuk form dan tabel
  const levels = await prisma.level.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { siswas: true, gurus: true } }
    }
  });

  // Ambil daftar siswa khusus untuk tab Pindah Siswa
const students = await prisma.user.findMany({
    where: { role: "SISWA" },
    include: { siswaProfile: { include: { levels: true } } }, // 🟢 Perhatikan 'levels: true'
    orderBy: { name: 'asc' }
  });

  // Ambil daftar guru khusus untuk tab Pindah/Assign Guru
  const teachers = await prisma.user.findMany({
    where: { role: "GURU" },
    // Asumsi relasi di schema Prisma: guruProfile memiliki relasi array ke level/kelas
    include: { guruProfile: { include: { levels: true } } }, 
    orderBy: { name: 'asc' }
  });

  const filteredLevels = levels.filter(l => l.category === activeTab);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Kelola Level & Kelas</h1>
        <p className="text-slate-500 mt-1">Manajemen kelas, pergerakan siswa, dan penugasan guru.</p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex space-x-2 border-b border-slate-200 mb-8 overflow-x-auto">
        {categories.map((kategori) => {
          const isActive = activeTab === kategori;
          let label = kategori;
          if (kategori === "PINDAH_SISWA") label = "🔄 Pindah Siswa";
          if (kategori === "PINDAH_GURU") label = "👨‍🏫 Assign Guru";
          
          return (
            <Link 
              key={kategori} href={`?tab=${kategori}`}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
                isActive 
                  ? (kategori.includes("PINDAH") ? "border-amber-500 text-amber-600" : "border-indigo-600 text-indigo-700") 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: FORM */}
        <div className="lg:col-span-1">
          {activeTab === "PINDAH_SISWA" ? (
            <MoveStudentForm students={students} levels={levels} />
          ) : activeTab === "PINDAH_GURU" ? (
            <MoveTeacherForm teachers={teachers} levels={levels} />
          ) : (
            <AddClassForm activeTab={activeTab} />
          )}
        </div>

        {/* KOLOM KANAN: TABEL */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {activeTab === "PINDAH_SISWA" ? "Daftar Penempatan Siswa" 
                 : activeTab === "PINDAH_GURU" ? "Daftar Penugasan Guru" 
                 : `Daftar Kelas ${activeTab}`}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-slate-400">
                  <tr>
                    {activeTab === "PINDAH_SISWA" ? (
                      <>
                        <th className="p-4 font-semibold">Nama Siswa</th>
                        <th className="p-4 font-semibold">Kelas Saat Ini</th>
                      </>
                    ) : activeTab === "PINDAH_GURU" ? (
                      <>
                        <th className="p-4 font-semibold">Nama Guru</th>
                        <th className="p-4 font-semibold">Kelas Yang Diajar</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 font-semibold">Nama Kelas</th>
                        <th className="p-4 font-semibold text-center">Jumlah Siswa</th>
                        <th className="p-4 font-semibold text-center">Jumlah Guru</th>
                        <th className="p-4 font-semibold text-right">Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  
                  {/* TABEL PINDAH SISWA */}
                  {activeTab === "PINDAH_SISWA" && students.map(s => {
  const assignedLevels = s.siswaProfile?.levels || [];
  return (
    <tr key={s.id} className="hover:bg-slate-50">
      <td className="p-4 font-bold text-slate-800">
        {s.name} 
        <span className="block text-xs text-slate-500 font-mono font-normal">NIS: {s.username}</span>
      </td>
      <td className="p-4">
        {assignedLevels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {assignedLevels.map((lvl: any) => (
              <span key={lvl.id} className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-bold border border-sky-100">
                {lvl.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic">Belum Ditempatkan</span>
        )}
      </td>
    </tr>
  );
})}
                  {/* TABEL PINDAH GURU */}
                  {activeTab === "PINDAH_GURU" && teachers.map(t => {
                    // Cek relasi array kelas/level pada guru
                    // Sesuaikan 'levels' dengan nama relasi many-to-many di schema Prisma Anda
                    const assignedLevels = (t.guruProfile as any)?.levels || []; 
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-800">{t.name}</td>
                        <td className="p-4">
                          {assignedLevels.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {assignedLevels.map((lvl: any) => (
                                <span key={lvl.id} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                  {lvl.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Belum Ditempatkan</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* TABEL DAFTAR KELAS (REGULAR, NURSERY, DLL) */}
                  {!activeTab.includes("PINDAH") && (
                    filteredLevels.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada kelas di kategori ini.</td></tr>
                    ) : (
                      filteredLevels.map(level => (
                        <tr key={level.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{level.name}</td>
                          <td className="p-4 text-center font-semibold text-sky-600">{level._count.siswas}</td>
                          <td className="p-4 text-center font-semibold text-indigo-600">{level._count.gurus}</td>
                          <td className="p-4 text-right">
                            <DeleteButton id={level.id} />
                          </td>
                        </tr>
                      ))
                    )
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
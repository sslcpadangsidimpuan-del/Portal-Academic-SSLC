import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PilihLevelKelas({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  // Menangkap kategori dari URL, default ke "Regular" jika tidak ada
  const { kategori: rawKategori } = await searchParams;
  const activeTab = rawKategori || "Regular";

  const categories = ["Regular", "Nursery", "Preschool", "Bimbel"];

  // Hanya mengambil kelas berdasarkan tab yang sedang aktif
  const daftarKelas = await prisma.level.findMany({
    where: { category: activeTab },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Choose Level & Class</h1>
        <p className="text-slate-500 mt-2">
           Please select a category and class to input the student's attendance, daily/semester report, or documentation.
        </p>
      </div>

      {/* --- DESAIN TAB NAVIGASI --- */}
      <div className="flex space-x-2 border-b border-slate-200 mb-8 overflow-x-auto">
        {categories.map((kategori) => {
          const isActive = activeTab === kategori;
          return (
            <Link 
              key={kategori}
              href={`?kategori=${kategori}`}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
                isActive 
                  ? "border-sky-500 text-sky-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              {kategori}
            </Link>
          );
        })}
      </div>

      {/* --- GRID DAFTAR KELAS --- */}
      {daftarKelas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daftarKelas.map((kelas) => (
            <div key={kelas.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{kelas.name}</h3>
              <p className="text-sm text-slate-500 mb-6">Class program {activeTab}</p>
              
              <Link 
                href={`/dashboard/guru/kelas/${kelas.id}`} 
                className="block w-full text-center bg-slate-50 text-sky-600 py-2.5 rounded-xl font-bold hover:bg-sky-500 hover:text-white transition-colors"
              >
                Enter the classroom
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <span className="text-4xl mb-4 block">📭</span>
          <h3 className="text-lg font-semibold text-slate-700">No classes yet</h3>
          <p className="text-slate-500 mt-1">Class for the {activeTab} program hasn't been added to the system yet.</p>
        </div>
      )}
    </div>
  );
}
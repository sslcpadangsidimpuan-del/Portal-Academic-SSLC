import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RuangKelasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const level = await prisma.level.findUnique({
    where: { id: id },
    include: {
      siswas: {
        include: {
          user: true, 
        },
      },
    },
  });

  if (!level) {
    notFound();
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/dashboard/guru/kelas" 
          className="text-sky-500 hover:text-sky-600 text-sm font-medium mb-4 inline-flex items-center gap-2"
        >
          ← Back to Class List
        </Link>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Classroom: {level.name}</h1>
            <p className="text-slate-500 mt-1">List of students and activities in class {level.name}.</p>
          </div>
          <div className="text-4xl">📚</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link 
          href={`/dashboard/guru/kelas/${level.id}/absensi`}
          className="flex items-center gap-3 sm:gap-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-4 rounded-xl transition-colors group"
        >
          <div className="w-12 h-12 shrink-0 bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            ✋
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-emerald-800 text-base sm:text-lg leading-tight mb-1 truncate">Class Attendance</h3>
            <p className="text-emerald-600 text-xs sm:text-sm leading-snug truncate">Take student attendance</p>
          </div>
        </Link>

        <Link 
          href={`/dashboard/guru/kelas/${level.id}/report`}
          className="flex items-center gap-3 sm:gap-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 p-4 rounded-xl transition-colors group"
        >
          <div className="w-12 h-12 shrink-0 bg-amber-200 text-amber-700 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📝
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-amber-800 text-base sm:text-lg leading-tight mb-1 truncate">Input Report</h3>
            <p className="text-amber-600 text-xs sm:text-sm leading-snug truncate">Make a daily/semester reportr</p>
          </div>
        </Link>

        <Link 
          href={`/dashboard/guru/kelas/${level.id}/photos/new`}
          className="flex items-center gap-3 sm:gap-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 p-4 rounded-xl transition-colors group"
        >
          <div className="w-12 h-12 shrink-0 bg-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📸
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-indigo-800 text-base sm:text-lg leading-tight mb-1 truncate">Class Gallery</h3>
            <p className="text-indigo-600 text-xs sm:text-sm leading-snug">Upload photos & videos of activities</p>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Student List ({level.siswas.length})</h2>
        
        {level.siswas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {level.siswas.map((siswa) => (
              <div key={siswa.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold">
                  {siswa.user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">{siswa.user.name}</h4>
                  <p className="text-xs text-slate-400">ID: {siswa.user.username}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500">No students have been added to this class yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
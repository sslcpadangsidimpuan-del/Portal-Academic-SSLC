import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DaftarSiswaReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const level = await prisma.level.findUnique({
    where: { id: id },
    include: {
      siswas: { include: { user: true } },
    },
  });

  if (!level) notFound();

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link 
          href={`/dashboard/guru/kelas/${id}`} 
          className="text-sky-500 hover:text-sky-600 text-sm font-medium mb-2 inline-flex items-center gap-2"
        >
          ← Kembali ke Ruang Kelas
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Input Laporan Harian dan Semester</h1>
        <p className="text-slate-500">Pilih siswa untuk menginput Laporan Harian dan Semester.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {level.siswas.map((siswa) => (
          <div key={siswa.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xl">
                {siswa.user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-700">{siswa.user.name}</h3>
                <p className="text-xs text-slate-400">NIS: {siswa.user.username}</p>
              </div>
            </div>

            {/* Dua Tombol Bersebelahan */}
            <div className="flex gap-2">
              <Link 
                href={`/dashboard/guru/kelas/${id}/report/${siswa.id}/harian`}
                className="flex-1 text-center py-2.5 bg-sky-50 text-sky-600 font-semibold rounded-xl hover:bg-sky-500 hover:text-white transition-colors text-sm"
              >
                Harian
              </Link>
              <Link 
                href={`/dashboard/guru/kelas/${id}/report/${siswa.id}/semester`}
                className="flex-1 text-center py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-500 hover:text-white transition-colors text-sm"
              >
                Semester
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
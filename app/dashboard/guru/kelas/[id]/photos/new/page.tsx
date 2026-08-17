import { prisma } from "@/lib/db";
import Link from "next/link";
import { handleUploadAction } from "./actions";
import { UploadForm } from "./upload-form";

export default async function UploadPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const level = await prisma.level.findUnique({
    where: { id },
    include: { siswas: { include: { user: true } } }
  });

  if (!level) return <div>Kelas tidak ditemukan.</div>;

  const boundUpload = handleUploadAction.bind(null, id); 

  return (
    <div className="p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link href={`/dashboard/guru/kelas/${id}`} className="text-indigo-500 hover:text-indigo-600 text-sm font-medium mb-2 inline-flex items-center gap-2">
          ← Kembali ke Kelas
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Unggah Dokumentasi</h1>
        <p className="text-slate-500 mt-1">Kelas: {level.name}</p>
      </div>

      <Link 
        href={`/dashboard/guru/kelas/${level.id}/photos`}
        className="flex items-center gap-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 p-4 rounded-xl transition-colors group mb-6"
      >
        <div className="w-12 h-12 shrink-0 bg-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          🖼️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-indigo-800 text-lg">Lihat Galeri Kelas</h3>
          <p className="text-indigo-600 text-sm">Lihat semua dokumentasi kelas ini</p>
        </div>
      </Link>

      <UploadForm action={boundUpload} students={level.siswas} />
    </div>
  );
}
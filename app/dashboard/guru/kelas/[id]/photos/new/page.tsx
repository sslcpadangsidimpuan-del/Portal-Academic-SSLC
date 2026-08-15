import { prisma } from "@/lib/db";
import Link from "next/link";
import { handleUploadAction } from "./actions"; // 👈 Impor Server Action

export default async function UploadPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const level = await prisma.level.findUnique({
    where: { id },
    include: { siswas: { include: { user: true } } }
  });

  if (!level) return <div>Kelas tidak ditemukan.</div>;

  // 👈 Bind parameter `id` kelas ke dalam Server Action
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

      {/* Gunakan boundUpload sebagai action form */}
      <form action={boundUpload} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-rose-600 text-sm font-bold leading-relaxed">
            *Foto atau Video akan dihapus secara otomatis dalam 30 hari sejak tanggal upload.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Foto / Video (Bisa lebih dari 1)</label>
          <input 
            type="file" 
            name="media" 
            accept="image/*,video/mp4,video/quicktime,video/x-m4v" 
            multiple 
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            required 
          />
          <p className="text-xs text-slate-400 mt-2">Dukung format: JPG, PNG, MP4. Sistem otomatis mengompresi ukuran foto.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Caption / Deskripsi Singkat <span className="text-slate-400 font-normal">(Opsional)</span></label>
          <textarea 
            name="caption" 
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
            placeholder="Tulis kegiatan apa yang sedang berlangsung..." 
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">Jenis & Ruang Lingkup Media</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="cursor-pointer">
              <input type="radio" name="visibility" value="public" className="peer sr-only" defaultChecked />
              <div className="h-full p-4 rounded-xl border-2 border-slate-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all flex flex-col justify-between">
                <div>
                  <p className="font-bold text-indigo-900">🌍 Global Kelas</p>
                  <p className="text-[11px] leading-tight text-slate-500 mt-1">Muncul di galeri semua orang tua & siswa di KELAS INI.</p>
                </div>
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="radio" name="visibility" value="event" className="peer sr-only" />
              <div className="h-full p-4 rounded-xl border-2 border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 transition-all flex flex-col justify-between">
                <div>
                  <p className="font-bold text-amber-900">🎉 Event Sekolah</p>
                  <p className="text-[11px] leading-tight text-slate-500 mt-1">Muncul di SEMUA galeri siswa di seluruh kelas SSLC.</p>
                </div>
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="radio" name="visibility" value="private" className="peer sr-only" />
              <div className="h-full p-4 rounded-xl border-2 border-slate-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all flex flex-col justify-between">
                <div>
                  <p className="font-bold text-purple-900">🎯 Tag Spesifik</p>
                  <p className="text-[11px] leading-tight text-slate-500 mt-1">Hanya muncul di galeri anak yang Anda tandai di bawah.</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Tandai Siswa <span className="text-slate-400 font-normal">(Wajib jika memilih Tag Spesifik)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
            {level.siswas.map((siswa) => (
              <label key={siswa.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors">
                <input type="checkbox" name="students" value={siswa.id} className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm font-medium text-slate-700">{siswa.user.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
          <span>📤</span> Unggah Semua Media
        </button>
      </form>
    </div>
  );
}
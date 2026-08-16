import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Helper client Supabase (Lazy Initialization agar aman saat build)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

export default async function GaleriKelasGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch data kelas
  const level = await prisma.level.findUnique({
    where: { id }
  });

  if (!level) notFound();

  // FIX UTAMA: Ambil foto milik kelas INI + foto Event Sekolah (levelId: null & isPublic: true)
  const photos = await prisma.photo.findMany({
    where: {
      OR: [
        { levelId: id },          // Foto spesifik kelas ini
        { levelId: null, isPublic: true } // Event Sekolah untuk semua kelas
      ]
    },
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { include: { user: true } },
      tags: { include: { siswa: { include: { user: true } } } }
    }
  });

  // Action Hapus Foto/Video (Database + Supabase Cloud Storage)
  async function handleDeleteMedia(formData: FormData) {
    "use server";
    const photoId = formData.get("photoId") as string;
    if (!photoId) return;

    // Inisialisasi Supabase hanya saat action dijalankan (Runtime)
    const supabase = getSupabaseClient();

    // 1. Ambil data foto di DB untuk mendapatkan URL filenya
    const photoRecord = await prisma.photo.findUnique({
      where: { id: photoId }
    });

    if (photoRecord && photoRecord.url) {
      try {
        const urlParts = photoRecord.url.split('/');
        const filename = urlParts[urlParts.length - 1];

        if (filename) {
          await supabase.storage.from('media').remove([filename]);
        }
      } catch (err) {
        console.error("Gagal menghapus file dari Supabase Storage:", err);
      }
    }

    // 2. Hapus record dari database Prisma
    await prisma.photo.delete({ where: { id: photoId } });
    
    revalidatePath(`/dashboard/guru/kelas/${id}/photos`);
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER NAVIGASI */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href={`/dashboard/guru/kelas/${id}`} 
            className="text-indigo-500 hover:text-indigo-600 text-xs sm:text-sm font-semibold mb-2 inline-flex items-center gap-1.5"
          >
            ← Kembali ke Ruang Kelas
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Galeri Kelas {level.name}</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Semua foto dan video dokumentasi aktivitas belajar siswa & event sekolah</p>
        </div>

        <Link
          href={`/dashboard/guru/kelas/${id}/photos/new`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <span>📤</span> Upload Foto / Video
        </Link>
      </div>

      {/* PERINGATAN MASA SIMPAN / RETENTION NOTE */}
      <div className="bg-rose-50 border border-rose-200 p-3.5 sm:p-4 rounded-xl mb-6 flex items-start gap-3">
        <span className="text-lg leading-none">⚠️</span>
        <p className="text-rose-700 text-xs sm:text-sm font-semibold leading-relaxed">
          *Foto atau Video akan dihapus secara otomatis dalam 30 hari sejak tanggal upload.
        </p>
      </div>

      {/* GRID GALERI MEDIA */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {photos.map((item) => {
            const isVideo = item.fileType === "video" || item.url.endsWith(".mp4") || item.url.endsWith(".mov");

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* CONTAINER MEDIA */}
                <div className="relative bg-slate-900 aspect-video sm:aspect-square w-full overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <video 
                      src={item.url} 
                      controls 
                      playsInline 
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.caption || "Dokumentasi Kelas"} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                      loading="lazy"
                    />
                  )}

                  {isVideo && (
                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 pointer-events-none">
                      ▶ Video
                    </span>
                  )}
                </div>

                {/* INFORMASI MEDIA & CAPTION */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {item.isPublic && !item.levelId ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🎉 Event Sekolah</span>
                      ) : item.isPublic ? (
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🌍 Global Kelas</span>
                      ) : (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🎯 Tag Spesifik</span>
                      )}
                      
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {item.caption ? (
                      <p className="text-slate-800 text-xs sm:text-sm font-medium leading-snug break-words">
                        {item.caption}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-xs">Tanpa deskripsi.</p>
                    )}

                    {item.tags.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 mb-1">Siswa Ditandai:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map(t => (
                            <span key={t.id} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              👤 {t.siswa.user.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FOOTER UPLOADER & HAPUS */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">Oleh: <strong className="text-slate-600">{item.uploader?.user?.name || "Guru"}</strong></span>
                    
                    <form action={handleDeleteMedia}>
                      <input type="hidden" name="photoId" value={item.id} />
                      <button 
                        type="submit" 
                        className="text-rose-500 hover:text-rose-700 font-bold p-1 transition cursor-pointer"
                        title="Hapus media"
                      >
                        🗑️ Hapus
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">📸</div>
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Dokumentasi</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            Kelas ini belum memiliki foto atau video kegiatan. Klik tombol upload di atas untuk menambahkan.
          </p>
        </div>
      )}

    </div>
  );
}
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function SiswaPhotoGalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. Cari profil siswa yang sedang login beserta relasi multi-kelas (levels) nya
  const currentUser = await prisma.user.findUnique({
    where: { username: (session.user as any).username },
    include: {
      siswaProfile: {
        include: {
          levels: true
        }
      }
    }
  });

  const siswa = currentUser?.siswaProfile;
  const assignedLevels = siswa?.levels || [];
  const levelIds = assignedLevels.map((l) => l.id);

  if (!siswa || assignedLevels.length === 0) {
    return (
      <div className="p-4 sm:p-8 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-xl mx-auto mt-6 sm:mt-12 mx-4">
        <p className="text-slate-500 font-medium text-sm sm:text-base">Profil siswa atau data kelas tidak ditemukan.</p>
      </div>
    );
  }

  // 2. Ambil foto/video berdasarkan multi-kelas siswa atau event sekolah (levelId null)
  const dokumentasiFoto = await prisma.photo.findMany({
    where: {
      OR: [
        { levelId: null }, 
        {
          levelId: { in: levelIds },
          OR: [
            { isPublic: true }, 
            { tags: { some: { siswaId: siswa.id } } } 
          ]
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      tags: {
        include: {
          siswa: { include: { user: true } }
        }
      }
    }
  });

  return (
    <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full box-border">
      
      {/* HEADER GALERI RESPONSIF */}
      <div className="mb-4 sm:mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Dokumentasi Aktivitas</h1>
        <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-base leading-relaxed">
          Kumpulan momen pembelajaran dan kreativitas {currentUser.name} selama di kelas.
        </p>
      </div>

      {/* CATATAN MASA SIMPAN / RETENTION WARNING NOTE */}
      <div className="bg-rose-50 border border-rose-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-5 sm:mb-8 flex items-start gap-2.5 sm:gap-3">
        <span className="text-base sm:text-xl leading-none">⚠️</span>
        <p className="text-rose-700 text-xs sm:text-sm font-semibold leading-snug sm:leading-relaxed">
          *Foto atau Video akan dihapus secara otomatis dalam 30 hari sejak tanggal upload.
        </p>
      </div>

      {/* GRID FOTO & VIDEO SEPERTI INSTAGRAM EXPLORE (RESPONSIF MOBILE-FIRST) */}
      {dokumentasiFoto.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {dokumentasiFoto.map((item) => {
            const isVideo = item.fileType === "video" || item.url.endsWith(".mp4") || item.url.endsWith(".mov");

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 relative"
              >
                
                {/* Badge Petunjuk Visibilitas (Top Left) */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 pointer-events-none">
                  {item.levelId === null ? (
                    <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-xs shadow-xs">
                      🎉 Event
                    </span>
                  ) : item.isPublic ? (
                    <span className="bg-emerald-500/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-xs shadow-xs">
                      🌍 Kelas
                    </span>
                  ) : (
                    <span className="bg-purple-600/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-xs shadow-xs">
                      ✨ Kamu
                    </span>
                  )}
                </div>

                {/* AREA PEMUTAR MEDIA (FOTO ATAU VIDEO) */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden group/image flex items-center justify-center">
                  {isVideo ? (
                    <video 
                      src={item.url} 
                      controls 
                      playsInline 
                      preload="metadata"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.caption || "Dokumentasi Belajar"} 
                      className="object-cover w-full h-full group-hover/image:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Tombol Simpan/Download melayang (Hanya untuk foto/layar sentuh) */}
                  {!isVideo && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs p-2 pointer-events-none group-hover/image:pointer-events-auto">
                      <a
                        href={item.url}
                        download={`Dokumentasi_${new Date(item.createdAt).getTime()}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs shadow-md transition-all flex items-center gap-1.5 transform translate-y-2 group-hover/image:translate-y-0 duration-300 text-center"
                      >
                        📥 <span className="inline">Simpan Foto</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* DETAIL BAWAH CARD */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between bg-slate-50/30 border-t border-slate-100 space-y-1.5 sm:space-y-2">
                  <div>
                    {/* CAPTION DESKRIPSI */}
                    {item.caption ? (
                      <p className="text-[11px] sm:text-xs text-slate-800 font-semibold leading-snug line-clamp-2 break-words mb-1">
                        {item.caption}
                      </p>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-slate-400 italic mb-1">Tanpa deskripsi</p>
                    )}

                    {/* TANGGAL UPLOAD */}
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Info Foto Privat */}
                  {!item.isPublic && item.tags.length > 0 && (
                    <div className="pt-1 border-t border-slate-100 hidden sm:block">
                      <span className="bg-purple-50 text-purple-700 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-medium border border-purple-100 inline-block w-full text-center truncate">
                        Eksklusif Ditag
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 sm:py-24 text-center bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 px-4">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📸</div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700">Belum ada media</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
            Foto atau video aktivitas belajar mengajar di kelas Anda akan dibagikan oleh guru di sini.
          </p>
        </div>
      )}
    </div>
  );
}
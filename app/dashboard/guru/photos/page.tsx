import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function GlobalGalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // A. Ambil foto/video Event Sekolah (yang tidak punya levelId)
  const schoolEvents = await prisma.photo.findMany({
    where: { levelId: null },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // B. Ambil data kelas yang memiliki foto/video internal
  const levelsWithPhotos = await prisma.level.findMany({
    where: {
      photos: {
        some: {} 
      }
    },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        take: 10, 
        include: {
          tags: {
            include: {
              siswa: {
                include: { user: true }
              }
            }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto w-full box-border">
      
      {/* HEADER GALERI GLOBAL */}
      <div className="mb-6 sm:mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Galeri Global</h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-base leading-relaxed">
          Pantau seluruh dokumentasi aktivitas belajar dari semua kelas dan event yang ada.
        </p>
      </div>

      {/* CATATAN MASA SIMPAN / RETENTION WARNING NOTE */}
      <div className="bg-rose-50 border border-rose-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl mb-8 flex items-start gap-2.5 sm:gap-3">
        <span className="text-base sm:text-xl leading-none">⚠️</span>
        <p className="text-rose-700 text-xs sm:text-sm font-semibold leading-snug sm:leading-relaxed">
          *Foto atau Video akan dihapus secara otomatis dalam 30 hari sejak tanggal upload.
        </p>
      </div>

      <div className="space-y-10 sm:space-y-12">
        
        {/* ================= BARIS 1: EVENT SEKOLAH ================= */}
        {schoolEvents.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-7 sm:h-8 bg-amber-500 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">🎉 Event & Acara Sekolah</h2>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
              {schoolEvents.map((item) => {
                const isVideo = item.fileType === "video" || item.url.endsWith(".mp4") || item.url.endsWith(".mov");

                return (
                  <div 
                    key={item.id} 
                    className="snap-start shrink-0 w-[240px] sm:w-[280px] bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col group hover:shadow-md transition-shadow relative"
                  >
                    {/* Badge Event */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 pointer-events-none">
                      <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                        🎉 Event Sekolah
                      </span>
                    </div>

                    {/* Area Media */}
                    <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
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
                          alt={item.caption || "Event Sekolah"}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Detail Card */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-slate-50/50 space-y-2">
                      <div>
                        {/* Caption */}
                        {item.caption ? (
                          <p className="text-[11px] sm:text-xs text-slate-800 font-semibold leading-snug line-clamp-2 break-words mb-1.5">
                            {item.caption}
                          </p>
                        ) : (
                          <p className="text-[10px] sm:text-xs text-slate-400 italic mb-1.5">Tanpa deskripsi</p>
                        )}

                        <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tanggal Unggah</p>
                        <p className="text-[10px] sm:text-xs text-slate-700 font-medium">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= BARIS 2: PER KELAS ================= */}
        {levelsWithPhotos.length > 0 ? (
          levelsWithPhotos.map((level) => (
            <div key={level.id} className="relative">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-7 sm:h-8 bg-indigo-500 rounded-full"></span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{level.name}</h2>
                </div>
                <Link 
                  href={`/dashboard/guru/kelas/${level.id}/photos`}
                  className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                {level.photos.map((item) => {
                  const isVideo = item.fileType === "video" || item.url.endsWith(".mp4") || item.url.endsWith(".mov");

                  return (
                    <div 
                      key={item.id} 
                      className="snap-start shrink-0 w-[240px] sm:w-[280px] bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col group hover:shadow-md transition-shadow relative"
                    >
                      {/* Badge Visibilitas */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 pointer-events-none">
                        {item.isPublic ? (
                          <span className="bg-emerald-500/95 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                            🌍 Global Kelas
                          </span>
                        ) : (
                          <span className="bg-indigo-600/95 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                            🎯 Tag ({item.tags.length})
                          </span>
                        )}
                      </div>

                      {/* Area Media */}
                      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
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
                            alt={item.caption || `Dokumentasi ${level.name}`}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Detail Card */}
                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-slate-50/50 space-y-2">
                        <div>
                          {/* Caption */}
                          {item.caption ? (
                            <p className="text-[11px] sm:text-xs text-slate-800 font-semibold leading-snug line-clamp-2 break-words mb-1.5">
                              {item.caption}
                            </p>
                          ) : (
                            <p className="text-[10px] sm:text-xs text-slate-400 italic mb-1.5">Tanpa deskripsi</p>
                          )}

                          <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tanggal Unggah</p>
                          <p className="text-[10px] sm:text-xs text-slate-700 font-medium">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Tagged Students */}
                        {!item.isPublic && item.tags.length > 0 && (
                          <div className="pt-2 mt-2 border-t border-slate-200/60">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span key={tag.id} className="bg-white border border-slate-200 text-slate-600 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                                  {tag.siswa.user.name.split(' ')[0]}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                  +{item.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          schoolEvents.length === 0 && (
            <div className="py-16 sm:py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 mt-8">
              <div className="text-5xl sm:text-6xl mb-4">🖼️</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-700">Galeri Masih Kosong</h3>
              <p className="text-slate-500 mt-2 text-xs sm:text-sm max-w-md mx-auto">
                Belum ada dokumentasi foto atau video dari kelas maupun event manapun.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
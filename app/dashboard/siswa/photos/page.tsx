import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SiswaPhotoGalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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
        <p className="text-slate-500 font-medium text-sm sm:text-base">Information Not found</p>
      </div>
    );
  }

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
      <div className="mb-4 sm:mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Gallery</h1>
        <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-base leading-relaxed">
          {currentUser.name}'s Learning and Creativity Moments.
        </p>
      </div>

      <div className="bg-rose-50 border border-rose-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-5 sm:mb-8 flex items-start gap-2.5 sm:gap-3">
        <span className="text-base sm:text-xl leading-none">⚠️</span>
        <p className="text-rose-700 text-xs sm:text-sm font-semibold leading-snug sm:leading-relaxed">
          *Photos or videos will be automatically deleted 30 days after the upload date.
        </p>
      </div>

      {dokumentasiFoto.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {dokumentasiFoto.map((item) => {
            const isVideo = item.fileType === "video" || item.url.endsWith(".mp4") || item.url.endsWith(".mov");

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 relative"
              >
                {/* Badge Tag */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 pointer-events-none">
                  {item.levelId === null ? (
                    <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-xs shadow-xs">
                      🎉 Event
                    </span>
                  ) : item.isPublic ? (
                    <span className="bg-emerald-500/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-xs shadow-xs">
                      🌍 Class
                    </span>
                  ) : (
                    <span className="bg-purple-600/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-xs shadow-xs">
                      ✨ Yours
                    </span>
                  )}
                </div>

                {/* Media Preview (Foto / Video) */}
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
                      alt={item.caption || "Dokumentasi Belajar"} 
                      className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Card Footer Info & Download Button Statis */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between bg-slate-50/30 border-t border-slate-100 space-y-2">
                  <div>
                    {item.caption ? (
                      <p className="text-[11px] sm:text-xs text-slate-800 font-semibold leading-snug line-clamp-2 break-words mb-1">
                        {item.caption}
                      </p>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-slate-400 italic mb-1">No Desc</p>
                    )}

                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* 📥 Tombol Download Statis (Selalu Terlihat di HP/Desktop) */}
                  <a
                    href={item.url}
                    download={`Dokumentasi_${new Date(item.createdAt).getTime()}.${isVideo ? 'mp4' : 'jpg'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-1.5 sm:py-2 px-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-95"
                  >
                    <span>📥</span> Download {isVideo ? 'Video' : 'Photo'}
                  </a>

                  {!item.isPublic && item.tags.length > 0 && (
                    <div className="pt-1 border-t border-slate-100 hidden sm:block">
                      <span className="bg-purple-50 text-purple-700 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-medium border border-purple-100 inline-block w-full text-center truncate">
                        Tagged
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
          <h3 className="text-lg sm:text-xl font-bold text-slate-700">Galery is Empty</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
            Photos or videos of classroom learning activities will be shared by the teacher here.
          </p>
        </div>
      )}
    </div>
  );
}
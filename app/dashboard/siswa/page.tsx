import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ContactAdmin from "@/app/components/ContactAdmin";

// Mencegah Next.js melakukan static prerendering saat build time
export const dynamic = "force-dynamic";

export default async function SiswaDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const username = (session.user as any).username;

  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      siswaProfile: {
        include: { levels: true }
      }
    }
  });

  if (!user) return <div className="p-8 text-center text-slate-500">Data tidak ditemukan.</div>;

  const myNotifications = await prisma.notificationRecipient.findMany({
    where: { userId: user.id },
    include: { notification: true },
    orderBy: { notification: { createdAt: 'desc' } }
  });

  return (
    <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Banner Ucapan Selamat Datang */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg shadow-emerald-100/60">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2 tracking-tight">
          Halo, {user.name}! 👋
        </h1>
        <p className="text-emerald-50 opacity-90 text-sm sm:text-base md:text-lg leading-relaxed">
          Selamat datang di portal akademik Smart Step Learning Center.
        </p>
      </div>

      {/* Info Singkat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card 1: Kelas */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3 sm:gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0">
            🎓
          </div>
          <div className="min-w-0">
            <h3 className="text-slate-400 sm:text-slate-500 text-xs sm:text-sm font-semibold tracking-wide uppercase">Kelas Saat Ini</h3>
            {user.siswaProfile?.levels && user.siswaProfile.levels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {user.siswaProfile.levels.map((lvl: any) => (
                  <span key={lvl.id} className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                    {lvl.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-base sm:text-xl font-bold text-slate-400 truncate mt-0.5">
                Belum masuk kelas
              </p>
            )}
          </div>
        </div>
        
        {/* Card 2: NIS */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3 sm:gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sky-50 text-sky-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0">
            🪪
          </div>
          <div className="min-w-0">
            <h3 className="text-slate-400 sm:text-slate-500 text-xs sm:text-sm font-semibold tracking-wide uppercase">Nomor Induk Siswa</h3>
            <p className="text-base sm:text-xl font-bold text-slate-800 truncate mt-0.5">{user.username}</p>
          </div>
        </div>
      </div>

      {/* Area Pengumuman */}
      {myNotifications.length > 0 && (
        <div className="pt-2">
          <h2 className="text-xs font-bold text-slate-400 sm:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📌</span> Pengumuman Penting
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            {myNotifications.map((item) => {
              const notif = item.notification;
              const bgColor = notif.type === "WARNING" ? "bg-amber-50/70" : notif.type === "SUCCESS" ? "bg-emerald-50/70" : "bg-sky-50/70";
              const borderColor = notif.type === "WARNING" ? "border-amber-200/80" : notif.type === "SUCCESS" ? "border-emerald-200/80" : "border-sky-200/80";
              const textColor = notif.type === "WARNING" ? "text-amber-800" : notif.type === "SUCCESS" ? "text-emerald-800" : "text-sky-800";
              const icon = notif.type === "WARNING" ? "⚠️" : notif.type === "SUCCESS" ? "🎉" : "ℹ️";

              return (
                <div 
                  key={notif.id} 
                  className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border shadow-xs flex items-start gap-3 sm:gap-4 transition-all hover:shadow-sm backdrop-blur-xs ${bgColor} ${borderColor}`}
                >
                  <div className="text-xl sm:text-2xl mt-0.5 shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h3 className={`text-sm sm:text-base font-bold ${textColor} leading-tight truncate`}>
                        {notif.title}
                      </h3>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold bg-white/80 border border-slate-100 px-2 py-0.5 rounded-full w-fit shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {notif.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
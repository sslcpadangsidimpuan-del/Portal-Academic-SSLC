import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GuruDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const username = (session.user as any).username;

  const user = await prisma.user.findUnique({
    where: { username: username },
    include: { guruProfile: true }
  });

  if (!user) return <div>Data tidak ditemukan.</div>;

  const myNotifications = await prisma.notificationRecipient.findMany({
    where: { userId: user.id },
    include: { notification: true },
    orderBy: { notification: { createdAt: 'desc' } }
  });

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="bg-blue-600 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm mb-6">
        <h1 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2 flex items-center gap-2">
          Halo, {user.name}! 👋
        </h1>
        <p className="text-xs sm:text-base text-blue-100 font-medium">
          Selamat datang di portal manajemen kelas Anda.
        </p>
      </div>

      {myNotifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📌</span> Pengumuman Penting
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {myNotifications.map((item) => {
              const notif = item.notification;
              const bgColor = notif.type === "WARNING" ? "bg-amber-50" : notif.type === "SUCCESS" ? "bg-emerald-50" : "bg-sky-50";
              const borderColor = notif.type === "WARNING" ? "border-amber-200" : notif.type === "SUCCESS" ? "border-emerald-200" : "border-sky-200";
              const textColor = notif.type === "WARNING" ? "text-amber-800" : notif.type === "SUCCESS" ? "text-emerald-800" : "text-sky-800";
              const icon = notif.type === "WARNING" ? "⚠️" : notif.type === "SUCCESS" ? "🎉" : "ℹ️";

              return (
                <div key={notif.id} className={`p-5 rounded-2xl border shadow-sm flex items-start gap-4 transition-all hover:shadow-md ${bgColor} ${borderColor}`}>
                  <div className="text-2xl mt-0.5">{icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1.5">
                      <h3 className={`text-base font-bold ${textColor}`}>{notif.title}</h3>
                      <span className="text-[10px] text-slate-500 font-medium bg-white/60 px-2 py-0.5 rounded-full w-fit">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{notif.content}</p>
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
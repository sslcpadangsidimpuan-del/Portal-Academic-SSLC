import { prisma } from "@/lib/db";
import CreateNotificationForm from "./CreateNotificationForm";
import { deleteGlobalNotification, dismissForUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function ManageNotificationsPage() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["GURU", "SISWA"] } },
    orderBy: { name: 'asc' }
  });

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      recipients: {
        include: { user: true }
      }
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Notification</h1>
        <p className="text-slate-500 mt-1">Manage notifications, bills, and mass messages for users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <CreateNotificationForm users={users} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Announcement Sent & Active.</h2>
          
          {notifications.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center text-slate-400">
              No announcements have been posted yet.
            </div>
          ) : (
            notifications.map(notif => {
              const bgColor = notif.type === "WARNING" ? "bg-amber-50" : notif.type === "SUCCESS" ? "bg-emerald-50" : "bg-sky-50";
              const borderColor = notif.type === "WARNING" ? "border-amber-200" : notif.type === "SUCCESS" ? "border-emerald-200" : "border-sky-200";
              const textColor = notif.type === "WARNING" ? "text-amber-800" : notif.type === "SUCCESS" ? "text-emerald-800" : "text-sky-800";

              return (
                <div key={notif.id} className={`p-6 rounded-2xl border shadow-sm ${bgColor} ${borderColor}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 ${textColor}`}>
                          Target: {notif.targetRole}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h3 className={`text-lg font-bold ${textColor}`}>{notif.title}</h3>
                    </div>
                    
                    <form action={deleteGlobalNotification}>
                      <input type="hidden" name="id" value={notif.id} />
                      <button type="submit" className="bg-white/80 hover:bg-white text-rose-500 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors border border-rose-100">
                        Delete All
                      </button>
                    </form>
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-6">{notif.content}</p>

                  <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                      Still airing on {notif.recipients.length} Users:
                    </p>
                    {notif.recipients.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">All targets have been deleted / there are no targets.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {notif.recipients.map(recipient => (
                          <div key={recipient.id} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <span className="text-xs font-semibold text-slate-700 px-3 py-1.5">
                              {recipient.user.name}
                            </span>
                            <form action={dismissForUser} className="border-l border-slate-100">
                              <input type="hidden" name="notificationId" value={notif.id} />
                              <input type="hidden" name="userId" value={recipient.userId} />
                              <button type="submit" className="px-2 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" title="Cabut notif dari pengguna ini">
                                ✖
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
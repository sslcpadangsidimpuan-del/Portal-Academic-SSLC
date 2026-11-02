import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordButton from "@/app/components/ChangePasswordButton";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const username = (session.user as any)?.username;

  const currentUser = username 
    ? await prisma.user.findUnique({ where: { username } })
    : null;

  if (!currentUser) {
    return <div className="p-8 text-center text-rose-500">Profil Admin tidak ditemukan.</div>;
  }

  // Proteksi role aman: Mengizinkan ADMIN maupun SUPER_ADMIN
  if (!["ADMIN", "SUPER_ADMIN"].includes(currentUser.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Profile</h1>
        <p className="text-slate-500 mt-1">Manage your administrator account information and security.</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Account Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-400">Full Name</p>
              <p className="font-bold text-slate-700 text-lg">{currentUser.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Username / ID</p>
              <p className="font-bold text-slate-700 text-lg">{currentUser.username}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Role</p>
              <p className="font-bold text-indigo-700 text-xs mt-1 px-3 py-1 bg-indigo-50 inline-block rounded-full border border-indigo-100">
                {currentUser.role}
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Security & Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun administrator.
            </p>
            <ChangePasswordButton />
          </div>

        </div>
      </div>
    </div>
  );
}
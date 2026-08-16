import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BiodataSiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = (session.user as any).username;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      siswaProfile: {
        include: {
          levels: true,
        },
      },
    },
  });

  const sp = user?.siswaProfile;

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Biodata Siswa
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Informasi data diri dan pendaftaran di Smart Step Learning Center.
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
        {/* AKUN & KELAS */}
        <div className="bg-indigo-50/60 p-4 sm:p-6 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Nama Lengkap Siswa
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">
              {user?.name}
            </h2>
            <p className="text-xs font-mono text-indigo-600 mt-1">
              NIS / Student ID: {user?.username}
            </p>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-indigo-100 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Kelas Saat Ini
            </span>
            {sp?.levels && sp.levels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {sp.levels.map((lvl: any) => (
                  <span key={lvl.id} className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {lvl.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm font-extrabold text-slate-400">
                Belum Masuk Kelas
              </span>
            )}
          </div>
        </div>

        {/* 1. DATA PRIBADI SISWA */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
            1. Data Pribadi Siswa
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Tanggal Lahir</span>
              <span className="font-bold text-slate-700">{formatDate(sp?.dateOfBirth)}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Jenis Kelamin</span>
              <span className="font-bold text-slate-700">{sp?.gender || "-"}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Agama</span>
              <span className="font-bold text-slate-700">{sp?.religion || "-"}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block">Asal Sekolah</span>
              <span className="font-bold text-slate-700">{sp?.schoolOrigin || "-"}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 sm:col-span-2">
              <span className="text-xs text-slate-400 font-semibold block">Tanggal Bergabung (Join Date)</span>
              <span className="font-bold text-slate-700">{formatDate(sp?.joinDate)}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 sm:col-span-2">
              <span className="text-xs text-slate-400 font-semibold block">Alamat Siswa</span>
              <span className="font-bold text-slate-700">{sp?.address || "-"}</span>
            </div>
          </div>
        </div>

        {/* 2. DATA ORANG TUA */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
            2. Data Orang Tua (Parent's Info)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-700 font-semibold block">Nama Ayah</span>
              <span className="font-bold text-slate-800">{sp?.fatherName || "-"}</span>
              {sp?.fatherOccupation && (
                <span className="text-xs text-slate-500 block mt-0.5">Pekerjaan: {sp.fatherOccupation}</span>
              )}
            </div>
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-700 font-semibold block">Nama Ibu</span>
              <span className="font-bold text-slate-800">{sp?.motherName || "-"}</span>
              {sp?.motherOccupation && (
                <span className="text-xs text-slate-500 block mt-0.5">Pekerjaan: {sp.motherOccupation}</span>
              )}
            </div>
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 sm:col-span-2">
              <span className="text-xs text-amber-700 font-semibold block">Nomor Telepon / WA Orang Tua</span>
              <span className="font-bold text-emerald-600">{sp?.parentPhone || "-"}</span>
            </div>
          </div>
        </div>

        {/* 3. DATA WALI */}
        {sp?.guardianName && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
              3. Data Wali (Guardian)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block">Nama Wali</span>
                <span className="font-bold text-slate-700">{sp.guardianName}</span>
                {sp.guardianOccupation && (
                  <span className="text-xs text-slate-500 block mt-0.5">Pekerjaan: {sp.guardianOccupation}</span>
                )}
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block">Telepon Wali</span>
                <span className="font-bold text-slate-700">{sp.guardianPhone || "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
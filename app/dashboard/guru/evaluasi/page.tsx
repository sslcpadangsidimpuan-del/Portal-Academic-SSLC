import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EvaluasiClient from "./EvaluasiClient";

export default async function EvaluasiRaporPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "GURU") redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { username: (session.user as any).username },
    include: { guruProfile: true }
  });

  const guruId = currentUser?.guruProfile?.id;
  if (!guruId) return <div className="p-8">Profil Guru tidak ditemukan.</div>;

  // Ambil SEMUA kelas tanpa batasan penugasan guru, beserta data siswanya
  const levels = await prisma.level.findMany({
    include: {
      siswas: { include: { user: true } }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 box-border w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Evaluasi & Rapor</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Pantau riwayat, edit laporan, dan cetak rapor akhir.</p>
        </div>
      </div>
      
      {/* Panggil komponen Client interaktif */}
      <EvaluasiClient levels={levels} guruId={guruId} />
    </div>
  );
}
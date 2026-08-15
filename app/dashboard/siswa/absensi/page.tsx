import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import KalenderAbsensiClient from "./KalenderAbsensiClient";

export default async function AbsensiSiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = (session.user as any).username;

  // Mengambil data siswa beserta relasi multi-kelas (levels)
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      siswaProfile: {
        include: {
          levels: true, // Ambil seluruh daftar kelas yang di-assign
          dailyReports: {
            include: { 
              guru: { include: { user: true } },
              level: true // Relasi kelas pada laporan harian
            }
          },
          absensi: {
            include: {
              level: true // Relasi kelas pada absensi
            }
          }
        }
      }
    }
  });

  const siswaProfile = user?.siswaProfile;
  const levels = siswaProfile?.levels ?? [];
  const dataAbsensi = siswaProfile?.absensi ?? [];
  const dataLaporan = siswaProfile?.dailyReports ?? [];

  return (
    <KalenderAbsensiClient 
      levels={levels}
      dataAbsensi={dataAbsensi} 
      dataLaporan={dataLaporan} 
      siswaName={user?.name || "Student"} 
      siswaUsername={user?.username || "-"} 
    />
  );
}
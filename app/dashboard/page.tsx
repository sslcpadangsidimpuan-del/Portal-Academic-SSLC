import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";


export default async function DashboardGateway() {
  const session = await getServerSession(authOptions);

  // 1. Lapis Keamanan Pertama: Jika tidak ada sesi aktif, kembali ke login
  if (!session || !session.user) {
    redirect("/login");
  }

  // 2. Mengambil Role
  const userRole = (session.user as any).role;

  if (userRole === "SUPER_ADMIN") {
    redirect("/dashboard/admin");
  } else if (userRole === "GURU") {
    redirect("/dashboard/guru");
  } else if (userRole === "SISWA") {
    redirect("/dashboard/siswa");
  } else {
    redirect("/api/auth/signout");
  }
}
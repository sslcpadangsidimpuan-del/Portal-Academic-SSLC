import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import StudentReportClient from "./StudentReportClient";

export const dynamic = "force-dynamic";

export default async function LaporanBelajarSiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = (session.user as any).username;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      siswaProfile: {
        include: {
          levels: true,
          absensi: true,
          semesterReports: {
            orderBy: { createdAt: 'desc' },
            include: { 
              guru: { include: { user: true } },
              level: true 
            }
          }
        }
      }
    }
  });

  const siswaProfile = user?.siswaProfile;
  const activeLevels = siswaProfile?.levels || [];
  const activeLevelIds = activeLevels.map((l) => l.id);

  const rawReports = siswaProfile?.semesterReports || [];
  const rawAbsensi = siswaProfile?.absensi || [];

  const semesterReportsWithAttendance = rawReports.map((report) => {
    const reportLevelId = report.levelId;

    let summary = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };

    rawAbsensi.forEach((att: any) => {
      if (att.levelId === reportLevelId) {
        const st = att.status?.toLowerCase();
        if (st === "hadir") summary.hadir++;
        else if (st === "izin") summary.izin++;
        else if (st === "sakit") summary.sakit++;
        else if (st === "alpa") summary.alpa++;
      }
    });

    const isActive = reportLevelId ? activeLevelIds.includes(reportLevelId) : false;

    return {
      ...report,
      isActiveClass: isActive,
      attendanceSummary: summary
    };
  });

  semesterReportsWithAttendance.sort((a, b) => {
    if (a.isActiveClass && !b.isActiveClass) return -1;
    if (!a.isActiveClass && b.isActiveClass) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <StudentReportClient 
      studentName={user?.name || "Student"}
      activeLevels={activeLevels}
      semesterReports={semesterReportsWithAttendance}
    />
  );
}
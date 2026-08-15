import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get("siswaId");

    if (!siswaId) return NextResponse.json({ error: "ID Siswa diperlukan" }, { status: 400 });

    // 1. Ambil Profil Siswa beserta Kelas Aktif saat ini
    const siswaProfile = await prisma.siswaProfile.findUnique({
      where: { id: siswaId },
      include: {
        levels: true, // Kelas/Level yang sedang aktif diikuti
      }
    });

    const activeLevelIds = siswaProfile?.levels.map(l => l.id) || [];

    // 2. Ambil Laporan Harian (Daily Reports) + include Level
    const dailyReports = await prisma.dailyReport.findMany({
      where: { siswaId },
      include: {
        level: true
      },
      orderBy: { date: 'desc' }
    });

    // 3. Ambil Laporan Semester (Semester Reports) + include Level & Guru
    const rawSemesterReports = await prisma.semesterReport.findMany({
      where: { siswaId },
      include: {
        level: true,
        guru: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Ambil SELURUH Riwayat Absensi Siswa ini (tidak peduli kelas aktif atau lulus)
    const allAbsensi = await prisma.absensi.findMany({
      where: { siswaId }
    });

    // 5. Olah Setiap Laporan Semester agar membawa Rekap Absensi & Penanda Kelas Aktif/Graduate
    const semesterReports = rawSemesterReports.map((report) => {
      const reportLevelId = report.levelId;
      const summary = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };

      if (reportLevelId) {
        // A. Jika Laporan Semester memiliki levelId, hitung absensi HANYA untuk levelId tersebut
        allAbsensi.forEach((att) => {
          if (att.levelId === reportLevelId) {
            const st = att.status?.toUpperCase();
            if (st === 'HADIR') summary.hadir++;
            else if (st === 'IZIN') summary.izin++;
            else if (st === 'SAKIT') summary.sakit++;
            else if (st === 'ALPA') summary.alpa++;
          }
        });
      } else {
        // B. FALLBACK (Untuk Data Lama yang levelId-nya null): Hitung seluruh akumulasi absensi
        allAbsensi.forEach((att) => {
          const st = att.status?.toUpperCase();
          if (st === 'HADIR') summary.hadir++;
          else if (st === 'IZIN') summary.izin++;
          else if (st === 'SAKIT') summary.sakit++;
          else if (st === 'ALPA') summary.alpa++;
        });
      }

      // Cek apakah kelas di laporan ini termasuk kelas aktif atau kelas terdahulu (graduated)
      const isActiveClass = reportLevelId ? activeLevelIds.includes(reportLevelId) : false;

      return {
        ...report,
        isActiveClass,
        attendanceSummary: summary // Summary spesifik untuk rapor semester ini
      };
    });

    // 6. Akumulasi Absensi Global (Tetap disediakan untuk komponen pendukung)
    const attendanceGroup = await prisma.absensi.groupBy({
      by: ['status'],
      where: { siswaId },
      _count: { status: true }
    });

    const attendanceSummary = {
      hadir: attendanceGroup.find(a => a.status?.toUpperCase() === 'HADIR')?._count.status || 0,
      izin: attendanceGroup.find(a => a.status?.toUpperCase() === 'IZIN')?._count.status || 0,
      sakit: attendanceGroup.find(a => a.status?.toUpperCase() === 'SAKIT')?._count.status || 0,
      alpa: attendanceGroup.find(a => a.status?.toUpperCase() === 'ALPA')?._count.status || 0,
    };

    return NextResponse.json({ dailyReports, semesterReports, attendanceSummary });
  } catch (error) {
    console.error("Gagal memuat list laporan:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
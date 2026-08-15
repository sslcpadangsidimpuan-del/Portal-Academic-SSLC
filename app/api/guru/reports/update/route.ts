import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak. Anda bukan Guru." }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id || !type) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    if (type === "DAILY") {
      const updatedDaily = await prisma.dailyReport.update({
        where: { id },
        data: {
          material: data.material,
          notes: data.notes
        }
      });
      return NextResponse.json({ message: "Laporan Harian berhasil diperbarui!", data: updatedDaily });

    } else if (type === "SEMESTER") {
      // Helper konversi ke integer atau null jika kosong
      const toInt = (val: any) => (val !== undefined && val !== null && val !== "" ? parseInt(val) : null);

      const updatedSemester = await prisma.semesterReport.update({
        where: { id },
        data: {
          semester: data.term,
          comments: data.comments,

          // 🟢 3 VARIABEL BARU CLASS PARTICIPATION
          studentPerformance: data.studentPerformance,
          englishUse: data.englishUse,
          studentProgress: data.studentProgress,

          // MATRIKS NILAI SKILL
          midVocabulary: toInt(data.midVocabulary),
          midGrammar: toInt(data.midGrammar),
          midListening: toInt(data.midListening),
          midSpeaking: toInt(data.midSpeaking),
          midSpelling: toInt(data.midSpelling),
          midReading: toInt(data.midReading),
          midWriting: toInt(data.midWriting),
          finalVocabulary: toInt(data.finalVocabulary),
          finalGrammar: toInt(data.finalGrammar),
          finalListening: toInt(data.finalListening),
          finalSpeaking: toInt(data.finalSpeaking),
          finalSpelling: toInt(data.finalSpelling),
          finalReading: toInt(data.finalReading),
          finalWriting: toInt(data.finalWriting),
        }
      });
      return NextResponse.json({ message: "Assessment Semester berhasil diperbarui!", data: updatedSemester });
    }

    return NextResponse.json({ error: "Tipe laporan tidak dikenali." }, { status: 400 });

  } catch (error) {
    console.error("Gagal update laporan:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
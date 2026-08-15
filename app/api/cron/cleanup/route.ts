import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase SDK
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // 1. VALIDASI KEAMANAN TOKEN
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const authHeader = request.headers.get("authorization");

  // Cek via query string (?token=...) atau Header Authorization (Vercel Cron)
  const isAuthorized =
    token === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Akses Ditolak: Token Cron Tidak Valid" }, { status: 401 });
  }

  try {
    // 2. HITUNG TANGGAL BATAS (30 Hari yang lalu)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 3. CARI SEMUA FOTO/VIDEO YANG DIBUAT SEBELUM 30 HARI
    const expiredPhotos = await prisma.photo.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo, // Less than (Lebih tua dari 30 hari)
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    if (expiredPhotos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada media kadaluarsa yang perlu dihapus.",
        deletedCount: 0,
      });
    }

    // 4. EKSTRAK NAMA FILE DAN HAPUS DARI SUPABASE STORAGE
    const filenamesToDelete: string[] = [];

    for (const photo of expiredPhotos) {
      if (photo.url) {
        const urlParts = photo.url.split("/");
        const filename = urlParts[urlParts.length - 1];
        if (filename) {
          filenamesToDelete.push(filename);
        }
      }
    }

    if (filenamesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove(filenamesToDelete);

      if (storageError) {
        console.error("Gagal menghapus file dari Supabase Storage:", storageError);
      }
    }

    // 5. HAPUS RECORD DARI DATABASE PRISMA
    const expiredIds = expiredPhotos.map((p) => p.id);
    const deleteResult = await prisma.photo.deleteMany({
      where: {
        id: {
          in: expiredIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil membersihkan ${deleteResult.count} media kadaluarsa.`,
      deletedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error("Error pada Cron Cleanup Job:", error);
    return NextResponse.json(
      { error: "Gagal memproses cleanup cron job", details: error.message },
      { status: 500 }
    );
  }
}
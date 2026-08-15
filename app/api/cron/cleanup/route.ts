import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // 1. VALIDASI KEAMANAN TOKEN
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const authHeader = request.headers.get("authorization");

  const isAuthorized =
    token === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses Ditolak: Token Cron Tidak Valid" },
      { status: 401 }
    );
  }

  // 2. INISIALISASI LAZY SUPABASE CLIENT (Di dalam handler untuk mencegah build error)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Kredensial Supabase belum dikonfigurasi di environment variables." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 3. HITUNG TANGGAL BATAS (30 Hari yang lalu)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 4. CARI SEMUA FOTO/VIDEO YANG DIBUAT SEBELUM 30 HARI
    const expiredPhotos = await prisma.photo.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
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

    // 5. EKSTRAK NAMA FILE DAN HAPUS DARI SUPABASE STORAGE
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

    // 6. HAPUS RECORD DARI DATABASE PRISMA
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
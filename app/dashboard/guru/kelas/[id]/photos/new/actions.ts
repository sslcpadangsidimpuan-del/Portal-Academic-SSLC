"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

// =====================================================================
// 1. FUNGSI BARU: Mencetak "Tiket VIP" (Signed URL) untuk Browser
// =====================================================================
export async function generateUploadTickets(fileConfigs: { name: string, type: string }[]) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Sesi habis.");

  const supabase = getSupabaseClient();
  const tickets = [];

  for (const file of fileConfigs) {
    const isVideo = file.type.startsWith("video/");
    const extension = isVideo ? file.name.split('.').pop() : (file.name.split('.').pop() || "jpg");
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    // Meminta Supabase membuka jalur khusus untuk file ini
    const { data, error } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(uniqueFilename);

    if (error || !data) {
      console.error("Supabase Sign URL Error:", error);
      throw new Error("Gagal membuat tiket upload dari server.");
    }

    // Mendapatkan URL publik untuk disimpan ke database nanti
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(uniqueFilename);

    tickets.push({
      originalName: file.name,
      signedUrl: data.signedUrl, // URL untuk upload (PUT)
      publicUrl: publicUrlData.publicUrl, // URL untuk dilihat di galeri
      fileType: isVideo ? "video" : "image"
    });
  }

  return tickets;
}

// =====================================================================
// 2. FUNGSI LAMA (MODIFIKASI): Menyimpan Metadata ke Database (Prisma)
// Kini fungsi ini HANYA menerima Teks (URL), bukan lagi File mentah.
// =====================================================================
export async function handleUploadAction(levelId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Sesi habis.");

  const currentUser = await prisma.user.findUnique({
    where: { username: (session.user as any).username },
    include: { guruProfile: true }
  });
  if (!currentUser?.guruProfile) throw new Error("Akses ditolak.");

  // Mengambil data Teks (URL) hasil unggahan browser
  const uploadedUrls = formData.getAll("uploadedUrls") as string[];
  const uploadedTypes = formData.getAll("uploadedTypes") as string[];
  
  const caption = formData.get("caption") as string;
  const visibility = formData.get("visibility") as string;
  const selectedStudents = formData.getAll("students") as string[];
  
  if (!uploadedUrls || uploadedUrls.length === 0) {
    throw new Error("Data media tidak ditemukan setelah proses unggah.");
  }

  const isEvent = visibility === "event";
  const isPublic = visibility === "public" || isEvent;
  const finalLevelId = isEvent ? null : levelId;

  // Menyimpan setiap URL ke tabel Photo di Database
  for (let i = 0; i < uploadedUrls.length; i++) {
    const fileUrl = uploadedUrls[i];
    const fileType = uploadedTypes[i] || "image";

    await prisma.photo.create({
      data: {
        url: fileUrl,
        fileType: fileType,
        caption: caption || null,
        isPublic: isPublic,
        levelId: finalLevelId,
        uploaderId: currentUser.guruProfile.id,
        tags: isPublic ? undefined : {
          create: selectedStudents.map(siswaId => ({
            siswaId: siswaId
          }))
        }
      }
    });
  }

  // Refresh dan kembalikan pengguna ke halaman galeri
  revalidatePath(`/dashboard/guru/kelas/${levelId}/photos`);
  revalidatePath(`/dashboard/guru/photos`); 
  redirect(`/dashboard/guru/kelas/${levelId}/photos`);
}
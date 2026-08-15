"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sharp from "sharp"; 
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handleUploadAction(levelId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Sesi habis.");

  const currentUser = await prisma.user.findUnique({
    where: { username: (session.user as any).username },
    include: { guruProfile: true }
  });
  if (!currentUser?.guruProfile) throw new Error("Akses ditolak.");

  const files = formData.getAll("media") as File[];
  const caption = formData.get("caption") as string;
  const visibility = formData.get("visibility") as string;
  const selectedStudents = formData.getAll("students") as string[];
  
  if (!files || files.length === 0 || files[0].size === 0) {
    throw new Error("File media tidak ditemukan.");
  }

  const isEvent = visibility === "event";
  const isPublic = visibility === "public" || isEvent;
  const finalLevelId = isEvent ? null : levelId;

  for (const file of files) {
    if (file.size === 0) continue;

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const isVideo = file.type.startsWith("video/");
    const fileType = isVideo ? "video" : "image";
    
    const extension = isVideo ? file.name.split('.').pop() : "jpg";
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    let finalBuffer: Buffer;

    // 1. Kompresi gambar dalam memori (Tanpa menyentuh folder lokal)
    if (isVideo) {
      finalBuffer = originalBuffer;
    } else {
      finalBuffer = await sharp(originalBuffer)
        .resize({ width: 1080, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    // 2. Upload Buffer langsung ke Supabase Storage (Bucket: 'media')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(uniqueFilename, finalBuffer, {
        contentType: isVideo ? file.type : 'image/jpeg',
        upsert: false // Jangan timpa file jika nama sama (walau kemungkinannya kecil)
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      throw new Error("Gagal mengunggah file ke cloud.");
    }

    // 3. Dapatkan Public URL dari Supabase
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(uniqueFilename);

    const fileUrl = publicUrlData.publicUrl;

    // 4. Simpan URL Cloud ke Database Prisma
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

  revalidatePath(`/dashboard/guru/kelas/${levelId}/photos`);
  revalidatePath(`/dashboard/guru/photos`); 
  redirect(`/dashboard/guru/kelas/${levelId}/photos`);
}
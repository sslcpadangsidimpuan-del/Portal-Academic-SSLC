"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createNotification(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as string;
  const targetRole = formData.get("targetRole") as string;
  
  if (!title || !content) return { error: "Judul dan isi pesan wajib diisi!" };

  try {
    // 1. Buat wadah pengumumannya terlebih dahulu
    const notification = await prisma.notification.create({
      data: { title, content, type, targetRole }
    });

    // 2. Tentukan siapa saja yang akan menerima pesannya
    let targetUserIds: string[] = [];

    if (targetRole === "GLOBAL") {
      const users = await prisma.user.findMany({ select: { id: true } });
      targetUserIds = users.map(u => u.id);
    } else if (targetRole === "GURU" || targetRole === "SISWA") {
      const users = await prisma.user.findMany({ where: { role: targetRole }, select: { id: true } });
      targetUserIds = users.map(u => u.id);
    } else if (targetRole === "SPECIFIC") {
      // Mengambil semua ID user yang dicentang oleh admin
      targetUserIds = formData.getAll("specificUsers") as string[];
    }

    // 3. Jembatani pengumuman tersebut ke masing-masing penerima
    if (targetUserIds.length > 0) {
      const recipientData = targetUserIds.map(userId => ({
        notificationId: notification.id,
        userId: userId
      }));
      await prisma.notificationRecipient.createMany({ data: recipientData });
    }

    revalidatePath("/dashboard/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal membuat pengumuman." };
  }
}

// Menghapus pengumuman sepenuhnya untuk semua orang
export async function deleteGlobalNotification(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await prisma.notification.delete({ where: { id } });
    revalidatePath("/dashboard/admin/notifications");
  } catch (error) {
    console.error(error);
  }
}

// Menghapus notifikasi HANYA untuk 1 orang (misal: siswa sudah bayar)
export async function dismissForUser(formData: FormData) {
  const notificationId = formData.get("notificationId") as string;
  const userId = formData.get("userId") as string;
  try {
    await prisma.notificationRecipient.deleteMany({
      where: { notificationId, userId }
    });
    revalidatePath("/dashboard/admin/notifications");
  } catch (error) {
    console.error(error);
  }
}
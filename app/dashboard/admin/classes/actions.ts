"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createClass(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;

  if (!name || !category) return { error: "Nama kelas dan kategori wajib diisi!" };

  try {
    // Cek duplikasi nama kelas
    const existing = await prisma.level.findFirst({ where: { name } });
    if (existing) return { error: "Nama kelas sudah digunakan!" };

    await prisma.level.create({ data: { name, category } });
    
    revalidatePath("/dashboard/admin/classes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal menyimpan kelas ke database." };
  }
}

export async function deleteClass(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID kelas tidak ditemukan." };

  try {
    // Dengan skema Many-to-Many, menghapus level akan otomatis 
    // melepaskan relasi dari tabel perantara siswa & guru secara aman.
    await prisma.level.delete({ where: { id } });
    
    revalidatePath("/dashboard/admin/classes");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus kelas:", error);
    return { error: "Gagal menghapus kelas dari database." };
  }
}

export async function moveStudent(formData: FormData) {
  const siswaId = formData.get("siswaId") as string;
  const levelIds = formData.getAll("levelIds") as string[];

  if (!siswaId) return { error: "Pilih siswa terlebih dahulu!" };

  try {
    // Menggunakan sintaks 'set' pada relasi Many-to-Many untuk me-replace 
    // kelas lama dengan daftar kelas baru yang dicentang di form
    await prisma.siswaProfile.update({
      where: { id: siswaId },
      data: {
        levels: {
          set: levelIds.map(id => ({ id }))
        }
      },
    });

    revalidatePath("/dashboard/admin/classes");
    return { success: true };
  } catch (error) {
    console.error("Gagal memperbarui kelas siswa:", error);
    return { error: "Gagal memperbarui kelas siswa." };
  }
}

export async function assignTeacherToClasses(formData: FormData) {
  const userId = formData.get("userId") as string;
  const levelIds = formData.getAll("levelIds") as string[];

  if (!userId) return { error: "ID Guru tidak ditemukan." };

  try {
    await prisma.guruProfile.update({
      where: { userId },
      data: {
        levels: {
          set: levelIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath("/dashboard/admin/classes");
    return { success: true };
  } catch (error) {
    console.error("Gagal assign kelas ke guru:", error);
    return { error: "Terjadi kesalahan saat menyimpan penugasan guru." };
  }
}
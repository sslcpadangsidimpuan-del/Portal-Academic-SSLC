"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const role = formData.get("role") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!role || !name || !username || !password) {
    return { error: "Semua kolom utama wajib diisi!" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: "Username / NIP / NIS tersebut sudah terdaftar di sistem!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "GURU") {
      const guruLevels = formData.getAll("guruLevels") as string[];

      await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          role: "GURU",
          guruProfile: { 
            create: {
              levels: {
                connect: guruLevels.map(id => ({ id }))
              }
            } 
          },
        },
      });
    } else if (role === "SISWA") {
      // --- PENANGKAPAN 15 BIODATA LENGKAP SISWA ---
      const levelId = formData.get("levelId") as string;
      
      const dateOfBirthRaw = formData.get("dateOfBirth") as string;
      const dateOfBirth = dateOfBirthRaw ? new Date(dateOfBirthRaw) : null;
      
      const gender = formData.get("gender") as string || null;
      const religion = formData.get("religion") as string || null;
      const address = formData.get("address") as string || null;
      const schoolOrigin = formData.get("schoolOrigin") as string || null;
      
      const joinDateRaw = formData.get("joinDate") as string;
      const joinDate = joinDateRaw ? new Date(joinDateRaw) : null;

      // Data Ortu
      const fatherName = formData.get("fatherName") as string || null;
      const fatherOccupation = formData.get("fatherOccupation") as string || null;
      const motherName = formData.get("motherName") as string || null;
      const motherOccupation = formData.get("motherOccupation") as string || null;
      const parentPhone = formData.get("parentPhone") as string || null;

      // Data Wali
      const guardianName = formData.get("guardianName") as string || null;
      const guardianOccupation = formData.get("guardianOccupation") as string || null;
      const guardianAddress = formData.get("guardianAddress") as string || null;
      const guardianPhone = formData.get("guardianPhone") as string || null;

      await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          role: "SISWA",
          siswaProfile: {
            create: {
              ...(levelId ? { levels: { connect: [{ id: levelId }] } } : {}),
              dateOfBirth,
              gender,
              religion,
              address,
              schoolOrigin,
              joinDate,
              fatherName,
              fatherOccupation,
              motherName,
              motherOccupation,
              parentPhone,
              guardianName,
              guardianOccupation,
              guardianAddress,
              guardianPhone,
            },
          },
        },
      });
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
    
  } catch (error) {
    console.error(error);
    return { error: "Terjadi kesalahan pada server saat menyimpan data." };
  }
}
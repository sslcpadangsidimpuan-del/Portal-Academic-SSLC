import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah user sedang login
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil username dari session (berdasarkan struktur file profile Anda sebelumnya)
    const username = (session.user as any).username;

    // Cari user di database menggunakan Prisma
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verifikasi password lama
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Password lama Anda salah!" },
        { status: 400 }
      );
    }

    // Hash password baru dan update ke database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
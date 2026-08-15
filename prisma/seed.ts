import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// 1. Buat koneksi pool menggunakan driver 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Hubungkan pool tersebut ke Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Instansiasi Prisma menggunakan adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai menyuntikkan data (seeding)... 🌱');

  // ==========================================
  // 1. MEMBUAT PASSWORD ENKRIPSI
  // ==========================================
  // Password untuk Super Admin (Silakan ganti jika diperlukan)
  const hashedOwnerPassword = await bcrypt.hash('owner123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  // Password standar untuk akun uji coba Guru & Siswa
  const hashedPasswordDefault = await bcrypt.hash('rahasia123', 10);

  // ==========================================
  // 2. SUNTIK AKUN SUPER ADMIN (OWNER & ADMIN)
  // ==========================================
  // Menggunakan upsert agar jika dijalankan berkali-kali tidak duplikat
  const owner = await prisma.user.upsert({
    where: { username: 'owner_mec' },
    update: {},
    create: {
      username: 'owner_mec',
      password: hashedOwnerPassword,
      name: 'Owner MEC',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: 'admin_mec' },
    update: {},
    create: {
      username: 'admin_mec',
      password: hashedAdminPassword,
      name: 'Admin Utama',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Akun Super Admin berhasil disuntikkan.');

  // ==========================================
  // 3. SUNTIK DAFTAR 9 KELAS AWAL SECARA OTOMATIS
  // ==========================================
  const daftarKelasAwal = [
    { name: 'Regular 1', category: 'Regular' },
    { name: 'Regular 2', category: 'Regular' },
    { name: 'Regular 3', category: 'Regular' },
    { name: 'Nursery 1', category: 'Nursery' },
    { name: 'Nursery 2', category: 'Nursery' },
    { name: 'Nursery 3', category: 'Nursery' },
    { name: 'Preschool 1', category: 'Preschool' },
    { name: 'Preschool 2', category: 'Preschool' },
    { name: 'Preschool 3', category: 'Preschool' },
  ];

  console.log('Menambahkan kelas baru...');
  for (const kelas of daftarKelasAwal) {
    // Mengecek apakah kelas sudah ada berdasarkan nama untuk menghindari duplikasi
    const kelasAda = await prisma.level.findFirst({
      where: { name: kelas.name }
    });
    
    if (!kelasAda) {
      await prisma.level.create({
        data: kelas
      });
    }
  }
  console.log('✅ 9 Kelas awal berhasil dikonfigurasi.');

  // ==========================================
  // 4. MEMPERTAHANKAN AKUN UJI COBA LAMA (GURU & SISWA)
  // ==========================================
  // Memastikan kelas dasar 'Beginner 1' tetap ada untuk akun siswa lama
  let levelDefault = await prisma.level.findFirst({
    where: { name: 'Beginner 1' }
  });

  if (!levelDefault) {
    levelDefault = await prisma.level.create({
      data: {
        name: 'Beginner 1',
        category: 'Regular',
      },
    });
  }

  // Buat atau pastikan akun Guru lama tetap ada
  await prisma.user.upsert({
    where: { username: 'GURU001' },
    update: {},
    create: {
      username: 'GURU001',
      name: 'Budi Pengajar',
      password: hashedPasswordDefault,
      role: 'GURU',
      guruProfile: {
        create: {},
      },
    },
  });

  // Buat atau pastikan akun Siswa lama tetap ada
  await prisma.user.upsert({
    where: { username: 'SISWA001' },
    update: {},
    create: {
      username: 'SISWA001',
      name: 'Andi Murid',
      password: hashedPasswordDefault,
      role: 'SISWA',
      siswaProfile: {
        create: {
          parentName: 'Bapak Andi',
          parentPhone: '08123456789',
          levelId: levelDefault.id,
        },
      },
    },
  });

  console.log('==================================================');
  console.log('✅ PROSES SEEDING BERHASIL SELESAI!');
  console.log('==================================================');
  console.log('🔑 AKUN SUPER ADMIN BARU:');
  console.log('👑 Owner MEC -> Username: owner_mec | Pass: owner123');
  console.log('🛠️ Admin MEC -> Username: admin_mec | Pass: admin123');
  console.log('--------------------------------------------------');
  console.log('🧑‍🏫 Guru Uji Coba  -> Username: GURU001  | Pass: rahasia123');
  console.log('👦 Siswa Uji Coba -> Username: SISWA001 | Pass: rahasia123');
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Menutup koneksi pool driver pg agar proses terminal langsung selesai (tidak gantung)
    await pool.end();
  });
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function InputReportHarian({ params }: { params: Promise<{ id: string, siswaId: string }> }) {
  const { id, siswaId } = await params;

  const siswa = await prisma.siswaProfile.findUnique({
    where: { id: siswaId },
    include: { user: true }
  });

  // ==========================================
  // SERVER ACTION (Aman di dalam 1 file)
  // ==========================================
  async function simpanReportHarian(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Sesi telah habis, silakan login kembali.");

    const username = (session.user as any).username;
    
    const currentUser = await prisma.user.findUnique({
      where: { username: username },
      include: { guruProfile: true }
    });

    if (!currentUser || !currentUser.guruProfile) {
      throw new Error("Akses ditolak: Profil guru tidak valid!");
    }

    const currentGuruId = currentUser.guruProfile.id;

    // AMBIL LOGIKA TOPIK OTHERS
    const selectedTopic = formData.get("topic") as string;
    const customTopic = formData.get("customTopic") as string;
    
    // Jika dropdown bernilai "Others", gunakan teks dari input customTopic
    const finalTopic = selectedTopic === "Others" && customTopic.trim() !== "" 
      ? customTopic 
      : selectedTopic;

    const shortDesc = formData.get("shortDesc") as string;
    const performance = formData.get("performance") as string;
    const englishUse = formData.get("englishUse") as string;
    const progress = formData.get("progress") as string;
    const notes = formData.get("notes") as string;
    
    const finalNotes = `Topic: ${finalTopic} | Desc: ${shortDesc} | Performance: ${performance} | English Use: ${englishUse} | Progress: ${progress} | Notes: ${notes}`;
    
    await prisma.dailyReport.create({
      data: { 
        material: finalTopic, 
        notes: finalNotes, 
        siswaId, 
        levelId: id, 
        guruId: currentGuruId
      }
    });
    
    revalidatePath(`/dashboard/guru/kelas/${id}/report`);
    redirect(`/dashboard/guru/kelas/${id}/report`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link href={`/dashboard/guru/kelas/${id}/report`} className="text-sky-500 hover:text-sky-600 text-sm font-medium mb-2 inline-flex items-center gap-2">
          ← Kembali ke Daftar Siswa
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Input Laporan Harian</h1>
        <p className="text-slate-600">Siswa: <span className="font-semibold text-sky-600">{siswa?.user.name}</span></p>
      </div>

      <form action={simpanReportHarian} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
          <label className="block text-sm font-bold text-slate-700 mb-2">Learning Topic</label>
          <select name="topic" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 mb-3" required>
            {["Phonic", "Vocab", "Reading", "Writing", "Listening", "Speaking", "Spelling", "Math", "Character Building", "Circle Time/Speaking Simulation", "Sensory Exploration", "Physical Execersise", "Science", "Art and Craft", "Religion", "Prewriting", "Story Time", "Life Skill", "Others"].map(opt => (
              <option key={opt} value={opt} className="text-slate-800">{opt}</option>
            ))}
          </select>
          
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Topik Tambahan (Hanya isi jika memilih "Others" di atas)
          </label>
          <input 
            type="text" 
            name="customTopic" 
            placeholder="Ketik topik kustom di sini..." 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Learning Descriptions</label>
          <textarea name="shortDesc" placeholder="Jelaskan materi hari ini..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 h-24" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Student Performance</label>
          <select name="performance" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800" required>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Need improvement">Need improvement</option>
            <option value="-">-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">English Use in Class</label>
          <select name="englishUse" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800" required>
            <option value="Always">Always</option>
            <option value="Sometimes">Sometimes</option>
            <option value="Need improvement">Need improvement</option>
            <option value="-">-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Student's Progress Report</label>
          <select name="progress" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800" required>
            <option value="Active, Confident, and mastered today’s lesson">Active, Confident, and mastered today’s lesson</option>
            <option value="Participated well and understood most of today’s lesson">Participated well and understood most of today’s lesson</option>
            <option value="Participated with guidance and is making progress">Participated with guidance and is making progress</option>
            <option value="Requires additional guidance and practice">Requires additional guidance and practice</option>
            <option value="-">-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 text-slate-800">Parent's Follow Up</label>
          <textarea name="notes" placeholder="Tuliskan catatan tambahan..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white h-32 text-slate-800" required />
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
          Simpan Laporan
        </button>
      </form>
    </div>
  );
}
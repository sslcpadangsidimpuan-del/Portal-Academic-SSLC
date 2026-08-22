import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function InputReportSemester({ params }: { params: Promise<{ id: string, siswaId: string }> }) {
  const { id, siswaId } = await params;

  const siswa = await prisma.siswaProfile.findUnique({
    where: { id: siswaId },
    include: { user: true }
  });

  if (!siswa) {
    return <div className="p-8 text-center text-slate-500">Data siswa tidak ditemukan.</div>;
  }

  // Cek apakah sudah ada laporan semester untuk siswa ini
  const existingReport = await prisma.semesterReport.findFirst({
    where: { siswaId, levelId: id }
  });

  async function simpanReportSemester(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Sesi telah habis.");

    const username = (session.user as any).username;
    const currentUser = await prisma.user.findUnique({
      where: { username: username },
      include: { guruProfile: true }
    });

    if (!currentUser || !currentUser.guruProfile) throw new Error("Profil guru tidak valid!");

    const term = formData.get("term") as string;
    const comments = formData.get("comments") as string;
    const classParticipation = formData.get("classParticipation") as string || "A"; // Input Class Participation (A / B / C)

    // Helper penterjemah input angka
    const parseScore = (key: string) => {
      const val = formData.get(key) as string;
      return val && val !== "" ? parseInt(val) : null;
    };

    // Data Mid
    const midVocabulary = parseScore("midVocabulary");
    const midGrammar = parseScore("midGrammar");
    const midListening = parseScore("midListening");
    const midSpeaking = parseScore("midSpeaking");
    const midSpelling = parseScore("midSpelling");
    const midReading = parseScore("midReading");
    const midWriting = parseScore("midWriting");

    // Data Final
    const finalVocabulary = parseScore("finalVocabulary");
    const finalGrammar = parseScore("finalGrammar");
    const finalListening = parseScore("finalListening");
    const finalSpeaking = parseScore("finalSpeaking");
    const finalSpelling = parseScore("finalSpelling");
    const finalReading = parseScore("finalReading");
    const finalWriting = parseScore("finalWriting");

    const reportData = {
      semester: term,
      comments,
      classParticipation, // Menyimpan nilai A / B / C ke DB
      midVocabulary, midGrammar, midListening, midSpeaking, midSpelling, midReading, midWriting,
      finalVocabulary, finalGrammar, finalListening, finalSpeaking, finalSpelling, finalReading, finalWriting,
      siswaId,
      guruId: currentUser.guruProfile.id,
      levelId: id
    };

    if (existingReport) {
      await prisma.semesterReport.update({
        where: { id: existingReport.id },
        data: reportData
      });
    } else {
      await prisma.semesterReport.create({
        data: reportData
      });
    }
    
    revalidatePath(`/dashboard/guru/kelas/${id}/report`);
    redirect(`/dashboard/guru/evaluasi`);
  }

  const skills = [
    { name: "Vocabulary", midKey: "midVocabulary", finalKey: "finalVocabulary" },
    { name: "Grammar / Structure", midKey: "midGrammar", finalKey: "finalGrammar" },
    { name: "Listening Comprehension", midKey: "midListening", finalKey: "finalListening" },
    { name: "Speaking", midKey: "midSpeaking", finalKey: "finalSpeaking" },
    { name: "Spelling / Dictation", midKey: "midSpelling", finalKey: "finalSpelling" },
    { name: "Reading Comprehension", midKey: "midReading", finalKey: "finalReading" },
    { name: "Writing", midKey: "midWriting", finalKey: "finalWriting" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto box-border w-full animate-in fade-in duration-300">
      {/* Header & Navigasi Back */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard/guru/evaluasi" className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 mb-2">
            ← Back to Evaluation
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Input Assessment Semester</h1>
          <p className="text-slate-500 text-sm mt-1">Student: <span className="font-semibold text-slate-800">{siswa.user.name}</span> ({siswa.user.username})</p>
        </div>
      </div>

      <form action={simpanReportSemester} className="space-y-6">
        
        {/* 1. PERIODE TERM */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Periode / Term</label>
          <input 
            name="term" 
            type="text" 
            defaultValue={existingReport?.semester || "July - December 2026"} 
            placeholder="Contoh: July - December 2026" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:border-sky-500 focus:bg-white transition-all text-sm" 
            required 
          />
        </div>

        {/* 2. TABEL MATRIKS NILAI */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">English Language Skills (0 - 100)</h3>
              <p className="text-xs text-slate-400 mt-1">Enter the Midterm and/or Final grades. Leave blank if the exam has not been conducted..</p>
            </div>
            {/* Header Keterangan Kolom di Desktop */}
            {/* <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">
              <span className="w-28 text-center">Mid Test</span>
              <span className="w-28 text-center">Final Test</span>
            </div> */}
          </div>

          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-sky-50/40 hover:border-sky-100 transition-all">
                <span className="font-semibold text-slate-700 text-sm sm:w-1/2">{skill.name}</span>
                
                <div className="grid grid-cols-2 gap-3 w-full sm:w-1/2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 sm:hidden">Mid Test</label>
                    <input 
                      name={skill.midKey} 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue={(existingReport as any)?.[skill.midKey] ?? ""} 
                      placeholder="Mid (0-100)" 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 sm:hidden">Final Test</label>
                    <input 
                      name={skill.finalKey} 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue={(existingReport as any)?.[skill.finalKey] ?? ""} 
                      placeholder="Final (0-100)" 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* 1. Student Performance */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"> Student Performance</label>
          <select 
  name="studentPerformance" 
  defaultValue={existingReport?.studentPerformance || "Good"}
  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50 font-medium text-slate-800"
>
  <option value="Excellent">Excellent</option>
  <option value="Good">Good</option>
  <option value="Average">Average</option>
  <option value="Needs Improvement">Needs Improvement</option>
</select>         
        </div>

        {/* 2. English Use in Class */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">English Use in Class</label>
           <select 
  name="englishUse" 
  defaultValue={existingReport?.englishUse || "Always"}
  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50 font-medium text-slate-800"
>
  <option value="Always">Always</option>
  <option value="Sometimes">Sometimes</option>
  <option value="Needs Improvement">Needs Improvement</option>
</select>
        
        </div>
          {/* 3. Student's Progress Report */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student's Progress Report</label>
           <select 
  name="studentProgress" 
  defaultValue={existingReport?.studentProgress || "Participated well and understood most of this term's lessons"}
  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50 font-medium text-slate-800"
>
  <option value="Active, confident, and mastered this term's lessons">Active, confident, and mastered this term's lessons</option>
  <option value="Participated well and understood most of this term's lessons">Participated well and understood most of this term's lessons</option>
  <option value="Participated with guidance and is making progress">Participated with guidance and is making progress</option>
  <option value="Requires additional guidance and practice">Requires additional guidance and practice</option>
</select>       
        
        </div>






        {/* 4. COMMENTS & FEEDBACK (Disesuaikan untuk Mampu Menampung ~5 Kalimat) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comments / Feedback </label>
          <textarea 
            name="comments" 
            rows={4}
            defaultValue={existingReport?.comments || ""} 
            placeholder="Tuliskan evaluasi perkembangan, pencapaian, dan saran untuk siswa (maksimal ~5 kalimat)..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm outline-none focus:border-sky-500 focus:bg-white transition-all resize-y" 
          />
        </div>

        {/* BUTTON SUBMIT */}
        <button 
          type="submit" 
          className="w-full bg-sky-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-700 active:scale-[0.99] transition-all text-base flex items-center justify-center gap-2"
        >
          <span>💾</span> Save
        </button>
      </form>
    </div>
  );
}
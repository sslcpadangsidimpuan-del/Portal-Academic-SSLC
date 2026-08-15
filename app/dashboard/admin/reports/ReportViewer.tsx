"use client";

import { useState, useMemo } from "react";

export default function ReportViewer({ student, dailyReports = [], semesterReports = [], absensiData = [] }: any) {
  const uniqueLevels = useMemo(() => {
    const levelMap = new Map();
    if (student.siswaProfile?.level) levelMap.set(student.siswaProfile.level.id, student.siswaProfile.level);
    dailyReports.forEach((r: any) => { if (r.level) levelMap.set(r.level.id, r.level); });
    semesterReports.forEach((r: any) => { if (r.level) levelMap.set(r.level.id, r.level); });
    return Array.from(levelMap.values());
  }, [student, dailyReports, semesterReports]);

  const [activeLevelId, setActiveLevelId] = useState(uniqueLevels.length > 0 ? uniqueLevels[0].id : null);
  const [activeReportTab, setActiveReportTab] = useState<"DAILY" | "SEMESTER">("DAILY");

  // Filter berdasarkan kelas
  const currentDailyReports = dailyReports.filter((r: any) => r.levelId === activeLevelId);
  const currentSemesterReports = semesterReports.filter((r: any) => r.levelId === activeLevelId);
  const currentAbsensi = absensiData.filter((a: any) => a.levelId === activeLevelId);

  // Rekap Absensi Semester
  const totalHadir = currentAbsensi.filter((a: any) => a.status.toUpperCase() === "HADIR").length;
  const totalIzin = currentAbsensi.filter((a: any) => a.status.toUpperCase() === "IZIN").length;
  const totalSakit = currentAbsensi.filter((a: any) => a.status.toUpperCase() === "SAKIT").length;
  const totalAlpha = currentAbsensi.filter((a: any) => a.status.toUpperCase() === "ALPA").length;

  // ==========================================
  // STATE KALENDER HARIAN ADMIN
  // ==========================================
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReports, setSelectedReports] = useState<any[] | null>(null);
  const [selectedDateText, setSelectedDateText] = useState<string>("");

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 
  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const hariDalamSeminggu = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const mapAbsensi: Record<string, string> = {};
  currentAbsensi.forEach((record: any) => {
    if (record.date) {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      mapAbsensi[key] = record.status.toUpperCase();
    }
  });

  const mapLaporan: Record<string, any[]> = {};
  currentDailyReports.forEach((report: any) => {
    const rawDate = report.date || report.createdAt;
    if (rawDate) {
      const d = new Date(rawDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!mapLaporan[key]) mapLaporan[key] = [];
      mapLaporan[key].push(report);
    }
  });

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-6 border-b border-slate-100 bg-slate-800 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <p className="text-indigo-200 font-mono text-sm mt-0.5">NIS: {student.username}</p>
          </div>
        </div>
      </div>

      {uniqueLevels.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 italic">Belum ada riwayat kelas untuk siswa ini.</div>
      ) : (
        <>
          <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Linimasa Kelas (Pilih Kelas)</p>
            <div className="flex gap-2 pb-4">
              {uniqueLevels.map((level: any) => (
                <button
                  key={level.id}
                  onClick={() => setActiveLevelId(level.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeLevelId === level.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-500 border hover:bg-slate-100"
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex px-6 border-b border-slate-100 shrink-0">
            <button onClick={() => setActiveReportTab("DAILY")} className={`py-4 font-semibold text-sm mr-6 border-b-2 ${activeReportTab === "DAILY" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>📝 Laporan Harian</button>
            <button onClick={() => setActiveReportTab("SEMESTER")} className={`py-4 font-semibold text-sm border-b-2 ${activeReportTab === "SEMESTER" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>📊 Laporan Semester</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            
            {/* KALENDER HARIAN (ADMIN VIEW) */}
            {activeReportTab === "DAILY" && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <button onClick={handlePrevMonth} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm">← Bulan Lalu</button>
                  <p className="font-bold text-lg text-slate-700">{monthName}</p>
                  <button onClick={handleNextMonth} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm">Bulan Depan →</button>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {hariDalamSeminggu.map(hari => <div key={hari} className="text-center font-bold text-slate-400 text-sm py-2">{hari}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const tanggal = i + 1;
                      const keyTanggal = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(tanggal).padStart(2, '0')}`;
                      
                      const status = mapAbsensi[keyTanggal];
                      const daftarLaporan = mapLaporan[keyTanggal]; 

                      let bgColor = "bg-slate-50 text-slate-400 border-slate-100";
                      let cursorStyle = "cursor-default";

                      if (status === "HADIR") bgColor = "bg-emerald-500 text-white border-emerald-600";
                      else if (status === "IZIN") bgColor = "bg-blue-500 text-white border-blue-600";
                      else if (status === "SAKIT") bgColor = "bg-amber-400 text-white border-amber-500";
                      else if (status === "ALPA") bgColor = "bg-rose-500 text-white border-rose-600";
                      else if (!status && daftarLaporan && daftarLaporan.length > 0) bgColor = "bg-emerald-500 text-white border-emerald-600";

                      if (daftarLaporan && daftarLaporan.length > 0) {
                        cursorStyle = "cursor-pointer hover:scale-105 shadow-sm";
                      }

                      return (
                        <div 
                          key={tanggal} 
                          onClick={() => {
                            if (daftarLaporan && daftarLaporan.length > 0) {
                              setSelectedReports(daftarLaporan);
                              setSelectedDateText(new Date(keyTanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
                            }
                          }}
                          className={`aspect-square flex flex-col items-center justify-center rounded-xl border font-bold transition-all duration-200 ${bgColor} ${cursorStyle}`}
                        >
                          <span className="text-sm md:text-lg">{tanggal}</span>
                          {daftarLaporan && <span className="text-[9px] bg-white/30 px-1 py-0.5 rounded mt-0.5 font-normal text-white">{daftarLaporan.length} 📄</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
{/* LAPORAN SEMESTER */}

{/* LAPORAN SEMESTER */}
{activeReportTab === "SEMESTER" && (
  currentSemesterReports.length === 0 ? (
    <p className="text-center text-slate-400 py-10">Tidak ada laporan semester.</p>
  ) : (
    <div className="grid grid-cols-1 gap-6">
      {currentSemesterReports.map((report: any) => {
        // --- Perhitungan Grade Rata-Rata (Opsional, disesuaikan dengan logika Anda) ---
        // Jika examScore masih digunakan, Anda bisa menampilkannya.
        // Di sini kita asumsikan grade dihitung dari rata-rata nilai, atau bisa menggunakan huruf A/B/C/D.
        const avgScore = report.examScore || 0; 
        
        let gradeLetter = "C";
        let gradeColorClass = "bg-amber-50 border-amber-200 text-amber-700";
        if (avgScore >= 90) { gradeLetter = "A"; gradeColorClass = "bg-emerald-50 border-emerald-200 text-emerald-700"; }
        else if (avgScore >= 80) { gradeLetter = "B"; gradeColorClass = "bg-sky-50 border-sky-200 text-sky-700"; }
        else if (avgScore < 70) { gradeLetter = "D"; gradeColorClass = "bg-rose-50 border-rose-200 text-rose-700"; }
        
        return (
          <div key={report.id} className={`rounded-3xl border shadow-sm overflow-hidden ${gradeColorClass}`}>
            <div className="p-4 md:p-6 md:flex gap-8">
              
              {/* SISI KIRI: Header / Informasi Utama */}
              <div className="md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black/10 pb-4 md:pb-0 md:pr-6 mb-4 md:mb-0">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
                  {report.semester}
                </span>
                
                {/* Tampilan Status Class Participation */}
                <div className="bg-white/50 px-3 py-1.5 rounded-xl border border-black/5 mt-2 mb-2 text-center w-full">
                  <p className="text-[9px] font-bold uppercase opacity-60">Performance</p>
                  <p className="text-sm font-bold">{report.studentPerformance || "Good"}</p>
                </div>
                
                <div className="bg-white/50 px-3 py-1.5 rounded-xl border border-black/5 text-center w-full">
                   <p className="text-[9px] font-bold uppercase opacity-60">English Use</p>
                   <p className="text-sm font-bold">{report.englishUse || "Always"}</p>
                </div>
              </div>

              {/* SISI KANAN: Tabel Nilai & Feedback */}
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase opacity-50 mb-2">Nilai Keterampilan</h4>
                <div className="overflow-x-auto bg-white/50 rounded-xl border border-black/5 mb-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/5">
                      <tr>
                        <th className="px-3 py-2 font-bold">SKILL</th>
                        <th className="px-3 py-2 font-bold text-center">MID</th>
                        <th className="px-3 py-2 font-bold text-center">FINAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      <tr>
                        <td className="px-3 py-2 font-medium">Vocabulary</td>
                        <td className="px-3 py-2 text-center">{report.midVocabulary || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalVocabulary || "-"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Grammar / Structure</td>
                        <td className="px-3 py-2 text-center">{report.midGrammar || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalGrammar || "-"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Listening Comprehension</td>
                        <td className="px-3 py-2 text-center">{report.midListening || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalListening || "-"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Speaking</td>
                        <td className="px-3 py-2 text-center">{report.midSpeaking || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalSpeaking || "-"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Spelling/Dictation</td>
                        <td className="px-3 py-2 text-center">{report.midSpelling || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalSpelling || "-"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Reading Comprehension</td>
                        <td className="px-3 py-2 text-center">{report.midReading || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalReading || "-"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Writing</td>
                        <td className="px-3 py-2 text-center">{report.midWriting || "-"}</td>
                        <td className="px-3 py-2 text-center">{report.finalWriting || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Progress & Comments */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Progress Report</p>
                  <p className="font-semibold text-sm">
                    {report.studentProgress || "Participated well and understood most of this term's lessons"}
                  </p>
                </div>

                <div className="mb-6">
                   <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Feedback Guru</p>
                   <p className="text-sm opacity-80 italic">"{report.comments || "Tidak ada catatan."}"</p>
                </div>

                {/* REKAP KEHADIRAN */}
                <div className="pt-4 border-t border-black/10">
                  <p className="text-[10px] font-bold uppercase opacity-50 mb-3">Rekap Kehadiran Kelas Ini</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/60 px-2.5 py-1 rounded-lg text-[10px] font-bold">✅ Hadir: {totalHadir}</span>
                    <span className="bg-white/60 px-2.5 py-1 rounded-lg text-[10px] font-bold">🤒 Sakit: {totalSakit}</span>
                    <span className="bg-white/60 px-2.5 py-1 rounded-lg text-[10px] font-bold">💌 Izin: {totalIzin}</span>
                    <span className="bg-white/60 px-2.5 py-1 rounded-lg text-[10px] font-bold">❌ Alpha: {totalAlpha}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
)}

          </div>
        </>
      )}

      {/* MODAL POP-UP (SAMA DENGAN MURID) */}
      {selectedReports && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 relative max-h-[85vh] flex flex-col">
            <button onClick={() => setSelectedReports(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-semibold z-10">✕</button>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
              <span className="text-3xl">📚</span>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Laporan Pembelajaran</h3>
                <p className="text-xs text-slate-400">{selectedDateText}</p>
              </div>
            </div>
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {selectedReports.map((report, idx) => {
                const parts = report.notes.split('|').map((s: string) => s.trim());
                const data = {
                  topic: parts.find((p: string) => p.startsWith("Topic:"))?.replace("Topic:", "").trim() || "-",
                  desc: parts.find((p: string) => p.startsWith("Desc:"))?.replace("Desc:", "").trim() || "-",
                  performance: parts.find((p: string) => p.startsWith("Performance:"))?.replace("Performance:", "").trim() || "-",
                  englishUse: parts.find((p: string) => p.startsWith("English Use:"))?.replace("English Use:", "").trim() || "-",
                  progress: parts.find((p: string) => p.startsWith("Progress:"))?.replace("Progress:", "").trim() || "-",
                  notes: parts.find((p: string) => p.startsWith("Notes:"))?.replace("Notes:", "").trim() || "-",
                };

                return (
                  <div key={report.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-slate-800">{data.topic}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Sesi #{idx + 1}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Learning Descriptions</p>
                      <p className="text-slate-800 text-sm">{data.desc}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-sky-50 p-2 rounded-lg border border-sky-100 text-center">
                        <p className="text-[9px] uppercase font-bold text-sky-600 mb-0.5">Student Performance</p>
                        <p className="text-[11px] text-slate-800">{data.performance}</p>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-center">
                        <p className="text-[9px] uppercase font-bold text-indigo-600 mb-0.5">English Use in Class</p>
                        <p className="text-[11px] text-slate-800">{data.englishUse}</p>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                        <p className="text-[9px] uppercase font-bold text-emerald-600 mb-0.5">Student's Progress</p>
                        <p className="text-[11px] text-slate-800">{data.progress}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Parent’s Follow-Up</p>
                      <p className="text-slate-700 text-sm italic">{data.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
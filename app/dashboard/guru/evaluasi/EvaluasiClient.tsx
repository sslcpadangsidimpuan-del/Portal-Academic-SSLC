"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function EvaluasiClient({ levels, guruId }: { levels: any[], guruId: string }) {
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [reports, setReports] = useState<{ daily: any[], semester: any[], attendance: any }>({ 
    daily: [], semester: [], attendance: { hadir: 0, izin: 0, sakit: 0, alpa: 0 } 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // State Modal Edit Laporan Harian
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [editDailyId, setEditDailyId] = useState("");
  const [dailyFormData, setDailyFormData] = useState({
    material: "", topic: "", desc: "", performance: "", englishUse: "", progress: "", notes: ""
  });

  // State Modal Edit Assessment Semester
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [editSemesterId, setEditSemesterId] = useState("");
  const [semesterFormData, setSemesterFormData] = useState({
    term: "", comments: "", 
    studentPerformance: "Good",
    englishUse: "Always",
    studentProgress: "Participated well and understood most of this term's lessons",
    midVocabulary: "", midGrammar: "", midListening: "", midSpeaking: "", midSpelling: "", midReading: "", midWriting: "",
    finalVocabulary: "", finalGrammar: "", finalListening: "", finalSpeaking: "", finalSpelling: "", finalReading: "", finalWriting: ""
  });

  // State Modal Preview Rapor
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<any>(null);

  const selectedLevel = levels.find(l => l.id === selectedLevelId);
  const siswas = selectedLevel ? selectedLevel.siswas : [];
  const selectedSiswa = siswas.find((s: any) => s.id === selectedSiswaId);

  // Tarik Data Laporan & Absensi
  const fetchReports = async (siswaId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/guru/reports/list?siswaId=${siswaId}`);
      if (res.ok) {
        const data = await res.json();
        setReports({ 
          daily: data.dailyReports || [], 
          semester: data.semesterReports || [],
          attendance: data.attendanceSummary || { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
        });
      }
    } catch (error) {
      alert("Gagal memuat riwayat laporan.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedSiswaId) fetchReports(selectedSiswaId);
  }, [selectedSiswaId]);

  // Handler Edit Daily
  const openDailyEditModal = (report: any) => {
    setEditDailyId(report.id);
    const parts = report.notes ? report.notes.split('|').map((s: string) => s.trim()) : [];
    setDailyFormData({
      material: report.material || "",
      topic: parts.find((p: string) => p.startsWith("Topic:"))?.replace("Topic:", "").trim() || "",
      desc: parts.find((p: string) => p.startsWith("Desc:"))?.replace("Desc:", "").trim() || "",
      performance: parts.find((p: string) => p.startsWith("Performance:"))?.replace("Performance:", "").trim() || "Good",
      englishUse: parts.find((p: string) => p.startsWith("English Use:"))?.replace("English Use:", "").trim() || "Often",
      progress: parts.find((p: string) => p.startsWith("Progress:"))?.replace("Progress:", "").trim() || "Steady",
      notes: parts.find((p: string) => p.startsWith("Notes:"))?.replace("Notes:", "").trim() || "",
    });
    setIsDailyModalOpen(true);
  };

  const handleUpdateDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedNotes = `Topic: ${dailyFormData.topic} | Desc: ${dailyFormData.desc} | Performance: ${dailyFormData.performance} | English Use: ${dailyFormData.englishUse} | Progress: ${dailyFormData.progress} | Notes: ${dailyFormData.notes}`;
    const res = await fetch("/api/guru/reports/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "DAILY", id: editDailyId, material: dailyFormData.material, notes: joinedNotes })
    });
    if (res.ok) {
      alert("Laporan harian berhasil diperbarui!");
      setIsDailyModalOpen(false);
      fetchReports(selectedSiswaId);
    } else {
      alert("Gagal memperbarui laporan.");
    }
  };

  // Handler Edit Semester
  const openSemesterEditModal = (report: any) => {
    setEditSemesterId(report.id);
    setSemesterFormData({
      term: report.semester || "July - December 2026",
      comments: report.comments || "",
      studentPerformance: report.studentPerformance || "Good",
      englishUse: report.englishUse || "Always",
      studentProgress: report.studentProgress || "Participated well and understood most of this term's lessons",
      midVocabulary: report.midVocabulary?.toString() || "", midGrammar: report.midGrammar?.toString() || "", midListening: report.midListening?.toString() || "",
      midSpeaking: report.midSpeaking?.toString() || "", midSpelling: report.midSpelling?.toString() || "", midReading: report.midReading?.toString() || "", midWriting: report.midWriting?.toString() || "",
      finalVocabulary: report.finalVocabulary?.toString() || "", finalGrammar: report.finalGrammar?.toString() || "", finalListening: report.finalListening?.toString() || "",
      finalSpeaking: report.finalSpeaking?.toString() || "", finalSpelling: report.finalSpelling?.toString() || "", finalReading: report.finalReading?.toString() || "", finalWriting: report.finalWriting?.toString() || "",
    });
    setIsSemesterModalOpen(true);
  };

  const handleUpdateSemester = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/guru/reports/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SEMESTER", id: editSemesterId, ...semesterFormData })
    });
    if (res.ok) {
      alert("Assessment Semester berhasil diperbarui!");
      setIsSemesterModalOpen(false);
      fetchReports(selectedSiswaId);
    } else {
      alert("Gagal memperbarui Assessment Semester.");
    }
  };

  const openPreviewModal = (report: any) => {
    setSelectedReportForPreview(report);
    setIsPreviewModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-rapor");
    if (!element) return;
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin:       0,
        filename:     `Assessment_Report_${selectedSiswa?.user?.name || "Student"}_${selectedReportForPreview?.semester || "Term"}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      } as const;
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Gagal mengunduh PDF:", err);
      alert("Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getGradeLetter = (score: number | null | undefined) => {
    if (score === null || score === undefined || isNaN(score)) return "-";
    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 65) return "C";
    if (score >= 50) return "D";
    return "E";
  };

  const calcAvgRaw = (mid: number | null, final: number | null) => {
    if (mid !== null && final !== null) return (mid + final) / 2;
    if (mid !== null) return mid;
    if (final !== null) return final;
    return null;
  };

  const skillsList = [
    { label: "Vocabulary", midKey: "midVocabulary", finalKey: "finalVocabulary" },
    { label: "Grammar / Structure", midKey: "midGrammar", finalKey: "finalGrammar" },
    { label: "Listening Comprehension", midKey: "midListening", finalKey: "finalListening" },
    { label: "Speaking", midKey: "midSpeaking", finalKey: "finalSpeaking" },
    { label: "Spelling / Dictation", midKey: "midSpelling", finalKey: "finalSpelling" },
    { label: "Reading Comprehension", midKey: "midReading", finalKey: "finalReading" },
    { label: "Writing", midKey: "midWriting", finalKey: "finalWriting" },
  ];

  const teacherName = selectedReportForPreview?.guru?.user?.name || "Teacher";
  const formattedTeacherName = teacherName.startsWith("Ms.") || teacherName.startsWith("Mr.") ? teacherName : `Ms. ${teacherName}`;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        #printable-rapor * { border-color: #cbd5e1; }
      `}} />

      {/* 1. KONTROL PEMILIHAN KELAS & MURID */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 flex flex-col sm:flex-row gap-4 text-slate-800">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Select Class</label>
          <select 
            value={selectedLevelId} 
            onChange={(e) => { setSelectedLevelId(e.target.value); setSelectedSiswaId(""); }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-sky-500 font-medium text-sm sm:text-base"
          >
            <option value="">-- Select Level/Class --</option>
            {levels.map(l => <option key={l.id} value={l.id}>{l.name} ({l.category})</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Select Student</label>
          <select 
            value={selectedSiswaId} 
            onChange={(e) => setSelectedSiswaId(e.target.value)}
            disabled={Boolean(!selectedLevelId)}
            suppressHydrationWarning={true}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-sky-500 font-medium text-sm sm:text-base disabled:opacity-50"
          >
            <option value="">-- Select Student --</option>
            {siswas.map((s: any) => <option key={s.id} value={s.id}>{s.user.name} ({s.user.username})</option>)}
          </select>
        </div>
      </div>

      {/* 2. TIMELINE LAPORAN & ACTION */}
      {selectedSiswa && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-sky-50 p-4 sm:p-6 rounded-2xl border border-sky-100 gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-sky-900">Academic History: {selectedSiswa.user.name}</h3>
              <p className="text-xs sm:text-sm text-sky-600 mt-0.5">Student ID: {selectedSiswa.user.username}</p>
            </div>
            <Link 
              href={`/dashboard/guru/kelas/${selectedLevelId}/report/${selectedSiswa.id}/semester`}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl font-bold transition-all text-center text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>📝</span>Input New Assessment 
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-slate-400 font-medium animate-pulse">Loading report history...</div>
          ) : (
            <div className="space-y-6">
              
              {/* SECTION: LAPORAN SEMESTER */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Semester Assessment Report</h4>
                {reports.semester.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">There is no Semester Assessment data for this student yet.</div>
                ) : (
                  reports.semester.map(rep => (
                    <div key={rep.id} className="bg-white p-4 sm:p-5 rounded-2xl border-l-4 border-l-indigo-500 border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                            Term: {rep.semester || "July - December 2026"}
                          </span>

                          {/* BADGE KELAS AKTIF VS GRADUATED / RIWAYAT */}
                          {rep.level ? (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                              rep.isActiveClass 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {rep.isActiveClass ? "🟢 current class:" : "📜 Graduated:"} {rep.level.category} — {rep.level.name}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200">
                              📑 Old Data (No Level)
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-base sm:text-lg">Student Assessment Report</h4>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button type="button" onClick={() => openSemesterEditModal(rep)} className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors text-center">✏️ Edit</button>
                        <button type="button" onClick={() => openPreviewModal(rep)} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors text-center">🖨️ Preview Rapor</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* SECTION: LAPORAN HARIAN */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Daily Reports</h4>
                {reports.daily.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">There is no Daily Report yet.</div>
                ) : (
                  <div className="space-y-3">
                    {reports.daily.map(rep => {
                      const parts = rep.notes ? rep.notes.split('|').map((s: string) => s.trim()) : [];
                      const topic = parts.find((p: string) => p.startsWith("Topic:"))?.replace("Topic:", "") || rep.material;
                      return (
                        <div key={rep.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center gap-4 hover:border-emerald-300 transition-colors">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-emerald-600 text-[11px] font-bold">
                                📅 {new Date(rep.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              {rep.level && (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                                  🏫 {rep.level.category} — {rep.level.name}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-slate-800 text-sm">{topic}</h5>
                          </div>
                          <button onClick={() => openDailyEditModal(rep)} className="text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 p-2 rounded-xl text-xs font-bold transition-colors">✏️ Edit</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* --- MODAL PREVIEW & CETAK RAPOR GURU --- */}
      {isPreviewModalOpen && selectedReportForPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Preview Assessment Report</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDownloadPDF} disabled={isDownloading} style={{ backgroundColor: '#059669', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer', opacity: isDownloading ? 0.5 : 1 }}>
                {isDownloading ? "⏳ Memproses..." : "📥 Download PDF"}
              </button>
              <button onClick={() => setIsPreviewModalOpen(false)} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                ✕ Tutup
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '24px 8px', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
            <div id="printable-rapor" style={{ width: '210mm', backgroundColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              
              {/* === HALAMAN 1 === */}
              <div style={{ width: '210mm', height: '295mm', padding: '28px 40px', backgroundColor: '#ffffff', color: '#1e293b', position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
                
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none' }}>
                  <img src="/logotnsp.png" alt="watermark" style={{ width: '420px', height: 'auto', opacity: 0.15 }} />
                </div>

                <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid #0f172a', marginBottom: '20px' }}>
                    <img src="/logotnsp.png" alt="SSLC Logo" style={{ height: '130px', margin: '0 auto 4px auto', objectFit: 'contain' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0c4a6e', margin: 0 }}>SMART STEP LEARNING CENTER</h2>
                    <p style={{ fontSize: '10px', fontStyle: 'italic', fontWeight: '600', color: '#64748b', margin: '2px 0 0 0' }}>The First Step Toward a Bright Future</p>
                    <h1 style={{ fontSize: '20px', fontWeight: '900', margin: '12px 0 0 0', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0f172a' }}>STUDENT ASSESSMENT</h1>
                  </div>

                  <table style={{ width: '100%', fontSize: '12px', fontWeight: '600', marginBottom: '20px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '15%', paddingBottom: '6px' }}>Name</td><td style={{ width: '2%', paddingBottom: '6px' }}>:</td>
                        <td style={{ width: '33%', paddingBottom: '6px', fontWeight: 'bold', color: '#0f172a' }}>{selectedSiswa?.user?.name}</td>
                        <td style={{ width: '15%', paddingBottom: '6px' }}>Term</td><td style={{ width: '2%', paddingBottom: '6px' }}>:</td>
                        <td style={{ width: '33%', paddingBottom: '6px' }}>{selectedReportForPreview?.semester || "July - December 2026"}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '6px' }}>Day, Date</td><td style={{ paddingBottom: '6px' }}>:</td>
                        <td style={{ paddingBottom: '6px' }}>{new Date(selectedReportForPreview?.createdAt || Date.now()).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td style={{ paddingBottom: '6px' }}>Teacher Name</td><td style={{ paddingBottom: '6px' }}>:</td>
                        <td style={{ paddingBottom: '6px' }}>{formattedTeacherName}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>English Language Skill</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center', border: '1px solid #1e293b' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#e47aa6', fontWeight: 'bold', borderBottom: '1px solid #1e293b' }}>
                          <th style={{ padding: '8px', textAlign: 'left', width: '40%', border: '1px solid #1e293b', color: '#ffffff' }}>SKILL</th>
                          <th style={{ padding: '8px', width: '20%', border: '1px solid #1e293b', color: '#ffffff',fontWeight: 'bold' }}>MID</th>
                          <th style={{ padding: '8px', width: '20%', border: '1px solid #1e293b', color: '#ffffff',fontWeight: 'bold' }}>FINAL</th>
                          <th style={{ padding: '8px', width: '20%', border: '1px solid #1e293b', color: '#ffffff',fontWeight: 'bold' }}>AVERAGE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skillsList.map((sk, i) => {
                          const midVal = selectedReportForPreview?.[sk.midKey];
                          const finalVal = selectedReportForPreview?.[sk.finalKey];
                          const avgValRaw = calcAvgRaw(midVal, finalVal);
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #1e293b', fontWeight: '500', backgroundColor: 'transparent' }}>
                              <td style={{ padding: '8px', textAlign: 'left', fontWeight: '600', border: '1px solid #1e293b' }}>{sk.label}</td>
                              <td style={{ padding: '8px', fontWeight: 'bold', border: '1px solid #1e293b' }}>{getGradeLetter(midVal)}</td>
                              <td style={{ padding: '8px', fontWeight: 'bold', border: '1px solid #1e293b' }}>{getGradeLetter(finalVal)}</td>
                              <td style={{ padding: '8px', fontWeight: 'bold', border: '1px solid #1e293b' }}>{getGradeLetter(avgValRaw)}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ backgroundColor: 'rgba(226, 232, 240, 0.6)', fontWeight: '800' }}>
                          <td colSpan={3} style={{ padding: '8px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #1e293b' }}>Overall Test Score</td>
                          <td style={{ padding: '8px', fontWeight: '900', fontSize: '14px', border: '1px solid #1e293b', color: '#0c4a6e' }}>
                            {(() => {
                              let total = 0, count = 0;
                              skillsList.forEach(sk => {
                                const m = selectedReportForPreview?.[sk.midKey];
                                const f = selectedReportForPreview?.[sk.finalKey];
                                if (m !== null && m !== undefined) { total += m; count++; }
                                if (f !== null && f !== undefined) { total += f; count++; }
                              });
                              return getGradeLetter(count > 0 ? (total / count) : null);
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* REKAP ABSENSI TERUJI (Akurat dari spesifik kelas / fallback global) */}
                  <div style={{ marginBottom: '20px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '12px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Attendance :</span>
                      <span>
                        Present: {selectedReportForPreview?.attendanceSummary?.hadir ?? reports.attendance?.hadir ?? 0} | Excused: {selectedReportForPreview?.attendanceSummary?.izin ?? reports.attendance?.izin ?? 0} | Sick: {selectedReportForPreview?.attendanceSummary?.sakit ?? reports.attendance?.sakit ?? 0} | Unexcused: {selectedReportForPreview?.attendanceSummary?.alpa ?? reports.attendance?.alpa ?? 0}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', color: '#0f172a' }}>
                      Class Participation
                    </span>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #1e293b' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #000000' }}>
                          <td style={{ width: '32%', padding: '6px 8px', fontWeight: 'bold', backgroundColor: 'rgba(241, 245, 249, 0.6)', borderRight: '1px solid #1e293b' }}>
                            Student's Performance
                          </td>
                          <td style={{ width: '3%', padding: '6px 2px', textAlign: 'center' }}>:</td>
                          <td style={{ padding: '6px 8px', color: '#000000' }}>
                            {(selectedReportForPreview as any)?.studentPerformance || "Good"}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #000000' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 'bold', backgroundColor: 'rgba(241, 245, 249, 0.6)', borderRight: '1px solid #1e293b' }}>
                            English Use in Class
                          </td>
                          <td style={{ padding: '6px 2px', textAlign: 'center' }}>:</td>
                          <td style={{ padding: '6px 8px', color: '#000000' }}>
                            {(selectedReportForPreview as any)?.englishUse || "Always"}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 8px', fontWeight: 'bold', backgroundColor: 'rgba(241, 245, 249, 0.6)', borderRight: '1px solid #1e293b' }}>
                            Student's Progress Report
                          </td>
                          <td style={{ padding: '6px 2px', textAlign: 'center' }}>:</td>
                          <td style={{ padding: '6px 8px', fontStyle: 'italic', color: '#1e293b' }}>
                            {(selectedReportForPreview as any)?.studentProgress || "Participated well and understood most of this term's lessons"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <table style={{ width: '100%', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginTop: '24px', borderTop: '1px solid #e2e8f0', position: 'relative', zIndex: 10 }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '33.33%', paddingTop: '16px', verticalAlign: 'bottom' }}>
                          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedReportForPreview?.guru?.signatureUrl ? (
                              <img 
                                src={selectedReportForPreview.guru.signatureUrl} 
                                alt="Class Teacher Signature" 
                                style={{ height: '150px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                              />
                            ) : (
                              <div style={{ height: '50px' }}></div>
                            )}
                          </div>
                          <div style={{ borderTop: '1px solid #1e293b', width: '80%', margin: '0 auto', paddingTop: '4px' }}>
                            {formattedTeacherName}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#64748b' }}>Class Teacher</div>
                        </td>

                        <td style={{ width: '33.33%', paddingTop: '16px', verticalAlign: 'bottom' }}>
                          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src="/signatures/head-teacher.png" 
                              alt="Head Teacher Signature" 
                              style={{ height: '200px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                            />
                          </div>
                          <div style={{ borderTop: '1px solid #1e293b', width: '80%', margin: '0 auto', paddingTop: '4px' }}>
                            Ms. Dormian Lumban Raja
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#64748b' }}>Head Teacher</div>
                        </td>

                        <td style={{ width: '33.33%', paddingTop: '16px', verticalAlign: 'bottom' }}>
                          <div style={{ height: '50px' }}></div>
                          <div style={{ borderTop: '1px solid #1e293b', width: '80%', margin: '0 auto', paddingTop: '4px' }}>
                            Parent's Signature
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#64748b' }}>{selectedSiswa?.user?.name}'s Parent</div>
                        </td>
                      </tr>
                    </tbody>
                  </table> 

                </div>
              </div>

              <div style={{ pageBreakBefore: 'always', breakBefore: 'page' }}></div>

              {/* === HALAMAN 2 === */}
              <div style={{ width: '210mm', height: '295mm', padding: '28px 40px', backgroundColor: '#ffffff', color: '#1e293b', position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
                
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none' }}>
                  <img src="/logotnsp.png" alt="watermark" style={{ width: '420px', height: 'auto', opacity: 0.15 }} />
                </div>

                <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid #0f172a', marginBottom: '20px' }}>
                    <img src="/logotnsp.png" alt="SSLC Logo" style={{ height: '130px', margin: '0 auto 4px auto', objectFit: 'contain' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0c4a6e', margin: 0 }}>SMART STEP LEARNING CENTER</h2>
                    <p style={{ fontSize: '10px', fontStyle: 'italic', fontWeight: '600', color: '#64748b', margin: '2px 0 0 0' }}>The First Step Toward a Bright Future</p>
                  </div>

                  <div style={{ textAlign: 'center', paddingBottom: '12px', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', textTransform: 'uppercase', color: '#0f172a', margin: '4px 0 0 0' }}>COMMENTS / FEEDBACK</h1>
                  </div>

                  <div style={{ borderRadius: '12px', padding: '20px', minHeight: '110mm', marginBottom: 'auto', fontSize: '12px', lineHeight: '1.6', fontWeight: '600', border: '2px solid #0ea5e9', backgroundColor: 'rgba(240, 249, 255, 0.45)' }}>
                    {selectedReportForPreview?.comments ? (
                      <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#1e293b' }}>{selectedReportForPreview.comments}</p>
                    ) : (
                      <p style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '48px', color: '#94a3b8', margin: 0 }}>Belum ada catatan evaluasi dari guru.</p>
                    )}
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(224, 242, 254, 0.9)', border: '1px solid #bae6fd', color: '#0c4a6e', margin: '0 0 8px 0' }}>Grading System</h3>
                    <table style={{ width: '100%', borderSpacing: '8px', borderCollapse: 'separate', backgroundColor: 'rgba(248, 250, 252, 0.8)', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', textAlign: 'center', width: '33.33%' }}>
                            <span style={{ fontWeight: '900', display: 'block', fontSize: '14px', color: '#4f46e5' }}>A+ (95-100)</span> Outstanding
                          </td>
                          <td style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', textAlign: 'center', width: '33.33%' }}>
                            <span style={{ fontWeight: '900', display: 'block', fontSize: '14px', color: '#059669' }}>A (90-94)</span> Excellent
                          </td>
                          <td style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', textAlign: 'center', width: '33.33%' }}>
                            <span style={{ fontWeight: '900', display: 'block', fontSize: '14px', color: '#0284c7' }}>B (80-89)</span> Very Good
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', textAlign: 'center' }}>
                            <span style={{ fontWeight: '900', display: 'block', fontSize: '14px', color: '#d97706' }}>C (65-79)</span> Good
                          </td>
                          <td style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', textAlign: 'center' }}>
                            <span style={{ fontWeight: '900', display: 'block', fontSize: '14px', color: '#ea580c' }}>D (50-64)</span> Needs Improvement
                          </td>
                          <td style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', textAlign: 'center' }}>
                            <span style={{ fontWeight: '900', display: 'block', fontSize: '14px', color: '#e11d48' }}>E (0-49)</span> Needs Support
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT ASSESSMENT SEMESTER --- */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col text-slate-800">
            <button onClick={() => setIsSemesterModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg p-1">✕</button>
            <h3 className="text-lg sm:text-xl font-bold mb-4 pb-3 border-b border-slate-100 pr-8">✏️ Edit Semester Assessment</h3>
            
            <form onSubmit={handleUpdateSemester} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Period / Term</label>
                <input required type="text" value={semesterFormData.term} onChange={e => setSemesterFormData({...semesterFormData, term: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 bg-slate-50 text-slate-800 text-sm outline-none focus:border-indigo-500 font-medium" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase block">Skill Score Matrix (0 - 100)</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                </div>
                {skillsList.map((sk, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">{sk.label}</span>
                    <div className="grid grid-cols-2 gap-2 w-full sm:w-1/2">
                      <input type="number" min="0" max="100" placeholder="Mid" value={(semesterFormData as any)[sk.midKey]} onChange={e => setSemesterFormData({...semesterFormData, [sk.midKey]: e.target.value})} className="bg-white border text-slate-800 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-center font-bold outline-none focus:border-indigo-500" />
                      <input type="number" min="0" max="100" placeholder="Final" value={(semesterFormData as any)[sk.finalKey]} onChange={e => setSemesterFormData({...semesterFormData, [sk.finalKey]: e.target.value})} className="bg-white border rounded-lg text-slate-800 px-2.5 py-1.5 text-xs sm:text-sm text-center font-bold outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase block border-b border-slate-200 pb-2">Class Participation</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Student's Performance</label>
                    <select 
                      value={(semesterFormData as any).studentPerformance || "Good"} 
                      onChange={e => setSemesterFormData({...semesterFormData, studentPerformance: e.target.value})} 
                      className="w-full border rounded-xl px-3 py-2 bg-white text-slate-800 text-xs font-medium outline-none focus:border-indigo-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">English Use in Class</label>
                    <select 
                      value={(semesterFormData as any).englishUse || "Always"} 
                      onChange={e => setSemesterFormData({...semesterFormData, englishUse: e.target.value})} 
                      className="w-full border rounded-xl px-3 py-2 bg-white text-slate-800 text-xs font-medium outline-none focus:border-indigo-500"
                    >
                      <option value="Always">Always</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Student's Progress Report</label>
                  <select 
                    value={(semesterFormData as any).studentProgress || "Participated well and understood most of this term's lessons"} 
                    onChange={e => setSemesterFormData({...semesterFormData, studentProgress: e.target.value})} 
                    className="w-full border rounded-xl px-3 py-2 bg-white text-slate-800 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="Active, confident, and mastered this term's lessons">Active, confident, and mastered this term's lessons</option>
                    <option value="Participated well and understood most of this term's lessons">Participated well and understood most of this term's lessons</option>
                    <option value="Participated with guidance and is making progress">Participated with guidance and is making progress</option>
                    <option value="Requires additional guidance and practice">Requires additional guidance and practice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Comments / Feedback</label>
                <textarea rows={3} value={semesterFormData.comments} onChange={e => setSemesterFormData({...semesterFormData, comments: e.target.value})} className="w-full border rounded-xl p-3 bg-slate-50 text-slate-800 text-xs sm:text-sm outline-none focus:border-indigo-500" placeholder="Catatan evaluasi..." />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white py-2">
                <button type="button" onClick={() => setIsSemesterModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-xs text-slate-500 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT DAILY REPORT --- */}
      {isDailyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col text-slate-800">
            <button onClick={() => setIsDailyModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg p-1">✕</button>
            <h3 className="text-lg sm:text-xl font-bold mb-4 pb-3 border-b border-slate-100 pr-8">✏️ Edit Daily Report</h3>
            <form onSubmit={handleUpdateDaily} className="space-y-3 overflow-y-auto pr-1 flex-1">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Learning Topic</label><input required type="text" value={dailyFormData.material} onChange={e => setDailyFormData({...dailyFormData, material: e.target.value})} className="w-full mt-1 border rounded-xl px-3 py-2 bg-slate-50 text-xs sm:text-sm outline-none focus:border-sky-500" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Learning Descriptions</label><textarea required value={dailyFormData.desc} onChange={e => setDailyFormData({...dailyFormData, desc: e.target.value})} className="w-full mt-1 border rounded-xl px-3 py-2 bg-slate-50 text-xs sm:text-sm outline-none focus:border-sky-500" rows={2} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-bold text-slate-500 uppercase">Performance</label><select value={dailyFormData.performance} onChange={e => setDailyFormData({...dailyFormData, performance: e.target.value})} className="w-full mt-1 border rounded-xl px-2 py-2 bg-slate-50 text-xs outline-none"><option value="Excellent">Excellent</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Needs Improvement">Needs Improvement</option></select></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">English Use in Class</label><select value={dailyFormData.englishUse} onChange={e => setDailyFormData({...dailyFormData, englishUse: e.target.value})} className="w-full mt-1 border rounded-xl px-2 py-2 bg-slate-50 text-xs outline-none"><option value="Always">Always</option><option value="Often">Often</option><option value="Sometimes">Sometimes</option><option value="Rarely">Rarely</option></select></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Progress</label><select value={dailyFormData.progress} onChange={e => setDailyFormData({...dailyFormData, progress: e.target.value})} className="w-full mt-1 border rounded-xl px-2 py-2 bg-slate-50 text-xs outline-none"><option value="Fast">Fast</option><option value="Steady">Steady</option><option value="Slow">Slow</option></select></div>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Parent's Follow-up Note</label><textarea required value={dailyFormData.notes} onChange={e => setDailyFormData({...dailyFormData, notes: e.target.value})} className="w-full mt-1 border rounded-xl px-3 py-2 bg-slate-50 text-xs sm:text-sm outline-none focus:border-sky-500" rows={2} /></div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white py-2">
                <button type="button" onClick={() => setIsDailyModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-xs text-slate-500 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
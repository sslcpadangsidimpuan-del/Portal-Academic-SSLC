"use client";

import { useState } from "react";

export default function StudentReportClient({
  studentName,
  activeLevels = [],
  semesterReports = []
}: {
  studentName: string;
  activeLevels?: any[];
  semesterReports?: any[];
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // State untuk filter kelas yang dipilih
  const [selectedLevelId, setSelectedLevelId] = useState<string>("ALL");

  const activeLevelIds = activeLevels.map((l) => l.id);

  // Ambil daftar unik kelas (levels) dari semua laporan semester yang dimiliki siswa
  const allReportLevels = Array.from(
    new Map(
      semesterReports
        .filter((rep) => rep.level)
        .map((rep) => [rep.level.id, rep.level])
    ).values()
  );

  // Pisahkan kelas menjadi "Aktif" dan "Riwayat/Graduate"
  const currentActiveLevels = allReportLevels.filter((lvl: any) => activeLevelIds.includes(lvl.id));
  const pastHistoryLevels = allReportLevels.filter((lvl: any) => !activeLevelIds.includes(lvl.id));

  // Filter laporan berdasarkan kelas yang dipilih
  const filteredReports = selectedLevelId === "ALL"
    ? semesterReports
    : semesterReports.filter((rep) => rep.levelId === selectedLevelId);

  const skillsList = [
    { label: "Vocabulary", midKey: "midVocabulary", finalKey: "finalVocabulary" },
    { label: "Grammar / Structure", midKey: "midGrammar", finalKey: "finalGrammar" },
    { label: "Listening Comprehension", midKey: "midListening", finalKey: "finalListening" },
    { label: "Speaking", midKey: "midSpeaking", finalKey: "finalSpeaking" },
    { label: "Spelling / Dictation", midKey: "midSpelling", finalKey: "finalSpelling" },
    { label: "Reading Comprehension", midKey: "midReading", finalKey: "finalReading" },
    { label: "Writing", midKey: "midWriting", finalKey: "finalWriting" },
  ];

  // Helper Konversi Angka Ke Huruf (Grade)
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

  const calcOverallRaw = (report: any) => {
    let total = 0, count = 0;
    skillsList.forEach(sk => {
      const m = report[sk.midKey];
      const f = report[sk.finalKey];
      if (m !== null && m !== undefined) { total += m; count++; }
      if (f !== null && f !== undefined) { total += f; count++; }
    });
    return count > 0 ? (total / count) : null;
  };

  const getGradeInfo = (scoreRaw: number | null) => {
    if (scoreRaw === null) return { grade: "-", label: "-", color: "bg-slate-100 text-slate-500 border-slate-200" };
    const score = Number(scoreRaw.toFixed(1));
    if (score >= 95) return { grade: "A+", label: "Outstanding", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    if (score >= 90) return { grade: "A", label: "Excellent", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (score >= 80) return { grade: "B", label: "Very Good", color: "bg-sky-50 text-sky-700 border-sky-200" };
    if (score >= 65) return { grade: "C", label: "Good", color: "bg-amber-50 text-amber-700 border-amber-200" };
    if (score >= 50) return { grade: "D", label: "Needs Improvement", color: "bg-orange-50 text-orange-700 border-orange-200" };
    return { grade: "E", label: "Needs Support", color: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  const openPreview = (report: any) => {
    setSelectedReport(report);
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-rapor-siswa");
    if (!element) return;
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin:      0,
        filename:    `Assessment_Report_${studentName}_${selectedReport?.semester || "Term"}.pdf`,
        image:       { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, backgroundColor: '#ffffff' },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Gagal mengunduh PDF:", err);
      alert("Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper mendapatkan format nama guru untuk preview
  let modalTeacherName = selectedReport?.guru?.user?.name || "Teacher";
  if (!modalTeacherName.startsWith("Ms.") && !modalTeacherName.startsWith("Mr.")) {
    modalTeacherName = `Ms. ${modalTeacherName}`;
  }

  return (
    <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full box-border">
      <style dangerouslySetInnerHTML={{ __html: `
        #printable-rapor-siswa * { border-color: #cbd5e1; }
        .watermark-bg {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 400px; opacity: 0.05; pointer-events: none; z-index: 0;
        }
      `}} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Semester Report</h1>
          <p className="mt-1 text-slate-500 text-sm sm:text-base">Keep track of your academic achievements and report card history here.</p>
        </div>

        {/* Dropdown Filter Kelas Terkelompok */}
        {allReportLevels.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase pl-2">Filter:</span>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Classes ({allReportLevels.length})</option>

              {currentActiveLevels.length > 0 && (
                <optgroup label="🟢 Current Class">
                  {currentActiveLevels.map((lvl: any) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.category} — {lvl.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {pastHistoryLevels.length > 0 && (
                <optgroup label="📜 Graduated">
                  {pastHistoryLevels.map((lvl: any) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.category} — {lvl.name} (Lulus)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
      </div>

      {filteredReports.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {filteredReports.map((report) => {
            const overallRaw = calcOverallRaw(report);
            const overallScoreFormatted = overallRaw !== null ? overallRaw.toFixed(1) : "-";
            const gradeInfo = getGradeInfo(overallRaw);
            const formattedDate = new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            let teacherName = report.guru?.user?.name || "Teacher";
            if (!teacherName.startsWith("Ms.") && !teacherName.startsWith("Mr.")) {
              teacherName = `Ms. ${teacherName}`;
            }

            return (
              <div key={report.id} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden group hover:shadow-md transition-shadow">
                
                <div className={`h-2 sm:h-3 w-full ${gradeInfo.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                
                <div className="p-4 sm:p-6 md:p-8">
                  
                  {/* HEADER CARD */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">{report.semester || "Term Report"}</h3>
                        {report.level && (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            report.isActiveClass 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {report.isActiveClass ? "🟢 Current Class:" : "📜 Graduated:"} {report.level.category} — {report.level.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="text-base">👩‍🏫</span> {teacherName}</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1.5"><span className="text-base">📅</span> {formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex flex-col items-center justify-center px-5 py-2.5 rounded-xl border ${gradeInfo.color} min-w-[120px]`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Grade</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black">{gradeInfo.grade}</span>
                          <span className="text-xs font-bold opacity-90">({overallScoreFormatted})</span>
                        </div>
                        <span className="text-[10px] font-bold mt-0.5 text-center">{gradeInfo.label}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openPreview(report)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs shrink-0"
                      >
                        <span>🖨️</span> Preview & Download
                      </button>
                    </div>
                  </div>

                  {/* KONTEN TABEL NILAI */}
                  <div className="mb-6 border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-500">
                          <tr>
                            <th className="p-3 sm:p-4 font-bold uppercase tracking-wider w-2/5">English Language Skill</th>
                            <th className="p-3 sm:p-4 font-bold uppercase tracking-wider text-center">Mid Test</th>
                            <th className="p-3 sm:p-4 font-bold uppercase tracking-wider text-center">Final Test</th>
                            <th className="p-3 sm:p-4 font-bold uppercase tracking-wider text-center bg-slate-200/50">Average</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {skillsList.map((sk, i) => {
                            const midVal = (report as any)[sk.midKey];
                            const finalVal = (report as any)[sk.finalKey];
                            const avgRaw = calcAvgRaw(midVal, finalVal);

                            return (
                              <tr key={i} className="hover:bg-white transition-colors">
                                <td className="p-3 sm:p-4 font-semibold">{sk.label}</td>
                                <td className="p-3 sm:p-4 text-center font-bold">{getGradeLetter(midVal)} <span className="text-[10px] text-slate-400 font-normal">({midVal ?? "-"})</span></td>
                                <td className="p-3 sm:p-4 text-center font-bold">{getGradeLetter(finalVal)} <span className="text-[10px] text-slate-400 font-normal">({finalVal ?? "-"})</span></td>
                                <td className="p-3 sm:p-4 text-center font-bold bg-slate-100/50">{getGradeLetter(avgRaw)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-sky-50 border-t-2 border-sky-100 text-sky-900">
                            <td colSpan={3} className="p-3 sm:p-4 text-right font-black uppercase tracking-wider">Overall Test Grade</td>
                            <td className="p-3 sm:p-4 text-center font-black text-base">{getGradeLetter(overallRaw)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* COMMENTS */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>💬</span> Comments & Feedback
                    </h4>
                    <div className="bg-sky-50/50 p-4 sm:p-5 rounded-xl border border-sky-100">
                      {report.comments ? (
                        <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed whitespace-pre-line">"{report.comments}"</p>
                      ) : (
                        <p className="text-slate-400 italic text-sm">Belum ada catatan dari guru untuk semester ini.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-700">No Semester Report Yet</h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Your semester grades and evaluations will appear here after the teacher inputs them.</p>
        </div>
      )}

      {/* --- MODAL PREVIEW & CETAK RAPOR SISWA --- */}
      {isPreviewOpen && selectedReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Preview Assessment Report</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDownloadPDF} disabled={isDownloading} style={{ backgroundColor: '#059669', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer', opacity: isDownloading ? 0.5 : 1 }}>
                {isDownloading ? "⏳ Memproses..." : "📥 Download PDF"}
              </button>
              <button onClick={() => setIsPreviewOpen(false)} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                ✕ Close
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '24px 8px', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
            <div id="printable-rapor-siswa" style={{ width: '210mm', backgroundColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              
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
                        <td style={{ width: '33%', paddingBottom: '6px', fontWeight: 'bold', color: '#0f172a' }}>{studentName}</td>
                        <td style={{ width: '15%', paddingBottom: '6px' }}>Term</td><td style={{ width: '2%', paddingBottom: '6px' }}>:</td>
                        <td style={{ width: '33%', paddingBottom: '6px' }}>{selectedReport?.semester || "July - December 2026"}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '6px' }}>Day, Date</td><td style={{ paddingBottom: '6px' }}>:</td>
                        <td style={{ paddingBottom: '6px' }}>{new Date(selectedReport?.createdAt || Date.now()).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td style={{ paddingBottom: '6px' }}>Teacher Name</td><td style={{ paddingBottom: '6px' }}>:</td>
                        <td style={{ paddingBottom: '6px' }}>{modalTeacherName}</td>
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
                          const midVal = selectedReport?.[sk.midKey];
                          const finalVal = selectedReport?.[sk.finalKey];
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
                                const m = selectedReport?.[sk.midKey];
                                const f = selectedReport?.[sk.finalKey];
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

                  {/* REKAPITULASI ABSENSI SPESIFIK UNTUK KELAS INI */}
                  <div style={{ marginBottom: '20px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '12px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Attendance :</span>
                      <span>
                        Present: {selectedReport?.attendanceSummary?.hadir || 0} | Excused: {selectedReport?.attendanceSummary?.izin || 0} | Sick: {selectedReport?.attendanceSummary?.sakit || 0} | Unexcused: {selectedReport?.attendanceSummary?.alpa || 0}
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
                          <td style={{ width: '3%', padding: '6px 2px', textAlign: 'center' }}></td>
                          <td style={{ padding: '6px 8px', color: '#000000' }}>
                            {selectedReport?.studentPerformance || "Good"}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #000000' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 'bold', backgroundColor: 'rgba(241, 245, 249, 0.6)', borderRight: '1px solid #1e293b' }}>
                            English Use in Class
                          </td>
                          <td style={{ padding: '6px 2px', textAlign: 'center' }}></td>
                          <td style={{ padding: '6px 8px', color: '#000000' }}>
                            {selectedReport?.englishUse || "Always"}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 8px', fontWeight: 'bold', backgroundColor: 'rgba(241, 245, 249, 0.6)', borderRight: '1px solid #1e293b' }}>
                            Student's Progress Report
                          </td>
                          <td style={{ padding: '6px 2px', textAlign: 'center' }}></td>
                          <td style={{ padding: '6px 8px', fontStyle: 'italic', color: '#1e293b' }}>
                            {selectedReport?.studentProgress || "Participated well and understood most of this term's lessons"}
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
                            {selectedReport?.guru?.signatureUrl ? (
                              <img 
                                src={selectedReport.guru.signatureUrl} 
                                alt="Class Teacher Signature" 
                                style={{ height: '150px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                              />
                            ) : (
                              <div style={{ height: '50px' }}></div>
                            )}
                          </div>
                          <div style={{ borderTop: '1px solid #1e293b', width: '80%', margin: '0 auto', paddingTop: '4px' }}>
                            {modalTeacherName}
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
                          <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#64748b' }}>{studentName}'s Parent</div>
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
                    {selectedReport?.comments ? (
                      <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#1e293b' }}>{selectedReport.comments}</p>
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

    </div>
  );
}
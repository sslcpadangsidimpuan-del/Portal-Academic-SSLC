"use client";

import { useState } from "react";

interface KalenderProps {
  levels: any[];
  dataAbsensi: any[];
  dataLaporan: any[];
  siswaName?: string;
  siswaUsername?: string;
}

export default function KalenderAbsensiClient({ levels, dataAbsensi, dataLaporan, siswaName, siswaUsername }: KalenderProps) {
  const [selectedReports, setSelectedReports] = useState<any[] | null>(null);
  const [selectedDateText, setSelectedDateText] = useState<string>("");
  
  // State untuk navigasi kalender
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  // State untuk Filter Kelas (Default ke "ALL" jika siswa punya >1 kelas, atau ID kelas pertama)
  const [selectedLevelId, setSelectedLevelId] = useState<string>("ALL");

  // --- FILTER DATA BERDASARKAN KELAS YANG DIPILIH ---
  const filteredAbsensi = selectedLevelId === "ALL"
    ? dataAbsensi
    : dataAbsensi.filter(a => a.levelId === selectedLevelId);

  const filteredLaporan = selectedLevelId === "ALL"
    ? dataLaporan
    : dataLaporan.filter(l => l.levelId === selectedLevelId);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 
  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  const pdfMonthPeriod = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const hariDalamSeminggu = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const mapAbsensi: Record<string, string> = {};
  filteredAbsensi.forEach((record) => {
    if (record.date) {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      mapAbsensi[key] = record.status.toUpperCase();
    }
  });

  const mapLaporan: Record<string, any[]> = {};
  filteredLaporan.forEach((report) => {
    const rawDate = report.date || report.createdAt;
    if (rawDate) {
      const d = new Date(rawDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!mapLaporan[key]) mapLaporan[key] = [];
      mapLaporan[key].push(report);
    }
  });

  // Filter laporan bulanan sesuai kelas yang aktif
  const monthlyReports = filteredLaporan.filter(report => {
    const d = new Date(report.date || report.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());

  const fallbackSiswaName = siswaName || dataLaporan[0]?.siswa?.user?.name || "Student";
  const fallbackSiswaId = siswaUsername || dataLaporan[0]?.siswa?.user?.username || "-";

  const parseNotes = (notes: string) => {
    const parts = notes ? notes.split('|').map((s: string) => s.trim()) : [];
    return {
      topic: parts.find((p: string) => p.startsWith("Topic:"))?.replace("Topic:", "").trim() || "-",
      desc: parts.find((p: string) => p.startsWith("Desc:"))?.replace("Desc:", "").trim() || "-",
      performance: parts.find((p: string) => p.startsWith("Performance:"))?.replace("Performance:", "").trim() || "-",
      englishUse: parts.find((p: string) => p.startsWith("English Use:"))?.replace("English Use:", "").trim() || "-",
      progress: parts.find((p: string) => p.startsWith("Progress:"))?.replace("Progress:", "").trim() || "-",
      notes: parts.find((p: string) => p.startsWith("Notes:"))?.replace("Notes:", "").trim() || "-",
    };
  };

  const handleDownloadMonthlyReport = async () => {
    if (monthlyReports.length === 0) {
      alert("No daily reports are available for the selected class this month.");
      return;
    }

    const element = document.getElementById("printable-monthly-report");
    if (!element) return;

    setIsDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin:       [10, 10, 10, 10] as [number, number, number, number],
        filename:     `Daily_Report_${fallbackSiswaName}_${monthName.replace(' ', '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Gagal mengunduh PDF:", err);
      alert("Terjadi kesalahan saat memproses PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 w-full box-border">
      
      <style dangerouslySetInnerHTML={{ __html: `
        #printable-monthly-report * {
          border-color: #000000 !important;
        }
      `}} />

      {/* HEADER DENGAN DROPDOWN FILTER KELAS, NAVIGASI BULAN & TOMBOL DOWNLOAD */}
      <div className="mb-6 flex flex-col gap-3">
        
        {/* DROPDOWN FILTER KELAS */}
        {levels && levels.length > 0 && (
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Class:</span>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Classes ({levels.length})</option>
              {levels.map((lvl: any) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.category} — {lvl.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs gap-2">
          <button 
            onClick={handlePrevMonth} 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-xs shrink-0"
          >
            ← <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="text-center min-w-0">
            <h1 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Attendance & Daily Report</h1>
            <p className="text-sm sm:text-lg font-bold text-slate-800 truncate mt-0.5">
              Month: <span className="text-emerald-600">{monthName}</span>
            </p>
          </div>

          <button 
            onClick={handleNextMonth} 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-xs shrink-0"
          >
            <span className="hidden sm:inline">Next</span> →
          </button>
        </div>

        {/* TOMBOL DOWNLOAD LAPORAN BULANAN */}
        {monthlyReports.length > 0 && (
          <button 
            onClick={handleDownloadMonthlyReport}
            disabled={isDownloading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            {isDownloading ? "⏳ Processing..." : "📥 Download Daily Report (PDF)"}
          </button>
        )}
      </div>

      {/* BOX UTAMA KALENDER */}
      <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-emerald-100">
        
        {/* Label Nama Hari */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {hariDalamSeminggu.map(hari => (
            <div key={hari} className="text-center font-bold text-slate-400 text-xs sm:text-sm py-1 sm:py-2">{hari}</div>
          ))}
        </div>

        {/* Grid Angka Tanggal */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 auto-rows-fr">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

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
              cursorStyle = "cursor-pointer hover:scale-105 active:scale-95 shadow-xs hover:shadow-md transition-all";
            }

            return (
              <div 
                key={tanggal} 
                onClick={() => {
                  if (daftarLaporan && daftarLaporan.length > 0) {
                    setSelectedReports(daftarLaporan);
                    const formattedDateText = new Date(keyTanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    setSelectedDateText(formattedDateText);
                  }
                }}
                className={`aspect-square flex flex-col items-center justify-between p-1 sm:p-2 rounded-xl sm:rounded-2xl border font-bold transition-all duration-200 ${bgColor} ${cursorStyle}`}
              >
                <span className="text-sm sm:text-base md:text-xl font-bold leading-none pt-0.5 sm:pt-1">
                  {tanggal}
                </span>

                {daftarLaporan && (
                  <div className="w-full text-[7px] sm:text-[9px] bg-white/20 px-0.5 py-0.5 sm:px-1 rounded-sm sm:rounded font-medium text-white text-center truncate tracking-tighter leading-none mb-0.5">
                    📄 {daftarLaporan.length} <span className="hidden sm:inline">Report</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LEGENDA STATUS ABSENSI */}
      <div className="flex flex-wrap gap-3 items-center justify-center mt-6 text-[10px] sm:text-xs text-slate-500 font-medium px-2">
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Present</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span> Excused</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block"></span> Sick</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Unexcused</div>
      </div>

      {/* --- MODAL DETAIL LAPORAN HARIAN --- */}
      {selectedReports && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedReports(null)} 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 text-xl sm:text-2xl font-semibold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3 sm:pb-4 pr-6">
              <span className="text-2xl sm:text-3xl shrink-0">📚</span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-bold text-slate-800 truncate">Daily Report</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{selectedDateText}</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 pr-1 sm:pr-2">
              {selectedReports.map((report, idx) => {
                const data = parseNotes(report.notes);

                return (
                  <div key={report.id} className="border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center border-b pb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 truncate">{data.topic}</h4>
                        {report.level && (
                          <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-100 shrink-0">
                            {report.level.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-white border border-slate-100 px-1.5 py-0.5 rounded">Session #{idx + 1}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-100">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Learning Descriptions</p>
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{data.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-sky-50/60 p-2.5 sm:p-3 rounded-lg border border-sky-100 flex flex-col justify-center sm:items-center gap-1 sm:gap-1.5 text-left sm:text-center">
                        <p className="text-[9px] uppercase font-bold text-sky-600 tracking-wider">Performance</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug">{data.performance}</p>
                      </div>
                      <div className="bg-indigo-50/60 p-2.5 sm:p-3 rounded-lg border border-indigo-100 flex flex-col justify-center sm:items-center gap-1 sm:gap-1.5 text-left sm:text-center">
                        <p className="text-[9px] uppercase font-bold text-indigo-600 tracking-wider">English Use In Class</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug">{data.englishUse}</p>
                      </div>
                      <div className="bg-emerald-50/60 p-2.5 sm:p-3 rounded-lg border border-emerald-100 flex flex-col justify-center sm:items-center gap-1 sm:gap-1.5 text-left sm:text-center">
                        <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Progress</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug">{data.progress}</p>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parent’s Follow-Up</p>
                      <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">{data.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WADAH TEMPLATE CETAK PDF DAILY REPORT */}
      <div className="fixed inset-0 z-[-50] opacity-0 pointer-events-none overflow-visible">
        <div 
          id="printable-monthly-report" 
          style={{ 
            width: '277mm', 
            backgroundColor: '#ffffff', 
            color: '#1e293b', 
            padding: '24px 32px', 
            position: 'relative', 
            boxSizing: 'border-box', 
            overflow: 'hidden' 
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none' }}>
            <img src="/logotnsp.png" alt="watermark" style={{ width: '450px', height: 'auto', opacity: 0.14 }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid #0f172a', marginBottom: '16px' }}>
              <img src="/logotnsp.png" alt="SSLC Logo" style={{ height: '130px', margin: '0 auto 4px auto', objectFit: 'contain' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0c4a6e', margin: 0 }}>SMART STEP LEARNING CENTER</h2>
              <p style={{ fontSize: '10px', fontStyle: 'italic', fontWeight: '600', color: '#64748b', margin: '2px 0 0 0' }}>The First Step Toward a Bright Future</p>
              <h1 style={{ fontSize: '20px', fontWeight: '900', marginTop: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0f172a', margin: '8px 0 0 0' }}>STUDENT'S DAILY REPORT</h1>
            </div>

            <table style={{ width: '100%', fontSize: '12px', fontWeight: '600', marginBottom: '16px', borderCollapse: 'collapse', maxWidth: '500px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', paddingBottom: '4px' }}>Period</td>
                  <td style={{ width: '3%', paddingBottom: '4px' }}>:</td>
                  <td style={{ width: '72%', paddingBottom: '4px', fontWeight: 'bold', color: '#0f172a' }}>{pdfMonthPeriod}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '4px' }}>Student’s Name</td>
                  <td style={{ paddingBottom: '4px' }}>:</td>
                  <td style={{ paddingBottom: '4px', fontWeight: 'bold', color: '#0f172a' }}>{fallbackSiswaName}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '4px' }}>Student’s ID</td>
                  <td style={{ paddingBottom: '4px' }}>:</td>
                  <td style={{ paddingBottom: '4px', color: '#1e293b' }}>{fallbackSiswaId}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #1e293b', backgroundColor: 'transparent' }}>
              <thead>
                <tr style={{ backgroundColor: '#e47aa6', color: '#ffffff', fontWeight: 'bold', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #1e293b', width: '8%', color: '#ffffff' }}>Date</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #1e293b', width: '12%', color: '#ffffff' }}>Teacher</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #1e293b', width: '13%', color: '#ffffff' }}>Learning Topic</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #1e293b', width: '21%', color: '#ffffff' }}>Learning Descriptions</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #1e293b', width: '9%', color: '#ffffff' }}>Student Performance</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #1e293b', width: '9%', color: '#ffffff' }}>English Use in Class</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #1e293b', width: '13%', color: '#ffffff' }}>Student’s Progress</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #1e293b', width: '15%', color: '#ffffff' }}>Parents’s Follow Up</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReports.map((rep, index) => {
                  const p = parseNotes(rep.notes);
                  const tgl = new Date(rep.date || rep.createdAt).toLocaleDateString('en-GB');
                  
                  let teacherName = rep.guru?.user?.name || "Teacher";
                  if (!teacherName.startsWith("Ms.") && !teacherName.startsWith("Mr.")) {
                    teacherName = `Ms. ${teacherName}`;
                  }

                  return (
                    <tr key={rep.id || index} style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'transparent' }}>
                      <td style={{ padding: '8px', verticalAlign: 'top', border: '1px solid #1e293b' }}>{tgl}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', fontWeight: '600', border: '1px solid #1e293b' }}>{teacherName}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', fontWeight: '600', border: '1px solid #1e293b' }}>{p.topic}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', border: '1px solid #1e293b' }}>{p.desc}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold', border: '1px solid #1e293b' }}>{p.performance}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold', border: '1px solid #1e293b' }}>{p.englishUse}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', border: '1px solid #1e293b' }}>{p.progress}</td>
                      <td style={{ padding: '8px', verticalAlign: 'top', fontStyle: 'italic', border: '1px solid #1e293b', color: '#334155' }}>{p.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
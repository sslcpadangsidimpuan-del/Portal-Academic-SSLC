"use client";

export default function ContactAdmin() {
  const phoneNumber = "6282275058957"; 
  const message = encodeURIComponent("Halo Admin Smart Step, saya ingin bertanya terkait portal akademik...");
  const waUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 hover:scale-105 transition-all group"
      >
        {/* Lingkaran Icon WhatsApp Hijau */}
        <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xl shadow-md shadow-emerald-200 group-hover:rotate-12 transition-transform">
          💬
        </div>
        
        {/* Teks Pendukung */}
        <div className="text-left leading-tight pr-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Butuh Bantuan?</p>
          <p className="text-sm font-bold text-slate-800">Hubungi Admin</p>
        </div>
      </a>
    </div>
  );
}
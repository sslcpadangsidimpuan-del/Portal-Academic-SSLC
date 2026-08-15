"use client";

import { useState, useTransition } from "react";
import { assignTeacherToClasses } from "./actions";

export default function MoveTeacherForm({ teachers, levels }: { teachers: any[], levels: any[] }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Saat guru dipilih, centang otomatis kelas yang sedang diajar
  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setSelectedTeacherId(tId);
    
    if (tId) {
      const teacher = teachers.find(t => t.id === tId);
      const currentLevels = teacher?.guruProfile?.levels?.map((l: any) => l.id) || [];
      setSelectedLevels(currentLevels);
    } else {
      setSelectedLevels([]);
    }
  };

  // Handler toggle checkbox kelas
  const handleCheckboxChange = (levelId: string) => {
    setSelectedLevels(prev => 
      prev.includes(levelId) ? prev.filter(id => id !== levelId) : [...prev, levelId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) return alert("Pilih guru terlebih dahulu!");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", selectedTeacherId);
      
      // Masukkan semua ID level yang tercentang ke dalam formData
      selectedLevels.forEach(id => formData.append("levelIds", id));

      const res = await assignTeacherToClasses(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Berhasil menugaskan guru ke kelas tersebut!");
      }
    });
  };

  // Kelompokkan kelas berdasarkan kategori agar rapi di UI
  const categories = ["Regular", "Nursery", "Preschool", "Bimbel"];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Assign Guru ke Kelas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Pilih guru dan centang kelas yang akan diajar.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Pilih Guru</label>
          <select 
            value={selectedTeacherId}
            onChange={handleTeacherChange}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
          >
            <option value="">-- Pilih Guru --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {selectedTeacherId && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Pilih Kelas (Bisa Lebih Dari Satu)</label>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {categories.map(cat => {
                const catLevels = levels.filter(l => l.category === cat);
                if (catLevels.length === 0) return null;
                
                return (
                  <div key={cat} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 mb-2">{cat}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {catLevels.map(lvl => (
                        <label key={lvl.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedLevels.includes(lvl.id)}
                            onChange={() => handleCheckboxChange(lvl.id)}
                            className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{lvl.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending || !selectedTeacherId}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors mt-2"
        >
          {isPending ? "Menyimpan..." : "Simpan Penugasan Guru"}
        </button>
      </form>
    </div>
  );
}
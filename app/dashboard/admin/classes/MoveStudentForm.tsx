"use client";

import { useState, useEffect, useTransition } from "react";
import { moveStudent } from "./actions";

export default function MoveStudentForm({ students, levels }: { students: any[], levels: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Mencegah hydration mismatch dengan memastikan render terjadi setelah mount di client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-amber-500 h-96 animate-pulse" />;
  }

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    setSelectedStudentProfileId(profileId);
    setMessage(null);

    if (profileId) {
      const student = students.find(s => s.siswaProfile?.id === profileId);
      const currentLevels = student?.siswaProfile?.levels?.map((l: any) => l.id) || [];
      setSelectedLevels(currentLevels);
    } else {
      setSelectedLevels([]);
    }
  };

  const handleCheckboxChange = (levelId: string) => {
    setSelectedLevels(prev => 
      prev.includes(levelId) ? prev.filter(id => id !== levelId) : [...prev, levelId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentProfileId) return setMessage({ type: "error", text: "Pilih siswa terlebih dahulu!" });

    startTransition(async () => {
      const formData = new FormData();
      formData.append("siswaId", selectedStudentProfileId);
      
      selectedLevels.forEach(id => formData.append("levelIds", id));

      const result = await moveStudent(formData);
      
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Berhasil memperbarui penempatan kelas siswa!" });
      }
    });
  };

  const categories = ["Regular", "Nursery", "Preschool", "Bimbel", "Former Students",];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-amber-500">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Penempatan Kelas Siswa</h2>
      <p className="text-sm text-slate-500 mb-6">Pilih siswa dan centang kelas yang akan diikuti (bisa lebih dari satu).</p>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">1. Pilih Siswa</label>
          <select 
            value={selectedStudentProfileId}
            onChange={handleStudentChange}
            required 
            className="w-full text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="">-- Pilih Siswa --</option>
            {students.map(s => {
              const profileId = s.siswaProfile?.id;
              if (!profileId) return null;

              const activeLevels = s.siswaProfile?.levels?.map((l: any) => l.name).join(", ") || "Belum ada kelas";
              return (
                <option key={profileId} value={profileId}>
                  {s.name} (NIS: {s.username}) — [{activeLevels}]
                </option>
              );
            })}
          </select>
        </div>

        <div className={selectedStudentProfileId ? "block" : "hidden"}>
          <label className="block text-sm font-semibold text-slate-600 mb-2">2. Pilih Daftar Kelas</label>
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
            {categories.map(cat => {
              const catLevels = levels.filter(l => l.category === cat);
              if (catLevels.length === 0) return null;
              
              return (
                <div key={cat} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catLevels.map(lvl => (
                      <label key={lvl.id} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
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

        <button 
          type="submit" 
          disabled={isPending || selectedStudentProfileId === ""} 
          className="w-full mt-2 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isPending ? "Menyimpan..." : "Simpan Penempatan Kelas"}
        </button>
      </form>
    </div>
  );
}
"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";

interface UploadFormProps {
  action: (formData: FormData) => Promise<void>;
  students: { id: string; user: { name: string } }[];
}

export function UploadForm({ action, students }: UploadFormProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCompressing(true);

    const form = e.currentTarget;
    const originalFormData = new FormData(form);
    const files = originalFormData.getAll("media") as File[];

    const compressedFormData = new FormData();

    // Salin variabel form non-file
    compressedFormData.append("caption", (originalFormData.get("caption") as string) || "");
    compressedFormData.append("visibility", (originalFormData.get("visibility") as string) || "public");
    
    const selectedStudents = originalFormData.getAll("students");
    selectedStudents.forEach((studentId) => {
      compressedFormData.append("students", studentId as string);
    });

    // Opsi kompresi foto tanpa parameter libURL yang bermasalah
    const compressionOptions = {
      maxSizeMB: 0.8,              // Ukuran maksimal ~800KB
      maxWidthOrHeight: 1280,      // Resolusi maksimal 1280px
      useWebWorker: false,         // Matikan Web Worker sementara untuk menghindari bundler conflict
      alwaysKeepResolution: true
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type.startsWith("image/")) {
          setLoadingText(`Mengompresi & menyesuaikan foto (${i + 1}/${files.length})...`);
          
          const compressedFile = await imageCompression(file, compressionOptions);
          
          const finalFile = new File([compressedFile], file.name, {
            type: compressedFile.type || "image/jpeg",
          });
          
          compressedFormData.append("media", finalFile);
        } else {
          compressedFormData.append("media", file);
        }
      }

      setLoadingText("Mengunggah ke server...");
      await action(compressedFormData);
    } catch (error: any) {
      console.error("Detail Error Upload:", error);
      alert(`Gagal: ${error?.message || "Terjadi kesalahan saat memproses media."}`);
      setIsCompressing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3">
        <span className="text-xl">⚠️</span>
        <p className="text-rose-600 text-sm font-bold leading-relaxed">
          *Foto atau Video akan dihapus secara otomatis dalam 30 hari sejak tanggal upload.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Foto / Video (Bisa lebih dari 1)</label>
        <input 
          type="file" 
          name="media" 
          accept="image/*,video/mp4,video/quicktime,video/x-m4v" 
          multiple 
          disabled={isCompressing}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
          required 
        />
        <p className="text-xs text-slate-400 mt-2">Dukung format: JPG, PNG, MP4. Foto otomatis dirotasi & dikompresi sebelum diunggah.</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Caption / Deskripsi Singkat <span className="text-slate-400 font-normal">(Opsional)</span>
        </label>
        <textarea 
          name="caption" 
          rows={2}
          disabled={isCompressing}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
          placeholder="Tulis kegiatan apa yang sedang berlangsung..." 
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">Jenis & Ruang Lingkup Media</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="cursor-pointer">
            <input type="radio" name="visibility" value="public" className="peer sr-only" defaultChecked disabled={isCompressing} />
            <div className="h-full p-4 rounded-xl border-2 border-slate-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all flex flex-col justify-between">
              <div>
                <p className="font-bold text-indigo-900">🌍 Global Kelas</p>
                <p className="text-[11px] leading-tight text-slate-500 mt-1">Muncul di galeri semua orang tua & siswa di KELAS INI.</p>
              </div>
            </div>
          </label>

          <label className="cursor-pointer">
            <input type="radio" name="visibility" value="event" className="peer sr-only" disabled={isCompressing} />
            <div className="h-full p-4 rounded-xl border-2 border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-50 transition-all flex flex-col justify-between">
              <div>
                <p className="font-bold text-amber-900">🎉 Event Sekolah</p>
                <p className="text-[11px] leading-tight text-slate-500 mt-1">Muncul di SEMUA galeri siswa di seluruh kelas SSLC.</p>
              </div>
            </div>
          </label>

          <label className="cursor-pointer">
            <input type="radio" name="visibility" value="private" className="peer sr-only" disabled={isCompressing} />
            <div className="h-full p-4 rounded-xl border-2 border-slate-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all flex flex-col justify-between">
              <div>
                <p className="font-bold text-purple-900">🎯 Tag Spesifik</p>
                <p className="text-[11px] leading-tight text-slate-500 mt-1">Hanya muncul di galeri anak yang Anda tandai di bawah.</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <label className="block text-sm font-bold text-slate-700 mb-3">
          Tandai Siswa <span className="text-slate-400 font-normal">(Wajib jika memilih Tag Spesifik)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
          {students.map((siswa) => (
            <label key={siswa.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors">
              <input type="checkbox" name="students" value={siswa.id} disabled={isCompressing} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm font-medium text-slate-700">{siswa.user.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isCompressing}
        className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
          isCompressing 
            ? "bg-indigo-400 cursor-not-allowed text-white shadow-inner" 
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        }`}
      >
        {isCompressing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingText}
          </>
        ) : (
          <>
            <span>📤</span> Unggah Semua Media
          </>
        )}
      </button>
    </form>
  );
}
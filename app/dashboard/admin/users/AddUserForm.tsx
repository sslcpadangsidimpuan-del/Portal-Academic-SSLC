"use client";

import { useState } from "react";
import { createUser } from "./actions";

export default function AddUserForm({ levels }: { levels: any[] }) {
  const [role, setRole] = useState("GURU");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleAction(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const result = await createUser(formData);
    
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({ type: "success", text: "Pengguna berhasil ditambahkan!" });
      const form = document.getElementById("addUserForm") as HTMLFormElement;
      form.reset();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-100 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">Add New User</h2>
      
      {message && (
        <div className={`p-3 sm:p-4 rounded-xl mb-4 text-xs sm:text-sm font-semibold ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      <form id="addUserForm" action={handleAction} className="space-y-4">
        {/* TIPE PENGGUNA */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
          <select 
            name="role" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border text-slate-700 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="GURU">Teacher</option>
            <option value="SISWA">Student</option>
          </select>
        </div>

        {/* NAMA LENGKAP */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name of Student / Teacher</label>
          <input type="text" name="name" required placeholder="Cth: Paramitra Lubis" className="w-full text-xs sm:text-sm text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500" />
        </div>
        
        {/* USERNAME & PASSWORD (RESPONSIF 1 KOLOM DI HP / 2 KOLOM DI LAPTOP) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {role === "GURU" ? "Username / NIP" : "Username / NIS"}
            </label>
            <input type="text" name="username" required placeholder={role === "GURU" ? "NIP Guru" : "NIS Siswa"} className="w-full text-xs sm:text-sm text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <input type="password" name="password" required placeholder="Min. 6 karakter" className="w-full p-2.5 text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500" />
          </div>
        </div>

        {/* --- INFO TAMBAHAN KHUSUS GURU --- */}
        {role === "GURU" && (
          <div className="p-3 sm:p-4 bg-indigo-50 rounded-xl space-y-3 border border-indigo-100 mt-4">
            <h3 className="text-xs font-bold text-indigo-800">Assign to Class (Can choose &gt; 1)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-lg border border-indigo-100">
              {levels.map(level => (
                <label key={level.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" name="guruLevels" value={level.id} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="truncate">{level.name} <span className="text-[10px] text-slate-400">({level.category})</span></span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* --- INFO BIODATA LENGKAP KHUSUS SISWA --- */}
        {role === "SISWA" && (
          <div className="space-y-4 mt-4">
            
            {/* KELOMPOK 1: KELAS & KURSUS */}
            <div className="p-3 sm:p-4 bg-sky-50/70 rounded-xl space-y-3 border border-sky-100">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-800">1. Class & Course Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sign up for the Class</label>
                  <select name="levelId" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none">
                    <option value="">-- Choose Later --</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.category} - {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Join this Course (Since)</label>
                  <input type="date" name="joinDate" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>
            </div>

            {/* KELOMPOK 2: DATA PRIBADI SISWA */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">2. Student Personal Data</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select name="gender" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none">
                    <option value="">-- Choose --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* DROPDOWN AGAMA RESMI INDONESIA */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Religion</label>
                  <select name="religion" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none">
                    <option value="">-- Select Religion --</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">School Origin</label>
                  <input type="text" name="schoolOrigin" placeholder="Cth: SDIT Nurul Ilmi" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
                <textarea name="address" rows={2} placeholder="Alamat lengkap..." className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
              </div>
            </div>

            {/* KELOMPOK 3: DATA ORANG TUA */}
            <div className="p-3 sm:p-4 bg-amber-50/60 rounded-xl space-y-3 border border-amber-100">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800">3. Parent's Info</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Father's Name</label>
                  <input type="text" name="fatherName" placeholder="Nama Ayah" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Father's Occupation</label>
                  <input type="text" name="fatherOccupation" placeholder="Pekerjaan Ayah" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mother's Name</label>
                  <input type="text" name="motherName" placeholder="Nama Ibu" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mother's Occupation</label>
                  <input type="text" name="motherOccupation" placeholder="Pekerjaan Ibu" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telephone Number</label>
                <input type="text" name="parentPhone" placeholder="+62 812..." className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
              </div>
            </div>

            {/* KELOMPOK 4: DATA WALI (OPTIONAL) */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">4. Guardian (Opsional)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian's Name</label>
                  <input type="text" name="guardianName" placeholder="Nama Wali" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian's Occupation</label>
                  <input type="text" name="guardianOccupation" placeholder="Pekerjaan Wali" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian's Phone</label>
                  <input type="text" name="guardianPhone" placeholder="No. HP Wali" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian's Address</label>
                  <input type="text" name="guardianAddress" placeholder="Alamat Wali" className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>
            </div>

          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 sm:mt-6 bg-slate-800 text-white font-bold py-3 text-xs sm:text-sm rounded-xl hover:bg-slate-700 transition-colors disabled:bg-slate-400 shadow-xs"
        >
          {loading ? "Menyimpan..." : "Simpan Pengguna Baru"}
        </button>
      </form>
    </div>
  );
}
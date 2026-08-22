"use client";

import { useState, useMemo } from "react";
import { createNotification } from "./actions";

export default function CreateNotificationForm({ users }: { users: any[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [targetRole, setTargetRole] = useState("GLOBAL");
  
  // STATE BARU UNTUK FITUR PENCARIAN & SELEKSI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Logika untuk menyaring daftar user berdasarkan ketikan admin
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Logika untuk menambah/menghapus centang user
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) // Hapus jika sudah ada
        : [...prev, userId] // Tambahkan jika belum ada
    );
  };

  async function handleAction(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const result = await createNotification(formData);
    
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "The announcement has been successfully spread!" });
      (document.getElementById("notifForm") as HTMLFormElement).reset();
      setTargetRole("GLOBAL"); 
      setSelectedUsers([]); // Reset daftar pilihan
      setSearchTerm("");    // Reset kolom pencarian
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Send New Announcement</h2>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      <form id="notifForm" action={handleAction} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Announcement Title</label>
          <input type="text" name="title" required placeholder="Cth: Tagihan SPP Bulan Juli" className="w-full text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Message Type (Color)</label>
            <select name="type" className="w-full p-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl">
              <option value="INFO">Regular Information (Blue)</option>
              <option value="WARNING">Warning / Bill (Yellow))</option>
              <option value="SUCCESS">Good News (Green)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Target Recipient</label>
            <select name="targetRole" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full p-3 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="GLOBAL">All Users (Global)</option>
              <option value="SISWA">Only All Students</option>
              <option value="GURU">Only All Teachers</option>
              <option value="SPECIFIC">Select Manual (Specific)</option>
            </select>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FITUR BARU: KOTAK PENCARIAN & SELEKSI USER SPESIFIK     */}
        {/* ========================================================= */}
        {targetRole === "SPECIFIC" && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-slate-600">Select Recipient:</p>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                {selectedUsers.length} Selected
              </span>
            </div>
            
            {/* Kolom Pencarian Internal */}
            <input 
              type="text" 
              placeholder="🔍 Cari nama siswa / guru..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Daftar Checkbox yang bisa di-scroll */}
            <div className="max-h-48 overflow-y-auto space-y-1 bg-white p-2 rounded-lg border border-slate-200 custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-700text-center py-4">Name not found.</p>
              ) : (
                filteredUsers.map(u => (
                  <label key={u.id} className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 leading-tight">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{u.role}</span>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* HIDDEN INPUTS: Mengirim data state React ke FormData untuk diproses di Server Action */}
            {selectedUsers.map(id => (
              <input key={`hidden-${id}`} type="hidden" name="specificUsers" value={id} />
            ))}
          </div>
        )}
        {/* ========================================================= */}

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Message Content</label>
          <textarea name="content" required rows={4} placeholder="Write the announcement details here..." className="w-full text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl" />
        </div>

        <button type="submit" disabled={loading || (targetRole === "SPECIFIC" && selectedUsers.length === 0)} className="w-full mt-6 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
          {loading ? "Mengirim..." : "Active Announcement 🚀"}
        </button>
      </form>
    </div>
  );
}
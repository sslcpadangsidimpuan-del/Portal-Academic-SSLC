"use client";

import { useState } from "react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validasi dasar
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok!" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter!" });
      return;
    }

    setLoading(true);

    try {
      // PERBAIKAN: URL disesuaikan menjadi /api/change-password
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal mengubah password");

      setMessage({ type: "success", text: "Password berhasil diubah!" });
      
      // Reset form dan tutup modal setelah 1.5 detik
      setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage(null);
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Ganti Password</h3>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-semibold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password Lama</label>
            <input
              type="password"
              required
              className="w-full border border-slate-300 rounded-lg text-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password Baru</label>
            <input
              type="password"
              required
              className="w-full border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              className="w-full border border-slate-300 rounded-lg px-3 text-slate-800 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { createClass } from "./actions";

export default function AddClassForm({ activeTab }: { activeTab: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleAction(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await createClass(formData);
    
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Kelas ditambahkan!" });
      (document.getElementById("addClassForm") as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Class</h2>
      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}
      <form id="addClassForm" action={handleAction} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Classes Name</label>
          <input type="text" name="name" required placeholder="e.g. Preschool 4" className="w-full text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
          <select name="category" defaultValue={activeTab !== "PINDAH_SISWA" ? activeTab : "Regular"} className="w-full text-slate-700 p-3 bg-slate text-slate-700-50 border border-slate-200 rounded-xl">
            <option value="Regular" className="text-slate-700">Regular</option>
            <option value="Nursery" className="text-slate-700">Nursery</option>
            <option value="Preschool" className="text-slate-700">Preschool</option>
            <option value="Bimbel" className="text-slate-700">Bimbel</option>
            <option value="Former Students" className="text-red-700 ">Former Students</option>

            
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-400">
          {loading ? "Menyimpan..." : "Save"}
        </button>
      </form>
    </div>
  );
}
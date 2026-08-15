"use client";

import { deleteClass } from "./actions";

// 🟢 Pastikan menggunakan 'export default' di sini
export default function DeleteButton({ id }: { id: string }) {
  return (
    <form 
      action={async (formData: FormData) => {
        const res = await deleteClass(formData);
        if (res?.error) {
          alert(res.error);
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit" 
        className="text-xs text-rose-600 hover:text-rose-800 font-bold p-1 hover:bg-rose-100 rounded-lg transition-colors"
        onClick={(e) => {
          if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
            e.preventDefault();
          }
        }}
      >
        Hapus
      </button>
    </form>
  );
}
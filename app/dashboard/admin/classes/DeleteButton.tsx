"use client";

import { deleteClass } from "./actions";

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
          // 🔴 Pop-up peringatan tegas dalam Bahasa Inggris sesuai permintaan klien
          const isConfirmed = confirm(
            "Are you sure you want to delete this class?\n\n" +
            "WARNING: This action cannot be undone. All data inside this class, including galleries, daily reports, semester reports, and attendance records, will be PERMANENTLY deleted!"
          );
          
          if (!isConfirmed) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
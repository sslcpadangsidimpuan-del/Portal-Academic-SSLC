"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  // useFormStatus akan mendeteksi apakah form sedang dalam proses submit (pending)
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} // Kunci tombol agar tidak bisa diklik lagi
      className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
        pending 
          ? "bg-indigo-400 cursor-not-allowed text-white shadow-inner" 
          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
      }`}
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sedang Mengunggah... (Mohon Tunggu)
        </>
      ) : (
        <>
          <span>📤</span> Upload
        </>
      )}
    </button>
  );
}
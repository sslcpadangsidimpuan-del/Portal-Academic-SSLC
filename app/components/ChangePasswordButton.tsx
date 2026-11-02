"use client";

import { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ChangePasswordButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-200 shadow-sm flex items-center gap-2"
      >
        <span>🔑</span> Change Password
      </button>

      <ChangePasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
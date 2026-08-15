"use client";
import { useState } from "react";

export default function AutoGrade() {
  const [grade, setGrade] = useState("-");

  return (
    <div className="space-y-4">
      <input 
        name="examScore" 
        type="number" 
        step="any" 
        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 bg-white" 
        placeholder="Contoh: 85"
        required 
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (isNaN(val)) setGrade("-");
          else if (val >= 95) setGrade("A+");
          else if (val >= 90) setGrade("A");
          else if (val >= 80) setGrade("B");
          else if (val >= 65) setGrade("C");
          else if (val >= 50) setGrade("D");
          else setGrade("E");
        }}
      />
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-slate-600 font-medium">Grade Otomatis:</p>
        <p className="text-4xl font-bold text-indigo-700">{grade}</p>
      </div>
    </div>
  );
}
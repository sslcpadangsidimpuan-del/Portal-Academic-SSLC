"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ContactAdmin from "@/app/components/ContactAdmin";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ State toggle password
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      if (res.error.includes("TERLALU_BANYAK_PERCOBAAN")) {
        const seconds = res.error.split(":")[1] || "60";
        setError(`Terlalu banyak percobaan login! Silakan tunggu ${seconds} detik.`);
      } else {
        setError("Username atau password salah!");
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl shadow-sky-100/30 border border-sky-100/80 transition-all duration-300">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logotnsp.png"
              alt="SSLC Logo"
              width={150}
              height={40}
              priority
              className="h-auto w-auto object-contain"
            />
          </div>
          
          <h2 className="px-9 py-2 bg-sky-50 text-sky-600 rounded-full font-bold text-sm sm:text-base md:text-lg tracking-wider uppercase border border-sky-100/50 shadow-sm shadow-sky-100/40">
            Integrated Academic Portal
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-400 mt-3 font-medium">
            Silakan masukkan ID dan Password Anda
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs sm:text-sm rounded-xl text-center font-medium shadow-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">
              ID User (NIS / NIP)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: GURU001 atau SISWA001"
              className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 text-slate-700 placeholder:text-slate-300 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3 text-sm sm:text-base rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 text-slate-700 placeholder:text-slate-300 shadow-inner"
              />
              
              {/* 👁️ Tombol Mata Intip Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  // Ikon Mata Coret (Hide)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Ikon Mata Terbuka (Show)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.349-3.938 5.106-6.5 9.964-6.5s8.615 2.562 9.964 6.5c-1.349 3.938-5.106 6.5-9.964 6.5s-8.615-2.562-9.964-6.5Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm sm:text-base rounded-xl hover:opacity-95 active:scale-[0.99] transition-all duration-200 shadow-md shadow-sky-200 disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Kendala login? Hubungi admin dengan klik icon di pojok kanan bawah.
          </p>
        </div>
      </div>

      <ContactAdmin />
      
      <footer className="mt-auto py-6 px-6 text-center text-sm font-medium text-slate-400 border-t border-slate-200">
        © 2026 Smart Step Learning Center. All Rights Reserved.
      </footer>
    </div>
  );
}
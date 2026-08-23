import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// 🔤 Menggunakan Font Plus Jakarta Sans yang Modern & Elegan
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// 🏷️ Metadata Portal Sekolah & Konfigurasi WhatsApp Preview (Open Graph)
export const metadata: Metadata = {
  title: "Smart Step Learning Center (SSLC)",
  description: "Integrated Academic Portal & Learning Center",
  metadataBase: new URL("https://portal-academic-sslc.vercel.app"), // 👈 Wajib agar gambar OG terbaca
  openGraph: {
    title: "Smart Step Learning Center (SSLC)",
    description: "Integrated Academic Portal & Learning Center",
    url: "https://portal-academic-sslc.vercel.app",
    siteName: "SSLC Portal",
    locale: "id_ID",
    type: "website",
    // Next.js akan otomatis mencari file 'app/opengraph-image.png' atau 'app/opengraph-image.jpg' 
    // untuk mengisi bagian gambar di sini.
  },
};

// 📱 Pengunci Skala HP (Mencegah Zoom In & Tampilan Terpotong)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
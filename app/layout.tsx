import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// 🔤 Menggunakan Font Plus Jakarta Sans yang Modern & Elegan
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// 🏷️ Metadata Portal Sekolah
export const metadata: Metadata = {
  title: "Smart Step Learning Center (SSLC)",
  description: "Integrated Academic Portal & Learning Center",
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
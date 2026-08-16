import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 1. Proteksi Halaman Guru: Hanya Role GURU & SUPER_ADMIN
    if (pathname.startsWith("/dashboard/guru") && token?.role !== "GURU" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Proteksi Halaman Admin: Hanya Role SUPER_ADMIN
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "rahasia_kita_123",
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
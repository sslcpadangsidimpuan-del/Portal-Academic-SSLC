import LoginForm from "./LoginForm";

// Memaksa halaman login diproses secara dinamis saat runtime (mencegah prerender error di Vercel build)
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
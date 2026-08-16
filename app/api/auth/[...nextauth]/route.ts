import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// SIMPLE IN-MEMORY RATE LIMITER FOR LOGIN
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now();
  const limitWindow = 60 * 1000; // Window 1 menit
  const maxAttempts = 5;         // Max 5 kali coba per menit

  const record = loginAttempts.get(identifier);

  if (!record || now > record.resetTime) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + limitWindow });
    return { allowed: true, remainingSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  record.count += 1;
  return { allowed: true, remainingSeconds: 0 };
}

export const authOptions: AuthOptions = {
  // Tambahkan fallback string rahasia untuk mencegah MissingSecretError jika env terlambat dimuat
  secret: process.env.NEXTAUTH_SECRET || "rahasia_kita_123",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const cleanUsername = credentials.username.trim();

        // 1. CEK RATE LIMIT BERDASARKAN USERNAME
        const rateCheck = checkRateLimit(cleanUsername);
        if (!rateCheck.allowed) {
          throw new Error(`TERLALU_BANYAK_PERCOBAAN:${rateCheck.remainingSeconds}`);
        }

        // 2. CARI USER DI DATABASE
        const user = await prisma.user.findUnique({
          where: { username: cleanUsername }
        });

        if (!user || !user.password) return null;

        // 3. CEK PASSWORD (Plaintext VS Bcrypt)
        const isPlaintextMatch = credentials.password === user.password;
        const isBcryptMatch = !isPlaintextMatch && (await bcrypt.compare(credentials.password, user.password));

        if (!isPlaintextMatch && !isBcryptMatch) return null;

        // FEATURE: MIGRASI PLAINTEXT KE BCRYPT OTOMATIS
        if (isPlaintextMatch) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
        }

        // Reset rate limit jika login berhasil
        loginAttempts.delete(cleanUsername);

        return {
          id: user.id.toString(),
          name: user.name,
          username: user.username,
          role: user.role, 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// SANITASI & PROTEKSI NEXTAUTH_URL UNTUK PRERENDER BUILD VERCEL
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("example.com")) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://portal-academic-sslc.vercel.app";
};

process.env.NEXTAUTH_URL = getBaseUrl();

// SIMPLE IN-MEMORY RATE LIMITER FOR LOGIN
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now();
  const limitWindow = 60 * 1000;
  const maxAttempts = 5;

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

        const rateCheck = checkRateLimit(cleanUsername);
        if (!rateCheck.allowed) {
          throw new Error(`TERLALU_BANYAK_PERCOBAAN:${rateCheck.remainingSeconds}`);
        }

        const user = await prisma.user.findUnique({
          where: { username: cleanUsername }
        });

        if (!user || !user.password) return null;

        const isPlaintextMatch = credentials.password === user.password;
        const isBcryptMatch = !isPlaintextMatch && (await bcrypt.compare(credentials.password, user.password));

        if (!isPlaintextMatch && !isBcryptMatch) return null;

        if (isPlaintextMatch) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
        }

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
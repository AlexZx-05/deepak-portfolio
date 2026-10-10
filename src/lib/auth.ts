import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { consumeAdminOtp, normalizeAdminEmail } from "./adminOtp";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "Email code", type: "text" }
      },
      async authorize(credentials) {
        const email = process.env.ADMIN_EMAIL;

        if (!email || !credentials?.email || !credentials.otp) {
          return null;
        }

        const normalizedEmail = normalizeAdminEmail(email);
        const emailMatches = normalizeAdminEmail(credentials.email) === normalizedEmail;
        if (!emailMatches) return null;

        const otpMatches = await consumeAdminOtp(normalizedEmail, credentials.otp);
        if (!otpMatches) return null;

        return { id: "admin", email, name: "Admin" };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};

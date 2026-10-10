import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login"
  },
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname === "/admin/login") {
        return true;
      }
      return token?.role === "admin";
    }
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};

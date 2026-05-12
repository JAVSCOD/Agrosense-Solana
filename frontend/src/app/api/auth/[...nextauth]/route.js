import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    // 🔥 GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 🔥 GITHUB
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    // 🔥 LOGIN NORMAL (BACKEND)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://localhost:3001/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (data.ok) {
            return data.user; // 👈 IMPORTANTE
          }

          return null;
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  // 🔐 SESIÓN JWT
  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 🔥 GUARDAR USUARIO EN MONGO (OAUTH)
    async signIn({ user, account }) {
      try {
        // SOLO para Google/GitHub
        if (account.provider !== "credentials") {
          await fetch("http://localhost:3001/api/auth/oauth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombre: user.name,
              email: user.email,
              proveedor: account.provider,
            }),
          });
        }

        return true;
      } catch (error) {
        console.error("Error OAuth:", error);
        return true; // 🔥 NO bloquea login
      }
    },

    // 🔐 TOKEN
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },

    // 📦 SESSION
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };


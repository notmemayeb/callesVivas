import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";
import type { Provider } from "next-auth/providers/index";

function buildProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const GoogleProvider = require("next-auth/providers/google").default;
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.EMAIL_SERVER_HOST) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const EmailProvider = require("next-auth/providers/email").default;
    providers.push(
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM ?? "noreply@callesvivas.es",
      })
    );
  }

  providers.push(
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        name: { label: "Nombre", type: "text", placeholder: "Tu nombre" },
        role: { label: "Rol", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const existing = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (existing) {
          return {
            id: existing.id,
            email: existing.email,
            name: existing.name,
            image: existing.image,
          };
        }

        if (!credentials.name) return null;

        const validRoles = ["CITIZEN", "MODERATOR", "JOURNALIST", "COORDINATOR"];
        const role = validRoles.includes(credentials.role ?? "")
          ? credentials.role!
          : "CITIZEN";

        const user = await db.user.create({
          data: {
            email: credentials.email,
            name: credentials.name,
            role: role as "CITIZEN" | "MODERATOR" | "JOURNALIST" | "COORDINATOR",
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: buildProviders(),
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) ?? "CITIZEN";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "CITIZEN";
      }
      return token;
    },
  },
};

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  // Link Google to an existing email/password account when the email matches.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account" as const,
          },
        }
      : {}),
  },
  // `next start` sets NODE_ENV=production, which would enable rate limits and flake e2e sign-ups.
  ...(process.env.DISABLE_AUTH_RATE_LIMIT === "1" ? { rateLimit: { enabled: false } } : {}),
  // Must stay the last plugin so server actions can set cookies.
  plugins: [nextCookies()],
});

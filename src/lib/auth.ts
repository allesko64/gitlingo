import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const baseURL = process.env.BETTER_AUTH_URL;

const trustedOrigins = [
  baseURL,
  "http://localhost:3000",
  "http://localhost:3210",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
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

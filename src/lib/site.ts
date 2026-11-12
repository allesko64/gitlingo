/** Canonical public origin for SEO, sitemap, and social previews. */
export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ??
    "https://gitlingo.ayushlabs.tech";

  return new URL(raw.replace(/\/$/, ""));
}

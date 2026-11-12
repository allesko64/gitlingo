import type { MetadataRoute } from "next";
import { lessons } from "@/lessons/lessons";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl().origin;
  const now = new Date();

  return [
    {
      url: origin,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/lessons`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...lessons.map((lesson) => ({
      url: `${origin}/lessons/${lesson.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

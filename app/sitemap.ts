import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const BASE = "https://josh-ai-personal-website.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${BASE}/posts/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : undefined,
  }));
  return [
    { url: BASE, changeFrequency: "daily" as const },
    { url: `${BASE}/posts` },
    { url: `${BASE}/about` },
    { url: `${BASE}/brain`, changeFrequency: "weekly" as const },
    ...posts,
  ];
}

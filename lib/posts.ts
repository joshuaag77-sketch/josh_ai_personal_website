import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import type { Post, PostListItem } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""));
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(markdown);
  return String(result.value);
}

export function getAllPosts(): PostListItem[] {
  const slugs = getPostSlugs();
  const posts: PostListItem[] = [];

  for (const slug of slugs) {
    const fullPath = path.join(POSTS_DIR, `${slug}.md`);
    if (!fs.existsSync(fullPath)) continue;
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data } = matter(raw);
    if (data.status === "draft") continue;
    posts.push({
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: data.summary ?? "",
    });
  }

  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  if (data.status === "draft") return null;

  const contentHtml = await markdownToHtml(content);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary ?? "",
    content,
    contentHtml,
  };
}

export function getPostSlugsForStaticParams(): { slug: string }[] {
  return getPostSlugs().map((slug) => ({ slug }));
}

# Josh AI Personal Website

A personal site built with Next.js, documenting my journey building with AI tools, workflows, and agents. Content is stored as Markdown in `content/posts/` and exposed via the site and a JSON API for future RAG/chatbot integration.

## Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography` for post content
- **Content**: Markdown files with frontmatter (gray-matter + remark)
- **Theme**: Dark/light mode via `next-themes`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Creating a New Post

1. Add a new `.md` file under `content/posts/`, e.g. `content/posts/my-new-post.md`.
2. Use this frontmatter shape:

```yaml
---
title: "Your Post Title"
date: "2026-02-17"
tags: ["agents", "workflows", "learning-log"]
summary: "Short description for cards and SEO."
status: "published"
---
```

3. Write your content in Markdown below the frontmatter.
4. Commit and push; the site will rebuild (or run `npm run build` locally to verify).

**Tags** used across the site: `agents`, `workflows`, `productivity`, `learning-log`, `experiments`, `meta`.

## API Routes

- **`GET /api/posts`** – Returns JSON array of all published posts (title, slug, date, tags, summary). Use this for future embedding/RAG pipelines.
- **`/api/chat`** – Placeholder for a future chatbot endpoint (not implemented yet).

## Project Structure

- `app/` – Next.js App Router pages (home, posts, about, API)
- `components/` – Header, Footer, ThemeProvider, ThemeToggle
- `content/posts/` – Markdown blog posts
- `lib/` – `posts.ts` (content loading), `types.ts` (TypeScript types)

## Deploy on Vercel

1. Push this repo to GitHub (or connect your existing repo).
2. In [Vercel](https://vercel.com), import the project and set build command to `next build` and output to `.next`.
3. Add a custom domain in Vercel and point your DNS (A/CNAME) as per Vercel’s instructions.

## Future: Chatbot / RAG

The content and `/api/posts` are designed so you can later:

- Fetch posts via `/api/posts` (or read from `content/posts`).
- Chunk content, generate embeddings, and store in a vector DB (e.g. Pinecone, Supabase pgvector).
- Implement `/api/chat` to query the vector DB and call an LLM with your content as context.

A placeholder `/api/chat` route can be added when you’re ready to implement this.

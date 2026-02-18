export interface PostFrontmatter {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  kicker?: string;
  heroImage?: string;
  heroAlt?: string;
  heroCaption?: string;
  status?: "draft" | "published";
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  kicker?: string;
  heroImage?: string;
  heroAlt?: string;
  heroCaption?: string;
  readingTime?: string;
  content: string;
  contentHtml?: string;
}

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  kicker?: string;
  heroImage?: string;
  heroAlt?: string;
  readingTime?: string;
}

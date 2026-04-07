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
  interactive?: string;
  featured?: boolean;
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
  interactive?: string;
  featured?: boolean;
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
  featured?: boolean;
}

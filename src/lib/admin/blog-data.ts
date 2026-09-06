import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content_markdown: string;
  category: string;
  author_name: string;
  cover_image_url: string | null;
  image_alt: string | null;
  seo_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const BLOG_SELECT = "id, slug, title, description, content_markdown, category, author_name, cover_image_url, image_alt, seo_title, meta_description, keywords, status, featured, published_at, created_at, updated_at";

export async function fetchAdminBlogPosts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT)
    .order("updated_at", { ascending: false })
    .limit(250);

  if (error) throw new Error(`Unable to load blog posts: ${error.message}`);
  return (data ?? []) as AdminBlogPost[];
}

export async function fetchAdminBlogPost(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load blog post: ${error.message}`);
  return (data as AdminBlogPost | null) ?? null;
}

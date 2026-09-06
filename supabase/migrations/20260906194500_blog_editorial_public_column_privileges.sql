revoke all privileges on table public.blog_posts from anon, authenticated;

grant select (
  id,
  slug,
  title,
  description,
  content_markdown,
  category,
  author_name,
  cover_image_url,
  image_alt,
  seo_title,
  meta_description,
  keywords,
  status,
  featured,
  published_at,
  created_at,
  updated_at
) on table public.blog_posts to anon, authenticated;

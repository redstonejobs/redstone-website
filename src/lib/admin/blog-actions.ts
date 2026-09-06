"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logAuditEvent } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify } from "@/lib/public/countries";
import { createAdminClient } from "@/utils/supabase/admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createBlogPost(formData: FormData) {
  const context = await requireAdmin();
  const payload = buildPayload(formData, context.user.id, true);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(payload)
    .select("id, slug, status")
    .single();

  if (error) throw new Error(blogWriteError(error.message));

  await logAuditEvent(context, {
    action: "blog.create",
    entityType: "blog_post",
    entityId: data.id,
    description: `Created blog post ${payload.title}`,
    metadata: { slug: data.slug, status: data.status },
  });

  revalidateBlog(data.slug);
  redirect(`/admin/blog/${data.id}/edit?saved=1`);
}

export async function updateBlogPost(id: string, formData: FormData) {
  assertUuid(id);
  const context = await requireAdmin();
  const supabase = createAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("blog_posts")
    .select("id, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (readError || !existing) throw new Error("Blog post could not be found.");

  const payload = buildPayload(formData, context.user.id, false, existing.published_at);
  const { data, error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id)
    .select("id, slug, status")
    .single();

  if (error) throw new Error(blogWriteError(error.message));

  await logAuditEvent(context, {
    action: "blog.update",
    entityType: "blog_post",
    entityId: id,
    description: `Updated blog post ${payload.title}`,
    metadata: { oldSlug: existing.slug, slug: data.slug, status: data.status },
  });

  revalidateBlog(existing.slug);
  revalidateBlog(data.slug);
  redirect(`/admin/blog/${id}/edit?saved=1`);
}

export async function setBlogPostStatus(id: string, status: "draft" | "published" | "archived") {
  assertUuid(id);
  const context = await requireAdmin();
  const supabase = createAdminClient();

  const { data: post, error: readError } = await supabase
    .from("blog_posts")
    .select("id, slug, title, description, content_markdown, category, seo_title, meta_description, keywords, published_at")
    .eq("id", id)
    .maybeSingle();

  if (readError || !post) throw new Error("Blog post could not be found.");
  if (status === "published") validateForPublication(post);

  const { error } = await supabase
    .from("blog_posts")
    .update({
      status,
      updated_by: context.user.id,
      published_at: status === "published" ? post.published_at ?? new Date().toISOString() : post.published_at,
    })
    .eq("id", id);

  if (error) throw new Error(`Unable to change blog status: ${error.message}`);

  await logAuditEvent(context, {
    action: `blog.${status}`,
    entityType: "blog_post",
    entityId: id,
    description: `${status === "published" ? "Published" : status === "draft" ? "Unpublished" : "Archived"} blog post ${post.title}`,
    metadata: { slug: post.slug, status },
  });

  revalidateBlog(post.slug);
  revalidatePath("/admin/blog");
}

function buildPayload(
  formData: FormData,
  userId: string,
  creating: boolean,
  existingPublishedAt?: string | null,
) {
  const title = value(formData, "title");
  const requestedSlug = value(formData, "slug");
  const status = (value(formData, "status") || "draft") as "draft" | "published" | "archived";
  if (!["draft", "published", "archived"].includes(status)) throw new Error("Choose a valid blog status.");

  const description = value(formData, "description");
  const contentMarkdown = value(formData, "content_markdown");
  const category = value(formData, "category") || "Recruitment Insights";
  const seoTitle = value(formData, "seo_title");
  const metaDescription = value(formData, "meta_description");
  const keywords = parseKeywords(value(formData, "keywords"));
  const slug = slugify(requestedSlug || title);

  if (title.length < 5) throw new Error("Blog title must be at least 5 characters.");
  if (!slug) throw new Error("A valid blog slug is required.");
  if (description.length < 20) throw new Error("Article description must be at least 20 characters.");
  if (seoTitle.length > 70) throw new Error("SEO title should be 70 characters or fewer.");
  if (metaDescription.length > 180) throw new Error("Meta description should be 180 characters or fewer.");
  if (keywords.length > 12) throw new Error("Use no more than 12 focused SEO keywords.");

  const requestedPublishedAt = value(formData, "published_at");
  const parsedPublishedAt = requestedPublishedAt ? parseDate(requestedPublishedAt) : null;

  const payload: Record<string, unknown> = {
    slug,
    title,
    description,
    content_markdown: contentMarkdown,
    category,
    author_name: value(formData, "author_name") || "Red Stone Editorial Team",
    cover_image_url: value(formData, "cover_image_url") || null,
    image_alt: value(formData, "image_alt") || null,
    seo_title: seoTitle || null,
    meta_description: metaDescription || null,
    keywords,
    featured: formData.get("featured") === "on",
    status,
    updated_by: userId,
    published_at:
      status === "published"
        ? parsedPublishedAt ?? existingPublishedAt ?? new Date().toISOString()
        : parsedPublishedAt ?? existingPublishedAt ?? null,
  };

  if (creating) payload.created_by = userId;
  if (status === "published") validateForPublication(payload);
  return payload;
}

function validateForPublication(post: Record<string, unknown>) {
  const title = String(post.title ?? "").trim();
  const description = String(post.description ?? "").trim();
  const content = String(post.content_markdown ?? "").trim();
  const category = String(post.category ?? "").trim();
  const meta = String(post.meta_description ?? "").trim();
  const keywords = Array.isArray(post.keywords) ? post.keywords : [];

  const errors: string[] = [];
  if (title.length < 15) errors.push("use a descriptive title of at least 15 characters");
  if (description.length < 80) errors.push("write an article summary of at least 80 characters");
  if (content.length < 500) errors.push("add at least 500 characters of useful article content");
  if (!category) errors.push("choose a category");
  if (meta && (meta.length < 80 || meta.length > 180)) errors.push("keep the meta description between 80 and 180 characters");
  if (keywords.length < 2) errors.push("add at least 2 focused SEO keywords");

  if (errors.length) throw new Error(`Before publishing, ${errors.join("; ")}.`);
}

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function parseKeywords(raw: string) {
  return [...new Set(raw.split(/[,\n]/).map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

function parseDate(raw: string) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new Error("Publication date is invalid.");
  return date.toISOString();
}

function assertUuid(id: string) {
  if (!UUID_PATTERN.test(id)) throw new Error("Invalid blog post ID.");
}

function revalidateBlog(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

function blogWriteError(message: string) {
  return message.includes("blog_posts_slug_key") || message.toLowerCase().includes("duplicate")
    ? "That blog URL slug is already in use. Choose a unique slug."
    : `Unable to save blog post: ${message}`;
}

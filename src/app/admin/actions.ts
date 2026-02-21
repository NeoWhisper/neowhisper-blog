"use server";

import { revalidatePath } from "next/cache";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { logger } from "@/lib/logger";

type PostLocale = "en" | "ja" | "ar";

export type CreatePostInput = {
  title: string;
  slug: string;
  locale: PostLocale;
  excerpt?: string;
  content: string;
  category?: string;
};

export type ActionResult = {
  success?: true;
  message?: string;
  postId?: string;
  error?: string;
};

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const normalizeLocale = (value: string): PostLocale =>
  (value === "ja" || value === "ar") ? value : "en";

const hasRequiredContent = (input: CreatePostInput): boolean =>
  Boolean(
    input.title?.trim() &&
    input.slug?.trim() &&
    input.content?.trim() &&
    input.locale,
  );

export async function createPost(input: CreatePostInput): Promise<ActionResult> {
  if (!hasRequiredContent(input)) {
    return { error: "Title, slug, locale, and content are required." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  if (!isAllowedAdminEmail(user.email)) {
    return { error: "Access denied." };
  }

  const slug = normalizeSlug(input.slug);
  if (!slug) {
    return { error: "Slug is invalid after normalization." };
  }

  const locale = normalizeLocale(input.locale);

  const { data: existingGroup, error: groupFetchError } = await supabase
    .from("translation_groups")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (groupFetchError) {
    await logger.error("Admin:CreatePost", "groupFetchError", groupFetchError);
    return { error: `Failed to check translation group: ${groupFetchError.message}` };
  }

  let groupId = existingGroup?.id as string | undefined;

  if (!groupId) {
    const { data: createdGroup, error: createGroupError } = await supabase
      .from("translation_groups")
      .insert({ slug })
      .select("id")
      .single();

    if (createGroupError || !createdGroup) {
      await logger.error("Admin:CreatePost", "createGroupError", createGroupError);
      return {
        error: `Failed to create translation group: ${createGroupError?.message ?? "unknown error"}`,
      };
    }

    groupId = createdGroup.id;
  }

  const { data: post, error: createPostError } = await supabase
    .from("posts_dynamic")
    .insert({
      translation_group_id: groupId,
      locale,
      title: input.title.trim(),
      excerpt: input.excerpt?.trim() || null,
      content: input.content.trim(),
      category: input.category?.trim() || null,
      author_id: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (createPostError || !post) {
    await logger.error("Admin:CreatePost", "createPostError", createPostError);
    return {
      error: `Failed to create post: ${createPostError?.message ?? "unknown error"}`,
    };
  }

  revalidatePath("/blog");
  revalidatePath("/admin");

  return {
    success: true,
    message: "Draft created.",
    postId: String(post.id),
  };
}

export async function updatePostStatus(postId: string, status: "draft" | "published"): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    return { error: "Access denied." };
  }

  const { error } = await supabase
    .from("posts_dynamic")
    .update({ status })
    .eq("id", postId);

  if (error) {
    await logger.error("Admin:UpdateStatus", "error", error);
    return { error: `Failed to update status: ${error.message}` };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { success: true, message: `Post is now ${status}.` };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    return { error: "Access denied." };
  }

  const { error } = await supabase
    .from("posts_dynamic")
    .delete()
    .eq("id", postId);

  if (error) {
    await logger.error("Admin:DeletePost", "error", error);
    return { error: `Failed to delete post: ${error.message}` };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { success: true, message: "Post deleted successfully." };
}

export type UpdatePostInput = {
  postId: string;
  title: string;
  slug: string;
  locale: PostLocale;
  excerpt?: string;
  content: string;
  category?: string;
};

export async function updatePostDetail(input: UpdatePostInput): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    return { error: "Access denied." };
  }

  const slug = normalizeSlug(input.slug);
  if (!slug) return { error: "Slug is invalid after normalization." };
  const locale = normalizeLocale(input.locale);

  const { data: post, error: fetchErr } = await supabase
    .from("posts_dynamic")
    .select("translation_group_id")
    .eq("id", input.postId)
    .single();

  if (fetchErr || !post) return { error: "Failed to find post." };

  await supabase
    .from("translation_groups")
    .update({ slug })
    .eq("id", post.translation_group_id);

  const { error } = await supabase
    .from("posts_dynamic")
    .update({
      title: input.title.trim(),
      locale,
      excerpt: input.excerpt?.trim() || null,
      content: input.content.trim(),
      category: input.category?.trim() || null,
    })
    .eq("id", input.postId);

  if (error) {
    await logger.error("Admin:UpdateDetail", "error", error);
    return { error: `Failed to update post: ${error.message}` };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return { success: true, message: "Post updated successfully.", postId: input.postId };
}

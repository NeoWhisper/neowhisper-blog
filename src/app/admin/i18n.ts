export type AdminLang = "en" | "ja";

export const adminStrings: Record<
  AdminLang,
  {
    layout: {
      backToSite: string;
      internalOnly: string;
      newPost: string;
      managePosts: string;
    };
    page: {
      workspace: string;
      newDraft: string;
      subtitle: string;
      title: string;
      slug: string;
      slugHint: string;
      language: string;
      category: string;
      categoryOptional: string;
      excerpt: string;
      excerptOptional: string;
      content: string;
      clearForm: string;
      saveDraft: string;
      saving: string;
      draftCreated: string;
      draftFailed: string;
      footerNote: string;
      placeholderTitle: string;
      placeholderSlug: string;
      placeholderCategory: string;
      placeholderExcerpt: string;
      placeholderContent: string;
      wordLabel: string;
      charLabel: string;
    };
    posts: {
      title: string;
      subtitle: string;
      status: string;
      locale: string;
      actions: string;
      draft: string;
      published: string;
      publish: string;
      unpublish: string;
      delete: string;
      confirmDelete: string;
      emptyState: string;
    };
  }
> = {
  en: {
    layout: {
      backToSite: "← Back to site",
      internalOnly: "NeoWhisper Admin · Internal use only",
      newPost: "New Post",
      managePosts: "Manage Posts",
    },
    page: {
      workspace: "Admin Workspace",
      newDraft: "New Draft Post",
      subtitle: "Create a multilingual post stored as a draft in Supabase.",
      title: "Title",
      slug: "Slug",
      slugHint: "Only the URL segment; no slashes.",
      language: "Language",
      category: "Category",
      categoryOptional: "(optional)",
      excerpt: "Excerpt",
      excerptOptional: "(optional)",
      content: "Markdown Content",
      clearForm: "Clear form",
      saveDraft: "Save Draft",
      saving: "Saving…",
      draftCreated: "Draft created successfully.",
      draftFailed: "Failed to create draft.",
      footerNote: "Posts are saved as status: draft and won't appear publicly until published.",
      placeholderTitle: "My awesome post title",
      placeholderSlug: "my-awesome-post",
      placeholderCategory: "e.g. TypeScript, DevOps",
      placeholderExcerpt: "A short description shown in blog cards…",
      placeholderContent: "# Post Title\n\nStart writing your post in Markdown…",
      wordLabel: "words",
      charLabel: "chars",
    },
    posts: {
      title: "Manage Posts",
      subtitle: "Review, publish, unpublish, and delete blog posts.",
      status: "Status",
      locale: "Locale",
      actions: "Actions",
      draft: "Draft",
      published: "Published",
      publish: "Publish",
      unpublish: "Unpublish",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this post?",
      emptyState: "No posts found.",
    },
  },
  ja: {
    layout: {
      backToSite: "← サイトに戻る",
      internalOnly: "NeoWhisper 管理 · 社内利用のみ",
      newPost: "新規投稿",
      managePosts: "投稿管理",
    },
    page: {
      workspace: "管理ワークスペース",
      newDraft: "新規下書き",
      subtitle: "Supabase に下書きとして保存する多言語投稿を作成します。",
      title: "タイトル",
      slug: "スラッグ",
      slugHint: "URL の部分のみ。スラッシュは不要です。",
      language: "言語",
      category: "カテゴリ",
      categoryOptional: "（任意）",
      excerpt: "抜粋",
      excerptOptional: "（任意）",
      content: "Markdown 本文",
      clearForm: "フォームをクリア",
      saveDraft: "下書きを保存",
      saving: "保存中…",
      draftCreated: "下書きを保存しました。",
      draftFailed: "下書きの保存に失敗しました。",
      footerNote: "投稿は下書きとして保存され、公開するまで表示されません。",
      placeholderTitle: "記事のタイトル",
      placeholderSlug: "my-awesome-post",
      placeholderCategory: "例: TypeScript, DevOps",
      placeholderExcerpt: "ブログカードに表示する短い説明…",
      placeholderContent: "# タイトル\n\nMarkdown で本文を入力…",
      wordLabel: "単語",
      charLabel: "文字",
    },
    posts: {
      title: "投稿管理",
      subtitle: "ブログ投稿のレビュー、公開、非公開、削除を行います。",
      status: "ステータス",
      locale: "言語",
      actions: "アクション",
      draft: "下書き",
      published: "公開済",
      publish: "公開する",
      unpublish: "非公開にする",
      delete: "削除",
      confirmDelete: "本当にこの投稿を削除しますか？",
      emptyState: "投稿が見つかりません。",
    },
  },
};

export function normalizeAdminLang(value?: string | null): AdminLang {
  return value === "ja" ? "ja" : "en";
}

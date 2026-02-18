"use client";

import { useState } from "react";
import { createPost } from "./actions";

type LocaleValue = "en" | "ja" | "ar";

const initialState = {
  title: "",
  slug: "",
  locale: "en" as LocaleValue,
  category: "",
  excerpt: "",
  content: "",
};

export default function AdminPage() {
  const [form, setForm] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function updateField<K extends keyof typeof initialState>(
    key: K,
    value: (typeof initialState)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    const result = await createPost({
      title: form.title,
      slug: form.slug,
      locale: form.locale,
      category: form.category,
      excerpt: form.excerpt,
      content: form.content,
    });

    setIsLoading(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error ?? "Failed to create draft.");
      return;
    }

    setIsError(false);
    setMessage(result.message ?? "Draft created.");
    setForm(initialState);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin: Create Draft
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Create multilingual draft posts stored in Supabase.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="title"
            type="text"
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <input
            name="slug"
            type="text"
            required
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder="Slug (example: production-contact-forms)"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="locale"
              value={form.locale}
              onChange={(event) =>
                updateField("locale", event.target.value as LocaleValue)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="ar">Arabic</option>
            </select>

            <input
              name="category"
              type="text"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Category (optional)"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            placeholder="Excerpt (optional)"
            className="h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <textarea
            name="content"
            required
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="Markdown content"
            className="h-80 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save Draft"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

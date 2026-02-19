"use client";

import { useState } from "react";
import { createPost } from "./actions";

type LocaleValue = "en" | "ja" | "ar";

const LOCALES: { value: LocaleValue; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
];

const initialState = {
  title: "",
  slug: "",
  locale: "en" as LocaleValue,
  category: "",
  excerpt: "",
  content: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none ring-0 transition-all duration-200 focus:border-purple-500/60 focus:bg-white/8 focus:ring-2 focus:ring-purple-500/20 hover:border-white/20";

const labelClass = "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

export default function AdminPage() {
  const [form, setForm] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function updateField<K extends keyof typeof initialState>(
    key: K,
    value: (typeof initialState)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

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
      setStatus({ type: "error", message: result.error ?? "Failed to create draft." });
      return;
    }

    setStatus({ type: "success", message: result.message ?? "Draft created successfully." });
    setForm(initialState);
  }

  const charCount = form.content.length;
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mx-auto max-w-3xl mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 ring-1 ring-purple-500/30">
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">Admin Workspace</p>
            <h1 className="text-2xl font-bold text-white leading-tight">New Draft Post</h1>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1 ml-12">
          Create a multilingual post stored as a draft in Supabase.
        </p>
      </div>

      {/* Main card */}
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl">

          {/* Card top bar */}
          <div className="flex items-center gap-2 border-b border-white/8 px-6 py-4 bg-white/[0.02]">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-auto text-xs text-gray-500 font-mono">posts_dynamic • draft</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Title */}
            <div>
              <label htmlFor="admin-title" className={labelClass}>Title <span className="text-purple-400">*</span></label>
              <input
                id="admin-title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="My awesome post title"
                className={inputClass}
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="admin-slug" className={labelClass}>Slug <span className="text-purple-400">*</span></label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-500 text-sm font-mono">/blog/</span>
                <input
                  id="admin-slug"
                  name="slug"
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="my-awesome-post"
                  className={`${inputClass} pl-14 font-mono`}
                />
              </div>
            </div>

            {/* Locale + Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="admin-locale" className={labelClass}>Language</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base leading-none">
                    {LOCALES.find((l) => l.value === form.locale)?.flag}
                  </span>
                  <select
                    id="admin-locale"
                    name="locale"
                    value={form.locale}
                    onChange={(e) => updateField("locale", e.target.value as LocaleValue)}
                    className={`${inputClass} pl-10 appearance-none cursor-pointer`}
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value} className="bg-gray-900">
                        {l.flag} {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="admin-category" className={labelClass}>Category <span className="text-gray-600">(optional)</span></label>
                <input
                  id="admin-category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="e.g. TypeScript, DevOps"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="admin-excerpt" className={labelClass}>Excerpt <span className="text-gray-600">(optional)</span></label>
              <textarea
                id="admin-excerpt"
                name="excerpt"
                value={form.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                placeholder="A short description shown in blog cards…"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-content" className={`${labelClass} mb-0`}>
                  Markdown Content <span className="text-purple-400">*</span>
                </label>
                <span className="text-xs text-gray-500 font-mono tabular-nums">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
              <textarea
                id="admin-content"
                name="content"
                required
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder={"# Post Title\n\nStart writing your post in Markdown…"}
                rows={16}
                className={`${inputClass} font-mono resize-y leading-relaxed`}
              />
            </div>

            {/* Status banner */}
            {status && (
              <div
                role="alert"
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                    : "bg-red-500/10 border border-red-500/25 text-red-300"
                  }`}
              >
                <span className="mt-0.5 shrink-0 text-base leading-none">
                  {status.type === "success" ? "✓" : "✕"}
                </span>
                {status.message}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { setForm(initialState); setStatus(null); }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear form
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500 hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    Save Draft
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-gray-600">
          Posts are saved as <span className="text-gray-500 font-mono">status: draft</span> and won&apos;t appear publicly until published.
        </p>
      </div>
    </main>
  );
}

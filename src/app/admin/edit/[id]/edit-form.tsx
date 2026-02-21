"use client";

import { useState } from "react";
import { updatePostDetail } from "../../actions";
import Link from "next/link";
import { adminStrings } from "../../i18n";

type LocaleValue = "en" | "ja" | "ar";

const LOCALES: { value: LocaleValue; label: string; flag: string }[] = [
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "ja", label: "日本語", flag: "🇯🇵" },
    { value: "ar", label: "العربية", flag: "🇸🇦" },
];

const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none ring-0 transition-all duration-200 focus:border-purple-500/60 focus:bg-white/8 focus:ring-2 focus:ring-purple-500/20 hover:border-white/20";

const labelClass = "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

type EditFormProps = {
    initialData: {
        id: string;
        title: string;
        slug: string;
        locale: LocaleValue;
        category: string;
        excerpt: string;
        content: string;
    };
    tCommon: typeof adminStrings.en.page;
    tEdit: typeof adminStrings.en.edit;
};

export default function EditForm({ initialData, tCommon, tEdit }: EditFormProps) {
    const [form, setForm] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    function updateField<K extends keyof typeof initialData>(
        key: K,
        value: (typeof initialData)[K],
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setStatus(null);

        const result = await updatePostDetail({
            postId: form.id,
            title: form.title,
            slug: form.slug,
            locale: form.locale,
            category: form.category,
            excerpt: form.excerpt,
            content: form.content,
        });

        setIsLoading(false);

        if (!result.success) {
            setStatus({ type: "error", message: result.error ?? tEdit.failed });
            return;
        }

        setStatus({ type: "success", message: result.message ?? tEdit.success });
    }

    const charCount = form.content.length;
    const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

    return (
        <>
            {/* Page header */}
            <div className="mx-auto max-w-3xl mb-8">
                <Link href="/admin/posts" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors mb-4">
                    {tEdit.backToPosts}
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 ring-1 ring-purple-500/30">
                        <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">{tCommon.workspace}</p>
                        <h1 className="text-2xl font-bold text-white leading-tight">{tEdit.title}</h1>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-1 ml-12">
                    {tEdit.subtitle}
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
                        <span className="ml-auto text-xs text-gray-500 font-mono">posts_dynamic • edit</span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* Title */}
                        <div>
                            <label htmlFor="admin-title" className={labelClass}>{tCommon.title} <span className="text-purple-400">*</span></label>
                            <input
                                id="admin-title"
                                name="title"
                                type="text"
                                required
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder={tCommon.placeholderTitle}
                                className={inputClass}
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label htmlFor="admin-slug" className={labelClass}>{tCommon.slug} <span className="text-purple-400">*</span></label>
                            <p className="text-xs text-gray-500 mb-1.5">{tCommon.slugHint}</p>
                            <div className="flex rounded-xl border border-white/10 bg-white/5 overflow-hidden focus-within:border-purple-500/60 focus-within:ring-2 focus-within:ring-purple-500/20">
                                <span className="flex items-center border-r border-white/10 bg-white/[0.03] px-4 text-sm font-mono text-gray-500 shrink-0">/blog/</span>
                                <input
                                    id="admin-slug"
                                    name="slug"
                                    type="text"
                                    required
                                    value={form.slug}
                                    onChange={(e) => updateField("slug", e.target.value.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "-"))}
                                    placeholder={tCommon.placeholderSlug}
                                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none font-mono"
                                />
                            </div>
                        </div>

                        {/* Locale + Category */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="admin-locale" className={labelClass}>{tCommon.language}</label>
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
                                                {l.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="admin-category" className={labelClass}>{tCommon.category} <span className="text-gray-600">{tCommon.categoryOptional}</span></label>
                                <input
                                    id="admin-category"
                                    name="category"
                                    type="text"
                                    value={form.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                    placeholder={tCommon.placeholderCategory}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label htmlFor="admin-excerpt" className={labelClass}>{tCommon.excerpt} <span className="text-gray-600">{tCommon.excerptOptional}</span></label>
                            <textarea
                                id="admin-excerpt"
                                name="excerpt"
                                value={form.excerpt}
                                onChange={(e) => updateField("excerpt", e.target.value)}
                                placeholder={tCommon.placeholderExcerpt}
                                rows={2}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="admin-content" className={`${labelClass} mb-0`}>
                                    {tCommon.content} <span className="text-purple-400">*</span>
                                </label>
                                <span className="text-xs text-gray-500 font-mono tabular-nums">
                                    {wordCount} {tCommon.wordLabel} · {charCount} {tCommon.charLabel}
                                </span>
                            </div>
                            <textarea
                                id="admin-content"
                                name="content"
                                required
                                value={form.content}
                                onChange={(e) => updateField("content", e.target.value)}
                                placeholder={tCommon.placeholderContent}
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
                        <div className="flex items-center justify-end pt-1">
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
                                        {tEdit.saving}
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                        </svg>
                                        {tEdit.saveChanges}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

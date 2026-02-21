"use client";

import { useState } from "react";
import Link from "next/link";
import { deletePost, updatePostStatus } from "../actions";

import { adminStrings } from "../i18n";

type Post = {
    id: string;
    title: string;
    status: "draft" | "published";
    locale: string;
    slug: string;
    category: string;
    createdAt: string;
};

type PostsTableProps = {
    posts: Post[];
    dict: typeof adminStrings.en.posts;
};

export default function PostsTable({ posts, dict }: PostsTableProps) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleStatusChange = async (post: Post, newStatus: "draft" | "published") => {
        setIsProcessing(post.id);
        const result = await updatePostStatus(post.id, newStatus);
        void (result.error ? (console.error("[PostsTable:StatusChange] error:", result.error), alert(result.error)) : null);
        setIsProcessing(null);
    };

    const handleDelete = async (postId: string) => {
        const result = confirm(dict.confirmDelete) && (setIsProcessing(postId), await deletePost(postId));
        void (result && result.error ? (console.error("[PostsTable:Delete] error:", result.error), alert(result.error)) : null);
        setIsProcessing(null);
    };

    const ALL_LOCALES: { value: string; flag: string }[] = [
        { value: "en", flag: "🇬🇧" },
        { value: "ja", flag: "🇯🇵" },
        { value: "ar", flag: "🇸🇦" },
    ];

    return posts.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
            {dict.emptyState}
        </div>
    ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-white/5">
                    <tr>
                        <th className="px-6 py-4">{dict.title}</th>
                        <th className="px-6 py-4">{dict.locale}</th>
                        <th className="px-6 py-4">{dict.translations}</th>
                        <th className="px-6 py-4">{dict.status}</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">{dict.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {posts.map((post) => {
                        const siblings = posts.filter(p => p.slug === post.slug);

                        return (
                            <tr key={post.id} className="transition-colors hover:bg-white/[0.02]">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-100">{post.title}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-0.5">/blog/{post.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-white/10">
                                        {post.locale.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {ALL_LOCALES.map(loc => {
                                            const existing = siblings.find(s => s.locale === loc.value);
                                            if (existing) {
                                                return (
                                                    <span key={loc.value} title={loc.value.toUpperCase()} className="opacity-100 grayscale-0 filter transition-all scale-110">
                                                        {loc.flag}
                                                    </span>
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={loc.value}
                                                    href={`/admin?slug=${post.slug}&targetLocale=${loc.value}&title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category || "")}`}
                                                    className="opacity-30 grayscale filter hover:grayscale-0 hover:opacity-100 hover:scale-125 transition-all"
                                                    title={`${dict.addTranslation} (${loc.value.toUpperCase()})`}
                                                >
                                                    {loc.flag}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${post.status === "published"
                                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                                            : "bg-yellow-500/10 text-yellow-500 ring-yellow-500/20"
                                            }`}
                                    >
                                        {post.status === "published" ? dict.published : dict.draft}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400 text-xs">
                                    {post.createdAt}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3 font-medium">
                                        {post.status === "draft" ? (
                                            <button
                                                disabled={isProcessing === post.id}
                                                onClick={() => handleStatusChange(post, "published")}
                                                className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                            >
                                                {dict.publish}
                                            </button>
                                        ) : (
                                            <button
                                                disabled={isProcessing === post.id}
                                                onClick={() => handleStatusChange(post, "draft")}
                                                className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                                            >
                                                {dict.unpublish}
                                            </button>
                                        )}
                                        <span className="text-white/10">|</span>
                                        <Link
                                            href={`/admin/edit/${post.id}`}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            {dict.edit}
                                        </Link>
                                        <span className="text-white/10">|</span>
                                        <button
                                            disabled={isProcessing === post.id}
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                        >
                                            {dict.delete}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

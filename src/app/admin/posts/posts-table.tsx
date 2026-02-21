"use client";

import { useState } from "react";
import { deletePost, updatePostStatus } from "../actions";

import { adminStrings } from "../i18n";

type Post = {
    id: string;
    title: string;
    status: "draft" | "published";
    locale: string;
    slug: string;
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
        if (result.error) alert(result.error);
        setIsProcessing(null);
    };

    const handleDelete = async (postId: string) => {
        if (!confirm(dict.confirmDelete)) return;
        setIsProcessing(postId);
        const result = await deletePost(postId);
        if (result.error) alert(result.error);
        setIsProcessing(null);
    };

    if (posts.length === 0) {
        return (
            <div className="p-12 text-center text-sm text-gray-400">
                {dict.emptyState}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-white/5">
                    <tr>
                        <th className="px-6 py-4">{dict.title}</th>
                        <th className="px-6 py-4">{dict.locale}</th>
                        <th className="px-6 py-4">{dict.status}</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">{dict.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {posts.map((post) => (
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
                    ))}
                </tbody>
            </table>
        </div>
    );
}

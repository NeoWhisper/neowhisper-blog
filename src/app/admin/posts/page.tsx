import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { adminStrings, normalizeAdminLang } from "../i18n";
import PostsTable from "./posts-table";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAllowedAdminEmail(user.email)) {
        redirect("/");
    }

    const resolvedParams = await searchParams;
    const lang = normalizeAdminLang(typeof resolvedParams.lang === "string" ? resolvedParams.lang : undefined);
    const t = adminStrings[lang].posts;

    // Fetch all posts order by created_at desc
    const { data: posts, error } = await supabase
        .from("posts_dynamic")
        .select("id, title, status, locale, created_at, slug:translation_groups(slug)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch posts:", error);
    }

    type PostRow = {
        id: string;
        title: string;
        status: "draft" | "published";
        locale: string;
        created_at: string;
        slug: { slug: string } | { slug: string }[] | null;
    };

    const formattedPosts = ((posts as unknown as PostRow[]) || []).map((p) => {
        const slugObj = Array.isArray(p.slug) ? p.slug[0] : p.slug;
        return {
            id: p.id,
            title: p.title,
            status: p.status,
            locale: p.locale,
            slug: slugObj?.slug || "unknown",
            createdAt: new Date(p.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
        };
    });

    return (
        <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="mx-auto max-w-5xl mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 ring-1 ring-purple-500/30">
                        <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white leading-tight">{t.title}</h1>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-1 ml-12">
                    {t.subtitle}
                </p>
            </div>

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <PostsTable posts={formattedPosts} dict={t} />
                </div>
            </div>
        </main>
    );
}

import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { notFound, redirect } from "next/navigation";
import { adminStrings, normalizeAdminLang } from "../../i18n";
import EditForm from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAllowedAdminEmail(user.email)) {
        redirect("/");
    }

    const { id } = await params;
    const resolvedParams = await searchParams;
    const lang = normalizeAdminLang(typeof resolvedParams.lang === "string" ? resolvedParams.lang : undefined);

    const tCommon = adminStrings[lang].page;
    const tEdit = adminStrings[lang].edit;

    const { data: post, error } = await supabase
        .from("posts_dynamic")
        .select("*, slug:translation_groups(slug)")
        .eq("id", id)
        .single();

    if (error || !post) {
        notFound();
    }

    const slugObj = Array.isArray(post.slug) ? post.slug[0] : post.slug;

    const initialData = {
        id: post.id,
        title: post.title,
        slug: slugObj?.slug || "",
        locale: post.locale as "en" | "ja" | "ar",
        category: post.category || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
    };

    return (
        <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
            <EditForm initialData={initialData} tCommon={tCommon} tEdit={tEdit} />
        </main>
    );
}

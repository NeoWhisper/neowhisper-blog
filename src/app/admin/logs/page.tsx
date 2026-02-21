
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { adminStrings, normalizeAdminLang } from "../i18n";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage({
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
    const t = adminStrings[lang].logs;

    // Fetch logs ordered by created_at desc
    const { data: logs, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Failed to fetch logs:", error);
    }

    return (
        <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-gray-950 text-white">
            {/* Page header */}
            <div className="mx-auto max-w-6xl mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 ring-1 ring-red-500/30">
                        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

            <div className="mx-auto max-w-6xl">
                <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 font-semibold text-gray-300 w-24">{t.level}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-300 w-32">{t.module}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-300">{t.message}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-300 w-48">{t.time}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs && logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${log.level === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        log.level === 'warn' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    }`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-purple-400">
                                                {log.module}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-100 font-medium">{log.message}</span>
                                                    {log.stack && (
                                                        <details className="mt-2 group/stack">
                                                            <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300 list-none flex items-center gap-1">
                                                                <svg className="w-3 h-3 group-open/stack:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                                View Stack Trace
                                                            </summary>
                                                            <pre className="mt-2 p-3 bg-black/40 rounded-lg text-[10px] font-mono text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-64 border border-white/5">
                                                                {log.stack}
                                                            </pre>
                                                        </details>
                                                    )}
                                                    {log.context && (
                                                        <div className="mt-1 text-[10px] text-gray-500 font-mono">
                                                            Context: {JSON.stringify(log.context)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                                {new Date(log.created_at).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                            {t.noLogs}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

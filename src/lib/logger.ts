
import { createSupabaseServerClient } from "./supabase-ssr";

export type LogLevel = "error" | "info" | "warn" | "debug";

interface LogEntry {
    level: LogLevel;
    module: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown> | unknown;
    user_email?: string;
    url?: string;
}

/**
 * NeoWhisper Logger
 * Saves logs to Supabase and optionally console
 */
export const logger = {
    async log(entry: LogEntry) {
        // 1. Always log to console in development
        if (process.env.NODE_ENV === "development") {
            const consoleMethod = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : "log";
            console[consoleMethod](`[${entry.module}] ${entry.message}`, entry.context || "");
        }

        // 2. Persist to Supabase
        try {
            const supabase = await createSupabaseServerClient();

            // Attempt to get user if on server
            let user_email = entry.user_email;
            if (!user_email) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    user_email = user?.email;
                } catch { /* Ignore if no user session */ }
            }

            await supabase.from("error_logs").insert({
                level: entry.level,
                module: entry.module,
                message: entry.message,
                stack: entry.stack,
                context: entry.context,
                user_email: user_email,
                url: entry.url,
            });
        } catch (err) {
            // Fail silently to avoid crashing the app due to logging failure
            console.error("FATAL: Logging to Supabase failed.", err);
        }
    },

    async error(module: string, message: string, error?: unknown, context?: Record<string, unknown>) {
        return this.log({
            level: "error",
            module,
            message,
            stack: error instanceof Error ? error.stack : undefined,
            context: context || (error instanceof Error ? { name: error.name, originalMessage: error.message } : error),
        });
    },

    async warn(module: string, message: string, context?: Record<string, unknown>) {
        return this.log({
            level: "warn",
            module,
            message,
            context,
        });
    },

    async info(module: string, message: string, context?: Record<string, unknown>) {
        return this.log({
            level: "info",
            module,
            message,
            context,
        });
    }
};




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
 * Saves logs to Supabase and optionally console.
 * Includes security sanitization to prevent leaking sensitive data.
 */

const SENSITIVE_KEYS = ["password", "token", "secret", "key", "cookie", "auth", "email"];

function sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== "object") return obj;

    // Handle arrays
    if (Array.isArray(obj)) return obj.map((item: unknown) => sanitize(item));

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = "********";
        } else if (typeof value === "object") {
            sanitized[key] = sanitize(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

export const logger = {
    async log(entry: LogEntry) {
        // Sanitize context before logging
        const sanitizedContext = sanitize(entry.context);

        // 1. Always log to console in development
        if (process.env.NODE_ENV === "development") {
            const consoleMethod = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : "log";
            console[consoleMethod](`[${entry.module}] ${entry.message}`, sanitizedContext || "");
        }

        // 2. Persist to Supabase
        try {
            // Only attempt server-side logging if we are actually in a request context
            // In static generation, we might want to skip or use a different client
            const { createSupabaseServerClient } = await import("./supabase-ssr");

            // This might still throw if called during static generation, but we catch it
            const supabase = await createSupabaseServerClient().catch(() => null);

            if (!supabase) {
                if (process.env.NODE_ENV === "development") {
                    console.warn("[Logger] Supabase server client unavailable, skipping remote log.");
                }
                return;
            }

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
                context: sanitizedContext,
                user_email: user_email,
                url: entry.url,
            });
        } catch (err) {
            // Fail silently to avoid crashing the app due to logging failure
            if (process.env.NODE_ENV === "development") {
                console.error("FATAL: Logging to Supabase failed.", err);
            }
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

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-ssr";
import { getSafeNextPath } from "@/lib/auth-utils";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("error") === "auth_failed"
      ? "Authentication failed. Please try again."
      : null;
  });
  const [nextPath] = useState(() => {
    if (typeof window === "undefined") return "/admin";
    const params = new URLSearchParams(window.location.search);
    return getSafeNextPath(params.get("next"));
  });

  async function handleGoogleLogin() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Login failed.");
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Login
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Sign in with Google to access the admin workspace.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {isLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Something went wrong
      </p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Unexpected error
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        We hit an unexpected issue while loading this page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        Try again
      </button>
    </main>
  );
}

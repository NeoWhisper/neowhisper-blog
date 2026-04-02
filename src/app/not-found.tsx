import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Page not found
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        The page you requested does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        Back to Home
      </Link>
    </main>
  );
}

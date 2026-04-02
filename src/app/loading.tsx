export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
        <span className="h-3 w-3 animate-pulse rounded-full bg-current" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </main>
  );
}

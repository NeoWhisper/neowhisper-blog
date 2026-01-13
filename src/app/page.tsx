
import { getPosts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';

export default async function Home() {
  const posts = getPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 sm:text-6xl mb-4">
            NeoWhisper
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Full-stack development with trilingual support (日本語・English・العربية).
          </p>
        </header>

        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">💻</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Software Development</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Custom apps, web systems, and business tools</p>
          </div>
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Game Development</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mobile games and indie projects</p>
          </div>
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Translation Services</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">JP・EN・AR technical translation</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Articles</h2>
          {posts.length > 0 ? (
            <div className="grid gap-8">
              {posts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No posts found yet.
                <br />
                <span className="text-sm opacity-75">Create your first post in <code>src/content/posts/</code></span>
              </p>
            </div>
          )}
        </section>
      </div >
    </div >
  );
}

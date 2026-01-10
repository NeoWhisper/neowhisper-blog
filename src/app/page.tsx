import Link from 'next/link';
import { getPosts } from '@/lib/posts';

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
                <article
                  key={post.slug}
                  className="relative overflow-hidden p-8 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] transition-all duration-300 group"
                >
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-colors duration-500" />
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-4 gap-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                      <time className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full whitespace-nowrap">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                      >
                        Read Article
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
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

import { getKeywordsByPriority, getLowCompetitionKeywords, getTotalMonthlySearches, getKeywordsByCategory } from '@/lib/keyword-research';
import { notFound } from "next/navigation";

export default function ContentPlanningPage() {
    // Only accessible in development mode
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

    const allKeywords = getKeywordsByPriority();
    const lowCompKeywords = getLowCompetitionKeywords();
    const totalSearches = getTotalMonthlySearches();

    const categoryStats = {
        'web-dev': getKeywordsByCategory('web-dev').length,
        'ai': getKeywordsByCategory('ai').length,
        'game-dev': getKeywordsByCategory('game-dev').length,
        'i18n': getKeywordsByCategory('i18n').length,
        'performance': getKeywordsByCategory('performance').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
                        Content Planning Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Strategic keyword research for NeoWhisper blog growth
                    </p>
                </header>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Monthly Searches</div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {totalSearches.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Topics</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {allKeywords.length}
                        </div>
                    </div>
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Low Competition</div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {lowCompKeywords.length}
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Topics by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(categoryStats).map(([category, count]) => (
                            <div key={category} className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category.replace('-', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Keyword List */}
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Content Roadmap</h2>
                    <div className="space-y-4">
                        {allKeywords.map((keyword) => (
                            <div
                                key={keyword.primaryKeyword}
                                className="bg-white/60 dark:bg-white/10 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm">
                                                {keyword.priority}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {keyword.topic}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {keyword.contentAngle}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                                {keyword.primaryKeyword}
                                            </span>
                                            {keyword.relatedKeywords.slice(0, 2).map((related) => (
                                                <span
                                                    key={related}
                                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                                                >
                                                    {related}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {keyword.monthlySearches.toLocaleString()}/mo
                                        </div>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${keyword.difficulty === 'low'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : keyword.difficulty === 'medium'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                }`}
                                        >
                                            {keyword.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="capitalize">📂 {keyword.category.replace('-', ' ')}</span>
                                    <span>👥 {keyword.targetAudience}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-3">💡 Content Strategy Tips</h3>
                    <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                        <li>• Start with <strong>low competition</strong> keywords for quick wins</li>
                        <li>• Write <strong>2,000-3,000 words</strong> per article for better SEO</li>
                        <li>• Include <strong>code examples</strong> and live demos in tutorials</li>
                        <li>• Leverage your <strong>trilingual expertise</strong> in i18n content</li>
                        <li>• Update posts regularly to maintain rankings</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

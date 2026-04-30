import type { Post } from '@/types';
import { normalizeLang } from '@/lib/i18n';
import {
  getHybridPosts,
  getHybridPost,
  getHybridLanguageVariants,
  getHybridRelatedPosts,
  getHybridSitemapBlogEntries,
  type HybridPost,
} from '@/lib/posts-hybrid';

// Mock dependencies
jest.mock('@/lib/posts', () => ({
  getPosts: jest.fn(),
  getPostBySlug: jest.fn(),
  getPostLanguage: jest.fn((slug: string) => {
    if (slug.endsWith('-ja')) return 'ja';
    if (slug.endsWith('-ar')) return 'ar';
    return 'en';
  }),
  getBaseSlug: jest.fn((slug: string) => {
    return slug.replace(/-(ja|ar)$/, '');
  }),
  getLanguageVariants: jest.fn(),
}));

jest.mock('@/lib/posts-dynamic', () => ({
  getDynamicPostsByLocale: jest.fn(),
  getDynamicPostBySlugLocale: jest.fn(),
  getDynamicLocalesBySlug: jest.fn(),
  getAllDynamicSitemapEntries: jest.fn(),
}));

jest.mock('@/lib/slug', () => ({
  isLocalizedSlug: jest.fn((slug: string) => /-(ja|ar)$/.test(slug)),
}));

import {
  getPosts,
  getPostBySlug,
  getLanguageVariants,
} from '@/lib/posts';
import {
  getDynamicPostsByLocale,
  getDynamicPostBySlugLocale,
  getDynamicLocalesBySlug,
  getAllDynamicSitemapEntries,
} from '@/lib/posts-dynamic';

describe('posts-hybrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeLang integration', () => {
    test('should normalize locale correctly', () => {
      expect(normalizeLang('ja')).toBe('ja');
      expect(normalizeLang('ar')).toBe('ar');
      expect(normalizeLang('en')).toBe('en');
      expect(normalizeLang('invalid')).toBe('en');
    });
  });

  describe('getHybridPosts', () => {
    test('should return combined static and dynamic posts', async () => {
      const mockStaticPosts: Post[] = [
        {
          slug: 'test-post',
          title: 'Test Post',
          content: 'Content',
          excerpt: 'Excerpt',
          date: '2026-01-01',
          category: 'tech-tips',
        },
        {
          slug: 'another-post-ja',
          title: 'Japanese Post',
          content: 'Content',
          excerpt: 'Excerpt',
          date: '2026-01-02',
          category: 'tech-tips',
        },
      ];

      const mockDynamicPosts: HybridPost[] = [
        {
          slug: 'dynamic-post',
          title: 'Dynamic Post',
          content: 'Content',
          excerpt: 'Excerpt',
          date: '2026-01-03',
          locale: 'en',
          source: 'dynamic',
          publishedAt: '2026-01-03',
          updatedAt: '2026-01-03',
        },
      ];

      (getPosts as jest.Mock).mockReturnValue(mockStaticPosts);
      (getDynamicPostsByLocale as jest.Mock).mockResolvedValue(mockDynamicPosts);

      const result = await getHybridPosts('en');

      // Should have static post for English + dynamic post
      expect(result).toHaveLength(2);
      expect(result.some((p) => p.source === 'static')).toBe(true);
      expect(result.some((p) => p.source === 'dynamic')).toBe(true);
    });

    test('should filter by locale correctly', async () => {
      const mockStaticPosts: Post[] = [
        { slug: 'en-post', title: 'EN', content: '', excerpt: '', date: '2026-01-01' },
        { slug: 'ja-post-ja', title: 'JA', content: '', excerpt: '', date: '2026-01-01' },
        { slug: 'ar-post-ar', title: 'AR', content: '', excerpt: '', date: '2026-01-01' },
      ];

      (getPosts as jest.Mock).mockReturnValue(mockStaticPosts);
      (getDynamicPostsByLocale as jest.Mock).mockResolvedValue([]);

      const jaPosts = await getHybridPosts('ja');
      expect(jaPosts).toHaveLength(1);
      expect(jaPosts[0].locale).toBe('ja');
    });

    test('should dedupe posts preferring dynamic over static', async () => {
      const mockStaticPosts: Post[] = [
        { slug: 'same-post', title: 'Static', content: '', excerpt: '', date: '2026-01-01' },
      ];

      const mockDynamicPosts: HybridPost[] = [
        {
          slug: 'same-post',
          title: 'Dynamic',
          content: '',
          excerpt: '',
          date: '2026-01-02',
          locale: 'en',
          source: 'dynamic',
          publishedAt: '2026-01-02',
          updatedAt: '2026-01-02',
        },
      ];

      (getPosts as jest.Mock).mockReturnValue(mockStaticPosts);
      (getDynamicPostsByLocale as jest.Mock).mockResolvedValue(mockDynamicPosts);

      const result = await getHybridPosts('en');

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('dynamic');
      expect(result[0].title).toBe('Dynamic');
    });

    test('should sort posts by publishedAt descending', async () => {
      const mockStaticPosts: Post[] = [
        { slug: 'old-post', title: 'Old', content: '', excerpt: '', date: '2026-01-01' },
        { slug: 'new-post', title: 'New', content: '', excerpt: '', date: '2026-01-03' },
      ];

      (getPosts as jest.Mock).mockReturnValue(mockStaticPosts);
      (getDynamicPostsByLocale as jest.Mock).mockResolvedValue([]);

      const result = await getHybridPosts('en');

      expect(result[0].title).toBe('New');
      expect(result[1].title).toBe('Old');
    });
  });

  describe('getHybridPost', () => {
    test('should return dynamic post if available', async () => {
      const mockDynamicPost: HybridPost = {
        slug: 'test',
        title: 'Dynamic Test',
        content: '',
        excerpt: '',
        date: '2026-01-01',
        locale: 'en',
        source: 'dynamic',
        publishedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      (getDynamicPostBySlugLocale as jest.Mock).mockResolvedValue(mockDynamicPost);

      const result = await getHybridPost('test', 'en');

      expect(result).not.toBeNull();
      expect(result?.source).toBe('dynamic');
    });

    test('should fall back to static post if no dynamic match', async () => {
      const mockStaticPost: Post = {
        slug: 'test-post',
        title: 'Static Test',
        content: '',
        excerpt: '',
        date: '2026-01-01',
      };

      (getDynamicPostBySlugLocale as jest.Mock).mockResolvedValue(null);
      (getPostBySlug as jest.Mock).mockReturnValue(mockStaticPost);

      const result = await getHybridPost('test', 'en');

      expect(result).not.toBeNull();
      expect(result?.source).toBe('static');
    });

    test('should return null if no post found', async () => {
      (getDynamicPostBySlugLocale as jest.Mock).mockResolvedValue(null);
      (getPostBySlug as jest.Mock).mockReturnValue(null);

      const result = await getHybridPost('nonexistent', 'en');

      expect(result).toBeNull();
    });

    test('should try slug candidates for localized posts', async () => {
      const mockPost: Post = {
        slug: 'test-post-ja',
        title: 'Japanese Post',
        content: '',
        excerpt: '',
        date: '2026-01-01',
      };

      (getDynamicPostBySlugLocale as jest.Mock).mockResolvedValue(null);
      (getPostBySlug as jest.Mock).mockImplementation((slug: string) => {
        if (slug === 'test-post-ja') return mockPost;
        return null;
      });

      const result = await getHybridPost('test-post', 'ja');

      expect(result).not.toBeNull();
      expect(result?.locale).toBe('ja');
    });
  });

  describe('getHybridLanguageVariants', () => {
    test('should return dynamic locales if available', async () => {
      (getDynamicLocalesBySlug as jest.Mock).mockResolvedValue(['en', 'ja', 'ar']);

      const result = await getHybridLanguageVariants('test-post', 'en');

      expect(result).toHaveLength(3);
      expect(result.map((v) => v.lang)).toContain('en');
      expect(result.map((v) => v.lang)).toContain('ja');
      expect(result.map((v) => v.lang)).toContain('ar');
    });

    test('should fall back to static variants', async () => {
      (getDynamicLocalesBySlug as jest.Mock).mockResolvedValue([]);
      (getLanguageVariants as jest.Mock).mockReturnValue([
        { slug: 'test-post', lang: 'en' },
        { slug: 'test-post-ja', lang: 'ja' },
      ]);

      const result = await getHybridLanguageVariants('test-post', 'en');

      expect(result).toHaveLength(2);
      expect(result.map((v) => v.lang)).toContain('en');
      expect(result.map((v) => v.lang)).toContain('ja');
    });

    test('should return current locale as fallback', async () => {
      (getDynamicLocalesBySlug as jest.Mock).mockResolvedValue([]);
      (getLanguageVariants as jest.Mock).mockReturnValue([]);

      const result = await getHybridLanguageVariants('nonexistent', 'ar');

      expect(result).toHaveLength(1);
      expect(result[0].lang).toBe('ar');
      expect(result[0].slug).toBe('nonexistent');
    });
  });

  describe('getHybridRelatedPosts', () => {
    test('should return empty array if post has no category', async () => {
      const post: HybridPost = {
        slug: 'test',
        title: 'Test',
        content: '',
        excerpt: '',
        date: '2026-01-01',
        locale: 'en',
        source: 'static',
        publishedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const result = await getHybridRelatedPosts(post);
      expect(result).toEqual([]);
    });

    test('should exclude the current post from results', async () => {
      const currentPost: HybridPost = {
        slug: 'current-post',
        title: 'Current',
        content: '',
        excerpt: '',
        date: '2026-01-01',
        locale: 'en',
        source: 'static',
        category: 'tech-tips',
        publishedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const mockPosts: HybridPost[] = [
        currentPost,
        {
          slug: 'related-post',
          title: 'Related',
          content: '',
          excerpt: '',
          date: '2026-01-02',
          locale: 'en',
          source: 'static',
          category: 'tech-tips',
          publishedAt: '2026-01-02',
          updatedAt: '2026-01-02',
        },
      ];

      (getDynamicPostsByLocale as jest.Mock).mockResolvedValue([]);
      (getPosts as jest.Mock).mockReturnValue(
        mockPosts.map((p) => ({ ...p, date: p.date }))
      );

      const result = await getHybridRelatedPosts(currentPost);

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('related-post');
    });

    test('should respect the limit parameter', async () => {
      const currentPost: HybridPost = {
        slug: 'current',
        title: 'Current',
        content: '',
        excerpt: '',
        date: '2026-01-01',
        locale: 'en',
        source: 'static',
        category: 'tech-tips',
        publishedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const mockPosts: HybridPost[] = [
        currentPost,
        { slug: 'p1', title: 'P1', content: '', excerpt: '', date: '2026-01-02', locale: 'en', source: 'static', category: 'tech-tips', publishedAt: '2026-01-02', updatedAt: '2026-01-02' },
        { slug: 'p2', title: 'P2', content: '', excerpt: '', date: '2026-01-03', locale: 'en', source: 'static', category: 'tech-tips', publishedAt: '2026-01-03', updatedAt: '2026-01-03' },
        { slug: 'p3', title: 'P3', content: '', excerpt: '', date: '2026-01-04', locale: 'en', source: 'static', category: 'tech-tips', publishedAt: '2026-01-04', updatedAt: '2026-01-04' },
        { slug: 'p4', title: 'P4', content: '', excerpt: '', date: '2026-01-05', locale: 'en', source: 'static', category: 'tech-tips', publishedAt: '2026-01-05', updatedAt: '2026-01-05' },
      ];

      (getDynamicPostsByLocale as jest.Mock).mockResolvedValue([]);
      (getPosts as jest.Mock).mockReturnValue(
        mockPosts.slice(1).map((p) => ({ ...p, date: p.date }))
      );

      const result = await getHybridRelatedPosts(currentPost, 2);

      expect(result).toHaveLength(2);
    });
  });

  describe('getHybridSitemapBlogEntries', () => {
    test('should combine static and dynamic entries', async () => {
      const mockStaticPosts: Post[] = [
        { slug: 'static-1', title: 'S1', content: '', excerpt: '', date: '2026-01-01' },
        { slug: 'static-2', title: 'S2', content: '', excerpt: '', date: '2026-01-02' },
      ];

      const mockDynamicEntries = [
        { slug: 'dynamic-1', locale: 'en' as const, lastModified: '2026-01-03' },
        { slug: 'dynamic-2', locale: 'ja' as const, lastModified: '2026-01-04' },
      ];

      (getPosts as jest.Mock).mockReturnValue(mockStaticPosts);
      (getAllDynamicSitemapEntries as jest.Mock).mockResolvedValue(mockDynamicEntries);

      const result = await getHybridSitemapBlogEntries();

      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    test('should dedupe entries by locale:slug', async () => {
      const mockStaticPosts: Post[] = [
        { slug: 'duplicate', title: 'Static', content: '', excerpt: '', date: '2026-01-01' },
      ];

      const mockDynamicEntries = [
        { slug: 'duplicate', locale: 'en' as const, lastModified: '2026-01-02' },
      ];

      (getPosts as jest.Mock).mockReturnValue(mockStaticPosts);
      (getAllDynamicSitemapEntries as jest.Mock).mockResolvedValue(mockDynamicEntries);

      const result = await getHybridSitemapBlogEntries();

      // Should only have one entry for 'en:duplicate'
      const enDuplicates = result.filter((e) => e.locale === 'en' && e.slug === 'duplicate');
      expect(enDuplicates).toHaveLength(1);
    });
  });
});

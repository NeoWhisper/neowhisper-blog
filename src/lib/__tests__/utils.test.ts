import { normalizeLang, withLang } from '../i18n';
import { getBaseSlug, getPostLanguage } from '../posts';
import { isLocalizedSlug } from '../slug';
import { formatDate } from '../utils';

describe('i18n utilities', () => {
    test('normalizeLang should return correct language or default to en', () => {
        expect(normalizeLang('ja')).toBe('ja');
        expect(normalizeLang('ar')).toBe('ar');
        expect(normalizeLang('en')).toBe('en');
        expect(normalizeLang('unknown')).toBe('en');
        expect(normalizeLang('')).toBe('en');
        expect(normalizeLang(null)).toBe('en');
        expect(normalizeLang(undefined)).toBe('en');
    });

    test('withLang should append lang query parameter correctly', () => {
        expect(withLang('/blog', 'ja')).toBe('/blog?lang=ja');
        expect(withLang('/blog?q=test', 'ar')).toBe('/blog?q=test&lang=ar');
        expect(withLang('/blog#hash', 'ja')).toBe('/blog?lang=ja#hash');
        expect(withLang('/blog?q=test#hash', 'ar')).toBe('/blog?q=test&lang=ar#hash');
    });
});

describe('slug utilities', () => {
    test('isLocalizedSlug should detect localized suffixes', () => {
        expect(isLocalizedSlug('post-ja')).toBe(true);
        expect(isLocalizedSlug('post-ar')).toBe(true);
        expect(isLocalizedSlug('post-en')).toBe(false);
        expect(isLocalizedSlug('post')).toBe(false);
        expect(isLocalizedSlug('')).toBe(false);
    });

    test('getBaseSlug should remove language suffix', () => {
        expect(getBaseSlug('my-post-ja')).toBe('my-post');
        expect(getBaseSlug('my-post-ar')).toBe('my-post');
        expect(getBaseSlug('my-post')).toBe('my-post');
        expect(getBaseSlug('')).toBe('');
    });

    test('getPostLanguage should detect language from slug', () => {
        expect(getPostLanguage('my-post-ja')).toBe('ja');
        expect(getPostLanguage('my-post-ar')).toBe('ar');
        expect(getPostLanguage('my-post')).toBe('en');
    });
});

describe('date utilities', () => {
    test('formatDate should format date correctly', () => {
        const date = new Date('2026-02-24T00:00:00Z');
        expect(formatDate(date)).toBe('February 24, 2026');
        expect(formatDate('2026-02-24T00:00:00Z')).toBe('February 24, 2026');
    });
});

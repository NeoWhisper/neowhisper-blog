# NeoWhisper Blog - Testing Strategy

## Overview

This document defines the testing requirements to catch regressions when updating dependencies, adding features, or refactoring code.

## Testing Pyramid

```
    /\（ E2E Tests (Playwright)    ） - User flows, critical paths
   /  \______________________________/
  /   Integration Tests            \ - Component interactions
 /__________________________________\
/    Unit Tests (Jest)               \ - Business logic, utilities
```

---

## 1. Unit Tests (Jest) - `src/lib/**/*.test.ts`

### Core Utilities (MUST HAVE)

| File | Functions to Test | Priority |
|------|-------------------|----------|
| `i18n.ts` | `normalizeLang()`, `withLang()`, `localeByLang` | HIGH |
| `posts.ts` | `getPostBySlug()`, `getPrevNextPosts()`, `sortPosts()` | HIGH |
| `slug.ts` | `isLocalizedSlug()`, `getBaseSlug()`, `getPostLanguage()` | HIGH |
| `utils.ts` | `formatDate()`, `cn()` | MEDIUM |
| `categories.ts` | `buildCategorySlug()`, category mappings | MEDIUM |
| `brief-quality.ts` | `isLowValueBrief()`, word count logic | HIGH |

### Data Transformation (MUST HAVE)

| File | Functions to Test | Priority |
|------|-------------------|----------|
| `posts-hybrid.ts` | `getHybridPosts()`, sorting/filtering | HIGH |
| `posts-dynamic.ts` | Dynamic post resolution | MEDIUM |
| `markdown.ts` | MDX processing, frontmatter extraction | MEDIUM |

### Security/Auth (MUST HAVE)

| File | Functions to Test | Priority |
|------|-------------------|----------|
| `admin-auth.ts` | Auth validation, token checking | HIGH |
| `auth-utils.ts` | Helper functions | MEDIUM |
| `supabase-ssr.ts` | Server-side auth | HIGH |

### SEO/Metadata (SHOULD HAVE)

| File | Functions to Test | Priority |
|------|-------------------|----------|
| `site-config.ts` | Config validation | MEDIUM |
| `gtag.ts` | Analytics event tracking | LOW |

### Content Generation Scripts (MUST HAVE)

| File | Test Type | Priority |
|------|-----------|----------|
| `scripts/lib/validation.ts` | Unit tests | HIGH |
| `scripts/lib/errors.ts` | Unit tests | HIGH |

---

## 2. E2E Tests (Playwright) - `tests/*.spec.ts`

### Critical User Flows (MUST HAVE)

| Test | Coverage | Priority |
|------|----------|----------|
| `homepage.spec.ts` | Hero, navigation, featured content | HIGH |
| `blog-listing.spec.ts` | Post grid, pagination, filtering | HIGH |
| `blog-post.spec.ts` | MDX rendering, images, code blocks | HIGH |
| `category.spec.ts` | Category filtering, URL encoding | HIGH |
| `navigation.spec.ts` | Header, footer, mobile menu | HIGH |
| `search.spec.ts` | Search modal, results, keyboard nav | HIGH |

### UI Enhancements (MUST HAVE)

| Test | Coverage | Priority |
|------|----------|----------|
| `ui-enhancements.spec.ts` | All 10 features (existing) | HIGH |

### SEO & Performance (SHOULD HAVE)

| Test | Coverage | Priority |
|------|----------|----------|
| `seo.spec.ts` | Meta tags, Open Graph, structured data | HIGH |
| `performance.spec.ts` | Core Web Vitals thresholds | MEDIUM |
| `rss.spec.ts` | RSS feed validity | MEDIUM |

### Security (MUST HAVE)

| Test | Coverage | Priority |
|------|----------|----------|
| `security-headers.spec.ts` | CSP, X-Frame-Options, etc. (existing) | HIGH |
| `cors.spec.ts` | Origin restrictions (existing) | HIGH |
| `csp.spec.ts` | Content Security Policy validation | HIGH |

### Internationalization (SHOULD HAVE)

| Test | Coverage | Priority |
|------|----------|----------|
| `i18n.spec.ts` | Language switching, RTL (Arabic) | MEDIUM |
| `multilingual-content.spec.ts` | JA/AR content rendering | MEDIUM |

### Forms & Interactions (MUST HAVE)

| Test | Coverage | Priority |
|------|----------|----------|
| `contact-form.spec.ts` | Validation, submission states | HIGH |
| `subscription.spec.ts` | Email signup flow | HIGH |
| `dark-mode.spec.ts` | Theme toggle, persistence | MEDIUM |

---

## 3. Integration Tests (Optional/Component)

### Component-Level (Storybook + Testing Library)

| Component | Test Type | Priority |
|-----------|-----------|----------|
| `BlogPostTemplate` | Render with different MDX content | MEDIUM |
| `Search` | Fuse.js integration, filtering | MEDIUM |
| `ThemeProvider` | Context, localStorage sync | MEDIUM |
| `Breadcrumbs` | Path generation, active states | LOW |

---

## 4. Test Configuration

### Current Setup

```bash
# Unit tests (Jest)
npm test                 # src/lib/**/*.test.ts

# E2E tests (Playwright)
npm run test:e2e         # tests/*.spec.ts

# Content script tests
npm run content:test-flags
npm run content:test-safety
npm run content:test-site-url
```

### Proposed New Scripts (Add to package.json)

```json
{
  "scripts": {
    "test:unit": "jest",
    "test:unit:watch": "jest --watch",
    "test:unit:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run lint && npm run test:unit && npm run build && npm run test:e2e",
    "test:ci": "npm run lint && npm run test:unit -- --ci && npm run build && npm run test:e2e"
  }
}
```

---

## 5. CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Type check
        run: npx tsc --noEmit
        
      - name: Unit tests
        run: npm run test:unit -- --coverage
        
      - name: Build
        run: npm run build
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

## 6. Pre-Commit Hooks (Husky)

### Current Setup

Already configured via `prepare` script in package.json.

### Recommended Additions

```bash
# .husky/pre-commit
npm run lint
npm run test:unit -- --testPathPattern="src/lib/__tests__" --passWithNoTests
```

---

## 7. Test Coverage Requirements

### Minimum Coverage Thresholds

| Category | Lines | Functions | Branches |
|----------|-------|-----------|----------|
| **Critical** (i18n, posts, auth) | 90% | 90% | 85% |
| **Utils** (slug, date, etc.) | 80% | 80% | 75% |
| **UI Components** | 70% | 70% | 60% |
| **Scripts** | 80% | 80% | 75% |

---

## 8. Regression Prevention Checklist

When updating `package.json` version or dependencies:

### Before Update
- [ ] Run `npm run test:all` to establish baseline
- [ ] Check for breaking changes in CHANGELOG

### After Update
- [ ] Run `npm run test:all` again
- [ ] Verify build passes
- [ ] Run E2E tests locally if major version bump
- [ ] Check for deprecation warnings
- [ ] Verify no console errors in browser

### Critical Dependencies to Watch

| Package | Test Focus |
|-----------|-----------|
| `next` | Build, routing, image optimization |
| `react` | Hydration, component rendering |
| `@mdx-js/*` | MDX processing, syntax highlighting |
| `tailwindcss` | Styling, dark mode, responsive |
| `fuse.js` | Search functionality |
| `zod` | Validation schemas |

---

## 9. Missing Tests to Implement

### High Priority (Add Next)

1. **Unit Tests:**
   - `src/lib/posts.test.ts` - Post sorting, prev/next logic
   - `src/lib/brief-quality.test.ts` - Word count, noindex logic
   - `src/lib/i18n.test.ts` - Language normalization (exists)
   - `src/lib/categories.test.ts` - Category slug building

2. **E2E Tests:**
   - `tests/blog-post.spec.ts` - Full post rendering
   - `tests/contact-form.spec.ts` - Form validation
   - `tests/seo.spec.ts` - Meta tags, Open Graph

### Medium Priority (Add Later)

3. **Unit Tests:**
   - `src/lib/posts-hybrid.test.ts` - Hybrid post resolution
   - `src/lib/markdown.test.ts` - MDX transformation

4. **E2E Tests:**
   - `tests/i18n.spec.ts` - Language switching
   - `tests/performance.spec.ts` - Core Web Vitals
   - `tests/accessibility.spec.ts` - A11y violations

### Low Priority (Nice to Have)

5. **E2E Tests:**
   - `tests/subscription.spec.ts` - Email signup
   - `tests/sitemap.spec.ts` - XML validity

---

## 10. Best Practices

### Writing Tests

1. **Unit Tests:**
   - Test one function per test
   - Use descriptive test names
   - Mock external dependencies
   - Test edge cases (null, undefined, empty strings)

2. **E2E Tests:**
   - Test user flows, not implementation
   - Use data attributes for selectors when possible
   - Avoid hardcoded timeouts
   - Test critical paths first

### Maintenance

- Update tests when changing requirements
- Remove tests for removed features
- Keep tests fast (< 100ms for unit, < 5s for E2E)
- Document complex test setups

---

## Quick Commands Reference

```bash
# Full test suite
npm run test:all

# Quick feedback (unit tests only)
npm run test:unit:watch

# Debug failing E2E test
npx playwright test tests/failing.spec.ts --debug

# Generate E2E test code
npx playwright codegen http://localhost:3000

# Check coverage
npm run test:unit:coverage
```

---

## Summary

**Current State:**
- ✅ Basic unit tests for utilities
- ✅ E2E tests for UI enhancements
- ✅ Security header tests
- ✅ Hydration tests
- ✅ Category page tests

**Gaps to Fill:**
- ❌ Post/brief-quality business logic unit tests
- ❌ Blog post rendering E2E tests
- ❌ SEO metadata E2E tests
- ❌ Form submission E2E tests
- ❌ i18n/RTL E2E tests
- ❌ Performance budgets

**Recommended Priority:**
1. Add posts/brief-quality unit tests
2. Add blog-post.spec.ts E2E
3. Add SEO validation E2E
4. Add contact-form E2E
5. Set up CI workflow

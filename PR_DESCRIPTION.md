## Description

This PR includes comprehensive Jest tests for all admin server actions and fixes a silent failure bug in the `updatePostDetail` function.

### Changes:
1. **Added comprehensive test suite** for admin actions (`src/lib/__tests__/admin-actions.test.ts`)
2. **Fixed silent failure bug** in `updatePostDetail` - now properly checks for translation_groups update errors

### What's Tested:

#### Admin Actions Covered:
- ✅ `createPost` - Create draft posts with validation, admin auth, error handling
- ✅ `updatePostStatus` - Update post status (draft/published) with admin auth
- ✅ `deletePost` - Delete posts with admin auth and error handling
- ✅ `updatePostDetail` - Update post details with slug/translation group sync

#### Test Coverage:
- Authentication checks (admin email validation)
- Input validation (slug normalization, required fields)
- Database error handling (translation groups, posts_dynamic)
- Success paths with revalidation checks
- Edge cases (missing fields, invalid slugs, not found errors)

### Bug Fix Details:

**Before:** The `updatePostDetail` function would fail silently when updating the `translation_groups` table, proceeding to update `posts_dynamic` and reporting success even though the translation group slug wasn't updated.

**After:** The function now properly checks for errors on the `translation_groups` update and returns an error response if it fails, preventing the `posts_dynamic` update from proceeding.

---

## Type of Change

- [x] 🐛 Bug fix (non-breaking change that fixes an issue)
- [x] ✨ New feature (non-breaking change that adds functionality - test coverage)

---

## Checklist

- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my own code
- [x] I have tested my changes locally (Jest: 138/138 tests passing)
- [x] My changes generate no new warnings (ESLint and TypeScript clean)
- [x] I have updated the documentation accordingly (commit message documents changes)

---

## Screenshots (if applicable)

<!-- N/A - Backend changes, no UI screenshots needed -->

---

## Related Issues

<!-- 
Closes t_c627 - Write tests for admin server actions
Closes t_e2b7 - Fix silent failure in updatePostDetail translation group update
-->

Fixes t_c627
Fixes t_e2b7

## Summary

Implement dramatic cinematic visual effects and animations across the entire website, inspired by premium cinematic design aesthetics. This pull request properly targets the `dev` branch for feature integration.

## Changes

### Global Effects (`src/app/globals.css`)
- Film grain overlay with reduced opacity for better readability.
- Cinematic vignette with expanded transparent area.
- Volumetric light rays with slower rotation.
- Parallax float animation and staggered fade-up animations.
- Ambient glow blobs for background depth.

### Layout & Templates
- Applied global cinematic effects to the body in `src/app/layout.tsx`.
- Enhanced `BlogPostTemplate.tsx` with volumetric light and Ken Burns effect on hero images.
- Fixed light/dark mode contrast issues and removed problematic hover classes.

### Component Refactors
- Centralized UI translation strings into `src/lib/dictionaries.ts`.
- Removed dead code such as `SubscriptionCopy` in `EmailSubscriptionForm.tsx` and unused TS comments in `Breadcrumbs.tsx`.
- Replaced hardcoded text in `SiteFooter.tsx` with dynamic `getDictionary` calls.

### Tests
- Fixed Playwright assertion syntax in `tests/features.spec.ts` by moving custom error messages to the correct `expect` arguments.
- Replaced hardcoded blog post URLs with dynamic article selection to improve test resilience against local database or content changes.

---

## 概要 (Japanese Version)

プレミアムで映画のようなデザインからインスピレーションを得て、ウェブサイト全体にドラマチックなシネマティック視覚効果とアニメーションを実装します。このプルリクエストは、機能統合のために適切に `dev` ブランチをターゲットにしています。

## 変更内容

### グローバルエフェクト (`src/app/globals.css`)
- 視認性を向上させるために不透明度を下げたフィルムグレイン（粒子）オーバーレイ。
- 透明領域を拡大したシネマティック・ビネット。
- 回転を遅くしたボリュメトリックライト（光の筋）効果。
- パララックス（視差）フロートアニメーションと、時間差でフェードアップするアニメーション。
- 背景に奥行きを与えるアンビエント・グロー・ブロブ（発光する球体）。

### レイアウトとテンプレート
- `src/app/layout.tsx` の body にグローバルなシネマティック効果を適用しました。
- `BlogPostTemplate.tsx` のヒーロー画像にボリュメトリックライトとケン・バーンズ効果を追加し、強化しました。
- ライトモード/ダークモードのコントラスト問題を修正し、問題のあるホバークラスを削除しました。

### コンポーネントのリファクタリング
- UIの翻訳文字列を `src/lib/dictionaries.ts` に一元化しました。
- `EmailSubscriptionForm.tsx` の `SubscriptionCopy` などのデッドコードや、`Breadcrumbs.tsx` の未使用のTSコメントを削除しました。
- `SiteFooter.tsx` のハードコードされたテキストを動的な `getDictionary` 呼び出しに置き換えました。

### テスト
- `tests/features.spec.ts` 内の Playwright アサーション構文を修正し、カスタムエラーメッセージを `expect` の正しい引数に移動しました。
- ハードコードされたブログ記事のURLを動的な記事選択に置き換え、ローカルデータベースやコンテンツの変更に対するテストの耐障害性を向上させました。

---

## الملخص (Arabic Version)

تطبيق تأثيرات بصرية سينمائية درامية ورسوم متحركة عبر الموقع بأكمله، مستوحاة من جماليات التصميم السينمائي المتميز. يستهدف طلب السحب هذا فرع `dev` لدمج الميزات بشكل صحيح.

## التغييرات

### التأثيرات العامة (`src/app/globals.css`)
- إضافة طبقة تأثير حبيبات الفيلم بشفافية منخفضة لتحسين قابلية القراءة.
- تأثير التظليل السينمائي (vignette) مع منطقة شفافة موسعة.
- أشعة ضوء حجمية (volumetric light) مع دوران أبطأ.
- رسوم متحركة للطفو المنظوري (parallax) وظهور تدريجي متتابع.
- بقع توهج محيطية لزيادة عمق الخلفية.

### التخطيط والقوالب
- تطبيق التأثيرات السينمائية العامة على جسم الصفحة في `src/app/layout.tsx`.
- تحسين `BlogPostTemplate.tsx` بإضافة ضوء حجمي وتأثير كين بيرنز (Ken Burns) على الصور الرئيسية.
- إصلاح مشاكل التباين في الوضعين الفاتح والداكن وإزالة فئات التمرير (hover) المسببة للمشاكل.

### إعادة صياغة المكونات
- مركزة نصوص واجهة المستخدم المترجمة في `src/lib/dictionaries.ts`.
- إزالة التعليمات البرمجية غير المستخدمة مثل `SubscriptionCopy` في `EmailSubscriptionForm.tsx` والتعليقات غير المستخدمة في `Breadcrumbs.tsx`.
- استبدال النصوص الثابتة في `SiteFooter.tsx` باستدعاءات ديناميكية لـ `getDictionary`.

### الاختبارات
- إصلاح بناء جملة تأكيد Playwright في `tests/features.spec.ts` عن طريق نقل رسائل الخطأ المخصصة إلى الوسائط الصحيحة لـ `expect`.
- استبدال عناوين URL الثابتة لمقالات المدونة باختيار ديناميكي للمقالات لتحسين مرونة الاختبارات ضد تغييرات قاعدة البيانات المحلية أو المحتوى.

# [1.16.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.15.1...v1.16.0) (2026-07-23)


### Bug Fixes

* **a11y:** add dynamic lang and dir attributes, use declarative patterns ([9b22414](https://github.com/NeoWhisper/neowhisper-blog/commit/9b2241415492dcc74971dc8e195e3c3f34f75646))
* **a11y:** add middleware headers for SSR language detection ([07e2f55](https://github.com/NeoWhisper/neowhisper-blog/commit/07e2f552cf4525a7c8d7725159d83ce43b52f579))
* **a11y:** add role=dialog to Search modal for accessibility and test compatibility ([e1e182a](https://github.com/NeoWhisper/neowhisper-blog/commit/e1e182a28a43dc86965b810b9f351900871174b8))
* **a11y:** resolve heading hierarchy, form labels, touch targets, and performance tests ([#181](https://github.com/NeoWhisper/neowhisper-blog/issues/181)) ([ef15afa](https://github.com/NeoWhisper/neowhisper-blog/commit/ef15afa5c7fa3ea6db605ffad0f756664bb96068))
* **blog:** refactor SnapResolver to client component and fix CI linting ([fcf94fa](https://github.com/NeoWhisper/neowhisper-blog/commit/fcf94fae08cc282ffe4d424d0ecaea14a954ec2a))
* **ci:** cache playwright browsers and drop --with-deps ([85608fa](https://github.com/NeoWhisper/neowhisper-blog/commit/85608fadfc3b718ccac82d7ec9637d1b857a531d))
* **ci:** install only chromium for playwright to reduce CI time ([8fb239f](https://github.com/NeoWhisper/neowhisper-blog/commit/8fb239fd01d3562e08006ff59f68ac336c4c7552))
* **contact:** add turnstile guard and clarify trust copy ([#33](https://github.com/NeoWhisper/neowhisper-blog/issues/33)) ([d3df4bd](https://github.com/NeoWhisper/neowhisper-blog/commit/d3df4bda787afa29d85337d5868983004c23abae))
* **content-automation:** address codeql escaping and URL host checks ([b29729f](https://github.com/NeoWhisper/neowhisper-blog/commit/b29729f9dab19ef78488c9da9c4907e7ca4d4c44))
* **content-automation:** default to installed ollama model and validate availability ([330848c](https://github.com/NeoWhisper/neowhisper-blog/commit/330848c7681e05d8ff783f15ef388bb0081a877f))
* **content-automation:** handle contents divergence before daily run ([44b04c1](https://github.com/NeoWhisper/neowhisper-blog/commit/44b04c1f47051f9d7f1c89649eb8c0cc561b540b))
* **content-automation:** run launchd job via absolute bash script path ([d6ef46e](https://github.com/NeoWhisper/neowhisper-blog/commit/d6ef46e110a9cea248d43d1b4873b9930b65aceb))
* **content:** add deterministic QA gate + canonical refs ([#167](https://github.com/NeoWhisper/neowhisper-blog/issues/167)) ([854d5e8](https://github.com/NeoWhisper/neowhisper-blog/commit/854d5e88948d365195407237bf0e192d0b5afe0b))
* **content:** aggressive expansion for Japanese to meet word count ([0b5fbd4](https://github.com/NeoWhisper/neowhisper-blog/commit/0b5fbd40e57ecd9ccec0f0a3cd3752c6bc28b6e6))
* **content:** bulk resolve TOC anchor mismatches and include H3 depth ([4b0fe6e](https://github.com/NeoWhisper/neowhisper-blog/commit/4b0fe6e8349053a6693d76d53167e6adab63940f))
* **content:** bulk resolve translation placeholders and TOC link anchors ([6238fa8](https://github.com/NeoWhisper/neowhisper-blog/commit/6238fa8f6b20fd2fa3be772433f813d5fd193099))
* **content:** harden multilingual generation and daily PR flow ([dd4e93b](https://github.com/NeoWhisper/neowhisper-blog/commit/dd4e93b9f3d0804d4fb74e16de56f96c5562bd79))
* **content:** retry model fetches and serialize draft expansion ([1051b5b](https://github.com/NeoWhisper/neowhisper-blog/commit/1051b5bd7396a718e6fd17a0e498b3f56c8296c2))
* **content:** sync TOC logic and apply manual editorial cleanup for AdSense compliance ([82d081b](https://github.com/NeoWhisper/neowhisper-blog/commit/82d081b743df20fa3c33dd12a98f1eb914d96105))
* correct feed.mjs - use striptags properly, fix duplicate variable and undefined dMatch ([188c477](https://github.com/NeoWhisper/neowhisper-blog/commit/188c477613604e5d7f158dcc8031b09b15476d43))
* correct malformed array syntax in generate-daily-ai-trend-posts.mjs ([30e59cd](https://github.com/NeoWhisper/neowhisper-blog/commit/30e59cd8e9fb01f9645197eb6e46661cf2f912a9))
* **csp:** suppress hydration warning on nonce-bearing script tags in layout ([2e0a312](https://github.com/NeoWhisper/neowhisper-blog/commit/2e0a312e015674f6f23d6aac85b081607b5142d3))
* **daily:** avoid unbound GEN_ARGS on macOS bash ([a9e316e](https://github.com/NeoWhisper/neowhisper-blog/commit/a9e316eea62c3171ae1f4b289290a7af1c2529d2))
* **daily:** detect untracked generated posts as content changes ([8fd6045](https://github.com/NeoWhisper/neowhisper-blog/commit/8fd60458d59e65417dd365ebfeab2a3023b89d3e))
* **daily:** make launchd use explicit node/npm binaries ([310bbe4](https://github.com/NeoWhisper/neowhisper-blog/commit/310bbe443bf13ad9de51b6a062aece77a6235ab1))
* decode HTML entities in sanitizeFeedText function ([8a9f9a5](https://github.com/NeoWhisper/neowhisper-blog/commit/8a9f9a5ab929471ae49e526e257d1152844b2cff))
* editorial review - bullet formatting and remove irrelevant references ([cd772e8](https://github.com/NeoWhisper/neowhisper-blog/commit/cd772e8adc4d2cf7a6969a4f53e6d1417818afd1))
* **feeds:** update broken RSS feed URLs and add high-quality sources ([a5cb7b9](https://github.com/NeoWhisper/neowhisper-blog/commit/a5cb7b98dd3fbc94703563801271c226d356b9bd)), closes [hi#quality](https://github.com/hi/issues/quality)
* filter references to only include sources cited in content ([c75ead7](https://github.com/NeoWhisper/neowhisper-blog/commit/c75ead7dd9cbe52a31b182fa264d4f219fe1e4d5))
* **generator:** resolve TOC, Callout, and Arabic translation issues ([0dddb12](https://github.com/NeoWhisper/neowhisper-blog/commit/0dddb125c3d369b72f6909e0c5cf4cb01ca87259))
* harden blog slug route against production import/render failures ([7768082](https://github.com/NeoWhisper/neowhisper-blog/commit/7768082d2f303eab44dae9766d556b1e9f71e963))
* make blog page and logger fault-tolerant to prevent 500 errors ([293d32c](https://github.com/NeoWhisper/neowhisper-blog/commit/293d32c97345672a9142df9ae8b903cb88b7616a))
* **mobile:** resolve Safari layout shift, touch registration, and card pressability ([#233](https://github.com/NeoWhisper/neowhisper-blog/issues/233)) ([95fb7fa](https://github.com/NeoWhisper/neowhisper-blog/commit/95fb7fa2bd90bec8d18f65eade19130da09d8b96))
* **newsletter:** trigger on merged promotion PRs and avoid backfill ([#145](https://github.com/NeoWhisper/neowhisper-blog/issues/145)) ([9682dc4](https://github.com/NeoWhisper/neowhisper-blog/commit/9682dc47a8df36ac31fd1d8e6070106fdd9bcead))
* **next:** remove deprecated middleware file and keep proxy only ([e469227](https://github.com/NeoWhisper/neowhisper-blog/commit/e469227dd1b079de36df4604b4bf43db4cf5fae3))
* nuclear stability patch for blog page 500 errors ([352a991](https://github.com/NeoWhisper/neowhisper-blog/commit/352a991d638349b7ae11fa7346b2c7fa11cbe7a7))
* **pipeline:** harden content pipeline and remove flawed posts ([#113](https://github.com/NeoWhisper/neowhisper-blog/issues/113)) ([c985566](https://github.com/NeoWhisper/neowhisper-blog/commit/c9855667e9b55d54b629ff2f442a1b8cbe6faee3))
* remove logger from catch block and decode slug to fix 500 errors on all blog posts ([ccdd7cc](https://github.com/NeoWhisper/neowhisper-blog/commit/ccdd7cca6e5c1c75d950f1466e4278065917b6a1))
* remove NeoWhisper Insights from tool table and add Table of Contents ([7e49817](https://github.com/NeoWhisper/neowhisper-blog/commit/7e49817e7f6d22809c5b06df7861bba08975fb8e))
* remove unused toOpenGraphLocale function ([6dfba62](https://github.com/NeoWhisper/neowhisper-blog/commit/6dfba627c547f319297f35600ab53ac561f36eff))
* rename MIN_WORDS_EXCLUSIVE to MIN_WORDS_THRESHOLD correctly ([#224](https://github.com/NeoWhisper/neowhisper-blog/issues/224)) ([a485dfa](https://github.com/NeoWhisper/neowhisper-blog/commit/a485dfa57007199b3343416a4aa0c2ef360112b9))
* Resolve merge conflicts keeping enhancements ([d68d1f7](https://github.com/NeoWhisper/neowhisper-blog/commit/d68d1f7ba6bef75418564b4910d2a04b34e674fc))
* resolve playwright test timeouts and json-ld hydration issues ([#223](https://github.com/NeoWhisper/neowhisper-blog/issues/223)) ([3b47cc6](https://github.com/NeoWhisper/neowhisper-blog/commit/3b47cc6085a58662b834a35b50b46ac6ca299b5b))
* **security:** allow adtrafficquality image endpoints in CSP img-src ([2c3dab4](https://github.com/NeoWhisper/neowhisper-blog/commit/2c3dab4b00a9d38665ef4ca255c86d803f92f3cb))
* **security:** allow ep2 adtrafficquality and stabilize blog code-block layout ([73dfc4a](https://github.com/NeoWhisper/neowhisper-blog/commit/73dfc4ad05879a7e981cb092306da8437a4a5f86))
* **security:** enforce nonce CSP and restrict robots/sitemap CORS ([d55c10d](https://github.com/NeoWhisper/neowhisper-blog/commit/d55c10db6afb2b22b348e1d6737e7b27b3f4b250))
* **security:** escape dash in markdown table regex ([b5c93b5](https://github.com/NeoWhisper/neowhisper-blog/commit/b5c93b536d4e8a482bff25c21421098fb39024c6))
* **security:** harden contact flow and improve seo/adsense readiness ([e95df3f](https://github.com/NeoWhisper/neowhisper-blog/commit/e95df3fb6de4c98b076be2120107858767bab7b7))
* **security:** prevent wildcard ACAO fallback on metadata routes ([#42](https://github.com/NeoWhisper/neowhisper-blog/issues/42)) ([e7555ab](https://github.com/NeoWhisper/neowhisper-blog/commit/e7555ab47e72ce857707ddd4730eff3682fe5327))
* **security:** replace regex email validation with linear parser ([6e1de51](https://github.com/NeoWhisper/neowhisper-blog/commit/6e1de51a7d2574ae77806399edfc38365c979b6c))
* **security:** resolve merge conflicts and hook up middleware for nonce CSP ([fb52531](https://github.com/NeoWhisper/neowhisper-blog/commit/fb52531c8ad270fca9e716978c589b6d312cbbb7))
* **security:** suppress metadata ACAO for untrusted origins ([#49](https://github.com/NeoWhisper/neowhisper-blog/issues/49)) ([c5cd82e](https://github.com/NeoWhisper/neowhisper-blog/commit/c5cd82e3a4fcb0e9d236eb3b5b7b3bc87adeaa03))
* **seo:** Google AdSense compliance and E-E-A-T improvements ([#152](https://github.com/NeoWhisper/neowhisper-blog/issues/152)) ([a961932](https://github.com/NeoWhisper/neowhisper-blog/commit/a961932607a371b489a5fe1ab5093a191fd9e3e3))
* **seo:** include localized category variants in sitemap ([28ce087](https://github.com/NeoWhisper/neowhisper-blog/commit/28ce087949c14f524424f0f5bca2354db61c0ad3))
* **seo:** make canonical redirect rules config-driven ([b0843fa](https://github.com/NeoWhisper/neowhisper-blog/commit/b0843fa084a6c08e092c55002cdf239bd9ea1d32))
* **seo:** normalize english canonical urls without lang query ([0cc4344](https://github.com/NeoWhisper/neowhisper-blog/commit/0cc4344bb6d53cd5a178f30bdf957761f0ff377b))
* **seo:** resolve Google indexing issues for AdSense compliance ([eb97c41](https://github.com/NeoWhisper/neowhisper-blog/commit/eb97c41cabc01b0cc31d81d24954c9beaa772ce8))
* support LM Studio fallback for local AI model check ([#168](https://github.com/NeoWhisper/neowhisper-blog/issues/168)) ([8d0da67](https://github.com/NeoWhisper/neowhisper-blog/commit/8d0da677579be2bd472e93387c20b61e13456aa7))
* **tests:** dispatch Escape key directly to document for Search test ([e8b1014](https://github.com/NeoWhisper/neowhisper-blog/commit/e8b1014ead9cf07b17d04a499782aff9ce2dad5e))
* **tests:** focus input before Escape key in Search test ([52671da](https://github.com/NeoWhisper/neowhisper-blog/commit/52671daee5fddee110c774a65e6fabb40ddd6212))
* **tests:** increase load time threshold to 3000ms for CI variance ([a4a46a3](https://github.com/NeoWhisper/neowhisper-blog/commit/a4a46a32c75621e5b8131a6b5bdebae48541db0a))
* **tests:** increase wait time for Search Escape key test ([1981c04](https://github.com/NeoWhisper/neowhisper-blog/commit/1981c04437784a4aea466a293996bfea8da9e120))
* **tests:** resolve unused variable warnings in E2E test files ([b7ff350](https://github.com/NeoWhisper/neowhisper-blog/commit/b7ff35062fa489a87e7167d623ba74a5abd69d36))
* **tests:** update i18n E2E selectors to target visible UI elements ([c120165](https://github.com/NeoWhisper/neowhisper-blog/commit/c120165f299910816f62ea2be5a942755538634d))
* tighten adsense remediation indexing ([#188](https://github.com/NeoWhisper/neowhisper-blog/issues/188)) ([0f9fa23](https://github.com/NeoWhisper/neowhisper-blog/commit/0f9fa2357a40aefd2183b9c2e6784b0027e3c173))
* TL;DR formatting - separate bullets on individual lines (EN/JA/AR) ([f0c81eb](https://github.com/NeoWhisper/neowhisper-blog/commit/f0c81eb589b67fea2016b4e1635e1558b02a90d9))
* **ui:** resolve hydration mismatch in SiteFooter ([4bc3cba](https://github.com/NeoWhisper/neowhisper-blog/commit/4bc3cbac3e7966849f7605251f422b5cb6ebf6ab))
* update prev/next navigation e2e test selector ([fac903d](https://github.com/NeoWhisper/neowhisper-blog/commit/fac903d2dbf4f68ed08a17f19042badeb5d4c566))
* use he library for HTML entity decoding to avoid double unescaping ([4898fd5](https://github.com/NeoWhisper/neowhisper-blog/commit/4898fd5366c0922e03d638d8de5aed5d5fb47ebc))
* use sanitizeFeedText consistently for description field ([bf35902](https://github.com/NeoWhisper/neowhisper-blog/commit/bf35902b46d98b9ebd3eb6bb78e1c93c2115cda5))


### Features

* add AI agent safety check script to prevent main pushes ([0445c7f](https://github.com/NeoWhisper/neowhisper-blog/commit/0445c7f3e9815a7b5cacaae7c6eedb8d6435d7f8))
* add AI agent safety check to workflow - blocks main pushes ([befc3ea](https://github.com/NeoWhisper/neowhisper-blog/commit/befc3ead21899b18f46376e9c26e1508a63e025f))
* add AI agent safety rules - NEVER push to main ([89f9df0](https://github.com/NeoWhisper/neowhisper-blog/commit/89f9df03ecd5b52b28766dc91f00a2242b6d738a))
* add automatic Table of Contents generation and fix NeoWhisper in table issue ([4cbf4d2](https://github.com/NeoWhisper/neowhisper-blog/commit/4cbf4d26b5e7aedf104f47a4b4403fb0a71e62e4))
* add fallback outline generation when AI fails ([15538f8](https://github.com/NeoWhisper/neowhisper-blog/commit/15538f8da4df91f8f875ef978aa14280ea0f6eb3))
* add LM Studio support, remove flux.swift, simplify image gen ([04ce280](https://github.com/NeoWhisper/neowhisper-blog/commit/04ce2807c969e75cb5e982f1d87d4fcb3e83102e))
* add localized blog subscriptions and auto email workflow ([#131](https://github.com/NeoWhisper/neowhisper-blog/issues/131)) ([bf48b3e](https://github.com/NeoWhisper/neowhisper-blog/commit/bf48b3e44c33ef7d73dc811c4b0656134c9a5f68))
* **admin:** build manage posts dashboard and edit capabilities ([#25](https://github.com/NeoWhisper/neowhisper-blog/issues/25)) ([71da3b2](https://github.com/NeoWhisper/neowhisper-blog/commit/71da3b26496329d1fcd375e03186b5edede87958))
* **adsense:** add AI assistance disclosure to editorial policy ([54390ec](https://github.com/NeoWhisper/neowhisper-blog/commit/54390ec968a637ba2b71bf7b8041dc058bfcc3cf))
* **article:** add highlights section with key features format ([#106](https://github.com/NeoWhisper/neowhisper-blog/issues/106)) ([e662086](https://github.com/NeoWhisper/neowhisper-blog/commit/e6620862a45d224517792e81757a5d83d682bc3a))
* **ci:** add dev-to-main promotion workflow ([#84](https://github.com/NeoWhisper/neowhisper-blog/issues/84)) ([0f83753](https://github.com/NeoWhisper/neowhisper-blog/commit/0f837538114e6b8cec020c35643b4ff3e961e5dc))
* **cms:** add Supabase hybrid CMS phase 1 (dynamic posts + admin auth) ([#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)) ([8a39c7b](https://github.com/NeoWhisper/neowhisper-blog/commit/8a39c7baa361f4cf7f01262575e14a883172ec79))
* **config:** add React style rules and 2026 AI trend keywords ([#107](https://github.com/NeoWhisper/neowhisper-blog/issues/107)) ([69ae4f6](https://github.com/NeoWhisper/neowhisper-blog/commit/69ae4f60389885f707c68731caa2140ff424141b))
* Content Quality Metrics & Audit Trail ([#157](https://github.com/NeoWhisper/neowhisper-blog/issues/157)) ([ed6a53c](https://github.com/NeoWhisper/neowhisper-blog/commit/ed6a53c33c88b0683eefa6faba86f8e1ef9144a0)), closes [#59](https://github.com/NeoWhisper/neowhisper-blog/issues/59) [#61](https://github.com/NeoWhisper/neowhisper-blog/issues/61) [#72](https://github.com/NeoWhisper/neowhisper-blog/issues/72) [#74](https://github.com/NeoWhisper/neowhisper-blog/issues/74) [#75](https://github.com/NeoWhisper/neowhisper-blog/issues/75) [hi#quality](https://github.com/hi/issues/quality) [#79](https://github.com/NeoWhisper/neowhisper-blog/issues/79) [#82](https://github.com/NeoWhisper/neowhisper-blog/issues/82) [#86](https://github.com/NeoWhisper/neowhisper-blog/issues/86) [#89](https://github.com/NeoWhisper/neowhisper-blog/issues/89) [#99](https://github.com/NeoWhisper/neowhisper-blog/issues/99) [#100](https://github.com/NeoWhisper/neowhisper-blog/issues/100) [#101](https://github.com/NeoWhisper/neowhisper-blog/issues/101) [#103](https://github.com/NeoWhisper/neowhisper-blog/issues/103) [#98](https://github.com/NeoWhisper/neowhisper-blog/issues/98)
* **content-automation:** add daily local main sync launchd job ([0b1bef2](https://github.com/NeoWhisper/neowhisper-blog/commit/0b1bef200244d5b6c19cad193313b64d7ead01f5))
* **content-automation:** make daily trend category dynamic ([#75](https://github.com/NeoWhisper/neowhisper-blog/issues/75)) ([e9801dc](https://github.com/NeoWhisper/neowhisper-blog/commit/e9801dc6bbeb818b85d59962fea33b07cef5730b))
* **content:** add apple category ([5ebb8f8](https://github.com/NeoWhisper/neowhisper-blog/commit/5ebb8f82655ffe28a8a204957e78f9dbe0503ad4))
* **content:** add brief post (2026-04-14) ([#144](https://github.com/NeoWhisper/neowhisper-blog/issues/144)) ([b8c5198](https://github.com/NeoWhisper/neowhisper-blog/commit/b8c51983ec28855db3e9b4593507fdb3dc0fb0e4))
* **content:** add daily AI trend draft (2026-03-24) ([#72](https://github.com/NeoWhisper/neowhisper-blog/issues/72)) ([22c5c6b](https://github.com/NeoWhisper/neowhisper-blog/commit/22c5c6b987fd9c18d507db052ddb1b8b240ff373))
* **content:** add daily AI trend draft (2026-03-25) ([#74](https://github.com/NeoWhisper/neowhisper-blog/issues/74)) ([cb6bf84](https://github.com/NeoWhisper/neowhisper-blog/commit/cb6bf84fa75386c38c4b8a5f347cb8d52b7b65d0))
* **content:** add daily AI trend draft (2026-03-27) ([#82](https://github.com/NeoWhisper/neowhisper-blog/issues/82)) ([47fdc64](https://github.com/NeoWhisper/neowhisper-blog/commit/47fdc64385621876ed429268589ae2c134c7d1b6))
* **content:** add daily AI trend draft (2026-04-13) ([f3548cf](https://github.com/NeoWhisper/neowhisper-blog/commit/f3548cf1d3e0805c3754d6a2002b46cc5963deb5))
* **content:** add high-value remediation posts and expand live project proof ([#47](https://github.com/NeoWhisper/neowhisper-blog/issues/47)) ([2485b9c](https://github.com/NeoWhisper/neowhisper-blog/commit/2485b9c78d594d6576dc973740e46158ace1fdbf)), closes [hi#value](https://github.com/hi/issues/value)
* **content:** add local ollama daily draft + auto PR runner ([f1cece8](https://github.com/NeoWhisper/neowhisper-blog/commit/f1cece814f244872a8030151bd9fc35eadd482d7))
* **content:** add March 2026 AI trend posts (EN/JA/AR) ([#50](https://github.com/NeoWhisper/neowhisper-blog/issues/50)) ([3ce53f1](https://github.com/NeoWhisper/neowhisper-blog/commit/3ce53f1fc2cf175ccc436b2128690c7b8add87e1))
* **content:** add new local llm tools article in en, ja, ar ([d555655](https://github.com/NeoWhisper/neowhisper-blog/commit/d555655b0d5c32bd0e173a1081e3852400fe5478))
* **content:** add pattern-based PR script with category selection ([eb462bf](https://github.com/NeoWhisper/neowhisper-blog/commit/eb462bfd9ebc188f72a55a7599c1e990ecfb19ab))
* **content:** category-driven recent-news 3-language post workflow ([#105](https://github.com/NeoWhisper/neowhisper-blog/issues/105)) ([88d0112](https://github.com/NeoWhisper/neowhisper-blog/commit/88d01122cacac10052d58fbd56392999c20d4a27))
* **content:** daily AI trend draft (2026-03-22) ([#59](https://github.com/NeoWhisper/neowhisper-blog/issues/59)) ([a7682fd](https://github.com/NeoWhisper/neowhisper-blog/commit/a7682fd8fe4756f41aaba88b8a759517abfa70d4))
* **content:** daily AI trend draft (2026-03-23) ([#61](https://github.com/NeoWhisper/neowhisper-blog/issues/61)) ([2f7f6f5](https://github.com/NeoWhisper/neowhisper-blog/commit/2f7f6f529379e8399dff0977e144a39d3fb50a00))
* **content:** daily AI trend draft (2026-03-26) ([#79](https://github.com/NeoWhisper/neowhisper-blog/issues/79)) ([17e4a45](https://github.com/NeoWhisper/neowhisper-blog/commit/17e4a450d382628a036de85c9e3ed3e6294bbf91)), closes [hi#quality](https://github.com/hi/issues/quality)
* **content:** daily AI trend draft (2026-04-02) ([#101](https://github.com/NeoWhisper/neowhisper-blog/issues/101)) ([8766f4b](https://github.com/NeoWhisper/neowhisper-blog/commit/8766f4b03d1708148822c51a01e1517054240401))
* **content:** daily AI trend draft (2026-04-03) ([#103](https://github.com/NeoWhisper/neowhisper-blog/issues/103)) ([053ebe3](https://github.com/NeoWhisper/neowhisper-blog/commit/053ebe3746eb22d1f8209cd1f254faa679a6a9da)), closes [#98](https://github.com/NeoWhisper/neowhisper-blog/issues/98) [#59](https://github.com/NeoWhisper/neowhisper-blog/issues/59) [#61](https://github.com/NeoWhisper/neowhisper-blog/issues/61) [#72](https://github.com/NeoWhisper/neowhisper-blog/issues/72) [#74](https://github.com/NeoWhisper/neowhisper-blog/issues/74) [#75](https://github.com/NeoWhisper/neowhisper-blog/issues/75) [hi#quality](https://github.com/hi/issues/quality) [#79](https://github.com/NeoWhisper/neowhisper-blog/issues/79) [#82](https://github.com/NeoWhisper/neowhisper-blog/issues/82) [#86](https://github.com/NeoWhisper/neowhisper-blog/issues/86) [#89](https://github.com/NeoWhisper/neowhisper-blog/issues/89) [#99](https://github.com/NeoWhisper/neowhisper-blog/issues/99) [#100](https://github.com/NeoWhisper/neowhisper-blog/issues/100) [#101](https://github.com/NeoWhisper/neowhisper-blog/issues/101)
* **content:** daily AI trend draft (2026-04-04) ([#109](https://github.com/NeoWhisper/neowhisper-blog/issues/109)) ([d589344](https://github.com/NeoWhisper/neowhisper-blog/commit/d589344255fdda8e29a38a761122430b8be91d07))
* **content:** daily AI trend draft (2026-04-05) ([#111](https://github.com/NeoWhisper/neowhisper-blog/issues/111)) ([c202eab](https://github.com/NeoWhisper/neowhisper-blog/commit/c202eaba7759ff3c2ead4a243b1bf0177e67a01e))
* **content:** daily AI trend draft (2026-04-07) ([#119](https://github.com/NeoWhisper/neowhisper-blog/issues/119)) ([2d86f33](https://github.com/NeoWhisper/neowhisper-blog/commit/2d86f33d0637d1b0bd6d7918296767ec6431602c))
* **content:** daily AI trend draft (2026-04-09) ([#123](https://github.com/NeoWhisper/neowhisper-blog/issues/123)) ([68ae135](https://github.com/NeoWhisper/neowhisper-blog/commit/68ae135635a226843fa141a5c0832f84d38a3880))
* **content:** daily AI trend draft (2026-04-10) ([#126](https://github.com/NeoWhisper/neowhisper-blog/issues/126)) ([49d5b7a](https://github.com/NeoWhisper/neowhisper-blog/commit/49d5b7a50f90602ad97105e82540fe6279a873f2))
* **content:** daily AI trend draft (2026-04-11) ([#128](https://github.com/NeoWhisper/neowhisper-blog/issues/128)) ([65bacac](https://github.com/NeoWhisper/neowhisper-blog/commit/65bacac59df483f0e30adcde5284bfd4e47ba777))
* **content:** daily AI trend draft (2026-04-13) ([5db72ed](https://github.com/NeoWhisper/neowhisper-blog/commit/5db72ede1f64343f644f265218cebdb033acfc52))
* **content:** daily AI trend draft (2026-04-14) ([#139](https://github.com/NeoWhisper/neowhisper-blog/issues/139)) ([356c534](https://github.com/NeoWhisper/neowhisper-blog/commit/356c53441cf9a92865c55ba1f246cf166cb768d2))
* **content:** refine source filtering and category selection ([85fd54f](https://github.com/NeoWhisper/neowhisper-blog/commit/85fd54fe9c9477aea1fb91d03b73c78c733b02e3))
* **content:** rewrite local llm posts for SEO, adding benchmarks, tradeoffs and FAQs ([689f71e](https://github.com/NeoWhisper/neowhisper-blog/commit/689f71e199b59d83f6f45e244fb215c8ea72aa8b))
* **content:** rewrite local llm posts to 1100+ words and fix markdown TOC formatting ([f5d056d](https://github.com/NeoWhisper/neowhisper-blog/commit/f5d056dd576203e24aa84cbb5e8db04aa6f5e5de))
* **content:** strengthen daily trend quality and readability ([7f1e8cb](https://github.com/NeoWhisper/neowhisper-blog/commit/7f1e8cb96a0b01121505aee360c472ac776f71fc))
* **feeds:** add Apple, AWS, and Anthropic news sources ([73213d2](https://github.com/NeoWhisper/neowhisper-blog/commit/73213d2c030031b367905a317669074479cf170b))
* **feeds:** add Frontend and React news sources ([d53ce33](https://github.com/NeoWhisper/neowhisper-blog/commit/d53ce33b8b5244de2eaba5bea4c9bdc5f1a7fd07))
* **feeds:** add General IT and Enterprise news sources ([cf2a6b4](https://github.com/NeoWhisper/neowhisper-blog/commit/cf2a6b4e46cc654723f8d6a0387c04e9bc4cb08f))
* **feeds:** add Japanese and Arabic news sources ([8c67f3a](https://github.com/NeoWhisper/neowhisper-blog/commit/8c67f3aecb29fb82c0cc3c0f6674290eae4a8a26))
* implement cinematic design across website ([#216](https://github.com/NeoWhisper/neowhisper-blog/issues/216)) ([c398c85](https://github.com/NeoWhisper/neowhisper-blog/commit/c398c85f852f9b97ae9300e09084eaa70ce56360))
* implement cinematic design across website ([#216](https://github.com/NeoWhisper/neowhisper-blog/issues/216)) ([#218](https://github.com/NeoWhisper/neowhisper-blog/issues/218)) ([7035ad3](https://github.com/NeoWhisper/neowhisper-blog/commit/7035ad36bd37c2d8e8aa72e741221683c5dbc010))
* **pipeline:** modular staged content generator + daily post (2026-03-31) ([#89](https://github.com/NeoWhisper/neowhisper-blog/issues/89)) ([6b9064a](https://github.com/NeoWhisper/neowhisper-blog/commit/6b9064a9d48d5369f8e25b23e257a874fa9cdae3))
* **policy:** enforce >700-word new posts and update privacy disclosures ([#76](https://github.com/NeoWhisper/neowhisper-blog/issues/76)) ([04a25fe](https://github.com/NeoWhisper/neowhisper-blog/commit/04a25fe1de51bc5405c40ae5d190769910d2e60b))
* **posts:** add multilingual Next.js production debugging playbook and PR templates ([#35](https://github.com/NeoWhisper/neowhisper-blog/issues/35)) ([65c1d44](https://github.com/NeoWhisper/neowhisper-blog/commit/65c1d4409b125518fac068ed1028ae06bbf4e4a4))
* **posts:** add multilingual nextjs production debugging playbook ([4b93f52](https://github.com/NeoWhisper/neowhisper-blog/commit/4b93f52f45cda683f9bd5fb275ab97ee5975c05d))
* **publisher:** implement chained generation for 700+ word counts ([15e9388](https://github.com/NeoWhisper/neowhisper-blog/commit/15e9388d5334824c3f01f849af0ce25eb8c3581b))
* **qa:** add manual qa check script and fix arabic e2e test ([111fc38](https://github.com/NeoWhisper/neowhisper-blog/commit/111fc38fdf399512e7d1407fd9abeb0bce2f0283))
* **scripts:** allow auto-stashing dirty worktree for daily PR flow ([632e1f6](https://github.com/NeoWhisper/neowhisper-blog/commit/632e1f66ee13fa54b5e9ccfc97a915ca24e70600))
* **seo:** enhance metadata schema and image sitemap ([#83](https://github.com/NeoWhisper/neowhisper-blog/issues/83)) ([be53083](https://github.com/NeoWhisper/neowhisper-blog/commit/be530832862e7f0f384f2706a92eb9abce007202))
* shuffle source selection for topic variety ([5126538](https://github.com/NeoWhisper/neowhisper-blog/commit/5126538394709119171d271c9ea32949b1dceea6))
* sync main to contents for AI agent workflow ([7454131](https://github.com/NeoWhisper/neowhisper-blog/commit/74541311ead4869b1fb78f46095be0405a44cd33))
* **ui:** Add RSS feed, breadcrumbs, dark mode, search, and navigation enhancements ([#170](https://github.com/NeoWhisper/neowhisper-blog/issues/170)) ([642f86c](https://github.com/NeoWhisper/neowhisper-blog/commit/642f86c4b7ca4ea018625f7a2d41f41ca768956e))

## [1.15.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.15.0...v1.15.1) (2026-04-20)


### Bug Fixes

* **content:** aggressive expansion for Japanese to meet word count ([a327cfe](https://github.com/NeoWhisper/neowhisper-blog/commit/a327cfeb705a1641412298b3b8f29bb10b968c7c))

# [1.15.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.14.4...v1.15.0) (2026-04-20)


### Features

* **adsense:** add AI assistance disclosure to editorial policy ([f50a1cb](https://github.com/NeoWhisper/neowhisper-blog/commit/f50a1cb4d82b156a6bbe6e1d28fb047d3b67d892))
* Content Quality Metrics & Audit Trail ([#157](https://github.com/NeoWhisper/neowhisper-blog/issues/157)) ([fb9d023](https://github.com/NeoWhisper/neowhisper-blog/commit/fb9d0235595a61fad7b57e3cd39c70d3c9c4156c)), closes [#59](https://github.com/NeoWhisper/neowhisper-blog/issues/59) [#61](https://github.com/NeoWhisper/neowhisper-blog/issues/61) [#72](https://github.com/NeoWhisper/neowhisper-blog/issues/72) [#74](https://github.com/NeoWhisper/neowhisper-blog/issues/74) [#75](https://github.com/NeoWhisper/neowhisper-blog/issues/75) [hi#quality](https://github.com/hi/issues/quality) [#79](https://github.com/NeoWhisper/neowhisper-blog/issues/79) [#82](https://github.com/NeoWhisper/neowhisper-blog/issues/82) [#86](https://github.com/NeoWhisper/neowhisper-blog/issues/86) [#89](https://github.com/NeoWhisper/neowhisper-blog/issues/89) [#99](https://github.com/NeoWhisper/neowhisper-blog/issues/99) [#100](https://github.com/NeoWhisper/neowhisper-blog/issues/100) [#101](https://github.com/NeoWhisper/neowhisper-blog/issues/101) [#103](https://github.com/NeoWhisper/neowhisper-blog/issues/103) [#98](https://github.com/NeoWhisper/neowhisper-blog/issues/98)

## [1.14.4](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.14.3...v1.14.4) (2026-04-15)


### Bug Fixes

* **content:** improve JSON output reliability for AI generation ([#151](https://github.com/NeoWhisper/neowhisper-blog/issues/151)) ([d07a800](https://github.com/NeoWhisper/neowhisper-blog/commit/d07a80080e9ee650d6aa0914a361c8e234f78e77))

## [1.14.3](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.14.2...v1.14.3) (2026-04-15)


### Bug Fixes

* **workflow:** change pull_request_target to pull_request for security ([#147](https://github.com/NeoWhisper/neowhisper-blog/issues/147)) ([67b2b1a](https://github.com/NeoWhisper/neowhisper-blog/commit/67b2b1a13c5a23e9d5031906788c35a842398ee3))

## [1.14.2](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.14.1...v1.14.2) (2026-03-27)


### Bug Fixes

* **seo:** normalize english canonical urls and sync dev into main ([#80](https://github.com/NeoWhisper/neowhisper-blog/issues/80)) ([df6982c](https://github.com/NeoWhisper/neowhisper-blog/commit/df6982c985718138f87b87b2cc34619b35ab0301)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

## [1.14.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.14.0...v1.14.1) (2026-03-24)


### Bug Fixes

* sync dev with main, harden security, and improve AdSense/SEO readiness ([#63](https://github.com/NeoWhisper/neowhisper-blog/issues/63)) ([5786de7](https://github.com/NeoWhisper/neowhisper-blog/commit/5786de7bb6163e7d66646d08a12c8b34402024cf)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

# [1.14.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.13.0...v1.14.0) (2026-03-22)


### Features

* **content:** release daily AI draft, automation hardening, and blog table fixes ([#60](https://github.com/NeoWhisper/neowhisper-blog/issues/60)) ([495bfeb](https://github.com/NeoWhisper/neowhisper-blog/commit/495bfeb678c82e0e268cb8ab586571da43576134)), closes [#59](https://github.com/NeoWhisper/neowhisper-blog/issues/59)

# [1.13.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.12.3...v1.13.0) (2026-03-22)


### Features

* **content-ops:** add local Ollama daily multilingual draft + auto PR runner ([#58](https://github.com/NeoWhisper/neowhisper-blog/issues/58)) ([6d917ac](https://github.com/NeoWhisper/neowhisper-blog/commit/6d917ac9753d6b835f6e6d64a4d3ed26d2e9941b))

## [1.12.3](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.12.2...v1.12.3) (2026-03-09)


### Bug Fixes

* **content+ci:** improve trust wording and simplify e2e npm cache ([e19f7e2](https://github.com/NeoWhisper/neowhisper-blog/commit/e19f7e28b63e10082cbcf520e8a1cbec7e842c90))
* **security:** allow adtrafficquality image endpoints in CSP img-src ([#46](https://github.com/NeoWhisper/neowhisper-blog/issues/46)) ([e6afe93](https://github.com/NeoWhisper/neowhisper-blog/commit/e6afe93aea4fd3c438c34b590eab765da06b998d)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)
* **security:** allow ep2 adtrafficquality and stabilize blog code-block layout ([#45](https://github.com/NeoWhisper/neowhisper-blog/issues/45)) ([e03021d](https://github.com/NeoWhisper/neowhisper-blog/commit/e03021ddb36f9cef5679784accaf098ac1960542)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

## [1.12.2](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.12.1...v1.12.2) (2026-03-03)


### Bug Fixes

* **security:** prevent wildcard ACAO fallback on metadata routes ([#42](https://github.com/NeoWhisper/neowhisper-blog/issues/42)) ([adc7fd6](https://github.com/NeoWhisper/neowhisper-blog/commit/adc7fd61f588cfc24d7754d9fb2fa40f7e6f04f6))

## [1.12.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.12.0...v1.12.1) (2026-03-03)


### Bug Fixes

* **security:** enforce nonce CSP and restrict robots/sitemap CORS ([18e87b5](https://github.com/NeoWhisper/neowhisper-blog/commit/18e87b559608926da114d755aec36c187f836178))

# [1.12.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.5...v1.12.0) (2026-03-01)


### Features

* **posts:** add multilingual Next.js production debugging playbook and PR templates ([#35](https://github.com/NeoWhisper/neowhisper-blog/issues/35)) ([669e631](https://github.com/NeoWhisper/neowhisper-blog/commit/669e6312a0b1df10c0c91261f524112c8bf463de))

## [1.11.5](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.4...v1.11.5) (2026-03-01)


### Bug Fixes

* harden blog slug route against production import/render failures ([5c3cad9](https://github.com/NeoWhisper/neowhisper-blog/commit/5c3cad919caace47a5e1b69c37ec79e186f17d8e))

## [1.11.4](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.3...v1.11.4) (2026-02-27)


### Bug Fixes

* remove logger from catch block and decode slug to fix 500 errors on all blog posts ([297ce4b](https://github.com/NeoWhisper/neowhisper-blog/commit/297ce4b3c829c31a4bc309046be7134efad68dec))

## [1.11.3](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.2...v1.11.3) (2026-02-27)


### Bug Fixes

* remove unused toOpenGraphLocale function ([8f71430](https://github.com/NeoWhisper/neowhisper-blog/commit/8f71430a77b1d21aa7fe169aaa271660a20a79f8))

## [1.11.2](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.1...v1.11.2) (2026-02-25)


### Bug Fixes

* nuclear stability patch for blog page 500 errors ([f245912](https://github.com/NeoWhisper/neowhisper-blog/commit/f245912c14a7754c66e4bbec7a8e6e3ced8f0c38))

## [1.11.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.11.0...v1.11.1) (2026-02-25)


### Bug Fixes

* make blog page and logger fault-tolerant to prevent 500 errors ([9b51662](https://github.com/NeoWhisper/neowhisper-blog/commit/9b516627ea5340d60ec9ef99763dd7a4475a4e4a))

# [1.11.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.10.0...v1.11.0) (2026-02-25)


### Features

* consolidate admin features, supabase logging, and contact ux improvements ([#34](https://github.com/NeoWhisper/neowhisper-blog/issues/34)) ([37d9a95](https://github.com/NeoWhisper/neowhisper-blog/commit/37d9a95189138a77d31cec5e007c39bab6674709)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

# Changelog

All notable changes to the NeoWhisper blog will be documented here.

## [Unreleased]

* Code quality: Removed if statements from remaining components (`ArticleCard.tsx` and `BlogPostTemplate.tsx`).
* Admin dashboard: Refactored `AdminPage` for dynamic hydration from URL params and functional state initialization.
* Bug fix: Resolved TypeScript/ESLint standalone expression errors in `posts-table.tsx` and `edit-form.tsx` using `void` ternary pattern.
* Security: Updated CSP to whitelist Perplexity CDN (`r2cdn.perplexity.ai`) and additional Google AdSense domains, resolving font and script blocking errors.
* Observability: Implemented a persistent, Supabase-backed logging system (`src/lib/logger.ts`) to capture production errors with stack traces.
* Admin Dashboard: Added a new "Error Logs" management page (`/admin/logs`) to review system errors recorded in the database.
* Refactoring: Satisfied React linting rules by decoupling data fetching from JSX construction in dynamic blog pages.
* Observability: Added standardized client and server-side logging for all admin actions (create, update, delete, status change).
* Trust copy (JA): Replaced ambiguous "登録済み" business claims with clearer legal phrasing based on 開業届提出済み status in `about` and `AuthorBio`.
* Contact UX: Added client-side Turnstile token guard with localized error messages (EN/JA/AR) to avoid noisy failed submissions when captcha is not completed.
* **content-quality:** strengthen trust pages and reduce thin-indexed content ([43fb039](https://github.com/NeoWhisper/neowhisper-blog/commit/43fb03984c46f64707dd0e622442078c5b8fa351))
* Cross-reference: Builds on the CSP and header cleanup from merged branch `fix/changelog-fonts-tests-refactor`.

## [1.10.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.9.0...v1.10.0) (2026-02-24)

### Features

* admin posts management, release workflow fixes, and security updates ([#26](https://github.com/NeoWhisper/neowhisper-blog/issues/26)) ([a411693](https://github.com/NeoWhisper/neowhisper-blog/commit/a4116934522392012d237f69ea214ba3d4dc6dab)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)
* release Supabase Hybrid CMS Phase 1, refactor, and update CI ([#24](https://github.com/NeoWhisper/neowhisper-blog/issues/24)) ([792a2e7](https://github.com/NeoWhisper/neowhisper-blog/commit/792a2e7ad6c867614c4975df793397248c9e8b50)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

## [1.8.2](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.8.1...v1.8.2) (2026-02-16)

### Bug Fixes

* **seo:** use existing logo asset in blog structured data ([8b0decc](https://github.com/NeoWhisper/neowhisper-blog/commit/8b0decc21090f62c108a3c2e26aa2f294bd4bc40))

## [1.8.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.8.0...v1.8.1) (2026-02-16)

### Bug Fixes

* **adsense:** remove stray markdown from ads.txt ([347062e](https://github.com/NeoWhisper/neowhisper-blog/commit/347062ef2cbbdcaea074dff07f8f57dcb1e5469c))

## [1.8.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.7.0...v1.8.0) (2026-02-16)

### Features

* **site:** refine multilingual positioning and roadmap timeline ([e3494a2](https://github.com/NeoWhisper/neowhisper-blog/commit/e3494a23c8c4315830c6d95ab32d5387ca4890d5))

<!-- markdownlint-disable MD024 -->
## [1.7.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.6.1...v1.7.0) (2026-02-16)

### 🎉 AdSense Readiness Milestone

This release completes all critical requirements for Google AdSense approval.

### Bug Fixes

* **security:** remove empty CORS headers from robots and sitemap ([112047d](https://github.com/NeoWhisper/neowhisper-blog/commit/112047db8c51e155d4e18a024dffe44b63c02e3b))
* **6 CSP errors** blocking AdSense scripts (frame-src, script-src, connect-src violations)
* **Email deliverability** - Changed RESEND_FROM to friendly address, configured DMARC
* **CSP configuration** - Added all required Google domains for AdSense
* **Twitter/X link** removed from AuthorBio (replaced with real GitHub only)

### Features

* **business:** transition to professional service agency branding ([cbcd6eb](https://github.com/NeoWhisper/neowhisper-blog/commit/cbcd6ebee282e3bba26c3866fa4621d66ce2a374))
* **Blog Posts (2 new, bringing total to 6):**
  * "Building Production-Ready Contact Forms with Cloudflare Turnstile and Resend" (EN/JA/AR)
  * "From 6 CSP Errors to Zero: Debugging Content Security Policy for AdSense" (EN/JA/AR)
* **AuthorBio component** with E-E-A-T signals (expertise, authority, trust)
* **CookieBanner component** with GDPR compliance and multilingual support
* **Internal links** added to all blog posts (15 files updated, 2-3 links per post)
* **SEO metadata** with i18n support for all marketing pages (Services, Projects, About, Contact)
* **DNS records** for email deliverability (SPF, DKIM, DMARC)
* **CSP documentation** section in README with troubleshooting guide

### Changed

* **README.md** kept generic for template reusability
* **DNS-SETUP-CHECKLIST.md** added to .gitignore (operational doc)
* **CSP policy** relaxed for AdSense while maintaining security (no wildcard *, specific domains only)
* **Welcome post** expanded with more substantive content and navigation links

### Infrastructure

* Email deliverability tested in production (Gmail/Outlook inbox delivery confirmed)
* All High-priority AdSense tasks completed (100%)
* All Critical tasks completed except final translations (75%)
* Total progress: 18% → 86% in 2 days

### Metrics

* Blog posts: 4 → 6 (target met)
* Internal links: 0 → 20+ (200% of target)
* CSP errors: 6 → 0 (100% resolved)
* Commits: 14 over 2 days
* Files changed: 40+
<!-- markdownlint-enable MD024 -->

## [1.6.1](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.6.0...v1.6.1) (2026-02-10)

### Bug Fixes

* **security:** resolve XSS and upgrade Next.js to 16.1.5 ([361700f](https://github.com/NeoWhisper/neowhisper-blog/commit/361700fc1ae6032a76f95fda176b6f65cc883cd6))

## [1.6.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.5.1...v1.6.0) (2026-02-09)

### Bug Fixes

* **api:** add robust validation for RESEND_FROM with fallback to onboarding email ([f8bc64b](https://github.com/NeoWhisper/neowhisper-blog/commit/f8bc64b64fdad79853dd1b498d8b9a5ec7bafcdd))
* **api:** improve request body parsing for Turnstile token and lang handling ([3e9af2b](https://github.com/NeoWhisper/neowhisper-blog/commit/3e9af2ba8541d1a9273fde1a1a1624a454cd55ce))
* **api:** improve Resend 'from' address handling and logging ([9bc85c5](https://github.com/NeoWhisper/neowhisper-blog/commit/9bc85c55706abba81bdb590b5edcea586e30d4ef))
* **ci:** update Node.js version to 22 for semantic-release ([1304342](https://github.com/NeoWhisper/neowhisper-blog/commit/13043427920999bb48553044277bfe301abb08dd))
* **contact:** avoid form reset crash after async submit ([4acd745](https://github.com/NeoWhisper/neowhisper-blog/commit/4acd7457fd4a3bf011c9385411a35c6e31fa96cf))
* **contact:** make form submit work without JS (no query params) ([ebb3472](https://github.com/NeoWhisper/neowhisper-blog/commit/ebb34720c1b2e7c55c20adef6ee28898cd53db3d))
* **csp:** add missing Google AdSense domains to eliminate console warnings ([45c936e](https://github.com/NeoWhisper/neowhisper-blog/commit/45c936e815ae63c1ae867f7ef3b85ade5ef8b663))
* resolve AdSense CSP errors by adding required Google domains ([d09bc9d](https://github.com/NeoWhisper/neowhisper-blog/commit/d09bc9d925717dac573cf79162b935af3526b3eb))
* resolve homepage build errors ([9c5bf71](https://github.com/NeoWhisper/neowhisper-blog/commit/9c5bf713c933b6efaa4869ea6c52bf7a06b5a6e0))
* **security:** relax CSP for hydration, Turnstile, and AdSense ([56d4296](https://github.com/NeoWhisper/neowhisper-blog/commit/56d4296c2ad456b6a3b211e17a55d625f0dcbb4d))
* **security:** restrict Access-Control-Allow-Origin for robots.txt and sitemap.xml ([7229175](https://github.com/NeoWhisper/neowhisper-blog/commit/722917520bf6c6090c449def95e8c6f6931907d2))
* **security:** set Access-Control-Allow-Origin to <https://www.neowhisper.net> for robots/sitemap ([436d61c](https://github.com/NeoWhisper/neowhisper-blog/commit/436d61cadfcd00a84d216cd5814918c6823a0065))
* **ui:** correct active tab highlighting in mobile and desktop navigation ([1ca33ca](https://github.com/NeoWhisper/neowhisper-blog/commit/1ca33ca937b916bf1b63a10756532204c4c47b4b))
* **ui:** prevent illegal invocation in Blog CTA; improve contact errors ([2091c1c](https://github.com/NeoWhisper/neowhisper-blog/commit/2091c1c3fb2b193236ec486bf7169b9c9b6b9067))
* update github-script action to v7 for better API compatibility ([94c51e1](https://github.com/NeoWhisper/neowhisper-blog/commit/94c51e16bf948ad7ac787b0932b06af483f86439))
* update Node.js version to 20+ and fix GitHub Actions workflows ([8c80ee3](https://github.com/NeoWhisper/neowhisper-blog/commit/8c80ee314ea4d6cc07f3fbb14b97d43de7af29cd))
* wrap SiteHeader in Suspense for prerender ([11f3814](https://github.com/NeoWhisper/neowhisper-blog/commit/11f3814a20a0273d1076a50511c606bd280247e4))

### Features

* add Author Bio component for E-E-A-T signals (AdSense H2) ([2fbd4fc](https://github.com/NeoWhisper/neowhisper-blog/commit/2fbd4fc3444a4692d02c687bc56997fc10b72a55))
* add blog post about production contact forms (Post #5) ([789209f](https://github.com/NeoWhisper/neowhisper-blog/commit/789209f40868334b363d4029360ae5d4654e0d48))
* add final blog post #6 about CSP debugging (EN only for now) ([a764787](https://github.com/NeoWhisper/neowhisper-blog/commit/a7647878579b5da80fc24bb817a31892fd98c93b))
* add GDPR-compliant Cookie Banner (AdSense H3) ([9e6bc13](https://github.com/NeoWhisper/neowhisper-blog/commit/9e6bc138254150f0bf6d3bddd09d469f73216c31))
* add internal links to all blog posts for AdSense compliance ([cb81d6e](https://github.com/NeoWhisper/neowhisper-blog/commit/cb81d6ecee48e516afd90d71525894b5ff35bfff))
* add JA/AR translations for contact forms post (Post #5 complete) ([ed92043](https://github.com/NeoWhisper/neowhisper-blog/commit/ed920435b2874d8bd1cb45b3f0fae2096397a478))
* add JA/AR translations for Post #6 - ALL POSTS NOW TRILINGUAL! ([f82e095](https://github.com/NeoWhisper/neowhisper-blog/commit/f82e095e1e97758aec2002699887f6e0b51626e3))
* add SEO metadata with i18n support to all marketing pages (AdSense H4) ([f95a849](https://github.com/NeoWhisper/neowhisper-blog/commit/f95a849a0b94a9d6e80fc51bbeba3aec81d0becb)), closes Hi#priority
* **ci:** add semantic-release with commitlint, husky, and dependabot ([1a3e774](https://github.com/NeoWhisper/neowhisper-blog/commit/1a3e774fb3f59c0a1227caee1de7c0f08aa8f2ee))
* **csp:** finalize AdSense & Turnstile readiness ([7be1d61](https://github.com/NeoWhisper/neowhisper-blog/commit/7be1d6146ad4d44c520ae2ed226af7b34c5a3d2f))
* **site:** add multilingual marketing pages, contact form, and project system ([3b59837](https://github.com/NeoWhisper/neowhisper-blog/commit/3b59837ad5b1873a4a8713a6fb1b1f44338fc20a))

## [Unreleased]

* Code quality: Removed if statements from remaining components (`ArticleCard.tsx` and `BlogPostTemplate.tsx`).
* Admin dashboard: Refactored `AdminPage` for dynamic hydration from URL params and functional state initialization.
* Bug fix: Resolved TypeScript/ESLint standalone expression errors in `posts-table.tsx` and `edit-form.tsx` using `void` ternary pattern.
* Security: Updated CSP to whitelist Perplexity CDN (`r2cdn.perplexity.ai`) and additional Google AdSense domains, resolving font and script blocking errors.
* Observability: Implemented a persistent, Supabase-backed logging system (`src/lib/logger.ts`) to capture production errors with stack traces.
* Admin Dashboard: Added a new "Error Logs" management page (`/admin/logs`) to review system errors recorded in the database.
* Refactoring: Satisfied React linting rules by decoupling data fetching from JSX construction in dynamic blog pages.
* Observability: Added standardized client and server-side logging for all admin actions (create, update, delete, status change).
* Trust copy (JA): Replaced ambiguous "登録済み" business claims with clearer legal phrasing based on 開業届提出済み status in `about` and `AuthorBio`.
* Contact UX: Added client-side Turnstile token guard with localized error messages (EN/JA/AR) to avoid noisy failed submissions when captcha is not completed.
* Cross-reference: Builds on the CSP and header cleanup from merged branch `fix/changelog-fonts-tests-refactor`.

## [1.10.0](https://github.com/NeoWhisper/neowhisper-blog/compare/v1.9.0...v1.10.0) (2026-02-24)

### Features

* admin posts management, release workflow fixes, and security updates ([#26](https://github.com/NeoWhisper/neowhisper-blog/issues/26)) ([a411693](https://github.com/NeoWhisper/neowhisper-blog/commit/a4116934522392012d237f69ea214ba3d4dc6dab)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)
* release Supabase Hybrid CMS Phase 1, refactor, and update CI ([#24](https://github.com/NeoWhisper/neowhisper-blog/issues/24)) ([792a2e7](https://github.com/NeoWhisper/neowhisper-blog/commit/792a2e7ad6c867614c4975df793397248c9e8b50)), closes [#23](https://github.com/NeoWhisper/neowhisper-blog/issues/23)

## [1.6.0] - 2026-02-07

### Added

* New marketing homepage with multilingual support (EN/JA/AR).
* Dedicated `/blog` hub page (previous homepage moved and refined).
* Sticky glassmorphism top navigation bar with key anchors.
* `/projects`, `/services`, `/about`, and `/contact` standalone pages.
* Contact form with API endpoint (ready for email provider integration).
* Resend email delivery support for contact form.
* Animated “Visit the Blog” CTA with scroll reveal.
* Planned/locked styling for future projects and platforms.
* Localized About/Services/Projects/Contact pages (EN/JA/AR).
* Contact success page and Turnstile spam protection.
* Multi-recipient email forwarding via `RESEND_TO`.

### Changed

* Sitemap now includes `/projects` and `/services`.

## [1.5.1] - 2026-02-02

### Added

* Playwright E2E tests and configuration (`tests/` and `playwright.config.ts`).
* GitHub Actions workflow to run Playwright E2E on push and PRs (`.github/workflows/e2e.yml`).

### Fixed

* Canonicalized and redirected non-canonical/encoded category slugs to avoid duplicate pages (fixes empty-state for encoded variants).
* Removed `Access-Control-Allow-Origin` header for `/robots.txt` and `/sitemap.xml` (security hardening).
* Added security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.

### Chore

* Updated `README.md` with E2E instructions and `.gitignore` to ignore Playwright artifacts and IDE files.

## [1.5.0] - 2026-01-31

### Added

* **Hreflang Tags**: Added proper hreflang tags to all blog posts for SEO, supporting all language variants (en, ja, ar) with `x-default` pointing to English version
* **Related Posts Section**: Implemented "Related Posts" section below each article showing up to 3 posts from the same category and language, excluding the current post
* **Clickable Category Links**: Made category badges clickable links in both header metadata and footer sections, pointing to category pages with proper URL encoding
* **Language-Aware Language Switcher**: Enhanced language switcher to only display available language variants for each post

### Changed

* **Performance Optimization**: Optimized Core Web Vitals by adding `sizes` prop to hero images to prevent Cumulative Layout Shift (CLS)
* **Font Loading**: Added `display: "swap"` and `preload: true` to font configuration to minimize Flash of Unstyled Text (FOUT)
* **Image Optimization**: Enhanced Next.js image configuration with proper device sizes, image sizes, and cache TTL settings
* **Code Cleanup**: Removed unused UI components (`Badge`, `Button`) and unused CSS variables (sidebar, chart, popover) to reduce bundle size

### Fixed

* **Layout Shift**: Fixed potential layout shift issues by adding proper `sizes` attribute to all `next/image` components

## [1.4.2] - 2026-01-31

### Fixed

* **Sitemap XML Parsing Error**: Fixed XML parsing error (`xmlParseEntityRef: no name`) caused by unescaped `&` characters in category URLs. Category slugs with special characters (like `＆` in Japanese) are now properly URL-encoded using `encodeURIComponent`, ensuring valid XML output.
* **Double Encoding Issue**: Resolved double-encoding problem where category URLs were being encoded twice, resulting in `%25` instead of `%` in the sitemap.

### Changed

* **Sitemap Generation**: Refactored sitemap generation to properly URL-encode category slugs while maintaining consistency with `generateStaticParams` in category pages.
* **Category Slug Consistency**: Standardized category slug generation across sitemap, category pages, and homepage to use the same `createCategorySlug` helper function.

## [1.4.1] - 2026-01-30

### Fixed

* **Hydration Error**: Resolved React hydration mismatch in `LanguageSwitcher` component that was causing "Can't find variable: usePathname" errors
* **Server Errors**: Fixed 500 errors caused by corrupted Turbopack cache
* **Dev Server Conflicts**: Resolved issues with multiple Next.js dev servers running simultaneously

### Changed

* **Code Quality**: Refactored `LanguageSwitcher` to eliminate if statements, using functional patterns with ternary operators and logical operators
* **Error Handling**: Added ESLint disable comments with detailed explanations for legitimate React patterns

## [1.4.0] - 2026-01-29

### Added

* **Multilingual Support**: Added support for 3 language variants per post (English, Japanese, Arabic) with suffix-based routing (`-ja`, `-ar`).
* **Language Switcher**: New glassmorphism `LanguageSwitcher` component to toggle between languages on blog posts.
* **RTL Support**: Full Right-to-Left layout support for Arabic posts, including flipped icons and text alignment.
* **New Content**: Added "TypeScript Best Practices for Full-Stack Apps" in EN, AR, and JA.
* **Dynamic Categories**: Refactored `CategoryNav` to automatically generate categories based on available posts in the current language.
* **Cover Image**: Generated custom cover image for TypeScript post.

### Changed

* **Post Layout Spacing**: Significantly increased vertical spacing for `<h2>`, `<hr>`, and `<ol>` elements within blog posts for better readability.
* **MDX Rendering**: Updated `BlogPostTemplate` to explicitly pass custom components to `MDXRemote`, ensuring consistent styling.

### Fixed

* **Arabic Layout**: Resolved text alignment and direction issues for Arabic content (`dir="rtl"`).
* **Japanese Content Leakage**: Fixed issue where English posts (`desert-geometry.mdx`) were incorrectly tagged as "Art & Design" in Japanese views by standardizing naming conventions.

## [1.3.1] - 2026-01-14

### Added

* Reusable `BlogPostTemplate` component for consistent blog styling
* Automatic reading time calculation using `reading-time` package
* `formatDate` utility function for consistent date formatting
* Keyword research data structure (`keyword-research.ts`, gitignored)
* Content planning dashboard (development-only, gitignored)

### Changed

* Refactored blog post page to use `BlogPostTemplate` (123 lines → 38 lines)
* Blog posts now display reading time, category badges, and hero images
* Updated `.gitignore` to exclude private planning tools
* Updated project to Next.js 16 to sync with `package.json` version
* Refreshed tutorial content and images for Next.js 16

## [1.3.0] - 2026-01-13

### Added

* Google Analytics (GA4) integration with secure environment variable configuration
* Google AdSense setup with conditional loading
* Helper library (`src/lib/gtag.ts`) for type-safe analytics tracking
* Client-side `GoogleAnalytics` component for App Router compatibility
* Environment variable support (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_SITE_URL`)
* TypeScript declarations for gtag API

### Changed

* Updated blog tutorial from Next.js 14 to Next.js 15
* Switched primary font from Geist to Outfit for improved readability
* Enhanced blog post typography with larger headings (H1: 48px, H2: 36px with borders)
* Improved spacing and visual hierarchy in blog content
* Refactored analytics implementation to use dedicated components
* Updated cover image for tutorial post

### Security

* Removed hardcoded API keys and tracking IDs from source code
* Implemented environment variable-based configuration for all sensitive data
* Ensured `.env.local` is properly gitignored

## [1.2.0] - 2026-01-10

### Added

* Professional services showcase on homepage (Software, Games, Translation)
* Trilingual tagline (日本語・English・العربية)
* Business-focused homepage aligned with NEO WHISPER business plan
* Back button on blog post pages
* Styled date badges on blog posts
* Improved blog post page with glassmorphism design
* AdSense component (ready for future activation)
* TODO.md for task tracking
* CHANGELOG.md for version tracking

### Changed

* Consolidated duplicate posts folders (`src/posts` → `src/content/posts`)
* Improved mobile responsiveness on blog post pages
* Enhanced glassmorphism UI throughout site

### Fixed

* Date display styling on blog cards
* Missing navigation between pages
* Post folder organization

## [1.1.0] - 2026-01-10

### Added

* Glassmorphism UI design
* Custom domain neowhisper.net with SSL
* Vercel deployment

## [1.0.0] - 2026-01-08

### Added

* Initial blog setup with Next.js 15
* MDX support for blog posts
* First blog posts (Welcome, Desert Geometry)

# ARCH-12 CSS 所有权完整映射

2026-11-17（北京时间），YAS-2026-0055。基线 `57b0a877a9a6bbd769fdb079c2c4ef71629e28e9`；ARCH-12 `current / 待人工验收`。仅迁移规则位置与拆分混合选择器，原声明、媒体条件、伪元素、关键帧和同选择器顺序由 `node tests/architecture/arch12-ownership.mjs` 逐项核对。此表行号是修改前源文件行号，紧凑源码同一行可对应多条规则。

ARCH-11 在原批准范围内已经归档；ARCH-12 是后续新增的展示层归属整改，不否定 ARCH-11 测试或验收。完整文件映射与自动验证见迁移计划 ARCH-12。

| 目标样式 | 实际使用方与职责 |
| --- | --- |
| `src/styles.css` | main：全站基础/共享展示及原其他页面样式 |
| `src/features/home/components/HomeView.css` | HomeView（含首页 CTA、精选、占位与动效） |
| `src/features/assistant/assistant.css` | XiaoYAssistant / AssistantMessages / ProfileSummary / AssistantProduct / SourceList；保留原未使用设置样式 |
| `src/features/makeup-plan/components/MakeupWorkbench.css` | MakeupWorkbench / MakeupPlanForm / PlanResult / PlanProduct |
| `src/features/app-shell/components/BrandOpening.css` | BrandOpening |

`xiaoy-spin` 同时供小Y和工作台使用，原名/定义不变，放在全局且只定义一次。原 xiaoy.css 的 980px 导航覆盖也归全局。全局仍含本次未授权迁移的资料库/收藏/指南/文化等既有样式；不将其谎称为全为通用选择器。所有混合规则按实际所有者拆开，未删除原无消费者的规则，未恢复设置/Key UI。

加载：main 先导入全局；组件按 visual CSS → 本组件 CSS 加载，使领域样式覆盖共享基础。FlexCarousel 仍懒加载且自行加载 CSS。前后 20 个状态的计算样式/相对几何对照及原 116 场景另行记录；静态声明守恒不能单独证明视觉一致。

| 原文件:行 | 媒体/上下文 | 原选择器（混合规则按归属拆分） | 目标文件 |
| --- | --- | --- | --- |
| `src/styles.css:1` | 顶层 | `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;600;700&display=swap')` | `src/styles.css` |
| `src/styles.css:3` | 顶层 | `:root` | `src/styles.css` |
| `src/styles.css:39` | 顶层 | `*` | `src/styles.css` |
| `src/styles.css:40` | 顶层 | `html` | `src/styles.css` |
| `src/styles.css:41` | 顶层 | `body` | `src/styles.css` |
| `src/styles.css:42` | 顶层 | `button, input, select` | `src/styles.css` |
| `src/styles.css:43` | 顶层 | `button` | `src/styles.css` |
| `src/styles.css:44` | 顶层 | `button:focus-visible, input:focus-visible, select:focus-visible` | `src/styles.css` |
| `src/styles.css:45` | 顶层 | `button, input, select` | `src/styles.css` |
| `src/styles.css:47` | 顶层 | `.app-shell` | `src/styles.css` |
| `src/styles.css:48` | 顶层 | `.content-section` | `src/styles.css` |
| `src/styles.css:49` | 顶层 | `.eyebrow` | `src/styles.css` |
| `src/styles.css:50` | 顶层 | `h1, h2, h3, p` | `src/styles.css` |
| `src/styles.css:51` | 顶层 | `h1, h2` | `src/styles.css` |
| `src/styles.css:53` | 顶层 | `.site-header` | `src/styles.css` |
| `src/styles.css:54` | 顶层 | `.header-inner` | `src/styles.css` |
| `src/styles.css:55` | 顶层 | `.brand` | `src/styles.css` |
| `src/styles.css:56` | 顶层 | `.brand-wordmark-image` | `src/styles.css` |
| `src/styles.css:57` | 顶层 | `.brand-library` | `src/styles.css` |
| `src/styles.css:58` | 顶层 | `.brand-mark` | `src/styles.css` |
| `src/styles.css:59` | 顶层 | `.desktop-nav` | `src/styles.css` |
| `src/styles.css:60` | 顶层 | `.nav-link` | `src/styles.css` |
| `src/styles.css:61` | 顶层 | `.nav-link::after` | `src/styles.css` |
| `src/styles.css:62` | 顶层 | `.nav-link.active, .nav-link:hover` | `src/styles.css` |
| `src/styles.css:63` | 顶层 | `.nav-link.active::after` | `src/styles.css` |
| `src/styles.css:64` | 顶层 | `.nav-count` | `src/styles.css` |
| `src/styles.css:65` | 顶层 | `.mobile-menu-button, .mobile-nav` | `src/styles.css` |
| `src/styles.css:67` | 顶层 | `.brand-opening` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:68` | 顶层 | `.brand-opening.closing` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:69` | 顶层 | `.brand-opening.skip-closing` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:70` | 顶层 | `.brand-opening.fade-out::before, .brand-opening.fade-out::after, .brand-opening.fade-out .opening-atmosphere, .brand-opening.fade-out .opening-brand, .brand-opening.fade-out .brand-opening-caption, .brand-opening.fade-out .brand-opening-skip` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:71` | 顶层 | `.brand-opening::before, .brand-opening::after` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:72` | 顶层 | `.brand-opening::before` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:73` | 顶层 | `.brand-opening::after` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:74` | 顶层 | `.brand-opening.closing::before, .brand-opening.closing::after` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:75` | 顶层 | `.brand-opening.skip-closing::before, .brand-opening.skip-closing::after` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:76` | 顶层 | `.opening-atmosphere` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:77` | 顶层 | `.brand-opening.closing .opening-atmosphere, .brand-opening.closing .opening-brand, .brand-opening.closing .brand-opening-caption, .brand-opening.closing .brand-opening-skip` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:78` | 顶层 | `.brand-opening.skip-closing .opening-atmosphere` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:79` | 顶层 | `.opening-powder-cloud` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:80` | 顶层 | `.opening-powder-dots` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:81` | 顶层 | `.opening-petal` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:82` | 顶层 | `.opening-petal-left` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:83` | 顶层 | `.opening-petal-right` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:84` | 顶层 | `.opening-particles` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:85` | 顶层 | `.opening-particle` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:86` | 顶层 | `.opening-sparkles` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:87` | 顶层 | `.opening-sparkle` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:88` | 顶层 | `.opening-glints` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:89` | 顶层 | `.opening-glint` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:90` | 顶层 | `.opening-brand` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:91` | 顶层 | `.brand-opening.skip-closing .opening-brand` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:92` | 顶层 | `.opening-wordmark` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:93` | 顶层 | `.opening-wordmark::after` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:94` | 顶层 | `.opening-wordmark-pretty` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:95` | 顶层 | `.opening-wordmark-pretty::after` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:96` | 顶层 | `.opening-wordmark-sparkle` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:97` | 顶层 | `.opening-wordmark-sparkle-left` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:98` | 顶层 | `.opening-wordmark-sparkle-right` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:99` | 顶层 | `.opening-tagline` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:100` | 顶层 | `.opening-monogram` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:101` | 顶层 | `.brand-opening-caption` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:102` | 顶层 | `.brand-opening.skip-closing .brand-opening-caption, .brand-opening.skip-closing .brand-opening-skip` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:103` | 顶层 | `.brand-opening-skip` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:104` | 顶层 | `.brand-opening-skip:hover` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:105` | 顶层 | `@keyframes opening-fade-in` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:106` | 顶层 | `@keyframes opening-fade-out` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:107` | 顶层 | `@keyframes opening-mist-sheet` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:108` | 顶层 | `@keyframes opening-mist-dissolve` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:109` | 顶层 | `@keyframes opening-powder-rise` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:110` | 顶层 | `@keyframes opening-dots-rise` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:111` | 顶层 | `@keyframes opening-particle-rise` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:112` | 顶层 | `@keyframes opening-puff-arrive` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:113` | 顶层 | `@keyframes opening-petal-drift` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:114` | 顶层 | `@keyframes opening-sparkle-twinkle` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:115` | 顶层 | `@keyframes opening-glint-twinkle` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:116` | 顶层 | `@keyframes opening-wordmark-sparkle` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:117` | 顶层 | `@keyframes opening-pretty-glint` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:118` | 顶层 | `@keyframes opening-wordmark-in` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:119` | 顶层 | `@keyframes opening-tagline-in` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:120` | 顶层 | `@keyframes opening-monogram-in` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:121` | 顶层 | `@keyframes opening-fade` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:123` | 顶层 | `.home-motion-stage` | `src/features/home/components/HomeView.css` |
| `src/styles.css:124` | 顶层 | `.home-motion-stage.is-ready` | `src/features/home/components/HomeView.css` |
| `src/styles.css:125` | 顶层 | `.home-motion-stage.is-ready > *` | `src/features/home/components/HomeView.css` |
| `src/styles.css:126` | 顶层 | `.home-motion-stage.is-ready > :nth-child(2)` | `src/features/home/components/HomeView.css` |
| `src/styles.css:127` | 顶层 | `.home-motion-stage.is-ready > :nth-child(3)` | `src/features/home/components/HomeView.css` |
| `src/styles.css:128` | 顶层 | `.home-motion-stage.is-ready > :nth-child(4)` | `src/features/home/components/HomeView.css` |
| `src/styles.css:129` | 顶层 | `@keyframes home-stage-slide-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:130` | 顶层 | `@keyframes home-section-slide-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:131` | 顶层 | `.home-hero` | `src/features/home/components/HomeView.css` |
| `src/styles.css:132` | 顶层 | `.home-hero--ready` | `src/features/home/components/HomeView.css` |
| `src/styles.css:133` | 顶层 | `.home-hero--ready .hero-copy` | `src/features/home/components/HomeView.css` |
| `src/styles.css:134` | 顶层 | `.home-hero--ready .hero-media::after` | `src/features/home/components/HomeView.css` |
| `src/styles.css:135` | 顶层 | `.hero-media` | `src/features/home/components/HomeView.css` |
| `src/styles.css:135` | 顶层 | `.hero-media::after` | `src/features/home/components/HomeView.css` |
| `src/styles.css:135` | 顶层 | `.hero-media picture, .hero-media img` | `src/features/home/components/HomeView.css` |
| `src/styles.css:135` | 顶层 | `.hero-media img` | `src/features/home/components/HomeView.css` |
| `src/styles.css:135` | 顶层 | `.hero-caption` | `src/features/home/components/HomeView.css` |
| `src/styles.css:135` | 顶层 | `.hero-caption i` | `src/features/home/components/HomeView.css` |
| `src/styles.css:136` | 顶层 | `.makeup-table-intro-section` | `src/features/home/components/HomeView.css` |
| `src/styles.css:137` | 顶层 | `.makeup-table-intro-title` | `src/features/home/components/HomeView.css` |
| `src/styles.css:138` | 顶层 | `.makeup-table-intro-text, .featured-heading-text, .hero-slogan-text` | `src/features/home/components/HomeView.css` |
| `src/styles.css:139` | 顶层 | `.makeup-table-intro-section > p` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy .eyebrow` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy--ready .hero-motion-control` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy--ready .assistant-entry-button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy--ready .hero-search` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy--ready .quick-links` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-media--ready img` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-media--ready .hero-caption` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-eyebrow-text` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy .scroll-float` | `src/features/home/components/HomeView.css` |
| `src/styles.css:140` | 顶层 | `.hero-copy .hero-motion-text` | `src/features/home/components/HomeView.css` |
| `src/styles.css:141` | 顶层 | `@keyframes hero-shell-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:142` | 顶层 | `@keyframes hero-copy-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:143` | 顶层 | `@keyframes hero-media-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:144` | 顶层 | `@keyframes hero-media-drift` | `src/features/home/components/HomeView.css` |
| `src/styles.css:145` | 顶层 | `@keyframes hero-wash-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:146` | 顶层 | `@keyframes hero-control-in` | `src/features/home/components/HomeView.css` |
| `src/styles.css:147` | 顶层 | `.hero-kicker` | `src/features/home/components/HomeView.css` |
| `src/styles.css:147` | 顶层 | `.hero-copy .eyebrow` | `src/features/home/components/HomeView.css` |
| `src/styles.css:147` | 顶层 | `.hero-copy h1, .hero-slogan` | `src/features/home/components/HomeView.css` |
| `src/styles.css:148` | 顶层 | `.hero-description` | `src/features/home/components/HomeView.css` |
| `src/styles.css:149` | 顶层 | `.hero-search` | `src/features/home/components/HomeView.css` |
| `src/styles.css:150` | 顶层 | `.hero-search svg` | `src/features/home/components/HomeView.css` |
| `src/styles.css:151` | 顶层 | `.hero-search input` | `src/features/home/components/HomeView.css` |
| `src/styles.css:152` | 顶层 | `.library-search input::placeholder` | `src/styles.css` |
| `src/styles.css:152` | 顶层 | `.hero-search input::placeholder` | `src/features/home/components/HomeView.css` |
| `src/styles.css:153` | 顶层 | `.hero-search button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:154` | 顶层 | `.hero-copy .assistant-entry-button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:154` | 顶层 | `.hero-copy .hero-search` | `src/features/home/components/HomeView.css` |
| `src/styles.css:154` | 顶层 | `.quick-links` | `src/features/home/components/HomeView.css` |
| `src/styles.css:155` | 顶层 | `.quick-links button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:156` | 顶层 | `.quick-links button:hover` | `src/features/home/components/HomeView.css` |
| `src/styles.css:158` | 顶层 | `.home-selection` | `src/features/home/components/HomeView.css` |
| `src/styles.css:159` | 顶层 | `.section-heading` | `src/features/home/components/HomeView.css` |
| `src/styles.css:160` | 顶层 | `.section-heading h2, .featured-heading` | `src/features/home/components/HomeView.css` |
| `src/styles.css:161` | 顶层 | `.home-selection .flex-carousel` | `src/features/home/components/HomeView.css` |
| `src/styles.css:162` | 顶层 | `.open-link` | `src/styles.css` |
| `src/styles.css:162` | 顶层 | `.text-action` | `src/features/home/components/HomeView.css` |
| `src/styles.css:163` | 顶层 | `.open-link:hover` | `src/styles.css` |
| `src/styles.css:163` | 顶层 | `.text-action:hover` | `src/features/home/components/HomeView.css` |
| `src/styles.css:164` | 顶层 | `.product-grid` | `src/styles.css` |
| `src/styles.css:165` | 顶层 | `.featured-grid` | `src/features/home/components/HomeView.css` |
| `src/styles.css:166` | 顶层 | `.product-card` | `src/styles.css` |
| `src/styles.css:167` | 顶层 | `.product-card:hover` | `src/styles.css` |
| `src/styles.css:168` | 顶层 | `.product-photo` | `src/styles.css` |
| `src/styles.css:169` | 顶层 | `.product-photo img` | `src/styles.css` |
| `src/styles.css:170` | 顶层 | `.product-photo-fallback` | `src/styles.css` |
| `src/styles.css:171` | 顶层 | `.product-card:hover .product-photo img` | `src/styles.css` |
| `src/styles.css:172` | 顶层 | `.category-stamp` | `src/styles.css` |
| `src/styles.css:173` | 顶层 | `.verification-stamp` | `src/styles.css` |
| `src/styles.css:174` | 顶层 | `.product-card-body` | `src/styles.css` |
| `src/styles.css:175` | 顶层 | `.product-card-top` | `src/styles.css` |
| `src/styles.css:176` | 顶层 | `.product-brand` | `src/styles.css` |
| `src/styles.css:177` | 顶层 | `.favorite-button` | `src/styles.css` |
| `src/styles.css:178` | 顶层 | `.favorite-button:hover, .favorite-button.saved` | `src/styles.css` |
| `src/styles.css:179` | 顶层 | `.product-name, .favorite-name` | `src/styles.css` |
| `src/styles.css:180` | 顶层 | `.product-name:hover, .favorite-name:hover` | `src/styles.css` |
| `src/styles.css:181` | 顶层 | `.shade-line` | `src/styles.css` |
| `src/styles.css:182` | 顶层 | `.shade-dot` | `src/styles.css` |
| `src/styles.css:183` | 顶层 | `.tag-row` | `src/styles.css` |
| `src/styles.css:184` | 顶层 | `.tag-row span` | `src/styles.css` |
| `src/styles.css:185` | 顶层 | `.tag-row span:nth-child(2)` | `src/styles.css` |
| `src/styles.css:186` | 顶层 | `.product-note` | `src/styles.css` |
| `src/styles.css:187` | 顶层 | `.rating-row` | `src/styles.css` |
| `src/styles.css:188` | 顶层 | `.rating-row > span` | `src/styles.css` |
| `src/styles.css:189` | 顶层 | `.rating-row > span svg` | `src/styles.css` |
| `src/styles.css:190` | 顶层 | `.rating-row button` | `src/styles.css` |
| `src/styles.css:191` | 顶层 | `.rating-row button:hover` | `src/styles.css` |
| `src/styles.css:193` | 顶层 | `.story-closing` | `src/features/home/components/HomeView.css` |
| `src/styles.css:194` | 顶层 | `.story-closing-text` | `src/features/home/components/HomeView.css` |
| `src/styles.css:196` | 顶层 | `.library-page` | `src/styles.css` |
| `src/styles.css:197` | 顶层 | `.library-heading` | `src/styles.css` |
| `src/styles.css:198` | 顶层 | `.library-heading h1, .favorites-heading h1, .guide-intro h1` | `src/styles.css` |
| `src/styles.css:199` | 顶层 | `.library-search` | `src/styles.css` |
| `src/styles.css:200` | 顶层 | `.library-search input` | `src/styles.css` |
| `src/styles.css:201` | 顶层 | `.library-layout` | `src/styles.css` |
| `src/styles.css:202` | 顶层 | `.filter-panel` | `src/styles.css` |
| `src/styles.css:203` | 顶层 | `.filter-title` | `src/styles.css` |
| `src/styles.css:204` | 顶层 | `.filter-title > div` | `src/styles.css` |
| `src/styles.css:205` | 顶层 | `.clear-button` | `src/styles.css` |
| `src/styles.css:206` | 顶层 | `.filter-close` | `src/styles.css` |
| `src/styles.css:207` | 顶层 | `.filter-group` | `src/styles.css` |
| `src/styles.css:208` | 顶层 | `.filter-group p` | `src/styles.css` |
| `src/styles.css:209` | 顶层 | `.filter-chips` | `src/styles.css` |
| `src/styles.css:210` | 顶层 | `.filter-chips button, .price-options button` | `src/styles.css` |
| `src/styles.css:211` | 顶层 | `.filter-chips button:hover, .filter-chips button.selected, .price-options button:hover, .price-options button.selected` | `src/styles.css` |
| `src/styles.css:212` | 顶层 | `.segmented-control` | `src/styles.css` |
| `src/styles.css:213` | 顶层 | `.segmented-control button` | `src/styles.css` |
| `src/styles.css:214` | 顶层 | `.segmented-control button:last-child` | `src/styles.css` |
| `src/styles.css:215` | 顶层 | `.segmented-control button.selected` | `src/styles.css` |
| `src/styles.css:216` | 顶层 | `.price-options` | `src/styles.css` |
| `src/styles.css:217` | 顶层 | `.library-results` | `src/styles.css` |
| `src/styles.css:218` | 顶层 | `.results-toolbar` | `src/styles.css` |
| `src/styles.css:219` | 顶层 | `.results-toolbar p` | `src/styles.css` |
| `src/styles.css:220` | 顶层 | `.results-toolbar strong` | `src/styles.css` |
| `src/styles.css:221` | 顶层 | `.sort-select` | `src/styles.css` |
| `src/styles.css:222` | 顶层 | `.sort-select select` | `src/styles.css` |
| `src/styles.css:223` | 顶层 | `.sort-select > svg:last-child` | `src/styles.css` |
| `src/styles.css:224` | 顶层 | `.library-controls-mobile` | `src/styles.css` |
| `src/styles.css:225` | 顶层 | `.empty-results, .empty-favorites` | `src/styles.css` |
| `src/styles.css:226` | 顶层 | `.empty-results svg, .empty-favorites > svg` | `src/styles.css` |
| `src/styles.css:227` | 顶层 | `.empty-results h2, .empty-favorites h2` | `src/styles.css` |
| `src/styles.css:228` | 顶层 | `.empty-results p, .empty-favorites p` | `src/styles.css` |
| `src/styles.css:230` | 顶层 | `.favorites-page` | `src/styles.css` |
| `src/styles.css:231` | 顶层 | `.favorites-heading` | `src/styles.css` |
| `src/styles.css:232` | 顶层 | `.favorites-heading > div > p:last-child` | `src/styles.css` |
| `src/styles.css:233` | 顶层 | `.favorites-count` | `src/styles.css` |
| `src/styles.css:234` | 顶层 | `.favorite-list` | `src/styles.css` |
| `src/styles.css:235` | 顶层 | `.favorite-item` | `src/styles.css` |
| `src/styles.css:236` | 顶层 | `.favorite-image` | `src/styles.css` |
| `src/styles.css:237` | 顶层 | `.favorite-image img` | `src/styles.css` |
| `src/styles.css:238` | 顶层 | `.favorite-content` | `src/styles.css` |
| `src/styles.css:239` | 顶层 | `.favorite-name` | `src/styles.css` |
| `src/styles.css:240` | 顶层 | `.favorite-content > p:not(.product-brand)` | `src/styles.css` |
| `src/styles.css:241` | 顶层 | `.favorite-bottom` | `src/styles.css` |
| `src/styles.css:242` | 顶层 | `.empty-favorites` | `src/styles.css` |
| `src/styles.css:244` | 顶层 | `.primary-action, .icon-text-button` | `src/styles.css` |
| `src/styles.css:245` | 顶层 | `.primary-action:hover` | `src/styles.css` |
| `src/styles.css:246` | 顶层 | `.icon-text-button` | `src/styles.css` |
| `src/styles.css:247` | 顶层 | `.status-control` | `src/styles.css` |
| `src/styles.css:248` | 顶层 | `.saved-status` | `src/styles.css` |
| `src/styles.css:249` | 顶层 | `.status-select` | `src/styles.css` |
| `src/styles.css:250` | 顶层 | `.status-select select` | `src/styles.css` |
| `src/styles.css:251` | 顶层 | `.status-select svg` | `src/styles.css` |
| `src/styles.css:253` | 顶层 | `.guide-page` | `src/styles.css` |
| `src/styles.css:254` | 顶层 | `.guide-intro` | `src/styles.css` |
| `src/styles.css:255` | 顶层 | `.guide-intro h1` | `src/styles.css` |
| `src/styles.css:256` | 顶层 | `.guide-intro > p:last-child` | `src/styles.css` |
| `src/styles.css:257` | 顶层 | `.guide-list` | `src/styles.css` |
| `src/styles.css:258` | 顶层 | `.guide-card` | `src/styles.css` |
| `src/styles.css:259` | 顶层 | `.guide-card:nth-child(1)` | `src/styles.css` |
| `src/styles.css:259` | 顶层 | `.guide-card:nth-child(2)` | `src/styles.css` |
| `src/styles.css:259` | 顶层 | `.guide-card:nth-child(3)` | `src/styles.css` |
| `src/styles.css:260` | 顶层 | `.guide-card > span` | `src/styles.css` |
| `src/styles.css:261` | 顶层 | `.guide-card h2` | `src/styles.css` |
| `src/styles.css:262` | 顶层 | `.guide-card p` | `src/styles.css` |
| `src/styles.css:263` | 顶层 | `.guide-card div` | `src/styles.css` |
| `src/styles.css:264` | 顶层 | `.guide-card i` | `src/styles.css` |
| `src/styles.css:265` | 顶层 | `.guide-card button` | `src/styles.css` |
| `src/styles.css:267` | 顶层 | `.culture-page` | `src/styles.css` |
| `src/styles.css:268` | 顶层 | `.culture-lead` | `src/styles.css` |
| `src/styles.css:269` | 顶层 | `.culture-mark-panel` | `src/styles.css` |
| `src/styles.css:269` | 顶层 | `.culture-mark-panel img` | `src/styles.css` |
| `src/styles.css:269` | 顶层 | `.culture-mark-panel span` | `src/styles.css` |
| `src/styles.css:270` | 顶层 | `.culture-name` | `src/styles.css` |
| `src/styles.css:271` | 顶层 | `.culture-lead h1` | `src/styles.css` |
| `src/styles.css:272` | 顶层 | `.culture-lead > div > p:last-child` | `src/styles.css` |
| `src/styles.css:273` | 顶层 | `.culture-statement` | `src/styles.css` |
| `src/styles.css:274` | 顶层 | `.culture-statement span` | `src/styles.css` |
| `src/styles.css:274` | 顶层 | `.culture-statement p` | `src/styles.css` |
| `src/styles.css:275` | 顶层 | `.culture-principles` | `src/styles.css` |
| `src/styles.css:275` | 顶层 | `.culture-principles article` | `src/styles.css` |
| `src/styles.css:275` | 顶层 | `.culture-principles article:nth-child(2)` | `src/styles.css` |
| `src/styles.css:275` | 顶层 | `.culture-principles article:nth-child(3)` | `src/styles.css` |
| `src/styles.css:275` | 顶层 | `.culture-principles h2` | `src/styles.css` |
| `src/styles.css:275` | 顶层 | `.culture-principles p` | `src/styles.css` |
| `src/styles.css:276` | 顶层 | `.culture-closing` | `src/styles.css` |
| `src/styles.css:276` | 顶层 | `.culture-closing h2` | `src/styles.css` |
| `src/styles.css:276` | 顶层 | `.culture-closing p:last-child` | `src/styles.css` |
| `src/styles.css:278` | 顶层 | `.dialog-backdrop` | `src/styles.css` |
| `src/styles.css:279` | 顶层 | `.detail-drawer` | `src/styles.css` |
| `src/styles.css:280` | 顶层 | `@keyframes drawer-in` | `src/styles.css` |
| `src/styles.css:281` | 顶层 | `.dialog-close` | `src/styles.css` |
| `src/styles.css:282` | 顶层 | `.drawer-back-button` | `src/styles.css` |
| `src/styles.css:283` | 顶层 | `.detail-hero` | `src/styles.css` |
| `src/styles.css:284` | 顶层 | `.detail-hero > img` | `src/styles.css` |
| `src/styles.css:285` | 顶层 | `.detail-hero-info` | `src/styles.css` |
| `src/styles.css:286` | 顶层 | `.detail-hero-info h2` | `src/styles.css` |
| `src/styles.css:287` | 顶层 | `.detail-rating` | `src/styles.css` |
| `src/styles.css:288` | 顶层 | `.detail-rating span` | `src/styles.css` |
| `src/styles.css:289` | 顶层 | `.detail-hero-info > p:last-of-type` | `src/styles.css` |
| `src/styles.css:290` | 顶层 | `.detail-body` | `src/styles.css` |
| `src/styles.css:291` | 顶层 | `.detail-section` | `src/styles.css` |
| `src/styles.css:292` | 顶层 | `.detail-section h3` | `src/styles.css` |
| `src/styles.css:293` | 顶层 | `.facts-grid` | `src/styles.css` |
| `src/styles.css:294` | 顶层 | `.facts-grid div` | `src/styles.css` |
| `src/styles.css:294` | 顶层 | `.facts-grid dt` | `src/styles.css` |
| `src/styles.css:294` | 顶层 | `.facts-grid dd` | `src/styles.css` |
| `src/styles.css:295` | 顶层 | `.data-verification-note` | `src/styles.css` |
| `src/styles.css:296` | 顶层 | `.shade-list` | `src/styles.css` |
| `src/styles.css:297` | 顶层 | `.shade-choice` | `src/styles.css` |
| `src/styles.css:298` | 顶层 | `.shade-choice.selected` | `src/styles.css` |
| `src/styles.css:299` | 顶层 | `.shade-swatch` | `src/styles.css` |
| `src/styles.css:299` | 顶层 | `.shade-1` | `src/styles.css` |
| `src/styles.css:299` | 顶层 | `.shade-2` | `src/styles.css` |
| `src/styles.css:299` | 顶层 | `.shade-3` | `src/styles.css` |
| `src/styles.css:300` | 顶层 | `.shade-description` | `src/styles.css` |
| `src/styles.css:300` | 顶层 | `.shade-description span` | `src/styles.css` |
| `src/styles.css:301` | 顶层 | `.metric-grid` | `src/styles.css` |
| `src/styles.css:302` | 顶层 | `.metric > div:first-child` | `src/styles.css` |
| `src/styles.css:302` | 顶层 | `.metric b` | `src/styles.css` |
| `src/styles.css:302` | 顶层 | `.metric-track` | `src/styles.css` |
| `src/styles.css:302` | 顶层 | `.metric-track i` | `src/styles.css` |
| `src/styles.css:302` | 顶层 | `.metric-track i.filled` | `src/styles.css` |
| `src/styles.css:303` | 顶层 | `.two-columns` | `src/styles.css` |
| `src/styles.css:303` | 顶层 | `.two-columns > div + div` | `src/styles.css` |
| `src/styles.css:303` | 顶层 | `.detail-list` | `src/styles.css` |
| `src/styles.css:303` | 顶层 | `.detail-list li` | `src/styles.css` |
| `src/styles.css:303` | 顶层 | `.detail-list li svg` | `src/styles.css` |
| `src/styles.css:303` | 顶层 | `.caution-list li span` | `src/styles.css` |
| `src/styles.css:304` | 顶层 | `.source-list + .source-list` | `src/styles.css` |
| `src/styles.css:304` | 顶层 | `.source-list li` | `src/styles.css` |
| `src/styles.css:304` | 顶层 | `.source-list li a` | `src/styles.css` |
| `src/styles.css:304` | 顶层 | `.source-list li small` | `src/styles.css` |
| `src/styles.css:304` | 顶层 | `.source-contact-link` | `src/styles.css` |
| `src/styles.css:305` | 顶层 | `.scene-row` | `src/styles.css` |
| `src/styles.css:305` | 顶层 | `.scene-row span` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.detail-section-title` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.detail-section-title span` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list button` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list button:hover` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list img` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list span` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list b` | `src/styles.css` |
| `src/styles.css:306` | 顶层 | `.recommendation-list small` | `src/styles.css` |
| `src/styles.css:307` | 顶层 | `.full-profile-action` | `src/styles.css` |
| `src/styles.css:309` | 顶层 | `.product-profile-page` | `src/styles.css` |
| `src/styles.css:310` | 顶层 | `.product-profile-toolbar` | `src/styles.css` |
| `src/styles.css:311` | 顶层 | `.product-profile-toolbar > span` | `src/styles.css` |
| `src/styles.css:312` | 顶层 | `.profile-back-button` | `src/styles.css` |
| `src/styles.css:313` | 顶层 | `.product-profile-hero` | `src/styles.css` |
| `src/styles.css:314` | 顶层 | `.product-profile-media` | `src/styles.css` |
| `src/styles.css:315` | 顶层 | `.product-profile-media img` | `src/styles.css` |
| `src/styles.css:316` | 顶层 | `.product-profile-heading` | `src/styles.css` |
| `src/styles.css:317` | 顶层 | `.product-profile-heading h1` | `src/styles.css` |
| `src/styles.css:318` | 顶层 | `.profile-summary` | `src/styles.css` |
| `src/styles.css:319` | 顶层 | `.profile-status-row` | `src/styles.css` |
| `src/styles.css:320` | 顶层 | `.status-pill` | `src/styles.css` |
| `src/styles.css:321` | 顶层 | `.status-pill.recorded` | `src/styles.css` |
| `src/styles.css:322` | 顶层 | `.status-pill.pending` | `src/styles.css` |
| `src/styles.css:323` | 顶层 | `.product-profile-content` | `src/styles.css` |
| `src/styles.css:324` | 顶层 | `.profile-section` | `src/styles.css` |
| `src/styles.css:325` | 顶层 | `.profile-section-heading` | `src/styles.css` |
| `src/styles.css:326` | 顶层 | `.profile-section-heading h2` | `src/styles.css` |
| `src/styles.css:327` | 顶层 | `.profile-section-heading > svg` | `src/styles.css` |
| `src/styles.css:328` | 顶层 | `.profile-section-heading > span` | `src/styles.css` |
| `src/styles.css:329` | 顶层 | `.profile-section-note` | `src/styles.css` |
| `src/styles.css:330` | 顶层 | `.commerce-section` | `src/styles.css` |
| `src/styles.css:331` | 顶层 | `.commerce-ready, .commerce-pending` | `src/styles.css` |
| `src/styles.css:332` | 顶层 | `.commerce-ready strong, .commerce-pending strong` | `src/styles.css` |
| `src/styles.css:333` | 顶层 | `.commerce-ready p, .commerce-pending p` | `src/styles.css` |
| `src/styles.css:334` | 顶层 | `.commerce-ready .commerce-title` | `src/styles.css` |
| `src/styles.css:335` | 顶层 | `.commerce-pending > span` | `src/styles.css` |
| `src/styles.css:336` | 顶层 | `.official-product-link` | `src/styles.css` |
| `src/styles.css:337` | 顶层 | `.parameter-table` | `src/styles.css` |
| `src/styles.css:338` | 顶层 | `.parameter-table > div` | `src/styles.css` |
| `src/styles.css:339` | 顶层 | `.parameter-table dt` | `src/styles.css` |
| `src/styles.css:340` | 顶层 | `.parameter-table dd` | `src/styles.css` |
| `src/styles.css:341` | 顶层 | `.parameter-status` | `src/styles.css` |
| `src/styles.css:342` | 顶层 | `.parameter-status.recorded` | `src/styles.css` |
| `src/styles.css:343` | 顶层 | `.parameter-status.pending` | `src/styles.css` |
| `src/styles.css:344` | 顶层 | `.assessment-grid` | `src/styles.css` |
| `src/styles.css:345` | 顶层 | `.assessment-grid > div` | `src/styles.css` |
| `src/styles.css:346` | 顶层 | `.assessment-grid > div + div` | `src/styles.css` |
| `src/styles.css:347` | 顶层 | `.assessment-grid > div:last-child` | `src/styles.css` |
| `src/styles.css:348` | 顶层 | `.assessment-grid span` | `src/styles.css` |
| `src/styles.css:349` | 顶层 | `.assessment-grid strong` | `src/styles.css` |
| `src/styles.css:350` | 顶层 | `.assessment-grid small` | `src/styles.css` |
| `src/styles.css:351` | 顶层 | `.assessment-columns` | `src/styles.css` |
| `src/styles.css:352` | 顶层 | `.assessment-columns > div + div` | `src/styles.css` |
| `src/styles.css:353` | 顶层 | `.assessment-columns h3, .evidence-group h3, .verification-issues h3, .auxiliary-sources h3` | `src/styles.css` |
| `src/styles.css:354` | 顶层 | `.assessment-columns ul, .verification-issues ul, .auxiliary-sources ul` | `src/styles.css` |
| `src/styles.css:355` | 顶层 | `.assessment-columns li` | `src/styles.css` |
| `src/styles.css:356` | 顶层 | `.assessment-columns li svg` | `src/styles.css` |
| `src/styles.css:357` | 顶层 | `.assessment-columns li span` | `src/styles.css` |
| `src/styles.css:358` | 顶层 | `.evidence-groups` | `src/styles.css` |
| `src/styles.css:359` | 顶层 | `.evidence-grid` | `src/styles.css` |
| `src/styles.css:360` | 顶层 | `.evidence-item` | `src/styles.css` |
| `src/styles.css:361` | 顶层 | `.evidence-item img` | `src/styles.css` |
| `src/styles.css:362` | 顶层 | `.evidence-item > span` | `src/styles.css` |
| `src/styles.css:363` | 顶层 | `.evidence-item strong` | `src/styles.css` |
| `src/styles.css:364` | 顶层 | `.evidence-item small` | `src/styles.css` |
| `src/styles.css:365` | 顶层 | `.evidence-item > svg` | `src/styles.css` |
| `src/styles.css:366` | 顶层 | `.evidence-empty` | `src/styles.css` |
| `src/styles.css:367` | 顶层 | `.business-evidence-row` | `src/styles.css` |
| `src/styles.css:368` | 顶层 | `.business-evidence-row span` | `src/styles.css` |
| `src/styles.css:369` | 顶层 | `.business-evidence-row strong` | `src/styles.css` |
| `src/styles.css:370` | 顶层 | `.business-evidence-row small` | `src/styles.css` |
| `src/styles.css:371` | 顶层 | `.verification-issues` | `src/styles.css` |
| `src/styles.css:372` | 顶层 | `.verification-issues li` | `src/styles.css` |
| `src/styles.css:373` | 顶层 | `.auxiliary-sources` | `src/styles.css` |
| `src/styles.css:374` | 顶层 | `.auxiliary-sources li` | `src/styles.css` |
| `src/styles.css:375` | 顶层 | `.auxiliary-sources a` | `src/styles.css` |
| `src/styles.css:376` | 顶层 | `.auxiliary-sources span` | `src/styles.css` |
| `src/styles.css:377` | 顶层 | `.profile-source-notice` | `src/styles.css` |
| `src/styles.css:379` | 顶层 | `.site-footer` | `src/styles.css` |
| `src/styles.css:379` | 顶层 | `.site-footer > div` | `src/styles.css` |
| `src/styles.css:379` | 顶层 | `.footer-wordmark-image` | `src/styles.css` |
| `src/styles.css:379` | 顶层 | `.site-footer p` | `src/styles.css` |
| `src/styles.css:379` | 顶层 | `.site-footer .source-contact-link` | `src/styles.css` |
| `src/styles.css:382` | `@media (max-width: 1100px)` | `.content-section, .header-inner` | `src/styles.css` |
| `src/styles.css:382` | `@media (max-width: 1100px)` | `.home-hero, .story-closing` | `src/features/home/components/HomeView.css` |
| `src/styles.css:383` | `@media (max-width: 1100px)` | `.home-hero` | `src/features/home/components/HomeView.css` |
| `src/styles.css:383` | `@media (max-width: 1100px)` | `.hero-copy` | `src/features/home/components/HomeView.css` |
| `src/styles.css:383` | `@media (max-width: 1100px)` | `.hero-caption` | `src/features/home/components/HomeView.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.product-grid` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.library-layout` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.favorite-list` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.guide-list` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.guide-card` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.guide-card p` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.culture-principles` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.site-footer` | `src/styles.css` |
| `src/styles.css:384` | `@media (max-width: 1100px)` | `.featured-grid` | `src/features/home/components/HomeView.css` |
| `src/styles.css:385` | `@media (max-width: 1100px)` | `.culture-statement p` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.product-profile-toolbar, .product-profile-content` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.product-profile-hero` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.product-profile-heading` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.product-profile-heading h1` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.assessment-grid` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.assessment-grid > div:nth-child(2)` | `src/styles.css` |
| `src/styles.css:386` | `@media (max-width: 1100px)` | `.assessment-grid > div:nth-child(-n+2)` | `src/styles.css` |
| `src/styles.css:390` | `@media (max-width: 680px)` | `.content-section, .header-inner` | `src/styles.css` |
| `src/styles.css:390` | `@media (max-width: 680px)` | `.home-hero, .story-closing` | `src/features/home/components/HomeView.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.site-header` | `src/styles.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.header-inner` | `src/styles.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.desktop-nav` | `src/styles.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.mobile-menu-button` | `src/styles.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.mobile-nav` | `src/styles.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.mobile-nav button` | `src/styles.css` |
| `src/styles.css:391` | `@media (max-width: 680px)` | `.mobile-nav button.active` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.product-grid` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.product-photo` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.product-card-body` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.product-name` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.product-note` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.tag-row` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.tag-row span` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.shade-line` | `src/styles.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.makeup-table-intro-section` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.makeup-table-intro-title` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.home-hero` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-copy` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-kicker` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-copy h1, .hero-slogan` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-description` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-search` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-search button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.quick-links` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.quick-links button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-caption` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.hero-caption i` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.home-selection` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.section-heading` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.section-heading h2, .featured-heading` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.text-action` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.featured-grid` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.story-closing` | `src/features/home/components/HomeView.css` |
| `src/styles.css:392` | `@media (max-width: 680px)` | `.story-closing-text` | `src/features/home/components/HomeView.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-page, .favorites-page, .guide-page` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-heading` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-heading h1, .favorites-heading h1, .guide-intro h1` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-search` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-controls-mobile` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-button` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.desktop-sort` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-layout` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.results-toolbar` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-panel` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-panel.open` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-title` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-close` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-backdrop` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.filter-title .clear-button` | `src/styles.css` |
| `src/styles.css:393` | `@media (max-width: 680px)` | `.library-results .product-grid` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorites-heading` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorites-heading > div > p:last-child` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorite-list` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorite-item` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorite-image` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorite-name` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorite-bottom` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.favorite-bottom .open-link` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.status-control` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.saved-status` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.status-select select` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.icon-text-button` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.empty-favorites` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.guide-intro` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.guide-intro > p:last-child` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.guide-card` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.guide-card h2` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-page` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-lead` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-lead::before` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-logo-art` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-lead h1` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-lead > div > p:last-child` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-statement` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-statement p` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-principles` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-principles article` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-closing` | `src/styles.css` |
| `src/styles.css:394` | `@media (max-width: 680px)` | `.culture-closing h2` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.detail-hero` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.detail-hero > img` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.detail-hero-info` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.detail-hero-info h2` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.detail-body` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.detail-section` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.facts-grid` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.metric-grid` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.two-columns` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.two-columns > div + div` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.shade-list` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.shade-choice` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.dialog-close` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.drawer-back-button` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.site-footer` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.site-footer p` | `src/styles.css` |
| `src/styles.css:395` | `@media (max-width: 680px)` | `.site-footer .source-contact-link` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-toolbar, .product-profile-content` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-toolbar` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-toolbar > span` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-hero` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-media` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-media img` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-heading` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.product-profile-heading h1` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.profile-summary` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.profile-section` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.profile-section-heading h2` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.commerce-ready, .commerce-pending` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.commerce-pending > span` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.parameter-table > div` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.parameter-status` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.assessment-grid` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.assessment-grid > div, .assessment-grid > div + div` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.assessment-grid > div:last-child` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.assessment-grid strong` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.assessment-columns` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.assessment-columns > div + div` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.evidence-grid` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.evidence-item` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.evidence-item img` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.business-evidence-row` | `src/styles.css` |
| `src/styles.css:396` | `@media (max-width: 680px)` | `.full-profile-action` | `src/styles.css` |
| `src/styles.css:400` | `@media (prefers-reduced-motion: reduce)` | `*, *::before, *::after` | `src/styles.css` |
| `src/styles.css:406` | `@media (prefers-reduced-motion: reduce)` | `.brand-opening` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:407` | `@media (prefers-reduced-motion: reduce)` | `.hero-media--ready img, .hero-media--ready .hero-caption, .hero-copy--ready .hero-motion-control` | `src/features/home/components/HomeView.css` |
| `src/styles.css:408` | `@media (prefers-reduced-motion: reduce)` | `.home-hero--ready, .home-hero--ready .hero-copy, .hero-media--ready::after` | `src/features/home/components/HomeView.css` |
| `src/styles.css:409` | `@media (prefers-reduced-motion: reduce)` | `.home-motion-stage.is-ready, .home-motion-stage.is-ready > *` | `src/features/home/components/HomeView.css` |
| `src/styles.css:410` | `@media (prefers-reduced-motion: reduce)` | `.opening-powder-cloud, .opening-powder-dots, .opening-petal, .opening-particle, .opening-sparkle, .opening-glint, .opening-wordmark, .opening-wordmark-sparkle, .opening-tagline, .opening-monogram` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:414` | `@media (max-width: 680px)` | `.opening-wordmark` | `src/features/app-shell/components/BrandOpening.css` |
| `src/styles.css:415` | `@media (max-width: 680px)` | `.culture-mark-panel` | `src/styles.css` |
| `src/styles.css:416` | `@media (max-width: 680px)` | `.culture-mark-panel img` | `src/styles.css` |
| `src/styles.css:420` | 顶层 | `body` | `src/styles.css` |
| `src/styles.css:421` | 顶层 | `.site-header` | `src/styles.css` |
| `src/styles.css:422` | 顶层 | `.nav-link` | `src/styles.css` |
| `src/styles.css:423` | 顶层 | `.nav-link.active, .nav-link:hover` | `src/styles.css` |
| `src/styles.css:424` | 顶层 | `.nav-link::after` | `src/styles.css` |
| `src/styles.css:425` | 顶层 | `.home-hero, .hero-media` | `src/features/home/components/HomeView.css` |
| `src/styles.css:426` | 顶层 | `.home-hero` | `src/features/home/components/HomeView.css` |
| `src/styles.css:427` | 顶层 | `.hero-copy` | `src/features/home/components/HomeView.css` |
| `src/styles.css:428` | 顶层 | `.hero-copy h1` | `src/features/home/components/HomeView.css` |
| `src/styles.css:429` | 顶层 | `.culture-lead > div > p:last-child, .culture-principles p, .culture-closing p:last-child` | `src/styles.css` |
| `src/styles.css:429` | 顶层 | `.hero-description` | `src/features/home/components/HomeView.css` |
| `src/styles.css:430` | 顶层 | `.library-search, .detail-drawer, .product-profile, .culture-mark-panel` | `src/styles.css` |
| `src/styles.css:430` | 顶层 | `.hero-search` | `src/features/home/components/HomeView.css` |
| `src/styles.css:430` | 顶层 | `.makeup-workbench` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/styles.css:431` | 顶层 | `.library-search, .detail-drawer, .product-profile` | `src/styles.css` |
| `src/styles.css:431` | 顶层 | `.hero-search` | `src/features/home/components/HomeView.css` |
| `src/styles.css:431` | 顶层 | `.makeup-workbench` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/styles.css:432` | 顶层 | `.hero-search button, .assistant-entry-button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:433` | 顶层 | `.hero-search button:hover, .assistant-entry-button:hover` | `src/features/home/components/HomeView.css` |
| `src/styles.css:434` | 顶层 | `.primary-action` | `src/styles.css` |
| `src/styles.css:434` | 顶层 | `.makeup-plan-submit` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/styles.css:435` | 顶层 | `.primary-action:hover` | `src/styles.css` |
| `src/styles.css:435` | 顶层 | `.makeup-plan-submit:hover` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/styles.css:436` | 顶层 | `.filter-chip, .tag-row span, .scene-row span, .guide-card i` | `src/styles.css` |
| `src/styles.css:436` | 顶层 | `.quick-links button` | `src/features/home/components/HomeView.css` |
| `src/styles.css:437` | 顶层 | `.filter-chip.selected, .tag-row span.active` | `src/styles.css` |
| `src/styles.css:437` | 顶层 | `.quick-links button:hover` | `src/features/home/components/HomeView.css` |
| `src/styles.css:438` | 顶层 | `.library-page, .favorites-page, .guide-page, .culture-page, .product-profile-page` | `src/styles.css` |
| `src/styles.css:439` | 顶层 | `.library-heading, .favorites-heading, .guide-intro, .culture-lead, .culture-statement, .culture-closing` | `src/styles.css` |
| `src/styles.css:440` | 顶层 | `.culture-principles article:nth-child(2)` | `src/styles.css` |
| `src/styles.css:441` | 顶层 | `.culture-principles article:nth-child(3)` | `src/styles.css` |
| `src/styles.css:442` | 顶层 | `.site-footer` | `src/styles.css` |
| `src/styles.css:443` | 顶层 | `.product-card:hover .product-photo` | `src/styles.css` |
| `src/styles.css:443` | 顶层 | `.featured-card:hover .product-photo` | `src/features/home/components/HomeView.css` |
| `src/styles.css:444` | 顶层 | `.product-photo, .favorite-image, .detail-hero, .product-profile-media` | `src/styles.css` |
| `src/styles.css:445` | 顶层 | `.detail-section, .profile-section, .parameter-table, .parameter-table > div` | `src/styles.css` |
| `src/styles.css:446` | 顶层 | `.detail-hero-info h2, .product-profile-heading h1, .profile-section-heading h2, .detail-section h3` | `src/styles.css` |
| `src/styles.css:447` | 顶层 | `.detail-rating, .saved-status, .profile-section .eyebrow, .commerce-ready strong` | `src/styles.css` |
| `src/styles.css:448` | 顶层 | `.parameter-status.recorded, .business-evidence-row strong` | `src/styles.css` |
| `src/styles.css:449` | 顶层 | `.parameter-status.pending, .verification-issues, .commerce-pending` | `src/styles.css` |
| `src/styles.css:450` | 顶层 | `.xiaoy-page` | `src/features/assistant/assistant.css` |
| `src/styles.css:452` | 顶层 | `.makeup-table-lazy-placeholder` | `src/features/home/components/HomeView.css` |
| `src/styles.css:453` | `@media (max-width: 680px)` | `.makeup-table-lazy-placeholder` | `src/features/home/components/HomeView.css` |
| `src/xiaoy.css:2` | 顶层 | `.assistant-entry-button` | `src/features/home/components/HomeView.css` |
| `src/xiaoy.css:3` | 顶层 | `.assistant-entry-button:hover` | `src/features/home/components/HomeView.css` |
| `src/xiaoy.css:4` | 顶层 | `.assistant-entry-button:active` | `src/features/home/components/HomeView.css` |
| `src/xiaoy.css:5` | 顶层 | `.xiaoy-page` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:6` | 顶层 | `.xiaoy-heading` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:7` | 顶层 | `.xiaoy-heading h1` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:8` | 顶层 | `.xiaoy-heading > div:first-child > p:last-child` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:9` | 顶层 | `.xiaoy-heading-actions` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:10` | 顶层 | `.xiaoy-heading-actions > button` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:11` | 顶层 | `.xiaoy-heading-actions > button:hover` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:12` | 顶层 | `.xiaoy-mode` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:13` | 顶层 | `.xiaoy-mode.ai` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:14` | 顶层 | `.xiaoy-mode.local` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:15` | 顶层 | `.xiaoy-mode.tool` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:16` | 顶层 | `.xiaoy-mode.web` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:17` | 顶层 | `.xiaoy-mode.error` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:18` | 顶层 | `.xiaoy-layout` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:19` | 顶层 | `.xiaoy-sidebar` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:20` | 顶层 | `.xiaoy-avatar` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:21` | 顶层 | `.xiaoy-avatar > span` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:22` | 顶层 | `.xiaoy-avatar div` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:23` | 顶层 | `.xiaoy-avatar b` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:24` | 顶层 | `.xiaoy-avatar small` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:25` | 顶层 | `.xiaoy-profile` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:26` | 顶层 | `.xiaoy-profile-title` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:27` | 顶层 | `.xiaoy-profile dl` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:28` | 顶层 | `.xiaoy-profile dl div` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:29` | 顶层 | `.xiaoy-profile dt` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:30` | 顶层 | `.xiaoy-profile dd` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:31` | 顶层 | `.xiaoy-profile > p` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:32` | 顶层 | `.xiaoy-privacy` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:33` | 顶层 | `.xiaoy-privacy > svg` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:34` | 顶层 | `.xiaoy-privacy p` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:35` | 顶层 | `.xiaoy-privacy b` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:36` | 顶层 | `.xiaoy-privacy span` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:37` | 顶层 | `.xiaoy-profile-count` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:38` | 顶层 | `.xiaoy-chat` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:39` | 顶层 | `.xiaoy-messages` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:40` | 顶层 | `.xiaoy-message` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:41` | 顶层 | `.xiaoy-message.user` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:42` | 顶层 | `.xiaoy-message-icon` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:43` | 顶层 | `.xiaoy-message.user .xiaoy-message-icon` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:44` | 顶层 | `.xiaoy-message-body` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:45` | 顶层 | `.xiaoy-message-body > p` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:46` | 顶层 | `.xiaoy-message.user .xiaoy-message-body > p` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:47` | 顶层 | `.xiaoy-message.loading .xiaoy-message-body p` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:48` | 顶层 | `.xiaoy-message.loading svg` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:49` | 顶层 | `@keyframes xiaoy-spin` | `src/styles.css` |
| `src/xiaoy.css:50` | 顶层 | `.xiaoy-products` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:51` | 顶层 | `.xiaoy-product` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:52` | 顶层 | `.xiaoy-product:hover` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:53` | 顶层 | `.xiaoy-product > img` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:54` | 顶层 | `.xiaoy-product-copy` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:55` | 顶层 | `.xiaoy-product-copy small` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:56` | 顶层 | `.xiaoy-product-copy b` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:57` | 顶层 | `.xiaoy-product-copy i` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:58` | 顶层 | `.xiaoy-product > svg` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:59` | 顶层 | `.xiaoy-sources` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:60` | 顶层 | `.xiaoy-sources > span` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:61` | 顶层 | `.xiaoy-sources a` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:62` | 顶层 | `.xiaoy-sources a:hover` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:63` | 顶层 | `.xiaoy-sources a b` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:64` | 顶层 | `.xiaoy-prompts` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:65` | 顶层 | `.xiaoy-prompts button` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:66` | 顶层 | `.xiaoy-prompts button:hover` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:67` | 顶层 | `.xiaoy-composer` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:68` | 顶层 | `.xiaoy-composer input` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:69` | 顶层 | `.xiaoy-composer input::placeholder` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:70` | 顶层 | `.xiaoy-composer button` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:71` | 顶层 | `.xiaoy-composer button:disabled` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:72` | 顶层 | `.xiaoy-disclaimer` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:73` | 顶层 | `.makeup-workbench` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:74` | 顶层 | `.makeup-workbench-heading` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:75` | 顶层 | `.makeup-workbench-heading h2` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:76` | 顶层 | `.makeup-workbench-heading p:last-child` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:77` | 顶层 | `.makeup-workbench-state, .makeup-plan-source` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:78` | 顶层 | `.makeup-plan-source.model` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:79` | 顶层 | `.makeup-plan-source.local` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:80` | 顶层 | `.makeup-workbench-form` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:81` | 顶层 | `.makeup-workbench-form > label, .makeup-workbench-form fieldset` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:82` | 顶层 | `.makeup-workbench-form select, .makeup-workbench-form input[type='number']` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:83` | 顶层 | `.makeup-workbench-form select:focus, .makeup-workbench-form input:focus` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:84` | 顶层 | `.makeup-workbench-form fieldset` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:85` | 顶层 | `.makeup-workbench-form legend` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:86` | 顶层 | `.makeup-priority-list` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:87` | 顶层 | `.makeup-priority-list label` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:88` | 顶层 | `.makeup-workbench-form input[type='checkbox']` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:89` | 顶层 | `.makeup-plan-submit` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:90` | 顶层 | `.makeup-plan-submit:hover` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:91` | 顶层 | `.makeup-plan-submit:disabled` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:92` | 顶层 | `.makeup-plan-submit svg` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:93` | 顶层 | `.makeup-plan-error` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:94` | 顶层 | `.makeup-plan-result` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:95` | 顶层 | `.makeup-plan-result-heading` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:96` | 顶层 | `.makeup-plan-result-heading h2` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:97` | 顶层 | `.makeup-plan-result-heading p:last-child` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:98` | 顶层 | `.makeup-plan-meta` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:99` | 顶层 | `.makeup-plan-steps` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:100` | 顶层 | `.makeup-plan-step` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:101` | 顶层 | `.makeup-plan-step-index` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:102` | 顶层 | `.makeup-plan-step-content` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:103` | 顶层 | `.makeup-plan-step-title` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:104` | 顶层 | `.makeup-plan-step-title span` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:105` | 顶层 | `.makeup-plan-step-title h3` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:106` | 顶层 | `.makeup-plan-step-title small` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:107` | 顶层 | `.makeup-plan-step-content > p` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:108` | 顶层 | `.makeup-plan-detail` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:109` | 顶层 | `.makeup-plan-detail b` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:110` | 顶层 | `.makeup-plan-products` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:111` | 顶层 | `.makeup-plan-product` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:112` | 顶层 | `.makeup-plan-product:hover` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:113` | 顶层 | `.makeup-plan-product span` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:114` | 顶层 | `.makeup-plan-product span b` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:115` | 顶层 | `.makeup-plan-product small` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:116` | 顶层 | `.makeup-plan-product > svg` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:117` | 顶层 | `.makeup-plan-reasons` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:118` | 顶层 | `.makeup-plan-reasons > span` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:119` | 顶层 | `.makeup-plan-reasons i` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:120` | 顶层 | `.makeup-plan-cautions` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:121` | 顶层 | `.makeup-plan-cautions svg` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:122` | 顶层 | `.makeup-plan-evidence` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:123` | 顶层 | `.makeup-plan-evidence summary` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:124` | 顶层 | `.makeup-plan-evidence > div` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:125` | 顶层 | `.makeup-plan-evidence article` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:126` | 顶层 | `.makeup-plan-evidence article > b` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:127` | 顶层 | `.makeup-plan-evidence article > span` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:128` | 顶层 | `.makeup-plan-evidence article p` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:129` | 顶层 | `.makeup-plan-limitations` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:130` | 顶层 | `.makeup-plan-limitations strong` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:131` | 顶层 | `.makeup-plan-limitations p` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:132` | 顶层 | `.xiaoy-dialog-backdrop` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:133` | 顶层 | `.xiaoy-settings` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:134` | 顶层 | `.xiaoy-settings-heading` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:135` | 顶层 | `.xiaoy-settings-heading h2` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:136` | 顶层 | `.xiaoy-settings-heading > button` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:137` | 顶层 | `.xiaoy-settings > label` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:138` | 顶层 | `.xiaoy-settings input, .xiaoy-settings select` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:139` | 顶层 | `.xiaoy-key-note` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:140` | 顶层 | `.xiaoy-key-note svg` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:141` | 顶层 | `.xiaoy-test-result` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:142` | 顶层 | `.xiaoy-test-result.success` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:143` | 顶层 | `.xiaoy-test-result.error` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:144` | 顶层 | `.xiaoy-settings-actions` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:145` | 顶层 | `.xiaoy-test-button` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:146` | 顶层 | `.xiaoy-test-button:disabled` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:149` | `@media (max-width: 980px)` | `.desktop-nav` | `src/styles.css` |
| `src/xiaoy.css:150` | `@media (max-width: 980px)` | `.nav-link` | `src/styles.css` |
| `src/xiaoy.css:151` | `@media (max-width: 980px)` | `.xiaoy-layout` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:152` | `@media (max-width: 980px)` | `.xiaoy-products` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:153` | `@media (max-width: 980px)` | `.makeup-workbench-form` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:154` | `@media (max-width: 980px)` | `.makeup-workbench-form fieldset` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:155` | `@media (max-width: 980px)` | `.makeup-plan-evidence > div` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:159` | `@media (max-width: 760px)` | `.xiaoy-page` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:160` | `@media (max-width: 760px)` | `.xiaoy-heading` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:161` | `@media (max-width: 760px)` | `.xiaoy-heading h1` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:162` | `@media (max-width: 760px)` | `.xiaoy-heading-actions` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:163` | `@media (max-width: 760px)` | `.xiaoy-heading-actions .xiaoy-mode` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:164` | `@media (max-width: 760px)` | `.xiaoy-layout` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:165` | `@media (max-width: 760px)` | `.xiaoy-sidebar` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:166` | `@media (max-width: 760px)` | `.xiaoy-avatar` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:167` | `@media (max-width: 760px)` | `.xiaoy-profile` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:168` | `@media (max-width: 760px)` | `.xiaoy-privacy, .xiaoy-profile-count` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:169` | `@media (max-width: 760px)` | `.xiaoy-messages` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:170` | `@media (max-width: 760px)` | `.xiaoy-message-body` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:171` | `@media (max-width: 760px)` | `.xiaoy-message-body > p` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:172` | `@media (max-width: 760px)` | `.xiaoy-prompts` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:173` | `@media (max-width: 760px)` | `.xiaoy-composer` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:174` | `@media (max-width: 760px)` | `.makeup-workbench` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:175` | `@media (max-width: 760px)` | `.makeup-workbench-heading, .makeup-plan-result-heading` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:176` | `@media (max-width: 760px)` | `.makeup-workbench-form` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:177` | `@media (max-width: 760px)` | `.makeup-workbench-form fieldset` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:178` | `@media (max-width: 760px)` | `.makeup-plan-step` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:179` | `@media (max-width: 760px)` | `.makeup-plan-step-title` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:180` | `@media (max-width: 760px)` | `.makeup-plan-evidence > div` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:184` | `@media (max-width: 460px)` | `.xiaoy-sidebar` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:185` | `@media (max-width: 460px)` | `.xiaoy-profile` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:186` | `@media (max-width: 460px)` | `.xiaoy-product` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:187` | `@media (max-width: 460px)` | `.xiaoy-product > img` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:188` | `@media (max-width: 460px)` | `.xiaoy-settings` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:189` | `@media (max-width: 460px)` | `.xiaoy-settings-actions` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:190` | `@media (max-width: 460px)` | `.makeup-workbench-form` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:191` | `@media (max-width: 460px)` | `.makeup-workbench-form fieldset` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:192` | `@media (max-width: 460px)` | `.makeup-plan-submit` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:196` | `@media (prefers-reduced-motion: reduce)` | `.xiaoy-message.loading svg` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:196` | `@media (prefers-reduced-motion: reduce)` | `.makeup-plan-submit svg` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:200` | 顶层 | `.xiaoy-page` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:201` | 顶层 | `.xiaoy-panel, .xiaoy-settings` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:201` | 顶层 | `.makeup-workbench` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:202` | 顶层 | `.assistant-entry-button` | `src/features/home/components/HomeView.css` |
| `src/xiaoy.css:203` | 顶层 | `.assistant-entry-button:hover` | `src/features/home/components/HomeView.css` |
| `src/xiaoy.css:204` | 顶层 | `.xiaoy-composer button` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:204` | 顶层 | `.makeup-plan-submit` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:205` | 顶层 | `.xiaoy-composer button:hover` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:205` | 顶层 | `.makeup-plan-submit:hover` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:206` | 顶层 | `.xiaoy-prompts button, .xiaoy-settings input, .xiaoy-settings select` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:206` | 顶层 | `.makeup-workbench-form select, .makeup-workbench-form input[type='number']` | `src/features/makeup-plan/components/MakeupWorkbench.css` |
| `src/xiaoy.css:207` | 顶层 | `.xiaoy-message.success` | `src/features/assistant/assistant.css` |
| `src/xiaoy.css:207` | 顶层 | `.makeup-plan-source.local` | `src/features/makeup-plan/components/MakeupWorkbench.css` |

另有三个 CSS 整文件逐字迁移：`src/components/FlexCarousel.css`、`ScrollFloat.css`、`StrokeText.css` → `src/components/visual/` 下同名文件；其规则、资源和 reduced-motion 条件全部保留。

本阶段无新增核验，继承上一条结论。产品事实、图片/来源/授权 pending 与公开风险不因样式迁移升级。

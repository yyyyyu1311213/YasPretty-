# ARCH-00 迁移清单与验证基线

本清单属于开发分支 `codex/frontend-contracts-yas-2026-0055` 的 `ARCH-00-S03`，记录日期为 2026-11-16（北京时间）。它是[迁移计划](frontend-architecture-migration-plan.md)的源码映射附件，不授权实施后续阶段，也不等同于正式产品阶段 0。

## 1. 实时基线与前置验收

| 核对项 | 实际结果 |
| --- | --- |
| 修改前 HEAD | `ce266c654709506fe36340da21874676b382a239` |
| 固定分支 | `codex/frontend-contracts-yas-2026-0055` |
| 公共规范来源 | `origin/master` = `19b87df58d0f8bf3874dc8e958175c7c22ac6f82` |
| 远端核验 | 已执行 `git fetch origin master`、同名开发分支 fetch；23:44 北京时间 `git ls-remote --heads` 确认上述两个远端实际 SHA；开发分支 ahead/behind = `0/0` |
| 规则副本 | `git diff origin/master -- AGENTS.md` 无差异；README 公共约定一致，迁移计划仅有开发分支执行记录差异 |
| 修改前工作树、暂存区、未跟踪文件 | 均为空；没有已有用户修改影响本次基线测试，没有暂存、清理或覆盖用户文件 |
| 唯一 current | `ARCH-00`；ARCH-01 至 ARCH-11 均为 pending |
| 已用小步 | S01 公共规范复核已按计划记载的人工确认提交到 master（`19b87df`）；S02 已按既有授权选择性同步到开发分支（`ce266c6`），远端可定位；两步都只改三份规范文档，不能替代完整迁移基线 |
| 本步编号 | `ARCH-00-S03`；S02 已实际使用，不复用。关联前置问题 `YAS-2026-0055`，未新造 YAS 编号 |
| 历史基线 | `86b25b3` 仅为 contracts 前置实现 SHA，不作为本次修改前 HEAD |
| 阶段标签 | 本地 `git tag --list 'arch-stage-*'` 与远端 `git ls-remote --tags origin 'refs/tags/arch-stage-*'` 均无结果 |
| 运行环境 | Windows PowerShell；Node.js `v24.18.0`、npm `11.16.0`、Vitest `5.0.5`、Vite `8.3.5`；未安装或升级依赖 |

普通沙箱和备用 Node REPL 在进程启动前出现 `setup refresh had errors`，不属于项目测试失败；实际命令通过经审查可用的终端执行。未读取 `.env`、真实密钥、浏览器用户数据或旧 memory 数据。

## 2. 实际运行结果

在仓库根目录执行，运行代码、测试和依赖均与上述 HEAD 一致。

| 命令 | 真实结果 |
| --- | --- |
| `npm test` | 退出码 0；23:41:58 开始，耗时 1.61 秒；12 个测试文件、73/73 项通过，无失败、无跳过；出现 `THREE_CJS_DEPRECATED`，提示 `require("three")` 将弃用 |
| `npm run build` | 退出码 0；转换 2861 个模块，1.27 秒完成；主 JS 743.24 kB / gzip 225.10 kB，3D 异步 JS 1292.96 kB / gzip 355.95 kB；保留超过 500 kB 的分包警告 |
| `git diff --check` | 编辑前退出码 0、无输出；文档编辑后再次核对，最终结果见迁移计划 S03 执行记录 |
| `git diff --cached --check` | 编辑前退出码 0、无输出，暂存区为空；未以暂存方式建立备份 |

构建只更新被忽略的 `dist/`，不将构建产物纳入交付。没有运行 `npm install`、依赖审计、付费模型、真实外部 provider 或浏览器验收。以下是已运行套件的真实组成，不将函数测试描述为 UI 或端到端覆盖。

| 测试文件 | 用例数 | 当前断言范围与边界 |
| --- | --- | --- |
| `src/components/XiaoYAssistant.test.js` | 11 | 前端意图、联网判断、画像、预算/肤质筛选、空候选、方案转换/格式化、基础降级和合法 ID；直接导入小Y与工作台的纯函数，不挂载 UI，不模拟真实 fetch/存储 |
| `src/components/MakeupTable.test.js` | 3 | 受控品类、摘要、最多五款；未验证真实点击、键盘或回退画面 |
| `src/components/MakeupTable3D.test.js` | 6 | 八类几何数据、坐标、性能档、超时和展开时长常量；未驱动 WebGL、场景超时计时器或资源释放 |
| `src/components/BrandOpening.test.js` | 2 | 开幕时长与减少动效偏好读取；不等于跳过按钮及锁滚动验收 |
| `src/lib/navigation-history.test.js` | 4 | 历史条目、详情路径、恢复字段与非法状态；不驱动浏览器前进后退 |
| `src/data/home-featured.test.js` | 1 | 重算 rating 排序后的 12 个唯一 ID 与本地图片；未引用 HomeView 或未来 homeContent |
| `src/data/product-verification.test.js` | 7 | 核验记录、文件哈希、现有 URL 判定、价格/色号/编辑解读；不代表最新链接政策或外部商品事实重新核验 |
| `server/app.test.js` | 22 | Fastify inject、路由、安全、无 Key、来源、天气/知识降级、额度、方案 schema/候选/一次修复后回退；不是浏览器请求适配测试 |
| `server/providers/zhipu-provider.test.js` | 8 | 模拟 fetch 的无 Key、重试、额度、超时、无效响应和搜索参数；未调用真实付费接口 |
| `server/providers/weather-provider.test.js` | 3 | 模拟地理编码/预报、空结果及确定性文案 |
| `server/knowledge/beauty-knowledge.test.js` | 4 | 受控知识检索、来源去重与降级边界 |
| `tests/netlify-api-adapter.test.js` | 2 | API 路径和查询参数适配；不证明公网部署已更新 |
| 合计 | 73 | 12 个文件；旧 `server/test-memory.cjs` 未运行，不属于当前套件 |

## 3. 源码到目标的迁移映射

所有行号均取自修改前 HEAD，仅用来定位本轮读取的定义和调用。表中“直接”是导入或同文件调用，“间接”是到页面入口的调用链；目标路径全是后续阶段计划，当前未创建。新增 Hook、API 或展示文件只在相应阶段承担下表已存在的职责，不预建空模块。

### ARCH-01：匿名存储

| 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/lib/xiaoy-storage.js:1` 的版本、画像/消息 Key、legacy Key | `src/lib/storage/storageKeys.js` | 直接：本文件 read/write/凭据清理；调用方 `src/components/XiaoYAssistant.jsx:13`；间接：App:340 → 小Y | 无直接存储测试；现有小Y 11 项不覆盖读写 |
| 同文件 `parse:8`、`writeVersioned:29`、当前版本读取 | `src/lib/storage/storageClient.js` | 直接：xiaoyStorage 的 readProfile/readMessages/writeProfile/writeMessages；小Y:331–352；间接：小Y首次挂载、画像更新、消息更新 | 后续验证损坏 JSON、版本包装及 storage 不可用现状；本步不新增测试或异常行为 |
| 同文件 `readVersioned:16` 的旧值读取、写入新 Key、删除旧 Key | `src/lib/storage/migrations.js` | 直接：readProfile/readMessages 初始化；间接：小Y恢复会话 | 无直接测试；迁移顺序、fallback 和版本 1 原样保留 |
| 同文件 `clearLegacyCredentials:38` | `src/lib/storage/clearUserData.js` | 直接：小Y:342 挂载 effect；间接：App → 小Y | 当前只删两枚旧配置 Key；不可把它描述成已清除全部用户数据 |
| `src/components/XiaoYAssistant.jsx:331` 的存储适配调用、`:352` 的 `slice(-20)` | ARCH-01 更新直接引用；ARCH-03 归入 `src/features/assistant/hooks/useAssistant.js` | 直接：消息/画像初始化和 effects；间接：发送、重置后保存 | 20 条保存上限属于调用方，存储模块本身没有截断；四模块如何组合现有业务方法须在 ARCH-01 按实际调用审查，不额外引入无职责转发层 |

收藏 Key 不在 ARCH-01 迁移范围，见 ARCH-07。

### ARCH-02：妆容工作台

| 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/components/MakeupWorkbench.jsx:10` DEFAULT_FORM、`:23` legacyToForm、`:32` toPlanPayload | `src/features/makeup-plan/makeupPlanUtils.js` | 直接：工作台初始化/createPlan；小Y:14 导入、`:166` planPayloadFromConversation；测试:15；间接：App → 小Y → 工作台/聊天方案 | 小Y测试中 1 项工作台转换及会话方案断言；迁移对应纯函数断言到就近测试 |
| 同文件 `:130` 的 `/api/makeup-plans` fetch/JSON/错误判断 | `src/features/makeup-plan/makeupPlanApi.js` | 直接：createPlan:125；间接：工作台提交；ARCH-03 小Y requestMakeupPlan 复用 | server/app.test.js 的方案 4 项为间接保障，当前没有前端请求测试 |
| 同文件 `:102` 的 form/plan/status/error、画像同步、update/togglePriority/createPlan | `src/features/makeup-plan/hooks/useMakeupPlan.js` | 直接：工作台表单、按钮、加载与错误区域；间接：小Y:457 | 无状态/组件测试；profile 同步与最多四项优先目标需要后续回归 |
| 同文件 `:147` 表单 JSX、SCENES/STYLES/PRIORITIES | `src/features/makeup-plan/components/MakeupPlanForm.jsx` | 直接：MakeupWorkbench；间接：小Y与首页 CTA | 无挂载测试；不更改默认值、DOM、文案和照片 false |
| 同文件 `:69` PlanResult、`:57` PlanProduct | `src/features/makeup-plan/components/PlanResult.jsx`、`PlanProduct.jsx`（同目录） | 直接：工作台 plan 显示；依赖 data/products 按 ID 查询、onOpenProduct；间接：App 详情抽屉 | 数据测试及网关 schema 为间接保障，未覆盖结果 UI |
| 同文件默认导出及组合 | `src/features/makeup-plan/components/MakeupWorkbench.jsx` | 直接：小Y:14、`:457`；间接：App:340；转换导出由直接消费者改为 Utils 引用 | 迁移小Y测试的工作台导入；不新增 localPlanGenerator，不把小Y基础文本降级移入工作台 |

### ARCH-03：小Y助手

| 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/components/XiaoYAssistant.jsx:44` detectIntent、`:54` needsOnlineResearch | `src/features/assistant/intentUtils.js` | 直接：sendMessage:360；detectIntent 调用 findMentionedProducts；间接：App → 小Y | 11 项小Y测试中的路由/联网断言随函数迁移；findMentionedProducts 作为单向 Utils 依赖，不复制服务端 intentRouter |
| 同文件 `createMessage:34`、extractProfile:61、pickShade:87、scoreProduct:94、findMentionedProducts:105、recommendProducts:115、localReply:129 | `src/features/assistant/assistantUtils.js` | 直接：意图判断、发送、AssistantProduct；间接：聊天与商品打开；产品事实来自 data/products | 小Y纯函数测试；不改评分、候选、预算、色号和排除逻辑 |
| 同文件 planPayloadFromConversation:166、formatPlanReply:196、localMakeupReply:212、parseAssistantResult:232、cleanErrorMessage:267 | 同上 `assistantUtils.js` | 直接：requestAssistant/requestMakeupPlan/sendMessage catch；依赖 makeupPlanUtils；间接：小Y文本方案及无服务降级 | 小Y转换、合法 ID、错误清理和降级断言迁移到 Utils 测试；不得误把文本降级描述成工作台结构化生成器 |
| 同文件 requestAssistant:242 | `src/features/assistant/assistantApi.js` | 直接：sendMessage 的联网与外部问答分支；间接：App → 小Y | 目前无前端 fetch 测试；网关、provider、Netlify 测试仅间接覆盖；保持 query/profile/最近 8 条消息与错误 code |
| 同文件 requestMakeupPlan:271 | 方案 POST 复用 `src/features/makeup-plan/makeupPlanApi.js`；会话 payload/格式化留在 assistantUtils/useAssistant | 直接：sendMessage 的 makeup_plan 分支；间接：聊天方案；工作台也使用同一业务请求 | 保留方案失败后小Y 7 步基础文本降级，不能使 makeup-plan 反向依赖 assistant |
| 同文件默认组件 `:330` 状态、effects、sendMessage、resetConversation | `src/features/assistant/hooks/useAssistant.js` + `components/XiaoYAssistant.jsx` | 直接：App:28 导入、`:340` 渲染；间接：导航、首页 CTA、产品抽屉 | 无 Hook/挂载测试；消息上限、busy、mode/model/activity、来源及重置需后续回归 |
| 同文件 ProfileSummary:282、AssistantProduct:301、SourceList:316、消息 JSX:469 | `src/features/assistant/components/ProfileSummary.jsx`、`AssistantProduct.jsx`、`SourceList.jsx`、`AssistantMessages.jsx` | 直接：小Y页面；消息列表调用产品与来源组件；间接：onOpenProduct → App.openProductDrawer | 无展示测试；welcomeMessage/quickPrompts/SCENE_OPTIONS 随现有实际职责归组件或 Utils，不预建内容 Service |
| `src/components/XiaoYAssistant.test.js` | `src/features/assistant/intentUtils.test.js`、`assistantUtils.test.js`，工作台转换断言到 `src/features/makeup-plan/makeupPlanUtils.test.js` | 直接：当前导入两个 UI 文件；间接加载 React 和视觉依赖的现状需要解除 | 迁移原有 11 项断言，不因路径迁移删除用例或提前声称新增覆盖 |

### ARCH-04：公共请求层

| 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| 当前小Y:243/272 与工作台:130 的 POST、JSON 解析；ARCH-02/03 先归入两个业务 API | `src/lib/api/client.js` | 直接：未来 assistantApi、makeupPlanApi；间接：useAssistant/useMakeupPlan → 两个页面 | 当前三处都无 AbortController/浏览器超时；目标 client 不代表允许本阶段新增超时、重试或改变失败语义 |
| 同三处 response.ok、空 answer/plan、error.message/code；小Y:267 文案尾标点处理 | `src/lib/api/errors.js`（公共错误），业务必填值/文案适配仍在各 API/Utils | 直接：两个业务 API；间接：各页面 catch 和降级 | provider 超时测试不覆盖浏览器层；错误 code、文案及 fallback 分支需要后续前端验证 |
| 小Y:17/18、工作台:5 的 endpoint 常量 | `src/lib/api/endpoints.js` | 直接：两个业务 API；间接：fetch → Vite proxy/同源 Fastify 或 Netlify | 路径固定 `/api/assistant`、`/api/makeup-plans`；不创建天气 API，不改 server/vite/netlify 配置 |

### ARCH-05：2D/3D 化妆桌

下表目标前缀为 `src/features/makeup-table/`，每个文件均已核对实际导入关系。

| 现有文件与职责 | 目标文件（相对上述前缀） | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/App.jsx:24` lazy、HomeView:435 Suspense 与 `src/components/MakeupTable3D.jsx:14` 能力检测/错误边界/2D fallback | `components/MakeupTableExperience.jsx`（对外装配）与 `components/MakeupTable3D.jsx`（场景） | 直接：HomeView；间接：App 首页；当前入口已组合 WebGL、6 秒回退、减少动效和低性能档 | MakeupTable3D.test.js 6 项只验证数据/常量；lazy 下载失败与运行时场景失败须区分，现有代码没有明确捕获模块下载失败的化妆桌边界 |
| `src/components/MakeupTable.jsx`、`MakeupTable.css` | `components/MakeupTable.jsx`、`components/MakeupTable.css` | 直接：MakeupTable3D:4/91；间接：App → HomeView → 3D fallback | `src/components/MakeupTable.test.js` 3 项迁入 `components/MakeupTable.test.js`；保留分类、最多五款与键盘/点击路径 |
| `src/components/MakeupTable3D.jsx`、`MakeupTable3D.css` | `components/MakeupTable3D.jsx`、`components/MakeupTable3D.css` | 直接：App lazy、3D 测试常量导入；间接：HomeView | `src/components/MakeupTable3D.test.js` → `components/MakeupTable3D.test.js`；更新内部 cosmetics/performance 导入 |
| `src/components/makeup-table-3d/Scene.jsx` | `makeup-table-3d/Scene.jsx` | 直接：MakeupTable3D:5/157；间接：首页 Canvas；Scene 直接装配下列几何/粒子 | 3D 测试不运行 Canvas；保留按需帧循环、相机与 controls |
| `src/components/makeup-table-3d/CosmeticItem.jsx` | `makeup-table-3d/CosmeticItem.jsx` | 直接：Scene:5/73；间接：3D 首页 | 无直接测试；保留 GSAP、R3F、Drei 和 textureMap 接口 |
| `src/components/makeup-table-3d/DressingTable.jsx` | `makeup-table-3d/DressingTable.jsx` | 直接：Scene:6/71；间接：3D 首页 | 无直接几何测试 |
| `src/components/makeup-table-3d/ParticleBurst.jsx` | `makeup-table-3d/ParticleBurst.jsx` | 直接：Scene:7/76；间接：花瓣展开 | 无直接测试；保留动画生命周期 |
| `src/components/makeup-table-3d/cosmetics.js` | `makeup-table-3d/cosmetics.js` | 直接：MakeupTable3D:6、Scene:8、3D 测试:2；间接：分类轨道与几何陈列 | 3D 测试前两项；不作为商品事实库 |
| `src/components/makeup-table-3d/performance-profile.js` | `makeup-table-3d/performance-profile.js` | 直接：MakeupTable3D:8/57、3D 测试:3；间接：Canvas DPR、阴影、光标档位 | 3D 测试性能档两项，不证明真实手机 GPU 表现 |
| `src/components/makeup-table-3d/GhostCursor.jsx`、`GhostCursor.css` | `makeup-table-3d/GhostCursor.jsx`、`makeup-table-3d/GhostCursor.css` | 直接：MakeupTable3D:7/159；间接：首页；CSS 由 GhostCursor 导入 | 无直接测试；保留 visibility、context lost/restored、Observer、RAF 和 WebGL 资源清理；同步 README 第三方路径 |

### ARCH-06：产品库

下表目标前缀为 `src/features/catalog/`。App 仍承担导航与产品抽屉的跨功能连接，ARCH-06 不顺带迁移收藏状态。

| 现有文件与职责 | 目标文件（相对上述前缀） | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/App.jsx:60` toggleArrayValue、`:64` containsText、`:72` productMatches、`:178` 排序 | `catalogUtils.js` | 直接：filteredProducts/updateFilter；间接：首页搜索/快捷筛选、GuideView → LibraryView | 无直接筛选/排序测试；保持所有条件、null 数值现状及推荐排序公式 |
| 同文件 productById:90、各页面 products 读取/查找 | `catalogService.js` | 直接：导航入口校验、首页选中 ID、卡片/抽屉/收藏列表；间接：主站详情与深链接 | 数据和导航测试为间接保障；产品唯一事实仍在 src/data，不复制或移动数据 |
| 同文件 filters/sort/filterPanelOpen、filteredProducts、updateFilter/clearFilters | `hooks/useCatalog.js` | 直接：App 状态装配；runSearch/chooseQuickFilter/openCategory 连接导航；间接：首页、指南、化妆桌 | 无状态测试；跨页面筛选与导航连接由 App 保留，不改变跳转结果 |
| 同文件 LibraryView:496、FilterPanel:521、FilterGroup:538、SortSelect:542、EmptyResults:722 | `components/LibraryView.jsx`、`components/FilterPanel.jsx`；小型子组件留对应父文件 | 直接：App:322/LibraryView 内调用；间接：首页/指南/化妆桌筛选 | 无组件测试；保持移动蒙层、关闭、清空、排序和空结果 |
| 同文件 ProductCard:546 | `components/ProductCard.jsx` | 直接：LibraryView:514、HomeView:428；间接：App、首页静态轮播回退 | 数据测试仅间接覆盖；保存按钮仍用 collection/onFavorite/onRemoveFavorite，ARCH-07 再拆状态控件 |
| 同文件 ProductProfileView:565、ParameterRow:638 | `components/ProductProfile.jsx`（现有组件改名对应目标） | 直接：App:352 产品页；依赖 getProductVerification/buildProductAssessment；间接：深链接/详情“完整资料” | navigation-history.test.js 与 product-verification.test.js 不验证 UI；保留购买门禁、来源与删除联系 |
| 同文件 DetailDrawer:642、Metric:671、相似产品列表 | `components/ProductDetailDrawer.jsx`（现有 DetailDrawer） | 直接：App:365；间接：首页、产品库、小Y、收藏、方案 onOpenProduct | 无抽屉交互测试；色号 state、遮罩/按钮/Escape、相似产品与完整资料导航不变 |

### ARCH-07：收藏

| 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/App.jsx:30` STORAGE_KEY、`:52` getStoredCollection、`:148` 写入 effect | `src/features/collection/collectionStorage.js`，复用 ARCH-01 的公共 JSON 能力 | 直接：App 初始化/collection effect；间接：首页卡片、库、详情、收藏 | 无直接测试；Key `base-archive-collection`、原始对象格式不变，不强行包版本导致旧用户数据失配 |
| 同文件 statusOptions:35、setStatus:220、removeFavorite:224、favoriteCount:189、FavoritesView:682 过滤 | `src/features/collection/collectionUtils.js`、`hooks/useCollection.js`（同 feature） | 直接：App 共享状态与 callbacks；间接：Header 计数、所有产品展示 | 当前未监听 `storage` 事件，不存在已实现的跨标签实时同步；本阶段不得以“保持”名义新增该行为 |
| 同文件 StatusControl:677 | `src/features/collection/components/CollectionStatusControl.jsx` | 直接：ProductProfileView:590、DetailDrawer:655、FavoritesView:683；间接：各产品入口；catalog 消费该展示控件 | 三状态“想买/正在用/会回购”，无挂载测试；不让 collection 反向导入 catalog 造成循环 |
| 同文件 FavoritesView:681 | `src/features/collection/components/CollectionView.jsx` | 直接：App:342；间接：Header/导航收藏入口；依赖 products 与状态控件 | 无列表状态/恢复测试；保持空态、删除、改状态和详情回调 |

### ARCH-08：首页与视觉

| 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- |
| `src/App.jsx:418` HomeView、keyword、分区组合 | `src/features/home/components/HomeView.jsx` | 直接：App:311；间接：主页；装配 makeup-table、catalog、Hero/精选/收尾 | 无页面测试；保留开幕 gating 与 Suspense/静态 fallback |
| 同文件 `:438` Hero、CTA、搜索和快捷筛选 | `src/features/home/components/HeroSection.jsx` | 直接：HomeView；间接：App；依赖导航/搜索 callbacks | 无行为测试；保留 slogan、资源 URL、移动图片与触发时机 |
| 同文件 `:420` 精选排序与 featuredItems、`:428` staticFeatured、`:462` 编辑精选 | `src/features/home/components/EditorSelection.jsx`、必要时 `HomeProductSection.jsx`；文案/ID/顺序进入 `src/features/home/homeContent.js` | 直接：HomeView、FlexCarousel.onSelect → productById；间接：详情抽屉；ProductCard 由 catalog 复用 | `src/data/home-featured.test.js` 当前重算 rating 排序、不导入 HomeView；后续改为核对实际 homeContent，不能用旧测试证明新清单一致；保持下述 12 个 ID 顺序 |
| `src/components/ScrollFloat.jsx`、`ScrollFloat.css` | `src/features/home/components/visual/ScrollFloat.jsx`、`ScrollFloat.css`（同目录） | 直接：App:26/首页标题、Hero、精选；间接：HomeView | 无直接测试；GSAP/ScrollTrigger、media、RAF 与清理不变；同步第三方披露 |
| `src/components/FlexCarousel.jsx`、`FlexCarousel.css` | `src/features/home/components/visual/FlexCarousel.jsx`、`FlexCarousel.css`（同目录） | 直接：App:25 lazy、HomeView:469；间接：精选；组件:109 按需 import('ogl') | 无交互/真实 GPU 测试；保留 3.1 秒传参、拖动/键盘/wheel、暂停恢复、Observer 与失败回退 |
| `src/components/StrokeText.jsx`、`StrokeText.css` | 计划目标 `src/features/home/components/visual/StrokeText.jsx`、`StrokeText.css`（同目录） | 直接：App:27/474 首页收尾；**另有 BrandOpening.jsx:3/165**；间接：App → 品牌开幕 | 非首页独占；ARCH-08 必须更新现有 BrandOpening 引用；ARCH-10 移动开幕时再更新相对路径。最终共享归属须在相应阶段复核，不复制实现或在本步另建共享模块 |

本次只读计算的精选顺序：`armani-luminous-silk`、`nars-light-reflecting`、`nars-radiant-creamy`、`estee-lauder-double-wear`、`laura-mercier-translucent`、`ysl-touche-eclat`、`make-up-for-ever-hd`、`dior-forever-skin-glow`、`dior-forever-matte`、`ysl-all-hours`、`chanel-les-beiges`、`prada-reveal-skin`。这是当前源码的展示排序证据，不是新增编辑推荐或商品核验。

### ARCH-09 / ARCH-10：独立页面与应用装配

| 所属阶段 | 现有文件与职责 | 目标文件 | 直接和间接引用位置 | 相关测试 / 缺口 |
| --- | --- | --- | --- | --- |
| ARCH-09 | `src/App.jsx:686` GuideView 与内嵌 guides | `src/features/guide/components/GuideView.jsx` | 直接：App:339；间接：导航；onApplyFilter → chooseQuickFilter → 产品库 | 无页面测试；只抽实际页面和内容，不建空 Hook/Service |
| ARCH-09 | 同文件 CultureView:695 | `src/features/culture/components/CultureView.jsx` | 直接：App:341；间接：导航；onNavigate('library') | 无页面测试；保留文案和静态素材 |
| ARCH-10 | 同文件 Header:378、Footer:726、EnhancementBoundary:37 | `src/app/components/Header.jsx`、`Footer.jsx`、`EnhancementBoundary.jsx` | 直接：App 主布局；HomeView:467 精选错误回退使用 EnhancementBoundary；间接：首页与所有视图 | 无组件测试；移动边界时要更新 HomeView 的真实直接引用，避免 app ↔ home 循环（通过组合/传入边界等实际方案在该阶段决定） |
| ARCH-10 | `src/components/BrandOpening.jsx` | `src/app/opening/BrandOpening.jsx` | 直接：App:23/300；组件依赖 StrokeText；间接：首页开幕 | `src/components/BrandOpening.test.js` → `src/app/opening/BrandOpening.test.js`；2 项保留，跳过与锁滚动需浏览器回归 |
| ARCH-10 | `src/App.jsx:94` currentNavigationEntry、App:101 与其导航/菜单/产品页/抽屉连接 | `src/app/App.jsx` | 直接：`src/main.jsx:3`；间接：index.html → main → 全站；catalog/collection 状态使用已迁移 Hook | 导航 4 项仅纯函数保障；前进后退、scrollY/depth、深链接、Escape 和返回顶部需真实浏览器验证 |
| ARCH-10 | `src/main.jsx` | 原路径保留，App import 改向 `./app/App` | 直接：`index.html` script；间接：全站入口与全局 CSS | 生产构建；不改 StrictMode、挂载点和全局样式加载顺序 |
| ARCH-10/11 | `src/lib/navigation-history.js`、`navigation-history.test.js` | 两者原路径保留 | 直接：App:22、导航测试:2；间接：浏览器历史和深链接 | 4 项原样回归；lib 不反向依赖 features |

### 保留的数据、契约、样式与系统边界（ARCH-11 复核）

| 现有文件 | 目标 / 归属 | 直接和间接引用位置 | 测试与复核阶段 |
| --- | --- | --- | --- |
| `src/contracts/userProfile.js`、`makeupRequest.js`、`makeupPlan.js`、`assistant.js`、`product.js`、`index.js` | 六文件原路径保留；只有 JSDoc 和空导出 | index 通过 JSDoc import 类型；makeupPlan/makeupRequest 引用 profile；当前运行组件未导入这些契约 | 前置 YAS-2026-0055；ARCH-02/03 消费时核对，ARCH-11 总检；无 runtime schema 或专用契约测试 |
| `src/data/products.js` | 原路径唯一商品事实源 | 直接：App、小Y、工作台、2D 桌、相关测试、server/app.test.js、scripts/sync-product-verification.mjs、netlify/functions/api.js；间接：所有商品展示与网关受控候选 | 数据 7 项、首页 1 项、网关 22 项中的相关断言；ARCH-05/06/08/11 只更新消费引用，不改数据 |
| `src/data/product-image-sources.js`、`product-shade-verification.js`、`product-verification.reviewed.js` | 原路径保留 | products 富化；App 来源说明；product-verification 与测试；sync 脚本使用 reviewed；间接：详情/推荐/证据 | ARCH-06/11 复核；授权、价格与来源结论不因目录迁移升级 |
| `src/data/product-verification.js`、`product-verification.generated.js` | 原路径保留 | App:21 → 产品详情；verification 直接使用 generated/reviewed/shades；测试检验 public 证据和工作簿哈希 | `src/data/product-verification.test.js` 7 项保留原路径；不运行证据重生成 |
| `src/data/home-featured.test.js` | 目前原路径；ARCH-08 随首页实际内容职责迁至 `src/features/home/homeContent.test.js` | 直接：products 与 public 图片存在性；当前未导入 App | ARCH-08 调整引用，ARCH-11 确认 12 个精选与页面一致 |
| `src/styles.css`、`src/xiaoy.css` | 原路径保留 | main.jsx:4/5 全局导入；styles 含全站/首页/开幕/产品/文化；xiaoy 也含工作台与首页 CTA | ARCH-02/03/06/07/08/09/10/11 注意跨功能选择器和覆盖顺序；仅移动上述组件自带 CSS，不额外扩大本轮全局样式拆分 |
| `public/products/`、`public/assets/`、`public/verification/` | 原路径保留 | products 的绝对图片路径、视觉 CSS/JSX、核验证据；间接：所有图片/素材/证据链接 | 数据哈希测试与构建；ARCH-05/06/08/10/11 复核，不改素材或授权 |
| `server/`、`netlify/functions/api.js`、`netlify.toml`、`vite.config.js`、`scripts/`、`beauty-assistant.html` | 均保留，不在架构迁移中重写 | API 同源/代理、服务端数据读取、部署适配、证据生成、旧页备份；间接：前端成功/失败/降级 | ARCH-04/11 只验证接口兼容；后端/provider/Netlify 测试保留原路径；旧 memory 测试不运行 |

ARCH-11 还需扫描全部旧路径、重复实现、循环依赖与业务组件中的 fetch/localStorage，核对第三方披露路径，并完成桌面和 360px 手机的真实成功、失败、降级及控制台回归。本步没有提前开展这些最终验收。

## 4. 代码、文档差异与后续门禁

1. README 的“当前实际结构”沿用 master `0b93a18`，开发分支已有 contracts 只在目标段说明；本步将当前树明确切换为开发分支实测基线，并保留 master 差异说明。目标树仍未落地，依赖图改为明确的目标边界，附上当前真实调用链。
2. `StrokeText` 被首页和 BrandOpening 共用，目标树的“只服务首页的视觉组件”并不完全成立；当前路径不动，后续阶段需处理交叉引用。精选 EnhancementBoundary 当前也由 App 定义供 HomeView 使用，移动后不可制造 app/home 循环。
3. ARCH-07 原验收文字含“保持跨标签页同步”，但 App 仅初始化读取和同页写入，没有 storage 监听；本次只记录实际缺口，迁移不能无授权新增同步能力。
4. 目标 client 描述有超时能力，当前前端三处 fetch 都没有主动超时；ARCH-04 必须保持现有 API/错误/降级语义，不能以架构整理名义补功能。服务端超时测试不等于浏览器超时已实现。
5. 存储没有直接测试；小Y/开幕/2D/3D 测试主要为纯函数、数据与常量；目录/收藏、来源展示、加载/失败和视觉生命周期缺少组件或端到端测试。没有安装 RTL/Playwright，也未为本次文档工作添加测试。缺口归相关迁移阶段与 ARCH-11 的验收，不伪称已有覆盖。
6. 继承既有目标差异：`server/app.cjs` 仍接入 weather-provider，与目标的通用外部 provider 约定有差距；部分 informationSources 仍为品牌官网商品页；`src/data/product-verification.js:45` 及数据测试仍允许 e.tb.cn 短分享链接，与 AGENTS 6.4 的直接商品链接要求不同。现有测试通过仅证明当前实现，不证明最新政策合规；本步不改服务端、数据、链接或测试断言，仍需另行授权整改。
7. 构建体积、Three.js 警告、图片授权 pending、原始来源/商品事实待核验及其他既有公开门禁保留。没有重新开展外部事实或图片授权核验，详见累计数据审计。

## 5. 初次交付时的人工验收与版本状态

- 请核对本清单的真实源路径、目标阶段、直接/间接引用及测试缺口，README 的当前/目标区分，以及迁移计划 S03、累计报告和数据审计的一致性。
- 本步只修改文档；无运行代码、测试行为、UI、API、商品事实、存储 Key 或依赖变化；未创建 `src/features/`、`src/app/`、`src/lib/api/` 或 `src/lib/storage/`。
- 自动验证结果供人工复核；人工验收尚未进行。ARCH-00 保持 current，后续全部 pending；两份累计报告仅准备阶段收尾证据，不构成完成声明。
- 本步未提交、未推送、未创建阶段标签；修改后 SHA 不存在，不能用基线 SHA 冒充。现有可定位基线为 ce266c6；本步工作树内容尚不是 Git 恢复点。若未来获确认提交，按实际依赖使用 revert 并重新验证，不能恢复浏览器数据或外部状态。

## 6. 2026-11-17 上传授权（北京时间）

上节保留 2026-11-16 初次交付时的记录。负责人后续回复“上传到git上”，并要求“继续”，授权当前 ARCH-00-S03 五份文档在固定开发分支提交和推送；未增加运行代码或新测试。实际提交 SHA 与远端核验由本次交付回执给出，下次文档同步回填，不改写历史。没有新增页面人工复验记录；ARCH-00 保持 current，后续阶段 pending，未创建阶段标签，不宣称阶段归档。

## 7. 2026-11-17 整阶段验收与收尾（北京时间）

负责人在说明整阶段验收门禁后明确回复“完成验收”，确认 ARCH-00 人工验收通过。ARCH-00-S04 仅将验收结果、阶段状态及版本追溯纳入原五份文档，未修改上述映射或任何运行代码。S03 的实际提交为 `f16542c6a84ed9141ab955661008fcb1bbc06b6f`，已推送并核对真实远端 SHA，也是本步修改前基线；工作树和暂存区起始干净。采用公共规范仍为 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`。

ARCH-00 更新为 done，ARCH-01 至 ARCH-11 仍为 pending，当前无执行中的迁移阶段。测试/构建沿用第 2 节真实结果，未新增浏览器或商品核验；第 4 节全部风险保留。本阶段无新增核验，继承上一条结论。S04 最终确认提交及 `arch-stage-00` 的实际远端对象/提交指向由本次交付回执给出、下次同步回填；只有推送并核验成功后才对外交付阶段归档，历史待验收和未提交记录继续保留。

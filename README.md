# YasPretty 小Y

YasPretty 是一个面向普通消费者的个性化美妆决策项目。当前仓库处于“超级个体（OPC）·数字新消费”专项赛的参赛交付阶段，申报方向为“智慧生活与沉浸式新消费”。项目目标是形成多源信息驱动、结构化约束、可解释和可纠正的美妆决策流程。

> 当前状态：阶段 0、阶段 1、阶段 2 和阶段 3 已建立可追溯记录；阶段 3 实现提交为 `99b3ece`，tag 为 `v0.4.0-stage-3`。阶段 3 产品核验档案提交为 `f538ce2eec9b786cdb7f46c4faf6d2b8eb8dbd3a`，人工核验表导入提交为 `dfc8782bda48ece8a663970ffd7db0b79822f5c5`，两者均未建立 tag。现有版本可以运行、测试和构建；它仍不是正式公网发布版，照片分析、眉妆资料、产品体验评价的独立实测和图片明确授权尚未完成。

## 当前真实能力

- React + Vite 单页主站。
- 首页使用项目原创本地 Hero、字标与一次性品牌开幕；品牌开幕结束后提供可操作的 3D 化妆桌，WebGL 不可用时回退到 2D 品类桌，并支持跳过和减少动效偏好。
- 35 条彩妆资料：22 款粉底液、3 款气垫、3 款遮瑕、3 款散粉，以及阶段 3 新增的腮红、唇妆、睫毛膏和眼影资料。
- 35 张按稳定产品 ID 落位的 WebP 封面图；详情页展示逐张来源、权利人、采集日期、授权待核验状态和联系删除入口。
- 35 个可深链接访问的完整产品核验档案；111 份商品详情、参数和店铺截图按产品 ID 映射并记录 SHA-256，企业资质原图仅作内部留档。
- 搜索、肤质/妆效/遮瑕力/价格等筛选、排序和产品详情。
- 浏览器本地收藏及“想买 / 正在用 / 会回购”状态。
- 集成在主站中的小Y页面。
- 小Y的本地规则推荐，以及由服务端 `intentRouter` 编排的智谱对话、专门天气数据和联网搜索；产品库之外的问题统一从 `/api/assistant` 路由，不新增天气页面或独立天气 API。天气问题由服务端 Open-Meteo provider 返回经过校验的日期、温度、天气代码、降雨概率、风力和来源，不让模型改写天气数字。妆容类问题使用结构化 `/api/makeup-plans`，上游限流或模型输出无效时返回经过 schema 校验的本地 7 步方案。
- Fastify API 网关：服务端密钥、Zod schema、64 KiB 请求限制、超时、有限重试、每 IP 限流、单进程每日额度、安全头和脱敏日志。
- 73 项 Vitest 测试，覆盖小Y规则、统一意图路由、受控知识库、回答执行来源、专门天气 provider、天气缺少城市时的追问、参考来源、网关、智谱 provider、结构化方案及其限流降级、阶段 3 品类候选、产品证据文件、人工核验字段、淘宝/天猫商品链接门禁、品牌开幕、导航历史、3D 化妆桌性能档位和 Netlify API 适配。
- Windows 启动脚本和可通过的 Vite 生产构建。

以下能力尚未实现，不能在参赛材料或演示中描述为已完成：

- 照片上传、质量检查或 MediaPipe 分析。
- 眉妆仍无已核验商品；全部产品图片的明确再利用授权仍待核验。
- React 组件测试和 Playwright 端到端测试体系。
- 当前仓库已提供 Netlify Functions 同源 API 部署配置；公网站点需要重新部署并配置服务端环境变量后，才能使用在线智谱对话。账号体系或跨设备数据仍未实现。

## 数据与素材状态

当前 35 条产品封面统一位于 `public/products/<产品 ID>/cover.webp`，且全部 `authorizationStatus` 仍为 `pending`。截至 2026-11-02，33 张保留原始网页来源并按“来源披露、授权待核验”策略展示；FENTY BEAUTY 红毯气垫和 L’Oréal Paris 纷泽口袋眼影的替换图由项目负责人通过本地附件提供，但未附原始网页 URL，因此状态为 `blocked_missing_original_image_source`，只作内部核验展示。来源备注与联系删除机制不等于取得授权。

产品核验档案将 `产品核验信息/` 中的商品详情、参数和店铺截图同步到 `public/verification/<产品 ID>/`，生成文件清单、原始相对路径、大小和 SHA-256。当前 35/35 条产品具有详情证据、参数证据组和店铺截图，35/35 企业资质文件保持内部索引。`YasPretty-35款产品淘宝人工核验表.xlsx` 的 `淘宝人工核验!A6:S40` 已记录并完成复核：35/35 产品名称、官方或海外旗舰店身份、公司、商品匹配、规格、原价、淘宝商品链接、核验日期和完成状态已导入；工作簿没有店铺首页 URL，代码没有猜测或补造该字段。

页面中的 `rating` 是编辑示例维度，没有真实用户样本或统计来源，不得表述为用户评分、口碑统计或平台大数据。35/35 条人工核验记录已提供商品原价与规格，34/35 条参数截图可确认产地；SUQQU 参数截图未列产地，因此该字段继续明确显示为未核验。肤质、妆效、遮瑕、持妆、氧化和推荐评价仍是 YasPretty 编辑判断或待独立实测，不得冒充品牌结论或人体测试结果。首页 Hero、字标和手绘装饰来自 `public/assets/` 的项目原创素材集，创建方式与状态记录在 `asset-manifest.json`。

详见 [阶段交付与测试报告](docs/stage-delivery-test-report.md)、[阶段 0 基线](docs/phase-0-baseline.md) 和 [产品图片采集规则](docs/product-image-collection.md)。

## 本地运行

要求 Node.js 20 或更高版本。

```bash
npm ci
npm run dev
```

打开 <http://127.0.0.1:5174/>。前端开发服务器会把 `/api` 请求代理到 `http://127.0.0.1:8787`。

Windows 也可以双击 `启动YasPretty.bat`。`启动小鱼.bat` 同样启动当前 React + Vite 开发环境，文件名属于历史遗留。

只启动某一部分：

```bash
npm run dev:web
npm run dev:ai
```

核验目录内容发生变化后，重新生成网页证据副本和哈希清单：

```bash
npm run sync:verification
```

生产构建：

```bash
npm run build
npm start
```

生产构建由同一个 Fastify 服务在 <http://127.0.0.1:8787/> 提供页面与 API。`npm run preview` 是 `npm start` 的别名，不会重新构建。

### Netlify 部署

仓库根目录的 `netlify.toml` 会使用 `npm run build` 构建前端，并将 `/api/*` 同源转发到 `netlify/functions/api.js`。该函数复用现有 Fastify 网关，不会把智谱请求或密钥暴露给浏览器。

在 Netlify 的站点设置中添加服务端环境变量 `ZHIPU_API_KEY`（以及需要调整的 `ZHIPU_MODEL`、`ZHIPU_SEARCH_ENGINE`、限流和超时变量），然后重新部署。不要把 Key 写入 `VITE_*` 变量、前端代码、Git 或提交日志。部署后先访问 `/api/health`：返回 `services.assistant: true` 才表示小Y在线 AI 已配置；未配置时产品库和本地规则推荐仍可用。

当前仓库只准备了可复现的部署配置，未从编码环境直接发布或修改 Netlify 站点设置。公网部署完成后应再次验证小Y对话、联网失败降级和限流响应。

## 配置与密钥

`.env.example` 只提供无密钥模板。需要启用智谱能力时，在本机创建被 Git 忽略的 `.env`，由维护者配置 `ZHIPU_API_KEY`；普通用户界面不会显示或接收第三方 Key。当前参赛本机配置使用智谱 Model Code `glm-5.3-flash`，并通过服务端原始 HTTP `POST /api/paas/v4/chat/completions`、Bearer 鉴权和 JSON 请求体调用；`ZHIPU_MAX_TOKENS` 控制受控输出预算。联网检索使用独立 HTTP `POST /api/paas/v4/web_search`，默认 `search_std`。模型、超时、每分钟限制和每日额度均由服务端环境变量控制。

`server/key.txt` 和浏览器 Authorization 兼容路径已经退出主流程。小Y首次加载时会删除两个旧版本的浏览器 AI 配置键，避免遗留 Key 继续保存在 `localStorage`。没有服务端 Key 时，健康检查会将 AI 标为未配置，产品浏览和本地规则推荐仍可使用；产品库之外的通用问题和联网检索返回明确降级错误。

小Y包含一个受控知识库，当前覆盖肤质自述观察、新产品局部试用/不适处理、化妆品功效宣称边界，以及底妆教程、色号基础、遮瑕顺序、刷具选择、偏油底妆技巧、快速日常妆、柔和浓妆和清透水光风格语言。知识条目按关键词和意图优先选择，最多注入少量相关条目；不能覆盖站内产品事实、实时检索或医疗诊断。模型超时后可直接返回已审核条目和参考来源。来源包括 AAD、FDA、Maybelline、L'Oréal Paris 和 Bobbi Brown 的已检查页面；教程与风格页面只支持通用步骤和编辑性风格描述，不支持产品功效保证。小Y回答默认使用亲切短句、先给结论、少术语，知识回退会压缩为关键句。新增知识必须记录支持范围、参考 URL 和复核日期，不允许把任意网页批量抓取后直接交给模型。

助手 API 会区分 `model`、`knowledge`、`weather`、`search` 和 `clarification` 五种回答来源；模型成功回答同时返回实际 Model Code，前端显示 `glm-5.3-flash`。`weather` 表示服务端天气 provider 已取得并校验天气事实，界面展示数据来源和获取时间；`search` 表示联网来源已经取得、但模型未在交互时限内完成组织，界面会直接展示来源摘要且不冒充模型回答。肤质判断问题进入自述观察指南，不再触发商品推荐；天气问题缺少城市时先追问地点，不调用模型。

仓库曾发现一枚写在旧版 HTML 中的凭据，现已从文件移除。项目负责人仍须在智谱控制台吊销并轮换它，因为从工作区删除不能证明该凭据从未被复制或使用。

## 数据与隐私边界

- 收藏、小Y画像和最近对话目前保存在浏览器 `localStorage`；小Y画像和对话已使用版本化存储封装。
- 新网关不再提供 `/memory`，也不会读取旧 `server/memory/` 文件；旧数据原样保留在本机并继续被 Git 忽略。
- 当前没有照片上传或照片分析能力。
- 不要把真实用户照片、对话、画像、本地记忆或 API Key 加入代码、截图、比赛材料或 Git。
- API 不返回无条件跨域头；开发环境通过 Vite 同源代理，生产构建由 Fastify 同源提供。
- 当前限额是单进程内存实现，服务重启会重置，也不能跨多个实例共享；正式多实例部署前需要外部额度存储。

## 项目架构

前端架构迁移的当前阶段、允许修改范围、阶段门禁和真实执行记录见 [前端架构迁移计划](docs/frontend-architecture-migration-plan.md)。开始任何前端目录、模块、组件或依赖调整前，必须先阅读该计划并只执行唯一标记为 `current` 的阶段。

`master` 保存公共规范、架构目标和迁移计划基线；`codex/frontend-contracts-yas-2026-0055` 承载架构阶段的代码、测试和配套执行记录。公共规范先经授权提交到 `master`，再选择性同步到开发分支；阶段变更与其 README、迁移计划、验收及审计记录一起提交到开发分支，不自动合并回 `master`。

每次架构任务开始、提交前，先 `git fetch origin master`，读取最新 `origin/master:AGENTS.md` 及远端文档公共约定，核对开发分支规则副本并记录规范来源 SHA。未同步的公共规则先处理，开发分支的阶段进度须保留；不能联网核验时明确说明并只做只读检查。详见 `AGENTS.md` 13.3。

### 当前实际结构

以下主树描述开发分支 `codex/frontend-contracts-yas-2026-0055` 在 `ce266c654709506fe36340da21874676b382a239` 的实际结构（2026-11-16，北京时间，ARCH-00-S03 只读核对）。本次采用的公共规范为远端 `master` 的 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`；master 尚无下列六个 contracts 文件。当前没有 `src/app/`、`src/features/`、`src/lib/api/` 或 `src/lib/storage/`，不得将目标目录描述为已实现。

```text
yaspretty/
├── src/
│   ├── App.jsx                         主站、页面组合、产品库、详情与收藏
│   ├── main.jsx                        React 挂载与全局样式入口
│   ├── styles.css                      全局样式
│   ├── xiaoy.css                       小Y样式
│   │
│   ├── components/
│   │   ├── BrandOpening.jsx            一次性品牌开幕、跳过与减少动效处理
│   │   ├── XiaoYAssistant.jsx          小Y界面、本地规则与 YasPretty API 调用
│   │   ├── MakeupWorkbench.jsx         结构化妆容工作台
│   │   ├── MakeupTable3D.jsx           交互式 3D 化妆桌入口
│   │   ├── MakeupTable.jsx             2D 品类桌回退
│   │   ├── FlexCarousel.jsx            首页产品增强轮播
│   │   ├── ScrollFloat.jsx             首页滚动文字动效
│   │   ├── StrokeText.jsx              笔画文字动效
│   │   └── makeup-table-3d/            Three.js 场景、妆具、粒子和性能配置
│   │
│   ├── contracts/                      六个 JSDoc 契约文件，无运行时校验
│   │   ├── userProfile.js
│   │   ├── makeupRequest.js
│   │   ├── makeupPlan.js
│   │   ├── assistant.js
│   │   ├── product.js
│   │   └── index.js
│   │
│   ├── data/
│   │   ├── products.js                 当前 35 条受控彩妆资料与来源状态
│   │   ├── product-image-sources.js    产品封面来源、权利人和授权状态
│   │   ├── product-verification.js     核验状态、链接门禁和参数解读边界
│   │   ├── product-verification.generated.js 证据路径、大小与 SHA-256 清单
│   │   ├── product-verification.reviewed.js  人工核验事实与单元格追溯
│   │   └── product-shade-verification.js     色号核验资料
│   │
│   └── lib/
│       ├── navigation-history.js       导航与浏览器历史工具
│       └── xiaoy-storage.js            版本化匿名画像、对话与旧 Key 清理
│
├── public/
│   ├── products/                       按稳定产品 ID 存放的 WebP 产品封面
│   ├── assets/                         原创字标、Hero、手绘素材及来源清单
│   └── verification/                   按稳定产品 ID 存放的网页证据副本
│
├── server/
│   ├── fishtalk-server.cjs             Fastify 网关启动入口
│   ├── app.cjs                         API、安全控制、限流与同源静态服务
│   ├── providers/                      智谱、天气和外部检索适配器
│   └── services/                       服务端智能体编排
│
├── scripts/
│   └── sync-product-verification.mjs   从原始核验目录重复生成网页证据
├── netlify/
│   └── functions/api.js                复用 Fastify 网关的 Functions 适配器
├── docs/
│   ├── frontend-architecture-migration-plan.md 当前架构迁移阶段、约束与执行记录
│   ├── frontend-architecture-migration-inventory.md ARCH-00 源码引用、目标映射与测试缺口
│   ├── phase-0-baseline.md             安全扫描、功能与构建基线
│   ├── phase-1-ai-gateway.md           阶段 1 架构、测试与风险记录
│   ├── stage-delivery-test-report.md   各阶段作用、测试证据与剩余风险
│   └── product-image-collection.md     图片采集与授权要求
├── netlify.toml                        Netlify 构建与同源 API 重写配置
└── beauty-assistant.html               旧独立页备份，不继续扩展
```

组件自带 CSS 目前仍在 `src/components/`：`MakeupTable.css`、`MakeupTable3D.css`、`FlexCarousel.css`、`ScrollFloat.css`、`StrokeText.css`，以及 `makeup-table-3d/GhostCursor.css`。3D 内部实际文件为 `Scene.jsx`、`CosmeticItem.jsx`、`DressingTable.jsx`、`ParticleBurst.jsx`、`GhostCursor.jsx`、`cosmetics.js` 和 `performance-profile.js`。

当前 12 个 Vitest 文件分布在 `src/components/`（4）、`src/data/`（2）、`src/lib/`（1）、`server/`（4，含子目录）和 `tests/`（1）；没有把全部组件交互或浏览器流程覆盖为自动化测试。逐文件范围与后续迁移位置见 [ARCH-00 迁移清单](docs/frontend-architecture-migration-inventory.md)。

### 前端目标结构（迁移中）

开发分支的 `86b25b3` 已建立上述 `src/contracts/` 六个文件，这是前置实现提交，不是本次迁移基线 HEAD；公共 master 基线未包含它们。开发分支的演示材料和已有历史报告继续保留，公共规范同步不搬移或删除这些差异。

下列 `app/`、`features/`、`lib/api/` 和 `lib/storage/` 仍是开发分支待逐步实施的目标，不得据此描述为已经完成模块化。迁移时不改变现有 UI、API、推荐规则、存储 Key 或产品事实，也不创建没有实际职责的空目录和空文件。

```text
src/
├── app/                                应用装配、导航和跨功能连接
│   ├── App.jsx
│   ├── opening/
│   │   └── BrandOpening.jsx            应用品牌开场动画
│   └── components/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── EnhancementBoundary.jsx     视觉增强失败边界
│
├── features/
│   ├── home/                           首页内容与编辑精选
│   │   ├── components/
│   │   │   ├── HomeView.jsx
│   │   │   ├── HeroSection.jsx         Slogan、首屏文案和主 CTA
│   │   │   ├── EditorSelection.jsx
│   │   │   ├── HomeProductSection.jsx
│   │   │   └── visual/                 首页视觉；StrokeText 另被品牌开幕复用
│   │   │       ├── ScrollFloat.jsx
│   │   │       ├── StrokeText.jsx
│   │   │       └── FlexCarousel.jsx
│   │   └── homeContent.js              首页文案、精选产品 ID 和展示顺序
│   │
│   ├── makeup-table/                   2D/3D 化妆台体验及降级
│   │   ├── components/
│   │   │   ├── MakeupTableExperience.jsx
│   │   │   ├── MakeupTable3D.jsx
│   │   │   └── MakeupTable.jsx
│   │   └── makeup-table-3d/            Three.js 场景内部实现
│   │
│   ├── catalog/                        产品浏览、筛选和详情
│   │   ├── components/
│   │   │   ├── LibraryView.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── ProductProfile.jsx
│   │   │   └── ProductDetailDrawer.jsx
│   │   ├── hooks/useCatalog.js
│   │   ├── catalogService.js           产品读取和按 ID 查询
│   │   └── catalogUtils.js             文本匹配、筛选和排序纯函数
│   │
│   ├── assistant/                      小Y智能助手
│   │   ├── components/
│   │   │   ├── XiaoYAssistant.jsx
│   │   │   ├── AssistantMessages.jsx
│   │   │   ├── ProfileSummary.jsx
│   │   │   ├── AssistantProduct.jsx
│   │   │   └── SourceList.jsx
│   │   ├── hooks/useAssistant.js       消息、画像、发送和降级流程
│   │   ├── assistantApi.js             /api/assistant 业务请求
│   │   ├── intentUtils.js              前端流程意图判断
│   │   └── assistantUtils.js           画像提取、本地推荐和消息格式化
│   │
│   ├── makeup-plan/                    结构化妆容方案
│   │   ├── components/
│   │   │   ├── MakeupWorkbench.jsx
│   │   │   ├── MakeupPlanForm.jsx
│   │   │   ├── PlanResult.jsx
│   │   │   └── PlanProduct.jsx
│   │   ├── hooks/useMakeupPlan.js
│   │   ├── makeupPlanApi.js            /api/makeup-plans 业务请求
│   │   └── makeupPlanUtils.js          表单与 API 数据结构转换
│   │
│   ├── collection/                     收藏与试用状态
│   │   ├── components/
│   │   │   ├── CollectionView.jsx
│   │   │   └── CollectionStatusControl.jsx
│   │   ├── hooks/useCollection.js
│   │   ├── collectionStorage.js        收藏持久化和旧 Key 兼容
│   │   └── collectionUtils.js
│   │
│   ├── guide/components/GuideView.jsx  肤质与美妆指南
│   └── culture/components/CultureView.jsx 品牌文化页面
│
├── lib/                                不含具体业务的公共技术能力
│   ├── api/
│   │   ├── client.js                   fetch、JSON、超时和响应检查
│   │   ├── errors.js                   网络、超时和业务错误分类
│   │   └── endpoints.js                API 路径常量
│   ├── storage/
│   │   ├── storageClient.js            JSON 读写、版本包装和异常处理
│   │   ├── storageKeys.js              当前 Key 和旧 Key
│   │   ├── migrations.js               本地数据迁移
│   │   └── clearUserData.js            用户数据和旧凭据清理
│   └── navigation-history.js
│
├── contracts/                          JSDoc 数据契约，不复制服务端 Zod
│   ├── userProfile.js
│   ├── makeupRequest.js
│   ├── makeupPlan.js
│   ├── assistant.js
│   ├── product.js
│   └── index.js
│
├── data/                               沿用当前受控产品事实和核验资料
├── main.jsx
├── styles.css
└── xiaoy.css
```

测试文件与对应源码就近放置。`data/` 继续作为产品事实唯一数据源；`homeContent.js` 只保存精选产品 ID 和展示内容，不复制产品信息。图片、模型、纹理等静态资源继续放在 `public/`。

### 依赖边界（目标，尚未全面落地）

当前真实入口为 `main.jsx → App.jsx`；App 直接组合内嵌页面与 `components/` 中的小Y、品牌开幕及视觉组件，小Y再组合工作台。产品库与收藏仍在 App，三处业务 fetch 仍在小Y/工作台，收藏直接读写 localStorage；小Y画像与消息使用 `lib/xiaoy-storage.js`。contracts 当前只有 JSDoc，没有运行时导入或校验。下面是后续阶段约束，不是当前已实现依赖图。

```text
main.jsx → app → features → lib/api、lib/storage
                    │
                    ├──→ contracts
                    └──→ data

home       → makeup-table、catalog
assistant  → makeup-plan
collection → lib/storage
catalog    → data
```

`lib` 不依赖 `features`，`contracts` 不保存业务数据，`makeup-plan` 不反向依赖 `assistant`。组件负责展示，Hooks 负责状态和流程，业务 API 负责请求适配，Utils 保持为可独立测试的纯函数。

实际引用还要求在相应阶段复核：BrandOpening 也使用 StrokeText；首页精选使用 App 定义的 EnhancementBoundary；产品详情使用收藏状态控件，catalog 需要单向消费 collection 的展示组件。迁移不得产生 app/home 或 catalog/collection 循环依赖，也不得复制共享实现。全局 `styles.css`、`xiaoy.css` 仍由 main 按现有顺序加载，后者也包含工作台及首页 CTA 样式。本步仅记录这些依赖，未开始后续阶段。

### 架构文档同步规则

任何新增、删除、移动目录或模块，以及改变模块职责、依赖关系、数据流或迁移状态的变更，都必须在开发分支的同一次阶段变更中同步更新本节的“当前实际结构”和迁移计划中的阶段状态，并标明对应分支；目标尚未落地时只能更新“前端目标结构（迁移中）”，不得写成已完成。公共规范在 master 更新时保留开发分支进度与主分支状态的区别；更新时同时核对正文和第三方披露中的文件路径，确保树状图名称、层级、职责与对应分支实际代码一致。

### 提交、人工验收与回退

架构迁移按可独立构建和回退的小步提交。开始修改和提交、推送前核对任务对应分支、HEAD、工作树、暂存区及远端状态。每小步使用唯一的 `ARCH-XX-SNN` 编号，先记录问题或迁移原因、修改前基线 SHA 和验证方法；通过自动测试、必要构建和 `git diff --check` 后，交项目负责人人工测试确认，确认后才可提交并推送开发分支。公共规范提交到 master 另须对此次文档变更的明确授权。提交信息使用 `【问题】[ARCH-XX][ARCH-XX-SNN] … 【修改】…`，已有 YAS 编号同时保留。

完整阶段的最终状态和验收记录纳入收尾提交后，在该提交上创建带注释的唯一 `arch-stage-XX` 标签并推送。迁移计划和累计交付记录关联修改前后 SHA、测试、人工确认与标签；推送后核对远端分支 SHA 和标签指向，未成功时明确标记待推送或待标签。详细门禁见 `AGENTS.md` 13.2 和迁移计划 5.1。

公共历史回退优先使用 `git revert <sha>`，按后续依赖从新到旧撤销必要提交，保留故障现象、原提交、反向提交和复验记录；不强推、不移动阶段标签。每个已验收提交都是可定位的代码恢复点，但回退仍须处理可能的依赖与冲突并重新验证。未提交修改、未跟踪文件和临时 stash 尚未形成版本回退点；Git 不负责恢复浏览器数据、环境变量或外部服务状态。

## 第三方能力披露

- React、React DOM、Vite、Lucide React 和 concurrently。
- 交互式化妆桌使用 Three.js、React Three Fiber、Drei、GSAP 与 Framer Motion；Three.js/R3F/Drei/Framer Motion 为 MIT，GSAP 使用 Standard "no charge" license。3D 场景按需加载，全部妆具由基础几何体生成，不包含 GLB、远程贴图或第三方产品模型。
- Fastify、Zod、`@fastify/helmet`、`@fastify/rate-limit`、`@fastify/static`、dotenv 和 Vitest；除 dotenv 为 BSD-2-Clause 外，其余这些新增依赖为 MIT 许可证。
- 智谱 GLM 与 Web Search API：可选的语言模型和联网检索，只通过服务端 provider 调用；搜索引擎由 `ZHIPU_SEARCH_ENGINE` 控制，默认使用成本更低的 `search_std`。
- Open-Meteo 天气 API：通过服务端 provider 查询城市坐标和天气预报，不需要用户提供 API Key；页面显示 Open-Meteo 来源、获取时间和预报会更新的限制说明，具体授权和归属以其官方条款为准。
- 外部检索：通过智谱 `POST /api/paas/v4/web_search` 按意图路由按需调用并披露来源；检索结果仍视为不可信资料，来源冲突时不会伪装成确定事实。
- 笔画文字动效：参考 React Bits `StrokeText` 的 SVG 分层结构（[源码](https://github.com/DavidHDev/react-bits/tree/main/src/content/TextAnimations/StrokeText)，[许可证](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)，MIT + Commons Clause，检索于 2026-11-04）；`src/components/StrokeText.jsx` 为不依赖 GSAP 的本地 CSS/IntersectionObserver 适配，未引入 React Bits 的运行时依赖。
- 首页滚动标题：参考 React Bits `ScrollFloat` 的字符拆分和 GSAP/ScrollTrigger 生命周期（[源码说明](https://reactbits.dev/components/scroll-float)，[上游仓库](https://github.com/DavidHDev/react-bits)，MIT + Commons Clause，检索于 2026-11-05）；`src/components/ScrollFloat.jsx` 仅保留 transform/opacity 滚动进入、语义标签、中文字符拆分和 reduced-motion 处理。
- 首页产品增强轮播：参考 React Bits `FlexCarousel` 的受控产品项、拖动/键盘/滚轮交互和 OGL 资源清理（[源码说明](https://reactbits.dev/components/flex-carousel)，[上游仓库](https://github.com/DavidHDev/react-bits)，MIT + Commons Clause，检索于 2026-11-05）；`src/components/FlexCarousel.jsx` 使用 YasPretty 本地产品图片，不使用示例远程图片，`ogl@1.0.11` 为 Unlicense，懒加载并在 WebGL/增强层不可用时回退现有 `ProductCard` 网格。
- 化妆桌幽灵光标：使用 React Bits `GhostCursor` 的 WebGL 烟雾实现（[组件说明与源码](https://reactbits.dev/components/ghost-cursor)，[上游仓库](https://github.com/DavidHDev/react-bits)，[许可证](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)，MIT + Commons Clause，代码接入于 2026-11-04）；本地仅调整颜色、粒子预算、移动端性能参数和化妆桌显示生命周期，源码位于 `src/components/makeup-table-3d/GhostCursor.jsx`。
- YasPretty 原创品牌素材：首页 Hero、字标和手绘元素由项目视觉规范衍生并以代码绘制，来源与创建方式见 `public/assets/asset-manifest.json`。
- 3D 化妆桌视觉参考：项目负责人于 2026-11-04 提供两张粉色手绘妆台/妆具参考图，仅用于构图、品类与色彩方向；原图不进入生产包，不作为产品图片，也不宣称由项目创作或已获再利用授权。
- 产品封面：23 张来自品牌官网页面、11 张来自零售商页面、1 张来自媒体页面；逐张链接见产品详情，授权状态均为待核验。
- MediaPipe：规划中的浏览器端视觉能力，当前尚未接入。

依赖许可证以各项目自身许可证为准。仓库自己的 LICENSE 和完整第三方资源清单尚未补齐，因此当前仓库不可视为已具备公开发布条件。

## 验证状态

首页全组件入场与轮播节奏复核（2026-11-05，北京时间，`YAS-2026-0032`）：Hero 的眉标、说明、两行 slogan、描述、方案入口、搜索框、快捷筛选和背景素材均加入分层入场；产品轮播自动切换间隔调整为 3.2 秒，卡片过渡改为更平滑的缓动，拖动时暂时关闭过渡并提前加载当前/下一张图片，以减少停顿感。`npm test -- --run` 通过，9 个测试文件、49/49 项；`npm run build` 通过，Vite 转换 2859 个模块；`git diff --check` 通过。真实触摸和 GPU 透镜效果仍需现场复验。
Hero 图片与整区动效复核（2026-11-05，北京时间，`YAS-2026-0034`）：Hero 背景图片增加慢速进入、轻微漂移和柔和扫光层，Hero 外壳、内容列、角标、按钮、搜索框和快捷筛选保持分层入场；桌面端描述文案保持单行，680px 以下移动端恢复自然换行。动效仅使用 opacity、transform 和背景叠层，不改变搜索、方案入口或产品数据。`npm test -- --run` 通过，9 个测试文件、49/49 项；`npm run build` 通过；`git diff --check` 通过。真实 GPU 像素效果仍需现场复验。
编辑精选与 Hero 排版节奏复核（2026-11-05，北京时间，`YAS-2026-0035`）：编辑精选自动切换调整为约 3.1 秒，轨道位移改为 680ms 平滑缓动，活动卡片抬升增加独立过渡；Hero 内容列扩大并增加标题、描述、按钮、搜索框与快捷筛选之间的留白，移动端继续自动换行。`npm test -- --run` 通过，9 个测试文件、49/49 项；`npm run build` 通过；`git diff --check` 通过。

阶段 3 图片接入补充复验（2026-10-29，北京时间）：`npm test` 为 3 个测试文件、27/27 通过；`npm run build` 通过，Vite 转换 1789 个模块。35/35 个产品 ID 均能映射到本地 WebP 封面和来源记录，公开状态统一为“来源已披露、授权待核验”。本阶段没有使用真实 Key 发起付费智谱调用。

产品核验档案补充复验（2026-11-01，北京时间，`YAS-2026-0012`）：`npm test` 为 4 个测试文件、31/31 通过；`npm run build` 通过，Vite 转换 1791 个模块。桌面 1440px 和手机 390px 已检查产品深链接、参数表、编辑解读和证据列表。淘宝/天猫商品链接仍为 0/35 已核验，产品事实与图片授权状态没有因本次接入而升级。

人工核验表导入复验（2026-11-01，北京时间，`YAS-2026-0013`）：`npm run check` 通过，包含 4 个测试文件、32/32 项和 Vite 生产构建，构建转换 1792 个模块；`git diff --check` 通过。35/35 条核验表记录已导入名称、店铺身份、公司、商品匹配、规格、价格、商品链接、日期和状态，34/35 条产地由参数截图确认。Chrome 桌面 1440 × 3000、手机 390 × 3000 和产品深链接 HTTP 200 已复验。SUQQU 产地、FENTY 封面来源匹配及全部产品图片授权仍保留为可见风险。

GitHub 同步前复验（2026-11-04，北京时间，`YAS-2026-0024`）：`npm run check` 通过，包含 8 个测试文件、47/47 项和 Vite 生产构建，构建转换 2789 个模块；`git diff --check` 通过。构建仍提示 3D 异步块约 1.21 MB，`npm audit` 仍报告 `@fastify/static -> glob/minimatch` 依赖链中的 3 个中等级漏洞；两项均已记录为后续风险，不表述为已解决。

首页滚动动效完整提示词复核（2026-11-05，北京时间，`YAS-2026-0030`）：`npm test -- --run` 通过，9 个测试文件、49/49 项；`npm run build` 通过，Vite 转换 2859 个模块；`git diff --check` 通过。新增的首页 12 项精选轮播、动效生命周期回退和图片/设备失败路径均不改变产品事实或授权状态。真实移动设备触摸、GPU 开启环境的 OGL 透镜像素效果和 3D 实际交互仍需现场复验；构建仍提示 3D 异步块超过 500 KB。

首页轮播交互复核（2026-11-05，北京时间，`YAS-2026-0031`）：`FlexCarousel` 已按 4.5 秒间隔自动切换；点击、拖动、键盘、焦点和滚轮操作会短暂停止自动播放，离开轮播或交互结束后恢复。轮播根节点使用非 passive 原生 `wheel` 监听并调用 `preventDefault()`/`stopPropagation()`，同时对惯性滚轮做 420ms 节流，避免页面跟随滚轮移动或一次跳过多张。`ScrollFloat` 增加 GSAP 初始状态设置，并将三个首页标题的触发点提前到进入视口约 88% 处，使字符浮入在快速滚动时仍可见。验证仍以 `npm test -- --run`、`npm run build` 和 `git diff --check` 为准；真实触摸设备、GPU 开启环境的透镜像素效果仍需现场复验。

旧 `server/test-memory.cjs` 已归档，它会清空本地记忆且依赖已退出主流程的 `/memory`，不属于当前测试套件。

后续实施顺序与验收边界见 [AGENTS.md](AGENTS.md) 和 [FINAL-PROMPT.md](FINAL-PROMPT.md)。未经项目负责人确认，只推进当前明确授权的阶段。

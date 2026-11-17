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
- master 当前工作树包含 259 项 Vitest 测试，覆盖小Y规则、统一意图路由、受控知识库、回答执行来源、专门天气 provider、天气缺少城市时的追问、参考来源、网关、智谱 provider、结构化方案及其限流降级、阶段 3 品类候选、产品证据文件、人工核验字段、淘宝/天猫商品链接门禁、品牌开幕、导航历史、3D 化妆桌性能档位、catalog筛选/排序/状态/组件边界和 Netlify API 适配。
- Windows 启动脚本和可通过的 Vite 生产构建。

以下能力尚未实现，不能在参赛材料或演示中描述为已完成：

- 照片上传、质量检查或 MediaPipe 分析。
- 眉妆仍无已核验商品；全部产品图片的明确再利用授权仍待核验。
- 完整的 React Testing Library 与 Playwright CI 体系；当前 master 工作树已有就近组件边界测试和独立 Playwright 回归脚本，覆盖范围见下文。
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

架构代码、测试、公共规范、README、迁移计划和累计报告统一在 `master` 开发与验证，不再使用原开发分支或执行双分支规范同步。ARCH-00～ARCH-04 原在 `codex/frontend-contracts-yas-2026-0055` 完成的提交、标签、人工确认/明确豁免和执行证据全部保留。

开始架构任务及提交、推送前，先 `git fetch origin master`，核对 master 的 HEAD、工作树、暂存区、实际远端和相关标签；master 仅以 fast-forward 更新。状态不符、来源不明修改、远端领先/分叉或标签缺失时先询问，不自动清理或覆盖。详见 `AGENTS.md` 13.3。

### 当前实际结构

以下主树描述 master 当前实际工作树（2026-11-17，北京时间）：contracts、storage、makeup-plan、assistant、lib/api 和 makeup-table 已验收归档；ARCH-05 最终提交及实际远端 master 为 bf988460ae8c9611eaae21adb02a34c3bfc53fa1，带注释 arch-stage-05 的本地/远端对象均为 11b0d3e419b1fe642e3ed650fb07b9fc4ab9ceba、指向该提交，11:38 与 12:19 实际查询一致。ARCH-06 catalog 已完成本地迁移、自动验证，并获项目负责人于 2026-11-17 明确回复“人工验收通过 继续”，现为 done；ARCH-07 collection 为唯一 current、尚未实施，ARCH-08～11 pending，src/app/ 尚未建立。本次仅收尾已验收 ARCH-06；实际提交、推送和 arch-stage-06 对象/指向由完成后的交付回执提供、下次文档同步回填，不把尚未执行的 Git 操作写成已归档。普通合并 8caf4dcdad416a2a8fbc6057a7f5a289403e9a1c、纯文档归档 3b7ceee79576d8d38ff3821d1d688914d49c2f18 及原开发分支归档/删除证据保留于[迁移计划分支切换记录](docs/frontend-architecture-migration-plan.md#52-2026-11-17-分支切换记录)。以下历史验收仅对应各自范围，不扩充真实设备/provider 的验证结论。

ARCH-00 已通过人工验收并归档：S03 为 `f16542c6a84ed9141ab955661008fcb1bbc06b6f`，S04 为 `8c95966cf61367396fd6783da1f86c8569546668`；带注释的 `arch-stage-00` 对象 `cb811573c820bc01bd5ee5628f24c5e30fc6600e` 指向 S04。ARCH-01-S01 已将旧 `src/lib/xiaoy-storage.js` 拆入下列四个 storage 模块并更新小Y直接调用，未保留转发入口；相关 40/40、全量 113/113、构建及桌面/360px 的 14 项 Playwright 页面复测通过。负责人于 2026-11-17 明确确认人工验收通过，实际提交为 `5e58236f6897147b354153ea9b02d080641a3cea`；远端 `arch-stage-01` 对象 `ba59303891315291dcdab02b6906971b1799d339` 指向该提交，启动预检已核对。两阶段保持 `done`，历史基线与映射分别见 [ARCH-00 迁移清单](docs/frontend-architecture-migration-inventory.md)和[迁移计划 ARCH-01](docs/frontend-architecture-migration-plan.md#arch-01libstorage)。

ARCH-02 已通过整阶段人工验收并归档，状态为 `done`。S01 纯转换提交为 `aa564870`；S02 将方案 API、工作台状态/流程及表单/结果/产品展示迁入 `features/makeup-plan/`，原组件路径删除，小Y同步引用并共享唯一方案请求。2026-11-17 启动复核确认 S02 收尾提交与实际远端均为 `f0d02eb64ced01c0fd1fa5fc210eb687050620e5`；带注释的 `arch-stage-02` 远端对象 `47a9d3a27bf11a305c2ecb94eacea0e99195b2af` 指向该提交。S02 的相关 76/76、全量 138/138、构建及最终桌面/360px 14/14 证据保留；严格像素几何差异及真实设备/provider 等限制见迁移计划，不因归档升级验证结论。

ARCH-03、ARCH-04 均为 `done`；原归档时无 current 的快照保留于执行记录，当时按负责人确认将 ARCH-05 登记为唯一 current；ARCH-05归档时已实施并人工验收通过，ARCH-06当时只登记为下一阶段；当前ARCH-06状态见本节最新说明。S01 前端意图工具、S02 业务纯函数、S03 API 已分别人工验收并推送 `a7222feca91c90160a69114e702a851802342e0f`、`42585e110e0d19a611b6565a9c79d0cb24a143c5`、`e119a44843d2604e85e467df9de5b7c80b2ee1c3`。S04 状态/存储/发送与降级 Hook 已按负责人最新授权提交并推送 `7ce13eded4261d0e2afa43df4cf2fa2ba702793f`。S05 将消息、画像、产品和来源展示迁入四个实际组件，XiaoYAssistant 留作组合入口；原业务/存储断言保留，全部测试就近。负责人原话“剩下的不用人工核验，全部尽快完成”，据此免除 ARCH-03 的 S04/S05 人工核验等待，不记为已经执行人工测试。本次回填已核对的收尾提交 `bf7e2254001fe3cc1fa7619c925fb3a8a00d456c`；唯一带注释 `arch-stage-03` 的远端对象为 `b8bacb242f91983b471ccd097470aca6287d5152`，指向该提交。ARCH-03 的豁免不扩张到 ARCH-04。

```text
yaspretty/
├── src/
│   ├── App.jsx                         页面组合、导航、详情连接与共享收藏状态
│   ├── main.jsx                        React 挂载与全局样式入口
│   ├── styles.css                      全局样式
│   ├── xiaoy.css                       小Y样式
│   │
│   ├── components/
│   │   ├── BrandOpening.jsx            一次性品牌开幕、跳过与减少动效处理
│   │   ├── XiaoYAssistant.jsx          小Y组合入口、输入及工作台连接
│   │   ├── FlexCarousel.jsx            首页产品增强轮播
│   │   ├── ScrollFloat.jsx             首页滚动文字动效
│   │   └── StrokeText.jsx              笔画文字动效
│   │
│   ├── contracts/                      六个 JSDoc 契约文件，无运行时校验
│   │   ├── userProfile.js
│   │   ├── makeupRequest.js
│   │   ├── makeupPlan.js
│   │   ├── assistant.js
│   │   ├── product.js
│   │   └── index.js
│   │
│   ├── features/
│   │   ├── assistant/
│   │   │   ├── components/
│   │   │   │   ├── AssistantMessages.jsx 消息、加载与真实产品 ID 展示
│   │   │   │   ├── AssistantMessages.test.jsx
│   │   │   │   ├── ProfileSummary.jsx   当前画像摘要
│   │   │   │   ├── ProfileSummary.test.jsx
│   │   │   │   ├── AssistantProduct.jsx 推荐产品与详情入口
│   │   │   │   ├── AssistantProduct.test.jsx
│   │   │   │   ├── SourceList.jsx       来源顺序、链接与展示
│   │   │   │   └── SourceList.test.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAssistant.js     消息、画像、存储、发送与降级
│   │   │   │   ├── useAssistant.test.js
│   │   │   │   └── useAssistant.storage.test.js
│   │   │   ├── intentUtils.js          前端流程判断与共用产品提及匹配
│   │   │   ├── intentUtils.test.js
│   │   │   ├── assistantUtils.js       画像、推荐、本地回复与方案消息适配
│   │   │   ├── assistantUtils.test.js
│   │   │   ├── assistantApi.js         小Y请求、响应适配与方案 API 复用
│   │   │   └── assistantApi.test.js
│   │   ├── makeup-plan/
│   │   │   ├── components/
│   │   │   │   ├── MakeupWorkbench.jsx 工作台标题、状态、表单和结果组合
│   │   │   │   ├── MakeupPlanForm.jsx  需求表单与选项
│   │   │   │   ├── PlanResult.jsx      方案步骤、候选依据与限制
│   │   │   │   ├── PlanProduct.jsx     真实产品 ID 查询与详情回调
│   │   │   │   └── PlanProduct.test.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMakeupPlan.js    表单、画像同步与生成流程
│   │   │   │   └── useMakeupPlan.test.js
│   │   │   ├── makeupPlanApi.js        工作台/小Y共用的方案 HTTP 请求
│   │   │   ├── makeupPlanApi.test.js
│   │   │   ├── makeupPlanUtils.js      已验收默认表单及纯转换
│   │   │   └── makeupPlanUtils.test.js
│   │   ├── catalog/
│   │   │   ├── catalogUtils.js          文本匹配、硬条件筛选与原排序
│   │   │   ├── catalogUtils.test.js
│   │   │   ├── catalogService.js        受控产品数组读取与稳定 ID 查询
│   │   │   ├── catalogService.test.js
│   │   │   ├── hooks/
│   │   │   │   ├── useCatalog.js        筛选、排序、面板状态与结果
│   │   │   │   └── useCatalog.test.js
│   │   │   └── components/
│   │   │       ├── LibraryView.jsx      搜索、结果、排序和空态
│   │   │       ├── FilterPanel.jsx      原筛选组与移动遮罩
│   │   │       ├── ProductCard.jsx      产品卡与图片失败状态
│   │   │       ├── ProductProfile.jsx   产品资料、购买门禁与来源
│   │   │       ├── ProductDetailDrawer.jsx 色号、详情与相似产品
│   │   │       └── catalogComponents.test.jsx
│   │   └── makeup-table/
│   │       ├── components/
│   │       │   ├── MakeupTableExperience.jsx 能力检测、状态时序、3D/2D 与失败回退
│   │       │   ├── MakeupTable3D.jsx    3D 展示、工具与品类轨道
│   │       │   ├── MakeupTable3D.css
│   │       │   ├── MakeupTable3D.test.js
│   │       │   ├── MakeupTable.jsx      原 2D 品类/产品桌
│   │       │   ├── MakeupTable.css
│   │       │   └── MakeupTable.test.js
│   │       └── makeup-table-3d/
│   │           ├── Scene.jsx           R3F Canvas、相机和场景装配
│   │           ├── CosmeticItem.jsx
│   │           ├── DressingTable.jsx
│   │           ├── ParticleBurst.jsx
│   │           ├── GhostCursor.jsx
│   │           ├── GhostCursor.css
│   │           ├── cosmetics.js
│   │           └── performance-profile.js
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
│       ├── api/
│       │   ├── client.js               共用 POST、JSON 读取与 HTTP 检查
│       │   ├── client.test.js
│       │   ├── errors.js               原 Error/code 边界，无网络错误包装
│       │   ├── errors.test.js
│       │   └── endpoints.js            现有两枚 YasPretty API 路径
│       └── storage/
│           ├── storageClient.js        JSON 解析、版本包装；保留原异常语义
│           ├── storageKeys.js          当前/旧 Key 与版本 1
│           ├── migrations.js           当前值读取与旧画像/消息迁移
│           └── clearUserData.js        仅清理两枚旧配置键，不新增全量删除
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
├── tests/browser/
│   ├── arch01-storage.mjs              独立浏览器存储回归，使用已有 Playwright
│   ├── arch02-makeup-plan.mjs          方案页面回归；临时上下文与现有服务端规则
│   ├── arch03-assistant.mjs            小Y流程、来源、失败与方案回归；合成响应
│   ├── arch05-makeup-table.mjs         真实 WebGL 与独立故障/生命周期回归
│   └── arch06-catalog.mjs              搜索/筛选/排序/详情/深链接/收藏回归
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

化妆台 CSS 已随组件迁入 `src/features/makeup-table/components/`，`GhostCursor.css` 随内部场景迁入 `src/features/makeup-table/makeup-table-3d/`；其余 `FlexCarousel.css`、`ScrollFloat.css`、`StrokeText.css` 仍在 `src/components/`。3D 内部实际文件为 `Scene.jsx`、`CosmeticItem.jsx`、`DressingTable.jsx`、`ParticleBurst.jsx`、`GhostCursor.jsx`、`cosmetics.js` 和 `performance-profile.js`。

当前 33 个 Vitest 文件分布在 `src/components/`（1）、`src/features/makeup-table/`（2）、`src/features/catalog/`（4）、`src/features/assistant/`（9）、`src/features/makeup-plan/`（4）、`src/data/`（2）、`src/lib/`（6，含 storage/api）、`server/`（4）和 `tests/`（1）。ARCH-03 的 199 项测试及有效断言全部保留；ARCH-04 增加公共 Client/错误 19 项及业务 API 7 项，两个 API 合计 32 项。公共/API 4 文件 51/51、相关 18 文件 163/163 的归档证据保留；ARCH-06 本次全量 33 文件 259/259、构建（2890 模块）通过。Hook 隔离测试、静态 markup 和事件回调断言验证各自边界，真实页面行为另由浏览器脚本覆盖。历史失败和构建提示保留在迁移计划，不因本次迁移删除。

另有 `tests/browser/arch01-storage.mjs` 独立脚本，不计入 Vitest 数量；从主站真实导航、发送、刷新和重置入口，使用临时浏览器上下文和合成数据验证存储。2026-11-17 在 Chrome 157.0.8103.52、1440×900 和 360×800、减少动效下复测 14/14 通过，并检查截图与横向溢出/重叠；未覆盖真实手机、默认动画或禁用存储权限时的页面表现。首次定位器超时与资源错误、复跑命令和结果路径均保留在阶段报告；负责人后续已确认本步人工验收，不据此扩充自动测试覆盖范围。

`tests/browser/arch02-makeup-plan.mjs` 同样独立运行，不增加依赖；在 5175 测试服务上以临时上下文覆盖生成、修改条件、当前/旧画像、加载与禁用提交、空响应/错误/重试、详情按钮与 Escape、小Y方案和既有文本降级。正常响应调用现有服务端无模型规则生成，错误响应由测试拦截模拟；迁移前后各 10/10，比较确认请求/表单值、控件尺寸和相对位置一致，已查看桌面/手机表单、结果和错误截图。首轮标签定位超时与后续复跑证据见迁移计划。没有验证真实 provider、真实 HTTP 失败/断网/超时、默认动效或真实手机；负责人已确认 S01 人工验收，不据此扩充上述自动覆盖范围。

S02 使用已有 `http://127.0.0.1:5175/` 服务及临时 Chrome 上下文；正常方案通过现有服务端无模型规则生成，HTTP 503/504 和网络超时由测试路由模拟，未测试实际网关或真实 provider。迁移前 10/10，最终扩充为 14/14；正常场景无控制台/失败资源错误，两个显式网络失败场景的预期错误精确记录。新增优先项上限、无效 ID/候选依据过滤、依据与详情滚动、失败恢复检查。已看六张桌面/手机截图，几何断言无溢出/重叠；严格前后比较仍记录标签/产品按钮高度及纵向位置差异，未确认字体时序原因，不声称像素一致。真实手机、默认动画、真实网关/provider 和字体加载后的排版待人工验证。

ARCH-03-S01 在同一 5175 服务、临时 Chrome 157.0.8103.52 上检查 1440×900 和 360×800。新 assistant 脚本基线首轮 4/8，修正测试品牌名和合成来源页编码后 8/8；迁移后及最终取景复跑均 8/8。另复跑原 storage、makeup-plan 脚本各 14/14，本步迁移后共 36 场景通过；请求/回复/产品 ID 与迁移前逐项一致，迁出的三项函数及组件其余实现与基线相同。模拟 HTTP 503/504、网络 timedout 的预期资源错误精确记录，无 pageerror；正常场景无新增 console.error。已查看桌面/手机截图，几何断言未发现横向溢出或控件重叠；不声称像素一致。结构化采集、纯本地推荐/比较、通用/产品事实流程、来源打开关闭及消息滚动、刷新/旧值/20 条裁剪、画像修改衔接方案和失败降级均覆盖。无 Key/联网/上游/超时以合成响应模拟，不代表真实 provider 已验证，也未新增前端超时定时器；默认动效、真实手机和字体加载后的排版仍待人工复验，详见迁移计划。

ARCH-03-S02 复跑上述三个浏览器脚本，assistant 8/8、storage 14/14、makeup-plan 14/14，共 36/36；Chrome 157.0.8103.52、1440×900/360×800、临时上下文和减少动效。小Y请求/回复/产品 ID/失败提示与 S01 逐项相同，10 个迁移函数及组件其余代码与基线相同。已看桌面/手机来源、比较、方案和超时共 5 张截图，几何断言无新增溢出/重叠，无 pageerror；显式失败场景的预期资源错误精确检查。真实 provider、真实手机、默认动效和字体加载后的排版仍待人工复验，不声称像素一致；历史严格几何差异保留。证据、命令及未完成项见迁移计划。

ARCH-03-S03 再次运行三份浏览器脚本，assistant 8/8、storage 14/14、makeup-plan 14/14，共 36/36；沿用相同 Chrome、桌面/360px、合成数据与临时上下文环境。除几何外的小Y全部记录与 S02 相同，两个迁移函数及组件其余代码原文相同；已查看桌面/手机来源、手机方案和桌面超时共 4 张截图，几何断言无新增溢出/重叠，无 pageerror，显式失败场景只出现精确预期资源错误。未验证真实 provider、真实手机、默认动效、弱网及字体加载后的排版，不声称像素一致；既有严格几何差异和构建提示保留。API/响应/错误和降级语义不变，未新增超时/重试、Client 或运行时校验；详见迁移计划。

ARCH-03-S04 复跑三个既有浏览器脚本，assistant 8/8、storage 14/14、makeup-plan 14/14，共 36/36；相同 Chrome 157.0.8103.52、1440×900/360×800、临时上下文和减少动效，未改浏览器脚本。小Y除几何外全部记录与 S03 相同；Hook 的状态/effect/发送/重置及欢迎/消息构造原文一致，原 3 项存储断言完整保留，组件仅替换 Hook 调用，其余展示原文相同。已查看桌面比较/超时、手机来源/方案/文本降级共 5 张截图，几何断言无新增横向溢出/重叠，无 pageerror，显式失败场景仅出现预期资源错误。真实 provider、真实手机、默认动效、弱网和字体加载后的排版仍待人工验证，不声称像素一致，保留既有严格几何差异与构建提示。

ARCH-03-S05 最终复跑三份原浏览器脚本，assistant 8/8、storage 14/14、makeup-plan 14/14，共 36/36。Chrome 157.0.8103.52、1440×900 和 360×800、临时上下文、减少动效；小Y除几何外全部记录与 S04 相同，三个展示函数和完整消息 JSX 原文等价，其余组合仅替换引用。已查看桌面比较/超时与手机来源/方案/文本降级 5 张截图，几何断言无新增横向溢出/重叠，全部场景无 pageerror。正常场景无 console.error；显式失败场景出现脚本预期的资源错误（assistant 12 条/2 个失败请求、方案 6 条/2 个失败请求），恢复通过。API 成功/无 Key/失败/超时均为隔离合成响应或现有无模型方案规则；未使用真实 Key，未验证实际 provider、真实手机、默认动画、弱网及字体加载后严格排版，不声称像素一致。S04/S05 的人工等待由负责人豁免，未执行部分仍为待人工验证项，不阻塞本次授权归档。

ARCH-04-S01 将两个业务 API 的共同 POST/JSON 读取和 HTTP 检查迁入 `src/lib/api/client.js`，端点仍为 `/api/assistant` 与 `/api/makeup-plans`。公共错误模块保留原 Error/code 边界，业务消息、来源处理、产品标记和方案转换仍在 features；不新增定时超时、取消、重试、缓存或鉴权。公共/API 测试 51/51、相关测试 163/163、全量 225/225 和构建通过。两个既有页面脚本迁移前 8/8+14/14、迁移后修正拦截范围后 8/8+14/14；原 `**/api/**` 曾误拦截 `/src/lib/api/client.js`，现仅拦截根路径 `/api/`，业务断言未放宽。桌面/360px 的请求/回复/ID/来源/错误/表单等全部非几何记录一致，已查看 6 张截图，几何断言无新增溢出/重叠；正常场景无控制台错误，故意 HTTP/网络失败的预期资源错误保留。真实本地无 Key 网关及 Vite 代理冒烟确认普通问答返回 503/PROVIDER_NOT_CONFIGURED，方案返回本地 7 步；付费 provider、真实手机、默认动画和字体加载后严格排版仍待人工验证，不声称像素一致。负责人于 2026-11-17 对完整 15 文件确认“人工核验完毕”，ARCH-04 更新为 done；确认后只同步四份文档，11 个代码/测试文件保持已验收内容。本次切换预检已核对原开发分支收尾提交 `4062153c512107534b88f3bc6011ffa869334c8a`，唯一带注释 `arch-stage-04` 对象 `21597c84fa0d0c44a1ef3d4dd24ef0a8c36af78d` 的本地/实际远端均指向该提交；历史阶段未实施 ARCH-05。人工确认不扩充真实 provider、设备或严格像素验证结论。完整命令、失败记录和证据见迁移计划与两份累计报告。

本次 master 切换的实际复验：`npm test` 29 文件225/225、`npm run build` 2881模块、Git 工作树/暂存/完整差异空白检查通过，三份既有桌面/360px浏览器脚本36/36；659个受跟踪文件与原开发分支清单一致，除五份规则/报告文档外内容相同。五标签原对象/提交指向、本地文档链接/锚点、当前结构和第三方披露路径已核对；构建文本产物常见密钥特征扫描0命中。真实无Key构建同源HTTP冒烟通过；真实provider/联网、真机、默认动效、弱网和严格字体排版等未覆盖项保留在累计报告。负责人于2026-11-17明确确认本次整体“人工验证通过”；确认不扩充未执行检查的覆盖结论，Git收尾结果见迁移计划5.2。

ARCH-05（2026-11-17，北京时间，YAS-2026-0055）已由项目负责人明确回复“人工验证通过”、状态done；以下保留本次实现和自动验证事实：原 14 个化妆台文件迁至 feature，新增有实际装配职责的 Experience，内部八文件与三份 CSS 字节不变；App 只改 lazy 引用与组件名，原两份测试的断言不变。相关 11/11、全量 225/225、构建 2882 模块通过；主 JS 744.42 kB，Three.js 仍在 1293.47 kB 异步 Experience 块，原大包/弃用提示保留。新独立浏览器脚本在 Chrome 157.0.8103.52、1440×900 / 360×800 验证：迁移前真实工作树 14/14、迁移后 14/14；补在途清理与计时检查后，原源码快照参考服务和迁移后各 16/16。真实场景使用 Intel UHD Graphics / D3D11，覆盖开幕、跳过、展开/收拢、旋转拖动、品类导航与重新进入；WebGL 禁用的 2D、模拟场景运行失败/6 秒未就绪、计时器/监听/Observer/RAF/光标资源清理另行验证。lazy 下载拒绝单独复现基线根视图卸载缺口，保持未修复。正常本地资源无失败、无 pageerror；外部 Google Fonts 请求被环境拒绝，模拟运行错误和下载失败的预期日志保留。没有验证真实手机/触摸、穷尽 GPU/驱动、实际断网下载恢复或严格像素一致；不把 mock 或通过测试等同于全面 3D 验收。详细命令、首轮测试错误及修正、截图/比较证据见迁移计划和累计报告。ARCH-05已人工通过并归档，最终提交 bf988460ae8c9611eaae21adb02a34c3bfc53fa1、arch-stage-05 对象 11b0d3e419b1fe642e3ed650fb07b9fc4ab9ceba 与实际远端一致；本条回填真实结果，原验收前快照和失败保留于累计报告。当前 ARCH-06 实施和人工验收状态见下段，不扩大 ARCH-05 的验证结论。

最终等待原动画结束取景的前后两组仍各 16/16，操作/状态/回调/清理和记录的控件布局相同；严格初次 canvas 缓冲高度比较有 1px 差异，结果保留为未通过。补充8次只读测量中，同一迁移后版本桌面缓冲高度可为717或718，客户端高度均718，原版本亦出现717；进入动画中可读到717.9999389648438，和既有测量/Three.js向下取整路径相符，未见目录迁移引起的新CSS布局差异，不宣称像素相同。详情和本地证据定位见两份累计报告。

ARCH-06（2026-11-17，北京时间，YAS-2026-0055）本地迁移与自动验证完成，项目负责人明确回复“人工验收通过 继续”，状态 done：App 的匹配/筛选/排序进入 catalogUtils，产品数组读取/按 ID 查询进入 catalogService，filters/sort/面板与结果进入 useCatalog；五个展示组件迁入 catalog/components。原 StatusControl、收藏 Key/对象格式/持久化、共享状态及导航仍在 App，详情用 statusControl 插槽渲染原控件，无反向导入 App、无 collection 提前实施。全部原 225 项断言保留，新增 34 项；相关 46/46、全量 259/259、build 2890 模块、7 个新 JS/MJS 语法检查和 Git 空白检查通过。Chrome 157.0.8103.52、1440×900 / 360×800、减少动效、独立临时上下文，迁移前后同一脚本各 14/14；35 个单项筛选、组合/切页恢复、四排序、搜索/空态、详情/色号/相似商品/内部滚动/关闭、首页和指南入口、深链接/刷新/返回、收藏状态/刷新/移除、模拟图片失败/空目录均覆盖。记录的 ID、文字、URL、历史、焦点、滚动、收藏和控件几何逐项相同，不声称严格像素一致。已查看桌面/手机关键截图；pageerror 为 0，正常本地资源无失败，外部 Google Fonts 被环境拒绝与故意图片失败的预期控制台记录保留。真实手机/触摸、其他浏览器、默认动效、字体成功加载后排版和真实断网/外部服务未验证。完整命令、证据、首轮 12/14 的定位修正及风险见[迁移计划 ARCH-06](docs/frontend-architecture-migration-plan.md#arch-06catalog)和两份累计报告。本次验收后的收尾只更新四份文档状态与追溯记录，已验收的 14 个代码/测试路径内容不变，沿用上述实跑结果；提交、正常推送和唯一带注释 arch-stage-06 的实际结果由收尾回执提供，下次同步回填。ARCH-06 done、ARCH-07 唯一 current 且未实施、ARCH-08～11 pending；历史失败与未覆盖范围不因人工验收扩大或消失。

### 前端目标结构（迁移中）

原开发分支的 `86b25b3` 建立了上述 `src/contracts/` 六个文件，本次保留原提交合入 master 工作树。原演示材料、生成脚本及历史报告均保留，不因切换分支删除；本次不修改材料内容。

下列 `app/` 和绝大部分 `features/` 仍是 master 后续待实施的目标；`lib/storage/` 四模块已通过 ARCH-01 人工验收，makeup-plan 的 Utils/API/Hook/组件已在 ARCH-02 迁入并通过人工验收。assistant 的意图、业务纯函数、API、Hook 与四个展示组件已在 ARCH-03 迁入；S01–S03 已人工验收，S04/S05 剩余人工核验由负责人取消。`lib/api/` 已在 ARCH-04-S01 落地并通过自动验证及 2026-11-17 人工验收，其余目标不得据此描述为已完成。迁移时不改变现有 UI、API、推荐规则、存储 Key 或产品事实，也不创建没有实际职责的空目录和空文件。

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
│   │   ├── client.js                   共用 POST/JSON/HTTP 检查；无新增定时超时
│   │   ├── errors.js                   保留原生错误与业务 Error/code 区别
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

当前真实入口为 `main.jsx → App.jsx`；App 直接组合内嵌页面与 `components/` 中的小Y、品牌开幕及视觉组件，小Y再组合工作台。产品库/详情展示与筛选状态已迁入 catalog，收藏仍在 App；两个业务 API 的 fetch 已共用 `lib/api/client.js`，参数、响应和具体错误映射仍在 features，收藏直接读写 localStorage。小Y的 useAssistant 组合 `lib/storage/` 的版本读取/迁移、写入、Key 和旧凭据清理，消息保存仍在迁移后的原 effect 中使用 `slice(-20)`。`migrations` 依赖 `storageClient` 和 `storageKeys`，`storageClient` 与 `clearUserData` 仅依赖 `storageKeys`；没有反向依赖 UI 或增加桶式转发导出。损坏 JSON 仍回退，存储访问/写入/删除失败仍抛出，未新增静默降级。contracts 只有 JSDoc，没有运行时校验。下面是后续阶段约束，不是当前已全面实现的依赖图。

当前 catalog 依赖为 App → useCatalog / LibraryView / ProductCard / ProductProfile / ProductDetailDrawer；useCatalog → catalogUtils / catalogService，catalogService → data/products。LibraryView 内保留 SortSelect/EmptyResults，FilterPanel 内保留 FilterGroup，ProductProfile 内保留 ParameterRow，ProductDetailDrawer 内保留 Metric；没有为小型子组件增加空壳文件。App 的首页与收藏列表通过 catalogService 读取同一产品数组，首页静态回退复用 ProductCard。App 保留跨页面导航/历史、selectedProduct/profileProduct、Escape 关闭、收藏共享状态与 StatusControl；通过 statusControl React 节点传入两种详情，不让 catalog 反向依赖 App 或提前建立 collection。小Y、方案、化妆台自己的产品数据消费仍在各自已验收领域中，本阶段不全局重写这些引用。

当前化妆台依赖为 `App 内 HomeView → lazy MakeupTableExperience → MakeupTable3D / MakeupTable`；Experience 保留原 WebGL 检测、运行错误边界、6 秒未就绪回退、开幕连接、620ms 聚焦与 1180ms 自动展开和性能/减少动效监听。3D 展示单向依赖内部 Scene、GhostCursor 和 cosmetics；Scene 再组合 DressingTable、CosmeticItem、ParticleBurst。全部 Three.js 重依赖仍位于异步 Experience 块，App 原 Suspense 占位保持；没有在 App/HomeView 直接引用场景内部。原 lazy 下载失败没有专门捕获，本次保持并单独记录，不把运行时回退当作下载失败保护。

当前小Y依赖为 `XiaoYAssistant → useAssistant / AssistantMessages / ProfileSummary / MakeupWorkbench`。`useAssistant → assistantApi / assistantUtils / intentUtils / lib/storage`；`AssistantMessages → AssistantProduct / SourceList / data/products`；`AssistantProduct → assistantUtils`。入口保留标题/快捷问题/输入/隐私与工作台连接；展示组件不负责请求或持久化，真实产品仍传递给 App 的现有详情回调。`assistantApi → lib/api / assistantUtils / makeupPlanApi`，`makeupPlanApi → lib/api`；`assistantUtils → intentUtils / makeupPlanUtils / data/products`；`MakeupWorkbench → useMakeupPlan → makeupPlanApi / makeupPlanUtils`，makeup-plan 无 assistant 反向依赖。公共 API 模块不依赖 features、components、contracts、data、React 或存储；业务回调决定具体 HTTP 错误，Client 只检查 HTTP，不接管 answer/plan/来源/ID 校验或降级。小Y保留 code/default REQUEST_FAILED，方案错误仍无 code；fetch 网络/超时/取消拒绝保留原对象，JSON 读取拒绝仍转 null。基线没有前端定时超时或主动取消，本步不新增。Hook 不直接操作 localStorage 或 fetch，画面消息不截断，只持久化末 20 条；重复发送仍由当前渲染的 busy 判断，重新开始仍不清空草稿或取消进行中的响应。S05 保留 DOM/样式类/键盘/详情/来源行为，不迁移入口文件路径。

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

任何新增、删除、移动目录或模块，以及职责、依赖、数据流或阶段状态变化，都必须在 master 同一阶段变更中同步本节“当前实际结构”和迁移计划的真实执行记录；目标未落地时只能写入目标结构。更新时核对正文、文档链接和第三方披露路径，保留 ARCH-00～04 在原开发分支完成的历史。

### 提交、人工验收与回退

ARCH-05～ARCH-11 按完整阶段连续实施，只处理唯一 current，不再逐 `ARCH-XX-SNN` 小步等待人工确认。整阶段实现、相关自动验证、`npm test`、`npm run build`、`git diff --check` 和文档同步后，一次性交项目负责人人工验收；此时阶段保持 current，交付标“待人工验收”。未经负责人明确确认，不得提交、推送、打标签或删除分支。完整阶段人工通过后立即改为 done、下一阶段为唯一 current，并追加真实执行记录；最后阶段通过时明确无新的 current。确认授权已验收范围在 master 按清晰范围提交、正常推送和阶段标签归档，分支删除须另有针对该分支的明确授权。提交继续使用 `【问题】[ARCH-XX] …【修改】…`，旧小步及 YAS 编号保留，不虚构新编号。

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
- 化妆桌幽灵光标：使用 React Bits `GhostCursor` 的 WebGL 烟雾实现（[组件说明与源码](https://reactbits.dev/components/ghost-cursor)，[上游仓库](https://github.com/DavidHDev/react-bits)，[许可证](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)，MIT + Commons Clause，代码接入于 2026-11-04）；本地仅调整颜色、粒子预算、移动端性能参数和化妆桌显示生命周期，源码位于 `src/features/makeup-table/makeup-table-3d/GhostCursor.jsx`。
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

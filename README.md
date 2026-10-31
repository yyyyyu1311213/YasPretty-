# YasPretty 小Y

YasPretty 是一个面向普通消费者的个性化美妆决策项目。当前仓库处于“超级个体（OPC）·数字新消费”专项赛的参赛交付阶段，申报方向为“智慧生活与沉浸式新消费”。项目目标是形成多源信息驱动、结构化约束、可解释和可纠正的美妆决策流程。

> 当前状态：阶段 0、阶段 1、阶段 2 和阶段 3 已建立可追溯记录；阶段 3 实现提交为 `99b3ece`，tag 为 `v0.4.0-stage-3`。阶段 3 图片接入与产品核验档案补充已在工作树完成，提交 SHA/tag 待建立。现有版本可以运行、测试和构建；它仍不是正式公网发布版，照片分析、眉妆资料、淘宝/天猫官方商品链接、完整产品事实核验和图片明确授权尚未完成。

## 当前真实能力

- React + Vite 单页主站。
- 35 条彩妆资料：22 款粉底液、3 款气垫、3 款遮瑕、3 款散粉，以及阶段 3 新增的腮红、唇妆、睫毛膏和眼影资料。
- 35 张按稳定产品 ID 落位的 WebP 封面图；详情页展示逐张来源、权利人、采集日期、授权待核验状态和联系删除入口。
- 35 个可深链接访问的完整产品核验档案；111 份商品详情、参数和店铺截图按产品 ID 映射并记录 SHA-256，企业资质原图仅作内部留档。
- 搜索、肤质/妆效/遮瑕力/价格等筛选、排序和产品详情。
- 浏览器本地收藏及“想买 / 正在用 / 会回购”状态。
- 集成在主站中的小Y页面。
- 小Y的本地规则推荐、Open-Meteo 天气查询，以及由服务端编排的可选智谱对话和联网搜索。
- Fastify API 网关：服务端密钥、Zod schema、64 KiB 请求限制、超时、有限重试、每 IP 限流、单进程每日额度、安全头和脱敏日志。
- 31 项 Vitest 测试，覆盖小Y规则、网关、智谱 provider、结构化方案、阶段 3 品类候选、产品证据文件与淘宝/天猫商品链接门禁。
- Windows 启动脚本和可通过的 Vite 生产构建。

以下能力尚未实现，不能在参赛材料或演示中描述为已完成：

- 结构化完整妆容工作台和 `MakeupPlan` 校验已接入；无智谱 Key 时使用本地规则降级，模型真实成功链路仍待受限 Key 验收。
- 照片上传、质量检查或 MediaPipe 分析。
- 眉妆仍无已核验商品；眼影记录因官网价格缺口不进入推荐；全部产品图片的明确再利用授权仍待核验。
- React 组件测试和 Playwright 端到端测试体系。
- 正式公网部署、账号体系或跨设备数据。

## 数据与素材状态

当前 35 条产品数据均已补齐图片来源状态字段，封面统一位于 `public/products/<产品 ID>/cover.webp`。23 张来源于品牌官网页面、11 张来源于零售商页面、1 张来源于媒体页面；全部 `authorizationStatus` 仍为 `pending`。根据项目负责人 2026-10-29 确认的参赛策略，代码将公开状态记录为 `public_with_source_notice_pending_authorization`，页面同时展示来源与联系删除说明；这不等于已经取得授权。

产品核验档案将 `产品核验信息/` 中的商品详情、参数和店铺截图同步到 `public/verification/<产品 ID>/`，生成文件清单、原始相对路径、大小和 SHA-256。当前 35/35 条产品具有详情证据、35/35 具有店铺首页截图，35/35 企业资质文件保持内部索引；0/35 具有已复核的淘宝或天猫品牌官方旗舰店商品直达链接，因此页面不会显示替代购买入口。截图存在不代表其中任何参数、店铺身份或链接已经通过人工核验。

页面中的 `rating` 是编辑示例维度，没有真实用户样本或统计来源，不得表述为用户评分、口碑统计或平台大数据。原有 31 条产品事实仍待逐项核验；阶段 3 新增的 3 条可推荐彩妆已取得官网名称、品类、色号/规格和 CNY 价格证据，眼影记录因官网价格缺口保持 `pending` 且不进入推荐。首页仍使用 Unsplash 通用美妆背景图，正式公开前同样需要保留来源与许可证说明。

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

## 配置与密钥

`.env.example` 只提供无密钥模板。需要启用智谱能力时，在本机创建被 Git 忽略的 `.env`，由维护者配置 `ZHIPU_API_KEY`；普通用户界面不会显示或接收第三方 Key。模型、超时、每分钟限制和每日额度也由服务端环境变量控制。

`server/key.txt` 和浏览器 Authorization 兼容路径已经退出主流程。小Y首次加载时会删除两个旧版本的浏览器 AI 配置键，避免遗留 Key 继续保存在 `localStorage`。没有服务端 Key 时，健康检查会将 AI 标为未配置，产品浏览、本地规则推荐和天气查询仍可使用；智谱对话和联网检索返回明确降级错误。

仓库曾发现一枚写在旧版 HTML 中的凭据，现已从文件移除。项目负责人仍须在智谱控制台吊销并轮换它，因为从工作区删除不能证明该凭据从未被复制或使用。

## 数据与隐私边界

- 收藏、小Y画像和最近对话目前保存在浏览器 `localStorage`；小Y画像和对话已使用版本化存储封装。
- 新网关不再提供 `/memory`，也不会读取旧 `server/memory/` 文件；旧数据原样保留在本机并继续被 Git 忽略。
- 当前没有照片上传或照片分析能力。
- 不要把真实用户照片、对话、画像、本地记忆或 API Key 加入代码、截图、比赛材料或 Git。
- API 不返回无条件跨域头；开发环境通过 Vite 同源代理，生产构建由 Fastify 同源提供。
- 当前限额是单进程内存实现，服务重启会重置，也不能跨多个实例共享；正式多实例部署前需要外部额度存储。

## 项目结构

```text
src/App.jsx                       主站、产品库、详情与收藏
src/components/XiaoYAssistant.jsx 小Y界面、本地规则与 YasPretty API 调用
src/lib/xiaoy-storage.js          版本化匿名画像、对话与旧 Key 清理
src/data/products.js              当前 35 条受控彩妆资料与来源状态
src/data/product-image-sources.js 35 张产品封面的来源、权利人和授权状态
src/data/product-verification.js 产品核验状态、链接门禁和参数解读边界
src/data/product-verification.generated.js 核验证据路径、大小与 SHA-256 生成清单
public/products/                  按稳定产品 ID 存放的 WebP 产品封面
public/verification/              按稳定产品 ID 存放的网页证据副本和清单
scripts/sync-product-verification.mjs 从原始核验目录重复生成网页证据
server/fishtalk-server.cjs        Fastify 网关启动入口
server/app.cjs                    API、安全控制、限流与同源静态服务
server/providers/                 智谱和 Open-Meteo 适配器
server/services/                  服务端智能体编排
docs/phase-0-baseline.md          安全扫描、功能与构建基线
docs/phase-1-ai-gateway.md        阶段 1 架构、测试与风险记录
docs/stage-delivery-test-report.md 各阶段作用、用户价值、测试证据与剩余风险
docs/product-image-collection.md  图片采集与授权要求
beauty-assistant.html             旧独立页备份，不继续扩展
```

## 第三方能力披露

- React、React DOM、Vite、Lucide React 和 concurrently。
- Fastify、Zod、`@fastify/helmet`、`@fastify/rate-limit`、`@fastify/static`、dotenv 和 Vitest；除 dotenv 为 BSD-2-Clause 外，其余这些新增依赖为 MIT 许可证。
- 智谱 GLM 与 `web-search-pro`：可选的语言模型和联网检索，只通过服务端 provider 调用。
- Open-Meteo：天气与地理编码。
- Unsplash：首页通用美妆背景图来源；产品卡不再使用 Unsplash 占位图。
- 产品封面：23 张来自品牌官网页面、11 张来自零售商页面、1 张来自媒体页面；逐张链接见产品详情，授权状态均为待核验。
- MediaPipe：规划中的浏览器端视觉能力，当前尚未接入。

依赖许可证以各项目自身许可证为准。仓库自己的 LICENSE 和完整第三方资源清单尚未补齐，因此当前仓库不可视为已具备公开发布条件。

## 验证状态

阶段 3 图片接入补充复验（2026-10-29，北京时间）：`npm test` 为 3 个测试文件、27/27 通过；`npm run build` 通过，Vite 转换 1789 个模块。35/35 个产品 ID 均能映射到本地 WebP 封面和来源记录，公开状态统一为“来源已披露、授权待核验”。本阶段没有使用真实 Key 发起付费智谱调用。

产品核验档案补充复验（2026-11-01，北京时间，`YAS-2026-0012`）：`npm test` 为 4 个测试文件、31/31 通过；`npm run build` 通过，Vite 转换 1791 个模块。桌面 1440px 和手机 390px 已检查产品深链接、参数表、编辑解读和证据列表。淘宝/天猫商品链接仍为 0/35 已核验，产品事实与图片授权状态没有因本次接入而升级。

旧 `server/test-memory.cjs` 已归档，它会清空本地记忆且依赖已退出主流程的 `/memory`，不属于当前测试套件。

后续实施顺序与验收边界见 [AGENTS.md](AGENTS.md) 和 [FINAL-PROMPT.md](FINAL-PROMPT.md)。未经项目负责人确认，只推进当前明确授权的阶段。

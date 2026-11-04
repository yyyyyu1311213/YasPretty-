# YasPretty 项目技术模块与具体实现说明

## 1. 项目技术定位

YasPretty 当前是一个采用前后端一体化架构的个性化美妆决策系统。系统不是让大语言模型直接、自由地生成商品推荐，而是把产品事实、用户条件、确定性筛选、可解释评分、模型表达和结果校验拆成不同技术模块。

当前主链路如下：

```text
React 用户界面
  ├─ 产品检索、筛选、详情与收藏
  ├─ 小Y对话与本地规则推荐
  └─ 结构化妆容工作台
             │
             │ HTTPS/JSON（开发环境使用 Vite 代理）
             ▼
Fastify API 网关
  ├─ Zod 请求与响应校验
  ├─ Assistant Service 对话编排
  ├─ Makeup Plan Service 候选筛选与方案生成
  ├─ Zhipu Provider：GLM 对话和 web-search-pro
  └─ Open-Meteo Provider：城市定位和天气查询
             │
             ▼
受控产品数据与证据层
  ├─ 35 条产品结构化记录
  ├─ 人工核验商品事实
  ├─ 产品图片来源台账
  └─ 111 份带 SHA-256 的核验证据截图
```

系统目前是可本地运行和构建的阶段性 MVP，不是微服务系统，也没有引入数据库、向量数据库、消息队列、Kubernetes 或支付系统。

## 2. 实际技术栈与版本

| 层次 | 技术 | 当前安装版本 | 具体用途 |
| --- | --- | ---: | --- |
| 前端 | React | 19.2.8 | 组件渲染、状态管理、表单和交互 |
| 前端 | React DOM | 19.2.8 | 浏览器 DOM 挂载 |
| 工程 | Vite | 8.3.5 | 开发服务器、API 代理和生产构建 |
| 工程 | `@vitejs/plugin-react` | 6.1.2 | JSX 转换和 React 开发支持 |
| UI | Lucide React | 1.27.0 | 搜索、筛选、收藏、发送、关闭等图标 |
| 后端 | Node.js | 项目要求 20+ | Fastify 服务和构建脚本运行环境 |
| 后端 | Fastify | 5.12.7 | API 路由、Hook、错误处理和静态资源托管 |
| 校验 | Zod | 4.6.7 | 环境变量、API、供应商响应和妆容方案校验 |
| 安全 | `@fastify/helmet` | 13.2.0 | CSP 等 HTTP 安全响应头 |
| 安全 | `@fastify/rate-limit` | 11.2.1 | 每 IP 接口限流 |
| 部署 | `@fastify/static` | 10.1.8 | 生产环境托管 Vite 构建产物 |
| 配置 | dotenv | 18.0.9 | 加载服务端 `.env` |
| 测试 | Vitest | 5.0.5 | 规则、Schema、API、Provider 和证据测试 |
| 开发 | concurrently | 10.0.6 | 同时启动 Vite 和 Fastify |

前端使用原生 JavaScript 和 CSS，没有 TypeScript、Redux、React Router 或第二套 UI 框架。当前状态量较小，主要使用 `useState`、`useEffect` 和 `useMemo`。

## 3. React 主站模块

### 3.1 应用启动

入口文件为 `src/main.jsx`。代码使用 React 19 的 `createRoot` 把 `App` 挂载到 `index.html` 中的 `#root`，并启用 `StrictMode`。

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

全局样式拆分为：

- `src/styles.css`：主站、产品库、详情、收藏、指南和文化页面。
- `src/xiaoy.css`：小Y对话、妆容工作台和方案结果。

### 3.2 页面状态与轻量路由

主站没有使用 React Router，而是在 `src/App.jsx` 中通过 `view` 状态切换页面：

```text
home       首页
library    产品资料库
guide      肤质指南
assistant  小Y智能选妆
culture    品牌文化
favorites  收藏与使用状态
product    完整产品核验详情
```

普通页面切换只修改 React 状态。产品详情额外使用浏览器 History API：

```js
window.history.pushState(
  { productId: product.id },
  '',
  `/products/${encodeURIComponent(product.id)}`,
)
```

应用监听 `popstate`，使浏览器前进、后退能够恢复产品详情。生产服务对非 `/api/` 的 GET 未命中路径返回 `index.html`，因此直接访问 `/products/<id>` 也能进入前端应用。

### 3.3 产品检索模块

关键词检索不是只搜索商品名称，而是把以下字段展开并转成小写字符串：

- 品牌；
- 产品名称；
- 产品类别；
- 每个色号对象中的名称、色调和适配说明；
- 使用场景。

匹配采用 `String.includes()`，实现轻量级站内全文检索。当前产品只有 35 条，因此不需要 Elasticsearch、数据库全文索引或向量检索。

### 3.4 组合筛选模块

`productMatches(product, filters)` 依次应用以下条件：

1. 关键词；
2. 产品类别；
3. 适合肤质；
4. 妆效；
5. 遮瑕度；
6. 最低持妆时长；
7. 氧化程度；
8. 品牌地区；
9. 价格区间；
10. 最大预算；
11. 使用场景。

多选字段使用“组间 AND、肤质组内 OR”的逻辑。例如用户同时选择“粉底液、柔雾、油皮、500 元以内”，产品必须满足全部维度；肤质选择多个时，命中任意一个即可。

### 3.5 排序模块

产品库支持：

- 编辑推荐：`rating * 10 + wear`；
- 编辑评分从高到低；
- 价格从低到高；
- 价格从高到低。

其中 `rating` 只是编辑示例维度，并非真实用户统计。代码和页面均保留这一边界说明。

### 3.6 产品详情双层交互

系统包含两种产品详情形式：

- `DetailDrawer`：快速查看商品信息的弹层；
- `ProductProfileView`：可深链接访问的完整核验页面。

完整页面展示：

- 品牌、名称、类别和本地产品图片；
- 商品规格、原价、核验日期、产地；
- 官方或海外旗舰店名称、企业主体、淘宝商品链接；
- 肤质、妆效、遮瑕、持妆和氧化等编辑判断；
- 商品详情、参数和店铺证据截图；
- 文件大小、SHA-256、原始证据路径；
- 图片来源页面、权利人、采集日期和授权状态；
- 图片删除联系入口。

这使产品详情同时承担商品展示和证据审计两个职责。

### 3.7 收藏与使用状态

收藏模块使用以下结构保存在 `localStorage`：

```json
{
  "nars-light-reflecting": "想买",
  "dior-forever-matte": "正在用",
  "lancome-teint-idole": "会回购"
}
```

键名为稳定产品 ID，值只能来自“想买、正在用、会回购”。数据只保存在当前浏览器，不上传服务端。

## 4. 小Y前端智能交互模块

### 4.1 意图识别

`src/components/XiaoYAssistant.jsx` 中的 `detectIntent()` 使用规则表达式完成前端快速路由：

```text
weather   天气查询
catalog   站内产品推荐与比较
greeting  问候与帮助
general   需要服务端模型处理的通用问题
```

这种实现的作用不是替代大模型，而是在简单意图上降低调用成本，并在模型不可用时保留核心产品推荐。

### 4.2 时效问题识别

`needsOnlineResearch()` 检查“最新、现在、价格、促销、成分、官网、新闻、测评、口碑、销量”等时效词。命中后请求服务端联网检索；普通的“油皮粉底推荐”直接使用站内资料。

这样形成两条路径：

```text
稳定站内问题 → 本地规则和受控产品数据
时效或库外问题 → 服务端 web-search-pro → 模型基于来源回答
```

### 4.3 用户画像抽取

`extractProfile()` 从用户文本中抽取：

- `skin`：油皮、混油皮、干皮、混干皮、敏感肌；
- `finish`：哑光、柔雾、奶油肌、自然光泽；
- `scene`：通勤、约会、拍照、夏季、秋冬、长时间带妆、答辩；
- `budget`：人民币预算；
- `category`：粉底液、气垫、遮瑕、散粉等；
- `coverage`：低、中、高遮瑕；
- `tone`：冷调、中性调、暖调；
- `city`：天气查询城市。

每轮对话将新抽取字段与现有画像合并，而不是清空以前的条件。

### 4.4 本地推荐算法

本地推荐先执行硬过滤：

```text
用户已指定肤质 → 产品必须包含该肤质
用户已指定预算 → 产品价格必须小于等于预算
用户已指定品类 → 产品品类必须相同
```

过滤后再根据妆效、遮瑕、场景和色调等条件评分，排序后最多返回 3 个产品。如果没有候选，系统明确提示“没有同时满足条件的站内产品”，而不是放松预算或肤质条件。

### 4.5 模型产品标记白名单

服务端模型可以在文本中返回：

```text
[[PRODUCT:nars-light-reflecting]]
```

前端 `parseAssistantResult()` 解析这些标记，然后使用：

```js
products.some((product) => product.id === returnedId)
```

验证 ID。不存在于产品库的 ID 会被丢弃，因此模型无法在界面中生成虚假的站内产品卡。

### 4.6 对话状态与降级

每次请求会显示具体活动状态，例如“正在连接实时天气服务”或“正在联网检索相关资料”。异常处理分场景进行：

- 通用 AI 问题失败：显示智能服务不可用；
- 天气失败：提示稍后重试或输入完整城市名；
- 联网检索失败：明确不使用未经检索的信息冒充实时结果；
- 普通产品推荐失败：回退到本地规则推荐。

## 5. 匿名本地存储模块

`src/lib/xiaoy-storage.js` 对小Y画像和对话使用版本化存储：

```json
{
  "version": 1,
  "value": {}
}
```

当前键名为：

```text
yaspretty-xiaoy-profile-v1
yaspretty-xiaoy-messages-v1
```

模块具有三个技术作用：

1. JSON 解析失败时返回安全默认值；
2. 自动迁移旧版未带版本号的键；
3. 删除历史版本中可能包含浏览器 API Key 的配置键。

小Y只保留最近 20 条消息。收藏仍使用独立的 `base-archive-collection` 键，目前尚未统一迁移到版本化存储模块。

## 6. 结构化妆容工作台

### 6.1 结构化输入

`MakeupWorkbench.jsx` 收集以下字段：

```text
UserProfile
├─ skinType             自述肤质
├─ skinTypeSource       self_reported / unknown
├─ undertone            冷调 / 中性调 / 暖调 / unknown
├─ finishPreferences    妆效偏好
├─ concerns             关注问题
├─ budgetTotal          总预算
├─ skillLevel           新手 / 熟练 / 进阶
├─ excludedBrands       排除品牌
├─ sensitivities        敏感项
└─ city                 城市

MakeupRequest
├─ scene                场景
├─ style                风格
├─ wearHours            带妆时长
├─ timeOfDay            早晨 / 白天 / 夜晚
├─ weatherEnabled       是否启用天气
├─ photoEnabled         当前固定为 false
└─ priorities           轻薄、持妆、遮瑕、控油、保湿等
```

前端将表单转换成 JSON，通过 `POST /api/makeup-plans` 发送给服务端。

### 6.2 服务端硬条件过滤

`productMatchesHardConditions()` 按以下顺序排除候选：

```js
if (product.recommendationReady === false) reject
if (skinType !== 'unknown' && !product.skins.includes(skinType)) reject
if (budgetTotal > 0 && product.price > budgetTotal) reject
if (finishPreferences.length && !finishPreferences.includes(product.finish)) reject
if (excludedBrands includes product.brand) reject
```

肤质、预算、妆效和排除品牌不会被模型越过。

### 6.3 候选评分公式

通过硬过滤的每个产品以 44 分为基础分：

```text
基础分                                      44
符合自述肤质                              +20
符合妆效偏好                              +16
产品场景包含目标场景                      +10
参考持妆时长达到目标                       +7
预算余量奖励                          0 到 +5
存在对应冷暖调代表色号                     +5
最终分数限制在 0 到 100
```

预算余量计算为：

```js
budgetRatio = max(0, 1 - product.price / budgetTotal)
budgetScore = round(budgetRatio * 5)
```

算法还会生成两个解释数组：

- `matchedConditions`：为什么加分；
- `tradeoffs`：场景不匹配、持妆不足、产品注意事项、评分属于编辑示例等取舍。

前 12 个候选的解释会进入 `candidateEvidence`，在方案结果页面中展示。

### 6.4 七步方案生成

本地方案固定生成七个步骤：

| 步骤 ID | 类别 | 技术处理 |
| --- | --- | --- |
| `prep` | 妆前 | 根据油皮/干皮方向选择轻薄或分区保湿手法 |
| `base` | 底妆 | 从粉底液和气垫候选中取最高分产品 |
| `conceal` | 局部遮瑕 | 从遮瑕候选中取最高分产品 |
| `set` | 定妆 | 从散粉候选中取最高分产品 |
| `eyes-brows` | 眉眼 | 从眼影、睫毛膏、眼线、眉笔候选中选择；无产品时只给手法 |
| `cheeks` | 腮红 | 匹配腮红产品或只输出颜色方向 |
| `lips` | 唇妆 | 匹配唇妆产品或只输出手法 |

每个步骤必须包含：

```text
id、category、goal、technique、texture、colorDirection、
primaryProductId、alternativeProductIds、reasons、cautions
```

没有可靠候选时，`primaryProductId` 必须为 `null`，不能由模型补造商品。

### 6.5 本地方案对象

完整 `MakeupPlan` 包含：

```text
id
title
summary
inputsSnapshot
weatherAdjustment
steps
recommendedProductIds
candidateEvidence
confidence
limitations
sourceMode: local | model
createdAt
schemaVersion: makeup-plan.v1
```

本地方案有候选时置信度为 `0.72`，无候选时为 `0.42`。该值表示系统内部方案完整程度，不应解释为医学或产品效果准确率。

### 6.6 模型结构化生成

如果服务端配置了智谱 Key，系统会把以下内容交给模型：

- 经过 Schema 校验的用户画像；
- 妆容请求；
- 最多 12 个候选产品；
- 每个候选的确定性评分依据；
- 固定的 JSON 字段要求和安全边界。

模型只能负责结构化编排和自然语言表达，不负责创造产品事实。

### 6.7 两阶段模型校验与修复

模型响应处理顺序如下：

```text
模型原始文本
   ↓
去除 Markdown JSON 代码围栏
   ↓
提取首个完整 JSON 对象
   ↓
modelDraftSchema.safeParse()
   ↓
校验所有产品 ID 是否属于候选集和站内产品库
   ↓
通过 → 组装完整 MakeupPlan
失败 → 请求模型进行一次 JSON 结构修复
再次失败 → 本地规则方案
```

Provider 超时、网络错误、无效 JSON、错误产品 ID 或 Schema 不通过都会回退，不会把自由文本冒充结构化成功结果。

## 7. Zod 数据校验模块

`server/schemas.cjs` 集中定义：

- `profileSchema`：对话画像；
- `assistantRequestSchema`：查询、最多 12 条历史消息和画像；
- `weatherQuerySchema`：最长 40 字的城市名；
- `sourceSchema`：联网来源；
- `productRecordSchema`：产品事实与来源状态；
- `userProfileSchema`；
- `makeupRequestSchema`；
- `planStepSchema`；
- `candidateEvidenceSchema`；
- `makeupPlanSchema`；
- `makeupPlanRequestSchema`；
- `makeupPlanResponseSchema`。

关键请求使用 `.strict()`，因此浏览器如果额外提交 `apiKey` 等未声明字段，请求会直接返回 `400 VALIDATION_ERROR`。

Schema 同时限制数组长度和文本长度，例如：

- 对话历史最多 12 条；
- 单条消息最多 4000 字；
- 用户查询最多 2000 字；
- 方案步骤 5 到 8 个；
- 推荐产品最多 6 个；
- 候选证据最多 12 个；
- 联网来源最多 5 个。

## 8. Fastify API 网关

### 8.1 当前接口

| 接口 | 作用 | 是否调用外部服务 |
| --- | --- | --- |
| `GET /api/health` | 返回服务和 AI 配置状态 | 否 |
| `GET /api/weather?city=` | 城市定位和天气 | Open-Meteo |
| `POST /api/assistant` | 模型对话、必要时联网检索 | 智谱 |
| `POST /api/makeup-plans` | 结构化妆容方案 | 可选智谱；无 Key 使用本地规则 |

规划文档中的 `POST /api/makeup-plans/:id/adjust` 尚未实现。

### 8.2 请求体限制

Fastify 初始化设置：

```js
bodyLimit: 64 * 1024
```

超过 64 KiB 返回统一的：

```json
{
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "请求内容过大。"
  }
}
```

### 8.3 限流和每日额度

接口按 `request.ip` 限流：

- 普通 API 默认每分钟 60 次；
- AI 对话默认每分钟 20 次；
- AI 每日额度默认每 IP 200 次。

每日额度使用进程内 `Map`，日期变化时清空。它适合单机演示，但服务重启会重置，也不能在多实例之间共享。

### 8.4 安全响应头

Helmet 配置的 CSP 主要包括：

```text
default-src 'self'
connect-src 'self'
frame-ancestors 'none'
object-src 'none'
script-src 'self'
img-src 'self' data: https://images.unsplash.com
```

没有无条件返回 `Access-Control-Allow-Origin: *`。开发环境由 Vite 将 `/api` 代理到本地 Fastify，生产环境由同一个 Fastify 服务提供页面与 API，保持同源。

### 8.5 日志脱敏

日志明确遮盖：

```text
req.headers.authorization
headers.authorization
ZHIPU_API_KEY
zhipuApiKey
```

Fastify 默认完整请求日志被关闭，只在响应后记录：请求 ID、方法、路由模板和状态码，不记录请求正文。

### 8.6 统一错误处理

系统把错误转换为稳定代码：

```text
VALIDATION_ERROR
RATE_LIMITED
DAILY_QUOTA_EXCEEDED
PAYLOAD_TOO_LARGE
INVALID_JSON
PROVIDER_NOT_CONFIGURED
PROVIDER_AUTH_ERROR
PROVIDER_RATE_LIMITED
PROVIDER_TIMEOUT
PROVIDER_INVALID_RESPONSE
WEATHER_TIMEOUT
WEATHER_INVALID_RESPONSE
NOT_FOUND
```

5xx 错误只在服务端记录请求 ID 和错误代码，不把堆栈、内部路径、密钥或上游原始响应返回浏览器。

### 8.7 旧接口退役

旧 `/proxy/*`、`/memory` 和 `/memory/*` 不再执行旧逻辑，统一返回 HTTP `410` 和 `LEGACY_ENDPOINT_REMOVED`。这样可以阻止旧前端继续通过浏览器提供密钥或读取历史服务端记忆。

## 9. 智谱模型与联网检索 Provider

### 9.1 模型调用

服务端调用：

```text
POST https://open.bigmodel.cn/api/paas/v4/chat/completions
Authorization: Bearer <服务端环境变量>
```

默认模型为 `glm-4-flash`，温度为 `0.55`，关闭流式输出。API Key 只从 `.env` 读取，不由浏览器提交。

### 9.2 联网搜索

联网检索调用：

```text
POST https://open.bigmodel.cn/api/paas/v4/tools
tool: web-search-pro
```

搜索结果经过以下处理：

1. Zod 校验上游格式；
2. 只允许 `http:` 和 `https:` URL；
3. 清理控制字符和多余空白；
4. 标题限制 300 字；
5. 摘录限制 650 字；
6. 按 URL 去重；
7. 最多保留 5 条；
8. 从 URL 主机名提取发布方；
9. 记录访问时间。

### 9.3 超时、重试和错误映射

外部调用使用 `AbortController`。默认超时 20 秒。网络异常或上游 5xx 最多重试一次，间隔 150ms。401/403、429、超时、无效 JSON和上游格式错误分别映射为稳定的应用错误。

### 9.4 搜索内容隔离

模型系统提示词把搜索内容包裹在：

```text
不可信外部资料开始
...
不可信外部资料结束
```

并明确要求忽略网页中的指令、角色要求、API Key 请求和规则覆盖文本。这是针对提示词注入的基础隔离。

浏览器只收到来源标题、URL、发布方和访问时间，不收到搜索摘录，减少不必要的数据暴露。

## 10. Open-Meteo 天气模块

天气模块包含两次请求：

```text
城市名
  ↓
Open-Meteo Geocoding API
  ↓
经纬度和时区
  ↓
Open-Meteo Forecast API
  ↓
当前天气 + 未来三天预报
```

城市候选优先级为：

1. 中国且 `feature_code === PPLA` 的行政中心；
2. 其他中国候选；
3. 第一条国际候选。

返回数据被规范化为：地点、行政区、国家、时区、当前温度、体感温度、湿度、降水、天气代码、风速、每日最高/最低温和最大降水概率。

小Y前端再根据高温、高湿和降雨概率生成底妆提示。目前结构化妆容工作台的天气开关尚未把此结果注入评分，只显示预留说明。

## 11. 产品数据模型

每条产品记录包含以下字段组：

```text
身份：id、brand、name、category
商品：price、priceCurrency、priceVerifiedAt、madeIn
选妆：skins、finish、coverage、wear、oxidation、scenes、shades
编辑：note、pros、cautions、rating、metrics
来源：informationSources、imageSource
状态：verificationStatus、factVerificationStatus、
      imageAuthorizationStatus、publicStatus、recommendationReady
```

产品 ID 是全系统主键，同时连接：

- React 产品卡；
- 详情深链接；
- 推荐结果；
- 妆容步骤；
- 人工核验表；
- 本地产品图片；
- 商品截图；
- 参数截图；
- 店铺截图；
- 图片来源台账。

## 12. 产品数据合并策略

`enrichProductRecord()` 把基础编辑数据、人工核验事实和图片来源合并。主要优先级为：

```text
人工核验品牌/名称/价格/产地
        优先于
基础产品记录中的旧字段
```

合并后：

- 商品价格显示人工核验原价；
- `priceVerifiedAt` 使用人工核验日期；
- 产品图片统一为 `/products/<id>/cover.webp`；
- 图片来源从独立台账注入；
- `factVerificationStatus` 根据人工核验状态更新；
- 图片授权仍保持 `pending`；
- 公开状态明确为来源披露但授权待核验。

## 13. 产品核验证据模块

### 13.1 人工核验事实

`product-verification.reviewed.js` 把 Excel 的 `淘宝人工核验!A6:S40` 规范化为对象。每条记录保存：

- 产品 ID；
- 品牌和产品名称；
- 官方或海外旗舰店名称；
- 官方标识；
- 企业主体；
- 淘宝商品标题；
- 规格；
- 商品原价；
- 淘宝分享链接；
- 核验日期；
- 参数截图产地；
- Excel 文件、工作表、行号和单元格范围。

### 13.2 淘宝/天猫 URL 门禁

`isAllowedOfficialProductUrl()` 只接受 HTTPS，并限制为：

- `detail.tmall.com/item.htm?id=...`；
- `item.taobao.com/item.htm?id=...`；
- 包含分享 token 的 `e.tb.cn` 链接。

普通首页、其他域名、HTTP、缺少商品 ID 或缺少 token 的链接不能通过。

### 13.3 产品评价证据分层

`buildProductAssessment()` 不把所有字段视为同等级事实：

- 商品名称、规格、价格、产地：人工核验事实；
- 妆效、肤质适配、优点和注意事项：编辑解读；
- 持妆小时、氧化程度：待独立测试；
- 综合评分：编辑示例，不是用户统计。

这使界面能够明确标记每个结论的证据性质。

### 13.4 证据同步与 SHA-256

`scripts/sync-product-verification.mjs` 的处理过程为：

```text
读取原始产品核验目录
   ↓
按照两位序号关联稳定产品 ID
   ↓
识别 product-detail / parameters / store-home
   ↓
复制到 public/verification/<产品ID>/
   ↓
计算每个文件的 SHA-256
   ↓
记录文件大小、原始相对路径和网页路径
   ↓
生成 product-verification.generated.js
   ↓
生成 public/verification/manifest.json
```

脚本也计算原始 Excel 工作簿的 SHA-256，使代码中的核验记录能够回溯到明确的源文件版本。

企业工商资质文件只建立内部索引，不复制到公开目录。

## 14. 图片资产与权利状态模块

35 张产品图片统一转换为 WebP，路径为：

```text
public/products/<产品ID>/cover.webp
```

`product-image-sources.js` 为每张图片记录：

```text
sourcePageUrl
rightsholder
authorizationStatus
acquiredAt
sourcePriority: brand_official | retailer | media
```

当前来源构成为：品牌官网 23 张、零售商 11 张、媒体页面 1 张。所有图片授权状态仍为 `pending`。页面提供统一来源声明和 GitHub 权利请求入口，但来源披露不等于取得授权。

## 15. 响应式和可用性实现

主站在 900px 和 680px 设置主要断点，小Y模块在 980px、760px 和 460px 设置断点。

典型处理包括：

- 桌面四列产品网格在手机端变为两列；
- 桌面左侧筛选栏在手机端变为固定抽屉；
- 移动端增加遮罩和关闭按钮；
- 主导航在窄屏变为菜单；
- 小Y双栏布局在手机端改为单栏；
- 工作台四列表单逐步降为两列和一列；
- 方案证据三列降为一列；
- 长 URL 使用 `overflow-wrap: anywhere`；
- 产品图使用固定 `aspect-ratio` 防止加载时布局跳动；
- 表单控件提供键盘焦点样式；
- 对话区使用 `aria-live="polite"` 播报新消息。

## 16. 开发、构建与部署

### 16.1 开发模式

```bash
npm run dev
```

`concurrently` 同时启动：

```text
Vite     http://127.0.0.1:5174
Fastify  http://127.0.0.1:8787
```

Vite 将 `/api` 代理到 Fastify。

### 16.2 生产模式

```bash
npm run build
npm start
```

Vite 先生成 `dist/`，随后 Fastify 使用 `@fastify/static` 提供构建产物和 API，实现同源部署。

### 16.3 环境变量

主要配置包括：

```text
YASPRETTY_HOST
FISHTALK_PORT
ZHIPU_API_KEY
ZHIPU_MODEL
UPSTREAM_TIMEOUT_MS
API_RATE_LIMIT_MAX
AI_RATE_LIMIT_MAX
AI_DAILY_LIMIT
TRUST_PROXY
```

全部环境变量在启动时通过 Zod 校验。端口、超时和额度都有最小值与最大值约束，错误配置会阻止服务启动。

## 17. 自动化测试模块

当前有 4 个测试文件、32 项测试。

### 17.1 小Y规则测试

覆盖：

- 天气、产品、问候和通用意图路由；
- 时效问题联网判断；
- 肤质、预算、妆效、场景和品类提取；
- 肤质和预算硬过滤；
- 无候选提示；
- 模型产品 ID 白名单；
- 工作台表单到 API 数据映射。

### 17.2 API 网关测试

使用 Fastify `inject()`，不需要打开真实端口。覆盖：

- 35 条产品 Schema；
- 健康检查和安全头；
- 浏览器 API Key 拒绝；
- 无服务端 Key 错误；
- 搜索编排和摘录隔离；
- 天气规范化；
- 稳定错误响应；
- 每日额度；
- 64 KiB 请求限制；
- 非法 JSON；
- 旧接口退役；
- 每 IP 限流；
- 本地七步方案；
- 硬条件不可越过；
- 模型无效输出降级；
- 腮红、唇妆和眉眼产品接入。

### 17.3 Provider 测试

使用 Vitest Mock 模拟上游响应，覆盖：

- 无 Key 不发起网络请求；
- 5xx 重试一次；
- Authorization 只存在于服务端请求；
- 超时映射；
- 错误响应 Schema；
- `javascript:` 等危险来源链接过滤。

### 17.4 产品证据测试

覆盖：

- 35 个产品 ID 均映射证据记录；
- 每条记录至少包含参数证据；
- 公开证据文件真实存在；
- 文件 SHA-256 与清单一致；
- Excel 工作簿哈希一致；
- 35 条商品链接通过平台 URL 门禁；
- 产品价格和核验日期与人工记录一致；
- 34/35 条产地有参数证据；
- 编辑评价不会被标记成独立人体实测。

### 17.5 当前复验结果

2026 年 11 月 2 日执行 `npm run check`：

```text
Test Files: 4 passed
Tests:      32 passed
Vite:       1792 modules transformed
JS:         365.01 KB / gzip 108.15 KB
CSS:        50.44 KB / gzip 11.04 KB
```

## 18. 当前尚未实现的技术

以下内容出现在目标文档中，但不能写成当前已完成能力：

1. MediaPipe Face Landmarker、照片上传、图像质量检查和浏览器端人脸关键点分析；
2. `VisualAnalysis` 数据链路；
3. `POST /api/makeup-plans/:id/adjust` 局部调整接口；
4. 妆容方案版本持久化；
5. PostgreSQL、Prisma、账号和跨设备同步；
6. React Testing Library 组件渲染测试；
7. Playwright 桌面和手机端端到端测试；
8. 多实例共享的 Redis/数据库限流与每日额度；
9. 正式公网部署；
10. 支付、库存、物流和订单系统。

## 19. 当前技术限制与可改进点

1. `App.jsx` 和 `XiaoYAssistant.jsx` 承担职责较多，后续可拆分路由、筛选、详情和推荐领域模块。
2. 当前页面路由为自定义 History API，页面增加后适合引入正式路由层。
3. 收藏仍直接访问 `localStorage`，尚未统一进入版本化存储模块。
4. 本地意图识别主要依赖正则，品类和意图扩大后需要拆成服务端意图路由器。
5. 工作台天气选项尚未调用天气 Provider，当前只是数据字段和结果占位。
6. 每日 AI 额度存储在单进程内存，重启或多实例部署时不可靠。
7. 模型结构化成功链路尚未使用受限真实 Key 完成验收，目前可靠路径主要是本地规则降级。
8. 产品适配、持妆、氧化和评分仍包含编辑判断，尚未建立独立测试数据集。
9. 产品图片来源已披露，但全部明确再利用授权仍待完成。
10. `beauty-assistant.html`、`server/test-memory.cjs` 和 `server/memory/` 是历史遗留，不属于当前主架构。

## 20. 可以用于 OPC 文档的技术总结

YasPretty 的技术实现可以概括为以下四条：

1. **结构化约束推荐**：使用 Zod 定义用户画像、妆容请求、候选证据和妆容方案；先执行肤质、预算、妆效和排除品牌硬过滤，再进行可解释加权评分。
2. **规则与大模型协同**：确定性规则决定候选范围和事实边界，大模型只负责在候选范围内组织七步妆容方案；输出经过 JSON Schema、产品 ID 白名单和一次修复校验，失败自动回退本地模板。
3. **生产级服务端网关**：第三方 Key 只保存在服务端，Fastify 网关统一实现输入校验、请求限制、限流、额度、超时、重试、安全头、日志脱敏和稳定错误码。
4. **可追溯产品证据链**：以稳定产品 ID 连接人工核验表、商品字段、官方旗舰店链接、截图证据、本地图片和 SHA-256 清单，并在界面区分已核验事实、编辑解读、待独立实测和授权待核验内容。

这四项共同构成项目真正的技术核心：不是单纯接入一个聊天模型，而是建立“结构化输入、确定性筛选、受控模型生成、Schema 校验、产品证据追溯和失败降级”的完整技术闭环。

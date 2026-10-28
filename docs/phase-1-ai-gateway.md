# 阶段 1：生产级 AI 网关

记录日期：2026-10-28（北京时间）

## 结论

阶段 1 已将主站小Y从“浏览器携带第三方 Key并直通旧代理”迁移为服务端统一编排。普通用户界面不再显示 Key 或模型设置，浏览器不再构造第三方 Authorization。产品浏览、本地规则推荐和天气在没有智谱 Key 时继续可用。

这只表示阶段 1 的本地实现与测试完成，不代表正式公网部署完成，也不代表智谱付费链路已经使用真实 Key 验收。

## 当前数据流

```text
React 主站
  ├─ 本地产品浏览与确定性推荐
  └─ 同源 /api
       ├─ GET /api/health
       ├─ GET /api/weather -> Open-Meteo provider
       └─ POST /api/assistant
            ├─ Zod 请求校验
            ├─ 服务端判断是否需要检索
            ├─ 智谱 web-search-pro provider（可选）
            ├─ 不可信检索资料隔离提示
            └─ 智谱 GLM provider
```

开发环境由 Vite 将 `/api` 代理到 `127.0.0.1:8787`。生产构建由同一 Fastify 服务提供 `dist/` 和 API，不需要开放跨域访问。

## 已实现控制

- 密钥只从服务端 `ZHIPU_API_KEY` 环境变量读取；`.env` 被 Git 忽略。
- `server/key.txt`、浏览器 Key、`/proxy/chat` 和 `/proxy/websearch` 退出主流程。
- React 小Y加载时清理旧版 `yaspretty-xiaoy-config` 与 `yaspretty-assistant-config`。
- 小Y画像和最近对话迁移到版本化本地存储；仍是匿名浏览器数据，不描述为服务端永久保存。
- `Zod` 验证天气查询、对话请求、用户画像、上游响应和可见来源。
- 请求体上限为 64 KiB；对话条数、单条文本、查询和画像字段均有限制。
- 智谱调用具有 20 秒默认超时和一次 5xx/连接错误有限重试；认证、限流和格式错误不会盲目重试。
- 默认每 IP 每分钟通用 API 60 次、AI 20 次；AI 每日额度默认 200 次。
- 安全头由 Helmet 提供；没有无条件 `Access-Control-Allow-Origin: *`。
- Fastify 默认请求日志被关闭，只记录请求 ID、方法、路由模板和状态码；不记录请求体、Authorization 或完整查询内容。
- API 使用稳定错误码，不返回堆栈、上游原始响应、密钥或服务端路径。
- 外部检索摘录不返回浏览器；服务端提示模型将网页内容视为不可信资料并忽略其中的指令。
- 模型返回的产品标记仍由前端按站内 ID 二次过滤，不存在的产品不会渲染。

## API 行为

| 接口 | 成功行为 | 主要失败码 |
| --- | --- | --- |
| `GET /api/health` | 返回服务状态及 AI/天气可用性，不返回路径或配置值 | `RATE_LIMITED` |
| `GET /api/weather?city=` | 返回规范化地点、当前天气、三日天气和来源 | `VALIDATION_ERROR`、`CITY_NOT_FOUND`、`WEATHER_TIMEOUT`、`WEATHER_UNAVAILABLE` |
| `POST /api/assistant` | 服务端检索（需要时）、生成回答并返回可见来源 | `VALIDATION_ERROR`、`PROVIDER_NOT_CONFIGURED`、`PROVIDER_TIMEOUT`、`PROVIDER_UNAVAILABLE`、`RATE_LIMITED`、`DAILY_QUOTA_EXCEEDED` |

旧 `/memory` 与 `/proxy/*` 只返回 410 `LEGACY_ENDPOINT_REMOVED`。旧 `server/memory/*.json` 没有删除，只是不再被新服务读取或公开。

## 验证结果

2026-10-28 实测：

- `npm run check`：通过。
- Vitest：3 个测试文件、21 项测试全部通过。
- Vite 8.3.5：生产构建通过，1787 个模块成功转换。
- npm 官方 registry `npm audit --omit=dev`：0 个已知漏洞。
- 开发入口 `http://127.0.0.1:5174/`：返回 React 主站。
- 生产同源入口 `http://127.0.0.1:8787/`：返回相同 React 主站。
- `/api/health`：AI 未配置、天气可用；无跨域通配头，安全头存在。
- Open-Meteo 上海查询：成功，包含地点、当前天气和逐日数据。
- 未配置 Key 的 `/api/assistant`：稳定返回 503 `PROVIDER_NOT_CONFIGURED`，没有上游调用。
- 无头 Chrome：1440px 桌面和 360px 手机视口均进入真实小Y页面，无横向溢出；手机输入区位于视口内；无 Key 输入、无模型设置按钮、无控制台错误。

测试覆盖：意图路由、联网判断、画像提取、肤质和预算硬过滤、无候选状态、产品 ID 白名单、API schema、浏览器 Key 拒绝、无 Key、来源隔离、天气成功与失败、超大请求、每分钟限流、每日额度、智谱超时、5xx 有限重试和异常上游格式。

## 尚未完成与风险

- 没有真实 `ZHIPU_API_KEY`，因此没有执行付费智谱端到端请求；配置后仍需用受限比赛专用 Key 做一次授权验收并保存脱敏结果。
- 每 IP 和每日额度保存在单个 Node 进程内，重启会清空，多实例不会共享；当前适合本地与单实例参赛演示，不是长期规模化计费系统。
- 没有正式公网域名、HTTPS、反向代理、监控或生产密钥管理服务。
- 完整 React 组件测试、Playwright 桌面/移动主流程和弱网浏览器测试留到阶段 5。
- 31 条产品数据仍未通过目标来源 schema；本阶段只约束模型使用方式，没有替代产品事实核验。
- 本地及远程图片、Google Fonts 和 Unsplash 的公开使用权与资源清单仍需核验。
- 已暴露旧密钥仍必须由项目负责人在智谱控制台吊销、轮换并检查账单，本地代码清理不能替代该动作。
- `beauty-assistant.html` 与 `server/test-memory.cjs` 仅作为历史文件保留，不是主演示入口，也不得用于证明当前能力。

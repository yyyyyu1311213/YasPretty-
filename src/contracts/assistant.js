/**
 * 小Y契约依据 server/schemas.cjs、server/app.cjs、XiaoYAssistant.jsx。
 * JSDoc 的 [field] 表示可缺省（field?）；显式空值另用 | null 表示。
 */

/**
 * 小Y当前对话画像，可为 {}；与标准 UserProfile 独立，不合并或改名。
 * features/assistant/hooks/useAssistant.js 通过 lib/storage/ 保存此画像；此处不定义读写或迁移。
 * @typedef {object} AssistantProfile
 * @property {string} [skin]
 * @property {string} [finish]
 * @property {string} [scene]
 * @property {number} [budget] 有限数字，0–100000，不是表单字符串。
 * @property {string} [category]
 * @property {string} [coverage]
 * @property {string} [tone]
 * @property {string} [city]
 */

/**
 * API 历史消息，只含角色和正文；不能直接发送带 UI 元数据的 AssistantMessage。
 * @typedef {object} ConversationMessage
 * @property {'user' | 'assistant'} role
 * @property {string} content 去除首尾空白后 1–4000 字符。
 */

/**
 * @typedef {object} AssistantRequest
 * @property {string} query 去除首尾空白后 1–2000 字符。
 * @property {ConversationMessage[]} [messages] 省略时服务端使用 []，最多 12 条。
 * @property {AssistantProfile} [profile] 省略时服务端使用 {}。
 */

/**
 * 小Y响应的引用；与 ProductSource 的字段及日期精度不同。
 * @typedef {object} AssistantSource
 * @property {'web' | 'knowledge' | 'weather'} kind 服务端解析后总是存在。
 * @property {string} title
 * @property {string} url
 * @property {string} publisher 未提供发布方时服务端补 ''。
 * @property {string} accessedAt ISO 8601 UTC 日期时间，如 2026-11-16T10:00:00.000Z。
 */

/**
 * POST /api/assistant 的实际成功响应，含 app.cjs 添加的 ok。
 * @typedef {object} AssistantResponse
 * @property {true} ok
 * @property {string} answer API 原文，可能含 [[PRODUCT:id]] 标记；不是 UI 的 text。
 * @property {AssistantSource[]} sources 无来源时为 []。
 * @property {boolean} usedWebSearch 是否使用智谱联网检索；weather 回答可为 false。
 * @property {'model' | 'knowledge' | 'search' | 'weather' | 'clarification'} answerMode
 * @property {string | null} model 非模型回答或无模型名时为 null，不是 UI 处理后的 ''。
 */

/**
 * 小Y界面和当前本地消息值；不包含 localStorage 的版本包装。
 * @typedef {object} AssistantMessage
 * @property {string} id
 * @property {'user' | 'assistant'} role
 * @property {string} content
 * @property {string[]} productIds 无关联产品时为 []。
 * @property {AssistantSource[]} [sources] 欢迎消息省略；createMessage 无来源时写入 []。
 */

/**
 * /api/assistant 和 /api/makeup-plans 的公开错误响应（errors.cjs）。
 * @typedef {object} ApiErrorResponse
 * @property {false} ok
 * @property {object} error
 * @property {string} error.code
 * @property {string} error.message
 * @property {string} error.requestId
 * @property {Array<{path: string, message: string}>} [error.details] schema 输入失败时返回的字段问题。
 */

export {}

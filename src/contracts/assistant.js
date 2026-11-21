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
 * API 历史消息，只发送角色、正文及已有的近期商品 ID；不发送其他 UI 元数据。
 * @typedef {object} ConversationMessage
 * @property {'user' | 'assistant'} role
 * @property {string} content 去除首尾空白后 1–4000 字符。
 * @property {string[]} [productIds] 最多 3 个既有商品 ID，按回答顺序；仅助手消息参与指代定位。
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
 * @property {'web' | 'knowledge' | 'weather' | 'product'} kind 服务端解析后总是存在。
 * @property {string} title
 * @property {string | null} url product 内部归档可以为空，不将内部证据路径当作 URL。
 * @property {string} publisher 未提供发布方时服务端补 ''。
 * @property {string | null} accessedAt 外部来源为 ISO 日期时间；product 继承原核验日期，缺失为 null。
 * @property {string} [id] product 来源标识。
 * @property {string} [productId] product 的稳定 ID。
 * @property {string} [version] 来源适用的产品版本。
 * @property {string | null} [sku] 未明确记录时为 null。
 * @property {'recorded' | 'pending' | 'unknown' | 'conflict'} [status] 证据状态，不升级原数据核验结论。
 * @property {string} [evidenceLabel] 对用户可读的归档说明，不包含内部文件路径。
 * @property {string[]} [supports] 支持本次回答的字段。
 * @property {string[]} [limitations] 来源和核验范围限制。
 */

/**
 * POST /api/assistant 的实际成功响应，含 app.cjs 添加的 ok。
 * @typedef {object} AssistantResponse
 * @property {true} ok
 * @property {string} answer API 原文，可能含 [[PRODUCT:id]] 标记；不是 UI 的 text。
 * @property {AssistantSource[]} sources 无来源时为 []。
 * @property {boolean} usedWebSearch 是否使用智谱联网检索；weather 回答可为 false。
 * @property {'model' | 'knowledge' | 'search' | 'weather' | 'clarification' | 'local'} answerMode
 * @property {string} [intent] 服务端判定的本次意图，不写入本地存储。
 * @property {string | null} model 非模型回答或无模型名时为 null，不是 UI 处理后的 ''。
 * @property {Array<{question: string, intent: string, status: 'answered'|'partial'|'unavailable'|'clarification', knowledgeIds: string[], productIds: string[], missing: string[]}>} [coverage] 当前响应的逐项覆盖及缺口，不发送到历史请求。
 * @property {import('./makeupPlan.js').KnowledgeEvidence[]} [knowledgeEvidence] 通用知识的版本、复核日期、适用条件与来源，不证明具体产品事实。
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

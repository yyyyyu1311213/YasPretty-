/**
 * 方案契约依据 server/schemas.cjs 和 makeup-plan-service.cjs。
 * 产品只保存站内稳定 ID；不嵌入 Product，不在此执行转换或校验。
 */

/**
 * @typedef {object} PlanStep
 * @property {string} id
 * @property {string} category
 * @property {string} goal
 * @property {string} technique
 * @property {string} texture
 * @property {string} colorDirection
 * @property {string | null} primaryProductId 没有可靠站内产品时明确为 null。
 * @property {string[]} alternativeProductIds 无备选时为 []；schema 最多接受 3 项。
 * @property {string[]} reasons 无内容时为 []。
 * @property {string[]} cautions 无内容时为 []。
 */

/**
 * @typedef {object} CandidateEvidence
 * @property {string} productId
 * @property {number} score 确定性规则匹配分，0–100，不是产品评分或用户评价。
 * @property {string[]} matchedConditions 无匹配说明时为 []。
 * @property {string[]} tradeoffs 无取舍说明时为 []。
 */

/**
 * 服务端已补齐默认值的输入快照，不是原始表单或小Y画像。
 * @typedef {object} MakeupPlanInputsSnapshot
 * @property {import('./userProfile.js').UserProfile} userProfile
 * @property {import('./makeupRequest.js').MakeupRequest} makeupRequest
 */

/**
 * @typedef {object} MakeupPlan
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {MakeupPlanInputsSnapshot} inputsSnapshot
 * @property {string} externalContextSummary 当前服务说明未调用外部上下文，不代表已接入外部工具。
 * @property {PlanStep[]} steps Schema 接受 5–8 步；当前本地模板生成 7 步。
 * @property {string[]} recommendedProductIds 无候选时为 []，最多 6 项。
 * @property {CandidateEvidence[]} candidateEvidence 无候选时为 []，最多 12 项。
 * @property {number} confidence 0–1 的方案置信度，不是实测准确率。
 * @property {string[]} limitations 无内容时为 []。
 * @property {'local' | 'model'} sourceMode
 * @property {string} createdAt ISO 8601 UTC 日期时间，如 2026-11-16T10:00:00.000Z。
 * @property {'makeup-plan.v1'} schemaVersion
 */

/**
 * POST /api/makeup-plans 的 JSON 请求；省略的对象/字段由服务端 schema 补齐。
 * Partial 只描述请求可缺省性，不放宽已提供字段的类型；budgetTotal 仍须为数字。
 * @typedef {object} MakeupPlanRequest
 * @property {Partial<import('./userProfile.js').UserProfile>} [userProfile]
 * @property {Partial<import('./makeupRequest.js').MakeupRequest>} [makeupRequest]
 */

/**
 * POST /api/makeup-plans 的成功响应，失败响应见 ApiErrorResponse。
 * @typedef {object} MakeupPlanResponse
 * @property {true} ok
 * @property {MakeupPlan} plan
 */

export {}

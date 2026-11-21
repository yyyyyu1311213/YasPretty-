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
 * @property {KnowledgeEvidence[]} [knowledgeEvidence] 通用手法依据，最多 8 项；兼容旧方案缺省。
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

/**
 * 通用手法证据，由服务端从受控知识生成，模型不可自行填写。
 * @typedef {object} KnowledgeEvidence
 * @property {string} id
 * @property {string} title
 * @property {string} version
 * @property {string} reviewedAt 内容复核日期 YYYY-MM-DD；不是来源访问日期。
 * @property {string[]} conditions
 * @property {string[]} limitations
 * @property {string[]} [safetyBoundaries] 必须完整保留的停止使用/咨询提示，兼容旧证据缺省。
 * @property {Array<{title: string, url: string, publisher: string, accessedAt: string, supports: string[]}>} sources
 * @property {string[]} [stepIds] 关联的方案步骤；与商品 candidateEvidence 独立。
 */

export {}

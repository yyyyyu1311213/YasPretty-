/**
 * 前端类型统一入口，仅包含 JSDoc 类型别名和空模块标记，不导出运行时值。
 * 通过 JSDoc 的 import('./contracts/index.js').UserProfile 引用（路径按使用文件调整）。
 * 可缺省用 [field]（field?），显式空值用 | null；已返回的空数组保留 []。
 *
 * @typedef {import('./userProfile.js').UserProfile} UserProfile
 * @typedef {import('./makeupRequest.js').MakeupRequest} MakeupRequest
 * @typedef {import('./makeupRequest.js').MakeupWorkbenchForm} MakeupWorkbenchForm
 * @typedef {import('./makeupPlan.js').PlanStep} PlanStep
 * @typedef {import('./makeupPlan.js').CandidateEvidence} CandidateEvidence
 * @typedef {import('./makeupPlan.js').MakeupPlanInputsSnapshot} MakeupPlanInputsSnapshot
 * @typedef {import('./makeupPlan.js').MakeupPlan} MakeupPlan
 * @typedef {import('./makeupPlan.js').MakeupPlanRequest} MakeupPlanRequest
 * @typedef {import('./makeupPlan.js').MakeupPlanResponse} MakeupPlanResponse
 * @typedef {import('./assistant.js').AssistantProfile} AssistantProfile
 * @typedef {import('./assistant.js').ConversationMessage} ConversationMessage
 * @typedef {import('./assistant.js').AssistantRequest} AssistantRequest
 * @typedef {import('./assistant.js').AssistantSource} AssistantSource
 * @typedef {import('./assistant.js').AssistantResponse} AssistantResponse
 * @typedef {import('./assistant.js').AssistantMessage} AssistantMessage
 * @typedef {import('./assistant.js').ApiErrorResponse} ApiErrorResponse
 * @typedef {import('./product.js').ProductSource} ProductSource
 * @typedef {import('./product.js').ProductImageSource} ProductImageSource
 * @typedef {import('./product.js').ProductImage} ProductImage
 * @typedef {import('./product.js').ProductShade} ProductShade
 * @typedef {import('./product.js').ProductShadeVerification} ProductShadeVerification
 * @typedef {import('./product.js').Product} Product
 */

export {}

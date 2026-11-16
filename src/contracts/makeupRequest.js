/**
 * 妆容需求：对应 server/schemas.cjs 的 makeupRequestSchema 解析结果。
 * 当前接口不接收照片分析结果或 externalContextEnabled 字段。
 *
 * @typedef {object} MakeupRequest
 * @property {string} scene 解析默认值为“日常”。
 * @property {string} style 解析默认值为“自然”。
 * @property {number} wearHours 1–24 的整数，解析默认值为 8。
 * @property {'早晨' | '白天' | '夜晚' | 'unknown'} timeOfDay
 * @property {boolean} photoEnabled Schema 保留的标志；当前 UI 固定提交 false，不代表已支持照片处理。
 * @property {string[]} priorities 无优先目标时为 []，最多 6 项。
 */

/**
 * MakeupWorkbench.jsx 当前表单状态，不可直接作为 API 请求。
 * legacyToForm、toPlanPayload 等转换继续由现有组件负责。
 *
 * @typedef {object} MakeupWorkbenchForm
 * @property {import('./userProfile.js').UserProfile['skinType']} skinType
 * @property {import('./userProfile.js').UserProfile['undertone']} undertone
 * @property {string} finish 单个妆效选项，不是 API 的 finishPreferences 数组。
 * @property {string} budgetTotal 数字输入框的文本值，允许 ''；转换后才是数字预算。
 * @property {import('./userProfile.js').UserProfile['skillLevel']} skillLevel
 * @property {string} scene
 * @property {string} style
 * @property {number | string} wearHours 初始值为数字，select 的 onChange 返回字符串。
 * @property {MakeupRequest['timeOfDay']} timeOfDay
 * @property {string[]} priorities
 */

export {}

/**
 * 标准画像：对应 server/schemas.cjs 的 userProfileSchema 解析结果。
 * 所有默认字段在解析后均存在；请求中省略字段的语义见 MakeupPlanRequest。
 * 与小Y的 AssistantProfile 独立，不接受表单预算字符串。
 *
 * @typedef {object} UserProfile
 * @property {'油皮' | '混油皮' | '干皮' | '混干皮' | '敏感肌' | 'unknown'} skinType
 * @property {'self_reported' | 'unknown'} skinTypeSource
 * @property {'冷调' | '中性调' | '暖调' | 'unknown'} undertone
 * @property {string[]} finishPreferences 无偏好时为 []，最多 4 项。
 * @property {string[]} concerns 无关注项时为 []，最多 6 项。
 * @property {number} budgetTotal 有限数字，0–100000；0 表示不设预算上限。
 * @property {'新手' | '熟练' | '进阶' | 'unknown'} skillLevel
 * @property {string[]} excludedBrands 无排除项时为 []，最多 12 项。
 * @property {string[]} sensitivities 无自述敏感项时为 []，最多 8 项。
 * @property {string} city 未提供时为 ''。
 */

export {}

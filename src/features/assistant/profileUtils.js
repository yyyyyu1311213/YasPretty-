// Pure text parsing shared with the server. Self reports and request conditions stay separate.
const SKIN = /混油皮|混干皮|敏感肌|大油皮|大干皮|油皮|干皮/
const FINISH = /自然光泽|奶油肌|柔雾|哑光|雾面|水光|亮泽/
const CATEGORY = /粉底液|粉底|气垫|遮瑕|散粉|素颜霜|隔离|有色面霜|眉妆|眼影|眼线|睫毛膏|腮红|唇妆|修容/
const SCENE = /长时间带妆|通勤|约会|拍照|夏季|秋冬|答辩/
const desire = /^(?:我)?(?:想要|想找|喜欢|偏好|需要|想买|要买|要用|希望|用于)/
const otherSubject = /朋友|妈妈|姐姐|妹妹|同事|别人|她|他|这款|这瓶|这个|该款|产品|商品/

// A monetary ceiling is not a specification, a quoted selling price or a lower bound.
export function extractSpendingLimit(text) {
  if (/售价|价格|定价|标价|原价|参考价/.test(text)) return undefined
  const amount = '(\\d{1,5}(?:\\.\\d{1,2})?)'
  const range = `(?:\\s*(?:-|到|至|~|～)\\s*[¥￥]?\\s*${amount})?`
  const units = '(?![\\d.]|\\s*(?:-|到|至|~|～|g|ml|h|克|毫升|小时|天|年|号|岁|分钟))'
  const explicit = new RegExp(`(?:预算\\s*(?:是|为|在|约|大约|大概|不超过|最多|控制在)?|不超过|最多|上限|控制在)\\s*[¥￥]?\\s*${amount}${range}${units}`, 'i')
  const bounded = new RegExp(`(?<![\\d.])${amount}\\s*(?:元|块钱|块)\\s*(?:以内|以下|内|左右|上下)`)
  const match = text.match(explicit) || text.match(bounded)
  return match ? Number(match[2] || match[1]) : undefined
}

// Ephemeral request conditions may describe someone else. Never persist this result as a profile.
export function extractRequestConditions(text, current = {}) {
  const conditions = { ...current }
  const category = text.match(CATEGORY)?.[0] || (/底妆/.test(text) ? '粉底液' : undefined)
  if (category) conditions.category = category === '粉底' ? '粉底液' : category
  const skin = text.match(/(?:适合|给|为|推荐(?:一款|一个)?)\s*(混油皮|混干皮|敏感肌|油皮|干皮)/)?.[1]
  if (skin) conditions.skin = skin
  const budget = extractSpendingLimit(text)
  if (budget !== undefined) conditions.budget = budget
  return conditions
}

export function extractProfile(text, current = {}) {
  const next = { ...current }
  // Quoted statements and questions do not constitute a self-report.
  const unquoted = String(text).replace(/[“「『"].*?[”」』"]/g, '')
  let otherContext = false
  let uncertainContext = false
  let correction = false
  const requestOnly = /^(?:请|帮我|给我)?推荐/.test(unquoted.trim())
  for (const part of unquoted.match(/[^，,。；;！!？?]+[？?]?/g) || []) {
    const clause = part.trim()
    const explicitSelf = /^(?:而|但是|但)?我(?!朋友|妈妈|姐姐|妹妹|同事)/.test(clause)
    if (explicitSelf) otherContext = false
    if (/^(?:而|但是|但)?我(?:是|的|肤质|属于|偏)/.test(clause)) uncertainContext = false
    if (otherSubject.test(clause)) otherContext = true
    if (/假如|如果|假设/.test(clause)) uncertainContext = true
    if (otherContext || uncertainContext) continue
    if (/^我不是.*(?:皮|肌)/.test(clause)) { correction = true; continue }
    if (!clause || /[？?]|吗|是否|是不是|还是|可能|好像|大概是|也许|不确定|应该是|假如|如果|假设/.test(clause)) continue
    const skin = clause.match(SKIN)?.[0]
    if (skin && (/^(?:我是|我(?:的)?肤质(?:是|为)|我属于|我偏|肤质(?:是|为|改为)|改为|更正为)/.test(clause) || clause === skin || correction && /^是/.test(clause))
      && !/不是|不属于|不确定/.test(clause)) next.skin = skin.replace(/^大/, '')
    correction = false
    const personal = desire.test(clause) && !/不|排除|避免/.test(clause)
    if (personal) {
      const finish = clause.match(FINISH)?.[0]
      if (finish) next.finish = ({ 雾面: '柔雾', 水光: '自然光泽', 亮泽: '自然光泽' })[finish] || finish
      const category = clause.match(CATEGORY)?.[0]
      if (category) next.category = category === '粉底' ? '粉底液' : category
      const scene = clause.match(SCENE)?.[0]
      if (scene) next.scene = scene
      if (/高遮瑕|遮瑕强/.test(clause)) next.coverage = '高'
      if (/轻薄|低遮瑕/.test(clause)) next.coverage = '低'
    }
    if (/^(?:我是|我的肤色(?:是|为)|我的色调(?:是|为)|色调改为)/.test(clause)) {
      if (/冷白|冷调/.test(clause)) next.tone = '冷调'
      if (/黄皮|暖调/.test(clause)) next.tone = '暖调'
      if (/中性调/.test(clause)) next.tone = '中性调'
    }
    const budgetStatement = /^(?:(?:我(?:的)?)?预算|不超过|最多|上限|[¥￥]?\s*\d|(?:我)?(?:想要|想找|想买|要买))/.test(clause)
    const budget = budgetStatement && (!requestOnly || /^(?:我的|我)预算/.test(clause)) ? extractSpendingLimit(clause) : undefined
    if (budget !== undefined) next.budget = budget
  }
  return next
}

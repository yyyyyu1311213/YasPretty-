const { namedProducts } = require('./product-resolver.cjs')

function routePreferenceFromText(query, messages = []) {
  const text = String(query || '').trim()
  const isOfferedSelection = messages.at(-1)?.role === 'assistant'
    && /(?:搭配完整妆容|调整妆容方向).*(?:自然修饰|日常彩妆|不区分性别)/.test(messages.at(-1)?.content || '')
  if (/^(?:natural_refinement|自然修饰)[。！!？?\s]*$/.test(text) && (isOfferedSelection || /完整妆容/.test(text))) return 'natural_refinement'
  if (/^(?:daily_makeup|日常彩妆)[。！!？?\s]*$/.test(text) && (isOfferedSelection || /完整妆容/.test(text))) return 'daily_makeup'
  if (/^(?:neutral_makeup|不区分性别|按需求搭配)[。！!？?\s]*$/.test(text) && (isOfferedSelection || /完整妆容/.test(text))) return 'neutral_makeup'
  if (/自然修饰|natural_refinement/.test(text)) return 'natural_refinement'
  if (/日常彩妆|daily_makeup/.test(text)) return 'daily_makeup'
  if (/不区分性别|按需求搭配|neutral_makeup/.test(text)) return 'neutral_makeup'
  return 'unspecified'
}

async function directParameters(query, profile = {}, products = [], messages = []) {
  // Share the same pure self-report rules with the browser; never infer a profile via GLM.
  const { extractProfile, extractRequestConditions } = await import('../../../src/features/assistant/profileUtils.js')
  const text = String(query || '')
  const stated = extractProfile(text, profile)
  const mentionedBrands = [...new Set(products.map((p) => p.brand))].filter((brand) => text.toLowerCase().includes(brand.toLowerCase()))
  const excludedBrands = mentionedBrands.filter((brand) => {
    const index = text.toLowerCase().indexOf(brand.toLowerCase())
    return /(?:不要|排除|不考虑)\s*$/.test(text.slice(0, index))
  })
  const brands = mentionedBrands.filter((brand) => !excludedBrands.includes(brand))
  const productIds = namedProducts(text, products).filter((p) => !excludedBrands.includes(p.brand)).map((p) => p.id)
  return { profile: stated, recommendation: { ...extractRequestConditions(text, stated), brands, excludedBrands, productIds,
    routePreference: routePreferenceFromText(text, messages) } }
}

function previousRequestForCorrection(query, messages = []) {
  const text = String(query || '').trim()
  if (/换个问题|换个话题|我想问的是/.test(text)
    || !/^(?:预算|肤质|皮肤|妆效|场景|通勤|面试|拍照|排除|不要|不考虑|改为|改成|换成|调整为|修正|纠正|我是(?:油皮|混油皮|干皮|混干皮|敏感肌))/.test(text)) return ''
  const previous = [...messages].reverse().find((message) => message?.role === 'user' && typeof message.content === 'string')?.content?.trim() || ''
  return /(?:推荐|购买|想买|想选|找一款|找个|粉底|底妆|气垫|遮瑕|眉笔|眉粉|口红)/.test(previous) ? previous : ''
}

function mergeCorrectionConditions(previous, current) {
  const merged = { ...previous }
  for (const field of ['category', 'skin', 'skinValues', 'skinLabel', 'skinSkipped', 'budget', 'finish', 'scene', 'coverage', 'tone']) {
    if (current[field] !== undefined) merged[field] = current[field]
  }
  if (current.brands?.length) merged.brands = current.brands
  if (current.productIds?.length) merged.productIds = current.productIds
  merged.excludedBrands = [...new Set([...(previous.excludedBrands || []), ...(current.excludedBrands || [])])]
  if (current.routePreference && current.routePreference !== 'unspecified') merged.routePreference = current.routePreference
  return merged
}

async function extractParameters(query, profile = {}, products = [], messages = []) {
  const current = await directParameters(query, profile, products, messages)
  const previousQuery = previousRequestForCorrection(query, messages)
  if (!previousQuery) return current
  const previous = await directParameters(previousQuery, profile, products)
  return { profile: current.profile, recommendation: mergeCorrectionConditions(previous.recommendation, current.recommendation) }
}

// Apply only fields stated in each follow-up. Earlier constraints survive unrelated answers.
async function extractGuidedParameters(initialQuery, updates = [], profile = {}, products = []) {
  const result = await extractParameters(initialQuery, profile, products)
  for (const update of updates) {
    const text = update.replace(/预算(?:改成|改为|换成|调整为|是)/g, '预算')
    const next = await extractParameters(text, {}, products)
    Object.assign(result.profile, next.profile)
    const { brands, excludedBrands, productIds, ...conditions } = next.recommendation
    Object.assign(result.recommendation, conditions)
    if (brands.length) result.recommendation.brands = brands
    if (productIds.length) result.recommendation.productIds = productIds
    result.recommendation.excludedBrands = [...new Set([...result.recommendation.excludedBrands, ...excludedBrands])]
  }
  // Plan inputs use these temporary request conditions, never the persisted profile.
  for (const field of ['budget', 'finish', 'scene', 'skin']) {
    if (result.recommendation[field] !== undefined) result.profile[field] = result.recommendation[field]
  }
  return result
}

function planInput(query, profile, conditions = {}) {
  const wear = query.match(/(\d{1,2})\s*(?:小时|h)/i)
  const style = /水光|清透|韩女/.test(query) ? '清透' : /氛围|浓妆/.test(query) ? '氛围' : /精致/.test(query) ? '精致' : /柔雾|哑光/.test(query) ? '柔雾' : '自然'
  const routeStyles = { natural_refinement: '自然修饰', daily_makeup: '日常彩妆', neutral_makeup: '按需求搭配、不区分性别' }
  const routePreference = conditions.routePreference || routePreferenceFromText(query)
  const priorities = [
    /轻薄|水光|清透/.test(query) && '轻薄', /持妆|长时间/.test(query) && '持妆',
    /遮瑕/.test(query) && '遮瑕', /控油|油皮/.test(query) && '控油',
    /保湿|水光|干皮/.test(query) && '保湿', /快速|通勤/.test(query) && '快速完成',
  ].filter(Boolean).slice(0, 4)
  return {
    userProfile: {
      skinType: ['油皮', '混油皮', '干皮', '混干皮', '敏感肌'].includes(profile.skin) ? profile.skin : 'unknown',
      skinTypeSource: profile.skin ? 'self_reported' : 'unknown',
      undertone: ['冷调', '暖调', '中性调'].includes(profile.tone) ? profile.tone : 'unknown',
      finishPreferences: [profile.finish || '自然光泽'], concerns: [], budgetTotal: profile.budget || 0,
      skillLevel: '新手', excludedBrands: conditions.excludedBrands || [], sensitivities: [], city: profile.city || '',
    },
    makeupRequest: {
      scene: profile.scene || query.match(/面试|通勤|约会|拍照|夏季|秋冬|长时间带妆|答辩/)?.[0] || '日常',
      // Route preference is request-scoped; never infer or persist gender.
      style: routeStyles[routePreference] || style,
      wearHours: wear ? Math.min(24, Math.max(1, Number(wear[1]))) : 8,
      timeOfDay: '白天', photoEnabled: false, priorities: priorities.length ? priorities : ['轻薄'],
    },
  }
}

module.exports = { extractParameters, extractGuidedParameters, planInput, routePreferenceFromText }

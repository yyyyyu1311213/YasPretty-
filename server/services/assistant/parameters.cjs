const { namedProducts } = require('./product-resolver.cjs')

async function extractParameters(query, profile = {}, products = []) {
  // Share the same pure self-report rules with the browser; never infer a profile via GLM.
  const { extractProfile, extractRequestConditions } = await import('../../../src/features/assistant/profileUtils.js')
  const stated = extractProfile(query, profile)
  const mentionedBrands = [...new Set(products.map((p) => p.brand))].filter((brand) => query.toLowerCase().includes(brand.toLowerCase()))
  const excludedBrands = mentionedBrands.filter((brand) => {
    const index = query.toLowerCase().indexOf(brand.toLowerCase())
    return /(?:不要|排除|不考虑)\s*$/.test(query.slice(0, index))
  })
  const brands = mentionedBrands.filter((brand) => !excludedBrands.includes(brand))
  const productIds = namedProducts(query, products).filter((p) => !excludedBrands.includes(p.brand)).map((p) => p.id)
  return { profile: stated, recommendation: { ...extractRequestConditions(query, stated), brands, excludedBrands, productIds } }
}

function planInput(query, profile) {
  const wear = query.match(/(\d{1,2})\s*(?:小时|h)/i)
  const mensRoute = /男生|男士|男性/.test(query) && !/(?:不是|不按|不要|不走).{0,4}(?:男生|男士|男性)/.test(query)
  const style = /水光|清透|韩女/.test(query) ? '清透' : /氛围|浓妆/.test(query) ? '氛围' : /精致/.test(query) ? '精致' : /柔雾|哑光/.test(query) ? '柔雾' : '自然'
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
      skillLevel: '新手', excludedBrands: [], sensitivities: [], city: profile.city || '',
    },
    makeupRequest: {
      scene: profile.scene || query.match(/通勤|约会|拍照|夏季|秋冬|长时间带妆|答辩/)?.[0] || '日常',
      // Explicit request style only; never infer or persist a gender identity.
      style: mensRoute ? `男生·${style}` : style,
      wearHours: wear ? Math.min(24, Math.max(1, Number(wear[1]))) : 8,
      timeOfDay: '白天', photoEnabled: false, priorities: priorities.length ? priorities : ['轻薄'],
    },
  }
}

module.exports = { extractParameters, planInput }

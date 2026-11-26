const { AppError } = require('../../errors.cjs')

function selectRecommendations(products, conditions, query = '') {
  const skinValues = Array.isArray(conditions.skinValues) && conditions.skinValues.length
    ? conditions.skinValues
    : conditions.skin ? [conditions.skin] : []
  return products.filter((p) => p.recommendationReady !== false
    && (!conditions.brands?.length || conditions.brands.includes(p.brand))
    && (!conditions.productIds?.length || conditions.productIds.includes(p.id))
    && (!conditions.category || p.category === conditions.category)
    && (!skinValues.length || skinValues.some((skin) => p.skins?.includes(skin)))
    && (!conditions.sensitive || p.skins?.includes('敏感肌'))
    && (!conditions.budget || Number.isFinite(p.price) && p.price <= conditions.budget)
    && !conditions.excludedBrands?.some((brand) => p.brand.toLowerCase().includes(brand.toLowerCase()))
    && !(/不(?:要|喜欢|想要)?哑光/.test(query) && p.finish === '哑光'))
    .map((product) => {
      const evidence = []
      const matchedSkins = skinValues.filter((skin) => product.skins?.includes(skin))
      if (conditions.skinLabel && matchedSkins.length) evidence.push(`你选择的日常感受对应查看：资料库适用肤质记录包含${matchedSkins.join('、')}`)
      else if (conditions.skin) evidence.push(`资料库适用肤质包含${conditions.skin}`)
      if (conditions.budget) evidence.push('在预算内（资料库参考价）')
      if (conditions.category) evidence.push(`品类为${conditions.category}`)
      if (conditions.finish && conditions.finish === product.finish) evidence.push(`符合${conditions.finish}偏好`)
      if (conditions.scene && product.scenes?.includes(conditions.scene)) evidence.push(`资料库场景包含${conditions.scene}`)
      return { product, evidence, score: evidence.length }
    }).sort((a, b) => b.score - a.score).slice(0, 3)
}

async function searchSources(provider, query, options = {}) {
  const results = await provider.search(query, options)
  if (!Array.isArray(results) || !results.length) throw new AppError('SEARCH_EMPTY', '联网检索没有返回可用来源。', 502)
  return results.slice(0, 6)
}

module.exports = { selectRecommendations, searchSources }

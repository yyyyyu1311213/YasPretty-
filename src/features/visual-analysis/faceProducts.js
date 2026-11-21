// Match tools to application techniques. No skin-tone, budget or efficacy inference.
const categories = {
  brow: ['眉妆'], eyes: ['眼线', '眼影', '睫毛膏'], nose: ['修容'],
  cheeks: ['腮红'], contour: ['修容'],
}

export function matchFaceProducts(step, feature, products) {
  if (!feature || (feature.source === 'user' && feature.limited)) return []
  const wanted = step.id === 'eyes' && feature.code === 'elongated'
    ? ['睫毛膏', '眼影', '眼线'] : step.id === 'thirds' ? step.categories : categories[step.id] || []
  const eligible = products.filter((p) => p.recommendationReady === true
    && p.factVerificationStatus === 'verified'
    && p.publicStatus?.startsWith('public_') && p.informationSources?.length)
  const uses = {
    '眉妆': [['眉笔','顺着眉毛生长方向，短笔触补空隙。'],['眉粉','眉头用刷上余粉轻扫，边缘更柔和。'],['染眉膏','轻擦刷头余量，再顺毛梳理眉色。']],
    '眼线': [['','从睫毛根部断续落笔，再把空隙连接起来。']],
    '眼影': [['','先薄铺浅色，再在需要强调的位置小范围叠深色。']],
    '睫毛膏': [['','从根部向上梳开，重点刷想突出的那一段。']],
    '腮红': [['液体','先点在手背上，再少量拍上面颊。'],['粉状','刷子取粉后抖掉余量，从落点向外晕开。'],['膏状','用指腹少量按压，把边缘轻拍开。']],
    '修容': [['修容盘','用小刷取少量阴影色，沿方案中的位置晕开。'],['修容笔','从笔尖取少量到手背，再点到局部晕开。'],['三色盘','从浅色开始试深浅，再决定是否叠加。']],
  }
  const matches = []
  for (let i = 0; i < 3; i++) {
    for (const category of wanted || []) {
      const slot = uses[category]?.[i]
      if (!slot) continue
      const product = eligible.find(p => p.category === category && !matches.some(m => m.product.id === p.id)
        && (!slot[0] || [p.name, ...(p.cardTags || [])].some(v => v?.includes(slot[0]))))
      if (product) matches.push({ product, reason: slot[1] })
      if (matches.length === 3) return matches
    }
  }
  return matches
}

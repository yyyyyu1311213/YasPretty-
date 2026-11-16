import { categoryOptions, finishOptions, products, skinOptions } from '../../data/products'
import { legacyToForm, toPlanPayload } from '../makeup-plan/makeupPlanUtils'
import { findMentionedProducts } from './intentUtils'

const SCENE_OPTIONS = ['通勤', '约会', '拍照', '夏季', '秋冬', '长时间带妆', '答辩']

export function extractProfile(text, current = {}) {
  const next = { ...current }
  const skin = [...skinOptions].sort((a, b) => b.length - a.length).find((item) => text.includes(item))
  const finish = finishOptions.find((item) => text.includes(item))
  const scene = SCENE_OPTIONS.find((item) => text.includes(item))
  const category = categoryOptions.find((item) => text.includes(item))
  const budgetMatch = text.match(/(?:预算|不超过|以内|最多)?\s*(\d{2,4})\s*元?/)

  if (skin) next.skin = skin
  if (/大油皮/.test(text)) next.skin = '油皮'
  if (/大干皮/.test(text)) next.skin = '干皮'
  if (finish) next.finish = finish
  if (/水光|亮泽/.test(text)) next.finish = '自然光泽'
  if (/雾面/.test(text)) next.finish = '柔雾'
  if (scene) next.scene = scene
  if (category) next.category = category
  if (!category && /粉底/.test(text)) next.category = '粉底液'
  if (budgetMatch) next.budget = Number(budgetMatch[1])
  if (/高遮瑕|遮瑕强|瑕疵多/.test(text)) next.coverage = '高'
  if (/轻薄|低遮瑕/.test(text)) next.coverage = '低'
  if (/冷白|冷调/.test(text)) next.tone = '冷调'
  if (/黄皮|暖调/.test(text)) next.tone = '暖调'
  if (/中性调/.test(text)) next.tone = '中性调'
  return next
}

export function pickShade(product, profile) {
  if (!product.shadeRecommendationReady) return { name: '参数色号待确认' }
  return product.shades.find((shade) => profile.tone && shade.tone === profile.tone)
    || product.shades.find((shade) => /白皙|一白/.test(shade.lightness || shade.suitable || ''))
    || product.shades[0]
}

function scoreProduct(product, profile) {
  let score = product.rating * 2 + Math.min(product.wear, 12) / 3
  if (profile.skin) score += product.skins.includes(profile.skin) ? 30 : -24
  if (profile.finish) score += product.finish === profile.finish ? 20 : 0
  if (profile.scene) score += product.scenes.includes(profile.scene) ? 15 : 0
  if (profile.budget) score += product.price <= profile.budget ? 12 : -Math.min(18, (product.price - profile.budget) / 20)
  if (profile.coverage) score += product.coverage === profile.coverage ? 10 : 0
  if (profile.category) score += product.category === profile.category ? 18 : -10
  return score
}

export function recommendProducts(profile, text) {
  const mentioned = findMentionedProducts(text)
  if (mentioned.length) return mentioned.slice(0, 3)

  const pool = products.filter((product) => {
    if (profile.category && product.category !== profile.category) return false
    if (!profile.category && /底妆|粉底/.test(text) && product.category !== '粉底液') return false
    if (profile.skin && !product.skins.includes(profile.skin)) return false
    if (profile.budget && product.price > profile.budget) return false
    return true
  })
  return [...pool].sort((a, b) => scoreProduct(b, profile) - scoreProduct(a, profile)).slice(0, 3)
}

export function localReply(text, profile) {
  if (/^(你好|嗨|hello|hi)[！!。\s]*$/i.test(text)) {
    return { text: '你好，我是小Y。先告诉我你的肤质吧，例如油皮、混油皮、干皮或混干皮。', products: [] }
  }

  const mentioned = findMentionedProducts(text)
  if (!profile.skin && !mentioned.length && /推荐|怎么选|底妆|粉底|适合/.test(text)) {
    return { text: '为了避免只凭热度推荐，我需要先确认你的肤质。你是油皮、混油皮、干皮、混干皮，还是敏感肌？', products: [] }
  }

  const matches = recommendProducts(profile, text)
  if (!matches.length) {
    return {
      text: '资料库中暂时没有同时满足这些硬条件的产品。你可以提高预算、放宽品类，或保留最重要的一项条件后再试。',
      products: [],
    }
  }
  const lines = matches.map((product, index) => {
    const shade = pickShade(product, profile)
    const reasons = []
    if (profile.skin && product.skins.includes(profile.skin)) reasons.push(`适合${profile.skin}`)
    if (profile.finish && product.finish === profile.finish) reasons.push(`符合${profile.finish}偏好`)
    if (profile.scene && product.scenes.includes(profile.scene)) reasons.push(`适合${profile.scene}`)
    if (profile.budget && product.price <= profile.budget) reasons.push('在预算内')
    if (!reasons.length) reasons.push(product.note)
    return `${index + 1}. ${product.brand} ${product.name}：建议先试 ${shade.name}，${reasons.join('、')}。`
  })

  const lead = mentioned.length > 1
    ? `我按资料库信息比较你提到的产品：\n\n${mentioned.map((product) => `${product.brand} ${product.name}：${product.finish}妆效，${product.coverage}遮瑕，参考持妆 ${product.wear} 小时，适合${product.skins.join('、')}，参考价 ${product.priceLabel}。`).join('\n\n')}\n\n结合你的已知偏好，再看具体选择：`
    : `根据目前记录的需求${profile.skin ? `（${profile.skin}${profile.finish ? `、${profile.finish}` : ''}${profile.scene ? `、${profile.scene}` : ''}）` : ''}，优先看这几款：`
  return {
    text: `${lead}\n\n${lines.join('\n\n')}\n\n色号仅作为初筛建议，实际结果还会受光线、肤色明度和氧化情况影响。`,
    products: matches,
  }
}

export function planPayloadFromConversation(text, profile) {
  const form = legacyToForm(profile)
  const wearMatch = text.match(/(\d{1,2})\s*(?:小时|h)/i)
  const style = /水光|清透|韩女/.test(text)
    ? '清透'
    : /氛围|浓妆/.test(text)
      ? '氛围'
      : /精致/.test(text)
        ? '精致'
        : /柔雾|哑光/.test(text)
          ? '柔雾'
          : '自然'
  const priorities = [
    /轻薄|水光|清透/.test(text) && '轻薄',
    /持妆|长时间/.test(text) && '持妆',
    /遮瑕/.test(text) && '遮瑕',
    /控油|油皮/.test(text) && '控油',
    /保湿|水光|干皮/.test(text) && '保湿',
    /快速|通勤/.test(text) && '快速完成',
  ].filter(Boolean).slice(0, 4)

  return toPlanPayload({
    ...form,
    scene: profile.scene || SCENE_OPTIONS.find((item) => text.includes(item)) || form.scene,
    style,
    wearHours: wearMatch ? Math.min(24, Math.max(1, Number(wearMatch[1]))) : form.wearHours,
    priorities: priorities.length ? priorities : form.priorities,
  })
}

export function formatPlanReply(plan) {
  const steps = plan.steps.map((step, index) => (
    `${index + 1}. ${step.category}：${step.technique}${step.colorDirection && step.colorDirection !== '不涉及颜色' ? `\n颜色方向：${step.colorDirection}` : ''}`
  ))
  const modeNote = plan.sourceMode === 'local'
    ? '这是本地规则方案；补充肤质、预算和场景后可以再生成。'
    : '模型方案已通过结构和产品 ID 校验。'

  return {
    text: `${plan.title}\n\n${plan.summary}\n\n${steps.join('\n\n')}\n\n${modeNote}`,
    productIds: [...new Set(plan.recommendedProductIds)].slice(0, 3),
    sources: [],
    sourceMode: plan.sourceMode,
  }
}

export function localMakeupReply(text, profile) {
  const waterGlow = /水光|亮泽|清透|韩女/.test(text)
  const baseProducts = recommendProducts({ ...profile, category: '粉底液' }, '底妆').slice(0, 2)
  const finish = waterGlow ? '清透水光' : (profile.finish || '自然')
  return {
    text: `${finish}妆容可以先按这 7 步完成：

1. 妆前：分区薄涂保湿，等表面不黏后再上底妆。
2. 底妆：从面中向外少量铺开，需要遮盖的位置分次叠加，不用厚涂制造光泽。
3. 遮瑕：只点涂眼下、鼻翼或局部瑕疵，边缘轻拍晕开。
4. 定妆：只在容易移位的位置少量按压散粉，保留面中和颧骨的自然光泽。
5. 眉眼：用低饱和棕色轻填眉毛与睫毛根部，眼尾少量加深。
6. 腮红：选择低饱和裸粉或杏桃方向，从颧骨高点向外少量晕开。
7. 唇妆：先薄涂裸粉、豆沙或柔和珊瑚色，再按整体冷暖调整。

这是本地基础方案，没有使用照片分析或联网资料。光泽会受灯光、肤质和用量影响；如有刺痛、红肿或不适，请停止使用。补充肤质、预算和场景后，可以生成更贴合的方案。`,
    products: baseProducts,
  }
}

export function parseAssistantResult(raw) {
  const ids = [...raw.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)]
    .map((match) => match[1].trim())
    .filter((id) => products.some((product) => product.id === id))
  return {
    text: raw.replace(/\n?\[\[PRODUCT:[^\]]+\]\]/g, '').trim(),
    productIds: [...new Set(ids)].slice(0, 3),
  }
}

export function cleanErrorMessage(message) {
  return String(message || '服务暂时不可用').trim().replace(/[。.!！?？]+$/u, '')
}

import { products } from '../../data/products'
import { legacyToForm, toPlanPayload } from '../makeup-plan/makeupPlanUtils'
import { findMentionedProducts } from './intentUtils'
import { extractRequestConditions } from './profileUtils'

const SCENE_OPTIONS = ['通勤', '约会', '拍照', '夏季', '秋冬', '长时间带妆', '答辩']
const INTERNAL_PRODUCT_STATUS = /待核验|已核验|未核验|待确认|未标注|暂无信息|unknown|null/i

function hasPublicProductValue(value) {
  if (value === null || value === undefined || value === '') return false
  if (typeof value === 'number' && !Number.isFinite(value)) return false
  return !INTERNAL_PRODUCT_STATUS.test(String(value))
}

export function formatProductComparison(product) {
  const details = [
    hasPublicProductValue(product.finish) ? `${product.finish}妆效` : null,
    hasPublicProductValue(product.coverage) ? `${product.coverage}遮瑕` : null,
    typeof product.wear === 'number' && Number.isFinite(product.wear) ? `参考持妆 ${product.wear} 小时` : null,
    Array.isArray(product.skins) && product.skins.length && product.skins.every(hasPublicProductValue)
      ? `适合${product.skins.join('、')}`
      : null,
    hasPublicProductValue(product.priceLabel) ? `参考价 ${product.priceLabel}` : null,
  ].filter(Boolean)

  return `${product.brand} ${product.name}：${details.join('，') || '可打开产品详情查看信息'}。`
}

export function formatAssistantProductMeta(product, profile) {
  const shade = pickShade(product, profile)
  return [
    hasPublicProductValue(shade?.name) ? shade.name : null,
    hasPublicProductValue(product.finish) ? product.finish : null,
    hasPublicProductValue(product.priceLabel) ? product.priceLabel : null,
  ].filter(Boolean).join(' · ')
}

function fallbackProductReason(product) {
  return hasPublicProductValue(product.note)
    ? product.note
    : '可打开产品详情，结合自身需求和自然光试用。'
}

function shadeSuggestion(shade) {
  return hasPublicProductValue(shade?.name) ? `建议先试 ${shade.name}` : '建议先在自然光下试色'
}

export { extractProfile, skinRequestFromChoice } from './profileUtils'

export function pickShade(product, profile) {
  if (!product.shadeRecommendationReady) return { name: '参数色号待确认' }
  return product.shades.find((shade) => profile.tone && shade.tone === profile.tone)
    || product.shades.find((shade) => /白皙|一白/.test(shade.lightness || shade.suitable || ''))
    || product.shades[0]
}

function scoreProduct(product, profile) {
  let score = product.rating * 2 + Math.min(product.wear, 12) / 3
  const skinValues = profile.skinValues?.length ? profile.skinValues : profile.skin ? [profile.skin] : []
  if (skinValues.length) score += product.skins.some((skin) => skinValues.includes(skin)) ? 30 : -24
  if (profile.finish) score += product.finish === profile.finish ? 20 : 0
  if (profile.scene) score += product.scenes.includes(profile.scene) ? 15 : 0
  if (profile.budget) score += product.price <= profile.budget ? 12 : -Math.min(18, (product.price - profile.budget) / 20)
  if (profile.coverage) score += product.coverage === profile.coverage ? 10 : 0
  if (profile.category) score += product.category === profile.category ? 18 : -10
  return score
}

export function recommendProducts(profile, text) {
  const requestSkin = profile.skinValues || profile.skinSkipped ? { skinValues: profile.skinValues || [], skinSkipped: profile.skinSkipped, skinLabel: profile.skinLabel } : null
  profile = { ...extractRequestConditions(text, profile), ...requestSkin }
  if (requestSkin) delete profile.skin
  const excludedBrands = [...new Set(products.map((p) => p.brand))].filter((brand) => {
    const index = text.toLowerCase().indexOf(brand.toLowerCase())
    return index >= 0 && /(?:不要|排除|不考虑)\s*$/.test(text.slice(0, index))
  })
  const mentioned = findMentionedProducts(text).filter((p) => !excludedBrands.includes(p.brand))
  const skinValues = profile.skinValues?.length ? profile.skinValues : profile.skin ? [profile.skin] : []
  const pool = (mentioned.length ? mentioned : products).filter((product) => {
    if (product.recommendationReady === false || excludedBrands.includes(product.brand)) return false
    if (profile.category && product.category !== profile.category) return false
    if (!profile.category && /底妆|粉底/.test(text) && product.category !== '粉底液') return false
    if (skinValues.length && !product.skins.some((skin) => skinValues.includes(skin))) return false
    if (profile.sensitive && !product.skins.includes('敏感肌')) return false
    if (/不(?:要|喜欢|想要)?哑光/.test(text) && product.finish === '哑光') return false
    if (profile.budget && (!Number.isFinite(product.price) || product.price > profile.budget)) return false
    return true
  })
  return [...pool].sort((a, b) => scoreProduct(b, profile) - scoreProduct(a, profile)).slice(0, 3)
}

export function localReply(text, profile, requestConditions = {}) {
  profile = { ...extractRequestConditions(text, profile), ...requestConditions }
  if (requestConditions.skinValues || requestConditions.skinSkipped) delete profile.skin
  if (/^(你好|嗨|hello|hi)[！!。\s]*$/i.test(text)) {
    return { text: '你好，我是小Y。先用一句话告诉我你想解决什么，我会结合需求继续引导。', products: [] }
  }

  const mentioned = findMentionedProducts(text)
  const comparing = mentioned.length > 1 && !/推荐|想买|想选|排除|不要/.test(text) && !requestConditions.skinValues && !requestConditions.skinSkipped
  const matches = comparing ? mentioned.slice(0, 3) : recommendProducts(profile, text)
  if (!matches.length) {
    if (profile.skinLabel && !profile.skinSkipped) {
      return { text: `站内资料暂时没有找到适用肤质记录与“${profile.skinLabel}”相符、且同时满足其他条件的候选。我没有放宽筛选或推断适配；可以跳过肤质筛选或调整其他条件后再试。`, products: [] }
    }
    return {
      text: `资料库中暂时没有同时满足这些硬条件的产品。你可以调整预算或品类后再试。${profile.skinSkipped ? '本次候选未按肤质筛选。' : ''}`,
      products: [],
    }
  }
  const lines = matches.map((product, index) => {
    const shade = pickShade(product, profile)
    const reasons = []
    const matchedSkins = skinValuesFor(profile).filter((skin) => product.skins.includes(skin))
    if (profile.skinLabel && matchedSkins.length) reasons.push(`符合本次${profile.skinLabel}`)
    else if (profile.skin && product.skins.includes(profile.skin)) reasons.push(`适合${profile.skin}`)
    if (profile.finish && product.finish === profile.finish) reasons.push(`符合${profile.finish}偏好`)
    if (profile.scene && product.scenes.includes(profile.scene)) reasons.push(`适合${profile.scene}`)
    if (profile.budget && product.price <= profile.budget) reasons.push('在预算内')
    if (!reasons.length) reasons.push(fallbackProductReason(product))
    return `${index + 1}. ${product.brand} ${product.name}：${shadeSuggestion(shade)}，${reasons.join('、')}。`
  })

  const lead = comparing
    ? `我按资料库信息比较你提到的产品：\n\n${mentioned.map(formatProductComparison).join('\n\n')}\n\n结合你的已知偏好，再看具体选择：`
    : `根据目前记录的需求${profile.skinValues?.length ? `（${profile.skinLabel}）` : profile.skin ? `（${profile.skin}${profile.finish ? `、${profile.finish}` : ''}${profile.scene ? `、${profile.scene}` : ''}）` : ''}，优先看这几款：`
  const skinLimit = profile.skinValues?.length ? '\n\n本次按你提供的日常感受筛选候选。'
    : profile.skinSkipped ? profile.sensitive ? '\n\n本次未按干油倾向筛选；仍单独考虑你已说明的敏感倾向。'
      : '\n\n本次候选未按肤质筛选，先按已知的品类、预算等条件选择。'
      : /底妆|粉底|气垫|素颜霜/.test(text) ? '\n\n你没有提供肤质，我先按品类、预算和已知妆效做保守筛选。' : ''
  return {
    text: `${lead}\n\n${lines.join('\n\n')}\n\n色号仅作为初筛建议，实际结果还会受光线、肤色明度和氧化情况影响。${skinLimit}`,
    products: matches,
  }
}

function skinValuesFor(profile) {
  return profile.skinValues?.length ? profile.skinValues : profile.skin ? [profile.skin] : []
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

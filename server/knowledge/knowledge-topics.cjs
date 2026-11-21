// One vocabulary for route intent -> knowledge topics. Topic affinity never creates a hit.
const intentTopics = Object.freeze({
  beauty_knowledge: ['makeup_tutorial', 'makeup_technique', 'makeup_knowledge', 'makeup_tip', 'makeup_style', 'skin_profile_guidance', 'skin_safety', 'claims'],
  makeup_plan: ['makeup_tutorial', 'makeup_technique', 'makeup_tip', 'makeup_style'],
  plan_adjustment: ['makeup_tutorial', 'makeup_technique', 'makeup_tip', 'makeup_style'],
  unsupported_sensitive: ['skin_safety', 'claims'],
  external_question: ['skin_profile_guidance'],
})

const aliases = Object.freeze([
  [/美妆蛋|粉扑|海棉/g, '海绵'], [/刷子/g, '刷具'], [/打底|铺底/g, '底妆'],
  [/黑眼圈/g, '眼下遮瑕'], [/浮粉|斑驳|结块/g, '卡粉'], [/掉皮|脱屑/g, '起皮'],
  [/泛油光|油光|冒油|油得快/g, '出油'], [/压粉|扑粉|蜜粉|散粉/g, '定妆'],
  [/冷暖肤色|冷暖色调/g, '冷暖'], [/赶时间|赶车|来不及/g, '时间少'],
  [/玻璃肌|发亮|透亮/g, '光泽'], [/差异|差别|有何不同/g, '区别'],
])

const questionTerms = Object.freeze({
  'self-reported-skin-type': [['肤质', '油皮还是干皮', '全脸起皮', '全脸出油', '两颊干'], ['判断', '分辨', '测试', '观察', '知道', '怎么']],
  'acne-prone-makeup-and-referral': [['痘', '痘印'], ['怎么办', '怎么遮', '遮', '化妆', '上妆', '遮瑕', '修饰', '处理', '遮住', '能好吗']],
  'skin-reaction-safety': [['新产品', '敏感', '刺痛', '红肿', '不适', '过敏'], ['试', '用', '处理', '怎么办', '不适']],
  'cosmetic-claim-boundary': [['功效', '宣称', '治疗', '治愈', '疗效'], ['边界', '保证', '能', '是', '区别']],
  'foundation-application-basics': [['粉底', '底妆', '气垫'], ['涂', '上', '用', '画', '步骤', '教程', '轻薄', '太厚', '面具']],
  'foundation-shade-and-undertone': [['色号', '试色', '冷暖', '明度', '粉底'], ['选', '试', '冷暖', '灯光', '自然光', '颜色', '匹配']],
  'makeup-basics-framework': [['美妆', '化妆', '底妆'], ['知识', '基础', '原理', '是什么']],
  'concealer-and-foundation-order': [['遮瑕'], ['顺序', '先', '后', '眼下', '叠', '用', '局部']],
  'brush-and-tool-selection': [['刷具', '化妆刷', '海绵', '粉底刷', '工具'], ['选', '用', '比较', '还是', '区别']],
  'oily-skin-base-and-setting': [['油皮', '混油', '出油', '油'], ['定妆', '持妆', '脱妆', '鼻', '底妆']],
  'quick-everyday-makeup': [['通勤', '日常妆', '化妆', '妆'], ['快速', '时间少', '简化', '省', '分钟']],
  'soft-glam-style-language': [['softglam', '柔和浓妆', '柔雾妆', '美妆风格', '妆容风格']],
  'glowy-makeup-style-language': [['水光', '清透', '光泽', '韩女妆', '美妆风格', '妆容风格']],
  'patchy-base-adjustment': [['粉底', '底妆', '气垫'], ['卡粉', '起皮']],
  'foundation-and-cushion': [['粉底'], ['气垫'], ['区别', '不同', '是什么']],
})

function normalizeKnowledgeText(value) {
  return aliases.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement),
    String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ''))
}
function topicsForIntent(intent) {
  return intentTopics[intent] || (Object.values(intentTopics).some((topics) => topics.includes(intent)) ? [intent] : [])
}
function matchesQuestion(entryId, query) {
  const text = normalizeKnowledgeText(query)
  return Boolean(questionTerms[entryId]?.every((group) => group.some((term) => text.includes(normalizeKnowledgeText(term)))))
}
module.exports = { intentTopics, topicsForIntent, normalizeKnowledgeText, matchesQuestion }

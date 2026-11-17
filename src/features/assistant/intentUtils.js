import { products } from '../../data/products'

// These tools select frontend flows; they do not replace the server intentRouter.
function detectIntent(text, profile = {}) {
  const mentioned = findMentionedProducts(text)
  if (mentioned.length && /(对比|区别|哪个好|哪个更)/.test(text)) return 'product_comparison'
  if (/(妆容方案|完整妆容|妆容教程|妆教|化妆教程|化妆步骤|怎么化|如何画|教我画|妆面规划|设计(?:一个)?妆|(?:韩女|水光|拍照|秋日|落叶|约会|通勤|日常|晚宴)妆容?)/.test(text)) return 'makeup_plan'
  if (/肤质/.test(text) && /(判断|分辨|怎么看|怎么知道|测试|自测|属于|是什么)/.test(text)) return 'external_question'
  if (mentioned.length || /(推荐|选什么|怎么选|哪个好|粉底|底妆|气垫|遮瑕|散粉|肤质|油皮|干皮|妆效|持妆|色号|卡粉|脱妆|预算)/.test(text)) return 'catalog_recommendation'
  if (/^(你好|嗨|hello|hi|在吗)[！!。？?\s]*$/i.test(text)) return 'greeting_help'
  return 'external_question'
}

function needsOnlineResearch(text, intent) {
  if (intent === 'external_research' || intent === 'product_fact') return true
  if (/(今天|明天|天气|最新|最近|现在|目前|今年|2026|新品|上市|发售|价格|多少钱|促销|成分|官网|新闻|测评|口碑|销量|排行|真假|哪里买)/.test(text)) return true
  if (/(口红|唇釉|眼影|腮红|高光|修容|睫毛膏|眉笔|香水|护肤|面霜|精华|防晒)/.test(text)) return true
  return false
}

// Shared by intent selection and local replies so product matching has one implementation.
function findMentionedProducts(text) {
  const lower = text.toLowerCase()
  return products.filter((product) => {
    const brand = product.brand.toLowerCase()
    const name = product.name.toLowerCase()
    const compactName = name.replace(/粉底液|遮瑕液|遮瑕蜜|散粉|气垫|\s/g, '')
    return lower.includes(brand) || lower.includes(name) || (compactName.length > 2 && lower.includes(compactName))
  })
}

export { detectIntent, findMentionedProducts, needsOnlineResearch }

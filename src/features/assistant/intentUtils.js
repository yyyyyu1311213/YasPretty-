import { products } from '../../data/products'

// Browser fallback only. Online sends always reach the server intentRouter first.
function detectIntent(text, profile = {}) {
  const mentioned = findMentionedProducts(text)
  if (/红肿|刺痛|过敏|诊断|治疗|API\s*Key|系统提示词/i.test(text)) return 'unsupported_sensitive'
  if (/手机|打印机|电脑|汽车|自行车|笔记本|耳机/.test(text) && !mentioned.length) return 'external_question'
  if (!mentioned.length && /区别|差别|不同/.test(text) && /粉底|气垫|底妆|遮瑕|散粉/.test(text)) return 'beauty_knowledge'
  if (/(怎么涂|怎么上|怎么用|怎么办|技巧|原理|底妆教程|什么是|是什么|色号怎么选|(?:总|容易|之后|后).*(?:起皮|卡粉|脱妆)|卡粉$|起皮$)/.test(text) && /妆|粉底|气垫|皮|口红|睫毛/.test(text)) return 'beauty_knowledge'
  if (/(这款|这个|上一款|后一款|前一款|第一款|第二款|它)/.test(text) && !/手机|打印机/.test(text)) return 'product_fact'
  if (mentioned.length && /适合.*吗/.test(text)) return 'product_fact'
  if (mentioned.length && /(对比|区别|哪个好|哪个更)/.test(text)) return 'product_comparison'
  if (/(妆容方案|完整妆容|妆容教程|妆教|化妆教程|化妆步骤|怎么化|如何画|教我画|妆面规划|设计(?:一个)?妆|(?:韩女|水光|拍照|秋日|落叶|约会|通勤|日常|晚宴)妆容?)/.test(text)) return 'makeup_plan'
  if (/肤质/.test(text) && /(判断|分辨|怎么看|怎么知道|测试|自测|属于|是什么)/.test(text)) return 'external_question'
  if (isProductFactQuestion(text, mentioned.length > 0)) return 'product_fact'
  if (mentioned.length && !/推荐|选什么|怎么选|想买|想找/.test(text)) return 'product_fact'
  if (mentioned.length || /(推荐|选什么|怎么选|哪个好|粉底|底妆|气垫|遮瑕|散粉|肤质|油皮|干皮|妆效|持妆|色号|卡粉|脱妆|预算)/.test(text)) return 'catalog_recommendation'
  if (/^(你好|嗨|hello|hi|在吗)[！!。？?\s]*$/i.test(text)) return 'greeting_help'
  return 'external_question'
}

function isProductFactQuestion(text, mentioned) {
  const productContext = mentioned || /粉底|气垫|遮瑕|散粉|口红|唇釉|眼影|腮红|眉笔|睫毛膏/.test(text)
  const factQuestion = /价格|多少钱|成分|规格|色号|产地|功效|哪里买|官网|净含量|容量|保质期|能用多久|可以用多久|大概用多久|用多长时间|便携|方便携带|补妆方便/.test(text)
    || (/(正装|替换芯|替换装|补充装|套装)/.test(text) && /吗|还是|是否|是不是|含不含|有没有|[？?]/.test(text))
  return productContext && factQuestion
}

function needsOnlineResearch(text, intent) {
  if (intent === 'external_research') return true
  if (/(?:联网|上网|网上|网络)(?:搜索|检索|查询|查|搜)|搜索|检索|搜一下|搜一搜/.test(text)) return true
  if (/(?:现在|目前|当前|实时|官网).{0,12}(?:价格|多少钱|售价|到手价|促销|优惠|成分|配方|口碑|市场信息|上市|发售)/.test(text)
    || /(?:价格|多少钱|售价|到手价|促销|优惠|成分|配方|口碑|市场信息|上市|发售).{0,12}(?:现在|目前|当前|实时|官网)/.test(text)) return true
  // Stable product facts are available from the server's local evidence index.
  if (intent === 'product_fact') return /最新|最近|目前|今年|20\d{2}|新品|上市|发售|价格|多少钱|售价|到手价|促销|优惠|成分|配方|官网|测评|口碑|销量|排行|真假|哪里买/.test(text)
  if (/(今天|明天|当前|实时).{0,10}(?:天气|气温|温度|下雨|降雨)|(?:天气|气温|温度|下雨|降雨).{0,10}(?:今天|明天|当前|实时)/.test(text)) return true
  if (/(?:最新|近期|最近).{0,12}(?:价格|促销|上市|发售|研究|成分|配方|口碑|市场|市场信息|新闻|测评|销量|排行|真假|官网|政策|规定|法规|公告|趋势|流行)/.test(text)) return true
  if (/(?:今年|2026).{0,12}(?:价格|促销|上市|发售|研究|成分|配方|口碑|市场|新闻|测评|销量|排行|真假|官网)/.test(text)) return true
  return false
}

// A failed request may use local recommendations only when the user actually asks for selection.
// Merely mentioning a catalog category must never activate this fallback.
function canRecommendOffline(text) {
  return /推荐|选什么|怎么选|哪个好|想要|想找|想买/.test(text)
}

// Shared by intent selection and local replies so product matching has one implementation.
function findMentionedProducts(text) {
  const normalize = (value) => value.toLowerCase().replace(/[\s（）()]/g, '')
  const lower = normalize(text)
  const withoutCategory = (value) => value.replace(/粉底液|遮瑕液|遮瑕蜜|散粉|气垫/g, '')
  return products.filter((product) => {
    const brand = normalize(product.brand)
    const name = normalize(product.name)
    const compactName = withoutCategory(name)
    return lower.includes(brand) || lower.includes(name) || (compactName.length > 2 && withoutCategory(lower).includes(compactName))
  })
}

export { canRecommendOffline, detectIntent, findMentionedProducts, needsOnlineResearch }

// Frozen before AI-R03 implementation. Synthetic questions, never user conversations.
// Preserve first-run evidence before promoting a failing holdout to regression.
const regression = [
  { id: 'R01', query: '粉底怎么涂', intents: ['beauty_knowledge'], knowledge: ['foundation-application-basics'] },
  { id: 'R02', query: '油皮怎么定妆', intents: ['beauty_knowledge'], knowledge: ['oily-skin-base-and-setting'] },
  { id: 'R03', query: '我用粉底总起皮', intents: ['beauty_knowledge'], knowledge: ['patchy-base-adjustment'] },
  { id: 'R04', query: '粉底和气垫有什么区别', intents: ['beauty_knowledge'], knowledge: ['foundation-and-cushion'] },
  { id: 'R05', query: '粉底色号怎么选', intents: ['beauty_knowledge'], knowledge: ['foundation-shade-and-undertone'] },
  { id: 'R06', query: 'NEO 小方块气垫（哑光）的净含量是多少', intents: ['product_fact'], products: ['laneige-neo-matte'], contains: ['15g'] },
  { id: 'R07', query: '比较 NARS 超方瓶粉底液和 NEO 小方块气垫（哑光）的规格', intents: ['product_comparison'], products: ['nars-light-reflecting', 'laneige-neo-matte'], contains: ['30ml', '15g'] },
  { id: 'R08', query: '新产品用了以后红肿刺痛怎么办', intents: ['unsupported_sensitive'], contains: ['停止使用', '专业人员'] },
  { id: 'R09', query: 'NEO 小方块气垫（哑光）规格是多少，粉底怎么涂，油皮怎么定妆？', intents: ['product_fact', 'beauty_knowledge', 'beauty_knowledge'], products: ['laneige-neo-matte'], knowledge: ['foundation-application-basics', 'oily-skin-base-and-setting'], contains: ['15g'] },
  { id: 'R10', query: '先遮瑕还是先粉底？色号怎么选？化妆刷怎么选？', intents: ['beauty_knowledge', 'beauty_knowledge', 'beauty_knowledge'], knowledge: ['concealer-and-foundation-order', 'foundation-shade-and-undertone', 'brush-and-tool-selection'] },
  { id: 'R11', query: '给我完整通勤妆容方案', intents: ['makeup_plan'], knowledge: ['foundation-application-basics'], contains: ['本地规则方案'] },
  { id: 'R12', query: '小金盒高光修容盘最新价格是多少；粉底怎么涂', intents: ['product_fact', 'beauty_knowledge'], products: ['catalog-108'], knowledge: ['foundation-application-basics'], contains: ['无法联网确认', '历史参考价'] },
]
const holdout = [
  { id: 'H01', query: '底妆一上脸就像戴面具，有没有薄一点的画法？', intents: ['beauty_knowledge'], knowledge: ['foundation-application-basics'] },
  { id: 'H02', query: '鼻子油得快，两边脸还好，散粉是不是只压中间？', intents: ['beauty_knowledge'], knowledge: ['oily-skin-base-and-setting'] },
  { id: 'H03', query: '先把黑眼圈盖住再打底，还是顺序反过来？', intents: ['beauty_knowledge'], knowledge: ['concealer-and-foundation-order'] },
  { id: 'H04', query: '灯下看粉底刚好，出门却像换了颜色，该在哪里试？', intents: ['beauty_knowledge'], knowledge: ['foundation-shade-and-undertone'] },
  { id: 'H05', query: '新手用刷子还是美妆蛋铺底妆更好？', intents: ['beauty_knowledge'], knowledge: ['brush-and-tool-selection'] },
  { id: 'H06', query: '早上赶车来不及，妆能省掉哪些步骤？', intents: ['beauty_knowledge'], knowledge: ['quick-everyday-makeup'] },
  { id: 'H07', query: '想要发亮但不想满脸油的妆感怎么弄？', intents: ['beauty_knowledge'], knowledge: ['glowy-makeup-style-language'] },
  { id: 'H08', query: '小金盒高光修容盘有多大规格？顺便说说眼下的遮瑕怎么叠。', intents: ['product_fact', 'beauty_knowledge'], products: ['catalog-108'], knowledge: ['concealer-and-foundation-order'], contains: ['3.5g'] },
  { id: 'H09', query: 'NEO 小方块气垫（哑光）有没有替换芯；色号怎么试才靠谱；杭州明天会下雨吗', intents: ['product_fact', 'beauty_knowledge', 'external_question'], products: ['laneige-neo-matte'], knowledge: ['foundation-shade-and-undertone'], contains: ['未知'] },
  { id: 'H10', query: 'NARS 超方瓶粉底液和 NEO 小方块气垫（哑光）净含量差多少？粉底和气垫到底有什么差别？', intents: ['product_comparison', 'beauty_knowledge'], products: ['nars-light-reflecting', 'laneige-neo-matte'], knowledge: ['foundation-and-cushion'], contains: ['30ml', '15g'] },
  { id: 'H11', query: '化妆后皮肤破了还痒，能不能用遮瑕盖住？还想知道怎么选刷具。', intents: ['unsupported_sensitive', 'beauty_knowledge'], contains: ['停止使用', '专业人员'], knowledge: ['brush-and-tool-selection'] },
  { id: 'H12', query: '给我安排面试的完整妆容，重点轻薄，排除合成品牌', intents: ['makeup_plan'], knowledge: ['foundation-application-basics'] },
  { id: 'H13', query: '量子纠缠是什么意思？', intents: ['external_question'], noKnowledge: true },
  { id: 'H14', query: '银河尘埃眼影的粒子共振原理是什么？', intents: ['beauty_knowledge'], noKnowledge: true, contains: ['无法'] },
  { id: 'H15', query: 'NEO 小方块气垫（哑光）多久能用完？怎么判断冷暖肤色？', intents: ['product_fact', 'beauty_knowledge'], products: ['laneige-neo-matte'], knowledge: ['foundation-shade-and-undertone'], contains: ['未知'] },
  { id: 'H16', query: '教我画通勤底妆；再解释一下最近的航班退票政策', intents: ['beauty_knowledge', 'external_research'], knowledge: ['foundation-application-basics'] },
]
// Promoted after inspecting evaluation-first.json; these are no longer untouched validation.
// Final scoring added explicit product-ID targets for every product question without changing query text.
const promotedIds = ['H08', 'H11', 'H15', 'H16']
const promoted = holdout.filter((sample) => promotedIds.includes(sample.id)).map((sample) => sample.id === 'H11'
  ? { ...sample, knowledge: ['skin-reaction-safety'], contains: [...sample.contains, '暂不提供继续上妆'] } : sample)
module.exports = { regression, holdout: holdout.filter((sample) => !promotedIds.includes(sample.id)), promoted, frozenAt: '2026-11-21', methodology: '人工预先编写的合成保留集，非盲测、非真实用户样本；首次16项结果独立保留。H08/H11/H15/H16在阅读首次失败后转为回归，不计入剩余12项未调规则样本；H11按跨子问题不适保护变更预期。' }

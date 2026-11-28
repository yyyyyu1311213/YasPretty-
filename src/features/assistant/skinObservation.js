// Request-only observations shared by online guidance and offline fallback.
// No storage, diagnosis, or new catalog skin labels belong in this module.
export const SKIN_GUIDANCE_MAX_ROUNDS = 5
export const normalizeSkinText = (text) => String(text || '').normalize('NFKC').toLowerCase().replace(/[\s，。！？、；：,.!?;:]/g, '')
export const isSkinUncertain = (text) => /^(?:我)?(?:也|还|暂时|真的|真)?(?:不知道|不清楚|不确定|没注意(?:过)?|没留意(?:过)?|说不清|分不清|不懂)(?:啊|呀|呢|吧|哦)?$/.test(normalizeSkinText(text))
  || /^(还是想不起来|想不起来|仍然说不清)$/.test(normalizeSkinText(text))
  || /^(?:你)?帮我看看(?:吧)?$/.test(normalizeSkinText(text))
  || /肤质|皮肤类型/.test(text) && /不知道|不清楚|不确定|说不清|分不清|不懂/.test(text)
export const isSkinSkip = (text) => /跳过|不用(?:再)?问了?|别(?:再)?继续问了?|不问了|直接(?:推荐|选|回答|给我建议)|先按(?:原问题|这些条件回答)|你先说结论|不清楚的地方你自己假设/.test(text)
export const isIdentityOnlyStatement = (text) => /^(?:我(?:(?:是|属于|只是|也是)?)(?:一名|一个)?(?:男生|男士|男性|男的|女生|女士|女性|女的|男孩子|女孩子)|本人(?:(?:是|属于)?)(?:一名|一个)?(?:男生|男士|男性|男的|女生|女士|女性|女的|男孩子|女孩子)|(?:男生|男士|男性|男的|女生|女士|女性|女的|男孩子|女孩子))[。！!？?\s]*$/.test(String(text || '').trim())
export const asksSkinGuidance = (text) => /(?:肤质|皮肤类型).*(?:不知|不清楚|不确定|怎么看|怎么判断)|(?:不知|不清楚|不确定|怎么看|怎么判断|怎么知道|分不清|不懂).*(?:肤质|皮肤类型)|有时候油有时候干|有时油有时干|时油时干/.test(normalizeSkinText(text))
export const isBaseSelection = (text) => /推荐|建议|选什么|怎么选|怎么挑|想买|想选|想挑|想找|想要|需要|要买|选个|选一|挑个|挑一|帮我选|帮我挑|购买/.test(text)
  && /粉底|底妆|气垫|素颜霜|遮瑕|散粉|隔离|有色面霜/.test(text)
  && !/色号|怎么涂|怎么上|怎么用|教程|步骤|区别|顺序|先.{0,6}(?:粉底|遮瑕)|化妆刷|刷具/.test(text)
export const needsBaseSkinGuidance = (text, profile = {}) => {
  if (!isBaseSelection(text) || profile.skin || profile.skinValues?.length || profile.skinSkipped || isSkinSkip(text)) return false
  if (/(?:适合|给|为|推荐(?:一款|一个)?)\s*(?:混油皮|混干皮|敏感肌|油皮|干皮)/.test(String(text || ''))) return false
  return !assessSkin(readSkinObservation(text)).values.length
}
export const isSkinQuestion = (question) => question?.flowId === 'xiaoy-guided-intake-v1'
  && question.options?.some(({ value }) => /^(skin-|cheek-)/.test(value))

// A new task takes precedence over short answers to the pending observation question.
export const leavesSkinGuidance = (text) => /换(?:个)?(?:话题|问题)|我想问的是|不聊(?:肤质|皮肤)|天气|新闻|电脑|手机|API\s*Key|Authorization|系统提示词|识别身份|诊断|治疗/i.test(text)
  || /^(?:你好|嗨|hello|hi|在吗)[！!。？?\s]*$/i.test(String(text || '').trim())
  || /(?:推荐|想买|想选|怎么选|怎么用|怎么涂|怎么画|区别|比较|对比).*(?:粉底|底妆|气垫|遮瑕|口红|唇|腮红|眉|眼影|刷具|卸妆)|(?:粉底|底妆|气垫|遮瑕|口红|唇|腮红|眉|眼影|刷具|卸妆).*(?:怎么涂|怎么用|怎么画|怎么选|区别|比较|对比)/.test(text)

export function skinChoiceFromReply(text, question) {
  const exact = question?.options?.find((item) => normalizeSkinText(text) === normalizeSkinText(item.value) || normalizeSkinText(text) === normalizeSkinText(item.label))?.value
  if (exact) return exact
  if (!question?.options?.some(({ value }) => value.startsWith('cheek-'))) return null
  const value = normalizeSkinText(text)
  return /^(经常|经常会|会|总是)$/.test(value) ? 'cheek-often'
    : /^(偶尔|偶尔会|有时)$/.test(value) ? 'cheek-sometimes'
      : /^(基本不会|不会|没有|不干)$/.test(value) ? 'cheek-never' : null
}

/** @typedef {{oil?: 'all'|'tzone'|'low', cheeks?: 'often'|'sometimes'|'never', explicit?: string, conflicting?: boolean, sensitive?: boolean}} SkinObservation */
/** @returns {SkinObservation} */
export function readSkinObservation(text, previous = {}) {
  const value = normalizeSkinText(text)
  const next = { ...previous }
  const explicit = explicitSkinType(text)
  if (explicit) next.explicit = explicit
  if (/(?:我.{0,8}|容易|属于).*(?:敏感|易泛红)|敏感肌|干敏肌|油敏肌/.test(value)) next.sensitive = true
  const low = /不太(?:出)?油|不怎么(?:出)?油|很少出油|不(?:出)?油/.test(value)
  const all = /(?:全脸|整脸)(?:都|也|很|容易|常|经常|总是|每次)*[出偏]?油|容易全脸出油/.test(value)
  const zone = /(?:t区|字区|鼻子|鼻翼|额头)(?:和鼻子|和额头)?(?:都|也|很|容易|常|经常|总是|主要|会|爱)*[出偏]?油/.test(value)
  if (all) next.oil = 'all'
  else if (zone) next.oil = 'tzone'
  else if (low) next.oil = 'low'
  const cheeks = /两颊|脸颊|两边|脸两侧/.test(value)
  const dryness = /干|紧绷|起皮/.test(value)
  const noDryness = /不(?:太|怎么)?(?:干|紧绷|起皮)|没有(?:干燥|紧绷|起皮)/.test(value)
  if (noDryness) next.cheeks = 'never'
  else if (/偶尔|有时/.test(value) && dryness) next.cheeks = 'sometimes'
  else if (dryness && (cheeks || /经常|总是|常常|每天/.test(value))) next.cheeks = 'often'
  if (/不油也不干|不干也不油|不明显油也不明显干|全脸都还好/.test(value)) Object.assign(next, { oil: 'low', cheeks: 'never' })
  if ((all && low) || /有时候油有时候干|有时油有时干|时油时干|出油又紧绷|又油又(?:干|紧绷)|外油内干/.test(value)) next.conflicting = true
  return next
}

function explicitSkinType(text) {
  const aliases = '(混合型偏油|混合偏油|混油皮|混合型偏干|混合偏干|混干皮|油敏肌|油性(?:皮肤|肌肤|肤质)?|偏油(?:性)?|大油皮|油皮|油|干敏肌|干性(?:皮肤|肌肤|肤质)?|偏干(?:性)?|大干皮|干皮|干燥|干)'
  const prefix = '(?:我是|我属于|我偏向|我偏|我(?:最近|平时|通常|现在)?(?:的)?(?:肤质|皮肤|肌肤)(?:的话)?(?:是|为|属于|偏向|偏|比较|有点|挺|很)?|我|(?:肤质|皮肤|肌肤)(?:的话)?(?:是|为|属于|改为|偏向|偏|比较|有点|挺|很)?|是|为|改为|更正为)'
  const clauses = String(text).normalize('NFKC').split(/[，,。；;]/)
    .filter((clause) => !/不是|不属于|不确定|不知道|如果|假设|适合|吗|\?/.test(clause))
  const match = clauses.map((clause) => clause.match(new RegExp(`^(?:${prefix})?${aliases}(?=$|\\s|皮肤|肌肤|肤质|的|了|想|预算|推荐|购买)`)))
    .find(Boolean)
  if (!match) return null
  const alias = match[1]
  if (/^(?:混油|混合.*偏油)/.test(alias)) return '混油皮'
  if (/^(?:混干|混合.*偏干)/.test(alias)) return '混干皮'
  if (/油/.test(alias)) return '油皮'
  return '干皮'
}

export function observationFromChoice(value, previous = {}) {
  const choices = {
    'skin-oily': { oil: 'all' }, 'skin-zone': { oil: 'tzone' }, 'skin-low-oil': { oil: 'low' },
    'cheek-often': { cheeks: 'often' }, 'cheek-sometimes': { cheeks: 'sometimes' }, 'cheek-never': { cheeks: 'never' },
    // Read old saved questions without reinterpreting their broad dry/sensitive choices.
    'skin-combination': { oil: 'tzone', cheeks: 'often' }, 'skin-dry': { cheeks: 'often' },
    'skin-sensitive': { sensitive: true },
    'skin-clue-all': { oil: 'all' }, 'skin-clue-zone': { oil: 'tzone' }, 'skin-clue-low': { oil: 'low' },
    'cheek-usual-often': { cheeks: 'often' }, 'cheek-usual-never': { cheeks: 'never' }, 'cheek-usual-sometimes': { cheeks: 'sometimes' },
    'skin-pattern-mixed': { oil: 'tzone', cheeks: 'often', conflicting: false, explicit: undefined },
    'skin-pattern-oily': { oil: 'all', cheeks: 'sometimes', conflicting: false, explicit: undefined },
    'skin-pattern-dry': { oil: 'low', cheeks: 'often', conflicting: false, explicit: undefined },
    'skin-pattern-balanced': { oil: 'low', cheeks: 'never', conflicting: false, explicit: undefined },
  }
  return { ...previous, ...(choices[value] || {}) }
}

/** Only existing catalog labels can become hard filters. Balanced/uncertain has no substitute label. */
export function assessSkin(observation = {}, skip = false) {
  const { oil, cheeks, explicit, conflicting, sensitive } = observation
  let kind = 'unknown'
  let values = []
  let need = !oil ? 'oil' : oil !== 'all' && !cheeks ? 'cheeks' : null
  if (skip) need = null
  else if (conflicting || oil === 'all' && cheeks === 'often') need = 'pattern'
  else if (explicit) { kind = explicit.includes('混') ? 'combination' : explicit === '油皮' ? 'oily' : 'dry'; values = [explicit]; need = null }
  else if (oil === 'all') { kind = 'oily'; values = ['油皮', '混油皮'] }
  else if (oil === 'tzone' && cheeks === 'often') { kind = 'combination'; values = ['混油皮', '混干皮'] }
  else if (oil === 'tzone' && cheeks === 'never') { kind = 'combination'; values = ['混油皮'] }
  else if (oil === 'low' && cheeks === 'often') { kind = 'dry'; values = ['干皮', '混干皮'] }
  else if (oil === 'low' && cheeks === 'never') kind = 'balanced'
  const label = { oily: '偏油倾向', combination: '混合倾向', dry: '偏干倾向', balanced: '当前较平衡', unknown: '暂不确定' }[kind]
  const summary = {
    oily: '按你描述的情况，暂时偏向油性肤质，后续可以按使用感受调整。',
    combination: cheeks === 'never'
      ? '按你描述的情况，暂时偏向混合肤质，T区较油、两颊相对正常。底妆可以重点照顾T区出油，后续再按使用感受调整。'
      : '按你描述的情况，暂时偏向混合肤质。选底妆时可以同时照顾T区出油和两颊偏干，后续再按使用感受调整。',
    dry: '按你描述的情况，暂时偏向干性肤质，后续可以按使用感受调整。',
    balanced: '按你描述的情况，目前不明显油也不明显干，可以先看作较平衡。',
    unknown: skip ? '好的，先跳过肤质判断。'
      : conflicting || oil === 'all' && cheeks === 'often' ? '你描述的出油和干燥情况比较多变，目前还不能稳定区分干油类型。可以先按具体部位的感受调整底妆。'
        : cheeks === 'often' && !oil ? '目前能确认两颊偏干，但出油位置还不清楚，暂时无法区分偏干还是混合肤质。'
          : cheeks === 'sometimes' ? '偶尔起皮还不足以判断肤质，平时的出油和干燥规律也还不够明确，暂时保留不确定。'
            : '目前的日常感受还不够明确，暂时无法可靠判断肤质；以后留意下午的出油位置和两颊感受，再来补充即可。',
  }[kind]
  return { mode: values.length ? 'described' : 'unknown', values, label, kind, need, summary, sensitive: Boolean(sensitive) }
}

const skinQuestions = {
  oil: { answer: '平时到下午，你脸上通常哪里容易出油？', options: [
    ['全脸都容易油', 'skin-oily'], ['主要是额头和鼻子', 'skin-zone'], ['不太出油', 'skin-low-oil'], ['没注意过，换个问法', 'skin-unknown'],
  ] },
  'oil-clue': { answer: '换个好回想的问法：最近下午照镜子或摸脸时，哪种情况更常见？', options: [
    ['大部分脸油亮，摸着有油感', 'skin-clue-all'], ['鼻子额头油亮，两颊不明显', 'skin-clue-zone'],
    ['很少油亮，摸着也不油', 'skin-clue-low'], ['还是想不起来', 'skin-clue-unknown'],
  ] },
  cheeks: { answer: '两颊平时会紧绷、干燥或起皮吗？', options: [
    ['经常会', 'cheek-often'], ['偶尔会', 'cheek-sometimes'], ['基本不会', 'cheek-never'], ['说不清', 'cheek-unknown'],
  ] },
  'cheeks-clue': { answer: '回想最近大多数日子，两颊更接近哪种感受？不用现在洗脸或改变护理。', options: [
    ['常觉得干，笑起来有紧绷感', 'cheek-usual-often'], ['大多舒服，不干也不紧', 'cheek-usual-never'],
    ['只有偶尔或换季才干', 'cheek-usual-sometimes'], ['仍然说不清', 'cheek-usual-unknown'],
  ] },
  pattern: { answer: '最后确认一下，最近多数日子的整体情况，更像下面哪一种？', options: [
    ['额头鼻子油，两颊经常干', 'skin-pattern-mixed'], ['大部分脸常油，干燥只是偶尔', 'skin-pattern-oily'],
    ['很少出油，两颊经常干', 'skin-pattern-dry'], ['不明显油，也不明显干', 'skin-pattern-balanced'],
    ['都不太像，暂时说不清', 'skin-pattern-unknown'],
  ] },
}

export function skinQuestionSpec(need) {
  const spec = skinQuestions[need] || skinQuestions.oil
  return { answer: spec.answer, options: spec.options.map(([label, value]) => ({ label, value })) }
}

function skinQuestionKind(value = '') {
  if (value.startsWith('skin-answered:')) return value.slice('skin-answered:'.length)
  if (value.startsWith('skin-pattern-')) return 'pattern'
  if (value.startsWith('skin-clue-')) return 'oil-clue'
  if (value.startsWith('cheek-usual-')) return 'cheeks-clue'
  return value.startsWith('cheek-') ? 'cheeks' : value.startsWith('skin-') ? 'oil' : null
}

// Same bounded question progression online and after a transport failure.
export function advanceSkinObservation(question, text) {
  if (!isSkinQuestion(question)) return null
  const explicitSkip = isSkinSkip(text)
  if (leavesSkinGuidance(text) && !explicitSkip) return null
  const choice = skinChoiceFromReply(text, question)
  const observation = readSkinObservation(text)
  const selected = question.options.find(({ value }) => value === choice)
  const skipped = explicitSkip || Boolean(selected && isSkinSkip(selected.label))
  const uncertain = isSkinUncertain(text) || /unknown$/.test(choice || '')
  if (!choice && !Object.keys(observation).length && !skipped && !uncertain && !asksSkinGuidance(text)) {
    return { assessment: assessSkin(skinObservationFromQuestion(question)), initialQuery: question.initialQuery || '',
      selections: question.selections || [], answer: isIdentityOnlyStatement(text)
        ? '收到。性别不能代替肤质信息；请按刚才的问题补充日常感受，或选择“不确定/跳过”。'
        : '我还没识别到与肤质有关的日常感受。请按刚才的问题补充；如果暂时不确定，可以换种方式回想或选择跳过。', question }
  }
  const initialQuery = choice ? question.initialQuery || '' : `${question.initialQuery || ''}；${text}`.slice(0, 1000)
  const previous = skinObservationFromQuestion(question)
  const value = choice ? observationFromChoice(choice, previous) : readSkinObservation(text, previous)
  const currentKind = skinQuestionKind(question.options[0]?.value)
  if (currentKind === 'pattern' && !choice && assessSkin(observation).kind !== 'unknown') value.conflicting = false
  const assessment = assessSkin(value, skipped)
  const selections = [...(question.selections || []), choice || `skin-answered:${currentKind}`]
  const asked = new Set([...selections.map(skinQuestionKind), currentKind])
  let need
  if (!skipped && assessment.kind === 'unknown' && question.step < SKIN_GUIDANCE_MAX_ROUNDS && currentKind !== 'pattern') {
    const possible = assessment.need === 'pattern' ? ['pattern']
      : !value.oil ? ['oil-clue', ...(!value.cheeks ? ['cheeks', 'cheeks-clue'] : []), 'pattern']
        : !value.cheeks || value.cheeks === 'sometimes' ? ['cheeks', 'cheeks-clue', 'pattern'] : ['pattern']
    need = possible.find((item) => !asked.has(item))
  }
  if (need) {
    const spec = skinQuestionSpec(need)
    return { assessment, initialQuery, selections, answer: spec.answer,
      question: { ...question, step: question.step + 1, selections: selections.slice(-4), initialQuery, options: spec.options } }
  }
  return { assessment, initialQuery, selections }
}

// An unfinished question is the anchor. Never search past a topic change for an old purchase task.
export function skinConversationContext(messages = []) {
  const last = messages.at(-1)
  if (last?.role !== 'assistant') return null
  const question = last.question?.flowId === 'xiaoy-guided-intake-v1' ? last.question : null
  const preceding = messages.at(-2)?.role === 'user' ? messages.at(-2).content : ''
  const initialQuery = question?.initialQuery || preceding
  const askingSkin = isSkinQuestion(question) || (!question && /(?:告诉我|确认).{0,16}肤质|(?:你的肤质|你是什么肤质|你是油皮).*[？?]|哪里.*出油[？?]|两颊.*(?:干|紧绷).*[？?]/.test(last.content || ''))
  if (!question && !askingSkin) return null
  return { question, initialQuery, askingSkin, baseSelection: isBaseSelection(initialQuery) }
}

export function skinObservationFromQuestion(question) {
  return (question?.selections || []).reduce((value, choice) => observationFromChoice(choice, value), readSkinObservation(question?.initialQuery))
}

export function skinConditions(assessment) {
  return { skinValues: assessment.values, skinLabel: assessment.label, skinSkipped: !assessment.values.length,
    ...(assessment.sensitive ? { sensitive: true } : {}) }
}

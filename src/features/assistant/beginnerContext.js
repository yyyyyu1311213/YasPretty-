// Bounded progress belongs to the current conversation, never to the saved profile.
export function beginnerFollowup(text) {
  const query = String(text || '').trim().replace(/[\s，。！？、,.!?]/g, '')
  if (/换(?:个)?话题|不聊|不要继续|不用继续|^(?:停止|结束)(?:吧|教程|对话|了)?$/.test(query)) return null
  if (/^(?:那|好|好的|好啊)?(?:然后呢|然后|接下来呢|接下来|下一步呢|下一步|之后呢|继续|继续讲|继续说|还有呢|还有吗|再然后呢|后面呢|怎么继续)$/.test(query)
    || /^(?:底妆|粉底|眉毛|眉妆)(?:完成|结束|画完|涂完|上完|好了)?(?:了)?(?:后|之后|以后)(?:呢|怎么做|做什么|还有什么步骤|下一步是什么)?$/.test(query)
    || /^(?:我)?(?:底妆|粉底|眉毛|眉妆)(?:已经|已)?(?:完成|结束|画完|涂完|上完|化完|好了)(?:了)?(?:后|之后|以后)?(?:然后呢|接下来呢|下一步呢|还有接下来的步骤(?:呀|吗)?)$/.test(query)) return { type: 'next' }
  if (/^(?:那|接下来)?(?:眉毛|眉妆)(?:呢|怎么画)?$/.test(query)) return { type: 'next', step: 'brow' }
  if (/^(?:那|接下来)?(?:眼妆|唇妆|腮红)(?:呢|怎么画)?$/.test(query)) return { type: 'next', step: 'color' }
  if (/^(?:那|接下来)?(?:定妆|收尾)(?:呢|怎么做)?$/.test(query)) return { type: 'next', step: 'finish' }
  if (/预算|(?:改|换|调整)(?:成|为)|我是(?:干|油|混)|想要(?:哑光|水光)|(?:\d{1,2}|五|十|两)分钟|慢慢学/.test(query)
    && !/推荐|购买|想买|多少钱|天气|新闻|电脑|手机|成分|完整妆容|眉毛怎么|粉底怎么/.test(query)) return { type: 'correction' }
  return null
}

function legacyContext(messages, index) {
  const answer = messages[index]?.content || ''
  const lastStep = answer.includes('先练薄涂和边缘衔接，今天不用追求高遮盖。') ? 'base'
    : answer.includes('从保留原有眉毛开始，先梳理，再补真正的空隙。') ? 'brow'
      : answer.includes('先选眼部或唇色中的一个重点练习。') ? 'eye-lip'
        : /按5分钟以内的时间，先练两件事|按10分钟左右安排：薄底妆|愿意慢慢学的话，把薄底妆/.test(answer) ? 'daily' : null
  if (!lastStep) return null
  const question = messages[index - 2]?.question
  if (question?.flowId !== 'xiaoy-guided-intake-v1' || !question.initialQuery) return null
  const choice = question.options?.find(({ label, value }) => [label, value].includes(messages[index - 1]?.content))?.value
  const time = answer.includes('按5分钟以内') ? 'time-five' : answer.includes('按10分钟左右') ? 'time-ten'
    : answer.includes('愿意慢慢学的话') ? 'time-learn' : null
  return { version: 1, initialQuery: question.initialQuery, route: question.route || 'general',
    goal: `goal-${lastStep}`, time, updates: question.updates || [], lastStep,
    ...(choice?.startsWith('time-') ? { time: choice } : {}) }
}

export function readBeginnerContext(messages = []) {
  let index = messages.length - 1
  if (messages[index]?.role !== 'assistant') return null
  // Recover one old failed "然后呢" without searching past a topic switch.
  if (String(messages[index].content).startsWith('我还不确定你的意思。')
    && messages[index - 1]?.role === 'user' && beginnerFollowup(messages[index - 1].content)?.type === 'next') index -= 2
  const message = messages[index]
  if (message?.role !== 'assistant' || message.question) return null
  return message.beginnerContext?.version === 1 ? message.beginnerContext : legacyContext(messages, index)
}

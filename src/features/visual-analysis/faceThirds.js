const labels = {
  high: ['额头占比偏高', '若想收拢额头的纵向留白，可沿发际线薄扫阴影，向内晕到看不出边界。', '修容'],
  low: ['上庭偏短', '额头中央留出自然光泽，发际线附近少叠阴影。', '修容'],
  longMid: ['中庭偏长', '腮红靠近眼下，在面颊中部横向晕开，减少鼻梁连续提亮。', '腮红'],
  shortMid: ['中庭偏短', '腮红由颧部向外上方轻扫，面中保留留白，避免过宽的横向色块。', '腮红'],
  longLower: ['下庭偏长', '若想将重心上移，可在下颌底缘轻扫阴影并向颈部晕开。', '修容'],
  shortLower: ['下庭偏短', '保留下颌前侧的自然亮度，避免沿下颌横画一整条深色。', '修容'],
  shortChin: ['下巴段偏短', '想突出颏部时，可在下巴中央少量提亮，保留下缘留白。', '修容'],
}

export function describeThirds(data) {
  if (data?.status !== 'estimated' || !Array.isArray(data.shares) || data.shares.length !== 3
    || !data.shares.every(n => Number.isFinite(n) && n > 0 && n < 1)
    || Math.abs(data.shares.reduce((a, b) => a + b, 0) - 1) > .001) return null
  const notes = []
  for (const [i, high, low] of [[0,'high','low'],[1,'longMid','shortMid'],[2,'longLower','shortLower']]) {
    if (data.shares[i] > .37) notes.push(labels[high])
    if (data.shares[i] < .295) notes.push(labels[low])
  }
  if (Number.isFinite(data.chinShare) && data.chinShare > .15 && data.chinShare < .38) notes.push(labels.shortChin)
  if (!notes.length) notes.push(['三庭占比接近', '可以保留当前的纵向比例；想突出气色时，从颧部薄扫腮红，再按喜好调整范围。', '腮红'])
  return { shares: data.shares, notes }
}

export function thirdsSummary(result, omitted) {
  const data = result?.thirds
  const analysis = describeThirds(data)
  if (analysis && omitted) return { title: '三庭比例已跳过', detail: '本次妆容不采用这组比例。' }
  if (analysis) return { title: '三庭比例', detail: analysis.shares.map((n,i) => ['上庭','中庭','下庭'][i] + ' ' + (n*100).toFixed(1) + '%').join(' · ') }
  let detail
  if (data?.status === 'not_visible') detail = '未找到连续清晰的中央发际线。请露出额头，并将发际线完整拍入画面。'
  else if (data?.status === 'pose_quality') {
    const issues = result.qualityIssues?.join('；')
    detail = issues ? `拍摄提示：${issues}。请在自然光下正面重拍。` : '当前姿态或关键点不足以稳定测量。请平视镜头，让额头和下巴完整入镜。'
  } else detail = '本机没有可用的三庭分析结果。其他部位的分析仍可查看。'
  return { title: '三庭比例检测失败', detail }
}

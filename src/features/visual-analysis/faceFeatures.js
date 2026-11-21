// Uncalibrated, conservative editorial rules for projected 68-point geometry.
// These are makeup tendencies, not trained classifications or depth measurements.
export const FACE_RULE_VERSION = 'face-features.v2'
export const FEATURE_OPTIONS = {
  brow: { straight: '平直眉', curved: '弯眉', rising: '上扬眉' },
  eyes: { round: '偏圆眼型', almond: '杏仁眼', elongated: '细长眼型', elongatedUp: '细长上扬眼型' },
  nose: { narrow: '鼻翼偏窄', balanced: '鼻翼宽度适中', wide: '鼻翼偏宽' },
  contour: { round: '圆脸', square: '方脸', oval: '椭圆脸', long: '偏长脸' },
}
const definitions = [
  ['brow', '眉形', 19, 'left', 17], ['eyes', '眼型与眼距', 39, 'right', 27],
  ['nose', '鼻部形态', 30, 'left', 52],
]
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const mean = (values) => values.reduce((sum, x) => sum + x, 0) / values.length
const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

/** @typedef {{code: string, reason: string, reference?: string}} FeatureEstimate */
/** Returns scalar observations and tendencies; does not retain a photo. */
export function analyzeFaceFeatures(result) {
  const unknown = (reason) => ({ code: 'unknown', reason, reference: '' })
  const allUnknown = (reason) => Object.fromEntries(definitions.map(([id]) => [id, unknown(reason)]))
  const raw = result?.landmarks
  if (!Array.isArray(raw) || raw.length !== 68 || !raw.every((p) => Array.isArray(p) && p.length >= 2 && p.slice(0, 2).every(Number.isFinite))) return allUnknown('关键点不完整，暂不判断形态。')
  if (!Number.isFinite(result.yaw) || Math.abs(result.yaw) > 20 || !Array.isArray(result.qualityIssues) || result.qualityIssues.length) return allUnknown('受姿态或画质影响，建议换清晰正面照；也可按镜中观察自行选择。')
  // Roll-normalize around eye centers. Scale/translation/roll cannot change labels.
  const eyeLeft = midpoint(raw[36], raw[39]), eyeRight = midpoint(raw[42], raw[45])
  const axis = distance(eyeLeft, eyeRight)
  if (axis < 1e-6) return allUnknown('眼部关键点重合，暂不判断形态。')
  const ux = (eyeRight[0] - eyeLeft[0]) / axis, uy = (eyeRight[1] - eyeLeft[1]) / axis
  const p = raw.map(([x, y]) => [(x - eyeLeft[0]) * ux + (y - eyeLeft[1]) * uy, -(x - eyeLeft[0]) * uy + (y - eyeLeft[1]) * ux])
  const d = (a, b) => distance(p[a], p[b])
  const faceWidth = d(0, 16), eyeWidths = [d(36, 39), d(42, 45)], eyeWidth = mean(eyeWidths)
  if (faceWidth < 1e-6 || Math.min(...eyeWidths) < 1e-6 || eyeWidth / faceWidth < .08 || eyeWidth / faceWidth > .4 || p[8][1] <= p[27][1]) return allUnknown('轮廓关键点异常，暂不判断形态。')
  const out = allUnknown('形态接近分类边界，暂不作细分。')
  const apertures = [mean([d(37, 41), d(38, 40)]) / eyeWidths[0], mean([d(43, 47), d(44, 46)]) / eyeWidths[1]]
  const tilts = [(p[39][1] - p[36][1]) / eyeWidths[0], (p[42][1] - p[45][1]) / eyeWidths[1]]
  const aperture = mean(apertures), tilt = mean(tilts), eyeGap = d(39, 42) / eyeWidth
  if (Math.min(...apertures) > .14 && Math.max(...apertures) < .55 && Math.abs(apertures[0] - apertures[1]) < .10 && Math.abs(tilts[0] - tilts[1]) < .14 && eyeGap > .4 && eyeGap < 2) {
    let code = 'unknown'
    if (aperture > .34) code = 'round'
    else if (aperture >= .26 && aperture <= .30 && Math.abs(tilt) < .09) code = 'almond'
    else if (aperture < .23 && tilt > .12) code = 'elongatedUp'
    else if (aperture < .23 && Math.abs(tilt) < .08) code = 'elongated'
    out.eyes = { code, reason: code === 'unknown' ? '眼部开合或眼尾走向接近分类边界。' : `可见眼部轮廓${code === 'round' ? '开合相对较大' : code === 'almond' ? '开合与长度较均衡' : code === 'elongatedUp' ? '较细长，眼尾有上扬趋势' : '较细长'}；表情会影响判断。`, reference: `内眼角间距约为平均眼宽的 ${eyeGap.toFixed(1)} 倍` }
  } else out.eyes = unknown('闭眼、眯眼或两侧轮廓差异较大，暂不判断眼型。')
  const browShape = (outer, inner, middle) => {
    const length = d(outer, inner)
    if (length / faceWidth < .08) return 'unknown'
    const a = p[outer], b = p[inner]
    const arch = Math.max(...middle.map((i) => Math.abs((b[0] - a[0]) * (p[i][1] - a[1]) - (b[1] - a[1]) * (p[i][0] - a[0])) / length)) / length
    const rise = (b[1] - a[1]) / length
    return arch > .16 && arch < .4 ? 'curved' : arch < .10 && rise > .16 && rise < .45 ? 'rising' : arch < .08 && Math.abs(rise) < .10 ? 'straight' : 'unknown'
  }
  const brows = [browShape(17, 21, [18, 19, 20]), browShape(26, 22, [23, 24, 25])]
  if (brows[0] === brows[1] && brows[0] !== 'unknown') {
    const code = brows[0]
    out.brow = { code, reason: code === 'curved' ? '两侧可见眉部轨迹呈弧形。' : code === 'rising' ? '两侧眉尾相对眉头有上扬趋势。' : '两侧可见眉部轨迹较平直。', reference: '不判断眉毛浓密、粗细或眉骨高低。' }
  }
  const noseRatio = d(31, 35) / d(39, 42)
  if (Number.isFinite(noseRatio) && noseRatio > .45 && noseRatio < 1.8) {
    const code = noseRatio < .82 ? 'narrow' : noseRatio >= .94 && noseRatio <= 1.08 ? 'balanced' : noseRatio > 1.20 ? 'wide' : 'unknown'
    out.nose = { code, reason: code === 'unknown' ? '鼻翼相对宽度接近分类边界。' : '参考可见鼻翼宽与内眼角间距的关系，不推断鼻梁高低。', reference: `鼻翼宽约为内眼角间距的 ${noseRatio.toFixed(1)} 倍` }
  }
  return out
}

/** User choices stay separate from estimates, including explicit unknown/occluded. */
export function describeFaceFeatures(result, { overrides = {} } = {}) {
  const estimated = analyzeFaceFeatures(result)
  return definitions.map(([id, title, index, side, top], number) => {
    const choice = overrides[id]
    const manual = choice === 'unknown' || choice === 'occluded' || Object.hasOwn(FEATURE_OPTIONS[id], choice ?? '')
    const code = manual ? choice : estimated[id].code
    const known = Object.hasOwn(FEATURE_OPTIONS[id], code)
    const value = code === 'occluded' ? '看不清或有遮挡' : known ? `${FEATURE_OPTIONS[id][code]}${manual ? '（自选）' : ''}` : '暂无法判断'
    return { id, title, index, side, top, number: number + 1, code, value,
      limited: !known, source: manual ? 'user' : known ? 'geometry' : 'unknown',
      status: manual ? '用户修正' : known ? '照片估算' : '信息不足',
      reason: manual ? code === 'occluded' ? '该部位暂不使用形态结论。' : code === 'unknown' ? '你选择暂不判断，该部位只提供通用手法。' : '按你的观察选择，报表采用此项；不表示模型已验证。' : estimated[id].reason,
      reference: !manual ? estimated[id].reference || '' : '',
      estimate: estimated[id], ruleVersion: FACE_RULE_VERSION }
  })
}

/** Face shape is exclusively self-selected; it is never classified or anchored on the mesh. */
export function describeFaceContour(choice) {
  const known = Object.hasOwn(FEATURE_OPTIONS.contour, choice ?? '')
  return { id: 'contour', title: '脸型自选', number: 4, code: known ? choice : 'unknown',
    value: known ? `${FEATURE_OPTIONS.contour[choice]}（自选）` : '选择你的脸型',
    source: known ? 'user' : 'unknown', status: '自主选择', limited: !known,
    reason: '按自己的观察选择，用于安排腮红和修容位置。', reference: '' }
}

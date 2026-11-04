const reviewedAt = '2026-11-03'

function inferTone(label) {
  if (/(冷调|冷白|冷色|粉调)/.test(label)) return '冷调'
  if (/(暖调|暖白|暖瓷|黄调|黄一白|黄二白|黄三白)/.test(label)) return '暖调'
  if (/中性/.test(label)) return '中性调'
  return 'unknown'
}

function inferLightness(label) {
  if (/(瓷白|雪花白|一白|白皙|偏白|亮白|浅白)/.test(label)) return '白皙'
  if (/(健康|小麦)/.test(label)) return '健康'
  if (/(自然色|自然肤|二白|三白)/.test(label)) return '自然'
  return 'unknown'
}

function inferSwatchColor(label) {
  if (!/[\u3400-\u9fff]/.test(label)) return null

  if (/米绿色/.test(label)) return '#b9cbb0'
  if (/透明/.test(label)) return '#eee9e2'
  if (/变奏粉紫|粉紫|紫/.test(label)) return '#9b687f'
  if (/暗红|深绯|红棕|红/.test(label)) return '#a6534f'
  if (/玩乐橙|雀跃橙|朱砂橘|金橘|橘|橙/.test(label)) return '#d78355'
  if (/粉调小麦|粉调自然/.test(label)) return '#b67c78'
  if (/粉棕/.test(label)) return '#bd7c7f'
  if (/着迷粉|跳音粉|是我.*粉|粉/.test(label)) return '#d58c96'
  if (/黑色/.test(label)) return '#302a28'
  if (/无虑夏/.test(label)) return '#df8576'
  if (/怦然春/.test(label)) return '#de8c91'
  if (/奶油冻|奶油色/.test(label)) return '#ddc2ab'
  if (/汉白玉|裸瓷|亮肤色|象牙色/.test(label)) return '#e4c6b0'
  if (/焦糖|奶茶|裸茶|甜茶|栗|棕|裸|蜜/.test(label)) return '#aa765d'

  if (/小麦|健康|深/.test(label)) return '#9a694f'
  if (/自然肤|自然色|二白|三白|嫩芽|柔沙/.test(label)) {
    if (/暖|黄/.test(label)) return '#c49674'
    if (/冷|粉/.test(label)) return '#c9978d'
    return '#c3a084'
  }
  if (/瓷白|雪花白|象牙白|米白|冰米|浅米|亮米|白皙|偏白|亮白|浅白|一白|白/.test(label)) {
    if (/中性去黄/.test(label)) return '#e7d0bd'
    if (/暖|黄/.test(label)) return '#e0bd9f'
    if (/冷|粉/.test(label)) return '#e8c6c0'
    return '#e7d0bd'
  }

  if (/暖调|暖白|暖/.test(label)) return '#c79776'
  if (/冷调|冷白|冷/.test(label)) return '#c99b95'
  if (/中性/.test(label)) return '#c5a58f'
  return '#c8a48d'
}

function shade(name, sourceLabel = name) {
  return {
    name,
    tone: inferTone(sourceLabel),
    lightness: inferLightness(sourceLabel),
    suitable: '购买前请结合页面标签并在自然光下试色',
    sourceLabel,
    swatchColor: inferSwatchColor(name),
    verificationStatus: 'verified_parameter_screenshot',
  }
}

function record(sequence, shades, options = {}) {
  const row = sequence + 5
  return {
    sequence: String(sequence).padStart(2, '0'),
    status: options.status || 'verified_parameter_screenshot',
    applyToCatalog: options.applyToCatalog !== false,
    reviewedAt,
    shades,
    sourceVariants: options.sourceVariants || [],
    issues: options.issues || [],
    source: {
      workbookPath: '产品核验信息/YasPretty-35款产品淘宝人工核验表.xlsx',
      workbookSheet: '淘宝人工核验',
      workbookNameCell: `C${row}`,
      workbookMatchCell: `K${row}`,
      parameterEvidenceKind: 'parameters',
    },
  }
}

const noIndependentShade = (message) => [
  {
    name: message,
    tone: 'unknown',
    lightness: 'unknown',
    suitable: '参数页未提供可核验的独立色号',
    sourceLabel: message,
    verificationStatus: 'not_listed_in_parameter_screenshot',
  },
]

export const reviewedProductShades = {
  'nars-light-reflecting': record(1, [
    shade('L1.5 中性1白', '【亚洲新色】L1.5 刚刚好的中性1白'),
    shade('L2 经典自然白'),
    shade('L0.5 粉1白', '【亚洲新色】L0.5 粉1白 冷白皮天菜'),
    shade('L1.25 黄1白', '【亚洲新色】L1.25 黄1白 减黄提亮不假白'),
    shade('L1.75 黄调自然色', '【亚洲新色】L1.75 黄调自然色'),
    shade('SIBERIA L0', 'SIBERIA L0 适合白皙/橄榄皮'),
    shade('GOBI L3'),
    shade('DEAUVILLE L4'),
    shade('OSLO L1'),
    shade('LIMA L3.25'),
  ]),
  'estee-lauder-double-wear': record(2, [
    shade('1C0 自然一白', '1C0 自然一白 白净更透亮'), shade('2C0 自然贴肤白'),
    shade('1W1 暖调象牙白', '1W1 暖调象牙白 黄皮挚爱'), shade('1N0 中性一白', '1N0 中性一白 不假白不发黄'),
    shade('1C1 冷调自然白', '1C1 冷调自然白 妈生气血感'), shade('1W2 暖调二白', '1W2 暖调二白 原生好气色'),
    shade('0N1 冷调瓷白', '0N1 冷调瓷白 白到发光'), shade('1N1 中性去黄白', '1N1 中性去黄白 橄榄皮挚爱'),
    shade('2W0 暖调自然白', '2W0 暖调自然白 健康肤色闭眼入'),
    ...['2W1', '3W1', '2N1', '1N2', '2W2', '3C0', '3N1', '3W0', '3N2', '2C3', '4W4', '4N1', '1C2', '2C2', '2N2', '2C1', '1W0'].map((name) => shade(name)),
  ]),
  'armani-luminous-silk': record(3, [
    shade('#1 黄一白', '#1 黄一白 偏白肤色首选 自然提亮'),
    shade('#2 粉一白', '#2 粉一白 适合偏白冷调肤色 冷调肌友好'),
    shade('#3 自然色', '#3 自然色 适合自然肤色 贴肤匀净'),
  ]),
  'laneige-neo-matte': record(4, [
    shade('#13 白皙肤色', '哑光绿气垫（油皮）白皙肤色#13'),
    shade('#21 自然肤色', '哑光绿气垫（油皮）自然肤色#21'),
  ]),
  'clio-kill-cover': record(5, [
    shade('02 亮肤色', '02 亮肤色（联名款）'), shade('03 象牙色', '03 象牙色（联名款）'),
  ], { sourceVariants: ['02 亮肤色（联名款）', '03 象牙色（联名款）', '02 亮肤色（经典版）', '03 象牙色（经典版）'] }),
  'ysl-touche-eclat': record(6, [shade('10 白皙色'), shade('20 自然白皙'), shade('30 小麦色')]),
  'nars-radiant-creamy': record(7, [
    shade('Vanilla 香草粉'), shade('Custard 奶油冻'), shade('Honey 甜蜜'),
    shade('Crème Brulee 焦糖布丁色'), shade('Affogato 香草冰咖色'), shade('Chantilly 甜奶油白色'),
  ]),
  'tarte-shape-tape': record(8, [
    shade('12B 亮白冷色'), shade('12N 亮白中性'), shade('12S 亮白'), shade('16N 亮浅中性'),
    shade('20S 浅暖色'), shade('22N 浅色中性'), shade('29N 柔和'), shade('35N 中度暖色'),
  ]),
  'the-saem-tip-concealer': record(9, [
    shade('0.5号 冰米色', '0.5号冰米色（适合冷白肤色）'), shade('01号 浅米色', '01号浅米色（适合白皙肤色）'),
    shade('1.25号 亮米色', '1.25号亮米色（适合白皙偏黄肤色）'), shade('1.5号 自然米色', '1.5号自然米色（适合自然肤色）'),
    shade('1.75号 中米色', '1.75号中米色（适合偏黄肤色）'), shade('02号 米黄色', '02号米黄色（适合暗黄肤色）'),
    shade('米绿色', '米绿色（适合泛红肌肤）'), shade('高光提亮液', '高光提亮液（局部提亮）'), shade('修容液', '修容液（阴影修脸）'),
  ]),
  'laura-mercier-translucent': record(10, noIndependentShade('参数页仅列“焕颜清透蜜粉”，未标注独立色号'), {
    status: 'marketplace_variant_only', sourceVariants: ['焕颜清透蜜粉（效期至2027年7月1日）'],
  }),
  'make-up-for-ever-hd': record(11, noIndependentShade('参数页仅列套装变体，未标注独立色号'), {
    status: 'marketplace_variant_only', sourceVariants: ['蜜粉[送]蜜粉', '蜜粉[送]蜜粉饼透明色'],
  }),
  'flower-knows-cloud': record(12, [shade('01 云朵白'), shade('02 星光粉'), shade('03 月光紫')], {
    sourceVariants: ['01云朵白+01透肤白', '01云朵白+02牛奶粉', '01云朵白+03水晶紫', '02星光粉+01透肤白', '02星光粉+02牛奶粉', '02星光粉+03水晶紫', '03月光紫+01透肤白', '03月光紫+02牛奶粉', '03月光紫+03水晶紫'],
  }),
  'dior-forever-skin-glow': record(13, [
    shade('0N 浅白肤色 中性调'), shade('1N 白皙肤色 中性调'), shade('0.5N 浅白至白皙肤色 中性调'),
    shade('00 瓷白肤色'), shade('0CR 浅白肤色 冷色调'), shade('0W 浅白肤色 暖色调'),
    shade('1.5N 白皙至自然肤色 中性调'), shade('1CR 白皙肤色 冷色调'), shade('1W 白皙肤色 暖色调'),
    shade('2N 自然肤色 中性调'), shade('3N 健康肤色 中性调'),
  ]),
  'dior-forever-matte': record(14, [
    shade('0N 浅白肤色 中性调'), shade('1N 白皙肤色 中性调'), shade('0.5N 浅白至白皙肤色 中性调'),
    shade('00 瓷白肤色'), shade('0CR 浅白肤色 冷色调'), shade('0W 浅白肤色 暖色调'),
    shade('1.5N 白皙至自然肤色 中性调'), shade('1CR 白皙肤色 冷色调'), shade('1W 白皙肤色 暖色调'),
    shade('2N 自然肤色 中性调'), shade('3N 健康肤色 中性调'),
  ]),
  'ysl-all-hours': record(15, [shade('LC1 白皙色'), shade('LC2 自然白皙'), shade('LN1 自然色'), shade('LN4 健康色')]),
  'chanel-les-beiges': record(16, [shade('BD01 白皙肤色'), shade('B10 自然偏白肤色'), shade('BR12 粉调偏白肤色'), shade('B20 自然肤色'), shade('B30 健康肤色')]),
  'prada-reveal-skin': record(17, [
    shade('LN10 中性自然偏白色'), shade('LW5 暖调白皙色'), shade('LN5 中性白皙色'),
    shade('LC5 冷调白皙色'), shade('LC10 冷调自然偏白色'), shade('MW50 暖调自然色'),
    shade('MN45 中性健康色'), shade('LN25 中性自然色'), shade('MC50 冷调自然色'),
  ]),
  'givenchy-prisme-libre': record(18, [
    shade('0N 白皙肌肤'), shade('0.5N 偏白肌肤'), shade('0C 粉调白皙肌肤'), shade('3W 自然健康色肌肤'),
    shade('1.5W 暖调自然肌肤'), shade('1N 自然肌肤'), shade('1.5C 粉调自然肌肤'),
  ]),
  'lancome-teint-idole': record(19, [
    shade('PO-01 黄一白', 'PO-01 黄一白更匀净'), shade('PO-03 黄二白', 'PO-03 黄二白亮半度'),
    shade('P-01'), shade('B-01 橄榄皮', 'B-01 适合橄榄皮'), shade('BO-03 小麦调', 'BO-03 适合小麦调'),
  ]),
  'mac-studio-fix': record(20, [
    shade('N12 首选不踩雷'), shade('NW7 白皮'), shade('N18 自然肤'), shade('NW11 白皙'),
    ...['NC30', 'NC40', 'N11', 'NW5 进阶冷白皮', 'N10', 'NC7', 'NC35', 'NC15', 'NC11', 'NC25', 'NC14', 'N16', 'NC12', 'NC20'].map((name) => shade(name)),
  ]),
  'bobbi-brown-weightless-skin': record(21, [
    shade('#N-012 瓷白'), shade('#W-016 暖瓷白'), shade('#W-026 暖象牙白'), shade('#N-032 柔沙'),
    shade('#C-004 雪花白'), shade('#N-052 小麦'), shade('#N-042 嫩芽'), shade('#C-036 冷柔沙'),
    shade('#N-000 中性雪花白'), shade('#W-046 暖嫩芽'), shade('#W-056 暖自然'), shade('#C-024 象牙白'),
    shade('#N-010 中性瓷白'), shade('#N-020 中性象牙白'), shade('#C-026 冷象牙白'),
    shade('#NW-022 中性暖象牙白'), shade('#W-036 暖柔沙'),
  ]),
  'mufe-hd-skin-foundation': record(22, [shade('1N02 自然白'), shade('1N00 象牙白'), shade('1R00粉嫩白'), shade('1R02'), shade('1Y06 健康白')]),
  'laura-mercier-real-flawless': record(23, [
    ...['0C1 OPAL', '0N1 SILK', '1N2 VANILLE', '0W1 SATIN', '1C1 COOL VANILLE', '1C2 CHIFFON', '1W1 CASHMERE', '2C2 SOFT SAND', '2N1 CASHEW', '2N2 LINEN', '2W1 MACADAMIA', '2W2 WARM LINEN', '3W0 SANDSTONE'].map((name) => shade(name)),
  ]),
  'shiseido-revitalessence': record(24, [shade('130'), shade('140')]),
  'cle-de-peau-radiant-natural': record(25, [
    shade('I10 象牙白'), shade('O10 自然偏白'), shade('B10 自然粉白'), shade('BF00 暖米白'),
    shade('B00 冷瓷白'), shade('O20 自然色'), shade('O30 小麦色'),
  ]),
  'cle-de-peau-radiant-matte': record(26, [
    shade('I10 象牙白'), shade('O10 自然偏白'), shade('B00 冷瓷白'), shade('B10 自然粉白'),
    shade('BF00 暖米白'), shade('O20 自然色'), shade('O30 小麦色'),
  ]),
  'suqqu-the-liquid': record(27, [shade('105 冷调偏白肤色'), shade('110 自然偏白肤色')]),
  'charlotte-tilbury-airbrush': record(28, [
    shade('1N 黄一白'), shade('2N 中性二白'), shade('1C 粉一白 冷白皮亮白'), shade('2C 粉一白 冷白皮'),
    shade('3N 中性三白'), shade('3C 粉二白'), shade('2W 黄二白'), shade('3W 黄三白'),
    shade('4C 粉调小麦肤色'), shade('5N 中性健康肤色'), shade('4N 中性小麦肤色'), shade('4W 暖调小麦肤色'),
  ]),
  'fenty-pro-filtr': record(29, [shade('#01 瓷白色'), shade('#02 自然色')], {
    sourceVariants: ['【丝雾锁妆款】#01瓷白色', '【丝雾锁妆款】#02自然色', '【奢润水光款】#01瓷白色', '【奢润水光款】#02自然色'],
  }),
  'hourglass-ambient-soft-glow': record(30, [
    shade('Cream 1.5 奶油色', 'Cream 1.5 奶油色 适合粉调冷白肤色'),
    shade('Cotton 2 暖白色', 'Cotton 2 暖白色 适合黄调白皙肤色'),
    shade('Alabaster 2.5 汉白玉色', 'Alabaster 2.5 汉白玉色 适合粉调白皙肤色'),
    shade('Porcelain 3 裸瓷色', 'Porcelain 3 裸瓷色 适合中性调白皙肤色'),
  ]),
  'pat-mcgrath-skin-fetish': record(31, ['Light 1', 'Light 2', 'Light 3', 'Light 4', 'Light 5'].map((name) => shade(name))),
  'lancome-is-me-liquid-blush': record(32, [
    shade('#50 「是我」粉', '50'), shade('#40 惬意棕', '40'), shade('#30 雀跃橙', '30'), shade('#20', '20'),
  ]),
  'lancome-pure-matte-lipstick': record(33, [
    ...[
      '「声色」限定#274 原声裸茶', '「声色」限定#201 跳音粉棕', '黑管哑光#196 朱砂橘',
      '黑管哑光#880 狂想红棕', '黑管哑光#09 烤栗秋', '黑管哑光#274 奶茶裸',
      '黑管哑光#296 上瘾红', '黑管哑光#295 微醺甜茶', '黑管哑光#505 苹果红',
      '黑管哑光#277 悸动裸', '黑管哑光#316 着迷粉', '黑管哑光#160 尽兴红',
      '黑管哑光#158 甜辣红', '「四季」限定#06 无虑夏', '「四季」限定#12 深绯冬',
      '黑管哑光#12 深绯冬', '黑管哑光#03 怦然春', '黑管哑光#230 玩乐橙',
      '黑管哑光#337 狂热棕', '「声色」限定#422 变奏粉紫', '黑管哑光#06 无虑夏',
    ].map((name) => shade(name)),
  ]),
  'loreal-paris-anti-gravity-mascara': record(34, noIndependentShade('参数页未标注独立色号'), {
    status: 'marketplace_variant_only',
  }),
  'loreal-paris-single-eyeshadow': record(35, [shade('金橘'), shade('暗红')]),
}

import { productImageNotice, productImageSources } from './product-image-sources.js'
import { reviewedProductShades } from './product-shade-verification.js'
import { reviewedProductFacts } from './product-verification.reviewed.js'

export const categoryOptions = ['粉底液', '气垫', '遮瑕', '散粉', '眼影', '睫毛膏', '腮红', '唇妆']
export const skinOptions = ['油皮', '混油皮', '干皮', '混干皮', '敏感肌']
export const finishOptions = ['哑光', '柔雾', '奶油肌', '自然光泽']

const productImages = {
  bottle: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85',
  tube: 'https://images.unsplash.com/photo-1631730486784-545611a3c9bf?auto=format&fit=crop&w=1200&q=85',
  compact: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85',
  powder: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85',
  studio: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a53?auto=format&fit=crop&w=1200&q=85',
  rose: 'https://images.unsplash.com/photo-1590156221719-19d5c6b0bd9f?auto=format&fit=crop&w=1200&q=85'
}

const auditDate = '2026-10-29'

function officialSource(title, url, supports) {
  return { title, url, publisher: title.includes('巴黎欧莱雅') ? '巴黎欧莱雅中国官网' : '兰蔻中国官网', accessedAt: auditDate, supports }
}

function enrichProductRecord(product) {
  const collectedImageSource = productImageSources[product.id]
  const reviewedFacts = reviewedProductFacts[product.id]
  const reviewedShades = reviewedProductShades[product.id]
  const imageSourceHasPage = Boolean(collectedImageSource?.sourcePageUrl)
  return {
    ...product,
    brand: reviewedFacts?.brand || product.brand,
    name: reviewedFacts?.productName || product.name,
    madeIn: reviewedFacts?.origin || product.madeIn,
    price: reviewedFacts?.listPrice ?? product.price,
    priceLabel: reviewedFacts ? `${reviewedFacts.listPrice} 元（参考原价）` : product.priceLabel,
    shades: reviewedShades?.applyToCatalog ? reviewedShades.shades : product.shades,
    shadeVerification: reviewedShades || null,
    shadeRecommendationReady: reviewedShades?.status === 'verified_parameter_screenshot',
    image: `/products/${product.id}/cover.webp`,
    priceCurrency: product.priceCurrency || 'CNY',
    priceVerifiedAt: reviewedFacts?.verifiedAt || product.priceVerifiedAt || null,
    informationSources: product.informationSources || [],
    imageSource: collectedImageSource ? {
      ...collectedImageSource,
      url: collectedImageSource.sourcePageUrl,
      note: imageSourceHasPage
        ? productImageNotice
        : '图片由项目负责人提供，页面暂未附原始来源链接。',
      publicUseDecision: imageSourceHasPage ? 'public_with_source_notice' : 'internal_review_pending_source',
    } : product.imageSource || { url: null, authorizationStatus: 'pending', note: '图片来源待补充。' },
    imageAuthorizationStatus: collectedImageSource?.authorizationStatus || product.imageAuthorizationStatus || 'pending',
    verificationStatus: product.verificationStatus || 'pending',
    factVerificationStatus: reviewedFacts?.reviewStatus || product.factVerificationStatus || 'pending',
    publicStatus: collectedImageSource
      ? imageSourceHasPage ? 'public_with_source_notice_pending_authorization' : 'blocked_missing_original_image_source'
      : product.publicStatus || 'blocked_pending_product_evidence',
    recommendationReady: product.recommendationReady !== false,
  }
}

const stage3Products = [
  {
    id: 'lancome-is-me-liquid-blush', brand: 'Lancôme', name: '是我液体腮红', category: '腮红', brandRegion: '法国', madeIn: '以包装批次为准', price: 290, priceLabel: '290 元（官网参考价）',
    image: productImages.rose, skins: ['油皮', '混油皮', '干皮', '混干皮', '敏感肌'], finish: '自然光泽', coverage: '低', wear: null, oxidation: null, rating: null,
    shades: [{ name: '#50「是我」粉', tone: '冷调', lightness: '白皙', suitable: '自然提气色' }, { name: '#40 惬意棕', tone: '暖调', lightness: '自然', suitable: '暖调腮红方向' }, { name: '#30 雀跃橙', tone: '暖调', lightness: '自然', suitable: '杏橘色方向' }],
    note: '官网描述为水感液体腮红；实际显色会受用量、底妆和光线影响。', pros: ['官网列出多枚色号与规格', '液体质地适合薄层叠加'], cautions: ['不把页面文案当作持妆承诺', '颜色请在自然光下复核'], scenes: ['通勤', '约会', '自然妆'], metrics: {},
    informationSources: [officialSource('兰蔻是我液体腮红｜兰蔻官网', 'https://www.lancome.com.cn/product/LAN00316/', ['品牌、名称、腮红品类、色号、CNY 价格'])],
    imageSource: { url: 'https://res-wxec-unipt.lorealchina.com/prod/lan/20260702/9b2619c4-9f9e-42d0-938b-aa0b25131dbd.jpg', authorizationStatus: 'pending', note: '官方页面图片仅作来源指向，未取得再利用授权。' },
    priceVerifiedAt: auditDate, verificationStatus: 'pending', factVerificationStatus: 'verified', publicStatus: 'blocked_image_authorization', recommendationReady: true,
  },
  {
    id: 'lancome-pure-matte-lipstick', brand: 'Lancôme', name: '菁纯丝绒雾面唇膏', category: '唇妆', brandRegion: '法国', madeIn: '以包装批次为准', price: 380, priceLabel: '380 元（官网参考价）',
    image: productImages.rose, skins: ['油皮', '混油皮', '干皮', '混干皮', '敏感肌'], finish: '柔雾', coverage: '中', wear: null, oxidation: null, rating: null,
    shades: [{ name: '#196 朱砂橘', tone: '暖调', lightness: '自然', suitable: '暖橘方向' }, { name: '#296 上瘾红', tone: '中性调', lightness: '自然', suitable: '红调方向' }, { name: '#316 着迷粉', tone: '冷调', lightness: '白皙', suitable: '粉调方向' }],
    note: '官网将其归为唇部产品并列出多枚色号；色彩呈现受唇色与光线影响。', pros: ['官网列出色号、规格和 CNY 价格', '柔雾方向适合少量叠加'], cautions: ['不把页面描述当作脱色或持妆时长承诺', '唇部干燥、破损或不适时先暂停使用'], scenes: ['通勤', '约会', '正式活动'], metrics: {},
    informationSources: [officialSource('兰蔻菁纯丝绒雾面唇膏｜兰蔻官网', 'https://www.lancome.com.cn/product/LAN00295/', ['品牌、名称、唇部品类、色号、CNY 价格'])],
    imageSource: { url: 'https://res-wxec-unipt.lorealchina.com/prod/lan/20261012/5855626a-d7b4-410a-a51f-947681c6159d.jpg', authorizationStatus: 'pending', note: '官方页面图片仅作来源指向，未取得再利用授权。' },
    priceVerifiedAt: auditDate, verificationStatus: 'pending', factVerificationStatus: 'verified', publicStatus: 'blocked_image_authorization', recommendationReady: true,
  },
  {
    id: 'loreal-paris-anti-gravity-mascara', brand: 'L’Oréal Paris', name: '反重力睫毛膏', category: '睫毛膏', brandRegion: '法国', madeIn: '以包装批次为准', price: 144, priceLabel: '144 元（官网参考价）',
    image: productImages.tube, skins: ['油皮', '混油皮', '干皮', '混干皮', '敏感肌'], finish: '自然', coverage: '中', wear: null, oxidation: null, rating: null,
    shades: [{ name: '黑色 9.9ml', tone: '中性调', lightness: '自然', suitable: '日常眉眼' }],
    note: '官网页面列出 9.9ml 规格和 CNY 价格；不将名称转译为夸张功效承诺。', pros: ['官网列出规格、价格和商品图片来源', '可作为眉眼步骤的站内候选'], cautions: ['刷头、晕染和防水表现会因用法而异', '眼周出现刺痛、红肿或不适时立即停止使用'], scenes: ['通勤', '日常', '正式活动'], metrics: {},
    informationSources: [officialSource('反重力睫毛膏｜巴黎欧莱雅', 'https://www.lorealparis.com.cn/product/MU0111/', ['品牌、名称、睫毛膏品类、9.9ml 规格、CNY 价格'])],
    imageSource: { url: 'https://res-wxec-unipt.lorealchina.com/prod/pl/20250916/91e2098b-d400-4a2f-bee3-685bb128fdae.png', authorizationStatus: 'pending', note: '官方页面图片仅作来源指向，未取得再利用授权。' },
    priceVerifiedAt: auditDate, verificationStatus: 'pending', factVerificationStatus: 'verified', publicStatus: 'blocked_image_authorization', recommendationReady: true,
  },
  {
    id: 'loreal-paris-single-eyeshadow', brand: 'L’Oréal Paris', name: '纷泽口袋眼影', category: '眼影', brandRegion: '法国', madeIn: '中国', price: 120, priceLabel: '120 元（参考原价）',
    image: productImages.compact, skins: ['油皮', '混油皮', '干皮', '混干皮', '敏感肌'], finish: '自然光泽', coverage: '低', wear: null, oxidation: null, rating: null,
    shades: [{ name: '官网色号未在本次记录中展开', tone: 'unknown', lightness: 'unknown', suitable: '先以自然光观察' }],
    note: '规格为 5*0.8g；色彩与妆效仍需按实际使用和光线判断。', pros: ['提供官方店商品、规格和价格信息'], cautions: ['显色、持妆和飞粉表现未做独立实测', '眼周出现刺痛、红肿或不适时立即停止使用'], scenes: ['日常', '通勤'], metrics: {},
    informationSources: [officialSource('纷泽口袋眼影｜巴黎欧莱雅', 'https://www.lorealparis.com.cn/product/MU009/', ['品牌、名称、眼影品类'])],
    imageSource: { url: 'https://res-wxec-unipt.lorealchina.com/prod/pl/20200811/dc84d0fb-9571-4b49-b7b5-300de8b48a7b.jpg', authorizationStatus: 'pending', note: '官方页面图片仅作来源指向，未取得再利用授权。' },
    priceVerifiedAt: '2026-11-01', verificationStatus: 'pending', factVerificationStatus: 'verified', publicStatus: 'blocked_image_authorization', recommendationReady: true,
  },
]

const internationalShadeProfiles = [
  { tone: '冷调', lightness: '白皙', suitable: '冷白皮' },
  { tone: '中性调', lightness: '白皙', suitable: '中性一白' },
  { tone: '暖调', lightness: '自然', suitable: '黄一白至黄二白' },
]

const foundationProfiles = {
  glow: { skins: ['混干皮', '干皮', '混油皮'], finish: '自然光泽', coverage: '中', wear: 8, oxidation: '低', metrics: { 遮瑕度: 3, 持妆度: 4, 控油度: 3, 保湿度: 4, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 1 }, scenes: ['通勤', '秋冬', '约会'] },
  matte: { skins: ['油皮', '混油皮'], finish: '柔雾', coverage: '高', wear: 10, oxidation: '中', metrics: { 遮瑕度: 4, 持妆度: 5, 控油度: 5, 保湿度: 2, 毛孔修饰: 4, 氧化程度: 2, 卡粉风险: 3 }, scenes: ['夏季', '拍照', '长时间带妆'] },
  natural: { skins: ['混干皮', '混油皮', '敏感肌'], finish: '奶油肌', coverage: '中', wear: 8, oxidation: '低', metrics: { 遮瑕度: 3, 持妆度: 4, 控油度: 3, 保湿度: 4, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 1 }, scenes: ['通勤', '拍照', '秋冬'] },
}

function createInternationalFoundation({ profile = 'natural', shades, note, pros, cautions, ...product }) {
  const traits = foundationProfiles[profile]
  return {
    category: '粉底液',
    image: product.image || productImages.bottle,
    priceLabel: product.priceLabel || `${product.price - 30} - ${product.price + 30} 元`,
    rating: product.rating || 4.5,
    ...traits,
    ...product,
    shades: shades.map((name, index) => ({ name, ...internationalShadeProfiles[index % internationalShadeProfiles.length] })),
    note,
    pros,
    cautions,
  }
}

const internationalFoundations = [
  createInternationalFoundation({ id: 'dior-forever-skin-glow', brand: 'Dior', name: '锁妆柔润亮泽粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 690, profile: 'glow', image: '/product/Dior Forever Skin Glow 恒久凝脂亮泽粉底液/Dior Forever Skin Glow 恒久凝脂亮泽粉底液 1W.webp', images: [{ shade: '0N', url: '/product/Dior Forever Skin Glow 恒久凝脂亮泽粉底液/Dior Forever Skin Glow 恒久凝脂亮泽粉底液 0N.webp' }, { shade: '1W', url: '/product/Dior Forever Skin Glow 恒久凝脂亮泽粉底液/Dior Forever Skin Glow 恒久凝脂亮泽粉底液 1W.webp' }, { shade: '2N', url: '/product/Dior Forever Skin Glow 恒久凝脂亮泽粉底液/Dior Forever Skin Glow 恒久凝脂亮泽粉底液 2N.webp' }], shades: ['0N', '1W', '2N'], note: '妆面有细腻的光泽感，薄层就能均匀肤色。', pros: ['光泽克制，不显油', '延展顺滑', '适合叠加遮瑕'], cautions: ['重度油皮建议定妆', '色号建议先线下试色'] }),
  createInternationalFoundation({ id: 'dior-forever-matte', brand: 'Dior', name: '锁妆柔雾哑光粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 690, profile: 'matte', shades: ['0N', '1W', '2N'], note: '成膜后是干净的柔雾感，适合想要精致持妆的妆面。', pros: ['柔焦修饰力好', '出油后不易花妆', '遮瑕可叠加'], cautions: ['干皮需做好保湿', '少量分区上妆更均匀'] }),
  createInternationalFoundation({ id: 'ysl-all-hours', brand: 'YSL', name: 'All Hours 恒久无瑕粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 630, profile: 'matte', shades: ['LN1', 'LN4', 'MN1'], note: '有修饰力但不会过分厚重，适合通勤到晚间的转换。', pros: ['肤色修饰均匀', '妆面细腻', '持妆表现稳定'], cautions: ['鼻翼部位需少量叠加', '偏干皮可搭配保湿妆前'] }),
  createInternationalFoundation({ id: 'chanel-les-beiges', brand: 'CHANEL', name: 'LES BEIGES 健康光泽粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 680, profile: 'glow', shades: ['B10', 'BD21', 'B30'], note: '轻薄、透亮，保留皮肤本身的细微质感。', pros: ['自然光泽感', '妆感轻盈', '适合快速上妆'], cautions: ['瑕疵肌需配合遮瑕', '大油皮建议局部定妆'] }),
  createInternationalFoundation({ id: 'prada-reveal-skin', brand: 'PRADA BEAUTY', name: 'Reveal Skin 柔焦粉底液', brandRegion: '意大利', madeIn: '法国（以包装批次为准）', price: 720, profile: 'natural', shades: ['LC5', 'LN10', 'MN20'], note: '妆面像被柔焦过，保留皮肤光泽却不显厚。', pros: ['柔焦毛孔感', '自然奶油光', '叠加不易结块'], cautions: ['高遮瑕需求需另加遮瑕', '色号跨度建议试色'] }),
  createInternationalFoundation({ id: 'givenchy-prisme-libre', brand: 'GIVENCHY', name: 'Prisme Libre Skin-Caring Glow 粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 620, profile: 'glow', shades: ['N80', 'N95', 'W100'], note: '上脸有柔润的皮肤光，妆感显得轻而完整。', pros: ['妆面通透', '保湿感在线', '细纹处较服帖'], cautions: ['夏季油皮需要散粉辅助', '叠涂应控制用量'] }),
  createInternationalFoundation({ id: 'lancome-teint-idole', brand: 'LANCÔME', name: 'Teint Idole Ultra Wear 持妆粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 530, profile: 'matte', shades: ['105W', '110C', '120N'], note: '遮瑕和持妆之间的平衡成熟，适合忙碌的工作日。', pros: ['修饰红痘印能力好', '持妆时间长', '妆面均匀'], cautions: ['需注意妆前兼容性', '眼下建议避开厚涂'] }),
  createInternationalFoundation({ id: 'mac-studio-fix', brand: 'M·A·C', name: 'Studio Fix Fluid 柔雾持妆粉底液', brandRegion: '加拿大', madeIn: '加拿大（以包装批次为准）', price: 410, profile: 'matte', shades: ['NW10', 'NC15', 'NC20'], note: '妆效可由薄透到高修饰，适合需要调节遮瑕度的人。', pros: ['色号选择多', '遮瑕可自由叠加', '适合拍照'], cautions: ['不要一次取量过多', '干皮建议搭配滋润妆前'] }),
  createInternationalFoundation({ id: 'bobbi-brown-weightless-skin', brand: 'BOBBI BROWN', name: 'Weightless Skin 无感持妆粉底液', brandRegion: '美国', madeIn: '美国（以包装批次为准）', price: 620, profile: 'natural', shades: ['0 Alabaster', '1 Warm Ivory', '2 Sand'], note: '呈现细腻的奶油肌感，整体显得很有精神。', pros: ['妆感自然', '肤色修饰柔和', '通勤友好'], cautions: ['重瑕疵需局部遮瑕', '油皮需定妆加强'] }),
  createInternationalFoundation({ id: 'mufe-hd-skin-foundation', brand: 'MAKE UP FOR EVER', name: 'HD Skin 高清持妆粉底液', brandRegion: '法国', madeIn: '法国（以包装批次为准）', price: 460, profile: 'natural', shades: ['1N00', '1N06', '1Y08'], note: '对镜头和毛孔都有不错的柔焦修饰，妆面很干净。', pros: ['毛孔修饰自然', '颜色选择丰富', '适合拍摄场景'], cautions: ['干皮需避开粉感较重的手法', '定妆需少量多次'] }),
  createInternationalFoundation({ id: 'laura-mercier-real-flawless', brand: 'LAURA MERCIER', name: 'Real Flawless 柔光粉底液', brandRegion: '美国', madeIn: '美国（以包装批次为准）', price: 520, profile: 'natural', shades: ['0N1', '1N1', '2W1'], note: '像一层柔光滤镜，细腻而不刻意。', pros: ['自然修饰肤色', '妆面有层次', '叠加后仍轻盈'], cautions: ['深色痘印建议另加遮瑕', '盛夏需强化定妆'] }),
  createInternationalFoundation({ id: 'shiseido-revitalessence', brand: 'SHISEIDO', name: 'Revitalessence Skin Glow 粉底液', brandRegion: '日本', madeIn: '日本（以包装批次为准）', price: 520, profile: 'glow', shades: ['110 Alabaster', '220 Linen', '330 Bamboo'], note: '皮肤看起来有水润的微光，适合干燥季节。', pros: ['光泽轻透', '干纹处较服帖', '妆感有呼吸感'], cautions: ['油皮建议只用在秋冬', '局部定妆更平衡'] }),
  createInternationalFoundation({ id: 'cle-de-peau-radiant-natural', brand: 'Clé de Peau Beauté', name: 'Radiant Fluid Foundation Natural 光润粉底液', brandRegion: '日本', madeIn: '日本（以包装批次为准）', price: 980, profile: 'glow', shades: ['O10', 'BF20', 'B30'], note: '光泽细腻而精致，整体妆面显得非常完整。', pros: ['妆效高级', '细纹修饰柔和', '延展性好'], cautions: ['价格较高', '遮瑕度属于自然修饰'] }),
  createInternationalFoundation({ id: 'cle-de-peau-radiant-matte', brand: 'Clé de Peau Beauté', name: 'Radiant Fluid Foundation Matte 柔雾粉底液', brandRegion: '日本', madeIn: '日本（以包装批次为准）', price: 980, profile: 'matte', shades: ['O10', 'BF20', 'B30'], note: '柔雾中带一点皮肤感，适合追求精致妆面的人。', pros: ['毛孔修饰好', '妆面平整', '长时间妆感干净'], cautions: ['上妆前需要均匀保湿', '建议快速拍开'] }),
  createInternationalFoundation({ id: 'suqqu-the-liquid', brand: 'SUQQU', name: 'The Liquid Foundation 粉霜', brandRegion: '日本', madeIn: '日本（以包装批次为准）', price: 700, profile: 'natural', shades: ['105', '110', '120'], note: '粉质细腻，妆面是自然的奶油光泽。', pros: ['肤感舒适', '妆面柔和', '适合秋冬通勤'], cautions: ['大油皮需分区定妆', '色号需仔细对比'] }),
  createInternationalFoundation({ id: 'charlotte-tilbury-airbrush', brand: 'Charlotte Tilbury', name: 'Airbrush Flawless Foundation', brandRegion: '英国', madeIn: '意大利（以包装批次为准）', price: 490, profile: 'matte', shades: ['1 Neutral', '3 Neutral', '4 Warm'], note: '修饰力很清晰，呈现平整的柔雾妆面。', pros: ['遮瑕表现突出', '柔焦效果强', '适合正式场合'], cautions: ['取量从半泵开始', '干皮需搭配保湿底妆'] }),
  createInternationalFoundation({ id: 'fenty-pro-filtr', brand: 'FENTY BEAUTY', name: "Fan's Red Carpet红毯气垫", category: '气垫', brandRegion: '美国', madeIn: '中国大陆', price: 500, priceLabel: '500 元（参考原价）', profile: 'natural', skins: ['油皮', '混油皮', '干皮', '混干皮', '敏感肌'], finish: '自然光泽', coverage: '中', wear: null, oxidation: null, shades: ['#01 瓷白色', '#02 自然色'], note: '规格为 14g；妆效与适配方向会因肤质、用法和光线而变化。', pros: ['提供商品链接、规格和价格信息'], cautions: ['封面图片来源请以页面版权说明为准', '品牌与店铺名称按商品页面显示为准'], recommendationReady: false }),
  createInternationalFoundation({ id: 'hourglass-ambient-soft-glow', brand: 'HOURGLASS', name: 'Ambient Soft Glow Foundation', brandRegion: '美国', madeIn: '美国（以包装批次为准）', price: 590, profile: 'glow', shades: ['1.5', '4', '6.5'], note: '妆面有温柔的柔光感，修饰度和透气感平衡。', pros: ['光泽自然', '肤色修饰均匀', '适合拍照'], cautions: ['高温天需控油定妆', '深瑕疵需遮瑕辅助'] }),
  createInternationalFoundation({ id: 'pat-mcgrath-skin-fetish', brand: 'PAT McGRATH LABS', name: 'Skin Fetish: Sublime Perfection Foundation', brandRegion: '英国', madeIn: '意大利（以包装批次为准）', price: 620, profile: 'glow', shades: ['Light 2', 'Light Medium 10', 'Medium 15'], note: '光泽精致但不张扬，适合想要高级皮肤质感的时候。', pros: ['通透显肤质', '妆感层次细', '适合精致妆容'], cautions: ['局部瑕疵需额外遮盖', '建议少量多次叠加'] }),
]

export const products = [
  {
    id: 'nars-light-reflecting', brand: 'NARS', name: '超方瓶粉底液', category: '粉底液', brandRegion: '美国', madeIn: '法国', price: 430, priceLabel: '400 - 450 元',
    image: '/product/NARS/NARS超方瓶/NARS超方瓶 L2.webp', images: [{ shade: 'L0.5', url: '/product/NARS/NARS超方瓶/NARS超方瓶 L0.5.webp' }, { shade: 'L2', url: '/product/NARS/NARS超方瓶/NARS超方瓶 L2.webp' }, { shade: 'L4', url: '/product/NARS/NARS超方瓶/NARS超方瓶 L4.webp' }], skins: ['混干皮', '干皮', '混油皮'], finish: '自然光泽', coverage: '中', wear: 8, oxidation: '低', rating: 4.7,
    shades: [{ name: 'L0.5', tone: '冷调', lightness: '白皙', suitable: '冷白皮' }, { name: 'L2', tone: '冷调', lightness: '白皙', suitable: '自然白皮' }, { name: 'L4', tone: '中性调', lightness: '自然', suitable: '黄一白至黄二白' }],
    note: '薄薄一层就有通透的皮肤质感，光泽克制。', pros: ['延展度高，不容易留下粉痕', '妆面细腻，有柔焦感', '氧化幅度小'], cautions: ['瑕疵较多时需要叠加遮瑕', '油皮盛夏建议定妆'], scenes: ['通勤', '秋冬', '约会'], metrics: { 遮瑕度: 3, 持妆度: 4, 控油度: 3, 保湿度: 4, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 1 }
  },
  {
    id: 'estee-lauder-double-wear', brand: 'Estée Lauder', name: '持妆粉底液', category: '粉底液', brandRegion: '美国', madeIn: '比利时', price: 520, priceLabel: '500 - 550 元',
    image: '/product/Estée Lauder持妆粉底液/Estée Lauder持妆粉底液1N1.webp', images: [{ shade: '1W1 Bone', url: '/product/Estée Lauder持妆粉底液/Estée Lauder持妆粉底液1W1.webp' }, { shade: '1N1 Ivory Nude', url: '/product/Estée Lauder持妆粉底液/Estée Lauder持妆粉底液1N1.webp' }, { shade: '2W0 Warm Vanilla', url: '/product/Estée Lauder持妆粉底液/Estée Lauder持妆粉底液2W0.webp' }], skins: ['油皮', '混油皮'], finish: '柔雾', coverage: '高', wear: 12, oxidation: '中', rating: 4.6,
    shades: [{ name: '1W1 Bone', tone: '暖调', lightness: '白皙', suitable: '黄一白' }, { name: '1N1 Ivory Nude', tone: '中性调', lightness: '白皙', suitable: '中性一白' }, { name: '2W0 Warm Vanilla', tone: '暖调', lightness: '自然', suitable: '黄二白' }],
    note: '需要快速拍开，但成膜后面对出油和闷热很稳。', pros: ['遮瑕与持妆表现突出', '高温通勤不易斑驳', '少量即可均匀肤色'], cautions: ['上妆前要做足保湿', '偏干部位建议分区使用'], scenes: ['夏季', '长时间带妆', '拍照'], metrics: { 遮瑕度: 5, 持妆度: 5, 控油度: 5, 保湿度: 2, 毛孔修饰: 4, 氧化程度: 2, 卡粉风险: 3 }
  },
  {
    id: 'armani-luminous-silk', brand: 'GIORGIO ARMANI', name: '大师粉底液', category: '粉底液', brandRegion: '意大利', madeIn: '法国', price: 690, priceLabel: '650 - 700 元',
    image: '/product/GIORGIO ARMANI 大师粉底液/GIORGIO ARMANI 大师粉底液 3号.webp', images: [{ shade: '2', url: '/product/GIORGIO ARMANI 大师粉底液/GIORGIO ARMANI 大师粉底液 2号.webp' }, { shade: '3', url: '/product/GIORGIO ARMANI 大师粉底液/GIORGIO ARMANI 大师粉底液 3号.webp' }, { shade: '4', url: '/product/GIORGIO ARMANI 大师粉底液/GIORGIO ARMANI 大师粉底液 4号.webp' }], skins: ['混干皮', '干皮', '混油皮'], finish: '自然光泽', coverage: '中', wear: 8, oxidation: '低', rating: 4.8,
    shades: [{ name: '2', tone: '冷调', lightness: '白皙', suitable: '冷白皮' }, { name: '3', tone: '中性调', lightness: '白皙', suitable: '中性一白' }, { name: '4', tone: '暖调', lightness: '自然', suitable: '黄一白' }],
    note: '像给皮肤加了一层很薄的柔焦滤镜，精致但不厚。', pros: ['轻盈且有高级光泽', '叠加后仍显自然', '与大部分妆前兼容'], cautions: ['深瑕疵需要另外遮盖', '价格较高'], scenes: ['约会', '拍照', '秋冬'], metrics: { 遮瑕度: 3, 持妆度: 4, 控油度: 3, 保湿度: 4, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 1 }
  },
  {
    id: 'laneige-neo-matte', brand: 'LANEIGE', name: 'NEO 小方块气垫（哑光）', category: '气垫', brandRegion: '韩国', madeIn: '韩国', price: 295, priceLabel: '250 - 320 元',
    image: productImages.compact, skins: ['油皮', '混油皮'], finish: '哑光', coverage: '中', wear: 9, oxidation: '中', rating: 4.4,
    shades: [{ name: '17N', tone: '中性调', lightness: '白皙', suitable: '中性一白' }, { name: '21N', tone: '中性调', lightness: '自然', suitable: '中性二白' }, { name: '23N', tone: '暖调', lightness: '自然', suitable: '黄二白' }],
    note: '补妆时也不容易堆积，适合想要清爽底妆的日子。', pros: ['粉扑取粉均匀', '出油后妆感仍干净', '携带补妆方便'], cautions: ['鼻翼干皮需要先少量保湿', '色号偏亮可先试色'], scenes: ['通勤', '夏季', '补妆'], metrics: { 遮瑕度: 3, 持妆度: 4, 控油度: 5, 保湿度: 2, 毛孔修饰: 4, 氧化程度: 2, 卡粉风险: 3 }
  },
  {
    id: 'clio-kill-cover', brand: 'CLIO', name: '小磁铁气垫', category: '气垫', brandRegion: '韩国', madeIn: '韩国', price: 189, priceLabel: '160 - 210 元',
    image: productImages.compact, skins: ['油皮', '混油皮', '敏感肌'], finish: '柔雾', coverage: '高', wear: 10, oxidation: '中', rating: 4.3,
    shades: [{ name: '2 Lingerie', tone: '中性调', lightness: '白皙', suitable: '中性一白' }, { name: '3 Linen', tone: '暖调', lightness: '自然', suitable: '黄一白' }, { name: '4 Ginger', tone: '暖调', lightness: '自然', suitable: '黄二白' }],
    note: '遮盖力很有存在感，少量轻拍更像原生好皮肤。', pros: ['单层遮瑕度高', '柔雾妆面适合拍照', '性价比友好'], cautions: ['手法重会显妆感', '保湿妆前是关键'], scenes: ['通勤', '拍照', '夏季'], metrics: { 遮瑕度: 4, 持妆度: 5, 控油度: 4, 保湿度: 2, 毛孔修饰: 4, 氧化程度: 2, 卡粉风险: 3 }
  },
  {
    id: 'ysl-touche-eclat', brand: 'YSL', name: '「真」皮气垫', category: '气垫', brandRegion: '法国', madeIn: '韩国', price: 630, priceLabel: '600 - 650 元',
    image: productImages.rose, skins: ['混油皮', '混干皮', '干皮'], finish: '奶油肌', coverage: '中', wear: 8, oxidation: '低', rating: 4.5,
    shades: [{ name: 'B10', tone: '冷调', lightness: '白皙', suitable: '冷白皮' }, { name: 'B20', tone: '中性调', lightness: '白皙', suitable: '中性一白' }, { name: 'BR20', tone: '暖调', lightness: '自然', suitable: '黄一白' }],
    note: '妆面有细腻的奶油光，午后补一次就很完整。', pros: ['贴肤且有修饰感', '粉质细，细纹处不易显干', '妆效自然精致'], cautions: ['重度油皮需要加散粉', '替换芯成本较高'], scenes: ['通勤', '约会', '秋冬'], metrics: { 遮瑕度: 3, 持妆度: 4, 控油度: 3, 保湿度: 4, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 1 }
  },
  {
    id: 'nars-radiant-creamy', brand: 'NARS', name: '亮采柔滑遮瑕蜜', category: '遮瑕', brandRegion: '美国', madeIn: '加拿大', price: 320, priceLabel: '300 - 350 元',
    image: '/product/NARS/NARS亮采柔滑遮瑕蜜/NARS亮采柔滑遮瑕蜜「痘印克星」奶油冻Custard.webp', images: [{ shade: 'Vanilla', url: '/product/NARS/NARS亮采柔滑遮瑕蜜/NARS亮采柔滑遮瑕蜜「泪沟橡皮擦」香草粉Vanilla.webp' }, { shade: 'Honey', url: '/product/NARS/NARS亮采柔滑遮瑕蜜/NARS亮采柔滑遮瑕蜜「黑眼圈救星」甜蜜Honey.webp' }, { shade: 'Custard', url: '/product/NARS/NARS亮采柔滑遮瑕蜜/NARS亮采柔滑遮瑕蜜「痘印克星」奶油冻Custard.webp' }], skins: ['混干皮', '干皮', '混油皮'], finish: '自然光泽', coverage: '中', wear: 7, oxidation: '低', rating: 4.7,
    shades: [{ name: 'Vanilla', tone: '中性调', lightness: '白皙', suitable: '提亮泪沟' }, { name: 'Honey', tone: '暖调', lightness: '自然', suitable: '修饰黑眼圈' }, { name: 'Custard', tone: '暖调', lightness: '自然', suitable: '遮盖痘印' }],
    note: '眼下够润，痘印也能叠盖，整体很不挑底妆。', pros: ['眼下和面部都能使用', '液体有延展空间', '妆面不易厚重'], cautions: ['顽固红痘印需分次少量叠加', '油皮眼下建议定妆'], scenes: ['通勤', '干皮', '自然底妆'], metrics: { 遮瑕度: 3, 持妆度: 3, 控油度: 2, 保湿度: 4, 毛孔修饰: 3, 氧化程度: 1, 卡粉风险: 1 }
  },
  {
    id: 'tarte-shape-tape', brand: 'tarte', name: 'Shape Tape 遮瑕液', category: '遮瑕', brandRegion: '美国', madeIn: '美国', price: 260, priceLabel: '230 - 280 元',
    image: productImages.tube, skins: ['油皮', '混油皮'], finish: '哑光', coverage: '高', wear: 9, oxidation: '低', rating: 4.4,
    shades: [{ name: '22N Light Neutral', tone: '中性调', lightness: '白皙', suitable: '中性一白' }, { name: '27S Light-Medium Sand', tone: '暖调', lightness: '自然', suitable: '黄一白' }, { name: '35N Medium', tone: '中性调', lightness: '自然', suitable: '自然肤色' }],
    note: '点涂在局部瑕疵上，干净利落且很能打。', pros: ['遮盖力强', '成膜后不易移动', '适合做局部遮瑕'], cautions: ['眼下需搭配保湿型眼霜', '不要一次下太多量'], scenes: ['拍照', '夏季', '长时间带妆'], metrics: { 遮瑕度: 5, 持妆度: 5, 控油度: 4, 保湿度: 1, 毛孔修饰: 3, 氧化程度: 1, 卡粉风险: 4 }
  },
  {
    id: 'the-saem-tip-concealer', brand: 'the SAEM', name: '得鲜经典遮瑕液', category: '遮瑕', brandRegion: '韩国', madeIn: '韩国', price: 45, priceLabel: '35 - 55 元',
    image: productImages.tube, skins: ['油皮', '混油皮', '混干皮'], finish: '柔雾', coverage: '高', wear: 8, oxidation: '中', rating: 4.2,
    shades: [{ name: '01 Clear Beige', tone: '中性调', lightness: '白皙', suitable: '自然提亮' }, { name: '1.5 Natural Beige', tone: '暖调', lightness: '自然', suitable: '黄一白' }, { name: '02 Rich Beige', tone: '暖调', lightness: '自然', suitable: '黄二白' }],
    note: '小小一支解决局部瑕疵，属于随手能用的平价选择。', pros: ['价格亲民', '痘印遮盖力足', '小巧便携'], cautions: ['眼下使用要注意保湿', '妆前不同可能影响持妆'], scenes: ['通勤', '平价底妆', '补妆'], metrics: { 遮瑕度: 4, 持妆度: 4, 控油度: 4, 保湿度: 2, 毛孔修饰: 3, 氧化程度: 2, 卡粉风险: 3 }
  },
  {
    id: 'laura-mercier-translucent', brand: 'LAURA MERCIER', name: '柔光透明散粉', category: '散粉', brandRegion: '美国', madeIn: '美国', price: 420, priceLabel: '400 - 450 元',
    image: productImages.powder, skins: ['油皮', '混油皮', '混干皮'], finish: '柔雾', coverage: '低', wear: 8, oxidation: '低', rating: 4.6,
    shades: [{ name: 'Translucent', tone: '中性调', lightness: '透明', suitable: '大部分肤色' }, { name: 'Honey', tone: '暖调', lightness: '自然', suitable: '暖黄肤色' }],
    note: '粉质像薄雾一样压住油光，底妆仍保有层次。', pros: ['细腻不易显粉感', '定妆后有柔焦效果', '压妆后妆面干净'], cautions: ['干皮可只定T区', '取粉需少量多次'], scenes: ['通勤', '长时间带妆', '拍照'], metrics: { 遮瑕度: 1, 持妆度: 4, 控油度: 4, 保湿度: 2, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 2 }
  },
  {
    id: 'make-up-for-ever-hd', brand: 'MAKE UP FOR EVER', name: '轻烟蜜粉', category: '散粉', brandRegion: '法国', madeIn: '法国', price: 330, priceLabel: '300 - 350 元',
    image: productImages.powder, skins: ['油皮', '混油皮', '敏感肌'], finish: '哑光', coverage: '低', wear: 9, oxidation: '低', rating: 4.5,
    shades: [{ name: '1.0 Transparent', tone: '中性调', lightness: '透明', suitable: '大部分肤色' }, { name: '1.2 Banana', tone: '暖调', lightness: '自然', suitable: '黄皮提亮' }],
    note: '不抢底妆光泽，但把镜头下的毛孔感降得很稳。', pros: ['粉体轻，适合叠加', '妆感干净不泛白', '控油时长优秀'], cautions: ['干皮全脸烘焙会偏干', '透明款要避开过量'], scenes: ['夏季', '拍照', '油皮持妆'], metrics: { 遮瑕度: 1, 持妆度: 5, 控油度: 5, 保湿度: 1, 毛孔修饰: 4, 氧化程度: 1, 卡粉风险: 2 }
  },
  {
    id: 'flower-knows-cloud', brand: '花知晓', name: '骑士独角兽云朵蜜粉', category: '散粉', brandRegion: '中国', madeIn: '中国', price: 149, priceLabel: '130 - 160 元',
    image: productImages.compact, skins: ['混油皮', '混干皮', '敏感肌'], finish: '奶油肌', coverage: '低', wear: 6, oxidation: '低', rating: 4.3,
    shades: [{ name: '01 透明雾', tone: '中性调', lightness: '透明', suitable: '自然定妆' }, { name: '02 微光肤', tone: '暖调', lightness: '自然', suitable: '黄皮柔焦' }],
    note: '带出门补妆很方便，压住鼻翼油光也不会显得干。', pros: ['饼状设计方便携带', '妆感保留柔和光泽', '价格易入手'], cautions: ['大油皮午后可能需要补一次', '粉扑要定期清洁'], scenes: ['通勤', '补妆', '平价底妆'], metrics: { 遮瑕度: 1, 持妆度: 3, 控油度: 3, 保湿度: 3, 毛孔修饰: 3, 氧化程度: 1, 卡粉风险: 1 }
  },
  ...internationalFoundations,
  ...stage3Products,
].map(enrichProductRecord)

export const quickFilters = [
  { label: '油皮持妆', query: { skins: ['油皮'], minWear: 9 } },
  { label: '干皮奶油肌', query: { skins: ['干皮'], finishes: ['奶油肌'] } },
  { label: '适合黄皮', query: { keyword: '黄' } },
  { label: '通勤底妆', query: { scene: '通勤' } },
  { label: '高遮瑕', query: { coverages: ['高'] } },
  { label: '平价底妆', query: { maxPrice: 200 } }
]

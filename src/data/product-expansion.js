// 2026-11-19 产品库扩展导入记录。资料来自人工核验表与图片来源清单；不代表所有产品事实已核验。
// 2026-11-20 在线复核记录与人工表分层保存；访问受限不能推翻旧证据，也不能升级事实、评分或图片授权。

import { onlineVerificationSnapshot } from './product-online-verification.js'
import { editorialSampleProfiles } from './product-editorial-samples.js'
import { productShadeCatalog } from './product-shades.js'

export const productExpansionSource = {
  "importedAt": "2026-11-19",
  "issueId": "YAS-2026-0056",
  "includedSequence": {
    "from": "36",
    "to": "111",
    "count": 76
  },
  "sourceWorkbook": {
    "path": "产品核验信息/YasPretty-111款产品淘宝人工核验表.xlsx",
    "sheet": "淘宝人工核验",
    "range": "A41:S116",
    "sha256": "0E43339CBE2E221FFA7F12E96A5FDD9A84B35BF6B56BEC3FF2AA42929857A8CA",
    "bytes": 38928
  },
  "imageManifest": {
    "path": "YasPretty产品图片/来源清单.csv",
    "sequenceRange": "36-111",
    "sha256": "AA91F9A97B874B8C1AC993FE315B0366BD5B80544A5FC8908020328284743F9F",
    "bytes": 94261
  },
  "categoryMapping": {
    "素颜霜": "素颜霜",
    "隔离": "隔离",
    "有色面霜": "有色面霜",
    "眉笔": "眉妆",
    "眉粉": "眉妆",
    "染眉膏": "眉妆",
    "眼影盘": "眼影",
    "眼影棒": "眼影",
    "眼线笔": "眼线",
    "睫毛膏": "睫毛膏",
    "腮红": "腮红",
    "口红": "唇妆",
    "修容": "修容"
  },
  "categoryCounts": {
    "素颜霜": 7,
    "隔离": 2,
    "有色面霜": 1,
    "眉妆": 10,
    "眼影": 10,
    "眼线": 6,
    "睫毛膏": 6,
    "腮红": 10,
    "唇妆": 16,
    "修容": 8
  },
  "imageAuthorization": {
    "authorizationStatus": "pending",
    "allowedUse": "public_with_source_notice",
    "publicCoverImported": true,
    "count": 76
  },
  "dataBoundary": [
    "已记录：品牌、商品名称、品类映射、官方旗舰店字段、规格、参考原价、商品链接、核验日期和证据路径。",
    "待核验：适用肤质、遮瑕度、持妆、氧化、评分、参数截图未明确列示的妆效/色号/产地、肤色适配、图片授权和独立实测结论；截图明确字段仅作来源转录。",
    "新增记录的商品事实状态按人工核验表标记为 verified 并开放推荐；适用肤质、遮瑕、持妆、氧化、评分、色号适配和图片授权仍待专项核验，公开封面只表示来源已披露。",
    "2026-11-20 已逐款在线复核 catalog-036 至 catalog-111；76 款均未取得可支持商品事实或适用条件的合格直接页面，supportedFields 均为空，未生成评分；推荐开放依据人工核验表与参数截图，色号推荐仍关闭。"
  ]
}

const expansionAdditionalRecords = [
  {
    id: 'catalog-036', sequence: '36', brand: '蒂佳婷', productName: '蒂佳婷 V7 素颜霜', officialProductName: 'Brightamin V7 Toning Light Cream（브라이타민 브이세븐 토닝 라이트 크림）', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: '蒂佳婷小橘灯素颜霜持证美白去黄去暗沉韩系伪素颜', officialStoreName: 'DrJart蒂佳婷官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '焕碧贸易（上海）有限公司', specification: '50ml', listPrice: 119, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=539411056701', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/36 DrJart蒂佳婷官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/36 焕碧贸易（上海）有限公司（蒂佳婷 V7 素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/36蒂佳婷 V7 素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/36-drjart-v7-蒂佳婷/cover.jpg', sourcePageUrl: 'https://www.drjart.co.kr/product/52295/139480/brightamin/-', originalImageUrl: 'https://aka.doubaocdn.com/l/grbr4BbJRU', sourcePriority: 'brand_official', rightsholder: 'Dr.Jart+（Kolmar Korea）', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 1000, height: 1000, format: 'JPEG', bytes: 49912, note: '品牌韩国官网商品图经转存；白底整罐正面，50mL，新版 Brightamin V7 系列。' }
  },
  {
    id: 'catalog-037', sequence: '37', brand: '薇诺娜', productName: '薇诺娜水光裸肌素颜霜', officialProductName: '水光裸肌素颜霜 50g（MAKEUP Healthy Glam Series，Tone-Up Cream）', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: '薇诺娜防晒素颜霜 高倍防护保湿乳液妆前乳通勤', officialStoreName: '薇诺娜官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '昆明贝泰妮电子商务有限公司', specification: '30g', listPrice: 89, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=1042651484723', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/37 薇诺娜官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/37 昆明贝泰妮电子商务有限公司（薇诺娜水光裸肌素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/37薇诺娜水光裸肌素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/37-winona-薇诺娜/cover.jpg', sourcePageUrl: 'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?origin_type=old_h5&id=3781016515738993438', originalImageUrl: 'https://aka.doubaocdn.com/l/5KrLt3ME9C', sourcePriority: 'retailer', rightsholder: '薇诺娜 Winona（贝泰妮集团）', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 1000, height: 1000, format: 'JPEG', bytes: 33864, note: '品牌白底产品图来自正规零售商品页，未将营销描述当作功效结论。' }
  },
  {
    id: 'catalog-038', sequence: '38', brand: '尔木萄', productName: '尔木萄素颜霜', officialProductName: '柔光焕颜持妆隔离霜（SKIN LIKE TINTED MOISTURIZER）30ml', category: '隔离', sourceCategory: '素颜霜/隔离', marketplaceTitle: '尔木萄隔离霜妆前乳提亮肤色脸部打底持妆保湿素颜霜女学生新手', officialStoreName: 'AMORTALS尔木萄官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '安徽端醇电子商务有限公司', specification: '30ml', listPrice: 59, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=624671958461', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/38 AMORTALS尔木萄官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/38安徽端醇电子商务有限公司（尔木萄素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/38尔木萄素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/38-amortals-尔木萄/cover.jpg', sourcePageUrl: 'https://m.yami.com/zh/p/soft-light-brightening-makeup-isolation-cream/1023498731', originalImageUrl: 'https://aka.doubaocdn.com/l/YbrmOVuf5u', sourcePriority: 'retailer', rightsholder: '尔木萄 Amortals', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 800, height: 800, format: 'JPEG', bytes: 31350, note: '白底单管图来自跨境零售商商品页，原图放大至 800×800 未增加细节。' }
  },
  {
    id: 'catalog-039', sequence: '39', brand: 'CPB', productName: 'CPB 光采隔离素颜霜', officialProductName: 'Correcting Cream Veil（VOILE CRÈME CORRECTEUR，SPF25 PA++）', category: '隔离', sourceCategory: '隔离/有色面霜', marketplaceTitle: '【星愿成真限定】肌肤之钥CPB长管隔离光凝润采妆前霜底妆遮瑕', officialStoreName: '肌肤之钥官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '资生堂（中国）投资有限公司', specification: '37ml', listPrice: 510, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=533073621218', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/39 肌肤之钥官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/39 资生堂（中国）投资有限公司（CPB 光采隔离素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/39CPB 光采隔离素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/39-cpb-光采隔离/cover.jpg', sourcePageUrl: 'https://www.cledepeaubeaute.co.uk/products/correcting-cream-veil-10116182302', originalImageUrl: 'https://aka.doubaocdn.com/l/SaA7OUOL8i', sourcePriority: 'brand_official', rightsholder: 'Clé de Peau Beauté（资生堂集团）', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 600, height: 600, format: 'JPEG', bytes: 12627, note: '英国官网商品图，图面标注 SPF25 PA++；长边 600px。' }
  },
  {
    id: 'catalog-040', sequence: '40', brand: 'JNJE', productName: 'JNJE 素颜霜', officialProductName: 'JNJE 光感焕靓素颜霜（包装英文 SKIN-NOURISHING AND LONG-LASTING FOUNDATION CREAM）', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: 'JNJE光感焕靓素颜霜伪素颜自然不假白清透持妆裸妆学生提亮面部', officialStoreName: 'JNJE品牌店', officialStoreFlag: '否', officialMarkerType: '两者都有', businessEntity: '济南槐荫兰娇尔电子商务中心(个体工商户)', specification: '50g', listPrice: 79, priceNote: '最终价格以结算页实际显示为准', productUrl: null, verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/40 JNJE品牌店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/40 济南槐荫兰娇尔电子商务中心(个体工商户)（JNJE 素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/40JNJE 素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/40-jnje/cover.jpg', sourcePageUrl: 'https://au.world.taobao.com/product/%E9%9D%92%E9%9D%92%E5%90%8C%E6%AC%BE.htm', originalImageUrl: 'https://p26-doubao-search-sign.byteimg.com/labis/image/2036781d4ea3caf37d88c9fd4690cc6c~tplv-be4g95zd3a-image.jpeg', sourcePriority: 'retailer', rightsholder: 'JNJE（第三方淘宝店铺，非官方旗舰店直供）', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 540, height: 1165, format: 'JPEG', bytes: 66263, note: '第三方淘宝店铺素材，非官方旗舰店直供；不得展示购买入口。' }
  },
  {
    id: 'catalog-041', sequence: '41', brand: '丝芙兰', productName: '丝芙兰柠檬籽元气霜', officialProductName: '丝芙兰透亮元气霜（柠檬籽系列，元气霜3.0版 / Glowing tone-up cream）50g', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: 'Sephora/丝芙兰柠檬籽元气霜身体素颜霜懒人霜脸部遮瑕男女士', officialStoreName: 'SEPHORA丝芙兰官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '丝芙兰（上海）化妆品销售有限公司', specification: '50g', listPrice: 169, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=566663437612', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/41 SEPHORA丝芙兰官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/41丝芙兰（上海）化妆品销售有限公司（丝芙兰柠檬籽元气霜）.png', detailEvidencePath: '产品核验信息/商品详情页/41丝芙兰柠檬籽元气霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/41-sephora-柠檬籽/cover.jpg', sourcePageUrl: 'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?origin_type=old_h5&id=3720962734704164918', originalImageUrl: 'https://p3-doubao-search-sign.byteimg.com/ecom-shop-material/lnnpIMza_m_c9639f83f6c1d75fd289bf13ca450dba_sx_47912_www800-800~tplv-be4g95zd3a-image.jpeg', sourcePriority: 'retailer', rightsholder: 'SEPHORA Collection（丝芙兰自有品牌）', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 800, height: 800, format: 'JPEG', bytes: 47912, note: '白底整罐图来自正规零售商品页，图面可见 SEPHORA COLLECTION 与 50g。' }
  },
  {
    id: 'catalog-042', sequence: '42', brand: 'WLAB', productName: 'WLAB 素颜霜', officialProductName: 'WHITE HOLIC QUICK WHITENING CREAM（화이트홀릭 퀵 화이트닝 크림）50ml', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: 'W.Lab大福留韩国白雪公主亮白素颜霜自然裸妆脸部防晒乳官方正品', officialStoreName: 'W.Lab海外旗舰店', officialStoreFlag: '海外旗舰店', officialMarkerType: '两者都有', businessEntity: 'IBT Korea', specification: '50ml', listPrice: 61, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.hk/hk/item.htm?id=737427257712', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/42 W.Lab海外旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/42 IBT Korea（WLAB 素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/42WLAB 素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/42-wlab/cover.jpg', sourcePageUrl: 'https://www.wlab.co.kr/goods/goods_view.php?goodsNo=1000000031', originalImageUrl: 'https://godomall-storage.cdn-nhncommerce.com/096e440ec232d64e8d790204b2355bf1/goods/1000000031/image/magnify/1000000031_magnify_040.jpg', sourcePriority: 'brand_official', rightsholder: 'W.Lab（주식회사 아이비티코리아 / IBT Korea）', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 1800, height: 2225, format: 'JPEG', bytes: 436526, note: '韩国品牌官网商品页主图，浅米灰背景带倒影。' }
  },
  {
    id: 'catalog-043', sequence: '43', brand: '宝玑米', productName: '宝玑米素颜霜', officialProductName: 'PULJIM宝玑米沁透防晒素颜霜 柔雾紫 100g', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: '宝玑米身体素颜霜面部全身防晒隔离遮瑕三合一提亮防水防汗学生党', officialStoreName: 'puljim宝玑米旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '安徽宝玑米电子商务有限公司', specification: '100g', listPrice: 59, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=708417867826', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/43 puljim宝玑米旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/43 安徽宝玑米电子商务有限公司 （宝玑米素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/43-baojimi-宝玑米/cover.jpg', sourcePageUrl: 'https://beaut.taobao.com/topic/geli_2/18cda0801cdf98816dcc281b0ef02f52.html', originalImageUrl: 'https://img.alicdn.com/imgextra/i3/595376039/O1CN0100q1Kp1uTuzAJQyFj_!!595376039.jpg', sourcePriority: 'retailer', rightsholder: 'PULJIM宝玑米', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 1440, height: 1440, format: 'JPEG', bytes: 60821, note: '淘宝美妆频道商品图，图面可见柔雾紫版本；非品牌官网直采。' }
  },
  {
    id: 'catalog-044', sequence: '44', brand: '卡姿兰', productName: '卡姿兰素颜霜', officialProductName: '卡姿兰明星素颜霜（水润版）All-star Tone Up Cream 50g', category: '素颜霜', sourceCategory: '素颜霜/隔离', marketplaceTitle: '卡姿兰明星素颜霜脸部自然提亮肤色裸妆懒人霜女养肤面霜隔离干皮', officialStoreName: '卡姿兰官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '芜湖华穗贸易有限公司', specification: '50g', listPrice: 87, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=539413113746', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/44 卡姿兰官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/44芜湖华穗贸易有限公司（卡姿兰素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/44卡姿兰素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/44-carslan-卡姿兰/cover.png', sourcePageUrl: 'http://www.carslan.com.cn/qita/83', originalImageUrl: 'http://www.carslan.com.cn/uploads/upload/images/20241220/6f28835bdbe2f7582e1aa6952c92a921.png', sourcePriority: 'brand_official', rightsholder: 'Carslan 卡姿兰', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 734, height: 790, format: 'PNG', bytes: 88065, note: '卡姿兰官网产品页主图，水润版；图面记录为 01 水润雪肌。' }
  },
  {
    id: 'catalog-045', sequence: '45', brand: 'NARS', productName: 'NARS 有色素颜霜', officialProductName: 'Pure Radiant Tinted Moisturizer SPF 30/PA+++（色号 Mykonos M0 中性调 Medium 0）', category: '有色面霜', sourceCategory: '有色面霜', marketplaceTitle: 'NARS大白隔离妆前提亮保湿水润服贴防晒素颜霜', officialStoreName: 'NARS官方旗舰店', officialStoreFlag: '是', officialMarkerType: '两者都有', businessEntity: '资生堂（中国）投资有限公司', specification: '30ml', listPrice: 365, priceNote: '最终价格以结算页实际显示为准', productUrl: 'https://detail.tmall.com/item.htm?id=861967549487', verifiedAt: '2026-11-17', reviewStatus: '已完成', storeEvidencePath: '产品核验信息/店铺首页截图/45 NARS官方旗舰店.jpg', qualificationEvidencePath: '产品核验信息/企业工商资质/45资生堂（中国）投资有限公司（NARS 有色素颜霜）.png', detailEvidencePath: '产品核验信息/商品详情页/45NARS 有色素颜霜', image: { localPath: 'YasPretty产品图片/素颜霜图片/素颜霜官方图片/45-nars/cover.jpg', sourcePageUrl: 'https://www.narscosmetics.eu/en/pure-radiant-tinted-moisturiser-spf-30-pa/0194251013336.html', originalImageUrl: 'https://www.narscosmetics.eu/dw/image/v2/BCMQ_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dwee0d8792/hi-res/PRTM21/MYKONOS.jpg?sw=1000&sh=1000&sm=fit', sourcePriority: 'brand_official', rightsholder: 'NARS Cosmetics', authorizationStatus: 'pending', allowedUse: 'public_with_source_notice', acquiredAt: '2026-11-18', width: 1000, height: 1000, format: 'JPEG', bytes: 45993, note: 'NARS 欧洲站产品页主图，记录 Mykonos M0、SPF30/PA+++ 与 50ml。' }
  },
]

const existingExpansionRecords = [
  {
    "id": "catalog-046",
    "sequence": "46",
    "brand": "植村秀",
    "productName": "经典砍刀眉笔",
    "officialProductName": "Hard Formula H9 经典砍刀眉笔",
    "category": "眉妆",
    "sourceCategory": "眉笔",
    "marketplaceTitle": "植村秀眉笔经典砍刀眉笔持久防水不脱色自然野生",
    "officialStoreName": "shu uemura植村秀官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "3.3g",
    "listPrice": 240,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=528271120914",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/46 shu uemura植村秀官方旗舰店（经典砍刀眉笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/46欧莱雅（中国）有限公司广东分公司（植村秀经典砍刀眉笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/46 植村秀经典砍刀眉笔",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/46-shu-经典砍刀眉笔/cover.jpg",
      "sourcePageUrl": "https://www.shuuemura-usa.com/p/hard-formula-eyebrow-pencil/14869422/",
      "originalImageUrl": "https://static.thcdn.com/productimg/original/14869422-1695140077880575.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "植村秀 shu uemura（欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 2000,
      "height": 2000,
      "format": "JPEG",
      "bytes": 45543,
      "note": "天猫商品 id=528271120914；店铺代号 S01；官方旗舰店 shuuemura.tmall.com；天猫商品页为登录墙/JS 渲染，curl 仅得 5464 字节跳转页，未能从旗舰店直采主图；后改由植村秀美国官网 shuuemura-usa.com 产品页 og:image 取得品牌官方白底原图（THG CDN 托管），brand_official 品牌官网来源；单支 Hard Formula H9 经典砍刀眉笔整支（笔杆+削出的砍刀笔尖），纯白底，无人物、无促销角标；官网该 SKU 为 #13 chest brown 栗棕，图面笔身呈深灰褐色；分辨率 2000×2000。"
    }
  },
  {
    "id": "catalog-047",
    "sequence": "47",
    "brand": "植村秀",
    "productName": "自动砍刀眉笔",
    "officialProductName": "自动砍刀眉笔（Automatic Brow Pencil）",
    "category": "眉妆",
    "sourceCategory": "眉笔",
    "marketplaceTitle": "植村秀自动砍刀眉笔女自然持久不脱色防水防汗",
    "officialStoreName": "shu uemura植村秀官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "0.3g",
    "listPrice": 220,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=670611812251",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/47 shu uemura植村秀官方旗舰店（自动砍刀眉笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/47欧莱雅（中国）有限公司广东分公司（植村秀自动砍刀眉笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/47 植村秀自动砍刀眉笔",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/47-shu-自动砍刀眉笔/cover.jpg",
      "sourcePageUrl": "https://www.am10.com/QJrnnInnfzM4CZ58GZ5j_Y5b_L6/jg",
      "originalImageUrl": "https://aka.doubaocdn.com/l/7eeNyMpVzG",
      "sourcePriority": "retailer",
      "rightsholder": "植村秀 shu uemura（欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 18931,
      "note": "天猫商品 id=670611812251；店铺代号 S01；官方旗舰店 shuuemura.tmall.com；天猫登录墙未能直采；降级为导购聚合页收录的品牌白底图，非官方旗舰店直采；自动旋转款整支+笔盖同框，黑色笔杆印 shu uemura，砍刀笔尖，纯白底，无人物、无角标；色号图面未标注；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-048",
    "sequence": "48",
    "brand": "橘朵",
    "productName": "砍刀眉笔",
    "officialProductName": "柔焦雾感砍刀眉笔（双头砍刀眉笔 1.8g）",
    "category": "眉妆",
    "sourceCategory": "眉笔",
    "marketplaceTitle": "Judydoll橘朵砍刀眉笔持久防水不脱色眉膏眉粉新手",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "1.8g",
    "listPrice": 29.8,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=586027108988",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/48 JUDYDOLL橘朵旗舰店（砍刀眉笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/48上海橘朵化妆品有限公司（橘朵砍刀眉笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/48 橘朵砍刀眉笔",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/48-judydoll-砍刀眉笔/cover.jpg",
      "sourcePageUrl": "https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?origin_type=old_h5&id=3565447505565070802",
      "originalImageUrl": "https://aka.doubaocdn.com/l/V5FM8Ww250",
      "sourcePriority": "retailer",
      "rightsholder": "橘朵 JUDYDOLL",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 49221,
      "note": "天猫商品 id=586027108988；店铺代号 S02；官方旗舰店 judydoll.world.tmall.com；天猫登录墙未能直采；降级为抖音商城第三方店铺（遇见海美妆商店）商品图，非官方旗舰店直采；图为同一支双头砍刀眉笔正反两面同框（砍刀笔头+螺旋眉刷），白底，无人物；色号图面未标注（该款 #01灰棕/#02深棕/#03苔绿/#04栗棕 多色可选）；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-049",
    "sequence": "49",
    "brand": "橘朵",
    "productName": "精塑自动眉笔",
    "officialProductName": "精塑自动眉笔（Precision Sculpting Eyebrow Pencil）",
    "category": "眉妆",
    "sourceCategory": "眉笔",
    "marketplaceTitle": "Judydoll橘朵精塑自动眉笔棕色眉膏自然持久防水",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "120mg",
    "listPrice": 33.2,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=987838442961",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/49 JUDYDOLL橘朵旗舰店（精塑自动眉笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/49上海橘朵化妆品有限公司（橘朵精塑自动眉笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/49 橘朵精塑自动眉笔",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/49-judydoll-精塑自动眉笔/cover.jpg",
      "sourcePageUrl": "https://www.fancylife.com.au/zh/products/420542429393171376",
      "originalImageUrl": "https://aka.doubaocdn.com/l/VdvauXPNTC",
      "sourcePriority": "retailer",
      "rightsholder": "橘朵 JUDYDOLL",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 690,
      "height": 690,
      "format": "JPEG",
      "bytes": 17142,
      "note": "天猫商品 id=987838442961；店铺代号 S02；官方旗舰店 judydoll.world.tmall.com；天猫登录墙未能直采；judydoll.com 官网与零售商商品页 HTML 均被拦截，未能直接提取原图；降级为澳洲零售商 Fancylife 收录的品牌白底图，非官方旗舰店直采；自动细头款整支+笔盖同框，银灰笔杆印 JUDYDOLL，尾部螺旋眉刷，白底，无人物、无角标；色号 #01 烟灰；本轮已尝试补高清（官网/京东/聚合图）未果，分辨率 690×690 仍低于 800px 建议值，建议后续补图。"
    }
  },
  {
    "id": "catalog-050",
    "sequence": "50",
    "brand": "橘朵",
    "productName": "染眉膏",
    "officialProductName": "气垫梳染眉膏（眉眉棒 / Eyebrow Mascara）",
    "category": "眉妆",
    "sourceCategory": "染眉膏",
    "marketplaceTitle": "Judydoll橘朵染眉膏浅色自然眉笔持久防水不脱色",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "2.5g",
    "listPrice": 35.1,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=610611222348",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/50 JUDYDOLL橘朵旗舰店（染眉膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/50上海橘朵化妆品有限公司（橘朵染眉膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/50 橘朵染眉膏",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/50-judydoll-染眉膏/cover.jpg",
      "sourcePageUrl": "https://detail.tmall.com/item.htm?id=610611222348",
      "originalImageUrl": "https://cbu01.alicdn.com/img/ibank/O1CN01gx1q3i1JyTWkv4UNe_!!2216102841097-0-cib.jpg",
      "sourcePriority": "retailer",
      "rightsholder": "橘朵 JUDYDOLL",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 40562,
      "note": "天猫商品 id=610611222348；店铺代号 S02；官方旗舰店 judydoll.world.tmall.com；天猫商品页为登录墙/JS 渲染，curl 仅得跳转页，未能从旗舰店直采主图；judydoll.com 官网被限流拦截、京东同款页主图为广告拼图，均未取得干净白底整支图；降级为 1688 阿里巴巴同款授权商品页（retailer 第三方货源，非官方旗舰店直采）收录的品牌产品图；图为整支染眉膏膏管+拔出的刷头盖同框（管身印 JUDYDOLL），纯白底，无人物、无促销角标；色号图面未标注（该款 #001 灰棕/#002 自然棕/#03 灰棕等多色可选）；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-051",
    "sequence": "51",
    "brand": "花西子",
    "productName": "首乌眉粉笔",
    "officialProductName": "螺黛生花首乌眉粉笔（砍刀纤细版）",
    "category": "眉妆",
    "sourceCategory": "眉笔",
    "marketplaceTitle": "花西子首乌眉粉笔 持久防水汗持色新手友好眉笔野生眉根根分明",
    "officialStoreName": "花西子旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州宜格化妆品有限公司",
    "specification": "80mg*2",
    "listPrice": 81.2,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=563422855497",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/51 花西子旗舰店（首乌眉粉笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/51杭州宜格化妆品有限公司（花西子首乌眉粉笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/51 花西子首乌眉粉笔",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/51-huaxizi-首乌眉粉笔/cover.jpg",
      "sourcePageUrl": "https://detail.tmall.com/item.htm?id=563422855497",
      "originalImageUrl": "https://imgservice.suning.cn/uimg1/b2c/image/VR4ytPZLOt3uA6E5hNPPgA.jpg",
      "sourcePriority": "retailer",
      "rightsholder": "花西子 Florasis / Huaxizi",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 1000,
      "format": "JPEG",
      "bytes": 26809,
      "note": "天猫商品 id=563422855497；店铺代号 S03；官方旗舰店 huaxizi.tmall.com；天猫登录墙未能直采；florasis.com Shopify 站被限流；花西子官网 huaxizi.cn 首页仅收录一张棕色背景场景图；降级为苏宁易购商品大图页（retailer 正规零售商，非官方旗舰店直采）；图为整支眉粉笔+同色笔盖同框，花西子典型墨绿东方纹样笔身、玫瑰金细环；非纯白底，为棕色眉粉背景搭配配方/双效文案排版图，背景与文字信息较多，未取得干净白底单品图，建议后续补白底整支图；色号 MF03 螺黛褐（深棕色，图面笔身标注 MF03）；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-052",
    "sequence": "52",
    "brand": "完美日记",
    "productName": "双头六角眉笔",
    "officialProductName": "双头六角眉笔（Hexagon Dual-Ended Eyebrow Pencil）",
    "category": "眉妆",
    "sourceCategory": "眉笔",
    "marketplaceTitle": "完美日记双头六角眉笔眉粉防水防汗持久不脱妆自然立体棕色初学者",
    "officialStoreName": "perfectdiary旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "广州逸仙电子商务有限公司",
    "specification": "0.28g",
    "listPrice": 44,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=558196853243",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/52 perfectdiary旗舰店（双头六角眉笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/52广州逸仙电子商务有限公司（完美日记双头六角眉笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/52 完美日记双头六角眉笔",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/52-perfectdiary-双头六角眉笔/cover.jpg",
      "sourcePageUrl": "https://detail.tmall.com/item.htm?id=558196853243",
      "originalImageUrl": "https://imgservice.suning.cn/uimg1/b2c/image/iDdzwpRguCvNQYIOlWz1Ag.jpg",
      "sourcePriority": "retailer",
      "rightsholder": "完美日记 Perfect Diary",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 44530,
      "note": "天猫商品 id=558196853243；店铺代号 S04；官方旗舰店 perfectdiary.tmall.com；天猫登录墙未能直采；perfectdiary.com 官网被限流；降级为苏宁易购商品大图页（retailer 正规零售商，非官方旗舰店直采）；图为整支双头六角眉笔+笔盖同框（六角眉笔头+尾部螺旋眉刷，黑色笔杆印 PERFECT DIARY），纯白底，无人物、无角标；色号图面未标注（黑色款，该款多色可选）；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-053",
    "sequence": "53",
    "brand": "卡姿兰",
    "productName": "眉粉",
    "officialProductName": "高分造型眉妆盘（Eyebrow Styling Compact）三色眉粉 02#月晕如烟",
    "category": "眉妆",
    "sourceCategory": "眉粉",
    "marketplaceTitle": "卡姿兰眉粉防水防汗不脱色官方旗舰店正品不脱妆眉膏二合一",
    "officialStoreName": "卡姿兰官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "芜湖华穗贸易有限公司",
    "specification": "3.6g",
    "listPrice": 84,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=551485596256",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/53 卡姿兰官方旗舰店（眉粉）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/53芜湖华穗贸易有限公司（卡姿兰眉粉）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/53 卡姿兰眉粉",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/53-carslan-眉粉/cover.jpg",
      "sourcePageUrl": "https://m.yqb.com/mall/search/items?WT.mc_id=000009990090029B&mcId=170314181627-cmh023&q=%E5%8D%A1%E5%A7%BF%E5%85%B0",
      "originalImageUrl": "https://aka.doubaocdn.com/l/n6QBcXyfG8",
      "sourcePriority": "retailer",
      "rightsholder": "Carslan 卡姿兰",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 73021,
      "note": "天猫商品 id=551485596256；店铺代号 S05；官方旗舰店 carslan.tmall.com；天猫商品页为登录墙/JS 渲染，curl 源码未取到 img.alicdn.com 主图；品牌官网 carslan.com.cn 自然眉妆分类仅列眉笔、无该眉粉条目；降级为零售商（京东直供联营商品聚合页 yqb）收录的品牌白底产品图，非官方旗舰店直采；整盘开盖正面，三色眉粉+刀锋刷+螺旋刷同框，玫瑰金盒盖印 CARSLAN，纯白底，无人物、无促销角标、无水印；02#月晕如烟（自然棕调）；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-054",
    "sequence": "54",
    "brand": "深蓝彩妆",
    "productName": "黑魅双色眉粉",
    "officialProductName": "黑魅双色眉粉 02#（棕灰色+浅棕色）3.6g",
    "category": "眉妆",
    "sourceCategory": "眉粉",
    "marketplaceTitle": "深蓝黑魅双色眉粉盘女自然不易脱色持久灰色棕色初学者新手眉笔刷",
    "officialStoreName": "深蓝彩妆旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海深蓝化妆品有限公司",
    "specification": "3.6g",
    "listPrice": 178,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=42566735329",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/54 深蓝彩妆旗舰店（黑魅双色眉粉）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/54上海深蓝化妆品有限公司（深蓝彩妆黑魅双色眉粉）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/54 深蓝彩妆黑魅双色眉粉",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/54-shenlan-黑魅双色眉粉/cover.jpg",
      "sourcePageUrl": "https://www.am10.com/ymI6wG45JK75Jy55Uy65Jy55/jg",
      "originalImageUrl": "https://aka.doubaocdn.com/l/ZUt6SRD8CP",
      "sourcePriority": "retailer",
      "rightsholder": "深蓝彩妆 BLEUNUIT",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 74999,
      "note": "天猫商品 id=42566735329；店铺代号 S14；官方旗舰店 shenlancaizhuang.tmall.com；天猫登录墙未能直采；未检索到品牌官网可直采的白底主图；降级为导购聚合页收录的品牌白底图，非官方旗舰店直采；整盒开盖正面，双三角色+内置眉刷，黑色方盒，盒盖印 BLEUNUIT，纯白底，无人物、无促销文字、无水印；02#棕灰色+浅棕色，3.6g/盒；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-055",
    "sequence": "55",
    "brand": "玛丽黛佳",
    "productName": "三色眉粉",
    "officialProductName": "印象女主角三色眉粉 BR-2 深棕色 3.3g",
    "category": "眉妆",
    "sourceCategory": "眉粉",
    "marketplaceTitle": "玛丽黛佳三色眉粉不易脱色持久显色立体修容高光眼影鼻影一体正品",
    "officialStoreName": "玛丽黛佳旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海震亮化妆品有限公司",
    "specification": "3.3g",
    "listPrice": 58,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=10738927092",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/55 玛丽黛佳旗舰店（三色眉粉）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/55上海震亮化妆品有限公司（玛丽黛佳三色眉粉）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/55 玛丽黛佳三色眉粉",
    "image": {
      "localPath": "YasPretty产品图片/眉部产品图片/55-mariedalgar-三色眉粉/cover.jpg",
      "sourcePageUrl": "https://www.am10.com/art-Jy557S550Cr5yiZ6JK75Jy55.htm",
      "originalImageUrl": "https://aka.doubaocdn.com/l/zYMArkfEDV",
      "sourcePriority": "retailer",
      "rightsholder": "玛丽黛佳 MARIE DALGAR",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-18",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 36733,
      "note": "天猫商品 id=10738927092；店铺代号 S15；官方旗舰店 mariedalgar.tmall.com；天猫登录墙未能直采；品牌官网未取到该单品白底主图；降级为导购聚合页收录的天猫超市商品白底图，非官方旗舰店直采；整盘开盖正面，高光+中棕+深棕三色+双头刷同框，黑色长方盒，纯白底，无人物、无角标、无色号标注文字；BR-2 深棕色，3.3g；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-056",
    "sequence": "56",
    "brand": "3CE",
    "productName": "九色时妆盘",
    "officialProductName": "Multi Eye Color Palette 九色眼影盘（#OVERTAKE 暖棕盘）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "3CE时妆盘九宫格眼影橘棕盘黄油盘缎光粉盗梦粉Z",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "8g",
    "listPrice": 245,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=589371456351",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/56 3CE官方旗舰店（九色时妆盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/56欧莱雅（中国）有限公司广东分公司（3CE九色时妆盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/56 3CE九色时妆盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/56-3ce-九色时妆盘/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.com/all-products/eyes/eyeshadow/3ce-multi-eye-color-palette",
      "originalImageUrl": "https://www.3cecosmetics.com/-/media/project/loreal/brand-sites/tce/apac/int/en-image-assets/all-prouducts/eyes/eyeshadow/multi-eye-color-palette/overtake/low_100/multi-eye-color-palette_overtake_pdp_pck_2.jpg?rev=c229f08694e14f5abc2fdf4148bc0a91",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE Stylenanda（NANDA）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 92103,
      "note": "品牌官网直采：3CE 全球官网 3cecosmetics.com 产品页资源（L'Oréal Sitecore CDN 托管），非天猫旗舰店（detail.tmall.com 登录墙/JS 渲染，curl 仅得跳转页，未取到 img.alicdn.com 主图）；色号 #Overtake（经典暖棕玫瑰盘，官方主推 BEST 色号之一）；整盘开盖正面，九宫格 9 色块全部可见，浅灰白纹理底，无人物、无促销角标；图为开盖状态，盒盖外翻；分辨率 760×960，长边 960px，低于 800px 建议值为宽边、长边达标。"
    }
  },
  {
    "id": "catalog-057",
    "sequence": "57",
    "brand": "3CE",
    "productName": "四色眼影盘",
    "officialProductName": "Mini Multi Eye Color Palette 四色眼影盘（#Side by Side）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "3CE四色眼影盘 哑光大地色燕麦拿铁珠光粉钻便携 T",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "3.2g",
    "listPrice": 160,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=628339011764",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/57 3CE官方旗舰店（四色眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/57欧莱雅（中国）有限公司广东分公司（3CE四色眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/57 3CE四色眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/57-3ce-四色眼影盘/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.com/all-products/eyes/eyeshadow/3ce-mini-multi-eye-color-palette",
      "originalImageUrl": "https://www.3cecosmetics.com/-/media/project/loreal/brand-sites/tce/apac/int/en-image-assets/all-prouducts/eyes/eyeshadow/mini-multi-eye-color-palette/side-by-side/mini-multi-eye-color-palette_side-by-side_pdp_pck_2.jpg?rev=53a858003bd04b119d9a7b58489e9fad",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE Stylenanda（NANDA）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 113189,
      "note": "品牌官网直采：3CE 全球官网 3cecosmetics.com 产品页资源（L'Oréal Sitecore CDN 托管），非天猫旗舰店（登录墙/JS 渲染未取到主图）；色号 #Side by Side（蜜桃暖棕四色，该系列另有 Brown Rum/Casual Talk 等）；整盘开盖正面，2×2 共 4 色块全部可见，浅灰白纹理底，无人物、无促销角标；图为开盖状态，盒盖外翻；分辨率 760×960。"
    }
  },
  {
    "id": "catalog-058",
    "sequence": "58",
    "brand": "3CE",
    "productName": "十二色眼影盘",
    "officialProductName": "New Take Eye Shadow Palette 十二色眼影盘（#Raw Neutrals 水泥盘/大地原棕）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "3CE 12色眼影盘水泥盘大地色女生日礼物官方彩妆",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "9.5g",
    "listPrice": 319,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=695350539488",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/58 3CE官方旗舰店（十二色眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/58欧莱雅（中国）有限公司广东分公司（3CE十二色眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/58 3CE十二色眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/58-3ce-十二色眼影盘/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.co.kr/all-products/eyes/eyeshadow/3ce-new-take-eyeshadow-palette",
      "originalImageUrl": "https://www.3cecosmetics.co.kr/-/media/project/loreal/brand-sites/tce/apac/kr/en-image-assets/all-prouducts/eyes/eyeshadow/new-take-eye-shadow-palette/raw-neutrals/new-take--eyeshadow-palette_raw-neutrals_pdp_pck_2.jpg?rev=0f928c58ad7e4d5bbc2bef3bfc056efc",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE Stylenanda（NANDA）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 126601,
      "note": "品牌官网直采：3CE 韩国官网 3cecosmetics.co.kr 产品页资源（L'Oréal Sitecore CDN 托管）；该盘官方标注 12 shades（韩文官网明示 12 色，国内俗称水泥盘），色号 #Raw Neutrals（中性灰棕/大地原棕，主推日常大地色；同系列另有 Pink Journey/Motion Frame/Creative Filter）；整盘开盖正面，2 列×6 行共 12 色块全部可见，浅灰纹理底，无人物、无促销角标；图为开盖状态，盒盖外翻；分辨率 760×960；注：官网该系列另有 XL Eyeshadow Palette（25 色 Mood Shifter），与本款 12 色盘非同一产品，未采用。"
    }
  },
  {
    "id": "catalog-059",
    "sequence": "59",
    "brand": "橘朵",
    "productName": "玩趣七色眼影盘",
    "officialProductName": "Play Color All-in-One Palette 玩趣七色综合盘（#26 原木盘 Raw Wood）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "Judydoll橘朵玩趣眼影盘修容高光腮红卧蚕盘珠光哑光",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "8.5",
    "listPrice": 93.9,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=597894450019",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/59 JUDYDOLL橘朵旗舰店（玩趣七色眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/59上海橘朵化妆品有限公司（橘朵玩趣七色眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/59 橘朵玩趣七色眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/59-judydoll-玩趣七色眼影盘/cover.jpg",
      "sourcePageUrl": "https://m.yami.com/us/zh/p/fun-eyeshadow-palette-tangram-blush-highlighter-contouring-palette/5023511831",
      "originalImageUrl": "https://aka.doubaocdn.com/l/DhrXbMosRn",
      "sourcePriority": "retailer",
      "rightsholder": "橘朵 JUDYDOLL（JOY GROUP 悦己集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 750,
      "height": 750,
      "format": "JPEG",
      "bytes": 34541,
      "note": "天猫官方旗舰店 judydoll.world.tmall.com 为登录墙/JS 渲染，curl 未取到 img.alicdn.com 主图；橘朵海外官网 judydoll.com 商品页 curl 返回 HTTP 429 限流拦截，未能直采 Shopify CDN 官方主图；降级为海外零售商亚米 Yami 商品页（retailer 正规零售商，非官方旗舰店直采）收录的品牌白底产品图；色号 #26 原木盘 Raw Wood（原生木调/玫瑰奶咖，京东/亚米标注热卖榜 TOP1 主推大地色；该系列另有 #16 生椰拿铁/#17 甜薰玫瑰/#07 焦糖牛奶等多色可选）；单盘正面，6 小格+1 大腮红格共 7 色全部可见，透明外壳，纯白底，无人物、无促销角标；分辨率 750×750；原图为零售商品图，建议后续补品牌官网或旗舰店高清白底图。"
    }
  },
  {
    "id": "catalog-060",
    "sequence": "60",
    "brand": "完美日记",
    "productName": "探险家十二色动物眼影盘",
    "officialProductName": "Explorer 12-Color Eyeshadow Palette 探险家十二色动物眼影盘 09 猫咪盘",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "完美日记探险家十二色动物眼影盘小猪盘日常百搭礼物",
    "officialStoreName": "perfectdiary旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "广州逸仙电子商务有限公司",
    "specification": "14g",
    "listPrice": 129,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=586638729188",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/60 perfectdiary旗舰店（探险家十二色动物眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/60广州逸仙电子商务有限公司（完美日记探险家十二色动物眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/60 完美日记探险家十二色动物眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/60-perfectdiary-探险家十二色/cover.png",
      "sourcePageUrl": "https://fe.suning.com/bigimages/12449207968.html",
      "originalImageUrl": "https://imgservice.suning.cn/uimg1/b2c/image/AQtorG-9Z3OMGmERZvKtag.png",
      "sourcePriority": "retailer",
      "rightsholder": "完美日记 Perfect Diary",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "PNG",
      "bytes": 427263,
      "note": "完美日记官网 perfectdiary.com 商品页与 JSON 均返回 TOO_MANY_REQUESTS 限流；天猫旗舰店 detail.tmall.com 登录墙/JS 渲染未取到 img.alicdn.com 主图；降级苏宁易购国际大图页（retailer 正规零售商，非官方旗舰店直采）。色号 09 猫咪盘（白猫大地色系，Discovery 联名动物系列）。白底，上为闭合猫纹盒盖、下为开盖整盘 12 色块并附自带双头眼影刷，无人物、无手持；图下方有「猫咪盘」色号小字标注；分辨率 800×800，1:1；建议后续补一张无色号小字的官方纯品白底图。"
    }
  },
  {
    "id": "catalog-061",
    "sequence": "61",
    "brand": "完美日记",
    "productName": "三色速绘精华动物眼影棒",
    "officialProductName": "三色速绘精华动物眼影棒（动物系列三色眼影棒）#05 小猪杏粉（哑光）",
    "category": "眼影",
    "sourceCategory": "眼影棒",
    "marketplaceTitle": "完美日记三色速绘精华动物眼影棒高光卧蚕笔多用",
    "officialStoreName": "perfectdiary旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "广州逸仙电子商务有限公司",
    "specification": "2.8g",
    "listPrice": 100,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=884959066585",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/61 perfectdiary旗舰店（三色速绘精华动物眼影棒）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/61广州逸仙电子商务有限公司（完美日记三色速绘精华动物眼影棒）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/61 完美日记三色速绘精华动物眼影棒",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/61-perfectdiary-三色眼影棒/cover.jpg",
      "sourcePageUrl": "https://item.m.jd.com/product/10229270294326.html",
      "originalImageUrl": "https://img10.360buyimg.com/img/jfs/t1/515907/31/13024/60635/6aaa5ef6F20e496b2/00833203206cb228.jpg",
      "sourcePriority": "retailer",
      "rightsholder": "完美日记 Perfect Diary",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1500,
      "height": 1500,
      "format": "JPEG",
      "bytes": 147492,
      "note": "官网 perfectdiary.com 限流、天猫登录墙未直采；降级京东自营商品详情图（retailer 正规零售商，非官方旗舰店直采）。色号 #05 小猪杏粉（哑光，动物包装；该系列另有 02 猫咪灰棕/03 锦鲤粉棕/04 赤狐杏橘/06 橘猫金棕等）。图为单支眼影棒：露出斜切笔头+黑色笔管+独立笔盖同框，左侧为动物纹外包装盒；右侧配三色小样色块与眼部上眼效果图及色号文字；非手臂试色、非三支套装堆叠；分辨率 800×800，1:1；官方未提供单支纯白底纯品图，建议后续补图。"
    }
  },
  {
    "id": "catalog-062",
    "sequence": "62",
    "brand": "花知晓",
    "productName": "天鹅芭蕾六色眼影盘",
    "officialProductName": "Swan Ballet Six-Color Makeup Palette 天鹅芭蕾六色眼影盘 01 White Swan",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "花知晓天鹅芭蕾六色眼影盘哑光细闪珠光旗舰店",
    "officialStoreName": "花知晓旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州花知晓电子商务有限公司",
    "specification": "6.5g",
    "listPrice": 129,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=730937189224",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/62 花知晓旗舰店（天鹅芭蕾六色眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/62杭州花知晓电子商务有限公司（花知晓天鹅芭蕾六色眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/62 花知晓天鹅芭蕾六色眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/62-huazhixiao-天鹅芭蕾六色/cover.jpg",
      "sourcePageUrl": "https://flowerknows.co/products/swan-ballet-six-color-makeup-palette-us",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0593/5418/5889/files/b21429ffee0cfc658d96ab50fcaeff8e_539383f7-9cd4-4dca-8248-9fe815b5191a.jpg?v=1761982613",
      "sourcePriority": "brand_official",
      "rightsholder": "花知晓 Flower Knows",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1100,
      "height": 1375,
      "format": "JPEG",
      "bytes": 172115,
      "note": "品牌官网来源：花知晓海外官网 flowerknows.co（Shopify 站）商品集合页 Shopify CDN 官方主图（brand_official）；商品详情页被站点限流，图取自集合页主图直链。色号 01 White Swan 白天鹅（该系列另有 02 Black Swan/03 Pink Swan）。浅白底，上为闭合天鹅浮雕银白外壳、下为开盖六色全部可见，外壳完整，无人物、无促销角标；分辨率 1100×1375；同系列 02 Black Swan 暗色盘同款构图已获取但未采用。"
    }
  },
  {
    "id": "catalog-063",
    "sequence": "63",
    "brand": "NARS",
    "productName": "四色眼影盘",
    "officialProductName": "Quad Eyeshadow（Orgasm Quad 四色眼影盘）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "NARS四色眼影盘掌心盘圣保罗绝美温柔梅尔罗斯",
    "officialStoreName": "NARS官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "资生堂（中国）投资有限公司",
    "specification": "4.4g",
    "listPrice": 500,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=616701775278",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/63 NARS官方旗舰店（四色眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/63资生堂（中国）投资有限公司（NARS四色眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/63 NARS四色眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/63-nars-四色眼影盘/cover.jpg",
      "sourcePageUrl": "https://www.narscosmetics.com/USA/quad-eyeshadow/0194251026404.html?cgid=orgasm-collection",
      "originalImageUrl": "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dw08593c08/2021/May/Eye/0194251026404_soldier.jpg?sw=2000&sh=2000&sm=fit",
      "sourcePriority": "brand_official",
      "rightsholder": "NARS（资生堂集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 2000,
      "height": 2000,
      "format": "JPEG",
      "bytes": 391761,
      "note": "品牌官网直采：NARS 美国官网 narscosmetics.com PDP demandware.static 官方白底主图；色号 Orgasm Quad（ORGASM I 金闪 / II 浅粉香槟闪 / III 哑光珊瑚 / IV 金棕闪），4×1.2g（官网标注 0.04 oz×4，欧站标注合计 4.4g）；整盘开盖正面，2×2 四色块完整可见，黑壳白字 NARS，纯白底，无人物、无促销角标、无水印；分辨率 2000×2000；narscosmetics.eu 欧洲站 DNS 解析超时未能访问，美国站部分分类路径返回 410，该单品 PDP 可正常访问。"
    }
  },
  {
    "id": "catalog-064",
    "sequence": "64",
    "brand": "美宝莲",
    "productName": "六色眼影盘",
    "officialProductName": "The City Mini® Eyeshadow Palette（六色迷你眼影盘）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "美宝莲纽约六色眼影盘大地色通勤百搭显色不飞粉修饰日常淡妆Z",
    "officialStoreName": "美宝莲旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司苏州分公司",
    "specification": "6.1g",
    "listPrice": 79,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=556936942744",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/64 美宝莲旗舰店（六色眼影盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/64欧莱雅（中国）有限公司苏州分公司（美宝莲六色眼影盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/64 美宝莲六色眼影盘",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/64-maybelline-六色眼影盘/cover.jpg",
      "sourcePageUrl": "https://www.maybelline.com/eye-makeup/eyeshadow/the-city-mini-eyeshadow-palette?variant=Cocoa+City",
      "originalImageUrl": "https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/eye-makeup/eye-shadow/the-city-mini-palette/maybelline-eyeshadow-the-city-mini-palette-rooftop-bronzes-041554499742-c.jpg?rev=4e4bb197f33d470ebe33aa59e7880719",
      "sourcePriority": "brand_official",
      "rightsholder": "美宝莲 Maybelline New York（欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 1130,
      "format": "JPEG",
      "bytes": 74431,
      "note": "品牌官网直采：美宝莲美国官网 maybelline.com PDP 欧莱雅 Sitecore CDN 官方白底主图；色号 Rooftop Bronzes（屋顶古铜盘，6 色，哑光/珠光/金属光混合）；整盘开盖正面，六色块完整可见，黑壳印 THE CITY MINI PALETTE 与 MAYBELLINE NEW YORK，纯白底，无人物、无角标；官网页面 variant 参数为 Cocoa City，但 PDP 默认主图为 Rooftop Bronzes 盘；官网未在页面标注克重；分辨率 760×1130，竖构图上方留白，长边 1130px。"
    }
  },
  {
    "id": "catalog-065",
    "sequence": "65",
    "brand": "MAC魅可",
    "productName": "小眼影",
    "officialProductName": "Small Eye Shadow（单色眼影 1.5g）",
    "category": "眼影",
    "sourceCategory": "眼影盘",
    "marketplaceTitle": "MAC/魅可小眼影变色龙哑光爆闪细闪不脱妆跳跳糖",
    "officialStoreName": "MAC魅可官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "1g",
    "listPrice": 175,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=958039607188",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/65 MAC魅可官方旗舰店（小眼影）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/65雅诗兰黛（上海）商贸有限公司（MAC魅可小眼影）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/65 MAC魅可小眼影",
    "image": {
      "localPath": "YasPretty产品图片/眼影产品图片/眼影产品图片/65-mac-小眼影/cover.jpg",
      "sourcePageUrl": "https://www.maccosmetics.com/product/13840/363/products/makeup/eyes/eyeshadow/eye-shadow?shade=Omega",
      "originalImageUrl": "https://aka.doubaocdn.com/l/J90frYwva6",
      "sourcePriority": "brand_official",
      "rightsholder": "MAC 魅可（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 2880,
      "height": 2880,
      "format": "JPEG",
      "bytes": 512359,
      "note": "色号 Omega（soft muted beige-taupe 柔和米灰棕，哑光），1.5g / 0.05 oz；单个完整黑色小圆盒开盖正面，盒盖内置镜子，圆形粉体完整可见，纯白底，无人物、无角标、无水印；maccosmetics.com 美国站、maccosmetics.co.uk 英国站、m.maccosmetics.ca 加拿大站 PDP 直连均被 429 限流或 403 拦截，Ulta 美国站与 ulta.com.mx 均 403，最终经搜索引擎索引的官网白底主图镜像下载，图为官网同款 studio 主图，非第三方拼盘或试色图；分辨率 2880×2880；建议官网访问恢复后补采官网 CDN 直链原图。"
    }
  },
  {
    "id": "catalog-066",
    "sequence": "66",
    "brand": "橘朵",
    "productName": "砍刀眼线胶笔",
    "officialProductName": "精绘砍刀眼线胶笔 第三代（Precisely Depicted Slim Gel Eyeliner，45°砍刀头）",
    "category": "眼线",
    "sourceCategory": "眼线笔",
    "marketplaceTitle": "Judydoll橘朵砍刀眼线胶笔眼线笔卧蚕防水新手持久",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "0.06g",
    "listPrice": 39.8,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=704006151350",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/66 JUDYDOLL橘朵旗舰店（砍刀眼线胶笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/66上海橘朵化妆品有限公司（橘朵砍刀眼线胶笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/66 橘朵砍刀眼线胶笔",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/66-judydoll-砍刀眼线胶笔/cover.jpg",
      "sourcePageUrl": "https://m.yami.com/us/zh/p/judydoll-02/1023545371",
      "originalImageUrl": "https://aka.doubaocdn.com/l/hW2XUCb7bb",
      "sourcePriority": "retailer",
      "rightsholder": "橘朵 JUDYDOLL（橘宜集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 750,
      "height": 750,
      "format": "JPEG",
      "bytes": 8899,
      "note": "天猫橘朵旗舰店登录墙未能直采；judydoll.com 商品页与 products.json 均返回 429 限流，多次重试未果，未能提取官网 CDN 原图；降级为亚米 Yami 零售商商品图（retailer 正规零售商，非官方旗舰店直采）。单支出状态，45°砍刀胶笔头清晰可见，白底，管身印 JUDYDOLL，无人物、无角标/水印；笔杆底部有极少量批号喷码字样；该款 #01 黑棕/#02 深棕/#03 灰棕/#04 奶茶棕多色可选，图面为棕色系、色号未清晰标注（对应零售商页 #02 Dark Brown 深棕 SKU）；分辨率 750×750，低于 800px 建议值，建议后续补高清。"
    }
  },
  {
    "id": "catalog-067",
    "sequence": "67",
    "brand": "橘朵",
    "productName": "极细眼线液笔",
    "officialProductName": "极细精雕眼线液笔（Ultra-Fine Liquid Eyeliner，0.014mm 针形笔头）",
    "category": "眼线",
    "sourceCategory": "眼线笔",
    "marketplaceTitle": "Judydoll橘朵极细眼线液笔持久眼线笔防水不晕染下至笔点痣笔棕色",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "0.4g",
    "listPrice": 39.8,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=576073283354",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/67 JUDYDOLL橘朵旗舰店（极细眼线液笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/67上海橘朵化妆品有限公司（橘朵极细眼线液笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/67 橘朵极细眼线液笔",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/67-judydoll-极细眼线液笔/cover.jpg",
      "sourcePageUrl": "https://m.yami.com/us/zh/p/ultra-fine-liquid-eyeliner-03-medium-brown/3160021021",
      "originalImageUrl": "https://aka.doubaocdn.com/l/HtWQGEGuZz",
      "sourcePriority": "retailer",
      "rightsholder": "橘朵 JUDYDOLL（橘宜集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 750,
      "height": 750,
      "format": "JPEG",
      "bytes": 21967,
      "note": "天猫橘朵旗舰店登录墙未能直采；judydoll.com 商品页与 products.json 均返回 429 限流，未能提取官网 CDN 原图；降级为亚米 Yami 零售商商品图（retailer 正规零售商，非官方旗舰店直采）。图为盖合笔帽与拔出笔芯同框，0.014mm 极细针形笔尖外露，白底，管身印 JUDYDOLL，背景带一笔棕色试色弧线，无人物、无角标/水印；该款 #01 黑/#02 深棕/#03 冷茶棕/#04 灰棕等多色可选，图面为棕色系、色号未清晰标注（对应零售商页 #03 冷茶棕 SKU）；分辨率 750×750，低于 800px 建议值，建议后续补高清。"
    }
  },
  {
    "id": "catalog-068",
    "sequence": "68",
    "brand": "植村秀",
    "productName": "如胶似漆眼线笔",
    "officialProductName": "Unlimited 3D Gel Pencil 如胶似漆眼线笔（1.5mm 纤细笔芯）Sound Black 墨黑",
    "category": "眼线",
    "sourceCategory": "眼线笔",
    "marketplaceTitle": "植村秀如胶似漆眼线笔内眼线持久顺滑官方正品",
    "officialStoreName": "shu uemura植村秀官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "0.08g",
    "listPrice": 280,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=528240082715",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/68 shu uemura植村秀官方旗舰店（如胶似漆眼线笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/68欧莱雅（中国）有限公司广东分公司（植村秀如胶似漆眼线笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/68 植村秀如胶似漆眼线笔",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/68-shu-如胶似漆眼线笔/cover.jpg",
      "sourcePageUrl": "https://www.shuuemura.ca/p/unlimited-3d-gel-pencil-sound-black/14869421/",
      "originalImageUrl": "https://static.thcdn.com/productimg/original/14759318-6225167225103499.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "Shu Uemura 植村秀",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 2000,
      "height": 2000,
      "format": "JPEG",
      "bytes": 61187,
      "note": "品牌官网（shu uemura 加拿大官网，THG 运营）Unlimited 3D Gel Pencil 商品图库主图；整支正面，黑色 1.5mm 胶笔笔芯露出，灰黑磨砂笔杆竖印 shu uemura，纯白底，无人物、无手持、无文字遮挡、无角标水印；色号 Sound Black 墨黑；2000×2000 JPEG；授权状态 pending，仅内部使用。"
    }
  },
  {
    "id": "catalog-069",
    "sequence": "69",
    "brand": "美宝莲",
    "productName": "小金笔眼线液笔",
    "officialProductName": "Hyper Sharp Liner Extreme 极细眼线液笔 BK1 黑色",
    "category": "眼线",
    "sourceCategory": "眼线笔",
    "marketplaceTitle": "美宝莲纽约小金笔眼线液笔卧蚕笔极细新手持久防水防汗不晕染Z",
    "officialStoreName": "美宝莲旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司苏州分公司",
    "specification": "500mg",
    "listPrice": 69,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=12459362636",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/69 美宝莲旗舰店（小金笔眼线液笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/69欧莱雅（中国）有限公司苏州分公司（美宝莲小金笔眼线液笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/69 美宝莲小金笔眼线液笔",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/69-maybelline-小金笔眼线液笔/cover.jpg",
      "sourcePageUrl": "https://www.maybelline.vn/all-products/eye-makeup/liners/hyper-sharp-liner-extreme",
      "originalImageUrl": "https://www.maybelline.vn/-/media/project/loreal/brand-sites/mny/apac/vn/products/eye-makeup/liners/hyper-sharp-liner-extreme/bk1/hyper-sharp-liner-extreme-bk1-1.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "Maybelline New York 美宝莲",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 316,
      "height": 475,
      "format": "JPEG",
      "bytes": 5980,
      "note": "美宝莲越南官网（欧莱雅 Sitecore CDN）Hyper Sharp Liner Extreme 商品图；笔身与笔帽同框，极细笔尖露出，黑杆金色点缀、金顶笔帽，纯白底，无人物、无文字遮挡、无水印；BK1 黑色；国内市场「小金笔」为同系列 Hyper Sharp Liner；官网该 SKU 仅提供 316×475 低清渲染图，未取到 ≥800px 高清原图；授权状态 pending，仅内部使用。"
    }
  },
  {
    "id": "catalog-070",
    "sequence": "70",
    "brand": "完美日记",
    "productName": "纤细持久眼线液笔",
    "officialProductName": "Slim Long-lasting Liquid Eyeliner 纤细持久眼线液笔 01 黑色",
    "category": "眼线",
    "sourceCategory": "眼线笔",
    "marketplaceTitle": "完美日记纤细持久眼线液笔极细不晕染防水持久棕色黑色百搭眼妆",
    "officialStoreName": "perfectdiary旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "广州逸仙电子商务有限公司",
    "specification": "0.5ml",
    "listPrice": 50,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=559100750752",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/70 perfectdiary旗舰店（纤细持久眼线液笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/70广州逸仙电子商务有限公司（完美日记纤细持久眼线液笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/70 完美日记纤细持久眼线液笔",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/70-perfectdiary-纤细持久眼线液笔/cover.jpg",
      "sourcePageUrl": "https://product.suning.com/0000000000/000000012444437851.html",
      "originalImageUrl": "https://imgservice.suning.cn/uimg1/b2c/image/_we2uDQH5ej1ysOyNDnzcg.jpg",
      "sourcePriority": "retailer",
      "rightsholder": "Perfect Diary 完美日记",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 31668,
      "note": "完美日记全球官网 perfectdiary.com 商品接口限流（TOO_MANY_REQUESTS），日本站 jj.perfectdiary.com Shopify 未上架该 SKU；降级为苏宁易购自营商品页收录的品牌白底主图，非官方旗舰店直采；笔帽与笔身同框，极细笔尖露出，黑杆竖印 PERFECT DIARY，纯白底，无人物、无手持、无文字遮挡、无水印；01 黑色（同链接另有 02 棕色版本）；800×800 JPEG；授权状态 pending，仅内部使用。"
    }
  },
  {
    "id": "catalog-071",
    "sequence": "71",
    "brand": "花西子",
    "productName": "双头眼线胶笔",
    "officialProductName": "Dual-Ended Gel Eyeliner Pencil 双头眼线胶笔 01 松烟黛墨",
    "category": "眼线",
    "sourceCategory": "眼线笔",
    "marketplaceTitle": "花西子双头眼线胶笔 持色防水防汗不晕染卧蚕笔新手女",
    "officialStoreName": "花西子旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州宜格化妆品有限公司",
    "specification": "70mg",
    "listPrice": 92,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1066601061178",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/71 花西子旗舰店（双头眼线胶笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/71杭州宜格化妆品有限公司（花西子双头眼线胶笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/71 花西子双头眼线胶笔",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/71-huaxizi-双头眼线胶笔/cover.jpg",
      "sourcePageUrl": "https://www.yesstyle.com/en/florasis-dual-ended-gel-eyeliner-pencil-2-colors-01-screw-black-0/info.html/pid.1138027991",
      "originalImageUrl": "https://aka.doubaocdn.com/l/aTlmHQDx8I",
      "sourcePriority": "retailer",
      "rightsholder": "Florasis 花西子",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 640,
      "height": 640,
      "format": "JPEG",
      "bytes": 9983,
      "note": "花西子海外官网 florasis.com 该 SKU 已售罄，products.json 未收录、商品页返回 429 限流；降级为零售商 YesStyle 商品页收录的品牌白底图，非官方旗舰店直采；笔帽与开盖笔身同框，双头可见（上端 0.1mm 极细胶笔头、下端 1.6mm 刀锋晕染刷），黛青笔杆印花西子，纯白底，无人物、无文字遮挡、无水印；01 松烟黛墨（黑色，另有 02 松烟琥珀棕色）；640×640 JPEG，未达 ≥800px 高清要求；授权状态 pending，仅内部使用。"
    }
  },
  {
    "id": "catalog-072",
    "sequence": "72",
    "brand": "橘朵",
    "productName": "钢管睫毛膏",
    "officialProductName": "3D 卷翘钢管睫毛膏（3D Curling Eyelash Iron Mascara / Feather Lash Iron Mascara）",
    "category": "睫毛膏",
    "sourceCategory": "睫毛膏",
    "marketplaceTitle": "Judydoll橘朵钢管睫毛膏防水纤长持久定型睫毛",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "3g",
    "listPrice": 49.8,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=653519512729",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/72 JUDYDOLL橘朵旗舰店（钢管睫毛膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/72上海橘朵化妆品有限公司（橘朵钢管睫毛膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/72 橘朵钢管睫毛膏",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/72-judydoll-钢管睫毛膏/cover.jpg",
      "sourcePageUrl": "https://judydoll.com/products/3d-curling-eyelash-iron-mascara",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0735/0098/3573/files/3_5cec36d6-beb4-40de-8828-5d246c9dda88.webp?v=1766992441&width=800",
      "sourcePriority": "brand_official",
      "rightsholder": "橘朵 JUDYDOLL（橘宜集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 19172,
      "note": "天猫橘朵旗舰店 judydoll.world.tmall.com 登录墙未能直采；judydoll.com 的 products.json 接口返回 429 限流，但商品页 HTML 可访问，提取到 Shopify CDN 官方主图（brand_official 品牌官网来源）。图为盖合整管与拔出的钢管刷头同框，浅灰白底，无人物、无手持、无角标/水印；官网色号 #01 Black / #02 Brown 可选，图面未标注色号；CDN 链接后缀为 webp 封装，实测文件魔数为 JPEG，已按真实格式存为 cover.jpg；分辨率 800×800。"
    }
  },
  {
    "id": "catalog-073",
    "sequence": "73",
    "brand": "美宝莲",
    "productName": "粉胖子摩天翘睫毛膏",
    "officialProductName": "Volum' Express Hyper Curl Waterproof Mascara（Hyper Curl 防水睫毛膏，昵称粉胖子摩天翘）",
    "category": "睫毛膏",
    "sourceCategory": "睫毛膏",
    "marketplaceTitle": "美宝莲纽约粉胖子摩天翘睫毛膏卷翘持久防水防汗不晕染自然纤长Z",
    "officialStoreName": "美宝莲旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司苏州分公司",
    "specification": "9.2ml",
    "listPrice": 79,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=586808094999",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/73 美宝莲旗舰店（粉胖子摩天翘睫毛膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/73欧莱雅（中国）有限公司苏州分公司（美宝莲粉胖子摩天翘睫毛膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/73 美宝莲粉胖子摩天翘睫毛膏",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/73-maybelline-粉胖子摩天翘/cover.jpg",
      "sourcePageUrl": "https://www.maybelline.co.in/all-products/eyes/mascara/hyper-curl-waterproof-mascara",
      "originalImageUrl": "https://www.maybelline.co.in/-/media/project/loreal/brand-sites/mny/apac/in/products/eye-makeup/mascara/volum-express-hypercurl-mascara/modules/product-info/waterproof/hc-waterproof-mascara-315-x-472-01.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "美宝莲 Maybelline（欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 315,
      "height": 472,
      "format": "JPEG",
      "bytes": 13396,
      "note": "清单名“粉胖子摩天翘”对应 Hyper Curl Waterproof（国内昵称粉胖子摩天翘，防水款）；美宝莲印度官网商品页取 Sitecore CDN 白底官方包图，brand_official 品牌官网来源；开盖整管+刷头同框，粉盖黑管印 HYPER CURL WATERPROOF，纯白底，无人物、无手持、无角标水印；色号图面未标注；官网该图仅 315×472（站点未提供更大原图，w/width 等缩放参数不生效），低于 800px 建议值，建议后续补高清。"
    }
  },
  {
    "id": "catalog-074",
    "sequence": "74",
    "brand": "NARS",
    "productName": "耀目立体定型睫毛膏",
    "officialProductName": "Notorious Mascara（中国官网名“大开眼界睫毛膏”）",
    "category": "睫毛膏",
    "sourceCategory": "睫毛膏",
    "marketplaceTitle": "【官方正品】NARS 耀目立体定型睫毛膏 防水纤长卷翘不晕染",
    "officialStoreName": "NARS官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "资生堂（中国）投资有限公司",
    "specification": "8g",
    "listPrice": 280,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1065723683654",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/74 NARS官方旗舰店（耀目立体定型睫毛膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/74资生堂（中国）投资有限公司（NARS耀目立体定型睫毛膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/74 NARS耀目立体定型睫毛膏",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/74-nars-耀目立体定型睫毛膏/cover.jpg",
      "sourcePageUrl": "https://www.narscosmetics.com/USA/notorious-mascara/999NAC0000306.html",
      "originalImageUrl": "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dw669f1545/2026/July/NotoriousMascara/NARS_FA26_EyeMoment_PDPCrop_NotoriousMascara_Soldier_Black_GLBL.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "NARS（资生堂集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 2000,
      "height": 2000,
      "format": "JPEG",
      "bytes": 131348,
      "note": "清单名“耀目立体定型睫毛膏”对应 NARS Notorious Mascara（美国官网 2026 新品，中国官网名“大开眼界睫毛膏”）；NARS 美国官网 PDP 取 demandware.static 官方白底包图，brand_official 品牌官网来源；整管+开盖刷头同框，黑色圆柱管印白色 NARS logo，纯白底，无人物、无手持、无角标水印；色号 Soldier Black 黑色；2000×2000。注：清单中文名为内部描述，与官网中文名“大开眼界”不一致，已按官网英文名 Notorious Mascara 归档。"
    }
  },
  {
    "id": "catalog-075",
    "sequence": "75",
    "brand": "卡姿兰",
    "productName": "双头睫毛膏",
    "officialProductName": "微雕大眼双头睫毛膏（Double Extension Curling Mascara，精微大眼双头 01 黑色）",
    "category": "睫毛膏",
    "sourceCategory": "睫毛膏",
    "marketplaceTitle": "卡姿兰双头睫毛膏防水纤长卷翘不晕染拉长持久打底定型旗舰店正品",
    "officialStoreName": "卡姿兰官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "芜湖华穗贸易有限公司",
    "specification": "12g",
    "listPrice": 137,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=521183804200",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/75 卡姿兰官方旗舰店（双头睫毛膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/75芜湖华穗贸易有限公司（卡姿兰双头睫毛膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/75 卡姿兰双头睫毛膏",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/75-carslan-双头睫毛膏/cover.png",
      "sourcePageUrl": "https://www.carslan.com.cn/jingdiaoqiaojie/86",
      "originalImageUrl": "https://www.carslan.com.cn/uploads/upload/images/20241223/5043d63a6571baa583e7528b8373f0c9.png",
      "sourcePriority": "brand_official",
      "rightsholder": "卡姿兰 Carslan",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 734,
      "height": 790,
      "format": "PNG",
      "bytes": 87526,
      "note": "官方名微雕大眼双头睫毛膏（Double Extension Curling Mascara）；卡姿兰中国官网商品页取上传 CDN 白底官方包图，brand_official 品牌官网来源；单支双头设计（2.5mm 精细刷头+弯月大刷头），闭管与开盖双刷头同框，藏蓝管身印 CARSLAN，纯白底，无人物、无手持、无角标水印；色号 01 黑色；734×790。"
    }
  },
  {
    "id": "catalog-076",
    "sequence": "76",
    "brand": "完美日记",
    "productName": "睫毛膏",
    "officialProductName": "纤长持久睫毛膏 广角长翘（Wide Angle Overcurl Lengthening Mascara）",
    "category": "睫毛膏",
    "sourceCategory": "睫毛膏",
    "marketplaceTitle": "完美日记官方旗舰店睫毛膏纤长卷翘不晕染黑棕色定型持久眼妆",
    "officialStoreName": "perfectdiary旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "广州逸仙电子商务有限公司",
    "specification": "4.5g",
    "listPrice": 50,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=556452767895",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/76 perfectdiary旗舰店（睫毛膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/76广州逸仙电子商务有限公司（完美日记睫毛膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/76 完美日记睫毛膏",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/76-perfectdiary-睫毛膏/cover.jpg",
      "sourcePageUrl": "https://demo.jingtuitui.com/?r=item%2F8825637",
      "originalImageUrl": "https://aka.doubaocdn.com/l/ceVJg7op7L",
      "sourcePriority": "retailer",
      "rightsholder": "完美日记 Perfect Diary",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 30765,
      "note": "官网全球站 perfectdiary.com 商品页被限流/拦截（products.json 仅返回 3 款，PDP 与集合页 18 字节拦截），日本站 jj.perfectdiary.com 仅 31 款无睫毛膏；降级为京东商城商品（item id=8825637，完美日记纤长持久睫毛膏/广角长翘）收录的品牌白底图，retailer 零售商来源，非官方旗舰店直采；整管+开盖刷头同框，黑色方管印 PERFECT DIARY，白底带自然投影，无人物、无手持、无角标水印；色号图面未标注（该款 01 黑/02 棕可选，清单链接标注广角长翘棕色）；800×800。"
    }
  },
  {
    "id": "catalog-077",
    "sequence": "77",
    "brand": "花西子",
    "productName": "松烟纤细睫毛膏",
    "officialProductName": "松烟蝶羽睫毛膏（纤细版；海外官网名 松煙蝶羽マスカラ ロングタイプ / Pine Soot Precise Definition Mascara）",
    "category": "睫毛膏",
    "sourceCategory": "睫毛膏",
    "marketplaceTitle": "花西子松烟纤细睫毛膏/防水不晕染浓密嫁接持久自然纤细根根分明",
    "officialStoreName": "花西子旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州宜格化妆品有限公司",
    "specification": "3ml",
    "listPrice": 62,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=586506965942",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/77 花西子旗舰店（松烟纤细睫毛膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/77杭州宜格化妆品有限公司（花西子松烟纤细睫毛膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/77 花西子松烟纤细睫毛膏",
    "image": {
      "localPath": "YasPretty产品图片/睫毛膏眼线图片/77-huaxizi-松烟纤细睫毛膏/cover.jpg",
      "sourcePageUrl": "https://jp.florasis.com/products/pine-soot-precise-definition-mascara",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0598/5396/3446/products/30.jpg?v=1666105400",
      "sourcePriority": "brand_official",
      "rightsholder": "花西子 Florasis / Huaxizi",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 1000,
      "format": "JPEG",
      "bytes": 58510,
      "note": "天猫花西子旗舰店 huaxizi.tmall.com 商品页为登录墙/JS 渲染，curl 仅得跳转页，未能从旗舰店直采主图；florasis.com 美国站目录未收录该睫毛膏；改由花西子日本官网 jp.florasis.com 商品页 Shopify CDN 官方主图（brand_official 品牌官网来源）。图为膏管与拔出的刷头同框斜置构图，浅云雾色背景（非纯白底正面），无人物、无手持、无促销角标/水印；官网该 SKU 有 C01 松烟黛墨（黑）/C02 松烟琥珀（棕）两色，图面色号未单独标注；国内备案品名松烟蝶羽睫毛膏（纤细版），与海外版版本对应关系以国内备案为准；分辨率 800×1000，长边 1000px。"
    }
  },
  {
    "id": "catalog-078",
    "sequence": "78",
    "brand": "NARS",
    "productName": "腮红",
    "officialProductName": "Powder Blush - Orgasm (777)",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "NARS腮红膨胀氛围色好气色显白显嫩#ORGASM#爱欲",
    "officialStoreName": "NARS官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "资生堂（中国）投资有限公司",
    "specification": "4.8g",
    "listPrice": 330,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=571366455508",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/78 NARS官方旗舰店（腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/78资生堂（中国）投资有限公司（NARS腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/78 NARS腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/78-nars-腮红/cover.jpg",
      "sourcePageUrl": "https://www.narscosmetics.eu/en/powder-blush/0194251144856.html",
      "originalImageUrl": "https://www.narscosmetics.eu/dw/image/v2/BCMQ_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dw18b0fdb1/pdp/999NAC0000192/NARS_SP26_DeeplyBloomingCollection_PDPCrop_Blush_SoldierSwatch_Orgasm_GLBL.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "NARS Cosmetics",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 2000,
      "height": 2000,
      "format": "JPEG",
      "bytes": 472538,
      "note": "色号 Orgasm 777（蜜桃粉带金闪）；NARS 欧洲官网 demandware 直链开盖白底包图。美国官网同款单品图右上角带 Allure 2024 奖章角标不合规，故降级取欧洲官网无角标版本；2000×2000。"
    }
  },
  {
    "id": "catalog-079",
    "sequence": "79",
    "brand": "倩碧",
    "productName": "小雏菊腮红",
    "officialProductName": "Cheek Pop™ Powder Blush (Pink Pop)",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "倩碧小雏菊腮红 高光修容珠光三合一 腮紫膨胀色修容显白显气色",
    "officialStoreName": "Clinique倩碧官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "3.5g",
    "listPrice": 170,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=41716975750",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/79 Clinique倩碧官方旗舰店（小雏菊腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/79雅诗兰黛（上海）商贸有限公司（倩碧小雏菊腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/79 倩碧小雏菊腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/79-clinique-小雏菊腮红/cover.jpg",
      "sourcePageUrl": "https://www.clinique.com/product/1593/29770/makeup/face/blushers/cheek-poptm-powder-blush?shade=Pink_Pop",
      "originalImageUrl": "https://aka.doubaocdn.com/l/c4amBKjXuo",
      "sourcePriority": "brand_official",
      "rightsholder": "Clinique（Estée Lauder Companies）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1200,
      "height": 1500,
      "format": "JPEG",
      "bytes": 81293,
      "note": "来源：官网限流，镜像取回。色号 Pink Pop；clinique.com 桌面与移动 PDP 均返回 local_rate_limited 限流页，无法提取官网 CDN 原始直链，降级经搜索引擎镜像取回官网同款雏菊压纹白底包图；镜像非原始 CDN 地址，原始图链待官网可访问后补录。"
    }
  },
  {
    "id": "catalog-080",
    "sequence": "80",
    "brand": "3CE",
    "productName": "单色腮红",
    "officialProductName": "3CE Face Blush (#Mono Pink)",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "3CE好脸色多用膏 腮红高光膨胀收缩彩妆女 T",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "5.5g",
    "listPrice": 119,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=584816954855",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/80 3CE官方旗舰店（单色腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/80欧莱雅（中国）有限公司广东分公司（3CE单色腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/80 3CE单色腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/80-3ce-单色腮红/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.com/all-products/cheeks/blush/3ce-face-blush",
      "originalImageUrl": "https://www.3cecosmetics.com/-/media/project/loreal/brand-sites/tce/apac/int/en-image-assets/all-prouducts/cheeks/blush/face-blush/m-gal-260722/mono-pink/face-blush-mono-pink_pdp_pck.jpg?rev=df1f5920ba2d48b7b9e5d6adf57061ea",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE（STYLENANDA / L'Oréal）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 109920,
      "note": "色号 Mono Pink；3CE 全球官网 Sitecore CDN 标准包图，为闭合盖面（logo 面），非开盖粉盘视角；长边 960px。"
    }
  },
  {
    "id": "catalog-081",
    "sequence": "81",
    "brand": "3CE",
    "productName": "好脸色多用膏",
    "officialProductName": "3CE Bouncy Blur Balm (#Beige Crush)",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "3CE好脸色多用膏 腮红高光膨胀收缩彩妆女 T",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "4.8g",
    "listPrice": 129,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=628339199806",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/81 3CE官方旗舰店（好脸色多用膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/81欧莱雅（中国）有限公司广东分公司（3CE好脸色多用膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/81 3CE好脸色多用膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/81-3ce-好脸色多用膏/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.com/all-products/cheeks/blush/3ce-bouncy-blur-balm",
      "originalImageUrl": "https://www.3cecosmetics.com/-/media/project/loreal/brand-sites/tce/apac/int/en-image-assets/all-prouducts/cheeks/blush/bouncy-blur-balm-2/beige-crush/bouncy-blur-balm_beige-crush_pdp_pck.jpg?rev=93ec50b5451846d79fd31ec1ef0fb8ad",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE（STYLENANDA / L'Oréal）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 96262,
      "note": "色号 Beige Crush；清单“多用膏”映射为官网在售膏状颊彩 Bouncy Blur Balm（圆形透明罐、膏体可见）。经典款 Take A Layer Multi Pot 在全球站与韩国站均已 404 下架，故取当前官网同类膏状颊彩，款名映射建议复核；长边 960px。"
    }
  },
  {
    "id": "catalog-082",
    "sequence": "82",
    "brand": "3CE",
    "productName": "液体腮红",
    "officialProductName": "3CE Sheer Liquid Blusher (#Cozy Peach)",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "3CE液体腮红 蜜桃玫瑰红茶 丝绒液体修容胭脂",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "3.4g",
    "listPrice": 98,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=624072283673",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/82 3CE官方旗舰店（液体腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/82欧莱雅（中国）有限公司广东分公司（3CE液体腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/82 3CE液体腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/82-3ce-液体腮红/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.com/all-products/cheeks/blush/3ce-sheer-liquid-blusher",
      "originalImageUrl": "https://www.3cecosmetics.com/-/media/project/loreal/brand-sites/tce/apac/int/en-image-assets/all-prouducts/cheeks/blush/sheer-liquid-blusher/cozy-peach/lowdown/sheer-liquid-blusher_cozy-peach_pdp_pck.jpg?rev=085eb693ed20483ea33528de58ef3bac",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE（STYLENANDA / L'Oréal）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 121732,
      "note": "色号 Cozy Peach；整管含管身+刷头+管帽，官网 Sitecore CDN 包图；长边 960px。"
    }
  },
  {
    "id": "catalog-083",
    "sequence": "83",
    "brand": "橘朵",
    "productName": "单色腮红",
    "officialProductName": "Pretty Blush Powder（橘朵单色腮红）",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "Judydoll橘朵单色腮红高光修容多用腮红膏提亮膨胀收缩",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "2g",
    "listPrice": 29.8,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=575199792141",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/83 JUDYDOLL橘朵旗舰店（单色腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/83上海橘朵化妆品有限公司（橘朵单色腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/83 橘朵单色腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/83-judydoll-单色腮红/cover.jpg",
      "sourcePageUrl": "https://judydoll.com/products/pretty-blush-powder",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0735/0098/3573/files/3b73fd3434af0b654bbe665384c40678_12f1b32c-f77d-4ddd-9971-6190aa7eeebd.webp?v=1764153956",
      "sourcePriority": "brand_official",
      "rightsholder": "橘朵 JUDYDOLL",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 26390,
      "note": "来源：Shopify官方CDN主图。官网Pretty Blush Powder单色粉饼腮红，浅粉单盘透明方壳；正面完整产品图，盘面完整可见，无手持无模特无角标水印；色号以官网展示为准。"
    }
  },
  {
    "id": "catalog-084",
    "sequence": "84",
    "brand": "橘朵",
    "productName": "水缎光腮红",
    "officialProductName": "Satin Glow Blush（橘朵水缎光腮红）",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "Judydoll橘朵水缎光腮红高光收缩膨胀色新款5g",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "5g",
    "listPrice": 46.9,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=915346299796",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/84 JUDYDOLL橘朵旗舰店（水缎光腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/84上海橘朵化妆品有限公司（橘朵水缎光腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/84 橘朵水缎光腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/84-judydoll-水缎光腮红/cover.jpg",
      "sourcePageUrl": "https://judydoll.com/products/satin-glow-blush",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0735/0098/3573/files/28b20ed306a25126fa63962877722c78.webp?v=1764148056",
      "sourcePriority": "brand_official",
      "rightsholder": "橘朵 JUDYDOLL",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 39564,
      "note": "来源：Shopify官方CDN主图。官网Satin Glow Blush渐变缎光腮红，透明方壳，盘面渐变缎光纹理完整可见；正面完整产品图，无手持无模特无角标水印。"
    }
  },
  {
    "id": "catalog-085",
    "sequence": "85",
    "brand": "花西子",
    "productName": "腮红膏",
    "officialProductName": "Peony Dream Cream Blush（花西子腮红膏）",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "花西子腮红膏珠光微闪晒红高光修容三合一胭脂盘眼影",
    "officialStoreName": "花西子旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州宜格化妆品有限公司",
    "specification": "4g",
    "listPrice": 99,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=596316775451",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/85 花西子旗舰店（腮红膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/85杭州宜格化妆品有限公司（花西子腮红膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/85 花西子腮红膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/85-huaxizi-腮红膏/cover.jpg",
      "sourcePageUrl": "https://florasis.com/products/peony-dream-cream-blush-2",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0528/2486/7015/files/KV____800x1000-_-14.webp?v=1779937296",
      "sourcePriority": "brand_official",
      "rightsholder": "花西子 FLORASIS",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 1000,
      "format": "JPEG",
      "bytes": 41893,
      "note": "来源：Shopify官方CDN主图。海外官网Peony Dream Cream Blush，开盖雕花腮红盘，粉紫渐变盘面完整可见；无手持无模特无角标水印；国内对应花西子腮红膏。"
    }
  },
  {
    "id": "catalog-086",
    "sequence": "86",
    "brand": "彩棠",
    "productName": "三色腮红盘",
    "officialProductName": "争青流玉三色胭脂盘 TIMAGE Tri-Color Rouge Palette",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "彩棠TIMAGE三色腮红盘高光修容三合一哑光缎光膨胀色",
    "officialStoreName": "彩棠旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "宁波彩棠化妆品有限公司",
    "specification": "13g",
    "listPrice": 170,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1009514052349",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/86 彩棠旗舰店（三色腮红盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/86宁波彩棠化妆品有限公司（彩棠三色腮红盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/86 彩棠三色腮红盘",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/86-caitang-三色腮红盘/cover.jpg",
      "sourcePageUrl": "https://m.yamibuy.com/zh/p/blush-03/1023335651",
      "originalImageUrl": "https://aka.doubaocdn.com/l/eZm0RF7mvA",
      "sourcePriority": "retailer",
      "rightsholder": "彩棠 TIMAGE",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 750,
      "height": 750,
      "format": "JPEG",
      "bytes": 32907,
      "note": "来源：亚米Yami。色号#03杏俏（奶杏盘），绿玉色外壳，正面开盖三格色块完整可见；背景为粉饼刷色装饰，无手持无模特无文字角标。降级原因：彩棠官网为Nuxt JS渲染落地页、商品跳转天猫旗舰店（登录墙/JS渲染），curl无法取得官网主图，降级至亚米零售商品图；图源最大750px，未达800px优先线。"
    }
  },
  {
    "id": "catalog-087",
    "sequence": "87",
    "brand": "花知晓",
    "productName": "邦尼花园冻干浮雕腮红",
    "officialProductName": "Bunny Garden Embossed Blush（花知晓邦尼花园浮雕腮红）",
    "category": "腮红",
    "sourceCategory": "腮红",
    "marketplaceTitle": "花知晓邦尼花园冻干浮雕腮红膨胀氛围色旗舰店",
    "officialStoreName": "花知晓旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州花知晓电子商务有限公司",
    "specification": "5g",
    "listPrice": 99,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1005900937471",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/87 花知晓旗舰店（邦尼花园冻干浮雕腮红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/87杭州花知晓电子商务有限公司（花知晓邦尼花园冻干浮雕腮红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/87 花知晓邦尼花园冻干浮雕腮红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/87-huazhixiao-邦尼花园冻干浮雕腮红/cover.jpg",
      "sourcePageUrl": "https://flowerknows.co/products/bunny-garden-embossed-blush",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0593/5418/5889/files/S01_0a288215-05cc-4cfc-8568-48283566b2d8.jpg?v=1767926997",
      "sourcePriority": "brand_official",
      "rightsholder": "花知晓 Flower Knows",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1100,
      "height": 1375,
      "format": "JPEG",
      "bytes": 183179,
      "note": "来源：Shopify官方CDN主图。官网Bunny Garden Embossed Blush，心形兔园浮雕腮红，开盖可见整盘兔子花卉浮雕，S01色号；正面完整产品图，无手持无模特无角标水印。"
    }
  },
  {
    "id": "catalog-088",
    "sequence": "88",
    "brand": "MAC魅可",
    "productName": "大子弹头口红",
    "officialProductName": "MACXIMAL Silky Matte Lipstick 哑光「大子弹头」",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "MAC/魅可大子弹头口红唇膏哑光显色 贵人来/683/693",
    "officialStoreName": "MAC魅可官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "3.4g",
    "listPrice": 200,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=761678190859",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/88 MAC魅可官方旗舰店（大子弹头口红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/88雅诗兰黛（上海）商贸有限公司（MAC魅可大子弹头口红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/88 MAC魅可大子弹头口红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/88-mac-大子弹头/cover.jpg",
      "sourcePageUrl": "https://www.maccosmetics.com.cn/products/13854/",
      "originalImageUrl": "https://aka.doubaocdn.com/l/22wqDiQ2pg",
      "sourcePriority": "brand_official",
      "rightsholder": "MAC Cosmetics（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 700,
      "height": 700,
      "format": "JPEG",
      "bytes": 31400,
      "note": "来源：搜索引擎索引镜像；官网 PDP 直连限流。哑光「大子弹头」黑管银环，砖红棕色膏体带 MAC 压纹，管盖置于旁侧；官网美/英/中站 PDP 直连被限流（429/空响应），采用搜索引擎索引的官网 Studio 白底主图镜像，700×700。"
    }
  },
  {
    "id": "catalog-089",
    "sequence": "89",
    "brand": "MAC魅可",
    "productName": "轻尤雾弹唇膏",
    "officialProductName": "Powder Kiss Hazy Matte Lipstick「轻」尤雾弹唇膏",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "MAC/魅可轻尤雾弹唇膏口红裸色哑光滋润 316/314/912",
    "officialStoreName": "MAC魅可官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "3.5g",
    "listPrice": 210,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=595237863327",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/89 MAC魅可官方旗舰店（轻尤雾弹唇膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/89雅诗兰黛（上海）商贸有限公司（MAC魅可轻尤雾弹唇膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/89 MAC魅可轻尤雾弹唇膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/89-mac-轻尤雾弹唇膏/cover.jpg",
      "sourcePageUrl": "https://m.maccosmetics.com.cn/product/142085/",
      "originalImageUrl": "https://aka.doubaocdn.com/l/8cLn8qNwmA",
      "sourcePriority": "brand_official",
      "rightsholder": "MAC Cosmetics（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1080,
      "height": 1080,
      "format": "JPEG",
      "bytes": 46775,
      "note": "来源：搜索引擎索引镜像；官网 PDP 直连限流。「轻」尤雾弹柔雾哑光黑管，烟粉豆沙色膏体，管盖置于旁侧；官网 PDP 直连限流，取搜索引擎索引官网主图镜像，1080×1080。"
    }
  },
  {
    "id": "catalog-090",
    "sequence": "90",
    "brand": "MAC魅可",
    "productName": "轻尤雾弹唇釉",
    "officialProductName": "Powder Kiss Lip + Cheek Mousse「轻」尤雾弹唇釉（唇颊两用慕斯）",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "MAC/魅可轻尤雾弹唇釉唇泥口红裸色滋润 973/997/952",
    "officialStoreName": "MAC魅可官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "5ml",
    "listPrice": 230,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=620260695087",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/90 MAC魅可官方旗舰店（轻尤雾弹唇釉）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/90雅诗兰黛（上海）商贸有限公司（MAC魅可轻尤雾弹唇釉）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/90 MAC魅可轻尤雾弹唇釉",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/90-mac-轻尤雾弹唇釉/cover.jpg",
      "sourcePageUrl": "https://www.maccosmetics.com.cn/product/142086/",
      "originalImageUrl": "https://aka.doubaocdn.com/l/rC0yjDUjWU",
      "sourcePriority": "brand_official",
      "rightsholder": "MAC Cosmetics（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 700,
      "height": 700,
      "format": "JPEG",
      "bytes": 38758,
      "note": "来源：搜索引擎索引镜像；官网 PDP 直连限流。「轻」尤雾弹唇颊两用慕斯，磨砂雾面管身，裸玫瑰色膏体，含刷头与管盖；官网 PDP 限流取镜像，700×700。"
    }
  },
  {
    "id": "catalog-091",
    "sequence": "91",
    "brand": "Dior迪奥",
    "productName": "烈艳蓝金唇膏",
    "officialProductName": "Rouge Dior Refillable Lipstick 烈艳蓝金唇膏（可替换芯）",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "Dior迪奥烈艳蓝金唇膏口红全新绒雾柔雾哑光 688 756",
    "officialStoreName": "DIOR迪奥官方旗舰店 香水与美容品",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "路威酩轩香水化妆品商贸（上海）有限公司",
    "specification": "3.5g",
    "listPrice": 420,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=618488552961",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/91 DIOR迪奥官方旗舰店（烈艳蓝金唇膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/91路威酩轩香水化妆品商贸（上海）有限公司（Dior迪奥烈艳蓝金唇膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/91 Dior迪奥烈艳蓝金唇膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/91-dior-烈艳蓝金唇膏/cover.jpg",
      "sourcePageUrl": "https://www.sephora.com/product/dior-rouge-dior-lipstick-P467760?skuId=2751238",
      "originalImageUrl": "https://www.sephora.com/productimages/sku/s2751238-main-zoom.jpg",
      "sourcePriority": "retailer",
      "rightsholder": "Parfums Christian Dior",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 2000,
      "height": 2000,
      "format": "JPEG",
      "bytes": 247136,
      "note": "来源：Sephora 授权渠道产品图。烈艳蓝金磁吸黑壳+银色中束+斜切膏体，膏体 DIOR 压纹；本图为色号 219 Rose Montaigne 缎光裸桃色（非 999）；dior.com 图床 403，改用 Sephora CDN 授权渠道产品主图，2000×2000。"
    }
  },
  {
    "id": "catalog-092",
    "sequence": "92",
    "brand": "倩碧",
    "productName": "Black Honey唇膏",
    "officialProductName": "Almost Lipstick in Black Honey",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "倩碧Black Honey唇膏口红 滋润提气色润唇保湿",
    "officialStoreName": "Clinique倩碧官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "1.9g",
    "listPrice": 195,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=736041352266",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/92 Clinique倩碧官方旗舰店（Black Honey唇膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/92雅诗兰黛（上海）商贸有限公司（倩碧Black Honey唇膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/92 倩碧Black Honey唇膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/92-clinique-black-honey唇膏/cover.jpg",
      "sourcePageUrl": "https://www.clinique.com/product/1605/4772/makeup/lipsticks/almost-lipstick-in-black-honey",
      "originalImageUrl": "https://aka.doubaocdn.com/l/P3tjx35QqW",
      "sourcePriority": "brand_official",
      "rightsholder": "Clinique（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1200,
      "height": 1500,
      "format": "JPEG",
      "bytes": 63691,
      "note": "来源：搜索引擎索引镜像；PDP curl 无正文。Almost Lipstick Black Honey 经典银管细管，浆果梅色膏体，管盖置于旁侧；官网 PDP curl 无正文，取搜索引擎索引官网主图镜像，1200×1500。"
    }
  },
  {
    "id": "catalog-093",
    "sequence": "93",
    "brand": "3CE",
    "productName": "水雾唇露",
    "officialProductName": "3CE Blur Water Tint 水雾唇露",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "3CE水雾唇露 哑光唇釉持久口红女生彩妆礼物",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "4.6g",
    "listPrice": 119,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=647673427036",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/93 3CE官方旗舰店（水雾唇露）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/93欧莱雅（中国）有限公司广东分公司（3CE水雾唇露）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/93 3CE水雾唇露",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/93-3ce-水雾唇露/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.co.kr/all-products/lips/lip-tint/3ce-blur-water-tint",
      "originalImageUrl": "https://www.3cecosmetics.co.kr/-/media/project/loreal/brand-sites/tce/apac/kr/en-image-assets/all-prouducts/lips/lip-tint/blur-water-tint/laydown/blur-water-tint_laydown_pdp_pck.jpg?rev=e24963e7cdcd416f8eadda7558896072",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE（Nanda / 欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 107918,
      "note": "来源：韩国站 Sitecore 图床直链。Blur Water Tint 水雾唇露，半透明雾面管身，暖砖红色（色号 Laydown），含管身与刷头；韩国官网 Sitecore 图床直链，760×960。"
    }
  },
  {
    "id": "catalog-094",
    "sequence": "94",
    "brand": "3CE",
    "productName": "好气色润唇膏",
    "officialProductName": "3CE Glazy Lip Glow 好气色润唇膏",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "3CE好气色润唇膏 裸色镜面唇釉口红滋润礼物",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "3.2g",
    "listPrice": 104,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=874514033140",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/94 3CE官方旗舰店（好气色润唇膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/94欧莱雅（中国）有限公司广东分公司（3CE好气色润唇膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/94 3CE好气色润唇膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/94-3ce-好气色润唇膏/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.co.kr/all-products/lips/lipstick/3ce-glazy-lip-glow",
      "originalImageUrl": "https://www.3cecosmetics.co.kr/-/media/project/loreal/brand-sites/tce/apac/kr/en-image-assets/all-prouducts/lips/lip-gloss/glazy-lip-glow/30-melting-smore/glazy-lip-glow_30-melting-smore_plp_pck.png?rev=85f54baac0f24772bd569e0f14c7a384",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE（Nanda / 欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 760,
      "format": "JPEG",
      "bytes": 44583,
      "note": "来源：韩国站 Sitecore 图床直链。Glazy Lip Glow 好气色润唇膏，粉金管滋养润唇膏，色号 30 Melting Smore 浮光裸棕；韩国官网 Sitecore 直链，原 PNG 透明底已铺白底转 JPEG，760×760。"
    }
  },
  {
    "id": "catalog-095",
    "sequence": "95",
    "brand": "完美日记",
    "productName": "第三代仿生膜精华口红",
    "officialProductName": "Biolip Essence Matte Lipstick 3.0 第三代「仿生膜」精华哑光口红",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "完美日记第三代仿生膜精华口红滋润703哑光",
    "officialStoreName": "perfectdiary旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "广州逸仙电子商务有限公司",
    "specification": "3.3g",
    "listPrice": 190,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=735116220520",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/95 perfectdiary旗舰店（第三代仿生膜精华口红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/95广州逸仙电子商务有限公司（完美日记第三代仿生膜精华口红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/95 完美日记第三代仿生膜精华口红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/95-perfectdiary-第三代仿生膜口红/cover.jpg",
      "sourcePageUrl": "https://biggo.com.tw/s/%E5%AE%8C%E7%BE%8E%E6%97%A5%E8%A8%98%E4%BB%BF%E7%94%9F%E8%86%9C%E7%B2%BE%E8%8F%AF%E5%8F%A3%E7%B4%85",
      "originalImageUrl": "https://aka.doubaocdn.com/l/4Ot09ZV3e3",
      "sourcePriority": "retailer",
      "rightsholder": "Perfect Diary 完美日记（逸仙电商）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1440,
      "height": 1440,
      "format": "JPEG",
      "bytes": 148747,
      "note": "来源：电商比价索引的官方产品渲染镜像；品牌全球站限流、日本站无固体口红 SKU。第三代「仿生膜」精华哑光口红白管银方底座，暖砖红膏体，旁附 DIARY 白盒；品牌全球站 products.json 限流、日本 Shopify 站仅有唇釉与唇部精华无固体口红 SKU，改用电商比价索引的官方产品渲染镜像，1440×1440；属 931/937 白管哑光系列。"
    }
  },
  {
    "id": "catalog-096",
    "sequence": "96",
    "brand": "花西子",
    "productName": "雕花口红",
    "officialProductName": "Blooming Rouge Engraved Lipstick 雕花口红",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "花西子雕花口红 唇釉哑光淡唇纹唇膏滋润保湿不沾杯精华灵动玉光",
    "officialStoreName": "花西子旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州宜格化妆品有限公司",
    "specification": "3.2g",
    "listPrice": 152,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=588946546497",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/96 花西子旗舰店（雕花口红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/96杭州宜格化妆品有限公司（花西子雕花口红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/96 花西子雕花口红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/96-huaxizi-雕花口红/cover.jpg",
      "sourcePageUrl": "https://florasis.com/products/blooming-rouge-engraved-lipstick-3",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0528/2486/7015/files/0.webp?v=1780020253",
      "sourcePriority": "brand_official",
      "rightsholder": "Florasis 花西子",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 1000,
      "format": "JPEG",
      "bytes": 54229,
      "note": "官网 Shopify CDN 主图，管盖与旋出雕花膏体并置，白底无手持无水印；源格式 webp 已转 JPG；合集主图未标注具体色号，800×1000。"
    }
  },
  {
    "id": "catalog-097",
    "sequence": "97",
    "brand": "NARS",
    "productName": "小粉金唇膏",
    "officialProductName": "Afterglow Sensual Shine Lipstick 「小粉金」细管水光唇膏",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "NARS小粉金唇膏口红滋润保湿888水光玫瑰 #277",
    "officialStoreName": "NARS官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "资生堂（中国）投资有限公司",
    "specification": "1.5g",
    "listPrice": 320,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=722111870373",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/97 NARS官方旗舰店（小粉金唇膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/97资生堂（中国）投资有限公司（NARS小粉金唇膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/97 NARS小粉金唇膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/97-nars-小粉金唇膏/cover.jpg",
      "sourcePageUrl": "https://www.narscosmetics.com.cn/NARS「小粉金」细管唇膏-水光缎色细管唇膏-NARS中国官网-SPU_20230614.html",
      "originalImageUrl": "https://www.narscosmetics.com.cn/dw/image/v2/BCSK_PRD/on/demandware.static/-/Sites-master-catalog-narscn/default/dwf195d016/images/SPU_20230614/ARAGON/1.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "NARS（资生堂集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 3000,
      "height": 3000,
      "format": "JPEG",
      "bytes": 261739,
      "note": "Afterglow Sensual Shine Lipstick，色号 ARAGON；双支白底主图含旋出膏体，无手持无文字遮挡，3000×3000。"
    }
  },
  {
    "id": "catalog-098",
    "sequence": "98",
    "brand": "橘朵",
    "productName": "缎光唇粉霜",
    "officialProductName": "Cushion Satin Lip Cream 缎光唇粉霜",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "Judydoll橘朵缎光唇粉霜唇泥唇釉唇蜜2.6ml",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "2.6ml",
    "listPrice": 70.4,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=737295425116",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/98 JUDYDOLL橘朵旗舰店（缎光唇粉霜）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/98上海橘朵化妆品有限公司（橘朵缎光唇粉霜）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/98 橘朵缎光唇粉霜",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/98-judydoll-缎光唇粉霜/cover.jpg",
      "sourcePageUrl": "https://cn.wooha.me/products?brandId=600700349",
      "originalImageUrl": "https://aka.doubaocdn.com/l/EZJg5WL6jp",
      "sourcePriority": "retailer",
      "rightsholder": "JUDYDOLL 橘朵",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 18147,
      "note": "官方站 judydoll.com 的 products.json / 商品页高峰限流（仅返回 18 字节），降级至正规零售商 WooHa 货架白底图；双支并置（合盖笔管+开盖海绵头），白底、无人物、无文字，色号 N18；图为 aka.doubaocdn 代理链。"
    }
  },
  {
    "id": "catalog-099",
    "sequence": "99",
    "brand": "橘朵",
    "productName": "小奶泥唇泥",
    "officialProductName": "Lip Mud 小奶泥唇泥",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "Judydoll橘朵小奶泥唇泥哑光裸色口红唇釉低饱和",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "3.3g",
    "listPrice": 69.8,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=644045096581",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/99 JUDYDOLL橘朵旗舰店（小奶泥唇泥）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/99上海橘朵化妆品有限公司（橘朵小奶泥唇泥）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/99 橘朵小奶泥唇泥",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/99-judydoll-小奶泥唇泥/cover.jpg",
      "sourcePageUrl": "https://cn.wooha.me/products?brandId=600700349",
      "originalImageUrl": "https://aka.doubaocdn.com/l/eXjIvvKzbi",
      "sourcePriority": "retailer",
      "rightsholder": "JUDYDOLL 橘朵",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 58116,
      "note": "同上，官方站限流后降级正规零售商 WooHa；管身+旋出刷头并置，白底、无人物、无文字，色号 P04；图为 aka.doubaocdn 代理链。"
    }
  },
  {
    "id": "catalog-100",
    "sequence": "100",
    "brand": "卡姿兰",
    "productName": "波波唇膏笔",
    "officialProductName": "波波唇膏笔",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "卡姿兰口红波波唇膏笔g03裸色唇釉镜面水光滋润固体唇蜜秋冬芭乐",
    "officialStoreName": "卡姿兰官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "芜湖华穗贸易有限公司",
    "specification": "3g",
    "listPrice": 93,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1056609217116",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/100 卡姿兰官方旗舰店（波波唇膏笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/100芜湖华穗贸易有限公司（卡姿兰波波唇膏笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/100 卡姿兰波波唇膏笔",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/100-carslan-波波唇膏笔/cover.png",
      "sourcePageUrl": "https://www.carslan.com.cn/chungaobijiazu/32",
      "originalImageUrl": "https://www.carslan.com.cn/uploads/upload/images/20260519/5e988e705ceef9d24ff90fe0fb2d7829.png",
      "sourcePriority": "brand_official",
      "rightsholder": "Carslan 卡姿兰",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 466,
      "height": 580,
      "format": "PNG",
      "bytes": 15567,
      "note": "官网唇膏笔整管白底图，笔身闭合状态；官网仅提供 466×580 缩略图无高清主图；未标注色号。"
    }
  },
  {
    "id": "catalog-101",
    "sequence": "101",
    "brand": "花知晓",
    "productName": "天鹅芭蕾唇釉",
    "officialProductName": "Swan Ballet Shine Lipstick 天鹅芭蕾水光唇膏",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "花知晓天鹅芭蕾唇釉镜面成膜口红不黏腻旗舰店",
    "officialStoreName": "花知晓旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州花知晓电子商务有限公司",
    "specification": "3.5g",
    "listPrice": 89,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=730936761531",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/101 花知晓旗舰店（天鹅芭蕾唇釉）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/101杭州花知晓电子商务有限公司（花知晓天鹅芭蕾唇釉）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/101 花知晓天鹅芭蕾唇釉",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/101-huazhixiao-天鹅芭蕾唇釉/cover.jpg",
      "sourcePageUrl": "https://flowerknows.co/products/swan-ballet-shine-lipstick-usa",
      "originalImageUrl": "https://cdn.shopify.com/s/files/1/0593/5418/5889/files/01_ab68d9e1-689e-4112-879c-9398702cb51d.jpg?v=1758248995",
      "sourcePriority": "brand_official",
      "rightsholder": "Flower Knows 花知晓",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1100,
      "height": 1375,
      "format": "JPEG",
      "bytes": 58706,
      "note": "海外官网定名 Swan Ballet Shine Lipstick（天鹅芭蕾水光唇膏），中文清单记作唇釉；粉蕾丝外壳与旋出膏体并置，白底主图；未标注具体色号，1100×1375。"
    }
  },
  {
    "id": "catalog-102",
    "sequence": "102",
    "brand": "MAC魅可",
    "productName": "水漾波光子弹头唇膏",
    "officialProductName": "Lustreglass Sheer-Shine Lipstick 水漾波光子弹头唇膏",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "MAC/魅可水漾波光子弹头口红唇膏滋润显色 544/543",
    "officialStoreName": "MAC魅可官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "3.5g",
    "listPrice": 200,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=653190375393",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/102 MAC魅可官方旗舰店（水漾波光子弹头唇膏）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/102雅诗兰黛（上海）商贸有限公司（MAC魅可水漾波光子弹头唇膏）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/102 MAC魅可水漾波光子弹头唇膏",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/102-mac-水漾波光子弹头/cover.jpg",
      "sourcePageUrl": "https://www.maccosmetics.com.cn/product/146511/",
      "originalImageUrl": "https://assets.stardust.wechat-mini.elco-cloud.cn/prod/MAC_WMP/assets/media/a426346c-8488-46f6-842c-d40c74098723/260823618-623e01c55e0942d.jpeg",
      "sourcePriority": "brand_official",
      "rightsholder": "MAC Cosmetics（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 700,
      "height": 700,
      "format": "JPEG",
      "bytes": 91000,
      "note": "Lustreglass Sheer-Shine 水漾波光黑管，开盖膏体与管盖并置，浅灰底无手持；官网 PDP 首次直连被重置后取官网素材 CDN 主图，700×700；未标注色号。"
    }
  },
  {
    "id": "catalog-103",
    "sequence": "103",
    "brand": "3CE",
    "productName": "柔雾管口红",
    "officialProductName": "Blur Matte Lipstick 柔雾管柔焦哑光口红",
    "category": "唇妆",
    "sourceCategory": "口红",
    "marketplaceTitle": "3CE柔雾管口红 丝绒持久唇膏肉桂色裸色女生礼物 T",
    "officialStoreName": "3CE官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "欧莱雅（中国）有限公司广东分公司",
    "specification": "4g",
    "listPrice": 139,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1027688916785",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/103 3CE官方旗舰店（柔雾管口红）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/103欧莱雅（中国）有限公司广东分公司（3CE柔雾管口红）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/103 3CE柔雾管口红",
    "image": {
      "localPath": "YasPretty产品图片/腮红口红图片/103-3ce-柔雾管口红/cover.jpg",
      "sourcePageUrl": "https://www.3cecosmetics.com/all-products/lips/lipstick/3ce-blur-matte-lipstick",
      "originalImageUrl": "https://www.3cecosmetics.com/-/media/project/loreal/brand-sites/tce/apac/int/en-image-assets/all-prouducts/lips/lipstick/blur-matte-lipstick/apricot-filter/blur-matte-lipstick_apricot-filter_pdp_pck.jpg",
      "sourcePriority": "brand_official",
      "rightsholder": "3CE（欧莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 760,
      "height": 960,
      "format": "JPEG",
      "bytes": 109451,
      "note": "Blur Matte Lipstick「柔雾管」，默认色 #Apricot Filter；银壳粉管 packshot，闭合管身与开盖膏体并置，760×960。"
    }
  },
  {
    "id": "catalog-104",
    "sequence": "104",
    "brand": "彩棠",
    "productName": "三色高光修容盘",
    "officialProductName": "彩棠浮光掠影高光修容盘",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "彩棠TIMAGE高光修容盘三色哑光珠光提亮粉阴影",
    "officialStoreName": "彩棠旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "宁波彩棠化妆品有限公司",
    "specification": "17g",
    "listPrice": 215,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=609588171364",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/104 彩棠旗舰店（三色高光修容盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/104宁波彩棠化妆品有限公司（彩棠三色高光修容盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/104 彩棠三色高光修容盘",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/104-caitang-三色高光修容盘/cover.jpg",
      "sourcePageUrl": "https://m.yami.com/us/zh/p/highlighter-contour-palette-three-color-matte-and-shimmer-brightening-powder-nose-contour-a02-highlighter-contour-palette-cool-atmosphere-makeup-recommended-for-fair-skin-5-2g/3194287931",
      "originalImageUrl": "https://aka.doubaocdn.com/l/Yk8u2bMPlB",
      "sourcePriority": "retailer",
      "rightsholder": "TIMAGE彩棠",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 750,
      "height": 750,
      "format": "JPEG",
      "bytes": 42985,
      "note": "官网caitangtimage.com为Nuxt渲染落地页且商品跳转天猫登录墙curl无法获取主图；降级至零售商亚米网Yami白底货架图图片经doubaocdn镜像；实测750×750未达800px；色号A02月晖清；开盖展示全部色块无手持模特水印及文字遮挡"
    }
  },
  {
    "id": "catalog-105",
    "sequence": "105",
    "brand": "橘朵",
    "productName": "高光修容盘",
    "officialProductName": "橘朵高光修容面部综合盘",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "【全新好气色面综盘】Judydoll橘朵高光修容盘阴影鼻影",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "9g",
    "listPrice": 70.4,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=675551302593",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/105 JUDYDOLL橘朵旗舰店（高光修容盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/105上海橘朵化妆品有限公司（橘朵高光修容盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/105 橘朵高光修容盘",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/105-judydoll-高光修容盘/cover.jpg",
      "sourcePageUrl": "https://cn.wooha.me/products?brandId=600700349",
      "originalImageUrl": "https://aka.doubaocdn.com/l/7zKpIsVbl8",
      "sourcePriority": "retailer",
      "rightsholder": "JUDYDOLL橘朵",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 45003,
      "note": "官网judydoll.com限流返回429共18字节；降级至零售商WooHa品牌页白底货架图图片经doubaocdn镜像；实测800×800；色号#02树影盘；开盖展示全部色块无手持模特水印及文字遮挡"
    }
  },
  {
    "id": "catalog-106",
    "sequence": "106",
    "brand": "花西子",
    "productName": "蝶翼清影高光修容一体盘",
    "officialProductName": "蝶翼清影修容盘 01扶光蝶影",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "花西子蝶翼清影高光修容一体盘腮红眼影提亮阴影侧影多用送礼物女",
    "officialStoreName": "花西子旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州宜格化妆品有限公司",
    "specification": "15g",
    "listPrice": 188,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=935413896357",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/106 花西子旗舰店（蝶翼清影高光修容一体盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/106杭州宜格化妆品有限公司（花西子蝶翼清影高光修容一体盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/106 花西子蝶翼清影高光修容一体盘",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/106-huaxizi-蝶翼清影高光修容一体盘/cover.jpg",
      "sourcePageUrl": "https://www.kakabuy.com.au/search.php?encode=YToxNTp7czo4OiJrZXl3b3JkcyI7czowOiIiO3M6MToiY2F0ZWdvcnkiO3M6MToiMCI7czo1OiJicmFuZCI7czoxOiIwIjtzOjExOiJmaWx0ZXJfYXR0ciI7czoxOiIwIjtzOjk6InByaWNlX21pbiI7czoyOiIzOCI7czo5OiJwcmljZV9tYXgiO3M6MjoiNTUiO3M6MToiYWN0aW9uIjtzOjA6IiI7czo1OiJpbnRybyI7czoxOiJmb3JfYXR0ciI7czoxOiIwIjtzOjQ6InBhZ2UiO3M6MToiNSI7czo0OiJzb3J0IjtzOjg6Imdvb2RzX2lkIjtzOjU6Im9yZGVyIjtzOjQ6ImRlc2MiO3M6MTg6Imdvb2RzX2lkIjtpOjE3NjYxNDYyMDIyO30=",
      "originalImageUrl": "https://aka.doubaocdn.com/l/3ITk7SgG25",
      "sourcePriority": "retailer",
      "rightsholder": "花西子 Florasis",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 38326,
      "note": "官网florasis.com被Cloudflare人机验证拦截（429/403），中国官网huaxizi.com为静态品牌落地页未暴露单品图，天猫/京东原图有登录墙或水印未重试；降级至零售商澳洲Kakabuy收录的品牌白底货架图，图片经doubaocdn镜像；实测800×800；色号01扶光蝶影；开盖展示全部色块，无手持、模特、水印及文字遮挡"
    }
  },
  {
    "id": "catalog-107",
    "sequence": "107",
    "brand": "花知晓",
    "productName": "巧克力高光修容三色盘",
    "officialProductName": "巧克力商店高光修容盘 Chocolate Wonder Shop Highlighter & Contour Palette",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "花知晓巧克力高光修容三色一体哑光修饰旗舰店",
    "officialStoreName": "花知晓旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "杭州花知晓电子商务有限公司",
    "specification": "16g",
    "listPrice": 149,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1096467048332",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/107 花知晓旗舰店（巧克力高光修容三色盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/107杭州花知晓电子商务有限公司（花知晓巧克力高光修容三色盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/107 花知晓巧克力高光修容三色盘",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/107-huazhixiao-巧克力高光修容三色盘/cover.png",
      "sourcePageUrl": "https://flowerknows.jp/series/chocolate-series/",
      "originalImageUrl": "https://blili.jp/wp/wp-content/uploads/2022/12/chocohigh.png",
      "sourcePriority": "brand_official",
      "rightsholder": "Flower Knows 花知晓",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1000,
      "height": 1000,
      "format": "PNG",
      "bytes": 1045398,
      "note": "日本官方站flowerknows.jp商品主图，图床为官方代理blili.jp；白底开盖展示全部色块，另附闭合盒面；实测1000×1000；无人物、手持、水印及文字遮挡"
    }
  },
  {
    "id": "catalog-108",
    "sequence": "108",
    "brand": "MAC魅可",
    "productName": "小金盒高光修容盘",
    "officialProductName": "SCULPT & GLOW DUO-DOUBLE 小金盒高光修容盘（魅可修容高光双色盘，Double Gleam 生姜高光 / Omega 阴影修容，3.5g×2）",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "MAC/魅可小金盒生姜高光修容盘哑光鼻影阴影omega",
    "officialStoreName": "MAC魅可官方旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "雅诗兰黛（上海）商贸有限公司",
    "specification": "3.5g+3.5g",
    "listPrice": 380,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1063617091783",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/108 MAC魅可官方旗舰店（小金盒高光修容盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/108雅诗兰黛（上海）商贸有限公司（MAC魅可小金盒高光修容盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/108 MAC魅可小金盒高光修容盘",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/108-mac-小金盒高光修容盘/cover.png",
      "sourcePageUrl": "https://www.maccosmetics.com.cn/product/96335/",
      "originalImageUrl": "https://sdcdn.io/mac/wc/mac_sku_SRLA01_1x1_0.png",
      "sourcePriority": "brand_official",
      "rightsholder": "MAC 魅可（雅诗兰黛集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 3000,
      "height": 3000,
      "format": "PNG",
      "bytes": 6301918,
      "note": "品牌官网素材 CDN（sdcdn.io）直采官方主图；整盒开盖斜俯拍，内置镜盖，Omega 修容（波浪纹米灰棕）与 Double Gleam 生姜高光（菱格纹香槟金）双色块完整可见，金色外壳印 MAC，纯白底，无人物、无手持、无促销角标、无水印；分辨率 3000×3000；中国官网 PDP 可正常访问，美国/英国/加拿大站 PDP 此前 429/403 限流未重试。"
    }
  },
  {
    "id": "catalog-109",
    "sequence": "109",
    "brand": "彩棠",
    "productName": "双拼高光",
    "officialProductName": "柔影沁纱双效高光盘（双拼高光粉膏）01日影柔，高光膏3g+高光粉5g 增量版8g",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "彩棠TIMAGE双拼高光膏粉一体哑光珠光提亮元气",
    "officialStoreName": "彩棠旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "宁波彩棠化妆品有限公司",
    "specification": "3g+5g",
    "listPrice": 170,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=653225360063",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/109 彩棠旗舰店（双拼高光）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/109宁波彩棠化妆品有限公司（彩棠双拼高光）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/109 彩棠双拼高光",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/109-caitang-双拼高光/cover.jpg",
      "sourcePageUrl": "https://www.kakabuy.com.au/brand-2759-c0-stock1-1-shop_price-DESC.html",
      "originalImageUrl": "https://aka.doubaocdn.com/l/oM5sDncyDm",
      "sourcePriority": "retailer",
      "rightsholder": "彩棠 TIMAGE（珀莱雅集团）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1440,
      "height": 1440,
      "format": "JPEG",
      "bytes": 77031,
      "note": "品牌官网 caitangtimage.com 为 Nuxt JS 渲染，/app-api 商品接口返回 401 需登录，天猫/京东商品页为登录墙或带水印，未能直采官网主图；降级为正规零售商（澳洲 Kakabuy 彩棠品牌聚合页）收录的品牌白底产品图，非官网直采；整盘开盖正面，镜盖翻开，左侧高光膏（米粉色）与右侧哑光高光粉（米白色，盘面浮雕 T 标识）双色块完整可见，浅蓝加金色外壳，纯白底，无人物、无手持、无文字遮挡、无角标、无水印；01日影柔（黄调自然、橄榄偏深肤色）；分辨率 1440×1440；亚米 Yami 页面被 AWS WAF JS 挑战拦截（HTTP 202）未能取图。"
    }
  },
  {
    "id": "catalog-110",
    "sequence": "110",
    "brand": "橘朵",
    "productName": "斜修双头修容笔",
    "officialProductName": "Dual-Ended Contour Stick 斜修双头修容笔",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "Judydoll橘朵斜修双头修容笔高光提亮液体鼻影面部立体阴影修容棒",
    "officialStoreName": "JUDYDOLL橘朵旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海橘朵化妆品有限公司",
    "specification": "0.9g",
    "listPrice": 51,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=1042710642772",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/110 JUDYDOLL橘朵旗舰店（斜修双头修容笔）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/110上海橘朵化妆品有限公司（橘朵斜修双头修容笔）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/110 橘朵斜修双头修容笔",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/110-judydoll-斜修双头修容笔/cover.jpg",
      "sourcePageUrl": "https://www.am10.com/Qe0RXar9GbsVGa1yp5Ymq5/zl",
      "originalImageUrl": "https://aka.doubaocdn.com/l/TDYiU9crhH",
      "sourcePriority": "retailer",
      "rightsholder": "JUDYDOLL 橘朵",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 800,
      "height": 800,
      "format": "JPEG",
      "bytes": 28572,
      "note": "官网 judydoll.com 同时段 products.json 与商品页均仅返回 18 字节限流，韩站同款商品页 404，按预案降级电商授权商品图（经 CDN 镜像）；双支并置：合盖笔身 + 开盖修容膏斜头与海绵提亮头，白底、无人物、无文字水印；官网在售款名 Dual-Ended Contour Stick（#01 Cool & Olive / #02 Warm），本图未标注色号。"
    }
  },
  {
    "id": "catalog-111",
    "sequence": "111",
    "brand": "too cool for school涂酷",
    "productName": "三色修容盘",
    "officialProductName": "Artclass By Rodin Shading 三色修容盘",
    "category": "修容",
    "sourceCategory": "修容",
    "marketplaceTitle": "too cool for school涂酷三色修容盘阴影高光侧影鼻影眼影一体盘1",
    "officialStoreName": "toocoolforschool旗舰店",
    "officialStoreFlag": "是",
    "officialMarkerType": "两者都有",
    "businessEntity": "上海涂酷供应链管理有限公司",
    "specification": "9.5g",
    "listPrice": 99,
    "priceNote": "最终价格以结算页实际显示为准",
    "productUrl": "https://detail.tmall.com/item.htm?id=538468410513",
    "verifiedAt": "2026-11-18",
    "reviewStatus": "已完成",
    "storeEvidencePath": "产品核验信息/店铺首页截图/111 toocoolforschool旗舰店（三色修容盘）.jpg",
    "qualificationEvidencePath": "产品核验信息/企业工商资质/111上海涂酷供应链管理有限公司（too cool for school涂酷三色修容盘）.png",
    "detailEvidencePath": "产品核验信息/商品详情页/111 too cool for school涂酷三色修容盘",
    "image": {
      "localPath": "YasPretty产品图片/修容图片/修容图片/111-toocoolforschool-三色修容盘/cover.jpg",
      "sourcePageUrl": "https://imagebeautystore.com/product/too-cool-for-school-artclass-by-rodin-shading-1-classic-%E9%9F%A9%E5%9B%BD-too-cool-for-school-%E6%B6%82%E9%85%B7-%E4%BF%AE%E5%AE%89%E7%9B%98%E4%B8%89%E8%89%B2%E9%AB%98%E5%85%89%E9%81%AE%E7%91%95-1/",
      "originalImageUrl": "https://aka.doubaocdn.com/l/0TLMjxV03n",
      "sourcePriority": "retailer",
      "rightsholder": "too cool for school（韩国）",
      "authorizationStatus": "pending",
      "allowedUse": "internal_only",
      "acquiredAt": "2026-11-19",
      "width": 1000,
      "height": 1000,
      "format": "JPEG",
      "bytes": 136213,
      "note": "官网 toocoolforschool.com 对应商品页现为 cafe24 404、Shopify 镜像站 products/<handle>.js 持续返回 18 字节限流，按预案改用正规零售商渠道收录的品牌官方白底包图；开盖展示三色渐变全色块（#01 Classic 暖棕），闭合盖面 Artclass 烫印可见，无手持、无文字角标；1000×1000。"
    }
  }
]

const expansionRecordCorrections = {
  'catalog-037': {
    officialProductName: null,
    reviewStatus: 'identity_conflict',
    dataIssues: ['参数截图实际对应“薇诺娜焕亮修颜防晒乳”，并非工作表目标“薇诺娜水光裸肌素颜霜”；截图版本与目标商品存在差异，保留人工核验表规格。'],
    image: { note: '包装文字可见“薇诺娜 水光裸肌素颜霜 Tone-Up Cream”；图片与产品名称映射来自图片来源清单。参数截图对应焕亮修颜防晒乳，截图版本差异保留说明。' },
  },
  'catalog-041': {
    officialProductName: '丝芙兰元气霜',
    reviewStatus: 'identity_conflict',
    dataIssues: ['详情参数截图为第四代盈亮元气霜，工作表目标为柠檬籽元气霜；截图版本差异保留说明，商品规格按人工核验表展示。'],
    image: { note: '图片来源记录及工作表商品名指向柠檬籽元气霜；详情参数截图显示第四代盈亮元气霜和多规格变体，版本与规格待复核。' },
  },
  'catalog-042': {
    officialProductName: 'WHITE HOLIC QUICK WHITENING CREAM（화이트홀릭 퀵 화이트닝 크림）',
    parameterFacts: [{ label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/42WLAB 素颜霜/参数信息.png' }],
  },
  'catalog-040': {
    parameterFacts: [
      { label: '参数页商品名称', value: 'JNJE养肤持妆素颜霜', evidencePath: '产品核验信息/商品详情页/40JNJE 素颜霜/参数信息.png' },
      { label: '截图标示规格', value: '50g（与人工核验表一致）', evidencePath: '产品核验信息/商品详情页/40JNJE 素颜霜/576f593ea43fe1ee66773a46c30b1e12.png' },
      { label: '商品类别', value: '素颜霜', evidencePath: '产品核验信息/商品详情页/40JNJE 素颜霜/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/40JNJE 素颜霜/参数信息.png' },
      { label: '商详标注功效文案', value: '自然提亮、均匀肤色、水润保湿、轻盈服帖（仅转录页面文案，不作为功效验证）', evidencePath: '产品核验信息/商品详情页/40JNJE 素颜霜/参数信息.png' },
    ],
  },
  'catalog-043': {
    officialProductName: 'PULJIM 宝玑米沁透防晒素颜霜',
    parameterFacts: [
      { label: '参数页商品名称', value: 'PULJIM宝玑米沁透防晒素颜霜', evidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜/参数信息.png' },
      { label: '页面列示规格选项', value: '100g、20g、5g；目标商品规格以表格100g为准', evidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜/参数信息.png' },
      { label: '页面所列颜色名', value: '柔雾紫（仅转录页面选项，不作为肤色适配结论）', evidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜/参数信息.png' },
      { label: '商详标注类别', value: '素颜霜', evidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜/参数信息.png' },
      { label: '商详标注功效文案', value: '防晒、保湿（页面宣称，非独立功效验证）', evidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜/参数信息.png' },
      { label: '商详适用肤色文案', value: '黄皮、黑黄皮及肤色不均匀（仅页面原文，不作为适配结论）', evidencePath: '产品核验信息/商品详情页/43宝玑米素颜霜/参数信息.png' },
    ],
  },
  'catalog-044': {
    parameterFacts: [
      { label: '参数页商品名称', value: '卡姿兰明星素颜霜01、02', evidencePath: '产品核验信息/商品详情页/44卡姿兰素颜霜/参数信息.png' },
      { label: '截图标示净含量', value: '50g（与人工核验表一致）', evidencePath: '产品核验信息/商品详情页/44卡姿兰素颜霜/参数信息.png' },
      { label: '商详标示保质期', value: '3年', evidencePath: '产品核验信息/商品详情页/44卡姿兰素颜霜/参数信息.png' },
      { label: '商详标示储存提示', value: '干燥阴凉处存放，避免阳光直射', evidencePath: '产品核验信息/商品详情页/44卡姿兰素颜霜/参数信息.png' },
    ],
    dataIssues: ['参数截图同时列示明星素颜霜01、02，但未明确人工核验表目标对应的具体版本；规格按表格50g记录，版本对应关系待复核。'],
  },
  'catalog-045': {
    officialProductName: 'NARS 流光美肌润色妆前乳（Pure Radiant Tinted Moisturizer SPF 30/PA+++）',
    parameterFacts: [{ label: '防晒标识', value: 'SPF30/PA+++', evidencePath: '产品核验信息/商品详情页/45NARS 有色素颜霜/参数信息.png' }],
    image: { note: 'NARS 欧洲站产品图；详情截图支持 NARS 流光美肌润色妆前乳、30ml，并显示 SPF30/PA+++。来源图片具体色号不作为网页参数。' },
  },
  'catalog-036': {
    parameterFacts: [{ label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/36蒂佳婷 V7 素颜霜/蒂佳婷1.png' }],
  },
  'catalog-038': {
    officialProductName: '柔光焕颜持妆隔离霜',
    parameterFacts: [{ label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/38尔木萄素颜霜/参数信息.png' }],
  },
  'catalog-039': {
    parameterFacts: [
      { label: '产地', value: '日本', evidencePath: '产品核验信息/商品详情页/39CPB 光采隔离素颜霜/参数信息.png' },
      { label: '防晒标识', value: 'SPF25 PA++', evidencePath: '产品核验信息/商品详情页/39CPB 光采隔离素颜霜/参数信息.png' },
    ],
  },
  'catalog-046': {
    parameterFacts: [
      { label: '净含量', value: '1支', evidencePath: '产品核验信息/商品详情页/46 植村秀经典砍刀眉笔/参数信息.png' },
      { label: '页面标注防水性能', value: '中度防水', evidencePath: '产品核验信息/商品详情页/46 植村秀经典砍刀眉笔/参数信息.png' },
      { label: '笔头/刷头样式', value: '刀锋', evidencePath: '产品核验信息/商品详情页/46 植村秀经典砍刀眉笔/参数信息.png' },
      { label: '彩妆分类', value: '眉笔', evidencePath: '产品核验信息/商品详情页/46 植村秀经典砍刀眉笔/参数信息.png' },
    ],
  },
  'catalog-047': {
    parameterFacts: [
      { label: '净含量', value: '1支', evidencePath: '产品核验信息/商品详情页/47 植村秀自动砍刀眉笔/参数信息.png' },
      { label: '页面标注防水性能', value: '轻度防水', evidencePath: '产品核验信息/商品详情页/47 植村秀自动砍刀眉笔/参数信息.png' },
      { label: '产地', value: '日本', evidencePath: '产品核验信息/商品详情页/47 植村秀自动砍刀眉笔/参数信息.png' },
      { label: '商品类别', value: '眉笔', evidencePath: '产品核验信息/商品详情页/47 植村秀自动砍刀眉笔/参数信息.png' },
    ],
  },
  'catalog-048': {
    parameterFacts: [
      { label: '净含量', value: '1.8g', evidencePath: '产品核验信息/商品详情页/48 橘朵砍刀眉笔/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/48 橘朵砍刀眉笔/参数信息.png' },
      { label: '页面标注防水性能', value: '轻度防水', evidencePath: '产品核验信息/商品详情页/48 橘朵砍刀眉笔/参数信息.png' },
      { label: '笔头/刷头样式', value: '刀锋', evidencePath: '产品核验信息/商品详情页/48 橘朵砍刀眉笔/参数信息.png' },
    ],
  },
  'catalog-049': {
    parameterFacts: [
      { label: '净含量', value: '120mg', evidencePath: '产品核验信息/商品详情页/49 橘朵精塑自动眉笔/参数信息.png' },
      { label: '产地', value: '中国大陆', evidencePath: '产品核验信息/商品详情页/49 橘朵精塑自动眉笔/参数信息.png' },
      { label: '页面标注防水性能', value: '中度防水', evidencePath: '产品核验信息/商品详情页/49 橘朵精塑自动眉笔/参数信息.png' },
      { label: '彩妆分类', value: '眉笔', evidencePath: '产品核验信息/商品详情页/49 橘朵精塑自动眉笔/参数信息.png' },
    ],
  },
  'catalog-050': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/50 橘朵染眉膏/参数信息.png' },
      { label: '商品类别', value: '染眉膏', evidencePath: '产品核验信息/商品详情页/50 橘朵染眉膏/参数信息.png' },
      { label: '页面标注防水性能', value: '轻度防水', evidencePath: '产品核验信息/商品详情页/50 橘朵染眉膏/参数信息.png' },
    ],
  },
  'catalog-051': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/51 花西子首乌眉粉笔/参数信息.png' },
      { label: '页面标注防水性能', value: '防水', evidencePath: '产品核验信息/商品详情页/51 花西子首乌眉粉笔/参数信息.png' },
      { label: '线条粗细', value: '细', evidencePath: '产品核验信息/商品详情页/51 花西子首乌眉粉笔/参数信息.png' },
      { label: '页面列示色号', value: '01 螺黛灰', evidencePath: '产品核验信息/商品详情页/51 花西子首乌眉粉笔/参数信息.png' },
    ],
  },
  'catalog-052': {
    parameterFacts: [
      { label: '净含量', value: '280mg', evidencePath: '产品核验信息/商品详情页/52 完美日记双头六角眉笔/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/52 完美日记双头六角眉笔/参数信息.png' },
      { label: '页面标注防水性能', value: '强力防水', evidencePath: '产品核验信息/商品详情页/52 完美日记双头六角眉笔/参数信息.png' },
      { label: '页面列示色号', value: '01自然灰、02深棕色、03浅棕色、04棕色、05咖啡色', evidencePath: '产品核验信息/商品详情页/52 完美日记双头六角眉笔/参数信息.png' },
    ],
  },
  'catalog-053': {
    parameterFacts: [
      { label: '净含量', value: '3.6g', evidencePath: '产品核验信息/商品详情页/53 卡姿兰眉粉/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/53 卡姿兰眉粉/参数信息.png' },
      { label: '彩妆分类', value: '眉笔眉粉眉刷三合一', evidencePath: '产品核验信息/商品详情页/53 卡姿兰眉粉/参数信息.png' },
      { label: '页面列示色号', value: '02眉晕如烟、01梦幻大地', evidencePath: '产品核验信息/商品详情页/53 卡姿兰眉粉/参数信息.png' },
    ],
  },
  'catalog-054': {
    parameterFacts: [
      { label: '净含量', value: '3.6g', evidencePath: '产品核验信息/商品详情页/54 深蓝彩妆黑魅双色眉粉/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/54 深蓝彩妆黑魅双色眉粉/参数信息.png' },
      { label: '页面列示色号', value: '02（棕灰色+浅棕色）', evidencePath: '产品核验信息/商品详情页/54 深蓝彩妆黑魅双色眉粉/参数信息.png' },
    ],
  },
  'catalog-055': {
    parameterFacts: [
      { label: '净含量', value: '3.3g', evidencePath: '产品核验信息/商品详情页/55 玛丽黛佳三色眉粉/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/55 玛丽黛佳三色眉粉/参数信息.png' },
      { label: '商品类别', value: '眉粉', evidencePath: '产品核验信息/商品详情页/55 玛丽黛佳三色眉粉/参数信息.png' },
      { label: '页面列示色号', value: 'BR-2深棕色、BR-1浅棕色', evidencePath: '产品核验信息/商品详情页/55 玛丽黛佳三色眉粉/参数信息.png' },
    ],
  },
  'catalog-056': {
    parameterFacts: [
      { label: '颜色数', value: '9色', evidencePath: '产品核验信息/商品详情页/56 3CE九色时妆盘/参数信息.png' },
      { label: '净含量', value: '8g', evidencePath: '产品核验信息/商品详情页/56 3CE九色时妆盘/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/56 3CE九色时妆盘/参数信息.png' },
      { label: '商详标注适用肤质', value: '多种肤质（敏感肌除外）', evidencePath: '产品核验信息/商品详情页/56 3CE九色时妆盘/参数信息.png' },
    ],
  },
  'catalog-057': {
    parameterFacts: [
      { label: '颜色数', value: '4色', evidencePath: '产品核验信息/商品详情页/57 3CE四色眼影盘/参数信息.png' },
      { label: '净含量', value: '3.2g', evidencePath: '产品核验信息/商品详情页/57 3CE四色眼影盘/参数信息.png' },
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/57 3CE四色眼影盘/参数信息.png' },
      { label: '商详标注适用肤质', value: '多种肤质（敏感肌除外）', evidencePath: '产品核验信息/商品详情页/57 3CE四色眼影盘/参数信息.png' },
    ],
  },
  'catalog-058': {
    parameterFacts: [
      { label: '颜色数', value: '12色', evidencePath: '产品核验信息/商品详情页/58 3CE十二色眼影盘/参数信息.png' },
      { label: '净含量', value: '9.5g', evidencePath: '产品核验信息/商品详情页/58 3CE十二色眼影盘/参数信息.png' },
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/58 3CE十二色眼影盘/参数信息.png' },
    ],
  },
  'catalog-059': {
    parameterFacts: [
      { label: '颜色数', value: '7色', evidencePath: '产品核验信息/商品详情页/59 橘朵玩趣七色眼影盘/参数信息.png' },
      { label: '净含量', value: '8.5g', evidencePath: '产品核验信息/商品详情页/59 橘朵玩趣七色眼影盘/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/59 橘朵玩趣七色眼影盘/参数信息.png' },
      { label: '商详标注适用肤质', value: '普通肤质', evidencePath: '产品核验信息/商品详情页/59 橘朵玩趣七色眼影盘/参数信息.png' },
    ],
  },
  'catalog-060': {
    parameterFacts: [
      { label: '净含量', value: '14g', evidencePath: '产品核验信息/商品详情页/60 完美日记探险家十二色动物眼影盘/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/60 完美日记探险家十二色动物眼影盘/参数信息.png' },
      { label: '页面品名', value: '探险家十二色眼影金虎墨猫盘', evidencePath: '产品核验信息/商品详情页/60 完美日记探险家十二色动物眼影盘/参数信息.png' },
    ],
  },
  'catalog-061': {
    parameterFacts: [
      { label: '颜色数', value: '3色', evidencePath: '产品核验信息/商品详情页/61 完美日记三色速绘精华动物眼影棒/参数信息.png' },
      { label: '净含量', value: '2.8g', evidencePath: '产品核验信息/商品详情页/61 完美日记三色速绘精华动物眼影棒/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/61 完美日记三色速绘精华动物眼影棒/参数信息.png' },
      { label: '商详标注适用肤质', value: '普通肤质', evidencePath: '产品核验信息/商品详情页/61 完美日记三色速绘精华动物眼影棒/参数信息.png' },
    ],
  },
  'catalog-062': {
    parameterFacts: [
      { label: '净含量', value: '6.5g', evidencePath: '产品核验信息/商品详情页/62 花知晓天鹅芭蕾六色眼影盘/参数信息.png' },
      { label: '页面产地信息', value: '同时标示“产地：中国”和“国产/进口：进口”，信息冲突，待核验', evidencePath: '产品核验信息/商品详情页/62 花知晓天鹅芭蕾六色眼影盘/参数信息.png' },
      { label: '页面列示颜色', value: '01白天鹅、03粉天鹅', evidencePath: '产品核验信息/商品详情页/62 花知晓天鹅芭蕾六色眼影盘/参数信息.png' },
    ],
    dataIssues: ['详情截图同时标示“产地：中国”和“国产/进口：进口”，产地字段冲突，待核验。'],
  },
  'catalog-063': {
    parameterFacts: [
      { label: '净含量', value: '4.4g', evidencePath: '产品核验信息/商品详情页/63 NARS四色眼影盘/参数信息.png' },
      { label: '产地', value: '加拿大', evidencePath: '产品核验信息/商品详情页/63 NARS四色眼影盘/参数信息.png' },
      { label: '商详标注适用肤质', value: '多种肤质（敏感肌除外）', evidencePath: '产品核验信息/商品详情页/63 NARS四色眼影盘/参数信息.png' },
    ],
  },
  'catalog-064': {
    parameterFacts: [
      { label: '净含量', value: '6.1g', evidencePath: '产品核验信息/商品详情页/64 美宝莲六色眼影盘/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/64 美宝莲六色眼影盘/参数信息.png' },
      { label: '页面版本', value: '六色眼影盘（截图所选版本）', evidencePath: '产品核验信息/商品详情页/64 美宝莲六色眼影盘/参数信息.png' },
    ],
  },
  'catalog-065': {
    parameterFacts: [
      { label: '净含量', value: '1g', evidencePath: '产品核验信息/商品详情页/65 MAC魅可小眼影/参数信息.png' },
      { label: '产地字段', value: '其他/other（截图原文；具体产地未明确）', evidencePath: '产品核验信息/商品详情页/65 MAC魅可小眼影/参数信息.png' },
      { label: '页面品名', value: '魅可新时尚焦点闪耀星泽系列小眼影', evidencePath: '产品核验信息/商品详情页/65 MAC魅可小眼影/参数信息.png' },
    ],
  },
  'catalog-066': {
    parameterFacts: [
      { label: '页面眼线产品分类', value: '砍刀眼线胶笔', evidencePath: '产品核验信息/商品详情页/66 橘朵砍刀眼线胶笔/参数信息.png' },
      { label: '页面标注是否防水', value: '是', evidencePath: '产品核验信息/商品详情页/66 橘朵砍刀眼线胶笔/参数信息.png' },
      { label: '页面列示色号', value: '01黑棕、02深棕、04奶茶棕等', evidencePath: '产品核验信息/商品详情页/66 橘朵砍刀眼线胶笔/参数信息.png' },
    ],
  },
  'catalog-067': {
    parameterFacts: [
      { label: '净含量', value: '0.4g', evidencePath: '产品核验信息/商品详情页/67 橘朵极细眼线液笔/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/67 橘朵极细眼线液笔/参数信息.png' },
      { label: '页面标注是否防水', value: '是', evidencePath: '产品核验信息/商品详情页/67 橘朵极细眼线液笔/参数信息.png' },
      { label: '商品类别', value: '眼线液笔', evidencePath: '产品核验信息/商品详情页/67 橘朵极细眼线液笔/参数信息.png' },
    ],
  },
  'catalog-068': {
    parameterFacts: [
      { label: '商品类别', value: '眼线笔', evidencePath: '产品核验信息/商品详情页/68 植村秀如胶似漆眼线笔/参数信息.png' },
      { label: '产地', value: '日本', evidencePath: '产品核验信息/商品详情页/68 植村秀如胶似漆眼线笔/参数信息.png' },
      { label: '页面标注是否防水', value: '是', evidencePath: '产品核验信息/商品详情页/68 植村秀如胶似漆眼线笔/参数信息.png' },
    ],
  },
  'catalog-069': {
    parameterFacts: [
      { label: '商品类别', value: '眼线液笔', evidencePath: '产品核验信息/商品详情页/69 美宝莲小金笔眼线液笔/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/69 美宝莲小金笔眼线液笔/参数信息.png' },
      { label: '页面标注是否防水', value: '是', evidencePath: '产品核验信息/商品详情页/69 美宝莲小金笔眼线液笔/参数信息.png' },
    ],
  },
  'catalog-070': {
    parameterFacts: [
      { label: '商品类别', value: '眼线液笔', evidencePath: '产品核验信息/商品详情页/70 完美日记纤细持久眼线液笔/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/70 完美日记纤细持久眼线液笔/参数信息.png' },
      { label: '页面标注是否防水', value: '是', evidencePath: '产品核验信息/商品详情页/70 完美日记纤细持久眼线液笔/参数信息.png' },
    ],
  },
  'catalog-071': {
    parameterFacts: [
      { label: '商品类别', value: '双头眼线胶笔', evidencePath: '产品核验信息/商品详情页/71 花西子双头眼线胶笔/参数信息.png' },
      { label: '产地', value: '中国大陆', evidencePath: '产品核验信息/商品详情页/71 花西子双头眼线胶笔/参数信息.png' },
      { label: '页面列示色号', value: '01松烟黛墨、02松烟琥珀', evidencePath: '产品核验信息/商品详情页/71 花西子双头眼线胶笔/参数信息.png' },
    ],
  },
  'catalog-072': {
    parameterFacts: [
      { label: '商品名称', value: '立体卷翘金属睫毛膏', evidencePath: '产品核验信息/商品详情页/72 橘朵钢管睫毛膏/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/72 橘朵钢管睫毛膏/参数信息.png' },
      { label: '页面标注防水性能', value: '支持防水', evidencePath: '产品核验信息/商品详情页/72 橘朵钢管睫毛膏/参数信息.png' },
      { label: '页面版本选项', value: '页面还列示纤长睫毛打底膏5ml；本条商品规格以核验表记录3g为准', evidencePath: '产品核验信息/商品详情页/72 橘朵钢管睫毛膏/参数信息.png' },
    ],
    dataIssues: ['详情截图列示双翼款钢管睫毛膏与纤长睫毛打底膏等版本；本条商品规格以核验表记录3g为准。'],
  },
  'catalog-073': {
    parameterFacts: [
      { label: '净含量', value: '9.2ml', evidencePath: '产品核验信息/商品详情页/73 美宝莲粉胖子摩天翘睫毛膏/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/73 美宝莲粉胖子摩天翘睫毛膏/参数信息.png' },
      { label: '商详标注产品分类', value: '单头睫毛膏', evidencePath: '产品核验信息/商品详情页/73 美宝莲粉胖子摩天翘睫毛膏/参数信息.png' },
    ],
  },
  'catalog-074': {
    parameterFacts: [
      { label: '产地', value: '意大利', evidencePath: '产品核验信息/商品详情页/74 NARS耀目立体定型睫毛膏/参数信息.png' },
    ],
  },
  'catalog-075': {
    parameterFacts: [
      { label: '净含量', value: '12g', evidencePath: '产品核验信息/商品详情页/75 卡姿兰双头睫毛膏/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/75 卡姿兰双头睫毛膏/参数信息.png' },
      { label: '商详标注产品分类', value: '双头睫毛膏', evidencePath: '产品核验信息/商品详情页/75 卡姿兰双头睫毛膏/参数信息.png' },
    ],
  },
  'catalog-076': {
    parameterFacts: [
      { label: '净含量', value: '4.5g', evidencePath: '产品核验信息/商品详情页/76 完美日记睫毛膏/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/76 完美日记睫毛膏/参数信息.png' },
      { label: '页面列示颜色', value: '黑色、棕色', evidencePath: '产品核验信息/商品详情页/76 完美日记睫毛膏/参数信息.png' },
    ],
  },
  'catalog-077': {
    parameterFacts: [
      { label: '净含量', value: '3ml', evidencePath: '产品核验信息/商品详情页/77 花西子松烟纤细睫毛膏/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/77 花西子松烟纤细睫毛膏/参数信息.png' },
      { label: '页面所选分类', value: '纤细版', evidencePath: '产品核验信息/商品详情页/77 花西子松烟纤细睫毛膏/参数信息.png' },
    ],
  },
  'catalog-078': {
    parameterFacts: [
      { label: '产地', value: '加拿大', evidencePath: '产品核验信息/商品详情页/78 NARS腮红/参数信息.png' },
      { label: '商详标注质地类别', value: '粉状', evidencePath: '产品核验信息/商品详情页/78 NARS腮红/参数信息.png' },
      { label: '页面列示色号', value: 'SEX APPEAL、SLOW BURN、ORGASM、IMPASSIONED、BEHAVE、SEX FANTASY 等', evidencePath: '产品核验信息/商品详情页/78 NARS腮红/参数信息.png' },
    ],
  },
  'catalog-079': {
    parameterFacts: [
      { label: '产地', value: '意大利', evidencePath: '产品核验信息/商品详情页/79 倩碧小雏菊腮红/参数信息.png' },
      { label: '页面列示色号', value: 'HOT 05 NUDE POP、19 BLUSH POP、21 BALLERINA POP、HOT 15 PANSY POP、08 MELON POP、18 PINK HONEY POP、10 FIG POP、02 PEACH POP、17 BLACK HONEY POP、07 COLA POP、14 HEATHER POP 等', evidencePath: '产品核验信息/商品详情页/79 倩碧小雏菊腮红/参数信息.png' },
    ],
  },
  'catalog-080': {
    parameterFacts: [
      { label: '产地字段', value: '其他/other（截图未明确具体产地）', evidencePath: '产品核验信息/商品详情页/80 3CE单色腮红/参数信息.png' },
      { label: '商详标注质地类别', value: '粉状', evidencePath: '产品核验信息/商品详情页/80 3CE单色腮红/参数信息.png' },
      { label: '页面列示色名', value: '烟木粉、梦核紫、朦胧紫、淡淡白、冷芋粉等', evidencePath: '产品核验信息/商品详情页/80 3CE单色腮红/参数信息.png' },
    ],
  },
  'catalog-081': {
    parameterFacts: [
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/81 3CE好脸色多用膏/参数信息.png' },
      { label: '商详标注质地', value: '泥状', evidencePath: '产品核验信息/商品详情页/81 3CE好脸色多用膏/参数信息.png' },
      { label: '商详标注使用部位', value: '面部、两颊', evidencePath: '产品核验信息/商品详情页/81 3CE好脸色多用膏/参数信息.png' },
      { label: '页面列示SKU色号', value: '02 PINK PETAL、07 SWEET ON YOU、03 BEIGE CRUSH、06 LILAC WHISPER、01 FIG SODA、04 CHARMED、05 DESERT HEAT', evidencePath: '产品核验信息/商品详情页/81 3CE好脸色多用膏/参数信息.png' },
    ],
  },
  'catalog-082': {
    parameterFacts: [
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/82 3CE液体腮红/参数信息.png' },
      { label: '页面列示SKU色号', value: 'SIDE PIECE、JOYFUL AFFAIR', evidencePath: '产品核验信息/商品详情页/82 3CE液体腮红/参数信息.png' },
    ],
  },
  'catalog-083': {
    parameterFacts: [
      { label: '产地', value: '国产（截图原文）', evidencePath: '产品核验信息/商品详情页/83 橘朵单色腮红/参数信息.png' },
      { label: '商详标注产品类别', value: '腮红、粉状', evidencePath: '产品核验信息/商品详情页/83 橘朵单色腮红/参数信息.png' },
      { label: '页面列示色号', value: '06 杏子色、44 草莓牛奶、35 烤奶茶、43 蓝莓夜、41 蜜桃奶茶等', evidencePath: '产品核验信息/商品详情页/83 橘朵单色腮红/参数信息.png' },
    ],
  },
  'catalog-084': {
    parameterFacts: [
      { label: '产地', value: '国产（截图原文）', evidencePath: '产品核验信息/商品详情页/84 橘朵水缎光腮红/参数信息.png' },
      { label: '商详标注质地类别', value: '粉状', evidencePath: '产品核验信息/商品详情页/84 橘朵水缎光腮红/参数信息.png' },
      { label: '页面列示规格', value: '5g（与人工核验表规格一致）', evidencePath: '产品核验信息/商品详情页/84 橘朵水缎光腮红/参数信息.png' },
    ],
  },
  'catalog-085': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/85 花西子腮红膏/参数信息.png' },
      { label: '商详标注产品类别', value: '腮红膏', evidencePath: '产品核验信息/商品详情页/85 花西子腮红膏/参数信息.png' },
      { label: '页面所选SKU', value: '08 月下蔷薇', evidencePath: '产品核验信息/商品详情页/85 花西子腮红膏/参数信息.png' },
    ],
  },
  'catalog-086': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/86 彩棠三色腮红盘/参数信息.png' },
      { label: '截图所示商品页', value: '三色腮红盘及包含修容盘的组合选项并列；截图选项不能确认人工核验表目标13g对应版本，规格以表格13g为准', evidencePath: '产品核验信息/商品详情页/86 彩棠三色腮红盘/参数信息.png' },
    ],
    dataIssues: ['商品详情截图同页列示三色腮红盘及含修容盘组合等不同选项，无法确认截图中的套装信息对应工作表13g目标；页面规格按表格13g显示，具体版本待复核。'],
  },
  'catalog-087': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/87 花知晓邦尼花园冻干浮雕腮红/参数信息.png' },
      { label: '页面列示色号', value: '01 毛绒雪兔、02 晚安邦尼、03 芭蕾舞裙、04 鸢尾花园、05 梦游仙境', evidencePath: '产品核验信息/商品详情页/87 花知晓邦尼花园冻干浮雕腮红/参数信息.png' },
    ],
  },
  'catalog-088': {
    parameterFacts: [
      { label: '产地字段', value: '其他/other（截图未明确具体产地）', evidencePath: '产品核验信息/商品详情页/88 MAC魅可大子弹头口红/参数信息.png' },
      { label: '页面列示商品名称', value: '魅可新经典绒光唇膏', evidencePath: '产品核验信息/商品详情页/88 MAC魅可大子弹头口红/参数信息.png' },
    ],
  },
  'catalog-089': {
    parameterFacts: [
      { label: '产地字段', value: '其他/other（截图未明确具体产地）', evidencePath: '产品核验信息/商品详情页/89 MAC魅可轻尤雾弹唇膏/参数信息.png' },
      { label: '页面列示商品名称', value: '魅可新丝绒柔雾唇膏', evidencePath: '产品核验信息/商品详情页/89 MAC魅可轻尤雾弹唇膏/参数信息.png' },
    ],
  },
  'catalog-090': {
    parameterFacts: [
      { label: '产地字段', value: '其他/other（截图未明确具体产地）', evidencePath: '产品核验信息/商品详情页/90 MAC魅可轻尤雾弹唇釉/参数信息.png' },
      { label: '净含量', value: '5ml', evidencePath: '产品核验信息/商品详情页/90 MAC魅可轻尤雾弹唇釉/参数信息.png' },
      { label: '页面列示商品名称', value: '魅可新丝绒柔雾液体唇膏', evidencePath: '产品核验信息/商品详情页/90 MAC魅可轻尤雾弹唇釉/参数信息.png' },
    ],
  },
  'catalog-091': {
    parameterFacts: [
      { label: '产地', value: '法国', evidencePath: '产品核验信息/商品详情页/91 Dior迪奥烈艳蓝金唇膏/参数信息.png' },
      { label: '商详标注商品类别', value: '唇膏', evidencePath: '产品核验信息/商品详情页/91 Dior迪奥烈艳蓝金唇膏/参数信息.png' },
    ],
  },
  'catalog-092': {
    parameterFacts: [
      { label: '产地', value: '比利时', evidencePath: '产品核验信息/商品详情页/92 倩碧Black Honey唇膏/参数信息.png' },
      { label: '页面列示商品名称', value: '倩碧Black Honey唇膏', evidencePath: '产品核验信息/商品详情页/92 倩碧Black Honey唇膏/参数信息.png' },
    ],
  },
  'catalog-093': {
    parameterFacts: [
      { label: '截图与表格规格差异', value: '详情截图标示4g；人工核验表规格为4.6g，商品规格以表格4.6g为准', evidencePath: '产品核验信息/商品详情页/93 3CE水雾唇露/参数信息.png' },
    ],
    dataIssues: ['详情截图标示净含量4g，与人工核验表规格4.6g不一致；网页规格按表格显示4.6g，截图差异保留待复核。'],
  },
  'catalog-094': {
    parameterFacts: [
      { label: '商品类别', value: '唇膏', evidencePath: '产品核验信息/商品详情页/94 3CE好气色润唇膏/参数信息.png' },
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/94 3CE好气色润唇膏/参数信息.png' },
      { label: '页面列示SKU色号', value: '30 MELTING SMORE、38 SALTY SWEET、34 ROSE GLAZE、42 CORAL STRIKE 等', evidencePath: '产品核验信息/商品详情页/94 3CE好气色润唇膏/参数信息.png' },
    ],
  },
  'catalog-095': {
    parameterFacts: [
      { label: '页面列示色号', value: '703', evidencePath: '产品核验信息/商品详情页/95 完美日记第三代仿生膜精华口红/参数信息.png' },
      { label: '商详标注质地', value: '缎光', evidencePath: '产品核验信息/商品详情页/95 完美日记第三代仿生膜精华口红/参数信息.png' },
      { label: '商详标注适用肤色', value: '黄皮（页面文案，仅作来源转录，不作为适配结论）', evidencePath: '产品核验信息/商品详情页/95 完美日记第三代仿生膜精华口红/参数信息.png' },
    ],
  },
  'catalog-096': {
    parameterFacts: [
      { label: '页面参数品名', value: '玉养精华口红', evidencePath: '产品核验信息/商品详情页/96 花西子雕花口红/参数信息.png' },
      { label: '页面所选SKU', value: 'L501 冰糖玉', evidencePath: '产品核验信息/商品详情页/96 花西子雕花口红/参数信息.png' },
      { label: '商详标注妆效', value: '哑光', evidencePath: '产品核验信息/商品详情页/96 花西子雕花口红/参数信息.png' },
    ],
    dataIssues: ['参数截图列示品名“玉养精华口红”，与人工核验表目标“雕花口红”存在命名映射差异；目标名称和规格继续以表格为准，参数页品名不作为已确认官方名称。'],
  },
  'catalog-097': {
    parameterFacts: [
      { label: '净含量', value: '1.5g', evidencePath: '产品核验信息/商品详情页/97 NARS小粉金唇膏/参数信息.png' },
      { label: '产地', value: '美国', evidencePath: '产品核验信息/商品详情页/97 NARS小粉金唇膏/参数信息.png' },
      { label: '商详标注质地', value: '膏体', evidencePath: '产品核验信息/商品详情页/97 NARS小粉金唇膏/参数信息.png' },
    ],
  },
  'catalog-098': {
    parameterFacts: [
      { label: '页面所选SKU', value: 'S01 无花果生巧', evidencePath: '产品核验信息/商品详情页/98 橘朵缎光唇粉霜/参数信息.png' },
      { label: '商详标注质地', value: '哑光', evidencePath: '产品核验信息/商品详情页/98 橘朵缎光唇粉霜/参数信息.png' },
      { label: '截图净含量', value: '2.6ml（与人工核验表规格一致）', evidencePath: '产品核验信息/商品详情页/98 橘朵缎光唇粉霜/参数信息.png' },
    ],
  },
  'catalog-099': {
    parameterFacts: [
      { label: '净含量', value: '3.3g', evidencePath: '产品核验信息/商品详情页/99 橘朵小奶泥唇泥/参数信息.png' },
      { label: '产地字段', value: '国产（截图原文）', evidencePath: '产品核验信息/商品详情页/99 橘朵小奶泥唇泥/参数信息.png' },
      { label: '页面所选SKU', value: 'P04 苹果泥', evidencePath: '产品核验信息/商品详情页/99 橘朵小奶泥唇泥/参数信息.png' },
    ],
  },
  'catalog-100': {
    parameterFacts: [
      { label: '净含量', value: '3g', evidencePath: '产品核验信息/商品详情页/100 卡姿兰波波唇膏笔/参数信息.png' },
      { label: '页面所列色号', value: 'G02 雀跃杏', evidencePath: '产品核验信息/商品详情页/100 卡姿兰波波唇膏笔/参数信息.png' },
    ],
  },
  'catalog-101': {
    parameterFacts: [
      { label: '净含量', value: '3.5g', evidencePath: '产品核验信息/商品详情页/101 花知晓天鹅芭蕾唇釉/参数信息.png' },
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/101 花知晓天鹅芭蕾唇釉/参数信息.png' },
      { label: '页面列示商品名称', value: '天鹅芭蕾水光唇膏', evidencePath: '产品核验信息/商品详情页/101 花知晓天鹅芭蕾唇釉/参数信息.png' },
    ],
  },
  'catalog-102': {
    parameterFacts: [
      { label: '产地字段', value: '其他/other（截图原文；具体产地未明确）', evidencePath: '产品核验信息/商品详情页/102 MAC魅可水漾波光子弹头唇膏/参数信息.png' },
    ],
  },
  'catalog-103': {
    parameterFacts: [
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/103 3CE柔雾管口红/参数信息.png' },
      { label: '页面所选SKU', value: '#SALTY CINNAMON（海盐肉桂色）', evidencePath: '产品核验信息/商品详情页/103 3CE柔雾管口红/参数信息.png' },
    ],
  },
  'catalog-104': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/104 彩棠三色高光修容盘/参数信息.png' },
      { label: '页面列示版本', value: '差旅便携随行装5.2g、三色修容盘17g', evidencePath: '产品核验信息/商品详情页/104 彩棠三色高光修容盘/参数信息.png' },
    ],
    dataIssues: ['详情截图同时列示5.2g差旅便携装与17g三色修容盘；本条规格按人工核验表保留17g，截图版本差异待复核。'],
  },
  'catalog-105': {
    parameterFacts: [
      { label: '商详标注商品名称', value: '橘朵高光修容综合盘', evidencePath: '产品核验信息/商品详情页/105 橘朵高光修容盘/参数信息.png' },
      { label: '商详标注产品类别', value: '高光阴影组合修容盘', evidencePath: '产品核验信息/商品详情页/105 橘朵高光修容盘/参数信息.png' },
    ],
  },
  'catalog-106': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/106 花西子蝶翼清影高光修容一体盘/参数信息.png' },
      { label: '页面所选SKU', value: '01 扶光蝶影', evidencePath: '产品核验信息/商品详情页/106 花西子蝶翼清影高光修容一体盘/参数信息.png' },
    ],
  },
  'catalog-107': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/107 花知晓巧克力高光修容三色盘/参数信息.png' },
      { label: '页面列示商品名称', value: '巧克力系列高光修容盘', evidencePath: '产品核验信息/商品详情页/107 花知晓巧克力高光修容三色盘/参数信息.png' },
    ],
  },
  'catalog-108': {
    parameterFacts: [
      { label: '产地字段', value: '其他/other（截图原文；具体产地未明确）', evidencePath: '产品核验信息/商品详情页/108 MAC魅可小金盒高光修容盘/参数信息.png' },
    ],
  },
  'catalog-109': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/109 彩棠双拼高光/参数信息.png' },
      { label: '商详标注产品类别', value: '高光粉、高光膏', evidencePath: '产品核验信息/商品详情页/109 彩棠双拼高光/参数信息.png' },
      { label: '页面列示色号选项', value: '#01经典色号、#02白皙色号、#03膨胀色、#01日灼白（单色高光膏）', evidencePath: '产品核验信息/商品详情页/109 彩棠双拼高光/参数信息.png' },
    ],
    dataIssues: ['详情截图同时列示双拼高光及单色高光膏等选项；工作表目标规格3g+5g保留为本条双拼商品规格，单色选项不并入本条记录。'],
  },
  'catalog-110': {
    parameterFacts: [
      { label: '产地', value: '中国', evidencePath: '产品核验信息/商品详情页/110 橘朵斜修双头修容笔/参数信息.png' },
      { label: '商详列示SKU名称', value: '#01 冷白/橄榄皮挚爱、#02 暖黄皮/自然肤色（仅转录页面命名，不作为适配结论）', evidencePath: '产品核验信息/商品详情页/110 橘朵斜修双头修容笔/参数信息.png' },
    ],
  },
  'catalog-111': {
    parameterFacts: [
      { label: '产地', value: '韩国', evidencePath: '产品核验信息/商品详情页/111 too cool for school涂酷三色修容盘/参数信息.png' },
      { label: '商详标注产品类别', value: '阴影粉、立体修饰', evidencePath: '产品核验信息/商品详情页/111 too cool for school涂酷三色修容盘/参数信息.png' },
      { label: '商详列示SKU版本名', value: '暖皮用经典1#、冷皮用经典2#、冷暖皮均可中性1.5#（仅转录页面命名，不作为适配结论）', evidencePath: '产品核验信息/商品详情页/111 too cool for school涂酷三色修容盘/参数信息.png' },
    ],
  },
}

export const productExpansionRecords = [...expansionAdditionalRecords, ...existingExpansionRecords].map((record) => {
  const correction = expansionRecordCorrections[record.id] || {}
  return {
    ...record,
    tableReviewStatus: record.reviewStatus,
    ...correction,
    image: { ...record.image, ...correction.image, allowedUse: 'public_with_source_notice' },
  }
})

const baseCategories = ['粉底液', '气垫', '遮瑕', '散粉', '素颜霜', '隔离', '有色面霜']

function getColorFact(record) {
  return record.parameterFacts?.find((item) => /色号|色名|颜色|所选SKU|列示SKU/.test(item.label) && !/颜色数/.test(item.label))
}

function getColorCountFact(record) {
  return record.parameterFacts?.find((item) => item.label === '颜色数')
}

function getExtractedShadeEntry(record) {
  return productShadeCatalog[record.id] || null
}

function getReviewedShades(record) {
  const extracted = getExtractedShadeEntry(record)
  if (extracted?.shades?.length) {
    return extracted.shades.map((shade) => ({
      name: shade.name,
      badge: shade.badge || '',
      tone: '待核验',
      lightness: '待核验',
      suitable: '适配方向待核验',
      sourceLabel: `序号${record.sequence}参数截图：${shade.rawText}`,
      verificationStatus: 'verified_parameter_screenshot',
    }))
  }

  // 色号区没有可读色号时，用中性的规格描述替代内部核验占位语，避免把“待核验”暴露给用户。
  const name = extracted?.truncated || !baseCategories.includes(record.category) ? '多色号可选' : '单一规格'
  return [{
    name,
    tone: '待核验',
    lightness: '待核验',
    suitable: '适配方向待核验',
    sourceLabel: `序号${record.sequence}参数截图未完整列示色号`,
    verificationStatus: 'not_listed_in_parameter_screenshot',
  }]
}

function getReviewedCautions(record) {
  return [
    '具体使用注意事项待核验；使用前请阅读产品包装说明。',
    ...(record.parameterFacts || [])
      .filter((fact) => /功效|适用肤色|防水|储存|防晒标识/.test(fact.label))
      .map((fact) => `${fact.label}：${fact.value}`),
    ...(record.dataIssues || []),
  ]
}

function getOriginFact(record) {
  return record.parameterFacts?.find((fact) => /^产地(?:字段)?$/.test(fact.label) || fact.label === '页面产地信息')
}

function getOrigin(record) {
  const fact = getOriginFact(record)
  if (!fact || /冲突|待核验/.test(fact.value)) return '待核验'
  return fact.value
}

function getFinish(record) {
  const finishTerms = /^(?:哑光|柔雾|雾面|缎光|水光|亮泽|珠光|丝绒|奶油肌)$/
  const fact = record.parameterFacts?.find((item) => {
    if (item.label.includes('妆效')) return true
    return item.label.includes('质地') && finishTerms.test(item.value.trim())
  })
  return fact?.value || '待核验'
}

function getColorDisplay(record) {
  const extracted = getExtractedShadeEntry(record)
  if (extracted?.shades?.length) return extracted.shades.map((shade) => shade.name).join(' / ')
  if (extracted?.truncated) return '多色号可选；色号区截图未完整展示'

  const fact = getColorFact(record)
  if (fact) return fact.value

  const colorCount = getColorCountFact(record)
  if (colorCount) return `页面列示色数：${colorCount.value}`
  return baseCategories.includes(record.category) ? '单一规格' : '多色号可选'
}

function getColorDisplayStatus(record) {
  if (record.parameterFacts?.some((item) => /色号|色名|颜色|所选SKU|列示SKU/.test(item.label) && !/颜色数/.test(item.label))) return 'parameter_screenshot_listed'
  if (record.parameterFacts?.some((item) => item.label === '颜色数')) return 'color_count_only'
  return 'not_listed_in_parameter_screenshot'
}

function getUnsupportedFields(record) {
  const unsupported = ['适用肤质', '遮瑕度', '持妆', '氧化', '评分', '独立实测结论', '肤色适配/色调']
  if (getFinish(record) === '待核验') unsupported.push('妆效')
  if (!getExtractedShadeEntry(record)?.shades?.length) unsupported.push('具体色号')
  if (getOrigin(record) === '待核验') unsupported.push('实际产地')
  return unsupported
}

const onlineVerificationOutcomes = new Map(onlineVerificationSnapshot.outcomes.map((outcome) => [outcome.id, outcome]))
const onlineReviewedAt = '2026-11-20'

export const expansionOnlineVerificationRecords = Object.fromEntries(productExpansionRecords.map((record) => {
  const attempt = onlineVerificationSnapshot.attempts[record.id]
  if (!attempt) throw new Error(`缺少 ${record.id} 的在线复核记录`)

  const sourceRecords = attempt.sources.map(([url, outcomeId]) => {
    const outcome = onlineVerificationOutcomes.get(outcomeId)
    if (!outcome) throw new Error(`缺少 ${record.id} 的在线访问结果 ${outcomeId}`)
    return {
      url,
      title: outcome.title,
      publisher: outcome.publisher,
      accessedAt: onlineReviewedAt,
      evidence: outcome.evidence,
    }
  })

  return [record.id, {
    productId: record.id,
    status: 'unverified',
    accessedAt: onlineReviewedAt,
    supportedFields: [],
    sourceRecords,
    conflicts: attempt.conflicts,
    limitations: attempt.limitations,
  }]
}))

export const expansionRecommendationReviewRecords = Object.fromEntries(productExpansionRecords.map((record) => {
  const onlineVerification = expansionOnlineVerificationRecords[record.id]
  return [record.id, {
    productId: record.id,
    decision: 'verified_manual',
    reviewedAt: onlineReviewedAt,
    rating: null,
    ratingStatus: 'not_generated',
    recommendationReady: true,
    shadeRecommendationReady: false,
    imageAuthorizationStatus: 'pending',
    blockingReasons: [
      '推荐开放依据人工核验表与参数截图；本轮在线访问未获得可支持商品事实或适用条件的合格官方旗舰店直接页面，未生成编辑评分。',
      ...(onlineVerification.conflicts.length ? ['存在尚未解决的商品身份、名称、规格、价格或版本冲突。'] : []),
      '未取得明确图片再利用授权或开放许可证证据。',
    ],
  }]
}))

const cardRoleTags = {
  '素颜霜': ['素颜提亮', '日常打底'],
  '隔离': ['妆前打底', '后续服帖'],
  '有色面霜': ['润色打底', '轻薄均匀'],
  '眉妆': ['勾勒眉形', '填充眉色'],
  '眼影': ['眼部上色', '叠色晕染'],
  '眼线': ['眼线勾勒', '眼部细节'],
  '睫毛膏': ['睫毛修饰', '眼部妆容'],
  '腮红': ['面颊提色', '提升气色'],
  '唇妆': ['唇部上色', '日常提色'],
  '修容': ['轮廓修饰', '立体过渡'],
}

const cardNoteTemplates = {
  '素颜霜': '偏日常轻妆方向，可薄涂提亮；实际妆感受用量、肤质和光线影响。',
  '隔离': '用于妆前打底，帮助后续底妆更服帖；实际效果受肤质和搭配影响。',
  '有色面霜': '带润色方向，适合想要轻薄均匀肤色时使用；实际颜色受光线影响。',
  '眉妆': '用于眉部勾勒和填补，显色与持久度受发色和手法影响。',
  '眼影': '用于眼部叠色和晕染，显色与飞粉表现受刷具和手法影响。',
  '眼线': '用于眼线勾勒和细节补充，线条持久度受肤质和用法影响。',
  '睫毛膏': '用于睫毛修饰，卷翘与晕染表现因刷法和肤质而异。',
  '腮红': '用于面颊提色，显色程度受用量、底妆和光线影响。',
  '唇妆': '用于唇部上色，实际颜色受唇色、涂抹层数和光线影响。',
  '修容': '用于面部轮廓修饰，颜色深浅和晕染效果受手法与光线影响。',
}

const cardScenes = {
  '素颜霜': ['日常', '通勤', '轻妆'],
  '隔离': ['日常', '通勤', '轻妆'],
  '有色面霜': ['日常', '通勤', '轻妆'],
  '眉妆': ['日常', '通勤'],
  '眼影': ['日常', '通勤', '约会'],
  '眼线': ['日常', '通勤'],
  '睫毛膏': ['日常', '通勤'],
  '腮红': ['日常', '通勤', '约会'],
  '唇妆': ['日常', '通勤', '约会'],
  '修容': ['通勤', '拍照'],
}

// 卡片第二枚标签：按品类从页面参数里取一条可核实的形态/质地信息，避免同品类所有商品标签完全相同。
function deriveSpecTag(record) {
  const name = record.productName || ''
  const facts = record.parameterFacts || []
  const fact = (labelRe) => {
    const hit = facts.find((item) => labelRe.test(item.label))
    return hit ? String(hit.value).replace(/（.*$/, '').trim() : ''
  }
  const allValues = facts.map((item) => item.value).join(' ')

  switch (record.category) {
    case '素颜霜':
    case '隔离':
    case '有色面霜': {
      const spf = fact(/防晒/)
      if (/SPF/i.test(spf)) return spf.replace(/\s+/g, ' ').trim()
      if (/防晒/.test(allValues + name)) return '带防晒'
      if (/提亮|亮白|净白/.test(allValues + name)) return '提亮'
      if (/保湿|水润/.test(allValues + name)) return '保湿'
      if (/持妆|持久/.test(allValues + name)) return '持妆'
      if (/水光/.test(name)) return '水光'
      return ''
    }
    case '眉妆': {
      const waterproof = fact(/防水/)
      if (/强力/.test(waterproof)) return '强力防水'
      if (/中度/.test(waterproof)) return '中度防水'
      if (/轻度/.test(waterproof)) return '轻度防水'
      if (/防水/.test(waterproof)) return '防水'
      return /粉/.test(name) ? '眉粉' : /膏/.test(name) ? '染眉膏' : ''
    }
    case '眼线': {
      const kind = fact(/商品类别|产品分类/)
      if (/双头/.test(kind)) return '双头'
      if (/液/.test(kind)) return '液笔'
      if (/胶/.test(kind) || /胶/.test(name)) return '胶笔'
      return /笔/.test(name) ? '笔状' : ''
    }
    case '睫毛膏': {
      const kind = fact(/商品类别|产品分类/)
      if (/双头/.test(kind)) return '双头'
      if (/单头/.test(kind)) return '单头'
      if (/钢管/.test(name)) return '钢管刷头'
      if (/纤细/.test(name)) return '纤细'
      if (/卷翘|翘/.test(name)) return '卷翘'
      if (/定型/.test(name)) return '定型'
      if (/浓密/.test(name)) return '浓密'
      if (/纤长/.test(name)) return '纤长'
      return ''
    }
    case '眼影': {
      const cnNumbers = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }
      const toNumber = (value) => {
        if (/^\d+$/.test(value)) return Number(value)
        if (value === '十') return 10
        if (value.startsWith('十')) return 10 + (cnNumbers[value[1]] || 0)
        if (value.endsWith('十')) return (cnNumbers[value[0]] || 0) * 10
        return cnNumbers[value] || 0
      }
      const fromFact = String(fact(/颜色数/) || '').replace(/[^\d一二三四五六七八九十]/g, '')
      const fromName = (name.match(/([一二三四五六七八九十]{1,3}|\d{1,2})\s?色/) || [])[1] || ''
      const count = toNumber(fromFact || fromName)
      return count ? `${count} 色盘` : ''
    }
    case '修容': {
      if (/三色/.test(name)) return '三色盘'
      if (/双拼|双色/.test(name)) return '双拼'
      if (/笔/.test(name)) return '修容笔'
      if (/盘/.test(name)) return '盘装'
      return ''
    }
    case '腮红': {
      if (/小雏菊/.test(name)) return '粉状'
      if (/三色/.test(name)) return '三色盘'
      if (/单色/.test(name)) return '单色'
      if (/液体/.test(name)) return '液体'
      if (/膏/.test(name)) return '膏状'
      if (/泥/.test(name)) return '泥状'
      if (/冻干/.test(name)) return '冻干'
      const texture = fact(/质地类别|产品类别/)
      if (/粉状/.test(texture)) return '粉状'
      if (/膏/.test(texture)) return '膏状'
      if (/泥/.test(texture)) return '泥状'
      if (/液/.test(texture)) return '液体'
      return ''
    }
    case '唇妆': {
      const texture = fact(/质地/)
      if (/哑光/.test(texture)) return '哑光'
      if (/缎光/.test(texture)) return '缎光'
      if (/膏体/.test(texture)) return '膏体'
      if (/泥/.test(name)) return '唇泥'
      if (/笔/.test(name)) return '唇膏笔'
      if (/釉|露/.test(name)) return '唇釉'
      if (/霜/.test(name)) return '粉霜'
      if (/润唇膏/.test(name)) return '润唇膏'
      if (/口红|唇膏/.test(name)) return '膏体'
      return ''
    }
    default:
      return ''
  }
}

function getFactText(record, labelRe) {
  const hit = (record.parameterFacts || []).find((item) => labelRe.test(item.label))
  return hit ? String(hit.value).replace(/（[^）]*）/g, '').trim() : ''
}

// “喜欢它的理由”：只按商品页已记录的名称、规格、色号和参数整理，不补充未核验的功效结论。
function deriveLoveReasons(record) {
  const name = record.productName || ''
  const category = record.category
  const finish = getFinish(record)
  const specTag = deriveSpecTag(record)
  const shades = getReviewedShades(record)
  const listed = shades.filter((shade) => shade.verificationStatus === 'verified_parameter_screenshot')
  const unit = category === '眼影' || category === '修容' ? '款' : '色'
  const spf = getFactText(record, /防晒/)
  const waterproof = getFactText(record, /防水/)
  const texture = getFactText(record, /质地类别|标注质地|标注妆效/)
  const kind = getFactText(record, /商品类别|产品类别|产品分类|彩妆分类|页面所选分类/)
  const colorCount = getFactText(record, /颜色数/)

  const roleReasons = {
    素颜霜: '素颜霜定位，薄涂即可用于日常提亮和轻妆打底。',
    隔离: '妆前隔离定位，用在底妆前帮助后续上妆。',
    有色面霜: '带润色方向的轻薄底妆，适合想要自然均匀肤色时使用。',
    眉妆: '用于眉形勾勒和眉色填充，适合日常快速整理眉部。',
    眼影: '用于眼部上色、叠色和晕染，可按场合调整浓淡。',
    眼线: '用于眼线勾勒和眼部细节补充，线条粗细由手法决定。',
    睫毛膏: '用于睫毛修饰，可按刷法调整纤长或浓密方向。',
    腮红: '用于面颊提色，少量多次上妆更容易控制显色。',
    唇妆: '用于唇部上色和日常提色，可叠涂调整深浅。',
    修容: '用于面部轮廓修饰和立体过渡，深浅由用量控制。',
  }
  const reasons = roleReasons[category] ? [roleReasons[category]] : []

  switch (category) {
    case '素颜霜':
    case '隔离':
    case '有色面霜':
      if (spf) reasons.push(`带 ${spf} 防晒标识，日常打底时可以一并参考。`)
      else if (finish !== '待核验') reasons.push(`妆效方向为${finish}，实际表现受用量、肤质和光线影响。`)
      else if (specTag && !/防晒/.test(specTag)) reasons.push(`商品页记录为${specTag}方向，适合按日常妆感需要选择。`)
      break
    case '眉妆':
      if (waterproof) reasons.push(`页面标注${waterproof}，具体持久度仍受肤质和用量影响。`)
      else if (specTag) reasons.push(`${specTag}形态，方便按上妆习惯挑选。`)
      break
    case '眼影': {
      const colorNumber = colorCount.match(/\d+/)?.[0]
      if (colorNumber) reasons.push(`${colorNumber} 色眼影盘，日常打底和叠色加深都能覆盖。`)
      else if (specTag) reasons.push(`${specTag}，可以按妆容浓淡自由搭配。`)
      break
    }
    case '眼线':
      if (waterproof) reasons.push(`页面标注防水${kind ? `，${kind}` : ''}，适合按线条粗细需要挑选。`)
      else if (kind) reasons.push(`${kind}，线条粗细和收尾由手法控制。`)
      break
    case '睫毛膏':
      if (kind) reasons.push(`${/睫毛膏/.test(kind) ? kind : `${kind}睫毛膏`}，刷法和层数可以调整妆感。`)
      else if (specTag) reasons.push(`${/刷头/.test(specTag) ? `${specTag}的睫毛膏` : `${specTag}睫毛膏`}，刷法和层数可以调整妆感。`)
      else if (/纤细/.test(name)) reasons.push('纤细版刷头，适合想要自然分明的睫毛。')
      break
    case '腮红':
      if (texture) reasons.push(`${texture}腮红，显色会受用量、底妆和光线影响。`)
      else if (specTag) reasons.push(`${specTag}腮红，上妆范围和浓淡可以按需要控制。`)
      break
    case '唇妆':
      if (texture) reasons.push(`${texture}质地，颜色呈现会受唇色和涂抹层数影响。`)
      else if (specTag) reasons.push(`${specTag}质地，可按日常妆感选择。`)
      break
    case '修容':
      if (kind) reasons.push(`${kind}，可以按部位分别修饰。`)
      else if (specTag) reasons.push(`${specTag}设计，方便按部位和范围选择。`)
      break
  }

  if (listed.length > 0) reasons.push(`页面列示 ${listed.length} 个${unit}可选，规格 ${record.specification}。`)
  else if (shades[0]?.name === '单一规格') reasons.push(`单一规格 ${record.specification}，不需要在色号之间比较。`)
  else reasons.push(`规格 ${record.specification}，具体色号以商品页展示为准。`)

  return reasons
}

// 详情抽屉展示层文案：只复述已整理的资料和截图原文，不把内部版本复核记录当作使用建议。
function getCardCopy(record) {
  const finish = getFinish(record)
  const shades = getReviewedShades(record)
  const listed = shades.filter((shade) => shade.verificationStatus === 'verified_parameter_screenshot')
  const unit = record.category === '眼影' || record.category === '修容' ? '款' : '色'
  const thirdTag = listed.length ? `${listed.length} ${unit}可选` : finish !== '待核验' ? finish : shades[0]?.name || '多色号可选'
  const roleTags = cardRoleTags[record.category] || ['日常妆容', '资料整理']
  const specTag = deriveSpecTag(record)
  const baseNote = cardNoteTemplates[record.category] || '按商品页信息整理，实际妆效和颜色请以实物与光线为准。'
  const pageCautions = (record.parameterFacts || [])
    .filter((fact) => /功效|适用肤色|防水|储存|防晒标识/.test(fact.label))
    .map((fact) => `页面标注${fact.label.replace(/^商详标注/, '').replace(/^商详/, '').replace(/文案$/, '')}：${fact.value}`)
  return {
    cardTags: [...new Set([roleTags[0], specTag || roleTags[1], thirdTag])],
    cardNote: finish !== '待核验' ? `${finish}方向，${baseNote}` : baseNote,
    cardFooter: '品牌官方旗舰店资料 · 人工核对',
    detailCautions: [
      '妆效、显色和持妆会因用法、肤质和光线不同，建议先少量试用。',
      '页面未标注或缺失的信息不做推断，购买前请以商品页与包装说明为准。',
      ...(record.dataIssues?.length ? ['页面存在多个版本或规格选项，购买前请核对具体版本。'] : []),
      ...pageCautions,
    ],
    detailScenes: cardScenes[record.category] || [],
  }
}

export const expansionCatalogProducts = productExpansionRecords.map((record) => ({
  id: record.id, brand: record.brand, name: record.productName, officialProductName: record.officialProductName, category: record.category, specification: record.specification, brandRegion: '待核验', madeIn: getOrigin(record), price: record.listPrice,
  priceLabel: record.listPrice + ' 元（参考原价，最终价格以结算页为准）', image: '/products/' + record.id + '/cover.webp', skins: [], finish: getFinish(record), coverage: '待核验', wear: null, oxidation: null, rating: null,
  shades: getReviewedShades(record), colorDisplay: getColorDisplay(record), note: '商品名称、规格与参考价格按人工核验表展示；妆效、色号适配、持妆和独立体验仅展示有截图依据的内容，其余待核验。', pros: deriveLoveReasons(record),
  cautions: getReviewedCautions(record), scenes: [], metrics: {},
  informationSources: [
    { title: '商品资料记录：' + record.marketplaceTitle, url: null, publisher: record.officialStoreName, accessedAt: record.verifiedAt, supports: ['品牌', '产品名称', '店铺身份', '商品规格', '参考价格'] },
    { title: '参数信息：' + record.productName, url: null, publisher: '商品详情页', accessedAt: record.verifiedAt, supports: (record.parameterFacts || []).map((fact) => fact.label) },
  ],
  imageSource: { url: record.image.sourcePageUrl, sourcePageUrl: record.image.sourcePageUrl, rightsholder: record.image.rightsholder || '权利方待核验', authorizationStatus: 'pending', acquiredAt: record.image.acquiredAt, sourcePriority: record.image.sourcePriority, publicUseDecision: 'public_with_source_notice', note: '图片来源已披露，公开展示且授权待核验；公开展示不表示已获得再利用授权。' },
  imageAuthorizationStatus: 'pending', verificationStatus: 'pending', factVerificationStatus: 'verified', publicStatus: 'public_with_source_notice_authorization_pending', recommendationReady: true, priceVerifiedAt: record.verifiedAt, shadeRecommendationReady: false,
  onlineVerification: expansionOnlineVerificationRecords[record.id],
  recommendationReview: expansionRecommendationReviewRecords[record.id],
  ...getCardCopy(record),
  editorialProfile: editorialSampleProfiles[record.id] || null,
}))

export const expansionVerificationRecords = Object.fromEntries(productExpansionRecords.map((record) => {
  const hasIdentityIssue = record.reviewStatus === 'identity_conflict'
  const tableVerified = record.tableReviewStatus === '已完成'
  const verifiedCommerce = tableVerified && Boolean(record.productUrl)
  const commerceNote = verifiedCommerce
    ? '商品与店铺信息按人工核验表已完成状态保留；2026-11-20 在线复核未取得支持商品事实或店铺身份的可读直接页面，在线结论仍为待核验。'
    : tableVerified
      ? '人工核验表已完成商品与店铺信息记录；该商品未匹配到可用的淘宝或天猫官方旗舰店链接，因此不展示购买入口。'
      : '人工核验表未提供已完成的商品链接记录；2026-11-20 在线复核亦未取得合格直接商品页证据。'

  return [record.id, {
    productId: record.id,
    nameReviewStatus: hasIdentityIssue ? 'identity_conflict' : 'verified',
    onlineVerification: expansionOnlineVerificationRecords[record.id],
    recommendationReview: expansionRecommendationReviewRecords[record.id],
    commerce: {
      platform: 'taobao',
      officialStoreName: record.officialStoreName,
      officialStoreFlag: record.officialStoreFlag,
      officialMarkerType: record.officialMarkerType,
      storeUrl: null,
      productUrl: verifiedCommerce ? record.productUrl : null,
      status: tableVerified ? 'verified' : 'pending',
      verifiedAt: record.verifiedAt,
      note: commerceNote,
    },
    reviewedFacts: {
      sequence: record.sequence,
      productName: record.productName,
      officialProductName: record.officialProductName,
      brand: record.brand,
      marketplaceTitle: record.marketplaceTitle,
      officialStoreName: record.officialStoreName,
      officialStoreFlag: record.officialStoreFlag,
      officialMarkerType: record.officialMarkerType,
      specification: record.specification,
      listPrice: record.listPrice,
      priceNote: record.priceNote,
      origin: getOriginFact(record) && getOrigin(record) !== '待核验' ? getOrigin(record) : null,
      originStatus: getOriginFact(record)
        ? getOrigin(record) !== '待核验' ? 'verified_parameter_screenshot' : 'conflicting_parameter_screenshot'
        : 'not_listed_in_parameter_screenshot',
      parameterFacts: record.parameterFacts || [],
      productUrl: verifiedCommerce ? record.productUrl : null,
      reviewStatus: hasIdentityIssue ? 'identity_conflict' : 'verified',
      dataIssues: record.dataIssues || [],
      verifiedAt: record.verifiedAt,
      source: {
        sheet: '淘宝人工核验',
        workbookPath: productExpansionSource.sourceWorkbook.path,
        range: productExpansionSource.sourceWorkbook.range,
        rowSequence: record.sequence,
        parameterEvidencePaths: (record.parameterFacts || []).map((fact) => fact.evidencePath),
        storeEvidencePath: record.storeEvidencePath,
        detailEvidencePath: record.detailEvidencePath,
        qualificationEvidencePath: record.qualificationEvidencePath,
      },
      unsupportedFields: getUnsupportedFields(record),
    },
    reviewedShades: {
      sequence: record.sequence,
      status: getExtractedShadeEntry(record)?.shades?.length ? 'verified_parameter_screenshot' : getColorDisplayStatus(record),
      applyToCatalog: true,
      reviewedAt: record.verifiedAt,
      display: getColorDisplay(record),
      shades: getReviewedShades(record),
      sourceVariants: [],
      issues: getColorDisplayStatus(record) === 'not_listed_in_parameter_screenshot'
        ? ['参数截图未列示色号；适配方向仍待核验，当前不参与色号推荐。']
        : ['仅转录参数截图的颜色、色号或 SKU 信息；未推断色调、明度及适配方向，当前不参与色号推荐。'],
      evidence: [{ kind: 'detail', path: record.detailEvidencePath }],
    },
    evidence: {
      sequence: record.sequence,
      sourceWorkbook: productExpansionSource.sourceWorkbook,
      publicEvidence: [
        { kind: 'store', path: record.storeEvidencePath },
        { kind: 'detail', path: record.detailEvidencePath },
        { kind: 'qualification', path: record.qualificationEvidencePath },
      ],
      image: record.image,
    },
    issues: [
      ...(record.officialStoreFlag === '否' ? ['普通店铺，外部商品链接已留空。'] : []),
      ...(record.dataIssues || []),
      '适用肤质、妆效、遮瑕度、持妆、氧化、评分等仍待核验；图片授权 pending，公开展示仅按来源披露策略执行。',
    ],
  }]
}))

const derivedCategoryCounts = productExpansionRecords.reduce((counts, record) => {
  counts[record.category] = (counts[record.category] || 0) + 1
  return counts
}, {})

productExpansionSource.categoryCounts = derivedCategoryCounts

export const expansionEvidenceSync = { version: 1, importedAt: productExpansionSource.importedAt, issueId: productExpansionSource.issueId, productCount: productExpansionSource.includedSequence.count, sequenceRange: '36-111', sourceWorkbook: productExpansionSource.sourceWorkbook, imageManifest: productExpansionSource.imageManifest, categoryCounts: derivedCategoryCounts }

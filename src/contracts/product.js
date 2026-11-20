/**
 * 受控产品记录：server/schemas.cjs 的 productRecordSchema 是证据字段依据，
 * 其 passthrough 字段以 src/data/products.js 富化后的真实记录为准。
 * 此契约描述现状，不授予来源、评分、价格或图片任何新的核验/授权状态。
 */

/**
 * 产品事实引用；不同于 AssistantSource，没有 kind，日期只有年月日。
 * @typedef {object} ProductSource
 * @property {string} title
 * @property {string | null} url 记录中的来源 URL；本地工作簿或截图证据没有 URL 时为 null。类型本身不证明官方旗舰店身份或符合公开门禁。
 * @property {string} publisher
 * @property {string} accessedAt YYYY-MM-DD 日期，如 2026-10-29，不是 ISO 日期时间。
 * @property {string[]} supports 无支撑字段时为 []。
 */

/**
 * @typedef {object} ProductImageSource
 * @property {string | null} url 当前富化记录与 sourcePageUrl 相同，不承诺为图片直链或购买入口。
 * @property {string | null} sourcePageUrl 缺原始网页来源时为 null。
 * @property {string} rightsholder 记录的权利人/发布方，可能仍待核验。
 * @property {'pending' | 'verified' | 'rejected'} authorizationStatus
 * @property {string} acquiredAt YYYY-MM-DD 日期。
 * @property {'brand_official' | 'retailer' | 'media' | 'project_owner_provided'} sourcePriority
 * @property {'public_with_source_notice' | 'internal_review_pending_source'} publicUseDecision
 * @property {string} note
 */

/**
 * @typedef {object} ProductImage
 * @property {string} shade
 * @property {string} url 本地路径或 URL；存在图片不等于已获再利用授权。
 */

/**
 * 当前富化后的色号；色调、明度和色板仅用于辅助展示，不能替代线下试色。
 * @typedef {object} ProductShade
 * @property {string} name
 * @property {string} tone
 * @property {string} lightness
 * @property {string} suitable
 * @property {string} sourceLabel
 * @property {string | null} [swatchColor] 展示用推断色，部分记录省略或为 null，不是专业测色值。
 * @property {'verified_parameter_screenshot' | 'not_listed_in_parameter_screenshot'} verificationStatus
 */

/**
 * src/data/product-shade-verification.js 当前附加在产品上的核验记录。
 * @typedef {object} ProductShadeVerification
 * @property {string} sequence 两位序号文本。
 * @property {'verified_parameter_screenshot' | 'marketplace_variant_only' | 'product_identity_conflict' | 'parameter_screenshot_listed' | 'color_count_only' | 'not_listed_in_parameter_screenshot'} status
 * @property {boolean} applyToCatalog
 * @property {string} reviewedAt YYYY-MM-DD 日期。
 * @property {ProductShade[]} shades
 * @property {string} [colorDisplay] 扩展产品参数截图的原文颜色/SKU转录；不表示色调、肤色适配或推荐结论。
 * @property {string[]} sourceVariants 无选项记录时为 []。
 * @property {string[]} issues 无问题说明时为 []。
 * @property {object} source
 * @property {string} source.workbookPath
 * @property {string} source.workbookSheet
 * @property {string} source.workbookNameCell
 * @property {string} source.workbookMatchCell
 * @property {string} source.parameterEvidenceKind
 */

/**
 * 一次在线访问的原始结果；候选页或受限页 URL 只作访问证据，不是购买入口。
 * @typedef {object} ProductOnlineSource
 * @property {string} url
 * @property {string} title
 * @property {string} publisher
 * @property {string} accessedAt YYYY-MM-DD 北京时间访问日期。
 * @property {string} evidence 实际读取结果及证据边界，不采信搜索摘要。
 */

/**
 * @typedef {object} ProductOnlineVerification
 * @property {string} productId
 * @property {'unverified'} status 访问受限或证据不足；不表示旧人工证据无效。
 * @property {string} accessedAt YYYY-MM-DD 北京时间访问日期。
 * @property {string[]} supportedFields 本轮没有合格证据支持字段时为 []。
 * @property {ProductOnlineSource[]} sourceRecords
 * @property {string[]} conflicts 未解决的名称、版本、规格、价格或商品 ID 冲突。
 * @property {string[]} limitations 访问限制和仍未核验的字段。
 */

/**
 * @typedef {object} ProductRecommendationReview
 * @property {string} productId
 * @property {'remain_blocked' | 'verified_manual'} decision 人工核验已完成时开放推荐；在线证据不足时仍继续阻断，而不是生成负向评价。
 * @property {string} reviewedAt YYYY-MM-DD 复核日期。
 * @property {null} rating 未生成编辑评分，更不是消费者真实用户评分。
 * @property {'not_generated'} ratingStatus
 * @property {boolean} recommendationReady
 * @property {boolean} shadeRecommendationReady
 * @property {'pending'} imageAuthorizationStatus 来源披露不等于授权。
 * @property {string[]} blockingReasons
 */

/**
 * @typedef {object} Product
 * @property {string} id 稳定站内 ID，供方案和消息引用。
 * @property {string} brand
 * @property {string} name
 * @property {string} category
 * @property {string} brandRegion
 * @property {string} madeIn
 * @property {number | null} price 非负有限参考价格，未取得时为 null。
 * @property {string} priceLabel 仅供展示；不能解析此文本用于预算筛选或价格计算。
 * @property {string} priceCurrency 三字符货币代码，当前为 CNY。
 * @property {string | null} priceVerifiedAt YYYY-MM-DD 核验日期；未知时为 null，不是更新时间戳。
 * @property {string} image 当前展示封面的本地路径。
 * @property {ProductImage[]} [images] 部分旧记录保留的色号图片；不代表全部已核验。
 * @property {string[]} skins
 * @property {string} finish
 * @property {string} coverage
 * @property {number | null} wear 参考持妆小时数，未记录时为 null，不是实测保证；当前字段名不是 wearHours。
 * @property {string | null} oxidation 编辑氧化方向，未记录时为 null。
 * @property {number | null} rating 编辑示例维度，未记录时为 null；不是消费者真实用户评分。
 * @property {ProductShade[]} shades
 * @property {ProductShadeVerification | null} shadeVerification 无附加核验记录时为 null。
 * @property {boolean} shadeRecommendationReady
 * @property {string} note
 * @property {string[]} pros
 * @property {string[]} cautions
 * @property {string[]} scenes
 * @property {Object<string, number>} metrics 编辑维度映射，无数据时为 {}，不是独立人体实测。
 * @property {ProductSource[]} informationSources 无来源条目时为 []。
 * @property {ProductImageSource} imageSource
 * @property {'pending' | 'verified' | 'rejected'} imageAuthorizationStatus
 * @property {'pending' | 'verified' | 'rejected' | 'not_applicable'} verificationStatus
 * @property {'pending' | 'verified' | 'rejected' | 'not_applicable'} factVerificationStatus
 * @property {string} publicStatus 公开门禁状态，不等同于素材已授权。
 * @property {boolean} recommendationReady
 * @property {ProductOnlineVerification} [onlineVerification] 扩展产品的本轮在线访问记录。
 * @property {ProductRecommendationReview} [recommendationReview] 扩展产品的逐款推荐复核结论。
 */

export {}

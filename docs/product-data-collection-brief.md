# YasPretty 产品资料采集任务单

版本：2026-10-30（北京时间）

适用范围：src/data/products.js 当前导出的全部产品记录，以及后续新增产品。

配套文件：

- 产品图片采集清单：product-image-collection.md
- 产品数据准确性审计：product-data-accuracy-audit.md

这是一份给产品资料采集队员使用的执行文件。它不是产品宣传文案，也不是把代码中的现有字段自动认定为事实。每一条资料必须能回到来源页面、访问时间和授权依据；无法证明的字段必须写“待核验”，不得猜测或用模板补齐。

## 1. 当前产品库全量清单

以下是 src/data/products.js 在 2026-10-29 的代码快照：共 35 条。代码参考价、品牌地区、生产地和妆效等仅代表当前仓库记录，不代表已经完成外部核验。publicStatus 是当前公开门禁状态，任何 blocked_* 都不得作为公开事实或宣传素材。

| 产品 ID | 品牌 | 产品名称 | 类别 | 品牌所属地区（代码） | 实际生产地（代码） | 代码参考价（CNY） | 价格核验日 | 事实来源 | 图片授权 | 当前公开状态 |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| nars-light-reflecting | NARS | 超方瓶粉底液 | 粉底液 | 美国 | 法国 | 430 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| estee-lauder-double-wear | Estée Lauder | 持妆粉底液 | 粉底液 | 美国 | 比利时 | 520 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| armani-luminous-silk | GIORGIO ARMANI | 大师粉底液 | 粉底液 | 意大利 | 法国 | 690 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| laneige-neo-matte | LANEIGE | NEO 小方块气垫（哑光） | 气垫 | 韩国 | 韩国 | 295 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| clio-kill-cover | CLIO | 小磁铁气垫 | 气垫 | 韩国 | 韩国 | 189 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| ysl-touche-eclat | YSL | 「真」皮气垫 | 气垫 | 法国 | 韩国 | 630 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| nars-radiant-creamy | NARS | 亮采柔滑遮瑕蜜 | 遮瑕 | 美国 | 加拿大 | 320 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| tarte-shape-tape | tarte | Shape Tape 遮瑕液 | 遮瑕 | 美国 | 美国 | 260 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| the-saem-tip-concealer | the SAEM | 得鲜经典遮瑕液 | 遮瑕 | 韩国 | 韩国 | 45 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| laura-mercier-translucent | LAURA MERCIER | 柔光透明散粉 | 散粉 | 美国 | 美国 | 420 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| make-up-for-ever-hd | MAKE UP FOR EVER | 轻烟蜜粉 | 散粉 | 法国 | 法国 | 330 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| flower-knows-cloud | 花知晓 | 骑士独角兽云朵蜜粉 | 散粉 | 中国 | 中国 | 149 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| dior-forever-skin-glow | Dior | 锁妆柔润亮泽粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 690 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| dior-forever-matte | Dior | 锁妆柔雾哑光粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 690 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| ysl-all-hours | YSL | All Hours 恒久无瑕粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 630 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| chanel-les-beiges | CHANEL | LES BEIGES 健康光泽粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 680 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| prada-reveal-skin | PRADA BEAUTY | Reveal Skin 柔焦粉底液 | 粉底液 | 意大利 | 法国（以包装批次为准） | 720 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| givenchy-prisme-libre | GIVENCHY | Prisme Libre Skin-Caring Glow 粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 620 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| lancome-teint-idole | LANCÔME | Teint Idole Ultra Wear 持妆粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 530 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| mac-studio-fix | M·A·C | Studio Fix Fluid 柔雾持妆粉底液 | 粉底液 | 加拿大 | 加拿大（以包装批次为准） | 410 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| bobbi-brown-weightless-skin | BOBBI BROWN | Weightless Skin 无感持妆粉底液 | 粉底液 | 美国 | 美国（以包装批次为准） | 620 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| mufe-hd-skin-foundation | MAKE UP FOR EVER | HD Skin 高清持妆粉底液 | 粉底液 | 法国 | 法国（以包装批次为准） | 460 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| laura-mercier-real-flawless | LAURA MERCIER | Real Flawless 柔光粉底液 | 粉底液 | 美国 | 美国（以包装批次为准） | 520 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| shiseido-revitalessence | SHISEIDO | Revitalessence Skin Glow 粉底液 | 粉底液 | 日本 | 日本（以包装批次为准） | 520 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| cle-de-peau-radiant-natural | Clé de Peau Beauté | Radiant Fluid Foundation Natural 光润粉底液 | 粉底液 | 日本 | 日本（以包装批次为准） | 980 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| cle-de-peau-radiant-matte | Clé de Peau Beauté | Radiant Fluid Foundation Matte 柔雾粉底液 | 粉底液 | 日本 | 日本（以包装批次为准） | 980 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| suqqu-the-liquid | SUQQU | The Liquid Foundation 粉霜 | 粉底液 | 日本 | 日本（以包装批次为准） | 700 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| charlotte-tilbury-airbrush | Charlotte Tilbury | Airbrush Flawless Foundation | 粉底液 | 英国 | 意大利（以包装批次为准） | 490 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| fenty-pro-filtr | FENTY BEAUTY | Fan's Red Carpet红毯气垫 | 粉底液（旧记录，待改为气垫资料） | 美国 | 美国（旧记录，待核验） | 340（旧记录，待核验） | 待核验 | 现有来源不匹配 | pending | blocked_mismatched_product_evidence |
| hourglass-ambient-soft-glow | HOURGLASS | Ambient Soft Glow Foundation | 粉底液 | 美国 | 美国（以包装批次为准） | 590 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| pat-mcgrath-skin-fetish | PAT McGRATH LABS | Skin Fetish: Sublime Perfection Foundation | 粉底液 | 英国 | 意大利（以包装批次为准） | 620 | 待核验 | 待核验 | pending | blocked_pending_product_evidence |
| lancome-is-me-liquid-blush | Lancôme | 是我液体腮红 | 腮红 | 法国 | 以包装批次为准 | 290 | 2026-10-29 | 有来源 | pending | blocked_image_authorization |
| lancome-pure-matte-lipstick | Lancôme | 菁纯丝绒雾面唇膏 | 唇妆 | 法国 | 以包装批次为准 | 380 | 2026-10-29 | 有来源 | pending | blocked_image_authorization |
| loreal-paris-anti-gravity-mascara | L’Oréal Paris | 反重力睫毛膏 | 睫毛膏 | 法国 | 以包装批次为准 | 144 | 2026-10-29 | 有来源 | pending | blocked_image_authorization |
| loreal-paris-single-eyeshadow | L’Oréal Paris | 纷泽口袋眼影 | 眼影 | 法国 | 以包装批次为准 | 待核验 | 待核验 | 有来源 | pending | blocked_missing_price_and_image_authorization |

当前结论：35 条中 34 条 recommendationReady 仍可作为内部规则演示候选，但这不等于公开可用；0/35 通过公开事实与图片授权门禁。队员的目标是补齐证据，不是把状态字段直接改成 verified。

## 2. 每条产品必须提交的资料

每个产品单独提交一份记录，不能把多个产品合并成一段口碑。字段分为“必须有证据的事实”“可以是编辑判断但必须标注来源性质”“必须有授权依据的素材”三类。

### 2.1 身份与规格（硬性必填）

| 字段 | 要求 |
| --- | --- |
| id | 使用现有稳定 ID；新增 ID 使用小写英文、数字和连字符，不得改名复用旧 ID。 |
| brand / name | 按品牌官方页面或正规销售页面的原文记录，同时保留中文展示名（如有）。不得自行翻译成不存在的商品名。 |
| category | 只能使用 粉底液、气垫、遮瑕、散粉、眼影、睫毛膏、腮红、唇妆；一款商品只能有一个主类别。 |
| brandRegion | 记录品牌所属地区，不等于生产地；必须有品牌官方品牌信息或可信资料来源。 |
| madeIn | 记录包装或官方页面明确标注的生产地；没有证据写“以包装批次为准/待核验”，不能根据品牌所属地区推断。 |
| size | 记录净含量和单位；不同规格必须拆成可区分的记录或明确主规格。 |
| variant | 记录版本、质地、系列或防晒值等会影响比较的规格；不能把不同版本混为一款。 |

### 2.2 价格与色号（时效字段）

- price 必须包含金额、货币、规格、地区、价格类型（官方建议零售价/正规渠道参考价/促销价）和来源 URL。
- priceVerifiedAt 使用访问页面的北京时间日期；促销价必须同时记录失效时间或明确标记为临时价。
- 色号必须逐个记录：name、官方色号原文、tone、lightness、可支持的适配说明和对应来源。没有色号清单就写“待核验”，不能按图片猜色号。
- 色号适配只能写“初筛方向/建议试色”，不能写“精准适合”“一拍即合”或保证结果。

### 2.3 妆效、适用条件和体验

- finish、coverage、质地、肤质、场景、持妆、氧化和 metrics 必须逐项标明性质：official_fact、editorial_observation 或 pending。
- 品牌宣称与队员试用/编辑观察分开写，不能把品牌营销词改写成独立实验结论。
- 持妆小时数、氧化程度、卡粉风险、评分等可比数据，必须提供样本、环境、测试方法和时间窗口；没有这些资料不得填数字。
- rating 只有在有公开来源、样本量、统计方法和时间范围时才可保留为用户统计；否则使用“编辑维度”或 null。
- pros、cautions、note 只能描述使用体验和限制，不得涉及医疗诊断、治疗、修复疾病或绝对化承诺。

### 2.4 来源字段（每条事实都要能追溯）

informationSources 至少一条，建议每个来源记录：

~~~json
{
  "title": "页面标题",
  "url": "https://example.com/product",
  "publisher": "品牌官网或正规渠道名称",
  "accessedAt": "2026-10-29",
  "supports": ["名称", "类别", "规格", "色号", "价格"],
  "evidenceNote": "页面中支持这些字段的简短说明"
}
~~~

来源优先级：品牌官方产品页/官方旗舰店 > 品牌客服或书面回复 > 有明确编辑和更新时间的正规零售商 > 可信媒体实测。搜索结果页、百科复制、无作者无日期的聚合页、社交平台转述不能单独支撑关键事实。

### 2.5 图片与授权字段（没有授权不得公开）

图片规则详见 product-image-collection.md。每张最终图片必须记录：

- 本地路径：public/products/<产品 id>/cover.webp；
- 原始来源页面 URL、权利方、许可证或书面授权依据；
- 获取日期、允许用途、署名要求和是否允许裁剪/转码；
- 图片尺寸、格式、文件校验值（如已生成）；
- imageAuthorizationStatus：只能是 pending、verified 或 rejected。

没有再利用授权的官方图片只能作为内部来源指向，不得下载后混入公开版本；搜索结果图、详情页热链、通用图库图和与商品不对应的占位图不能作为产品封面。

## 3. 状态与公开门禁

状态只能由证据推动，不能因为“字段已填”就升级。

| 状态 | 含义 | 可否进入公开产品库 |
| --- | --- | --- |
| pending | 证据或授权未补齐；允许继续采集 | 否 |
| verified | 事实字段有可复核来源，图片有明确再利用授权，审阅人已复核 | 是（仍需构建和页面验收） |
| rejected | 来源不可靠、授权被拒或事实冲突未解决 | 否，保留原因 |
| not_applicable | 经过审阅确认该字段确实不适用 | 仅可用于该字段，不代表产品整体通过 |

一条产品要进入公开版本，至少同时满足：

1. 身份、类别、规格、品牌地区和生产地有来源，未知项明确写出；
2. 价格有货币、规格、地区、来源 URL 和访问日期；
3. 色号清单与来源一致；
4. 妆效、适用条件、注意事项和体验字段逐项标出官方事实或编辑判断；
5. informationSources、imageSource、priceVerifiedAt、verificationStatus 均完整；
6. 图片授权已书面或许可条款确认，文件通过图片验收；
7. 评分若保留，样本与方法可复核；否则改为编辑维度；
8. 负责人复核产品详情、筛选、小Y推荐和移动端展示。

## 4. 严格禁止

- 不得虚构产品、价格、规格、产地、色号、成分、功效、评分、用户反馈或实时库存。
- 不得把代码中的参考价、编辑主观评分、模型回答或搜索摘要写成已核验事实。
- 不得用一个产品的来源支撑同品牌其他产品；每个产品必须有自己的证据。
- 不得用图片识别色号、生产地或肤质适配；图片只能作为素材，不能替代文字证据。
- 不得把“适合某肤质”写成医疗或诊断结论；敏感、红肿、破损或不适只能提示暂停使用并咨询专业人员。
- 不得使用“绝对适合”“精准诊断”“一定不脱妆”“零毛孔”等无法证明的词语。
- 不得复制大段品牌宣传文案冒充实测；引用必须短、可追溯并注明来源。
- 不得提交真实用户照片、对话、联系方式或未取得同意的试用资料。
- 不得把未授权图片放入 public/ 公开提交、公开视频或公开部署。

## 5. 队员提交格式

每条产品提交一个 Markdown 或 JSON 文件，文件名使用稳定 ID，例如 product-intake/nars-light-reflecting.md。提交内容至少包含：

~~~yaml
id: nars-light-reflecting
status: pending
collector: 姓名或队员编号
collectedAt: 2026-10-29
identity:
  brand: NARS
  name: 官方原文
  category: 粉底液
  brandRegion: 待核验
  madeIn: 待核验
  size: 待核验
  variant: 待核验
commerce:
  price: null
  currency: CNY
  priceType: official_msrp
  market: CN
  verifiedAt: null
  sourceUrl: null
shades:
  - name: 待核验
    tone: pending
    lightness: pending
    suitable: 仅在有依据时填写
experience:
  finish: pending
  texture: pending
  coverage: pending
  skinTypes: []
  scenes: []
  wearHours: null
  oxidation: pending
  note: 只写有来源或标明编辑观察的内容
  pros: []
  cautions: []
sources: []
image:
  localPath: public/products/nars-light-reflecting/cover.webp
  sourcePage: null
  rightsholder: null
  licenseOrAuthorization: null
  acquiredAt: null
  allowedUse: internal_only
  authorizationStatus: pending
review:
  factVerificationStatus: pending
  imageAuthorizationStatus: pending
  verificationStatus: pending
  recommendationReady: false
  reviewer: null
  reviewNotes: null
~~~

提交前自检：来源 URL 能打开、访问日期准确、每个数字有依据、未知字段没有猜测、图片权利状态明确、没有绝对化或医疗表述。缺一项就保持 pending，不要提交“看起来完整”的半真资料。

## 6. 交接与验收流程

1. 队员领取一个或多个现有产品 ID，不自行新增重复 ID。
2. 先收集官方身份、规格、价格、色号和图片授权证据，再补编辑观察；顺序不能反过来。
3. 提交资料文件、来源页面链接、图片授权依据和变更说明。
4. 维护者检查字段、来源、状态和文案；发现冲突时保留两方证据并标记 pending，不得择一猜测。
5. 维护者通过代码 schema/测试、详情抽屉、筛选、小Y推荐和移动端页面验收后，才可以变更 verificationStatus。
6. 每次阶段交付同步更新 product-data-accuracy-audit.md，记录北京时间日期、阶段编号、问题编号和提交 SHA/tag；没有新增核验也要明确写“无新增核验，继承上一结论”。

本任务单的完成标准不是“35 条都有文字”，而是每条都能清楚区分：已核验事实、编辑判断、待核验字段、图片授权和能否公开。质量优先于数量。

# YasPretty 产品数据准确性审计

审计日期：2026-10-28（北京时间）
审计范围：`src/data/products.js` 中当前导出的 35 条产品记录、页面展示字段和 `public/product/`、`public/brand/` 素材目录。
审计原则：没有来源页面、访问时间、授权依据或可复核原始记录的字段，不得标记为已核验；本文件不补写猜测来源，不把代码里的数值当成外部事实。

## 台账使用规则

本文件是产品事实、价格、图片、评分、来源和公开门禁的累计审计台账，不是产品宣传页，也不是对外部事实的自动背书。后续每完成一个开发阶段，必须在本文件追加一条阶段审计记录；即使没有新增核验，也要记录“无新增核验，继承上一结论”。

每条阶段记录至少包含：北京时间日期、阶段编号、审计范围、实际证据或证据缺口、`verificationStatus`、图片授权状态、公开门禁、问题编号（如 `YAS-YYYY-NNNN`）以及对应 Git commit SHA/tag。修订时保留旧结论和原因，不用覆盖历史来制造“已完成”。

状态只允许按证据改变：`pending`（待核验）、`verified`（证据完整且可复核）、`rejected`（证据不满足或授权拒绝）和 `not_applicable`（明确不适用）。模型输出、编辑示例、代码中的参考值、通用图片和搜索摘要都不能单独把状态改成 `verified`。

## 阶段审计记录

| 审计记录 | 日期 | 阶段 | 本次范围与事实 | 核验结论 | Git 追踪 |
| --- | --- | --- | --- | --- | --- |
| `AUDIT-2026-10-28-BASELINE` | 2026-10-28 | 阶段 0 | 建立 31 条产品记录、来源字段和图片授权缺口清单；未访问品牌官网、未取得授权 | 0/31 可公开；全部继承“待核验/禁止公开” | `d4f3750` |
| `AUDIT-2026-10-28-GATEWAY` | 2026-10-28 | 阶段 1 | 本阶段未新增产品事实、价格或图片；网关 schema 不等于产品事实核验 | 无新增核验，继承上一结论 | `d4f3750` |
| `AUDIT-2026-10-28-MAKEUP-PLAN` | 2026-10-28 | 阶段 2 | 结构化方案使用现有产品 ID 和参考值进行候选筛选；未新增官方来源、价格核验或图片授权 | 无新增核验；`CandidateEvidence` 只证明筛选过程，不证明商品事实 | `7ed400f` / `v0.3.0-stage-2` |
| `AUDIT-2026-10-29-CATALOG-EXPANSION` | 2026-10-29 | 阶段 3 | 新增兰蔻液体腮红、兰蔻菁纯丝绒雾面唇膏、巴黎欧莱雅反重力睫毛膏 3 条官网来源记录；另登记巴黎欧莱雅单色眼影但未取得结构化价格。官方图片仅作来源指向，未取得再利用授权 | 3 条新增记录的 `factVerificationStatus` 为 `verified`、`priceVerifiedAt` 和 `informationSources` 已填；`verificationStatus` 仍为 `pending`，公开状态为图片授权阻断。眼影保持 `pending` 且不进入推荐 | 工作树基于 `6511a58`；阶段提交/tag 待建立 |

后续阶段必须在本表追加新行，并在下方逐产品台账或对应证据文件中展开变更。没有证据的字段继续保持待核验，不得因为阶段功能已完成而自动解锁公开状态。

## 阶段 3 证据展开（YAS-2026-0003）

审计日期：2026-10-29（北京时间）。以下官网页面在本阶段访问并解析了商品名称、类别、色号或规格和 CNY 价格字段。`imageSource` 仅保存原始页面图片 URL 作为来源指向；没有取得品牌书面授权或明确允许再利用许可，因此 `verificationStatus` 仍为 `pending`，公开状态仍为阻断。

| 产品 ID | 官网证据 | 已核验字段 | 未核验/禁止公开 |
| --- | --- | --- | --- |
| `lancome-is-me-liquid-blush` | [兰蔻是我液体腮红](https://www.lancome.com.cn/product/LAN00316/) | 名称、腮红品类、#50/#40/#30 等色号、290 CNY 参考价；访问日期 2026-10-29 | 图片再利用授权、持妆时长、用户评分；禁止把官网文案改写成绝对功效 |
| `lancome-pure-matte-lipstick` | [兰蔻菁纯丝绒雾面唇膏](https://www.lancome.com.cn/product/LAN00295/) | 名称、唇部品类、#196/#296/#316 等色号、380 CNY 参考价；访问日期 2026-10-29 | 图片再利用授权、脱色/持妆统计、用户评分；色彩仍需结合唇色和光线复核 |
| `loreal-paris-anti-gravity-mascara` | [反重力睫毛膏](https://www.lorealparis.com.cn/product/MU0111/) | 名称、睫毛膏品类、9.9ml 规格、144 CNY 参考价；访问日期 2026-10-29 | 图片再利用授权、刷头/晕染/防水表现的独立证据、用户评分 |
| `loreal-paris-single-eyeshadow` | [单色眼影](https://www.lorealparis.com.cn/product/MU009/) | 名称、眼影品类和官方页面来源；访问日期 2026-10-29 | 本次未取得结构化价格和完整色号清单，`recommendationReady: false`，不进入方案商品推荐；图片授权也未取得 |

本阶段的 3 条可推荐记录使用现有通用占位图，不使用官方图片文件；界面持续显示“图片授权待核验”。新增记录的肤质、场景、质地和注意事项属于 YasPretty 编辑/规则维度，不冒充品牌官网或用户统计。

## 结论

当前产品数据可以支持旧版页面的筛选和本地演示，但不能称为“已完成数据准确性验收”。

| 检查项 | 当前结果 | 结论 |
| --- | ---: | --- |
| 产品记录 | 35 条 | 代码清单可复核 |
| 稳定 ID 重复 | 0 条 | 通过 |
| 类别分布 | 粉底液 22、气垫 3、遮瑕 3、散粉 3、腮红 1、唇妆 1、睫毛膏 1、眼影 1 | 代码事实，不等于外部事实核验 |
| `priceVerifiedAt` | 3 / 35 | 3 条阶段 3 商品有官网价格日期；其余待核验 |
| `informationSources` | 4 / 35 | 3 条可推荐商品和 1 条眼影资料有官网来源 |
| `imageSource` / 授权依据 | 4 / 35 有来源指向，0 / 35 有再利用授权 | 来源不等于授权，公开仍阻断 |
| `verificationStatus` | 0 / 35 可公开验证 | 3 条新增事实已核验但图片授权未补齐；其余待核验 |
| 评分样本与统计方法 | 0 / 35 | 所有 `rating` 只能作为编辑示例或不展示 |
| 公开可用图片授权证明 | 0 / 35 | 未授权或状态不明，禁止公开 |

因此当前公开门禁结论是：**0 / 35 条产品达到公开事实与素材验收标准**。3 条阶段 3 新增商品的官网事实可复核，但图片再利用授权未取得；这不是说每条产品事实必然错误，而是当前仓库仍不能把“未完成公开门禁”说成“已准确可公开”。

## 当前代码字段审计

当前记录包含 `id`、品牌、名称、类别、品牌所属地区、生产地、价格、价格区间、图片路径、肤质、妆效、遮瑕、持妆、氧化、评分、色号、编辑说明、优点、注意事项、场景和 metrics。它们满足现有旧页面渲染，但缺少公开版本必须有的证据字段：

- `priceVerifiedAt`：参考价格对应的地区、货币、规格、来源页面和访问时间。
- `informationSources`：产品名称、类别、色号、妆效、适用条件等外部事实的来源引用。
- `imageSource`：原始图片页面、权利方、许可证或书面授权、采集时间和允许用途。
- `verificationStatus`：例如 `pending`、`verified`、`rejected`，并且需要对应审核记录。
- 评分证据：样本量、来源、统计方法和时间窗口；没有这些资料不能使用“用户评分”“口碑统计”等表述。

## 逐产品台账

下面的价格是当前代码中的参考值，只用于定位待核验记录，**不是已核实价格**。`本地产品路径` 只说明代码引用了本地路径，不代表图片已获授权；`通用/远程路径` 也不代表它是对应商品实物图。

| 产品 ID | 品牌 | 产品名称 | 类别 | 代码参考价（元） | 当前图片路径类型 | 事实来源 | 图片授权 | 公开状态 |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| `nars-light-reflecting` | NARS | 超方瓶粉底液 | 粉底液 | 430 | 本地产品路径 | 待核验 | 待核验 | 禁止公开 |
| `estee-lauder-double-wear` | Estée Lauder | 持妆粉底液 | 粉底液 | 520 | 本地产品路径 | 待核验 | 待核验 | 禁止公开 |
| `armani-luminous-silk` | GIORGIO ARMANI | 大师粉底液 | 粉底液 | 690 | 本地产品路径 | 待核验 | 待核验 | 禁止公开 |
| `laneige-neo-matte` | LANEIGE | NEO 小方块气垫（哑光） | 气垫 | 295 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `clio-kill-cover` | CLIO | 杀手气垫 Founwear | 气垫 | 189 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `ysl-touche-eclat` | YSL | 恒久完美柔雾气垫 | 气垫 | 630 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `nars-radiant-creamy` | NARS | 亮采柔滑遮瑕蜜 | 遮瑕 | 320 | 本地产品路径 | 待核验 | 待核验 | 禁止公开 |
| `tarte-shape-tape` | tarte | Shape Tape 遮瑕液 | 遮瑕 | 260 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `the-saem-tip-concealer` | the SAEM | 得鲜经典遮瑕液 | 遮瑕 | 45 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `laura-mercier-translucent` | LAURA MERCIER | 柔光透明散粉 | 散粉 | 420 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `make-up-for-ever-hd` | MAKE UP FOR EVER | HD Skin 柔雾散粉 | 散粉 | 330 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `flower-knows-cloud` | 花知晓 | 云朵轻盈蜜粉饼 | 散粉 | 149 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `dior-forever-skin-glow` | Dior | Forever Skin Glow 恒久凝脂亮泽粉底液 | 粉底液 | 690 | 本地产品路径 | 待核验 | 待核验 | 禁止公开 |
| `dior-forever-matte` | Dior | Forever Skin Matte 恒久凝脂柔雾粉底液 | 粉底液 | 690 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `ysl-all-hours` | YSL | All Hours 恒久无瑕粉底液 | 粉底液 | 630 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `chanel-les-beiges` | CHANEL | LES BEIGES 健康光泽粉底液 | 粉底液 | 680 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `prada-reveal-skin` | PRADA BEAUTY | Reveal Skin 柔焦粉底液 | 粉底液 | 720 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `givenchy-prisme-libre` | GIVENCHY | Prisme Libre Skin-Caring Glow 粉底液 | 粉底液 | 620 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `lancome-teint-idole` | LANCÔME | Teint Idole Ultra Wear 持妆粉底液 | 粉底液 | 530 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `mac-studio-fix` | M·A·C | Studio Fix Fluid 柔雾持妆粉底液 | 粉底液 | 410 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `bobbi-brown-weightless-skin` | BOBBI BROWN | Weightless Skin 无感持妆粉底液 | 粉底液 | 620 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `mufe-hd-skin-foundation` | MAKE UP FOR EVER | HD Skin 高清持妆粉底液 | 粉底液 | 460 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `laura-mercier-real-flawless` | LAURA MERCIER | Real Flawless 柔光粉底液 | 粉底液 | 520 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `shiseido-revitalessence` | SHISEIDO | Revitalessence Skin Glow 粉底液 | 粉底液 | 520 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `cle-de-peau-radiant-natural` | Clé de Peau Beauté | Radiant Fluid Foundation Natural 光润粉底液 | 粉底液 | 980 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `cle-de-peau-radiant-matte` | Clé de Peau Beauté | Radiant Fluid Foundation Matte 柔雾粉底液 | 粉底液 | 980 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `suqqu-the-liquid` | SUQQU | The Liquid Foundation 粉霜 | 粉底液 | 700 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `charlotte-tilbury-airbrush` | Charlotte Tilbury | Airbrush Flawless Foundation | 粉底液 | 490 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `fenty-pro-filtr` | FENTY BEAUTY | Pro Filt’r Soft Matte Longwear Foundation | 粉底液 | 340 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `hourglass-ambient-soft-glow` | HOURGLASS | Ambient Soft Glow Foundation | 粉底液 | 590 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |
| `pat-mcgrath-skin-fetish` | PAT McGRATH LABS | Skin Fetish: Sublime Perfection Foundation | 粉底液 | 620 | 通用/远程路径 | 待核验 | 待核验 | 禁止公开 |

## 评分和推荐的准确性边界

- `rating` 当前只有 4.2–4.8 这些代码数值，没有样本量、来源或统计方法；界面必须使用“编辑示例，非用户统计”，不能使用“用户评分”“口碑分”。
- `metrics`、`pros`、`cautions`、`wear`、`oxidation`、`skins` 和 `scenes` 当前是产品资料字段，但没有逐条外部证据；它们只能作为内部候选规则的待核验输入。
- 阶段 2 的 `CandidateEvidence` 证明的是“程序如何根据当前记录筛选”，不证明产品事实本身真实。
- 预算筛选使用代码中的 `price` 数值，只能称为“按当前资料库参考值筛选”；不能称为实时价格或官方价格。
- 方案中的色号只是初筛方向，不能替代自然光试色、品牌柜台试色或专业测色。

## 图片与公开版本门禁

当前 `public/product/` 与 `public/brand/` 中的素材没有逐张原始页面、权利方、许可证/授权依据、采集时间和允许用途记录；代码还使用通用或远程图片路径。素材状态不明时：

1. 只能用于本地内部草稿和测试。
2. 不得进入 Git 公开版本、公开部署、参赛公开视频或宣传图。
3. 不得在产品详情中把通用图描述为对应商品实物图。
4. 完成授权后才可把该产品行从“禁止公开”改为“待复核”，再由负责人复核后改为“可公开”。

## 核验完成定义

一条产品只有同时满足以下条件，才能标记 `verificationStatus: verified` 并进入公开版本：

- 官方产品页或可追溯正规渠道确认品牌、名称、类别、规格、地区和当前价格。
- 价格记录货币、规格、来源 URL、访问时间和适用地区；价格变化后重新核验。
- 色号、妆效、肤质适配、注意事项等每类外部事实都有来源或明确标记为编辑建议。
- 图片有原始页面、权利方、许可证或书面授权、采集时间和允许用途。
- 评分如保留，记录样本量、来源、统计方法和时间窗口；否则删除综合评分，改为编辑维度。
- 通过产品 schema 检查，且 `informationSources`、`imageSource`、`verificationStatus` 和 `priceVerifiedAt` 不为空。

## 本次审计依据

- `src/data/products.js`：产品记录和页面当前使用字段。
- `docs/phase-0-baseline.md`：阶段 0 数据真实性与图片风险基线。
- `docs/product-image-collection.md`：现有图片采集规则，但它不是已完成的授权台账。
- `README.md`：公开版本的数据与素材边界。

本审计没有访问品牌官网、没有取得授权、没有验证价格，也没有把搜索结果当作证据。因此本文档的结论是“当前证据不足，禁止公开”，不是对任何品牌或产品事实作出新的真假判断。

## 当前界面处理

在来源证据补齐前，产品界面采用以下诚实表达：

- 产品图片标记“图片授权待核验”。
- 评分标记“编辑示例”，并在详情页标记“非用户统计”。
- 价格、产地、适用肤质、妆效和持妆参考标记“待核验”。
- 小Y和结构化妆容方案中的价格使用“参考价（价格待核验）”。

这些标签只是在界面上披露证据状态，不是对数据进行验证，也不允许把当前记录直接用于公开销售、广告或真实用户口碑宣传。

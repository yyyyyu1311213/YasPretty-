# 小Y第一阶段：40组当前行为记录（YAS-2026-0069）

记录时间：2026-11-28 23:05:53（北京时间）。基线 dev / origin/dev：`cdb8ace1bf0b98079cf254531ab620966244ef2f`。

这是一份诊断记录，40/40只表示采集器完成，并非40项体验验收通过。分类与建议是人工解读，逐轮数据由实际运行产生；不以修改业务代码让样本“全绿”。完整请求/响应与合成调用耗时见本地忽略的 `.qa/xiaoy-baseline-0069/results.json`。复跑入口为 `tests/baseline/xiaoy-capabilities.test.js`，样本输入为 `tests/baseline/xiaoy-scenarios.mjs`；B33–B39在测试文件中实现生命周期探针。

全部初始消息为空存储，Hook实际会加入欢迎消息；profile为合成值。a=合成甲星光气垫/油皮/哑光/300，b=合成乙月光粉底液/干皮/自然光泽/200，c=合成甲晨光粉底液/干皮/哑光/100；仅为测试夹具，不是商品事实或新增目录。方向/目标英文值通过自由输入验证服务端兼容，真实按钮操作另由B33/B34和已有浏览器测试覆盖。

每组按表从第一轮依次发送。B18/19/20/21/24/25/27/40中，问候用于结束首次引导后对同句复测；前后结果均保留。参数是独立调用现有extractParameters的观测，**不等同于肤质/入门引导覆写后的最终筛选条件**；实际候选及question/beginnerContext另列。HTTP失败或离线无返回意图时记“未返回”，不猜测内部路由。来源是已有知识元数据或合成检索URL，本轮未重新外部核验。模拟chat故意返回不合规范的结构触发现有降级，普通文本含格式测试标记[1]，并非真实来源或模型事实。

耗时单位毫秒，为本机模拟调用/采集的实际耗时，不能推算真实GLM延迟、费用或回答质量。

## B01 连续修改任务条件

候选改进项。预算首改可承接；再次改妆效/场景转通用问答，品类与排除品牌不再进入参数。不要合成乙转商品事实。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 5 / chat 5 / search 0；模拟provider耗时 0.154ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我是干皮，推荐粉底液，预算500元，不要合成甲 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）；品类为粉底液。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":500},"parameters":{"skin":"干皮","budget":500,"category":"粉底液","brands":[],"excludedBrands":["合成甲"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.078ms；整轮=43.3ms |
| 2. 预算改为300元 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）；品类为粉底液。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":300},"parameters":{"skin":"干皮","budget":300,"category":"粉底液","brands":[],"excludedBrands":["合成甲"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.028ms；整轮=4.957ms |
| 3. 妆效改为哑光 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":300},"parameters":{"skin":"干皮","budget":300,"finish":"哑光","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.015ms；整轮=7.034ms |
| 4. 场景改为面试 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":300},"parameters":{"skin":"干皮","budget":300,"scene":"面试","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.014ms；整轮=4.909ms |
| 5. 不要合成乙 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / product_fact / model<br>product_fact:partial | 月光粉底液 · 站内资料<br>`[]` | `{"profile":{"skin":"干皮","budget":300},"parameters":{"skin":"干皮","budget":300,"brands":[],"excludedBrands":["合成乙"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.019ms；整轮=4.315ms |

来源位置（本次未访问）：月光粉底液 · 站内资料（站内来源，无外部URL）。

复现定位：server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B01]`；按本节输入顺序运行测试可重建。

## B02 单次预算修正与预算不足

正常行为应保持；候选改进项。第一次预算修正保留品类和排除项；50元确无候选，不造商品。第二次预算修正的品类/排除项已丢失，不能据无候选声称全部约束仍保留。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 2 / search 0；模拟provider耗时 0.024ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我是干皮，推荐粉底液，预算500元，不要合成甲 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）；品类为粉底液。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":500},"parameters":{"skin":"干皮","budget":500,"category":"粉底液","brands":[],"excludedBrands":["合成甲"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.012ms；整轮=3.773ms |
| 2. 预算改为200元 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）；品类为粉底液。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":200},"parameters":{"skin":"干皮","budget":200,"category":"粉底液","brands":[],"excludedBrands":["合成甲"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.012ms；整轮=1.998ms |
| 3. 预算改为50元 | 资料库中暂时没有同时满足这些硬条件的产品。你可以调整预算或品类后再试。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":50},"parameters":{"skin":"干皮","budget":50,"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=1.391ms |

复现定位：server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B02]`；按本节输入顺序运行测试可重建。

## B03 排除品牌后再次修改

候选改进项。否定品牌转商品事实；后续预算修改返回b/c，原排除品牌丢失。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 3 / search 0；模拟provider耗时 0.047ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我是干皮，推荐粉底液，预算500元，不要合成甲 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）；品类为粉底液。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":500},"parameters":{"skin":"干皮","budget":500,"category":"粉底液","brands":[],"excludedBrands":["合成甲"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.015ms；整轮=2.839ms |
| 2. 不要合成乙 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / product_fact / model<br>product_fact:partial | 月光粉底液 · 站内资料<br>`[]` | `{"profile":{"skin":"干皮","budget":500},"parameters":{"skin":"干皮","budget":500,"category":"粉底液","brands":[],"excludedBrands":["合成甲","合成乙"],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.015ms；整轮=2.534ms |
| 3. 预算改为300元 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）。<br><br>第2项：合成甲 晨光粉底液：资料库适用肤质包含干皮；在预算内（资料库参考价）。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":300},"parameters":{"skin":"干皮","budget":300,"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":["b","c"]}` | chat/search=1/0<br>provider=0.017ms；整轮=1.662ms |

来源位置（本次未访问）：月光粉底液 · 站内资料（站内来源，无外部URL）。

复现定位：server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B03]`；按本节输入顺序运行测试可重建。

## B04 直接商品指代

正常行为应保持。紧邻比较后第二款定位b。合成模型故意不满足比较结构，比较按现有资料降级。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 2 / chat 2 / search 0；模拟provider耗时 0.021ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 比较星光气垫和月光粉底液 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>合成甲 星光气垫：品类：气垫<br>适合肤质：油皮<br>妆效：哑光<br>遮瑕：中<br>注意事项目前未知。<br><br>合成乙 月光粉底液：品类：粉底液<br>适合肤质：干皮<br>妆效：自然光泽<br>遮瑕：中<br>注意事项目前未知。 | 200 / product_comparison / local<br>product_comparison:partial | 星光气垫 · 站内资料;月光粉底液 · 站内资料<br>`[]` | `{"profile":{},"parameters":{"category":"气垫","brands":[],"excludedBrands":[],"productIds":["a","b"],"routePreference":"unspecified"},"productIds":["a","b"]}` | chat/search=1/0<br>provider=0.014ms；整轮=4.569ms |
| 2. 第二款 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / product_fact / model<br>product_fact:partial | 月光粉底液 · 站内资料<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":["b"]}` | chat/search=1/0<br>provider=0.007ms；整轮=2.004ms |

来源位置（本次未访问）：月光粉底液 · 站内资料（站内来源，无外部URL）。

复现定位：server/services/assistant/product-resolver.cjs；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B04]`；按本节输入顺序运行测试可重建。

## B05 比较插问后第二个

候选改进项。插问术语后第二个转通用回答，无受控商品锚点。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 3 / search 0；模拟provider耗时 0.018ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 比较星光气垫和月光粉底液 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>合成甲 星光气垫：品类：气垫<br>适合肤质：油皮<br>妆效：哑光<br>遮瑕：中<br>注意事项目前未知。<br><br>合成乙 月光粉底液：品类：粉底液<br>适合肤质：干皮<br>妆效：自然光泽<br>遮瑕：中<br>注意事项目前未知。 | 200 / product_comparison / local<br>product_comparison:partial | 星光气垫 · 站内资料;月光粉底液 · 站内资料<br>`[]` | `{"profile":{},"parameters":{"category":"气垫","brands":[],"excludedBrands":[],"productIds":["a","b"],"routePreference":"unspecified"},"productIds":["a","b"]}` | chat/search=1/0<br>provider=0.005ms；整轮=2.582ms |
| 2. 什么是哑光妆效 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"finish":"哑光","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.007ms；整轮=5.175ms |
| 3. 第二个 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.006ms；整轮=3.803ms |

来源位置（本次未访问）：月光粉底液 · 站内资料（站内来源，无外部URL）。

复现定位：server/services/assistant/product-resolver.cjs；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B05]`；按本节输入顺序运行测试可重建。

## B06 比较插问后第二款

候选改进项；正常边界应保持。插问后第二款要求澄清。不能盲目跨话题读取任意旧商品。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 2 / search 0；模拟provider耗时 0.013ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 比较星光气垫和月光粉底液 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>合成甲 星光气垫：品类：气垫<br>适合肤质：油皮<br>妆效：哑光<br>遮瑕：中<br>注意事项目前未知。<br><br>合成乙 月光粉底液：品类：粉底液<br>适合肤质：干皮<br>妆效：自然光泽<br>遮瑕：中<br>注意事项目前未知。 | 200 / product_comparison / local<br>product_comparison:partial | 星光气垫 · 站内资料;月光粉底液 · 站内资料<br>`[]` | `{"profile":{},"parameters":{"category":"气垫","brands":[],"excludedBrands":[],"productIds":["a","b"],"routePreference":"unspecified"},"productIds":["a","b"]}` | chat/search=1/0<br>provider=0.006ms；整轮=2.022ms |
| 2. 什么是哑光妆效 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"finish":"哑光","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.007ms；整轮=3.752ms |
| 3. 第二款 | 我还不能确定你指的是哪款产品。请告诉我产品名称和版本，或先选两款产品进行比较。 | 200 / product_fact / clarification<br>product_fact:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=1.243ms |

来源位置（本次未访问）：月光粉底液 · 站内资料（站内来源，无外部URL）。

复现定位：server/services/assistant/product-resolver.cjs；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B06]`；按本节输入顺序运行测试可重建。

## B07 入门直接继续

正常行为应保持。直接继续由base到brow，来源与进度存在。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 4 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.549ms |
| 2. natural_refinement | 好，我们从一点开始。你现在最想学什么？ | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"natural_refinement"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"men","selections":["natural_refinement"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.946ms |
| 3. goal-base | 先练薄涂和边缘衔接，今天不用追求高遮盖。<br><br>第1项：底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。<br><br>第2项：需要大面积均匀时，可以先用薄底妆，再把遮瑕集中在仍需修正的区域；局部色差或希望轻薄时，也可以先处理局部再薄铺底妆。<br><br>这些是通用手法，具体产品适配与颜色仍需结合实际试用；不需要为了开始练习先买齐产品。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;Should You Use Concealer or Foundation First?<br>`["foundation-application-basics","concealer-and-foundation-order"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"men","goal":"goal-base","time":null,"updates":[],"conditions":{"excludedBrands":[]},"lastStep":"base"}}` | chat/search=0/0<br>provider=0ms；整轮=3.888ms |
| 4. 继续 | 接下来整理眉毛。底妆之后先做这一步：<br><br>用眉刷梳开眉毛，先看原有走向和真正稀疏的位置，不急着重画整条眉。<br><br>按毛发生长方向，用短而轻的笔触少量补空隙，再梳散边缘；眉毛本来浓密时可以只梳理。<br><br>需要固定毛流时可少量使用眉部定型产品；退远看左右眉的整体平衡，不必追求完全对称。<br><br>保持眉部工具清洁，不共用；眼周或眉部出现红肿、刺痛或破损时停止使用并咨询合格专业人员。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | Brow tutorial for men: how to make eyebrows look thicker;I have acne! Is it okay to wear makeup?<br>`["mens-natural-brows"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"men","goal":"goal-base","time":null,"updates":[],"conditions":{"excludedBrands":[]},"lastStep":"brow"}}` | chat/search=0/0<br>provider=0ms；整轮=1.929ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[Should You Use Concealer or Foundation First?](https://www.lorealparisusa.com/beauty-magazine/makeup/face-makeup/concealer-or-foundation-first)；[Brow tutorial for men: how to make eyebrows look thicker](https://www.charlottetilbury.com/us/secrets/brow-tutorial-for-men)；[I have acne! Is it okay to wear makeup?](https://www.aad.org/public/diseases/acne/causes/makeup)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B07]`；按本节输入顺序运行测试可重建。

## B08 入门插问再继续

候选改进项。插问粉底/气垫区别可正常查知识，但之后继续无beginnerContext，转通用回答。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 5 / chat 2 / search 0；模拟provider耗时 0.019ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.257ms |
| 2. natural_refinement | 好，我们从一点开始。你现在最想学什么？ | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"natural_refinement"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"men","selections":["natural_refinement"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.64ms |
| 3. goal-base | 先练薄涂和边缘衔接，今天不用追求高遮盖。<br><br>第1项：底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。<br><br>第2项：需要大面积均匀时，可以先用薄底妆，再把遮瑕集中在仍需修正的区域；局部色差或希望轻薄时，也可以先处理局部再薄铺底妆。<br><br>这些是通用手法，具体产品适配与颜色仍需结合实际试用；不需要为了开始练习先买齐产品。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;Should You Use Concealer or Foundation First?<br>`["foundation-application-basics","concealer-and-foundation-order"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"men","goal":"goal-base","time":null,"updates":[],"conditions":{"excludedBrands":[]},"lastStep":"base"}}` | chat/search=0/0<br>provider=0ms；整轮=1.605ms |
| 4. 粉底和气垫有什么区别 | 小提示｜粉底液与气垫：形式、取用与上妆差异<br>适用条件：比较底妆形式或学习气垫的一般取用手法。<br>气垫也是一种底妆呈现形式，常将底妆与粉扑组合在便携盒内；粉底液则可用手指、刷具或海绵铺开。差别首先在包装、取用和补妆方式。气垫先少量取粉，以轻拍方式铺成薄层，再在需要覆盖的位置局部叠加。来源以网状气垫为例，不代表所有气垫内部结构相同。不能仅凭粉底液或气垫的名称判断遮瑕、持妆、妆效或肤质适配；这些仍须比较具体配方、商品证据和实际试用。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | Cushion Foundation — format and application guide;How To Apply Foundation & Foundation Tips<br>`["foundation-and-cushion"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.012ms；整轮=6.365ms |
| 5. 继续 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.007ms；整轮=3.639ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[Should You Use Concealer or Foundation First?](https://www.lorealparisusa.com/beauty-magazine/makeup/face-makeup/concealer-or-foundation-first)；[Cushion Foundation — format and application guide](https://www.maybelline.co.in/all-products/face/cushion-foundation)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B08]`；按本节输入顺序运行测试可重建。

## B09 切换话题再回原任务

候选改进项；正常边界应保持。切换话题正常退出；明确回到教程只重新检索底妆，未恢复进度。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 5 / chat 2 / search 0；模拟provider耗时 0.019ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.319ms |
| 2. natural_refinement | 好，我们从一点开始。你现在最想学什么？ | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"natural_refinement"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"men","selections":["natural_refinement"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.353ms |
| 3. goal-base | 先练薄涂和边缘衔接，今天不用追求高遮盖。<br><br>第1项：底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。<br><br>第2项：需要大面积均匀时，可以先用薄底妆，再把遮瑕集中在仍需修正的区域；局部色差或希望轻薄时，也可以先处理局部再薄铺底妆。<br><br>这些是通用手法，具体产品适配与颜色仍需结合实际试用；不需要为了开始练习先买齐产品。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;Should You Use Concealer or Foundation First?<br>`["foundation-application-basics","concealer-and-foundation-order"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"men","goal":"goal-base","time":null,"updates":[],"conditions":{"excludedBrands":[]},"lastStep":"base"}}` | chat/search=0/0<br>provider=0ms；整轮=1.498ms |
| 4. 换个话题，帮我写一句话 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.008ms；整轮=3.668ms |
| 5. 回到刚才的底妆教程，继续 | 小提示｜底妆入门教程：薄涂、分区和工具选择<br>适用条件：学习一般底妆上妆，皮肤没有破损或明显不适时。<br>底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。工具是手法选择，不代表一定得到某种妆效；实际妆面仍受产品质地、用量和环境影响。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips<br>`["foundation-application-basics"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.011ms；整轮=4.6ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[Should You Use Concealer or Foundation First?](https://www.lorealparisusa.com/beauty-magazine/makeup/face-makeup/concealer-or-foundation-first)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B09]`；按本节输入顺序运行测试可重建。

## B10 朋友明确条件单轮

候选改进项；正常边界应保持。单句第三人称不覆盖自己画像，但请求继承自己的油皮，朋友干皮条件未用于筛选。

初始上下文：`{"profile":{"skin":"油皮","budget":500},"messages":[]}`。总调用：HTTP 1 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 给我干皮的朋友推荐粉底液，预算200元 | 资料库中暂时没有同时满足这些硬条件的产品。你可以调整预算或品类后再试。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"油皮","budget":500},"parameters":{"skin":"油皮","budget":200,"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=1.971ms |

复现定位：server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B10]`；按本节输入顺序运行测试可重建。

## B11 朋友分轮补充条件

候选改进项。朋友任务跨轮补充预算/妆效写入自己的画像，缺少跨轮主体归属。

初始上下文：`{"profile":{"skin":"油皮","budget":500},"messages":[]}`。总调用：HTTP 4 / chat 3 / search 0；模拟provider耗时 0.027ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 帮朋友选粉底液 | 小提示｜底妆色号基础：明度、冷暖和自然光试色<br>适用条件：初筛底妆明度、冷暖和试色条件时。<br>色号初筛可以拆成明度和冷暖倾向两个维度，再在自然光下比较接近下颌和颈部的效果。文字、屏幕和室内灯光不能替代真实试色；氧化、配方质地和涂层厚度也可能改变最终观感，因此色号只能作为初筛建议。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Find A Foundation Shade For Your Skin Tone<br>`["foundation-shade-and-undertone"]` | `{"profile":{"skin":"油皮","budget":500},"parameters":{"skin":"油皮","budget":500,"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.013ms；整轮=4.482ms |
| 2. 她是干皮 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{"skin":"油皮","budget":500},"parameters":{"skin":"油皮","budget":500,"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.006ms；整轮=4.347ms |
| 3. 预算200元 | 资料库中暂时没有同时满足这些硬条件的产品。你可以调整预算或品类后再试。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"油皮","budget":200},"parameters":{"skin":"油皮","budget":200,"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=1.106ms |
| 4. 想要哑光 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{"skin":"油皮","budget":200,"finish":"哑光"},"parameters":{"skin":"油皮","budget":200,"finish":"哑光","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.008ms；整轮=2.011ms |

来源位置（本次未访问）：[How To Find A Foundation Shade For Your Skin Tone](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-find-a-foundation-shade-for-your-skin-tone)。

复现定位：server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B11]`；按本节输入顺序运行测试可重建。

## B12 肤质观察未知五轮与安全优先

正常行为应保持。观察最多五轮；仍未知后明确未按肤质筛选；后续红肿刺痛阻止上妆和推荐。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 7 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 推荐粉底液 | 我们继续选底妆。平时到下午，你脸上通常哪里容易出油？ | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":"general","selections":[],"initialQuery":"推荐粉底液","options":[{"label":"全脸都容易油","value":"skin-oily"},{"label":"主要是额头和鼻子","value":"skin-zone"},{"label":"不太出油","value":"skin-low-oil"},{"label":"没注意过，换个问法","value":"skin-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.027ms |
| 2. 不知道 | 换个好回想的问法：最近下午照镜子或摸脸时，哪种情况更常见？ | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"general","selections":["skin-answered:oil"],"initialQuery":"推荐粉底液；不知道","options":[{"label":"大部分脸油亮，摸着有油感","value":"skin-clue-all"},{"label":"鼻子额头油亮，两颊不明显","value":"skin-clue-zone"},{"label":"很少油亮，摸着也不油","value":"skin-clue-low"},{"label":"还是想不起来","value":"skin-clue-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.879ms |
| 3. 还是想不起来 | 两颊平时会紧绷、干燥或起皮吗？ | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":3,"route":"general","selections":["skin-answered:oil","skin-clue-unknown"],"initialQuery":"推荐粉底液；不知道","options":[{"label":"经常会","value":"cheek-often"},{"label":"偶尔会","value":"cheek-sometimes"},{"label":"基本不会","value":"cheek-never"},{"label":"说不清","value":"cheek-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.168ms |
| 4. 不知道 | 回想最近大多数日子，两颊更接近哪种感受？不用现在洗脸或改变护理。 | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":4,"route":"general","selections":["skin-answered:oil","skin-clue-unknown","skin-answered:cheeks"],"initialQuery":"推荐粉底液；不知道；不知道","options":[{"label":"常觉得干，笑起来有紧绷感","value":"cheek-usual-often"},{"label":"大多舒服，不干也不紧","value":"cheek-usual-never"},{"label":"只有偶尔或换季才干","value":"cheek-usual-sometimes"},{"label":"仍然说不清","value":"cheek-usual-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.085ms |
| 5. 不知道 | 最后确认一下，最近多数日子的整体情况，更像下面哪一种？ | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":5,"route":"general","selections":["skin-answered:oil","skin-clue-unknown","skin-answered:cheeks","skin-answered:cheeks-clue"],"initialQuery":"推荐粉底液；不知道；不知道；不知道","options":[{"label":"额头鼻子油，两颊经常干","value":"skin-pattern-mixed"},{"label":"大部分脸常油，干燥只是偶尔","value":"skin-pattern-oily"},{"label":"很少出油，两颊经常干","value":"skin-pattern-dry"},{"label":"不明显油，也不明显干","value":"skin-pattern-balanced"},{"label":"都不太像，暂时说不清","value":"skin-pattern-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.988ms |
| 6. 不知道 | 目前的日常感受还不够明确，暂时无法可靠判断肤质；以后留意下午的出油位置和两颊感受，再来补充即可。<br><br>继续看这几款粉底液：<br><br>第1项：合成乙 月光粉底液。<br>第2项：合成甲 晨光粉底液。<br><br>建议少量试用，并在自然光下试色。<br><br>本次没有按肤质筛选候选，先按已知的品类、预算等条件选择。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":["b","c"]}` | chat/search=0/0<br>provider=0ms；整轮=2.276ms |
| 7. 现在脸上红肿刺痛 | 先停止使用让你不适的产品，并咨询合格专业人员。现在有明显不适，暂不提供继续上妆或产品推荐。 | 200 / unsupported_sensitive / knowledge<br>unsupported_sensitive:answered | How to test skin care products<br>`["skin-reaction-safety"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=1.348ms |

来源位置（本次未访问）：[How to control oily skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/oily-skin)；[Dermatologists' top tips for relieving dry skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin)；[What Is My Skin Type and Why Does It Matter?](https://health.clevelandclinic.org/understanding-skin-types)；[How to approach skin care according to your skin type](https://www.uab.edu/news/news-you-can-use/how-to-approach-skin-care-according-to-your-skin-type)；[How to test skin care products](https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B12]`；按本节输入顺序运行测试可重建。

## B13 跳过肤质观察

正常行为应保持。主动跳过后保留预算300和粉底品类，不强加肤质，不再循环追问。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 2 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 推荐粉底液，预算300元 | 我们继续选底妆。平时到下午，你脸上通常哪里容易出油？ | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"category":"粉底液","budget":300,"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":"general","selections":[],"initialQuery":"推荐粉底液，预算300元","options":[{"label":"全脸都容易油","value":"skin-oily"},{"label":"主要是额头和鼻子","value":"skin-zone"},{"label":"不太出油","value":"skin-low-oil"},{"label":"没注意过，换个问法","value":"skin-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.863ms |
| 2. 先跳过 | 好的，先跳过肤质判断。<br><br>继续看这几款粉底液：<br><br>第1项：合成乙 月光粉底液：参考价在预算内。<br>第2项：合成甲 晨光粉底液：参考价在预算内。<br><br>建议少量试用，并在自然光下试色。<br><br>本次没有按肤质筛选候选，先按已知的品类、预算等条件选择。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":["b","c"]}` | chat/search=0/0<br>provider=0ms；整轮=2.036ms |

来源位置（本次未访问）：[How to control oily skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/oily-skin)；[Dermatologists' top tips for relieving dry skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin)；[What Is My Skin Type and Why Does It Matter?](https://health.clevelandclinic.org/understanding-skin-types)；[How to approach skin care according to your skin type](https://www.uab.edu/news/news-you-can-use/how-to-approach-skin-care-according-to-your-skin-type)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B13]`；按本节输入顺序运行测试可重建。

## B14 肤质观察自由纠正

正常行为应保持；候选改进项。混合倾向无合成商品时明确空结果；随后自述干皮可推荐，但已完成引导的预算500未继续保存为任务条件。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 1 / search 0；模拟provider耗时 0.006ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 推荐粉底液，预算500元 | 我们继续选底妆。平时到下午，你脸上通常哪里容易出油？ | 200 / clarification / clarification<br>clarification:clarification | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"category":"粉底液","budget":500,"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":"general","selections":[],"initialQuery":"推荐粉底液，预算500元","options":[{"label":"全脸都容易油","value":"skin-oily"},{"label":"主要是额头和鼻子","value":"skin-zone"},{"label":"不太出油","value":"skin-low-oil"},{"label":"没注意过，换个问法","value":"skin-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.745ms |
| 2. 鼻子油两边干 | 按你描述的情况，暂时偏向混合肤质。选底妆时可以同时照顾T区出油和两颊偏干，后续再按使用感受调整。<br><br>站内资料暂时没有找到适用肤质记录与“混合倾向”相符、且同时满足其他条件的底妆候选。我没有放宽肤质条件或推断产品适配；你可以跳过肤质筛选或调整其他条件后再试。<br><br>本次按你提供的日常感受筛选候选。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | How to control oily skin;Dermatologists' top tips for relieving dry skin;What Is My Skin Type and Why Does It Matter?;How to approach skin care according to your skin type<br>`["self-reported-skin-type"]` | `{"profile":{},"parameters":{"skinValues":["混油皮","混干皮"],"skinLabel":"混合倾向","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.083ms |
| 3. 我是干皮 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮。<br><br>第2项：合成甲 晨光粉底液：资料库适用肤质包含干皮。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮"},"parameters":{"skin":"干皮","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":["b","c"]}` | chat/search=1/0<br>provider=0.006ms；整轮=2.653ms |

来源位置（本次未访问）：[How to control oily skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/oily-skin)；[Dermatologists' top tips for relieving dry skin](https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin)；[What Is My Skin Type and Why Does It Matter?](https://health.clevelandclinic.org/understanding-skin-types)；[How to approach skin care according to your skin type](https://www.uab.edu/news/news-you-can-use/how-to-approach-skin-care-according-to-your-skin-type)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B14]`；按本节输入顺序运行测试可重建。

## B15 建议方向与用时

正常行为应保持。方向、目标、5分钟选项进入daily进度；选择不改长期画像。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 4 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.136ms |
| 2. daily_makeup | 好，我们从一点开始。你现在最想学什么？ | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"daily_makeup"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"women","selections":["daily_makeup"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.246ms |
| 3. goal-daily | 每天大概愿意花多久？不确定也可以跳过，我会先给简单的练习。 | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":3,"route":"women","selections":["daily_makeup","goal-daily"],"initialQuery":"我想化妆","options":[{"label":"5分钟以内","value":"time-five"},{"label":"10分钟左右","value":"time-ten"},{"label":"愿意慢慢学","value":"time-learn"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.192ms |
| 4. time-five | 按5分钟以内的时间，先练两件事：薄底妆和眉毛整理；做完就可以停，不要求完成全妆。<br><br>第1项：底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。<br><br>第2项：用眉刷梳开眉毛，先看原有走向和真正稀疏的位置，不急着重画整条眉。<br><br>这些是通用手法，具体产品适配与颜色仍需结合实际试用；不需要为了开始练习先买齐产品。<br><br>保持眉部工具清洁，不共用；眼周或眉部出现红肿、刺痛或破损时停止使用并咨询合格专业人员。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | 5 Quick Makeup Looks That Require 3 Products or Less;How To Apply Foundation & Foundation Tips;Brow tutorial for men: how to make eyebrows look thicker;I have acne! Is it okay to wear makeup?<br>`["quick-everyday-makeup","foundation-application-basics","mens-natural-brows"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"women","goal":"goal-daily","time":"time-five","updates":[],"conditions":{"excludedBrands":[]},"lastStep":"daily"}}` | chat/search=0/0<br>provider=0ms；整轮=1.446ms |

来源位置（本次未访问）：[5 Quick Makeup Looks That Require 3 Products or Less](https://www.lorealparisusa.com/beauty-magazine/makeup/makeup-looks/office-ready-makeup-looks)；[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[Brow tutorial for men: how to make eyebrows look thicker](https://www.charlottetilbury.com/us/secrets/brow-tutorial-for-men)；[I have acne! Is it okay to wear makeup?](https://www.aad.org/public/diseases/acne/causes/makeup)。

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B15]`；按本节输入顺序运行测试可重建。

## B16 口语自述后推荐

正常行为应保持。口语自述干皮后推荐匹配b/c，不重复肤质问卷。偶尔长痘不变成诊断。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 2 / chat 2 / search 0；模拟provider耗时 0.012ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我皮肤干，偶尔长痘 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{"skin":"干皮"},"parameters":{"skin":"干皮","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.006ms；整轮=3.577ms |
| 2. 推荐一款粉底液 | 智能回答未通过资料校验或未能完成，已降级为站内资料回答。<br><br>根据明确条件，优先看以下站内产品：<br><br>第1项：合成乙 月光粉底液：资料库适用肤质包含干皮；品类为粉底液。<br><br>第2项：合成甲 晨光粉底液：资料库适用肤质包含干皮；品类为粉底液。<br><br>参考资料有核验范围和时效限制，建议少量试用并在自然光下试色。<br><br>如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。 | 200 / catalog_recommendation / local<br>catalog_recommendation:answered | 无<br>`[]` | `{"profile":{"skin":"干皮"},"parameters":{"skin":"干皮","category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":["b","c"]}` | chat/search=1/0<br>provider=0.006ms；整轮=1.08ms |

复现定位：server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs。证据：`results.json → records[id=B16]`；按本节输入顺序运行测试可重建。

## B17 卡粉标准问法

正常行为应保持。标准卡粉问法命中patchy-base-adjustment；模型结构无效后按知识降级。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 1 / search 0；模拟provider耗时 0.01ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 粉底卡粉怎么办 | 小提示｜底妆起皮、卡粉时的一般调整<br>适用条件：上妆出现不均匀或堆积，希望调整一般手法；不用于判断皮肤疾病。<br>如果伴随刺痛、红肿、破损或明显不适，应停止使用并咨询合格专业人员。先减少底妆用量，从少量开始分区铺开，边缘用海绵或刷具轻轻带开；需要遮盖时再局部叠加。这是基于底妆教程的用量调整，不是对起皮或卡粉原因的诊断，也不能保证消除问题。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;How to test skin care products<br>`["patchy-base-adjustment"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.01ms；整轮=4.088ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[How to test skin care products](https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products)。

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B17]`；按本节输入顺序运行测试可重建。

## B18 卡粉口语问法

候选改进项。首次被引导；问候后仅命中底妆基础，未召回卡粉条目。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 1 / search 0；模拟provider耗时 0.01ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 一上底妆就起小皮屑怎么办 | 收到，你刚才提到「一上底妆就起小皮屑怎么办」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"一上底妆就起小皮屑怎么办","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.046ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.473ms |
| 3. 一上底妆就起小皮屑怎么办 | 小提示｜底妆入门教程：薄涂、分区和工具选择<br>适用条件：学习一般底妆上妆，皮肤没有破损或明显不适时。<br>底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。工具是手法选择，不代表一定得到某种妆效；实际妆面仍受产品质地、用量和环境影响。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips<br>`["foundation-application-basics"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.01ms；整轮=3.819ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)。

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B18]`；按本节输入顺序运行测试可重建。

## B19 卡粉描述式问法

候选改进项。描述式表达前后均通用回答，未利用既有相关手法条目；搓泥与卡粉语义仍应合理区分。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 2 / search 0；模拟provider耗时 0.012ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 粉底搓成一块一块的，看起来很脏 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.007ms；整轮=3.973ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.626ms |
| 3. 粉底搓成一块一块的，看起来很脏 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.005ms；整轮=3.406ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B19]`；按本节输入顺序运行测试可重建。

## B20 卡粉近义表达

候选改进项；正常行为应保持。首次被引导；问候后可命中卡粉及底妆基础。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 1 / search 0；模拟provider耗时 0.013ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 上完粉底脸上斑斑驳驳的 | 收到，你刚才提到「上完粉底脸上斑斑驳驳的」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"上完粉底脸上斑斑驳驳的","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.04ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.565ms |
| 3. 上完粉底脸上斑斑驳驳的 | 小提示｜底妆起皮、卡粉时的一般调整<br>适用条件：上妆出现不均匀或堆积，希望调整一般手法；不用于判断皮肤疾病。<br>如果伴随刺痛、红肿、破损或明显不适，应停止使用并咨询合格专业人员。先减少底妆用量，从少量开始分区铺开，边缘用海绵或刷具轻轻带开；需要遮盖时再局部叠加。这是基于底妆教程的用量调整，不是对起皮或卡粉原因的诊断，也不能保证消除问题。<br><br>小提示｜底妆入门教程：薄涂、分区和工具选择<br>适用条件：学习一般底妆上妆，皮肤没有破损或明显不适时。<br>底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。工具是手法选择，不代表一定得到某种妆效；实际妆面仍受产品质地、用量和环境影响。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;How to test skin care products<br>`["patchy-base-adjustment","foundation-application-basics"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.013ms；整轮=4.346ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[How to test skin care products](https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products)。

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B20]`；按本节输入顺序运行测试可重建。

## B21 排除眉毛只问粉底

候选改进项。首次被引导；问候后检索并实际输出被明确排除的眉毛手法，不能只依赖通用提示词处理排除。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 1 / search 0；模拟provider耗时 0.011ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 不要讲眉毛，只问粉底怎么涂 | 收到，你刚才提到「不要讲眉毛，只问粉底怎么涂」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"不要讲眉毛，只问粉底怎么涂","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.286ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.578ms |
| 3. 不要讲眉毛，只问粉底怎么涂 | 小提示｜自然眉毛教程：先梳理，再少量补空隙<br>适用条件：想保留原生眉毛、只整理形状和空隙；不是按脸型套固定模板。<br>用眉刷梳开眉毛，先看原有走向和真正稀疏的位置，不急着重画整条眉。按毛发生长方向，用短而轻的笔触少量补空隙，再梳散边缘；眉毛本来浓密时可以只梳理。需要固定毛流时可少量使用眉部定型产品；退远看左右眉的整体平衡，不必追求完全对称。短笔触、梳理与可选定型来自品牌专业教程；退远检查是编辑建议，不能保证某种眉形适合所有人。不必购买教程中的整套商品；自然眉形、粗细与浓淡由个人偏好决定。保持眉部工具清洁，不共用；眼周或眉部出现红肿、刺痛或破损时停止使用并咨询合格专业人员。<br><br>小提示｜底妆入门教程：薄涂、分区和工具选择<br>适用条件：学习一般底妆上妆，皮肤没有破损或明显不适时。<br>底妆可以先完成基础保湿，再从少量开始分区铺开…（原始记录保留全文） | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | Brow tutorial for men: how to make eyebrows look thicker;I have acne! Is it okay to wear makeup?;How To Apply Foundation & Foundation Tips;眉毛位置与眼睛大小视觉错觉研究;眉形与情绪感知研究;眉形与长脸、方脸审美评价研究<br>`["mens-natural-brows","foundation-application-basics","eyebrow-eye-face-perception"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.011ms；整轮=4.31ms |

来源位置（本次未访问）：[Brow tutorial for men: how to make eyebrows look thicker](https://www.charlottetilbury.com/us/secrets/brow-tutorial-for-men)；[I have acne! Is it okay to wear makeup?](https://www.aad.org/public/diseases/acne/causes/makeup)；[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[眉毛位置与眼睛大小视觉错觉研究](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00139/full)；[眉形与情绪感知研究](https://pubmed.ncbi.nlm.nih.gov/18454005/)；[眉形与长脸、方脸审美评价研究](https://pubmed.ncbi.nlm.nih.gov/17519727/)。

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B21]`；按本节输入顺序运行测试可重建。

## B22 明确排除眼线

正常行为应保持；真实效果待验证。通用分支传入硬限制、禁止内眼线等变体与简短要求；模拟回复不能证明真实模型遵守。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 1 / search 0；模拟provider耗时 0.009ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我不想画眼线 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼线","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.009ms；整轮=5.484ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B22]`；按本节输入顺序运行测试可重建。

## B23 一句多个问题

正常行为应保持。三个子问题各有知识条目、来源与answered覆盖，实际三次chat。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 3 / search 0；模拟provider耗时 0.029ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 粉底怎么涂；色号怎么选；化妆刷怎么选 | 第1项：粉底怎么涂<br>小提示｜底妆入门教程：薄涂、分区和工具选择<br>适用条件：学习一般底妆上妆，皮肤没有破损或明显不适时。<br>底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。工具是手法选择，不代表一定得到某种妆效；实际妆面仍受产品质地、用量和环境影响。<br><br>本次回答不构成医疗诊断。<br><br>第2项：色号怎么选<br>小提示｜底妆色号基础：明度、冷暖和自然光试色<br>适用条件：初筛底妆明度、冷暖和试色条件时。<br>色号初筛可以拆成明度和冷暖倾向两个维度，再在自然光下比较接近下颌和颈部的效果。文字、屏幕和室内灯光不能替代真实试色；氧化、配方质地和涂层厚度也可能改变最终观感，因此色号只能作为初筛建议。<br><br>本次回答不构成医疗诊断。<br><br>第…（原始记录保留全文） | 200 / compound / knowledge<br>beauty_knowledge:answered;beauty_knowledge:answered;beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;How To Find A Foundation Shade For Your Skin Tone;Makeup Brush Essentials: Artistry 101<br>`["foundation-application-basics","foundation-shade-and-undertone","brush-and-tool-selection"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=3/0<br>provider=0.029ms；整轮=11.745ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[How To Find A Foundation Shade For Your Skin Tone](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-find-a-foundation-shade-for-your-skin-tone)；[Makeup Brush Essentials: Artistry 101](https://www.bobbibrowncosmetics.com/how-to-makeup-brush-essentials)。

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B23]`；按本节输入顺序运行测试可重建。

## B24 相关知识上下文预算

正常边界应保持；候选改进项。首次被引导；问候后六项中两项回答、四项不可用，知识预算耗尽不绕到通用模型。零预算探针证明有相关条目；用户缺口说明仍可更精确。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 2 / search 0；模拟provider耗时 0.026ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤 | 收到，你刚才提到「眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然…」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"修容","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=3.132ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.738ms |
| 3. 眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤；眉毛怎么画自然和修容步骤 | 第1项：眉毛怎么画自然和修容步骤<br>小提示｜轻修容教程：少量阴影与柔和边界<br>适用条件：希望通过妆面明暗调整轮廓观感，且没有皮肤不适。<br>先在稳定光线下看自己原有阴影，再选择想强调的位置；颧骨下方、太阳穴、下颌或鼻侧都只是可选区域，无需全部画满。先取少量修容，轻轻晕开边界，观察正面与侧面；边界明显时先晕淡，再决定是否加深。鼻侧不必从眉头连画两条深线，也不必固定加高光；先少量试画并比较整体效果，觉得自然即可停下。可选位置和晕染来自品牌教程，光线下比较与少量试画是编辑建议，不是临床验证的定位公式。明暗修饰只改变视觉呈现，不改变骨骼，也不保证脸宽、鼻宽或立体感的固定变化。如有红肿、刺痛、破损或明显不适，先停止使用并咨询合格专业人员，暂不继续上妆。<br><br>小提示｜自然眉毛教程：先梳理，再少量补空隙<br>适用条件：想保留原生眉毛、只整…（原始记录保留全文） | 200 / compound / local<br>beauty_knowledge:answered;beauty_knowledge:answered;beauty_knowledge:unavailable;beauty_knowledge:unavailable;beauty_knowledge:unavailable;beauty_knowledge:unavailable | Makeup for men — products and how to;Brow tutorial for men: how to make eyebrows look thicker;I have acne! Is it okay to wear makeup?;眉毛位置与眼睛大小视觉错觉研究;眉形与情绪感知研究;眉形与长脸、方脸审美评价研究;Qualitative shape from shading;The Role of Regional Contrast Changes and Asymmetry in Facial Attractiveness Related to Cosmetic Use;Cosmetics Alter Biologically-Based Factors of Beauty: Evidence from Facial Contrast;Facial Cosmetics and Attractiveness: Comparing the Effect Sizes of Professionally-Applied Cosmetics and Identity<br>`["mens-subtle-contour","mens-natural-brows","eyebrow-eye-face-perception","contour-contrast-visual-perception"]` | `{"profile":{},"parameters":{"category":"修容","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=2/0<br>provider=0.026ms；整轮=22.054ms |

来源位置（本次未访问）：[Makeup for men — products and how to](https://www.charlottetilbury.com/us/secrets/makeup-for-men)；[Brow tutorial for men: how to make eyebrows look thicker](https://www.charlottetilbury.com/us/secrets/brow-tutorial-for-men)；[I have acne! Is it okay to wear makeup?](https://www.aad.org/public/diseases/acne/causes/makeup)；[眉毛位置与眼睛大小视觉错觉研究](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00139/full)；[眉形与情绪感知研究](https://pubmed.ncbi.nlm.nih.gov/18454005/)；[眉形与长脸、方脸审美评价研究](https://pubmed.ncbi.nlm.nih.gov/17519727/)；[Qualitative shape from shading](https://pmc.ncbi.nlm.nih.gov/articles/PMC12125524/)；[The Role of Regional Contrast Changes and Asymmetry in Facial Attractiveness Related to Cosmetic Use](https://pmc.ncbi.nlm.nih.gov/articles/PMC6302773/)；[Cosmetics Alter Biologically-Based Factors of Beauty: Evidence from Facial Contrast](https://pmc.ncbi.nlm.nih.gov/articles/PMC10426925/)；[Facial Cosmetics and Attractiveness: Comparing the Effect Sizes of Professionally-Applied Cosmetics and Identity](https://pmc.ncbi.nlm.nih.gov/articles/PMC5058481/)。

补充探针：

```json
{
  "unboundedKnowledgeIds": [
    "mens-natural-brows",
    "eyebrow-eye-face-perception"
  ],
  "zeroKnowledgeBudget": {
    "answer": "这是美妆知识问题。现有资料没有足够相关的已整理内容，暂时无法可靠解答；请补充具体手法或问题。",
    "answerMode": "clarification",
    "sources": [],
    "knowledgeEvidence": [],
    "knowledgeIds": [],
    "status": "unavailable",
    "missing": [
      "缺少足够相关的受控知识，或本轮知识上下文预算已用完。"
    ]
  }
}
```

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B24]`；按本节输入顺序运行测试可重建。

## B25 知识无匹配模型调用预算

正常行为应保持。问候后无匹配子问题最多四次模型调用，其余明确unavailable；保留首次问卷偏差。重复问题是预算压力样本，不是六种独立知识能力。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 4 / search 0；模拟provider耗时 0.023ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么 | 收到，你刚才提到「磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附…」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼影","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.717ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.699ms |
| 3. 磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么 | 第1项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第2项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第3项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第4项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第5项：磁性眼影的吸附原理是什么<br>这一项的服务或检索暂不可用，无法确认；可以稍后单独重试。<br><br>第6项：磁性眼影的吸附原理是什么<br>这一项的服务或检索暂不可用，无法确认；可以稍后单独重试。<br><br>仍缺少的信息：<br>“磁性眼影的吸附原理是什么”：服务、检索或本轮调用预算不足，尚未取得可用证据。<br>“磁性眼影的吸附原理是什么”：服务、检索或本轮调用预算不足，尚未取得可用证据。 | 200 / compound / local<br>external_question:answered;external_question:answered;external_question:answered;external_question:answered;beauty_knowledge:unavailable;beauty_knowledge:unavailable | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼影","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=4/0<br>provider=0.023ms；整轮=17.733ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B25]`；按本节输入顺序运行测试可重建。

## B26 规则未命中

正常行为应保持。规则未命中直接external_question，一次chat，不恢复固定菜单。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 1 / search 0；模拟provider耗时 0.006ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 有点烦，陪我聊聊 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.006ms；整轮=4.444ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B26]`；按本节输入顺序运行测试可重建。

## B27 知识无匹配

候选改进项；正常行为应保持。同句首次进入路线问卷，问候后进入通用回答且无知识来源/evidence。已有无匹配兜底有效，但入口有状态差异。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 1 / search 0；模拟provider耗时 0.005ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 磁性眼影的吸附原理是什么 | 收到，你刚才提到「磁性眼影的吸附原理是什么」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼影","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"磁性眼影的吸附原理是什么","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.822ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.34ms |
| 3. 磁性眼影的吸附原理是什么 | 合成回应<br><br>仅验证流程，不代表真实模型质量。[1] | 200 / external_question / model<br>external_question:answered | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼影","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.005ms；整轮=2.786ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B27]`；按本节输入顺序运行测试可重建。

## B28 模型未配置

正常行为应保持。未配置模型503，明确不可用，零调用。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 有点烦，陪我聊聊 | 智能服务当前不可用：智能服务暂未配置，当前无法回答该问题。站内产品浏览和本地推荐仍可正常使用。 | 503 / 未返回 / error<br>未返回 | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=4.207ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B28]`；按本节输入顺序运行测试可重建。

## B29 模拟模型超时

正常行为应保持。注入超时错误后503，未伪装成功；不是等待真实供应商超时的性能测量。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 1 / search 0；模拟provider耗时 0.05ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 有点烦，陪我聊聊 | 智能服务当前不可用：智能回答未能完成，请稍后重试或补充问题。站内产品浏览和本地推荐仍可正常使用。 | 503 / 未返回 / error<br>未返回 | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.05ms；整轮=3.381ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B29]`；按本节输入顺序运行测试可重建。

## B30 模拟联网失败

正常边界应保持。合成search抛普通Error映射500，显示失败且不编造实时资料；不代表真实provider错误码全部为500。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 0 / search 1；模拟provider耗时 0.055ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 联网搜索人工智能的定义 | 联网检索当前不可用：服务暂时不可用，请稍后再试。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。 | 500 / 未返回 / error<br>未返回 | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/1<br>provider=0.055ms；整轮=1.137ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B30]`；按本节输入顺序运行测试可重建。

## B31 来源存在但模型组织失败

正常行为应保持。合成搜索成功、结构提取失败，仍保留合成来源摘要并标partial。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 1 / search 1；模拟provider耗时 0.009ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 联网搜索人工智能的定义 | 联网检索已取得来源，但模型回答超时或未通过校验，已降级为搜索结果摘要。内容可能存在发布日期不同或冲突，请打开来源核对：<br><br>第1项：合成检索来源：仅用于测试来源摘录流程。 [1] | 200 / external_research / search<br>external_research:partial | 合成检索来源<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/1<br>provider=0.009ms；整轮=1.242ms |

来源位置（本次未访问）：[合成检索来源](https://example.test/baseline)。

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B31]`；按本节输入顺序运行测试可重建。

## B32 断网本地降级

正常行为应保持。navigator离线时零HTTP/provider，肤质引导可继续，明确干皮后本地返回b/c。不是实际断网浏览器缓存测试。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 0 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 推荐粉底液，预算300元 | 网络不可用，已降级为本地肤质引导，暂未推荐产品。平时到下午，你脸上通常哪里容易出油？ | 无HTTP / 未返回 / local<br>未返回 | 无<br>`[]` | `{"profile":{},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":"general","selections":[],"initialQuery":"推荐粉底液，预算300元","options":[{"label":"全脸都容易油","value":"skin-oily"},{"label":"主要是额头和鼻子","value":"skin-zone"},{"label":"不太出油","value":"skin-low-oil"},{"label":"没注意过，换个问法","value":"skin-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=0.258ms |
| 2. 不知道 | 网络不可用，可以继续本地观察。<br><br>换个好回想的问法：最近下午照镜子或摸脸时，哪种情况更常见？ | 无HTTP / 未返回 / local<br>未返回 | 无<br>`[]` | `{"profile":{},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"general","selections":["skin-answered:oil"],"initialQuery":"推荐粉底液，预算300元；不知道","options":[{"label":"大部分脸油亮，摸着有油感","value":"skin-clue-all"},{"label":"鼻子额头油亮，两颊不明显","value":"skin-clue-zone"},{"label":"很少油亮，摸着也不油","value":"skin-clue-low"},{"label":"还是想不起来","value":"skin-clue-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=0.267ms |
| 3. 鼻子油两边干 | 网络不可用，已降级为浏览器本地基础建议。<br><br>按你描述的情况，暂时偏向混合肤质。选底妆时可以同时照顾T区出油和两颊偏干，后续再按使用感受调整。<br><br>站内资料暂时没有找到适用肤质记录与“混合倾向”相符、且同时满足其他条件的候选。我没有放宽筛选或推断适配；可以跳过肤质筛选或调整其他条件后再试。 | 无HTTP / 未返回 / local<br>未返回 | 无<br>`[]` | `{"profile":{},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=0.592ms |
| 4. 我是干皮，推荐粉底液，预算300元 | 网络不可用，已降级为浏览器本地基础建议。<br><br>根据目前记录的需求（干皮），优先看这几款：<br><br>1. 合成乙 月光粉底液：建议先在自然光下试色，适合干皮、在预算内。<br><br>2. 合成甲 晨光粉底液：建议先在自然光下试色，适合干皮、在预算内。<br><br>色号仅作为初筛建议，实际结果还会受光线、肤色明度和氧化情况影响。<br><br>你没有提供肤质，我先按品类、预算和已知妆效做保守筛选。 | 无HTTP / 未返回 / local<br>未返回 | 无<br>`[]` | `{"profile":{"skin":"干皮","budget":300},"productIds":["b","c"]}` | chat/search=0/0<br>provider=0ms；整轮=0.401ms |

复现定位：server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js。证据：`results.json → records[id=B32]`；按本节输入顺序运行测试可重建。

## B33 方向选择失败与刷新重试

正常行为应保持。选择网络失败保留原问题与重试；模拟刷新后重试到目标问题，未越步。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 2 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.04ms |
| 2. 自然修饰<br>点选=natural_refinement | 网络不可用，这次选择尚未处理完成。已保留原问题和“自然修饰”，可以重试，也可以直接输入新的要求。 | 无HTTP / 未返回 / error<br>未返回 | 无<br>`[]` | `{"profile":{},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=0.214ms |

补充探针：

```json
{
  "afterRetry": {
    "id": "1795878353305-nm36iq",
    "role": "assistant",
    "content": "好，我们从一点开始。你现在最想学什么？",
    "productIds": [],
    "sources": [],
    "question": {
      "flowId": "xiaoy-guided-intake-v1",
      "step": 2,
      "route": "men",
      "selections": [
        "natural_refinement"
      ],
      "initialQuery": "我想化妆",
      "options": [
        {
          "label": "简单日常入门",
          "value": "goal-daily"
        },
        {
          "label": "底妆怎么上",
          "value": "goal-base"
        },
        {
          "label": "眉毛怎么画",
          "value": "goal-brow"
        },
        {
          "label": "眼妆或唇妆",
          "value": "goal-eye-lip"
        },
        {
          "label": "完整妆容",
          "value": "goal-full"
        },
        {
          "label": "还没想好",
          "value": "goal-unknown"
        }
      ]
    }
  },
  "retryQuery": "natural_refinement",
  "retryQuestion": {
    "flowId": "xiaoy-guided-intake-v1",
    "step": 2,
    "route": "men",
    "selections": [
      "natural_refinement"
    ],
    "initialQuery": "我想化妆",
    "options": [
      {
        "label": "简单日常入门",
        "value": "goal-daily"
      },
      {
        "label": "底妆怎么上",
        "value": "goal-base"
      },
      {
        "label": "眉毛怎么画",
        "value": "goal-brow"
      },
      {
        "label": "眼妆或唇妆",
        "value": "goal-eye-lip"
      },
      {
        "label": "完整妆容",
        "value": "goal-full"
      },
      {
        "label": "还没想好",
        "value": "goal-unknown"
      }
    ]
  }
}
```

复现定位：src/features/assistant/hooks/useAssistant.js；src/features/assistant/assistantApi.js；server/app.cjs。证据：`results.json → records[id=B33]`；按本节输入顺序运行测试可重建。

## B34 重复发送、旧按钮及忙时重置

正常行为应保持。悬挂请求期间重复发送只有一次请求，忙时不能重置；旧问题选项重复点击增量0。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 1 / search 0；模拟provider耗时 57.999ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=0.837ms |
| 2. 自然修饰<br>点选=natural_refinement | 好，我们从一点开始。你现在最想学什么？ | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"natural_refinement"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"men","selections":["natural_refinement"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.124ms |
| 3. 自然修饰<br>点选=natural_refinement | 好，我们从一点开始。你现在最想学什么？ | 无HTTP / 未返回 / ready<br>未返回 | 无<br>`[]` | `{"profile":{},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"men","selections":["natural_refinement"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=0.009ms |

补充探针：

```json
{
  "concurrentRequests": 1,
  "staleRequestDelta": 0
}
```

复现定位：src/features/assistant/hooks/useAssistant.js；src/features/assistant/assistantApi.js；server/app.cjs。证据：`results.json → records[id=B34]`；按本节输入顺序运行测试可重建。

## B35 入门进度刷新与消息截断

正常行为应保持；保留限制。保存进度后刷新继续到brow；内存27条，保存/再次读取20条；存储上限不等于完整历史永久保存。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 13 / chat 0 / search 0；模拟provider耗时 0ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 我想化妆 | 收到，你刚才提到「我想化妆」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"我想化妆","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=0.886ms |
| 2. natural_refinement | 好，我们从一点开始。你现在最想学什么？ | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"natural_refinement"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":2,"route":"men","selections":["natural_refinement"],"initialQuery":"我想化妆","options":[{"label":"简单日常入门","value":"goal-daily"},{"label":"底妆怎么上","value":"goal-base"},{"label":"眉毛怎么画","value":"goal-brow"},{"label":"眼妆或唇妆","value":"goal-eye-lip"},{"label":"完整妆容","value":"goal-full"},{"label":"还没想好","value":"goal-unknown"}]}}` | chat/search=0/0<br>provider=0ms；整轮=1.071ms |
| 3. goal-base | 先练薄涂和边缘衔接，今天不用追求高遮盖。<br><br>第1项：底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。<br><br>第2项：需要大面积均匀时，可以先用薄底妆，再把遮瑕集中在仍需修正的区域；局部色差或希望轻薄时，也可以先处理局部再薄铺底妆。<br><br>这些是通用手法，具体产品适配与颜色仍需结合实际试用；不需要为了开始练习先买齐产品。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips;Should You Use Concealer or Foundation First?<br>`["foundation-application-basics","concealer-and-foundation-order"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"men","goal":"goal-base","time":null,"updates":[],"conditions":{"excludedBrands":[]},"lastStep":"base"}}` | chat/search=0/0<br>provider=0ms；整轮=1.183ms |
| 4. 继续 | 接下来整理眉毛。底妆之后先做这一步：<br><br>用眉刷梳开眉毛，先看原有走向和真正稀疏的位置，不急着重画整条眉。<br><br>按毛发生长方向，用短而轻的笔触少量补空隙，再梳散边缘；眉毛本来浓密时可以只梳理。<br><br>需要固定毛流时可少量使用眉部定型产品；退远看左右眉的整体平衡，不必追求完全对称。<br><br>保持眉部工具清洁，不共用；眼周或眉部出现红肿、刺痛或破损时停止使用并咨询合格专业人员。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | Brow tutorial for men: how to make eyebrows look thicker;I have acne! Is it okay to wear makeup?<br>`["mens-natural-brows"]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"beginnerContext":{"version":1,"initialQuery":"我想化妆","route":"men","goal":"goal-base","time":null,"updates":[],"conditions":{"excludedBrands":[]},"lastStep":"brow"}}` | chat/search=0/0<br>provider=0ms；整轮=1.222ms |
| 5. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.373ms |
| 6. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.438ms |
| 7. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.341ms |
| 8. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.429ms |
| 9. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.445ms |
| 10. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.425ms |
| 11. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.365ms |
| 12. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.437ms |
| 13. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.345ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)；[Should You Use Concealer or Foundation First?](https://www.lorealparisusa.com/beauty-magazine/makeup/face-makeup/concealer-or-foundation-first)；[Brow tutorial for men: how to make eyebrows look thicker](https://www.charlottetilbury.com/us/secrets/brow-tutorial-for-men)；[I have acne! Is it okay to wear makeup?](https://www.aad.org/public/diseases/acne/causes/makeup)。

补充探针：

```json
{
  "beforeReload": {
    "version": 1,
    "initialQuery": "我想化妆",
    "route": "men",
    "goal": "goal-base",
    "time": null,
    "updates": [],
    "conditions": {
      "excludedBrands": []
    },
    "lastStep": "base"
  },
  "inMemoryCount": 27,
  "savedCount": 20,
  "reloadedCount": 20
}
```

复现定位：src/features/assistant/hooks/useAssistant.js；src/features/assistant/assistantApi.js；server/app.cjs。证据：`results.json → records[id=B35]`；按本节输入顺序运行测试可重建。

## B36 旧键迁移与损坏JSON读取

正常行为应保持。坏JSON回退；存在旧键时迁移有效旧消息并移除旧键，不接触真实用户存储。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 0 / chat 0 / search 0；模拟provider耗时 0ms。


补充探针：

```json
{
  "migrated": [
    {
      "id": "old",
      "role": "assistant",
      "content": "合成旧消息",
      "productIds": [
        "b"
      ]
    }
  ],
  "legacyRemoved": true,
  "corruptFallback": []
}
```

复现定位：src/lib/storage/migrations.js；src/lib/storage/storageClient.js；src/features/assistant/hooks/useAssistant.js。证据：`results.json → records[id=B36]`；按本节输入顺序运行测试可重建。

## B37 响应到保存的信息损失

候选改进项。API返回coverage/knowledgeEvidence/dialogueDecision等，但Hook消息只留文本、商品、来源等；意图与回答模式也未逐条保存。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 2 / chat 1 / search 0；模拟provider耗时 0.009ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.602ms |
| 2. 粉底怎么涂 | 小提示｜底妆入门教程：薄涂、分区和工具选择<br>适用条件：学习一般底妆上妆，皮肤没有破损或明显不适时。<br>底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。工具是手法选择，不代表一定得到某种妆效；实际妆面仍受产品质地、用量和环境影响。<br><br>本次回答不构成医疗诊断。 | 200 / beauty_knowledge / knowledge<br>beauty_knowledge:answered | How To Apply Foundation & Foundation Tips<br>`["foundation-application-basics"]` | `{"profile":{},"parameters":{"category":"粉底液","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=1/0<br>provider=0.009ms；整轮=3.288ms |

来源位置（本次未访问）：[How To Apply Foundation & Foundation Tips](https://www.maybelline.com/makeup-tips/face/face-makeup-tutorials-for-beginners/how-to-apply-foundation)。

补充探针：

```json
{
  "wireFields": [
    "ok",
    "answer",
    "sources",
    "usedWebSearch",
    "answerMode",
    "model",
    "intent",
    "coverage",
    "knowledgeEvidence",
    "dialogueDecision"
  ],
  "savedFields": [
    "id",
    "role",
    "content",
    "productIds",
    "sources"
  ],
  "droppedFields": [
    "ok",
    "answer",
    "usedWebSearch",
    "answerMode",
    "model",
    "intent",
    "coverage",
    "knowledgeEvidence",
    "dialogueDecision"
  ]
}
```

复现定位：src/features/assistant/hooks/useAssistant.js；src/features/assistant/assistantApi.js；server/app.cjs。证据：`results.json → records[id=B37]`；按本节输入顺序运行测试可重建。

## B38 请求8条4000字与产品ID截断

候选改进项；安全上限应保持。历史截到8条×4000字后仍达96502 UTF-8字节，超过64KiB得到413；不能通过放宽服务端安全上限掩盖。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 1 / chat 0 / search 0；模拟provider耗时 0ms。


补充探针：

```json
{
  "failure": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "请求内容过大。"
  },
  "payloadBytes": 96502,
  "sentCount": 8,
  "contentLengths": [
    4000,
    4000,
    4000,
    4000,
    4000,
    4000,
    4000,
    4000
  ],
  "sentFields": [
    "role",
    "content",
    "productIds"
  ],
  "status": 413
}
```

复现定位：src/features/assistant/hooks/useAssistant.js；src/features/assistant/assistantApi.js；server/app.cjs。证据：`results.json → records[id=B38]`；按本节输入顺序运行测试可重建。

## B39 未知版本读取、同版本形状与回退风险

候选改进项。未知v2回退空值，挂载写v1欢迎覆盖原值；同v1错误形状可被读取。仅合成未来数据模拟，不是执行Git回退。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 0 / chat 0 / search 0；模拟provider耗时 0ms。


补充探针：

```json
{
  "unknownVersionFallback": [],
  "rawBeforeMount": {
    "version": 2,
    "value": [
      {
        "role": "assistant",
        "content": "合成未来数据"
      }
    ]
  },
  "rawAfterMount": {
    "version": 1,
    "value": [
      {
        "id": "welcome",
        "role": "assistant",
        "content": "嗨，我是小Y。先用一句话告诉我你想解决什么；我会结合你的需求继续提问或给出建议。",
        "productIds": []
      }
    ]
  },
  "sameVersionBadShape": "invalid-shape"
}
```

复现定位：src/lib/storage/migrations.js；src/lib/storage/storageClient.js；src/features/assistant/hooks/useAssistant.js。证据：`results.json → records[id=B39]`；按本节输入顺序运行测试可重建。

## B40 多问题数量上限

正常行为应保持；保留首次入口偏差。八问题最多处理六项，四次chat后两项不可用，另有合并的延后项；没有悄悄宣称全部回答。

初始上下文：`{"profile":{},"messages":[]}`。总调用：HTTP 3 / chat 4 / search 0；模拟provider耗时 0.018ms。

| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |
|---|---|---|---|---|---|
| 1. 磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么 | 收到，你刚才提到「磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附…」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线： | 200 / clarification / clarification<br>clarification:clarification | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼影","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[],"question":{"flowId":"xiaoy-guided-intake-v1","step":1,"route":null,"selections":[],"initialQuery":"磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么","options":[{"label":"自然修饰","value":"natural_refinement"},{"label":"日常彩妆","value":"daily_makeup"},{"label":"按需求搭配、不区分性别","value":"neutral_makeup"},{"label":"先按原问题直接回答","value":"route-direct"}]}}` | chat/search=0/0<br>provider=0ms；整轮=2.457ms |
| 2. 你好 | 你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。 | 200 / greeting_help / local<br>greeting_help:answered | 无<br>`[]` | `{"profile":{},"parameters":{"brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=0/0<br>provider=0ms；整轮=2.244ms |
| 3. 磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么 | 第1项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第2项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第3项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第4项：磁性眼影的吸附原理是什么<br>合成回应<br><br>仅验证流程，不代表真实模型质量。[1]<br><br>第5项：磁性眼影的吸附原理是什么<br>这一项的服务或检索暂不可用，无法确认；可以稍后单独重试。<br><br>第6项：磁性眼影的吸附原理是什么<br>这一项的服务或检索暂不可用，无法确认；可以稍后单独重试。<br><br>尚未处理的问题：磁性眼影的吸附原理是什么；磁性眼影的吸附原理是什么<br>单次最多处理6个子问题，请分开发送。<br><br>仍缺少的信息：<br>“磁性眼影的吸附原理是什么”：服务、检索或本轮调用预算不…（原始记录保留全文） | 200 / compound / local<br>external_question:answered;external_question:answered;external_question:answered;external_question:answered;beauty_knowledge:unavailable;beauty_knowledge:unavailable;clarification:unavailable | 无<br>`[]` | `{"profile":{},"parameters":{"category":"眼影","brands":[],"excludedBrands":[],"productIds":[],"routePreference":"unspecified"},"productIds":[]}` | chat/search=4/0<br>provider=0.018ms；整轮=18.917ms |

复现定位：server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs。证据：`results.json → records[id=B40]`；按本节输入顺序运行测试可重建。

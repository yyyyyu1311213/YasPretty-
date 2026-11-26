# 男生自然妆知识接入与来源记录

2026-11-26（北京时间）。关联 YAS-2026-0064 的知识扩展，独立授权范围；已归档 ARCH-14 不重开，不新建 ARCH 阶段。本地实现待人工验收，未提交、未推送。基线 dev / origin/dev：`f65780588b96de71c8ff79c81c2a9c333fa266f5`。

## 当前运行行为

主站 → 小Y智能选妆。可以输入“男生眉毛怎么画”“男士底妆怎么涂”“男生修容教程”“男生化妆有什么科学证据”“剃须后化妆有哪些注意”“黄金比例可靠吗”。首轮仍按既有流程让用户选择路线；知识回答通过 `/api/assistant` 读取受控条目及来源。

新增 10 个知识条目，总数由实际代码中的 18 增至 28；新增 10 个来源，总来源数 40。不是新增商品库、自动爬虫或在线更新服务。品牌/化妆师教程支持手法，学会公众指南支持基础护理，实验与综述只支持其研究范围。没有导入教程商品、购买链接、价格、功效、照片或视频。

| 条目 ID | 回答范围 | 主要来源 |
| --- | --- | --- |
| `mens-natural-routine` | 肤色均匀、眉毛整理、可选明暗修饰的整体顺序 | CT 全妆、CT 眉妆、Eldridge |
| `mens-natural-base` | 少量底妆、局部遮瑕、胡须与眉毛积粉 | CT 全妆、Eldridge |
| `mens-natural-brows` | 梳眉、短笔触补空隙、可选定型 | CT 眉妆；AAD 工具卫生 |
| `mens-subtle-contour` | 可选阴影区域与少量晕染 | CT 全妆；光线比较等编辑建议明确标注 |
| `mens-skin-variation` | 男性皮肤群体研究与个体观察的区别 | AAD 男士护理、Rahrovan 综述 |
| `shaving-and-makeup` | 顺毛剃须、避免反复贴根、上妆前停止条件 | AAD 男士护理、DermNet |
| `makeup-hygiene` | 标签、卸妆、清洁、不共用工具 | AAD 彩妆与痘痘 |
| `mens-makeup-evidence` | 男性淡妆实验与面部对比度的研究边界 | Batres & Robinson；既有 Russell 来源 |
| `face-proportions-boundary` | 黄金比例不能作为唯一标准 | Naini 学术评论 |
| `selfie-perspective-boundary` | 近距离摄影的透视变化 | Ward 等数学模型短文 |

“干净”指少积粉、边界自然，不评价人的肤色、毛孔、痘印或价值。男生路线是用户主动表达的本次妆容偏好，不推断或保存性别身份；也不限制用户选择浓妆、腮红等其他风格。肤质仍按个人自述处理。

## 来源、访问与支持范围

以下时间为北京时间；运行数据使用同一时刻的 UTC ISO 时间。网页正文或论文文本只作阅读核验，不随项目复制分发。自动工具的 HTTP 200 不等于取得正文：三个 PMC 页面复访返回验证码，改用 Europe PMC 核验；失败记录保留在忽略目录 `.qa/mens-knowledge/`。

| 来源 | 访问时间 / 核验深度 | 支持与限制 |
| --- | --- | --- |
| [AAD — Skin care tips for men](https://www.aad.org/public/everyday-care/skin-care-basics/care/skin-care-for-men) | 11-26 14:23:05；公众指南正文 | 个人肤质、温和洁面、保湿、防晒、润湿胡须、顺毛剃须。不支持“男生都油”“皮厚就耐受”。 |
| [AAD — I have acne! Is it okay to wear makeup?](https://www.aad.org/public/diseases/acne/causes/makeup) | 11-26 14:23:05；公众指南正文 | non-comedogenic/oil-free 标签为线索、轻柔上妆、睡前卸妆、每周清洁化妆刷、不共用。标签不是个体保证；不导入药物建议。 |
| [DermNet — Pseudofolliculitis barbae](https://dermnetnz.org/topics/pseudofolliculitis-barbae) | 11-26 14:23:05；基础护理段落 | 顺毛剃须、不拉紧皮肤、避免过度贴根。排除药物、激光、疾病判断与人口标签；不规定统一等待上妆分钟数。 |
| [Charlotte Tilbury — Makeup for men](https://www.charlottetilbury.com/us/secrets/makeup-for-men) | 11-26 14:23:06；文字教程，视频未逐段核验 | 底妆、遮瑕、按需定妆、可选轮廓位置与晕染。商业品牌教程，不证明临床效果、价格、所有人适配或全天持妆。 |
| [Charlotte Tilbury — Brow tutorial for men](https://www.charlottetilbury.com/us/secrets/brow-tutorial-for-men) | 11-26 14:23:06；文字教程 | 梳理、短笔触补空隙、可选定型；不是必须购买三件商品，也不证明唯一眉形。 |
| [Lisa Eldridge — Make-up For The Boys!](https://www.lisaeldridge.com/blogs/articles/make-up-for-the-boys) | 11-26 14:23:06；文字教程，非完整视频复核 | 局部眼下遮瑕、面部试色、胡须眉毛清理、下颌边缘。含商业/联盟链接；排除“男性不应使用某种彩妆”等性别定式、出油倍数、旧商品与医疗宣称。 |
| [Batres & Robinson — Makeup increases attractiveness in male faces](https://pmc.ncbi.nlm.nih.gov/articles/PMC9632771/) | 11-26 14:23:34；经 [Europe PMC 全文](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC9632771/fullTextXML) 复核 | PLOS ONE，2022，DOI `10.1371/journal.pone.0275662`。20 张男性面孔、200 名美国评价者；7 分制均值 3.76→3.91，按评价者 d=0.34、按面孔 d=0.23；16 张提高、4 张下降。面孔年龄18–36岁，19人自述白人、1人亚洲人。整体淡妆不能分离各步骤贡献，不普遍推广中国男性；不复制受试者照片。 |
| [Rahrovan et al. — Male versus female skin](https://pmc.ncbi.nlm.nih.gov/articles/PMC6116811/) | 11-26 14:23:41；经 [Europe PMC 全文](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6116811/fullTextXML) 复核 | International Journal of Women’s Dermatology，2018，DOI `10.1016/j.ijwd.2018.03.002`。57 项纳入研究；皮脂、厚度等群体指标受年龄、部位、环境、方法影响。不能推出个人肤质或刺激耐受。 |
| [Naini — The golden ratio—dispelling the myth](https://pmc.ncbi.nlm.nih.gov/articles/PMC10792139/) | 11-26 14:27:09；经 [Europe PMC 摘要](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID%3A38228978&format=json&resultType=core) 复核 | Maxillofacial Plastic and Reconstructive Surgery，2024，DOI `10.1186/s40902-024-00411-2`。学术评论；黄金比例作为普遍理想缺乏令人信服的证据。不是对所有比例口诀的实验。 |
| [Ward et al. — Nasal Distortion in Short-Distance Photographs](https://pmc.ncbi.nlm.nih.gov/articles/PMC5876805/) | 11-26 14:23:08；全文短文 | JAMA Facial Plastic Surgery，2018，DOI `10.1001/jamafacial.2018.0009`。数学投影模型说明近距离摄影改变相对鼻宽呈现；不支持肤质诊断、相机准确率或颜值评分。 |
| [Russell — A sex difference in facial contrast and its exaggeration by cosmetics](https://pubmed.ncbi.nlm.nih.gov/19817153/) | 11-26 研究整理中摘要复核；未记录精确时刻，运行来源保留既有 11-22 日期 | Perception，2009，DOI `10.1068/p6331`。受控图像的眼/唇与周围皮肤明暗，不是全脸加深/减淡指令，不用于推断性别。复用既有来源 ID。 |
| [Morikawa et al. — A real-life illusion of assimilation in the human face](https://pmc.ncbi.nlm.nih.gov/articles/PMC4367164/) | 11-26 研究整理中摘要复核；运行来源保留既有 11-22 日期 | Frontiers in Human Neuroscience，2015，DOI `10.3389/fnhum.2015.00139`。眉眼距离、眼影与观看距离影响眼睛大小观感；非男性专门实验。复用原眉眼研究条目，不推出所有男生应降低眉毛。 |

退远观察左右眉、稳定光线下比较、按需跳过、不打颜值分、暂停不适处上妆等是编辑整合/项目边界，条目已与研究结论区分。新的 `reviewedAt` 指实际核验时间，不代表论文发布日期；不宣称所有继承来源都在本轮重新核验。

## 接入与失败行为

- `mens-makeup-entries.cjs` / `mens-makeup-references.cjs` 由现有知识入口加载，无第二套检索服务。关键词增加男士/男性、眉型、刮胡子同义词；相关性门槛通过后才按教程/研究目的排序，保留无命中。
- `guided-intake.cjs` 让眉毛、修容重点检索实际教程；只询问底妆手法时直接给教程，不无故转成选品肤质问答。产品事实与时效问题仍走原产品/联网路径。
- `parameters.cjs` 仅从明确的文字需求或主动路线生成请求风格；自然男生方案由 `plan-knowledge.cjs` 提供底妆、眉毛及独立可跳过的轻修容。默认 7 步，此路线增加第 8 步；修容产品 ID 留空，不把腮红候选伪装为修容商品。原商品候选、打分与硬条件保持。
- 无 Key、模型无效或超时仍可返回受控条目；模型只能组织原句。知识的条件、限制、安全句与来源一起保留；聊天方案也附回知识限制。剃须刮破、出血、渗液等输入优先停止上妆/选品。
- 完全断网时前端不能调用服务器知识库，明确服务不可用；不把旧模型记忆冒充本次检索。来源失效需后续人工复核，不承诺持续联网更新。

## 验证与交付范围

测试代码：`server/knowledge/mens-makeup.test.js`、`tests/browser/mens-makeup-knowledge.mjs`。覆盖自然语言召回、教程优先、来源完整性、上下文预算、无 Key/合法组织/无效输出/超时、刮破安全、引导承接、方案步骤与知识边界保留。桌面 1440×900 与手机视口 360×900 使用实际生产页面 → Fastify HTTP；provider 为合成夹具，无真实模型调用。最终全量测试、构建和页面结果见累计阶段报告。

本地 `.qa/mens-knowledge/no-env.cjs` 将 `dotenv.config` 替换为空结果；`.qa/mens-knowledge/vite.config.mjs` 导入原 Vite 配置并设 `envDir:false`。复跑者可在忽略目录创建这两份隔离文件，用以下命令避免读取真实 `.env`：

```powershell
$env:NODE_OPTIONS='--require=./.qa/mens-knowledge/no-env.cjs'
npm test -- --config .qa/mens-knowledge/vite.config.mjs
npm run build -- --config .qa/mens-knowledge/vite.config.mjs
$env:YAS_QA_BROWSER_EXECUTABLE='C:/Program Files/Google/Chrome/Application/chrome.exe'
node tests/browser/mens-makeup-knowledge.mjs
git diff --check
```

无新依赖、图片、商品记录、API endpoint、存储键、照片处理或服务端永久记忆。保留同工作树已获授权的肤质引导续修；不能把本次全量测试通过当作其他任务已经人工验收。真实 GLM 质量、实体手机与公网部署尚未验证；已有大包警告、商品资料/图片授权风险继承。

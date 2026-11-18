# YasPretty 前端架构迁移计划

本文是 `master` 前端目录与模块迁移的**阶段执行单一事实源**。架构代码、公共规范、README 和两份累计报告在 master 同步维护，不再执行原开发分支与 master 的规范同步流程。开始架构工作前按 `AGENTS.md` 13.3 核对 master 和远端，完整阅读本文及 README“项目架构”，只实施唯一 `current` 阶段。ARCH-00～04 原在开发分支完成的历史记录原样保留；本次切换已人工验收通过，不在切换任务中实施 ARCH-05。

本文的 `ARCH-*` 是架构迁移编号，不对应 `AGENTS.md` 中的正式产品阶段 0–6，也不能据此把任何正式产品阶段标记为完成。

## 1. 当前执行状态

| 项目 | 当前记录 |
| --- | --- |
| 统一开发与规范分支 | `master`；不再使用原开发分支或执行双分支规范同步 |
| 当前切换任务 | `done`；整体“人工验证通过”，普通合并已正常推送，原本地/远端开发分支已安全删除并核验；详见 5.2 |
| 合并前 master / 实际远端 | `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`；fetch 和实际远端查询已核对 |
| 原开发分支末端（历史定位） | `codex/frontend-contracts-yas-2026-0055` / `4062153c512107534b88f3bc6011ffa869334c8a`；末端已纳入 master，本地和远端分支均已删除，原提交及标签保留 |
| 切换完成 master SHA / 已核验远端 | 普通合并 `8caf4dcdad416a2a8fbc6057a7f5a289403e9a1c`；纯文档归档提交 `3b7ceee79576d8d38ff3821d1d688914d49c2f18`，ARCH-05 启动时已核对实际远端 |
| 当前阶段 | ARCH-12「展示层所有权收敛」已完成人工验收；本次归档后无新的 `current` |
| 下一阶段 | 无新的 `current`；未授权开启其他阶段 |
| 已验收阶段 | ARCH-00～11 均 `done` 且已归档；ARCH-11 最终提交 `57b0a877a9a6bbd769fdb079c2c4ef71629e28e9` / `arch-stage-11` 已核对本地及实际远端 |
| 前置 contracts | 六个 JSDoc 契约文件；原提交 `86b25b331106b49b02f10b499de7f7d94c24032b`（YAS-2026-0055）随合并保留 |
| ARCH-00 | `arch-stage-00` 对象 `cb811573c820bc01bd5ee5628f24c5e30fc6600e` → `8c95966cf61367396fd6783da1f86c8569546668` |
| ARCH-01 | `arch-stage-01` 对象 `ba59303891315291dcdab02b6906971b1799d339` → `5e58236f6897147b354153ea9b02d080641a3cea` |
| ARCH-02 | `arch-stage-02` 对象 `47a9d3a27bf11a305c2ecb94eacea0e99195b2af` → `f0d02eb64ced01c0fd1fa5fc210eb687050620e5` |
| ARCH-03 | `arch-stage-03` 对象 `b8bacb242f91983b471ccd097470aca6287d5152` → `bf7e2254001fe3cc1fa7619c925fb3a8a00d456c` |
| ARCH-04 | `arch-stage-04` 对象 `21597c84fa0d0c44a1ef3d4dd24ef0a8c36af78d` → `4062153c512107534b88f3bc6011ffa869334c8a`；“人工核验完毕”及两份累计报告存在 |
| ARCH-05 | arch-stage-05 对象 11b0d3e419b1fe642e3ed650fb07b9fc4ab9ceba → bf988460ae8c9611eaae21adb02a34c3bfc53fa1；本地和实际远端一致 |
| ARCH-06 | arch-stage-06 对象 dc38c7ac170701918cae4e08bf20e2ccee2ffd50 → e78c87f6768444138b88adca33b1221aa6c03d89；本地和实际远端一致 |
| ARCH-07 | arch-stage-07 对象 c7765c37a83ce0dc4806d2db50ae84ebfbd9c4a9 → 7f71699ddea914c36a1ad3b0c877ad0d6eb31755；本地和实际远端一致 |
| ARCH-11 | `arch-stage-11` 对象 `89aa7c31466b3d270bab4820d0b34c6c38730c4e` → `57b0a877a9a6bbd769fdb079c2c4ef71629e28e9`；保留且不复用、移动或删除 |
| 最近远端核对 | 2026-11-17 19:39–19:40（北京时间）ARCH-12 启动：fetch/实际 ls-remote 核对 master/HEAD/origin/master/FETCH_HEAD 均为 `57b0a877a9a6bbd769fdb079c2c4ef71629e28e9`，ahead/behind 0/0；00～11 本地/远端带注释标签对象与实际指向一致，12 不存在；起始工作树、未跟踪与索引为空 |
| 最近验证结果 | ARCH-12：相关18文件143/143、全量42文件336/336、build2905；导入/所有权审计通过；前后开发各116/116、20状态计算样式/几何差异0、无Key生产38/38、HTTP路由73/73；人工验收通过，失败和限制见 ARCH-12 记录 |

实际代码与测试是判断模块是否落地的事实依据。ARCH-11 在原批准范围内已经归档；ARCH-12 是后续新增的展示层归属整改，不是对 ARCH-11 测试或验收结论的否定。ARCH-00～11 的提交、标签、人工确认/豁免、失败和风险记录全部保留。下文既有待验收/未提交/current/无新的 current 描述是当时快照；ARCH-12 人工验收通过后当前无新的 `current`，最新事实以本节及 ARCH-12 收尾记录为准。

## 2. 文档分工

- `AGENTS.md`：强制项目规则，并要求架构任务先读取本文。
- 本文：master 统一维护公共约束、唯一 current、整阶段验收门禁和真实执行记录；保留原开发分支阶段历史。
- `README.md`：同步当前实际架构树、前端目标架构树、依赖边界和真实文件路径。
- `FINAL-PROMPT.md`：约束长期产品目标，不因本次目录迁移改变。
- 实际代码与测试：判断当前实现状态的唯一事实依据。

## 3. 全程约束

1. 架构代码、测试、规范、README、本文执行记录及审计统一在 `master` 实施与验证，不再使用原开发分支或执行规范同步；整阶段连续处理后统一交人工验收。
2. 每次只执行一个 `current` 阶段，不并行实施多个阶段，不提前处理后续模块。
3. 如需调整阶段顺序或范围，必须先获得项目负责人明确授权并更新本文。
4. `src/contracts/` 已由原前置提交建立并保留在 master 合并工作树，不重复创建；实际数据契约有差异时单独报告和修正。
5. 迁移只改变代码组织、引用和必要的组合方式，不改变 UI、文案、样式效果、API 地址和字段、推荐算法、评分、错误语义、降级行为或存储 Key。
6. 不修改服务端、`public/`、`src/data/` 中的产品事实、核验记录和素材；仅允许更新指向这些文件的代码引用。
7. 不引入 Redux、TypeScript 全量迁移、新 UI 框架或新依赖。
8. 不创建没有实际职责的空目录、空文件或一次性抽象；组件拆分不应造成无意义的 props 转发。
9. 移动代码时同步更新引用和测试，不长期保留重复实现或无意义的转发导出。
10. 每阶段完成后必须同步本文状态、真实验证结果和 README“项目架构”的当前实际结构及相关路径。
11. 未经负责人明确确认，不提交、不推送、不打标签或删除分支。整阶段人工通过后按 `AGENTS.md` 13.2 在 master 提交并正常推送已验收范围，不执行发布、强推或改写公共历史；删除分支须有该具体操作授权。
12. 不覆盖用户现有修改，不删除来源不明文件、历史证据或旧版备份。

开始修改以及提交、推送前，先 `git fetch origin master` 并核对当前分支、HEAD、工作树、暂存区、实际远端和标签，记录 master 基线和远端核对时间。master 只以 fast-forward 更新；分支/HEAD/阶段状态不符、未提交修改、重要未跟踪文件、远端领先/分叉、标签缺失或来源不明文件时先报告询问，不自动清理、覆盖、暂存或提交。无法核验远端时只读检查并如实说明。未提交修改、未跟踪文件与 stash 不是版本回退点。

## 4. 阶段状态与门禁

阶段状态只使用以下四种；“待人工验收”是 current 阶段或当前切换任务的交付状态，不等于 done：

- `pending`：尚未开始。
- `current`：当前唯一允许执行的阶段。
- `blocked`：存在阻塞，必须记录原因和下一步。
- `done`：完整阶段实现、验证、文档和人工验收均已完成；ARCH-03 原明确豁免作为历史例外保留，不用于后续阶段。

标记 `done` 前必须满足：

1. 本阶段实际修改已经落地，且没有提前实现后续阶段。
2. 相关测试已运行并通过；每次涉及代码的阶段都运行 `npm test` 和 `npm run build`。
3. 涉及用户界面的阶段已检查相关成功、失败和降级路径，以及一个常见桌面视口和一个 360px 级手机视口。
4. 浏览器控制台无新增未处理错误。
5. README 当前架构树、受影响路径和本文状态已经同步。
6. `git diff --check` 通过，交付中列明修改文件、真实验证结果和剩余风险。
7. 如已获授权提交，记录提交 SHA；未提交时明确写“未提交”，不得虚构 SHA。
8. 人工验收、阶段收尾及 `AGENTS.md` 12.1 两份累计报告已同步；无数据变化写明无新增核验。人工通过后立即更新本阶段 done、下一阶段唯一 current 和执行记录；最后阶段通过时明确无新的 current。最终状态纳入收尾提交，远端提交及阶段标签核验成功后，才称“已完成归档”；指定下一阶段不等于提前实施。

## 5. 每阶段固定工作流

```text
fetch origin master，核对 master/HEAD/工作树/暂存区/远端/标签
→ 完整阅读 AGENTS、FINAL-PROMPT、本文和 README，确认唯一 current 与上一已验收归档基线
→ 登记整阶段范围、原因、修改前 SHA、文件、验证和回退安排
→ 按依赖完成整个阶段的迁移、引用与测试，不逐小步停等人工确认
→ 实际运行相关测试、npm test、npm run build、git diff --check 和相应页面回归
→ 同步 README、本文、两份累计报告与真实证据，阶段保持 current，交付状态“待人工验收”
→ 一次性交负责人整阶段人工验收；此前不提交、不推送、不打标签、不删除分支
→ 明确通过后立即写本阶段 done、下一阶段唯一 current，并追加确认范围和执行记录
→ 按已验收清晰范围暂存、检查、提交并正常推送 master，核对实际远端 SHA
→ 在包含最终状态/验收/收尾记录的提交创建唯一带注释 arch-stage-XX 并推送核验
→ 报告真实 SHA/tag，下一次文档同步回填；下一阶段实施前先完成本阶段归档
```

最后阶段人工通过后全部 done，明确没有新的 current。人工失败则保留现场、停在本阶段，不提交、不推送、不删除分支；修复后重新执行完整验证。新增实质修改需重新人工确认。

### 5.1 提交、标签与回退门禁

- ARCH-05～11 按完整阶段统一人工验收，内部工作项无需强制分配 `ARCH-XX-SNN` 或逐项等待确认；既有小步编号、SHA 与记录保留。
- 人工确认仅授权已验收的完整阶段范围。未获负责人明确确认，不提交、推送、打标签或删除分支；删除须有针对具体分支的授权。不能因某内部工作项通过而跳过阶段验收。
- 验收后按清晰范围建立可独立构建、验证和回退的提交，不混入其他阶段或无关修改。提交信息使用 `【问题】[ARCH-XX] …【修改】…`，已有 YAS 编号保留，不虚构问题编号。
- 每个完整阶段的最终确认提交使用唯一带注释 `arch-stage-XX`，注释写阶段、验证摘要及提交 SHA；不移动、复用或补造既有标签。本次分支切换不编号为新 ARCH 阶段，不创建额外架构阶段标签。
- 正常推送 master 后核对实际远端 SHA；阶段标签同时核对对象与 `^{}` 指向。失败时写待推送/待标签，不把本地对象当作远端备份。
- 每阶段记录修改前基线、真实文件/测试/人工确认、修改后 SHA/tag，按 `AGENTS.md` 12.1 同步两份累计报告；无数据变化明确无新增核验。不为自引用 amend 或改写历史。
- 公共历史优先按授权使用 `git revert <sha>` 回退。先确认原提交及下游依赖，按从新到旧撤销必要范围并重新验证，保留故障、原提交、反向提交、失败和复验记录。合并提交回退须先判断主线与后续依赖，不承诺无冲突；禁止 squash 已归档阶段、rebase 已推送历史、reset --hard、强推或移动标签。
- 未提交工作树、未跟踪文件和 stash 不是版本回退点，不以备份为由绕过人工确认擅自提交或丢弃文件；Git 不恢复浏览器数据、环境变量或外部状态。
- 纯文档人工验收核对路径、链接、状态和规则一致性，不伪造页面测试。发现冲突或不确定事实及时询问，不受影响的低风险工作继续推进。

### 5.2 2026-11-17 分支切换记录

**任务状态：`done`（2026-11-17 整体人工验收通过；普通合并已推送，原本地/远端开发分支已删除并核验）。** 本次为分支和工作方式切换，不是新 ARCH 阶段；关联原 YAS-2026-0055，不另造问题编号。负责人明确回复“人工验证通过”，按本次任务第七部分授权提交、正常推送、核验和安全删除具体原开发分支。下列预检至验收计划保留交付时的真实快照，后续事实在末尾追加，不把待执行操作提前写成成功。

- 预检：完整阅读四份必读文档、原阶段报告/审计及相关测试。起始分支为 `codex/frontend-contracts-yas-2026-0055`，HEAD/实际远端 `4062153c512107534b88f3bc6011ffa869334c8a`；master/实际远端为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`。两分支各自 ahead/behind 0/0，工作树、暂存区和未跟踪文件为空。执行 fetch origin master 与 fetch origin，读取远端公共规则并确认 AGENTS 副本无差异。普通沙箱 ls-remote 遇 Windows schannel 凭据通道失败，经允许的网络权限只读重试成功，未改凭据或 Git 配置。
- 归档核实：ARCH-00～04 的真实代码/测试、两份累计报告、原人工确认及 ARCH-03 S04/S05 明确豁免均存在；五个带注释标签对象/提交指向与上表、本地及实际远端相同。ARCH-04 实际归档 SHA/对象在此回填，原记录中的待提交描述保持当时快照。原执行记录不改写为在 master 完成。
- 状态差异与负责人确认：切换前 ARCH-00～04 done、05～11 pending、没有 current。已及时询问，负责人明确选择“按上述方式修正（推荐）”，据此把 ARCH-05 设为唯一 current，并记录“本次只确定下一阶段，尚未实施 ARCH-05”；ARCH-06～11 保持 pending。本次切换未验收归档前不实施 ARCH-05。
- 合并：`git switch master`；`git merge --ff-only origin/master` 返回 Already up to date；随后 `git merge --no-ff --no-commit codex/frontend-contracts-yas-2026-0055`。README、迁移计划、阶段报告及审计发生 22 处文档冲突，无源码/服务端/测试/资源冲突。逐段核实：公共规范无新旧差异，保留 master 共有规范；采用已验收实际结构、准确边界和阶段进度，保留全部追加的原报告/审计证据，再按本次授权更新当前规则；未整文件 ours/theirs 覆盖。
- 完整性修正：普通合并沿用 master 先前回退而遗漏原开发分支既有 `docs/presentation/README.md`、`docs/presentation/YasPretty-项目介绍-人均180-最终版.pptx`、`scripts/build-yaspretty-presentation.mjs`。从已核对的开发分支末端按原字节恢复这三个文件，保留原材料及证据。规则调整前，完整合并工作树与该末端无差异；后续仅手工修改 AGENTS、README、本文及两份累计报告五个文档。
- 新工作规则：后续 ARCH-05～11 在 master 实施完整阶段后统一人工验收，不再逐小步停等，不再执行双分支规范同步。保留唯一 current、明确人工确认、真实测试、累计报告/审计、阶段标签、规定提交格式与可追溯 revert；禁止强推和改写公共历史。
- 本次自动验证：09:48（北京时间）npm test 退出码 0，29 文件 225/225、2.15 秒；npm run build 退出码 0，2881 模块、2.00 秒，原 Three.js 弃用与 >500 kB 提示保留。三份原浏览器脚本 assistant 8/8、makeup-plan 14/14、storage 14/14，共 36/36，Chrome 157.0.8103.52、1440×900/360×800、减少动效、合成数据/独立上下文；已查看六张方案/来源/失败/存储截图，几何断言无溢出/重叠、无 pageerror，正常场景无 console.error，故意失败预期资源错误按原断言记录。实际构建同源5191冒烟：首页/JS200、health assistant=false、问答503/PROVIDER_NOT_CONFIGURED、方案200/local/7步/photoEnabled=false。npm 与浏览器脚本首次完整通过；临时工具的端口占用、编码/模块解析错误及修正详见同日累计报告，未改生产代码。
- 完整性与文档检查：临时 `node .qa/master-switch-20261117-01/verify.mjs` 通过，659 个受跟踪文件清单与源末端相同，src/server/tests/public 和其余非五文档内容无差异；ARCH-00～04 原执行正文不变，两份累计报告只追加。README 102 个实际路径、13 条本地链接/锚点和第三方披露路径有效，12 阶段正文/总表一致且仅 ARCH-05 current，后续模块未建立。dist 12 个文本产物的常见凭据特征扫描0命中，未读取真实凭据，不把模式扫描扩大为对任意未知格式秘密的绝对证明。`git diff --check`、`git diff --cached --check`、`git diff --check HEAD` 均退出码0；文档追加后再次核对。09:54（北京时间）实际远端分支/五标签未变。验证明细与完整62路径列表见同日累计报告。
- 覆盖限制：三份浏览器脚本的联网、无Key、上游/超时为合成响应，方案复用既有无模型规则，不能声称实际付费provider/真实联网成功。真实手机、默认动效、弱网、字体加载后严格排版、首页3D/GPU完整交互及原脚本未覆盖的产品库/收藏整页流程仍待人工复验；保留历史几何、数据/授权风险。本次无新增核验，继承上一条结论；不改产品、素材、存储或隐私边界，没有读取私有.env/真实Key/个人用户数据或付费调用。5191测试进程禁用dotenv文件加载且显式空Key；PPT/视频未重新改写或渲染。
- 当前版本状态：master HEAD 仍为合并前 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，MERGE_HEAD 为原分支末端 `4062153c512107534b88f3bc6011ffa869334c8a`；合并未提交，暂存区含待审合并内容。远端未改，两个开发分支引用和五标签均保留。完整差异以 `git diff HEAD` 查看；最终合并 SHA 尚未产生，不声称源末端已经是当前 master HEAD 的祖先。
- 人工验收重点：主站导航/首页、无照片方案及调整、产品详情、收藏刷新、下方小Y/来源/失败恢复和桌面/360px 排版；同时核对 master、MERGE_HEAD、完整 diff、空冲突索引、五文档规则/状态、五阶段原始提交及标签。
- 通过后的具体计划：负责人对本次整体明确回复“人工验证通过”后，更新任务 done/下一任务 current 及确认记录，按清晰范围创建普通合并提交和必要文档提交（规定格式），正常推送 master 并核对远端；再核对源末端为 master 祖先、源分支无独有提交和五标签远端指向，安全 `git branch -d` 删除本地源分支、删除同名远端分支并复核。最后追加真实完成记录（最终 master SHA、标签、删除结果、验证），必要的完成记录提交也按本次授权正常推送并核验。不批量推送无关标签，不改标签或公共历史；若异常先报告。ARCH-05 仅在切换归档后作为后续独立阶段实施。
- 回退与证据：未提交合并不是新恢复点，保留现场供验收；不自动 abort 或清理。原 master、开发分支 SHA 和 arch-stage-00～04 可定位；`.qa/master-switch-20261117-01/` 保存本次起始清单、冲突逐段决策和临时验证结果，忽略不提交。合并归档后的回退需按主线/下游依赖评估并经授权使用 revert，保留全部历史。

**2026-11-17 10:03（北京时间）整体人工验收与收尾授权**

- 负责人对本次整体切换明确回复“人工验证通过”；立即将切换任务改为 done，ARCH-00～04 保持 done、ARCH-05 保持唯一 current 且尚未实施、06～11 pending。人工确认不推定真实 provider、真机或其他未执行检查已经完成。
- 提交前已重新 fetch origin 并查询实际远端：master 仍为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，原分支仍为 `4062153c512107534b88f3bc6011ffa869334c8a`，五标签对象和提交指向不变；master 对 origin/master 为 0/0，MERGE_HEAD 正确，无冲突或来源不明文件。
- 临时完整性核对再次通过：659 文件、仅五文档差异、原 ARCH-00～04 执行正文不变、累计报告只追加、唯一 current、13 本地链接/锚点、102 README 路径及第三方披露路径、dist 常见凭据特征零命中和三种 Git 空白检查。运行代码和测试不变，沿用本次 09:48 已通过的测试、构建和 36 项浏览器回归，不将沿用记为重跑。
- 本次授权范围内继续创建普通双亲合并提交，正常推送后核对源末端祖先关系及无独有提交，安全删除本地及远端 `codex/frontend-contracts-yas-2026-0055`；实际 SHA、推送和删除结果在取得后追加。无新增 ARCH 编号或标签，ARCH-05 在后续阶段任务实施。

**2026-11-17 10:07（北京时间）分支切换完成与最终归档记录**

- 最终代码合并/master SHA 为 `8caf4dcdad416a2a8fbc6057a7f5a289403e9a1c`，普通双亲为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82` 和 `4062153c512107534b88f3bc6011ffa869334c8a`；提交信息为“【问题】YAS-2026-0055 已归档架构成果与 master 分离且验收规则不一致 【修改】保留历史合并 ARCH-00～04 并统一 master 整阶段验收流程”。正常 `git push origin master` 成功，实际远端 master 精确匹配该完整 SHA。
- 删除前 `git merge-base --is-ancestor` 成功，`git rev-list --count master..codex/frontend-contracts-yas-2026-0055` 为 0；源末端及原 ARCH-00～04 提交全部保留于 master。确认工作树/索引干净、无其他工作树使用该分支后，`git branch -d codex/frontend-contracts-yas-2026-0055` 安全删除成功，再 `git push origin --delete codex/frontend-contracts-yas-2026-0055` 删除远端成功。实际 ls-remote 查询已无该远端分支，本地及 origin 跟踪引用均不存在；其他分支不在本次操作范围。
- 删除后实际远端 master 仍为上述合并 SHA；arch-stage-00～04 的原标签对象与 `^{}` 提交和本地/本文表格全部一致。未补推、移动、删除或新增标签，没有 force push、squash、rebase 或历史重写。
- 验证沿用本次已运行的 npm test 29 文件225/225、构建2881模块、三份浏览器36/36和真实无Key构建同源HTTP冒烟；验收后仅有文档状态/追溯更新，运行代码及测试没有新增变化。提交前、文档记录后均检查完整性、原阶段历史、链接/路径、唯一 current、凭据特征与 Git 空白，不把沿用结果写成重跑。未覆盖的真实 provider/联网、真机、动效、弱网及严格排版和已有数据/授权风险保留，不因人工确认虚构证据。
- 本次切换 done；ARCH-00～04 done，ARCH-05 唯一 current 且尚未实施，ARCH-06～11 pending。后续阶段直接在 master 完整实施并统一人工验收，无新 ARCH 编号或本次切换标签。**本次无新增核验，继承上一条结论。**
- 本条与 README、两份累计报告的收尾追加纳入随后一个纯文档提交并正常推送；该提交只补记已取得的合并/删除事实。其最终 master/远端完整 SHA 由实际交付回执给出，下一次文档同步回填；也可用 `git log -1 --format=%H -- docs/frontend-architecture-migration-plan.md` 定位本条所在提交。不为在提交正文内引用自身 SHA 而 amend、补造或改写历史。

## 6. 分阶段实施内容

### ARCH-00：迁移基线

**状态：`done`（2026-11-17 人工验收通过；最终提交与阶段标签的远端核验见本次交付回执）**

**允许范围**：只读检查、测试记录、迁移清单和必要文档，不改变运行代码。

**任务**：

- 确认固定分支、工作树和未提交修改，保留用户已有工作。
- 运行现有 `npm test` 和 `npm run build`，记录真实输出摘要。
- 建立“现有文件 → 目标文件 → 引用位置 → 相关测试”的迁移清单。
- 核对 README 当前结构、目标结构与代码是否一致。

**验收**：基线结果可复跑，当前差异和迁移映射明确，没有运行代码变化。

**执行记录**：

- 2026-11-16（北京时间），`ARCH-00-S01`：本次仅复核并完善 `AGENTS.md`、README 和本文的分支、提交、回退与追溯规范；未迁移运行代码。只读核对时，本地 HEAD、远端跟踪引用和实际远端同名分支均为 `86b25b331106b49b02f10b499de7f7d94c24032b`；工作树仅有这三份文档，暂存区为空，本地无 `arch-stage-*` 标签。
- 自动验证：通过 Node.js 内联只读脚本核对分支、基线、改动范围、阶段定义与总表、规则关键词、链接、当前结构路径和空白，100/100 项通过，其中包括 6 条本地链接、53 个当前结构路径及未跟踪计划文件的空白检查；`git diff --check -- AGENTS.md README.md` 和 `git diff --cached --check` 均通过。这些属于文档检查，不是功能测试。
- 上述初次复核时的状态为待人工确认、未提交、未推送、未建标签；随后项目负责人明确确认“核对无误”，并授权本次三份公共规范提交到 master、选择性同步到开发分支。该授权不代表 ARCH-00 整阶段验收通过。
- 2026-11-16（北京时间），按项目负责人最新决定调整分工：`ARCH-00-S01` 在 master 提交公共规范基线，提交前基线为 `0b93a18167de0760f2ecfd99c9294b78653bb5ed`；`ARCH-00-S02` 在开发分支仅同步该规范提交，保留 `86b25b3` 的契约、演示材料和历史报告。新的文档检查及同步后测试结果在实际运行后追加；真实提交 SHA 和推送核验由交付记录先行给出，下次文档同步回填。
- 新分工提交前验证：Node.js 内联文档检查 103/103 项通过，包含 6 条本地链接、46 个 master 基线结构路径、两分支 contracts 差异与选择性同步约定；`git diff --check` 通过。项目负责人已明确授权实施本次公共规范提交及开发分支同步；提交 SHA、远端核验与同步后的测试须待实际产生后记录。
- 未到完整阶段收尾，尚未追加两份累计报告；本次无新增产品数据或核验，不创建 `arch-stage-00` 标签。
- 初次规范复核时，迁移基线测试、构建和完整迁移映射均待执行；后续测试与构建结果见 S02。完整迁移映射仍待执行，阶段保持 `current`；本次规范同步不能代替 ARCH-00 完整验收。

**ARCH-00-S02：开发分支选择性同步公共规范（2026-11-16，北京时间）**

- 问题与范围：master 公共规范基线已更新，开发分支仍需继承最新规则；只同步 `AGENTS.md`、README 和本文，不迁移运行代码。项目负责人已明确授权“就这样实施”，授权涵盖本次公共规范分工调整、master 提交和开发分支选择性同步，不授权提前实施下一阶段。
- 规范来源：master 提交 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`；master 修改前为 `0b93a18167de0760f2ecfd99c9294b78653bb5ed`，提交并推送后已用实际远端 SHA 核对。开发分支本小步修改前基线为 `86b25b331106b49b02f10b499de7f7d94c24032b`。
- 同步方式：`git cherry-pick --no-commit 19b87df58d0f8bf3874dc8e958175c7c22ac6f82` 仅应用该公共文档提交，再追加本执行记录；没有整支合并 master。相对开发基线，三份文档以外的受跟踪文件均无差异，六个契约文件、演示材料和已有报告保留原样。AGENTS 与 README 公共基线副本一致，本文仅追加开发分支状态与证据。
- 已运行验证：`npm run check` 通过，Vitest 12 个测试文件、73/73 项通过；Vite 构建通过，转换 2861 个模块。同步应用后的文档检查 103/103 项通过，`git diff --cached --check` 通过；执行记录追加后的最终差异检查在提交前再次运行。
- 剩余提示：Three.js 的 CommonJS 导入弃用提示仍在；构建仍有超过 500 kB 的分包提示，其中 3D 分包约 1292.96 kB。本次只同步文档，未改变 UI，未进行浏览器页面复验，也不表述为已完成架构优化。
- 提交与回退：本 S02 提交 SHA 及远端核验在提交后由交付记录给出，下次文档同步回填，不 amend 或强推。回退时定位开发分支实际 S02 提交，保留本执行证据并按 `git revert` 流程验证；公共规范源提交与开发分支同步提交分别记录，不能混用两者 SHA。
- 阶段与数据：ARCH-00 仍为 `current`，后续阶段均为 `pending`，不建立阶段标签；完整迁移映射及阶段收尾尚未完成，未追加累计阶段报告。本小步无新增产品核验，继承上一条数据审计结论。

**ARCH-00-S03：完整迁移基线与引用清单，待人工验收（2026-11-16，北京时间）**

以下保留初次交付时的验收与版本状态；2026-11-17 的上传授权追加在本记录末尾。

- 迁移原因：S01 只建立公共规范，S02 只选择性同步，尚缺真实源码到目标模块的完整映射与测试覆盖边界。S01 的人工确认和授权已记载在上文，对应 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`；S02 实际提交为 `ce266c654709506fe36340da21874676b382a239`。本次复核两提交均只修改 AGENTS、README、本文，且两远端分支实际 SHA 可定位；保留原历史，不复用已占用的 S02。
- 修改前基线：固定开发分支 `codex/frontend-contracts-yas-2026-0055`，HEAD 为 `ce266c654709506fe36340da21874676b382a239`。工作树、暂存区和未跟踪文件均为空，无用户既有修改影响基线测试。`86b25b3` 只是 contracts 前置实现，不当作实时 HEAD。
- 公共规范与远端：已执行 `git fetch origin master` 和开发分支 fetch；读取 `git show origin/master:AGENTS.md`、远端 README 公共约定及计划约束，并比较规则副本。采用 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 无差异、README 公共约定一致，计划差异仅为开发分支记录。23:44 北京时间 `git ls-remote` 确认远端开发分支为 ce266c6、master 为 19b87df；开发分支 ahead/behind 为 0/0，本地和远端均无 arch-stage-* 标签。
- 实际文件：更新 `README.md` 的当前实际结构、目标说明与依赖边界；新增 `docs/frontend-architecture-migration-inventory.md`；更新本文；在 `docs/stage-delivery-test-report.md` 和 `docs/product-data-accuracy-audit.md` 追加待验收阶段收尾准备记录。未修改 AGENTS 或 FINAL-PROMPT 的公共规则，未改变运行代码、测试、UI、API、产品事实、存储行为、依赖或静态素材。
- 自动基线：`npm test` 退出码 0，12 个测试文件、73/73 项通过，23:41:58 开始、1.61 秒；保留 THREE_CJS_DEPRECATED 提示。`npm run build` 退出码 0，2861 个模块、1.27 秒；主 JS 743.24 kB（gzip 225.10 kB）、3D 异步 JS 1292.96 kB（gzip 355.95 kB），保留超过 500 kB 的分包警告。编辑前 `git diff --check`、`git diff --cached --check` 均退出码 0；文档编辑后的最终检查另见本记录末尾。未重装依赖、未调用真实付费 provider；沙箱启动错误单独记录，不伪装成测试执行失败。
- 清单与覆盖：[迁移清单](frontend-architecture-migration-inventory.md)第 3 节按 ARCH-01 至 ARCH-11 列出现有定义、目标文件、直接与间接引用、测试及缺口，覆盖存储、方案、小Y、公共 API、全部 2D/3D 内部模块与自带 CSS、产品库、收藏、首页视觉、指南/文化、App/开幕/main/导航，以及保留的数据、契约、全局 CSS、部署/服务端边界。测试表逐文件合计 12/73；无提前移动目标模块。
- 发现差异：README 当前树此前使用 master 旧基线、依赖图未明确是目标；已按开发分支事实更新。StrokeText 非首页独占，EnhancementBoundary 由 App 供 HomeView 使用，后续需避免循环。收藏无跨标签 storage 监听，前端 fetch 无主动超时，部分状态/存储/视觉测试缺失；清单如实记录，不因迁移补功能。既有专用天气 provider、品牌官网商品来源及允许 e.tb.cn 短分享链接的判定与最新目标/规则有差异，本步不改服务端、数据或断言，需另行授权整改。
- 页面、隐私与数据：只做文档核对，未进行桌面/360px 浏览器或控制台验收，未把纯函数测试称为页面回归。用户体验入口及成功/失败/降级保持原实现；没有读取照片、浏览器画像/对话、真实 Key 或旧 memory。无新增核验，继承上一结论，图片授权 pending、来源/商品事实待核验和公开门禁均未升级；未修改视频或比赛材料。
- 未完成项与剩余风险：人工核对本步路径、链接、状态、映射与两份累计报告尚待进行；大分包、弃用提示、测试缺口与现有规则差异保留。ARCH-01 及之后未开始；ARCH-00 仍为 current，不等同于正式产品阶段 0。两份累计报告为收尾准备，尚不具备完成归档条件。
- 版本与回退：**未提交、未推送、未创建阶段标签**；修改后提交 SHA 不存在，人工确认人/日期/结果待填写。上一可定位基线为 ce266c6；工作树改动不是版本恢复点。本步若未来确认并提交，仅文档范围按实际提交 revert 并复验；不自动暂存、清理、切换分支、变基、合并 master 或改写历史。
- 最终文档检查：Node.js 内联只读脚本复核五份文档的本地链接、UTF-8/空白、54 个 README 当前结构路径、46 个 src 文件名在清单中的覆盖、12 个测试文件及 73 项合计、12 个阶段状态，以及五文档范围/固定 HEAD/空暂存区/目标目录未创建，全部通过。首次脚本因阶段数组索引写错误报两项；修正检查脚本后复跑无失败，未修改项目状态或运行代码。文档编辑后的 `git diff --check`、`git diff --cached --check` 均退出码 0；新清单尚未跟踪，其空白和链接由上述只读检查单独覆盖。此检查不计为新增功能测试，不替代人工验收。

**2026-11-17 上传授权与提交前复核（北京时间）**

- 负责人在文档交付后回复“上传到git上”，随后要求“继续”，授权当前 ARCH-00-S03 五份文档提交并推送到固定开发分支；本次只追加授权与版本追溯说明，不扩大修改范围。不据此虚构页面人工测试记录或宣布整个 ARCH-00 验收归档。
- 提交前再次 fetch master 和同名开发分支；公共规范仍为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 副本无差异。开发分支 HEAD 与远端仍为 `ce266c654709506fe36340da21874676b382a239`，ahead/behind 为 0/0，暂存区为空，工作树仅本步五份文档。
- 实际提交 SHA 和推送后的远端核验由本次交付回执给出，下次文档同步回填；不为回填改写历史。ARCH-00 保持 current，后续阶段 pending；未创建阶段标签，不合并 master，不进入 ARCH-01。自动测试和构建沿用上述未改变运行代码的真实结果。

**ARCH-00-S04：人工验收与阶段收尾（2026-11-17，北京时间）**

- 收尾原因与人工确认：负责人在获知整阶段尚待人工验收、收尾提交和阶段标签后，明确回复“完成验收”。本条记录项目负责人对 ARCH-00 的人工验收通过，以及按 AGENTS 13.2 完成当前阶段收尾提交、推送和标签的授权；确认范围为已交付的五份文档与迁移基线，不授权进入 ARCH-01，也不虚构负责人执行过浏览器或商品核验步骤。
- 上一步提交回填：S03 实际提交 `f16542c6a84ed9141ab955661008fcb1bbc06b6f`，已推送至固定开发分支并以 `git ls-remote --heads` 核对一致。本次开始再次 fetch 和查询确认远端仍为该 SHA，ahead/behind 为 0/0；工作树、暂存区及未跟踪文件均为空，无用户修改影响收尾。S01 至 S03 的初次交付状态和历史证据完整保留，不复用编号。
- 本步基线与规范：修改前 HEAD 为 `f16542c6a84ed9141ab955661008fcb1bbc06b6f`；分支 `codex/frontend-contracts-yas-2026-0055`；公共规范仍采用已 fetch 的 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，已读取远端规则及公共约定，AGENTS 副本无差异。此时 ARCH-00 为 current；按本次整阶段确认将其更新为 done，ARCH-01 至 ARCH-11 继续 pending，当前无执行中的阶段。
- 实际文件：仅更新 `README.md`、本文、`docs/frontend-architecture-migration-inventory.md`、`docs/stage-delivery-test-report.md` 和 `docs/product-data-accuracy-audit.md`，补记验收、S03 SHA 和最终版本追溯安排。运行代码、测试行为、UI、API、产品数据、存储、依赖与素材均无变化；未创建任何目标模块，不修改 AGENTS 或 FINAL-PROMPT。
- 验证依据：本步运行代码与 S03 基线一致，沿用 2026-11-16 实际运行的 `npm test`（12 文件、73/73 项通过，退出码 0）及 `npm run build`（2861 模块，退出码 0），Three.js 弃用和超过 500 kB 的分包警告保留。不把沿用结果写成本次重新执行，不增加无意义测试；提交前复核文档链接、路径、UTF-8/空白、五文件范围、阶段状态与无运行代码差异，并执行 `git diff --check` 和暂存差异检查，真实结果追加在本小步记录中。
- 累计报告与数据：两份累计报告追加本步最终验收和收尾记录。**本阶段无新增核验，继承上一条结论。** 没有新增页面/360px/控制台复验、照片处理、真实 API 调用、商品核验或材料修改；本阶段只做基线和文档核对，不改变用户入口或原有成功、失败、降级行为，不把本次架构阶段等同于正式产品阶段 0。
- 未完成项与风险：ARCH-00 范围内基线、映射、README 和人工验收均已完成；源码/测试缺口、交叉引用、前端超时、weather-provider、商品直接链接差异、图片授权 pending 等已记录风险继续保留，整改不属于本步。后续阶段与真实页面回归均未提前执行；Git 归档须待最终提交和标签推送后核对，不以本地状态替代远端证据。
- 版本与回退：本记录写入时 S04 尚未提交、尚未推送、尚未创建阶段标签；本步最终 SHA 由提交后的交付回执先行给出、下次文档同步回填，不 amend 或为自引用改写历史。在 S04 最终确认提交上创建唯一带注释的 `arch-stage-00`，注释包含阶段、小步、验证摘要及实际提交 SHA；推送后同时核对远端分支 SHA、标签对象和 `^{}` 提交。回退按依赖使用实际提交的 `git revert` 并复验，保留 S01 至 S04 证据、不移动或复用标签；Git 不恢复浏览器数据、环境变量或外部服务状态。
- 收尾文档验证：只读 Node.js 内联检查退出码 0；五文档范围、测试基线后的运行代码无差异、固定分支/HEAD/远端 0/0/空暂存区及公共规则一致性均通过。UTF-8/空白、12 条本地链接、54 个 README 实际路径、46 个 src 文件名覆盖、12 测试文件/73 用例合计、12 个阶段正文与总表状态、人工确认与累计审计/SHA/标签引用均通过，目标目录未创建。`git diff --check` 与空暂存区的 `git diff --cached --check` 均退出码 0；追加本结果后、暂存后再次检查空白与实际文件范围，不新增功能测试。

### ARCH-01：`lib/storage`

**状态：`done`**

2026-11-17（北京时间）负责人已确认本阶段人工验收通过并授权更新状态、提交与推送。以下初次交付和补测中的待验收/current/未提交描述为当时快照；最新验收、剩余风险和版本门禁见本阶段末尾收尾记录。ARCH-02 及后续仍 pending，本轮不启动下一阶段。

**允许范围**：`src/lib/xiaoy-storage.js`、新 `src/lib/storage/`、直接引用方、相关测试和文档。

**任务**：

- 拆分 `storageClient.js`、`storageKeys.js`、`migrations.js` 和 `clearUserData.js`。
- 让小Y存储调用新模块，保持现有公开业务行为。
- 保留当前 Key、旧 Key、版本、消息上限、迁移及旧凭据清理逻辑。
- 本阶段不迁移 App 中的收藏存储。

**验收**：画像与消息刷新恢复、旧数据迁移、消息限制和旧凭据清理行为不变；测试和构建通过。

**ARCH-01-S01：存储职责拆分与行为回归，待人工验收（2026-11-17，北京时间）**

- 启动授权与门禁：初次任务因 ARCH-00 未归档而停止，未修改文件。后续只读核对确认 ARCH-00-S04 已完成并归档；负责人明确选择“授权启动 ARCH-01（推荐）”，随后要求“继续”，据此先将本阶段登记为唯一 current，再开展本步；不将此授权当作本步人工验收或提交授权。
- 修改前已验收基线：固定分支 `codex/frontend-contracts-yas-2026-0055`，HEAD 与实际远端同名分支均为 `8c95966cf61367396fd6783da1f86c8569546668`，ahead/behind 0/0，工作树、暂存区及未跟踪文件均为空；`arch-stage-00` 已核对远端对象及提交指向。采用已 fetch 的公共规范 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 副本无差异，README 公共约定和远端计划约束已核对。无新增 YAS 编号，前置关联 `YAS-2026-0055`。
- 迁移原因：`xiaoy-storage.js` 混合 JSON/版本包装、Key、旧值迁移和凭据清理；当前没有直接存储测试。按实际职责拆分，不改变公开业务行为。
- 拟改文件：原 `src/lib/xiaoy-storage.js` 的实现迁入 `src/lib/storage/{storageClient,storageKeys,migrations,clearUserData}.js` 后移除旧文件；直接调用方 `src/components/XiaoYAssistant.jsx` 仅调整存储引用/调用；新模块就近测试及小Y存储集成测试；README、本文及两份累计交付/审计记录。`src/contracts/assistant.js` 的旧路径注释只作为历史依据，本步不改契约字段或运行时行为。
- 行为边界：当前/旧 Key、版本 1、画像与消息值、调用方 `slice(-20)`、当前值优先、旧值写入后再删旧 Key、损坏 JSON 回退均保留。localStorage 不可用/读写删除抛错当前会继续抛出，不趁拆分改为静默降级。`clearUserData.js` 只迁入现有两个旧配置键清理，不新增全部数据删除；“重新开始”继续经原状态与 effect 保存空画像和欢迎消息。
- 验证计划：新存储模块测试及小Y存储集成测试、`npm test`、`npm run build`、`git diff --check`；刷新恢复、迁移、消息上限、旧凭据与异常路径回归；桌面/360px 页面检查如未执行则明确待人工验证。编辑前已运行 `npm test`：12 文件、73/73 项通过，保留 Three.js CommonJS 弃用提示。
- 回退范围：本步新四模块、旧实现及直接引用、相关测试和配套文档；本步尚未提交，基线 tag 可定位但工作树不是新恢复点。人工确认后如形成提交，按实际 SHA 和后续依赖使用 `git revert` 并复验，保留历史证据；不修改浏览器实际用户数据、不执行自动回退或清理。
- 当前版本状态：未提交、未推送、未创建 `arch-stage-01`；人工验收未进行，ARCH-01 保持 current，ARCH-02 及之后保持 pending。实际修改、测试、页面与最终交付事实在完成后追加。

**S01 自动验证后交付记录（2026-11-17，北京时间）**

| 原职责/位置 | 本步实际位置与改动 |
| --- | --- |
| `src/lib/xiaoy-storage.js` 常量 | `src/lib/storage/storageKeys.js`：六个原常量原值导出，版本仍为 1 |
| 原 parse / writeVersioned | `src/lib/storage/storageClient.js`：读取 Key 后只对 JSON 解析做回退，写入版本包装；访问及序列化错误仍抛出 |
| 原 readVersioned | `src/lib/storage/migrations.js`：原当前值优先条件、fallback、迁移写入→删除顺序保留 |
| 原 clearLegacyCredentials | `src/lib/storage/clearUserData.js`：仅删 `yaspretty-xiaoy-config` / `yaspretty-assistant-config`，不读取旧值、不清除收藏 |
| 原 xiaoyStorage 对象的四个业务转发 | 删除旧文件，小Y直接组合新模块与 Key；不新增入口文件或重复实现 |
| 小Y初始化及 effects | `src/components/XiaoYAssistant.jsx`：只替换 import/调用，画像 fallback `{}`、欢迎消息 fallback、消息 effect 的 `slice(-20)`、重置与界面保持原样 |
| 无直接存储测试 | 新增 storage 三份就近测试及 `src/components/XiaoYAssistant.storage.test.jsx`；共 4 文件、40 项，使用合成数据 |

- 实际测试：00:46:26 运行 `npm test -- src/lib/storage src/components/XiaoYAssistant.storage.test.jsx`，退出码 0，4 文件 40/40 项通过（337ms）；00:46:56 运行 `npm test`，退出码 0，16 文件 113/113 项通过（2.07s），保留 THREE_CJS_DEPRECATED 提示；`npm run build` 退出码 0，2864 模块，1.82s，主 JS 743.02 kB（gzip 225.01 kB），3D 异步 JS 1292.96 kB（gzip 355.95 kB），保留超过 500 kB 警告。没有重装依赖或调用付费 provider。
- 业务回归：自动测试覆盖画像/消息重新初始化恢复、字段与来源原样保存、当前/旧 Key 与版本 1、旧值迁移/当前有效值优先、最后 20 条按原顺序保存、两枚旧配置键清理、损坏 JSON/falsy/null/错误版本、读写/序列化/迁移删除失败等原语义。小Y集成测试隔离 React 的初始化/effect 边界而非真实浏览器挂载，不据此声称真实刷新、按钮交互或布局通过。
- 页面与控制台：已启动本地 `npm run dev:web`（127.0.0.1:5174）供人工验证；尝试打开 in-app browser 时返回“Tab 1 is not part of browser session”，浏览器清单查询及一次重试均在自动审批检查处超时，未取得有效页面状态。因此常见桌面、360px 级手机、实际刷新/交互与浏览器未处理错误检查**均待人工验证**；此工具超时不属于通过或拒绝结果，也不是页面错误。未转用未授权的浏览器控制方式或读取真实浏览器存储。
- 配套文档：README 当前树、目标/已落地区分、存储依赖、16/113 测试边界均更新；本报告及 `docs/stage-delivery-test-report.md`、`docs/product-data-accuracy-audit.md` 追加 S01 待验收证据。历史 ARCH-00 清单保持归档时内容，当前映射以本记录为准。AGENTS、FINAL-PROMPT、契约字段、服务端、public、data、收藏、UI/样式、API、规则和依赖均未改变。
- 数据与隐私：只用测试画像/消息/假配置值；未读取或修改实际用户照片、对话、画像、凭据、旧 memory，不新增上传/保存范围。**本阶段无新增核验，继承上一条结论。** 产品事实、图片授权 pending、直接商品链接政策差异及公开门禁不升级；视频和比赛材料未修改。
- 尚未完成：人工核对代码/README/迁移映射/两份报告，以及阶段报告所列存储、桌面/360px/控制台场景；localStorage 访问失败会抛出、当前版本数据不额外校验形状等既有语义保留，不能把本次拆分称为已实现异常降级。大分包和 Three.js 弃用提示保留；`src/contracts/assistant.js` 的原文件名注释未在本次许可范围外改写，字段及存储值保持原样。
- 版本状态：HEAD 和上一已验收基线仍为 `8c95966cf61367396fd6783da1f86c8569546668`。本步**未提交、未暂存、未推送、未建阶段标签**；人工确认人/日期/结果待实际确认，修改后 SHA 不存在。待确认范围为本步四模块、旧文件移除、小Y引用、四份测试和四份文档；收到人工通过确认前不进入新小步或 ARCH-02，不标 done。最终文档/空白与范围检查在交付前另行记录。
- 最终只读检查：四份文档同步后，`git diff --check`、`git diff --cached --check` 均退出码 0；Node.js 内联检查退出码 0，14 个实际变更文件（含 8 个未跟踪新文件）的范围、UTF-8/末尾换行/行尾空白、本地链接及新锚点、固定 HEAD/分支/空暂存区均通过；12 阶段正文确认 ARCH-00 done、ARCH-01 唯一 current、其余 pending，后续目标目录未创建，旧运行入口已移除，小Y原 `slice(-20)` 保留。代码验证后只编辑文档，未重复或扩充已通过的 npm 测试/构建；追加本结果后再检查空白，不将文档检查计为业务测试。

**S01 浏览器补测记录（2026-11-17 01:16–01:17，北京时间）**

- 负责人要求“你来帮我测试一下”，本次在同一 S01 补充 `tests/browser/arch01-storage.mjs` 及四份文档证据；不新开小步、不改生产代码，不将测试请求视为人工验收。此前页面工具失败和待验收描述保留为当时状态，本记录更新当前页面测试结论。
- 运行已有 Playwright + Chrome 157.0.8103.52，无安装或依赖变更。实际执行 `node tests/browser/arch01-storage.mjs`，复跑环境和命令详见阶段报告；测试本地 `http://127.0.0.1:5174/`，每场景使用独立临时上下文与合成数据；1440×900 / 360×800，deviceScaleFactor 1、reducedMotion reduce。
- 首轮 12/14：两视口的迁移场景在来源链接检查处超时，定位器把可访问名称空格写死；截图中来源已渲染。两例还记录 `net::ERR_NETWORK_ACCESS_DENIED`，未捕获资源 URL，不推断原因；无 pageerror 或 API 请求。保留 `.qa/arch-01-storage/results.json` 和失败截图。仅改测试定位器为名称正则后复跑，生产代码未改。
- 复跑退出码 0，14/14：空存储默认值；真实连续 11 次本地对话（23 条当前消息、只存末尾 20 条、刷新原序恢复）；画像刷新；重新开始后刷新；25 条旧消息迁移及末尾 20 条恢复；完整画像/产品 ID/合成来源字段恢复；两枚旧配置键删除；非小Y记录与收藏哨兵保留；当前有效值优先、损坏当前值迁移有效旧值、损坏 JSON 与无效版本回退。未发送 API 请求，复跑全部 pageerror / console.error 为空，首轮资源错误未复现。
- 复跑证据 `.qa/arch-01-storage-rerun/results.json`（完成于 01:17:19）与两视口的默认值/对话/迁移截图；已查看桌面和手机对话及迁移整页截图，几何断言同时确认文档和消息无横向溢出、画像/消息/输入与发送控件无重叠，未见新增布局问题。`.qa/` 仅本地忽略证据，不加入提交。
- 限制与剩余项：上述为无头 Chrome 自动浏览器与截图检查，负责人验收未进行；不声称真实手机、默认动画、外部 provider 或禁用存储权限时的页面通过。权限/读写删除抛错及宽松形状仍按 40 项相关测试保留原语义，非新增降级；首轮资源错误原因未定位。原 113 项测试与构建后未改生产代码；新脚本语法、最终空白/范围检查在交付前追加。
- 当前实际范围在原 14 个文件上增加浏览器脚本，共 15 个变更文件（含 9 个未跟踪文件）；回退范围增加该脚本。HEAD/修改前基线仍为 `8c95966cf61367396fd6783da1f86c8569546668`，未暂存、未提交、未推送、未打 `arch-stage-01`。ARCH-01 唯一 current，ARCH-02 及后续 pending；**本阶段无新增核验，继承上一条结论。**
- 补测交付最终检查：`node --check tests/browser/arch01-storage.mjs`、`git diff --check`、`git diff --cached --check` 及 Node 只读范围检查均退出码 0；15 文件范围、9 个未跟踪文件空白/UTF-8、文档本地链接、固定分支/HEAD/空暂存区、12 阶段状态、复跑 14/14 与三类错误/请求数组为空均核对通过。浏览器补测后仅改文档与测试脚本，未重复已通过的 npm 测试/构建；追加本结果后再检查空白。

**S01 人工验收与完整阶段收尾（2026-11-17，北京时间）**

- 确认人：项目负责人；原话“人工核验完成 更改状态，上传到git上去”。本确认覆盖已交付的 S01 四个 storage 模块、旧入口移除、小Y直接调用、四份 Vitest 测试、独立浏览器脚本及四份文档，共 15 文件；结果为人工验收通过，不虚构负责人逐项使用的设备、步骤或额外测试。确认后只同步 README、本文和两份累计报告的状态/验收证据，生产代码与测试保持已验收版本；未新增小步或复用其他编号。
- 提交前再次执行 `git fetch origin master codex/frontend-contracts-yas-2026-0055`，读取远端 AGENTS/README 公共约定和计划约束；公共规范仍为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 副本无差异。本地 HEAD/实际远端同名分支均为修改前基线 `8c95966cf61367396fd6783da1f86c8569546668`，ahead/behind 0/0，起始暂存区为空，工作树为本步 15 文件；本地及远端 `arch-stage-01` 未存在，不覆盖标签。
- 最终状态：ARCH-01 done，ARCH-00 保持 done；ARCH-02 至 ARCH-11 全部 pending。当前无实施中的 current；必须获得下一阶段授权并先更新计划后才能实施，不因本次上传提前迁移工作台、收藏或其他模块。
- 验证证据沿用本步实际结果：相关 `npm test -- src/lib/storage src/components/XiaoYAssistant.storage.test.jsx` 40/40、`npm test` 113/113、`npm run build` 2864 模块通过；Playwright 桌面/360px 14/14，复跑 pageerror/console.error/API 请求为空。确认后未改生产代码或测试，不重复已通过验证或声称新运行；提交前复核脚本语法、diff/暂存空白、15 文件范围、链接、状态和非文档文件哈希，结果在实际提交回执给出。
- 文档与数据门禁：README 已反映验收后的实际结构，`docs/stage-delivery-test-report.md` 与 `docs/product-data-accuracy-audit.md` 均追加验收与阶段收尾。**本阶段无新增核验，继承上一条结论。** 不变更 AGENTS、FINAL-PROMPT、视频或比赛材料；来源/授权及公开风险结论不升级。
- 保留范围与风险：localStorage 访问/写入/删除异常继续抛出，当前值无新增形状校验；Three.js 弃用及大分包警告、首轮未定位资源网络错误均保留。真实手机、默认动画、禁用存储权限页面及 provider 不在此次自动页面覆盖范围，人工确认不扩充该测试结论。收藏、UI、样式、API、推荐规则、依赖、服务端、public 与产品数据均未改。
- 版本与归档：本段写入时未暂存/未提交/未推送，本步修改后 SHA 尚未产生；已获本次明确授权，将仅暂存并提交上述 15 文件、推送固定开发分支，随后在同一最终提交创建带注释的唯一 `arch-stage-01` 并推送。只有实际远端分支及标签对象/提交指向核验一致后，才在交付回执报告归档；真实 SHA/tag 下次文档同步回填，不为自引用 amend 或额外提交，不更改 master。回退范围为同一 S01 全部文件，按实际 SHA 及后续依赖使用 git revert 并复验；Git 不恢复浏览器数据、环境变量或外部服务状态。

### ARCH-02：`makeup-plan`

**状态：`done`**

2026-11-17 负责人确认本阶段人工核验完成。以下 S01/S02 的 current、待验收和未提交描述保留为写入时快照；最新状态与归档门禁见本阶段末尾收尾记录。

**允许范围**：`MakeupWorkbench.jsx`、新 `features/makeup-plan/`、直接引用方、相关测试和文档。

**任务顺序**：

1. 将 `legacyToForm`、`toPlanPayload` 等纯转换迁入 `makeupPlanUtils.js`。
2. 将 `/api/makeup-plans` 请求迁入 `makeupPlanApi.js`。
3. 将表单、方案、加载、错误和生成流程迁入 `useMakeupPlan.js`。
4. 按实际复杂度拆出需求表单、方案结果和方案产品。

**边界**：不新增工作台本地生成器，不创建没有实际用途的 `localPlanGenerator.js`，不改变服务端方案逻辑。

**验收**：无照片生成、条件修改、画像衔接、加载、失败和空结果行为不变；测试和构建通过。

**ARCH-02-S01：纯数据转换与直接引用迁移（2026-11-17，北京时间）**

以下保留初次交付时的待验收、未提交快照；最新 S01 人工确认与提交授权见本阶段末尾记录，ARCH-02 整阶段仍为 current。

- 启动授权：前次只读预检发现本阶段仍 pending，已按门禁停止且未改文件。负责人随后明确回复“01已经结束了 已上传完毕，开启02”，据此登记 ARCH-02 为唯一 current；ARCH-00/01 保持 done，ARCH-03 及以后保持 pending。此授权不等于本步人工验收、提交、推送或阶段标签授权。
- 修改前已验收基线：固定分支 `codex/frontend-contracts-yas-2026-0055`，HEAD 与 fetch 后的远端同名分支均为 `5e58236f6897147b354153ea9b02d080641a3cea`，ahead/behind 0/0，起始工作树、未跟踪文件和暂存区均为空。ARCH-01 人工验收记录、实际远端提交及带注释标签已核对；标签对象与提交指向见上表，不把旧文档“收尾写入时待提交”快照改写成未归档。
- 公共规范：已运行 `git fetch origin master codex/frontend-contracts-yas-2026-0055`，读取远端 AGENTS、README 公共约定与计划约束；采用 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，`git diff origin/master -- AGENTS.md` 为空。无新 YAS 编号，保留前置关联 `YAS-2026-0055`。原契约已完整阅读，字段不变。
- 迁移原因：工作台内默认表单与纯转换既供表单使用，又被小Y方案入口和测试从 UI 文件导入，职责与依赖混合。只迁移 `DEFAULT_FORM`、`legacyToForm`、`toPlanPayload`，不移动小Y的意图、对话参数提取或结果格式化。
- 拟改文件与映射：`src/components/MakeupWorkbench.jsx` 的上述三项迁入 `src/features/makeup-plan/makeupPlanUtils.js`；工作台与 `src/components/XiaoYAssistant.jsx` 改为直接导入 Utils，不保留组件转发导出。`src/components/XiaoYAssistant.test.js` 中纯转换测试迁往就近 `makeupPlanUtils.test.js` 并补兼容性边界；增加 `tests/browser/arch02-makeup-plan.mjs` 验证真实页面；README 当前结构/依赖与本文同步。本步未到完整阶段收尾，两份累计报告届时按 12.1 同步。
- 行为边界：保持默认值、旧画像合法选项筛选、预算 truthy/字符串及数字转换、固定 `photoEnabled: false`、请求字段和 priorities 原样传递；不增加 React/fetch/localStorage 副作用。API 调用、状态、DOM、样式、文案、服务端降级、数据与依赖均保留。现有画像变更 effect 会重新应用全部默认值，失败会保留旧方案；空响应按原错误语义处理，本步不修正或美化这些既有行为。
- 验证计划：迁移前后分别用相同浏览器脚本检查桌面 1440×900 与手机 360×800 的无照片方案、预算/场景/妆效调整与其他条件、旧画像衔接、加载/重复操作、服务端本地降级、失败/空响应/重试、站内产品详情及小Y方案入口。方案正常响应使用现有服务端规则生成，不创建前端生成器；错误由测试拦截模拟，禁用真实外部调用。运行相关 Vitest、`npm test`、`npm run build`、`git diff --check`；实际结果后续追加，未执行前不称通过。
- 回退范围：上述纯转换新模块/测试、组件和小Y直接引用、迁移的原测试、浏览器脚本、README 与本文；基线为 `5e58236` / `arch-stage-01`，未提交工作树不是新恢复点。人工验收形成提交后才按实际 SHA 与后续依赖使用 `git revert` 并复验；不自动回退、不清理浏览器数据、不移动旧标签。
- 版本门禁：本步未暂存、未提交、未推送，修改后 SHA 不存在，未创建 `arch-stage-02`；人工验收待确认。按 AGENTS 13.2 每小步验收并建立提交后再继续下一小步；后续 API、Hook、组件拆分尚未开始。**本阶段无新增核验，继承上一条结论。**

**S01 自动验证后交付记录（2026-11-17，北京时间）**

| 原位置/职责 | 本步实际映射 |
| --- | --- |
| `MakeupWorkbench.jsx` 的默认表单与两项转换 | `features/makeup-plan/makeupPlanUtils.js`，原实现迁入，补集中契约 JSDoc，无新增运行时校验 |
| 工作台和小Y从 UI 导入转换 | 两组件直接导入 Utils；工作台继续作为现有 UI 入口，无重复实现或转发导出 |
| `XiaoYAssistant.test.js` 的 1 项表单映射测试 | `makeupPlanUtils.test.js` 保留该测试并新增 7 项兼容性用例；小Y自身方案提取/格式化测试保留 |
| 无方案页面回归脚本 | `tests/browser/arch02-makeup-plan.mjs`，使用已有 Playwright、合成画像及现有服务端无模型规则，未新增前端生成器 |

- 实际修改共 8 文件：上述 Utils 与其测试、`src/components/MakeupWorkbench.jsx`、`src/components/XiaoYAssistant.jsx`、`src/components/XiaoYAssistant.test.js`、浏览器脚本、README 和本文。未修改 contracts（其中旧组件职责注释作为前置快照保留）、storage、App、服务端、data、public、样式、文案、API 字段/地址、算法、依赖或视频材料。尚未到完整阶段收尾，两份累计报告未在本小步改动；完成全阶段并验收时按 12.1 追加。
- 迁移前纯函数基线：01:57:52 执行 `npm test -- src/features/makeup-plan/makeupPlanUtils.test.js`，当时测试导入原组件的转换，1 文件 8/8 通过（267ms）。迁移后改为新模块导入，01:59:00 执行 `npm test -- src/features/makeup-plan src/components/XiaoYAssistant.test.js src/components/XiaoYAssistant.storage.test.jsx`，退出码 0，3 文件 21/21（469ms）；01:59:27 执行 `npm test`，退出码 0，17 文件 120/120（1.76s），保留 Three.js CommonJS 弃用提示。
- 生产构建：`npm run build` 退出码 0，2865 模块，1.99s；主 JS 743.02 kB（gzip 224.99 kB），3D 异步块 1292.96 kB（gzip 355.95 kB），仍有超过 500 kB 警告。本次没有安装依赖或调用真实付费 provider。首次差异检查发现移除导出后的文件末尾多余空行，已修正；最终文档/空白检查结果另行追加，不把检查脚本错误写成业务通过。
- 页面环境：原 `npm run dev:web` 因 5174 已被占用而退出，未停止该服务；独立启动 `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175 --strictPort`。Node 24.18.0，已有 Playwright + Chrome 157.0.8103.52，1440×900 和 360×800，deviceScaleFactor 1、reducedMotion reduce；每场景使用独立临时上下文，不读取实际浏览器用户数据。API 被脚本拦截，正常方案调用现有 `createMakeupPlanService` 且 provider configured=false，不启动真实网关或发出第三方请求。
- 页面基线首轮：10 项中 2 项通过，8 项因 select 的 label 包含选项文本、测试使用 exact 标签定位而超时，pageerror/console.error/失败资源请求均为空；证据保留 `.qa/arch-02-s01-baseline/results.json` 与失败截图。只修改测试定位为现有标签的包含匹配，生产代码当时未改；复跑 10/10、退出码 0，证据 `.qa/arch-02-s01-baseline-rerun/results.json`。迁移后同脚本 10/10、退出码 0，证据 `.qa/arch-02-s01-after/results.json`。
- 页面实际覆盖：不上传照片生成 7 步；预算 500→200、场景通勤→拍照、妆效柔雾→哑光后其他条件保留；当前与旧画像映射，画像字段变化后恢复原默认值的既有 effect；加载/禁用按钮/Enter 无重复请求；本地规则降级标识；空响应与无效 JSON 进入原错误状态；合成业务失败仍保留旧方案且不显示新的成功状态，重试成功；站内产品详情打开、关闭按钮和 Escape；小Y对话生成方案、产品详情与既有文本降级。迁移前后全部场景的 pageerror、console.error、失败资源请求为空，自动几何断言无横向溢出或表单字段重叠。
- 前后对比与截图：请求字段和表单值逐项相同。首次额外比较绝对 viewport y 坐标时，小Y自动滚动造成 103px 偏移而断言失败；控件尺寸与横向位置相同。只读对比消除整体滚动偏移后，10/10 场景尺寸及相对位置相同，保存 `.qa/arch-02-s01-after/comparison.json`；没有修改生产滚动行为。已实际查看桌面表单/结果、手机表单/结果/错误截图，未见新增布局问题。截图和 JSON 都在忽略的 `.qa/`，不加入提交。
- 复跑命令（PowerShell；使用已存在的运行时，不新增依赖）：

```powershell
$env:YAS_QA_PLAYWRIGHT_MODULE = 'file:///C:/Users/%E5%B4%94%E9%A6%A8%E7%91%9C/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
$env:YAS_QA_BROWSER_EXECUTABLE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:YAS_QA_BASE_URL = 'http://127.0.0.1:5175'
$env:YAS_QA_OUTPUT_DIR = '.qa/arch-02-s01-after'
node tests/browser/arch02-makeup-plan.mjs
```

- 未完成与剩余风险：负责人 S01 人工验收待确认；API、Hook 和组件拆分尚未开始，ARCH-03 及以后仍 pending。页面使用业务错误/空响应模拟，未覆盖真实 HTTP 非 2xx、断网、超时、真实模型与网关集成、默认动画或真实手机；不能把浏览器规则响应当作 provider 成功。既有无主动请求超时、画像变化重置非画像条件、失败保留旧方案、默认 priorities 数组引用及宽松转换保持原样。Three.js 弃用、大分包、图片授权与商品来源政策差异等历史风险不升级或隐藏。
- 用户体验入口：主站“小Y智能选妆”上方工作台，或在下方对话框请求完整妆容。人工重点检查无照片生成、连续改预算/场景/妆效时其他条件、已有画像衔接、产品详情按钮/Escape；失败与空响应可复跑上述隔离浏览器脚本。**本阶段无新增核验，继承上一条结论。** 未新增照片处理、持久化范围、产品事实或授权证明。
- 版本与验收状态：本步待人工验收，未暂存、未提交、未推送、未创建 `arch-stage-02`，HEAD 仍为 `5e58236f6897147b354153ea9b02d080641a3cea`。当前工作树不构成新的恢复点，回退范围为上述 8 文件；不自动开启下一小步或 ARCH-03。AGENTS/FINAL-PROMPT 无需同步，README 当前路径和依赖已更新。
- 最终交付检查：`git diff --check`、`node --check tests/browser/arch02-makeup-plan.mjs` 均退出码 0；Node 只读检查核对 8 文件范围、固定分支/HEAD/0:0/空暂存区、AGENTS 无差异、无 `arch-stage-02`、纯转换原实现等价、工作台其余实现及小Y业务实现未改、UTF-8/换行/空白、本地文档链接与 12 阶段唯一 current 均通过。该检查初次将中文冒号误写为英文而未匹配到阶段标题，修正检查表达式后通过，未改阶段或业务代码；不计为功能测试。
- 人工体验服务：自动页面回归结束后发现 8787 健康检查不可达，为方便人工测试，在独立 Node 进程内显式令 `ZHIPU_API_KEY` 为空、端口为 8787、host 为 127.0.0.1，再调用现有网关 `start()`；不改 `.env` 或源文件。健康检查随后返回 ok=true/status=ready，通过 Vite 5175 代理实际请求 `/api/makeup-plans`，返回 ok=true、sourceMode=local、7 步、photoEnabled=false。此前“未覆盖网关集成”指自动浏览器脚本；本条仅增加无模型配置下的健康/代理/正常方案 API 冒烟验证，真实 HTTP 失败、断网、超时和模型仍未覆盖。保留 5175 前端和 8787 无模型测试后端供人工验收，不影响原 5174 服务。

**S01 人工验收通过与提交授权（2026-11-17，北京时间）**

- 确认人：项目负责人；原话“ARCH-02-S01 人工验收通过 上传到github上去”。确认范围为已交付的 8 文件：Utils/就近测试、工作台与小Y引用、原小Y测试调整、浏览器脚本、README 与本文；不虚构负责人具体设备或逐项执行步骤。此确认授权当前小步提交并推送固定开发分支，不代表全阶段完成、不授权合并 master 或进入 ARCH-03。
- 提交前规范与版本：已再次 `git fetch origin master codex/frontend-contracts-yas-2026-0055`，读取远端 AGENTS、README 公共约定和计划约束；公共规范仍为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 副本无差异。固定开发分支 HEAD/远端均为修改前基线 `5e58236f6897147b354153ea9b02d080641a3cea`，ahead/behind 0/0，起始暂存区为空，实际范围仍为上述 8 文件。
- 确认后仅同步 README 与本文的人工验收/版本门禁，6 个代码与测试文件保持原样，哈希在文档修改前保存供提交前复核。沿用本步实际通过的相关 21/21、全量 120/120、构建、前后各 10/10 页面及无模型代理 API 冒烟结果；不重复已通过测试或声称本轮新运行。脚本语法、diff/暂存空白、文件范围/编码/链接/阶段状态和已验收文件哈希在提交前复核，结果实际取得后追加。
- 阶段与审计：ARCH-02 继续唯一 current，API、Hook 与组件拆分未开始；ARCH-03 及以后继续 pending，不建立 `arch-stage-02`。两份累计报告按完整阶段收尾时同步，本步无新增核验，继承上一条结论；未扩大图片授权、商品来源、真实模型/断网/超时或真机验证结论，所有历史失败与风险保留。
- 提交与回退：本条写入时尚未暂存/提交/推送，修改后 SHA 未产生；本次按问题格式只提交上述 8 文件，真实 SHA 与推送后的远端核验由交付回执先行给出、下次文档同步回填，不 amend 或为自引用额外提交。仅当前小步形成新的代码回退位置，按实际 SHA、后续依赖和 `git revert` 流程复验；不覆盖 master、不强推、不移动旧标签，Git 不恢复浏览器数据、环境变量或外部状态。
- 提交前检查结果：`git diff --check`、`node --check tests/browser/arch02-makeup-plan.mjs` 均退出码 0；Node 只读检查确认精确 8 文件范围、固定分支/HEAD/远端 0:0、空暂存区、公共规则一致、6 个已验收代码/测试文件哈希未变、UTF-8/换行/空白、本地链接/人工确认、12 个阶段状态及原两轮 10/10 浏览器证据均通过。追加本结果后再查空白；暂存后继续核对精确文件范围与暂存内容，不把本次文档检查计为新功能测试。

**ARCH-02-S02：工作台 API、状态与展示职责迁移（2026-11-17，北京时间；自动验证完成，待人工验收）**

- 授权与门禁：负责人明确要求“先完成并归档 ARCH-02，再启动 ARCH-03”。先完成本阶段剩余迁移与自动验证；尚无对本步具体 diff 的人工验收，不提前提交、推送、打标签或标 done。ARCH-02 仍为唯一 current，ARCH-03 及后续 pending。原 S01 的待提交描述为历史快照，实际已验收提交为下列基线，本次实时远端已核对一致。
- 修改前已验收基线：固定分支 codex/frontend-contracts-yas-2026-0055，HEAD/实时远端均为 aa564870f30f97711e096aebf744f3c2f5af6230（S01，关联 YAS-2026-0055）；起始工作树与暂存区为空。本地与实时远端 master 均为 19b87df58d0f8bf3874dc8e958175c7c22ac6f82，已 fetch 并读取公共规范，AGENTS 副本无差异。默认 Schannel 握手失败，单次命令使用 git -c http.sslBackend=openssl 后实时查询/fetch 成功，未改全局配置。
- 迁移原因：工作台剩余约 120 行仍混合重复方案 HTTP 请求、表单/方案流程和展示；小Y也含同一方案请求。以本步完成这一独立工作台边界，按 API→Hook→展示顺序迁移，不改既有行为。
- 拟改文件及映射：src/components/MakeupWorkbench.jsx 请求→src/features/makeup-plan/makeupPlanApi.js；表单/方案/加载/错误/生成→hooks/useMakeupPlan.js；需求表单、方案结果、方案产品→components/{MakeupPlanForm,PlanResult,PlanProduct}.jsx；工作台组合入口保留标题/状态/错误职责，并按 ARCH-00 映射迁入同一 components/MakeupWorkbench.jsx；小Y同步导入新路径，删除旧组件路径，不留转发文件。小Y的方案 HTTP 调用直接复用新 API，其对话参数、格式化和其他 assistant 实现暂留。新 API/Hook/产品组件就近测试、原 tests/browser/arch02-makeup-plan.mjs、README、本文和阶段累计报告/审计记录按实际结果同步。
- 验证方法：迁移前后复跑同一桌面 1440×900 / 手机 360×800 脚本，对比字段/表单/相对尺寸；测试无照片生成、改条件、画像衔接、优先目标、加载/重复操作、空响应/错误/重试、产品详情/滚动/Escape、小Y方案与原文本降级。运行相关 makeup-plan/assistant/storage 测试、npm test、npm run build、git diff --check。结果待运行后追加，不预写通过。
- 行为边界及回退范围：只改以上模块、直接引用、相关测试和四份文档；保留端点/字段/响应适配/错误文本、无主动超时/重试、失败保留旧方案、画像字段变化重新应用默认值、表单优先项最多四项和产品真实 ID 过滤。无前端方案生成器、无公共 lib/api、无 storage/服务端/产品/素材/样式/依赖改变。未提交工作树不是新恢复点；未来按本步实际提交及依赖 git revert 并复验，不自动清理文件、用户存储或标签。
- 版本与阶段收尾：未暂存、未提交、未推送、未创建 arch-stage-02；本步人工验收待进行，修改后 SHA 不存在。两份累计报告先作收尾准备，待具体结果与人工确认齐备再归档；本阶段无新增核验，继承上一条结论。

**S02 实际交付与阶段收尾准备（2026-11-17，北京时间）**

- 上步版本回填：S01 的人工验收已见上文，实际提交/远端为 aa564870f30f97711e096aebf744f3c2f5af6230。本次开始及交付核对同名远端均一致，未发现远端领先/分叉。2026-11-17 实时查询本地/远端均无 arch-stage-02；不把“先完成并归档”或 S01 已上传当作 S02 具体改动已获人工验收。
- 实际修改共 16 文件（含旧路径删除与 9 个新文件），完整清单如下；S01 Utils/原测试未改，迁移后的入口直接消费已验收 Utils。

- `src/components/MakeupWorkbench.jsx（旧路径删除，组合入口迁入 feature）`
- `src/components/XiaoYAssistant.jsx`
- `src/features/makeup-plan/makeupPlanApi.js`
- `src/features/makeup-plan/makeupPlanApi.test.js`
- `src/features/makeup-plan/hooks/useMakeupPlan.js`
- `src/features/makeup-plan/hooks/useMakeupPlan.test.js`
- `src/features/makeup-plan/components/MakeupWorkbench.jsx`
- `src/features/makeup-plan/components/MakeupPlanForm.jsx`
- `src/features/makeup-plan/components/PlanResult.jsx`
- `src/features/makeup-plan/components/PlanProduct.jsx`
- `src/features/makeup-plan/components/PlanProduct.test.jsx`
- `tests/browser/arch02-makeup-plan.mjs`
- `README.md`
- `docs/frontend-architecture-migration-plan.md`
- `docs/stage-delivery-test-report.md`
- `docs/product-data-accuracy-audit.md`

| 原职责 | 实际迁移位置 |
| --- | --- |
| 工作台及小Y重复的方案 HTTP POST/JSON/错误检查 | makeupPlanApi.js 唯一实现，接受已转换 payload，返回原 plan；不建公共 lib/api |
| 工作台 form/plan/status/error、画像 effect、update/togglePriority/createPlan | hooks/useMakeupPlan.js；effect 依赖与加载/失败/重试状态保留 |
| 原表单与三个选项数组 | components/MakeupPlanForm.jsx；DOM、标签、控件/禁用状态及提交处理保留 |
| 原方案结果及按真实 ID 查询产品 | components/PlanResult.jsx / PlanProduct.jsx；来源模式、依据/限制、详情回调及无效 ID 过滤保留 |
| 工作台组合入口 | components/MakeupWorkbench.jsx；保留有实际职责的标题、状态和错误组合，删除旧 src/components/MakeupWorkbench.jsx；小Y同步唯一引用 |
| 小Y会话方案 HTTP | 只复用 makeupPlanApi；planPayloadFromConversation、formatPlanReply、文本降级与其他 assistant 实现暂留原处，未实施 ARCH-03 |

- 迁移顺序为 API→Hook→展示→直接引用/测试；该工作台原约 120 行，本 S02 是同一可构建、验证和回退的职责迁移，不跨阶段。API/Hook/产品边界新增 18 项有效行为断言，原有测试均保留。
- 自动测试真实结果：02:30:25 首次相关测试 9 文件 76/76；02:31:44 全量 20 文件 138/138、构建 2870 模块通过。核对 ARCH-00 映射后将工作台组合入口移至最终 feature 路径，于 02:33:47 再运行相关测试（76/76，455ms）、02:33:49 全量 npm test（138/138，2.12s），npm run build（2870 模块，1.59s）均退出码 0。最终主 JS 743.50 kB（gzip 225.19 kB），3D 异步块 1292.96 kB（gzip 355.95 kB）；原 Three.js CommonJS 弃用和超过 500 kB 提示仍在。
- 测试命令：npm test -- src/features/makeup-plan src/components/XiaoYAssistant.test.js src/components/XiaoYAssistant.storage.test.jsx src/lib/storage；npm test；npm run build。无依赖安装，无真实付费 provider 调用；源码/数据/样式/存储/契约字段未改变。
- 页面执行：原 5175 启动命令因端口已占用退出，未停止已有服务；只读确认其工作台模块是本仓库源代码后复用。已有 Playwright + Chrome 157.0.8103.52，1440×900 / 360×800，reducedMotion=reduce、deviceScaleFactor=1、每场景独立临时上下文和合成数据。迁移前原 10 场景 10/10；迁移后扩充脚本 14/14；入口迁至最终路径后再次 14/14。命令仍为 node tests/browser/arch02-makeup-plan.mjs，YAS_QA_PLAYWRIGHT_MODULE / YAS_QA_BROWSER_EXECUTABLE / YAS_QA_BASE_URL 沿用 S01 示例，YAS_QA_OUTPUT_DIR 可指定本地 work 目录。
- 页面覆盖：原 10 项的无照片生成、预算/场景/妆效修改与其他条件保留、当前/旧画像衔接、画像变化重置默认值、加载/Enter 禁止重复提交、空响应/坏 JSON/失败保留旧方案/重试、产品详情按钮与 Escape、小Y方案/原文本降级均保留并通过；新增两视口各 2 项，验证最多四项优先目标/移除再选择、无效产品 ID 与候选依据过滤、依据展开/关闭/滚动、真实产品详情、HTTP 503/504、模拟网络 timedout 及恢复。
- 错误证据：14 例均无 pageerror；12 个正常/业务错误场景 console.error / 失败请求为空。两个显式网络错误场景分别记录 3 条预期资源错误（503、504、ERR_TIMED_OUT）和 1 条预期失败请求，测试精确检查数量/端点/错误类型，不掩盖意外错误；恢复后可以生成方案。这里的超时是 route.abort('timedout') 模拟，不是新增前端定时器，也不是实际 provider 超时验证。
- 前后对比与视觉限制：原 10 场景请求及表单值一致；静态比对证明迁出的表单 JSX（仅缩进）、PlanResult、PlanProduct 与原实现等价。额外严格几何比较两次未通过：表单标签行高有 1px 差异（原基线同一场景自身也由 59→58px），部分产品按钮高度在 360px 下最多相差 17px，累积相对纵向位置差异约 109px；表单控件宽高及全部控件横向位置一致。现有 Google display=swap 网络字体存在异步时序，未记录当时字体加载状态，不能认定差异原因或宣称像素一致。未改 CSS；已查看最终桌面表单/结果和手机表单/结果/网络错误/展开依据共六张截图，结合原几何断言未见横向溢出、重叠或不可操作控件。字体加载后的排版与真实设备仍需人工重点复验。
- 本地证据在 D:/codex/2026-11-17/3333-yaspretty-arch-03-assistant-arch/work/arch02-s02-{before,after,final}/results.json 及截图；final/comparison.json 如实记录严格几何不一致，未将该比较失败写成通过。诊断 PowerShell 曾因对无 initialGeometry 的结果取下标报错，改用 Node 按可选字段比较；不属于业务失败或产品修改。工作目录证据不加入 Git。
- 用户体验入口：主站导航“小Y智能选妆”上方工作台，或下方对话请求完整妆容。人工重点为无照片生成、连续改条件、画像衔接、失败保留旧方案及恢复、候选依据/详情开关与滚动、360px 字体加载后的排版。浏览器自动测试正常方案来自现有服务端规则 configured=false，经路由拦截返回；未验证真实网关与 provider、真实手机或默认动画。
- 收尾文档：README 当前结构/实际路径/依赖边界已同步；docs/stage-delivery-test-report.md 与 docs/product-data-accuracy-audit.md 追加收尾准备。无新增核验，继承上一结论。原价格/图片授权 pending/商品来源政策差异/公开门禁不升级。未读取、展示或记录真实 API Key、真实用户照片、画像、对话或旧 memory；没有新增上传/存储范围。AGENTS、FINAL-PROMPT、视频和比赛材料无需改变。
- 人工确认待进行，未暂存、未提交、未推送、未创建 arch-stage-02，修改后 SHA 不存在。ARCH-02 保持唯一 current，ARCH-03 及后续 pending；本轮完成的是剩余实现及自动验证准备，尚未“阶段归档”。本步确认并形成实际提交后，才按 AGENTS 13.2 完成阶段收尾/远端分支与标签核验，再使用已获启动授权进入 ARCH-03；不伪造人工通过或标签。回退范围为上述 16 文件，基线 aa564870 / 前置 arch-stage-01，按未来实际提交与依赖 git revert 并复验，不清理用户修改或真实存储。

- 最终文档/范围检查：node work/arch02-final-check.mjs（在本聊天工作目录执行其绝对路径）退出码 0，核对 16 个实际变更文件/9 个新文件、固定分支/HEAD、空暂存区、UTF-8/末尾换行/无行尾空白、唯一 ARCH-02 current 与 ARCH-03 pending、无 assistant/lib/api 目录、请求职责及旧入口移除均通过。node --check tests/browser/arch02-makeup-plan.mjs、git diff --check、git diff --cached --check 均退出码 0；确认后只改文档，未重复已通过业务验证。

**S02 人工验收与 ARCH-02 整阶段收尾（2026-11-17，北京时间）**

- 确认人：项目负责人；原话“人工核验完成 现在02结束了吗”。结合前次已交付 S02 的 16 文件、自动测试/页面/文档和明确的待人工验收说明，记为本步人工验收通过，并按 AGENTS 13.2 授权固定开发分支提交/推送及 arch-stage-02 阶段标签。不编造负责人所用设备、逐项操作或对严格几何差异的原因判断；S01 既有人工验收与已推送 aa564870 的事实保留。
- 修改前已验收基线/实际远端仍为 aa564870f30f97711e096aebf744f3c2f5af6230，分支 codex/frontend-contracts-yas-2026-0055，起始暂存区为空；工作树精确为已交付的 16 文件，无其他用户修改。本次重新 fetch master 与同名开发分支，公共规范仍为 19b87df58d0f8bf3874dc8e958175c7c22ac6f82，AGENTS 无差异，远端 README/计划公共约定已核对。本地及实时远端均无 arch-stage-02，不覆盖既有标签。
- 确认后仅同步 README、本文、阶段报告和数据审计四份文档的人工确认/最终状态；12 个代码/测试路径（含旧文件删除）保存 SHA-256 并在暂存前复核，保持已验收版本。沿用 S02 已真实通过的相关 9 文件 76/76、全量 20 文件 138/138、构建 2870 模块，以及迁移前 10/10、最终两视口 14/14 页面证据，不重复已通过验证或声称本轮新测试。最终文档、范围、哈希和暂存空白检查在提交前实际运行。
- ARCH-02 全部计划职责已迁移并通过人工验收，状态更新为 done；ARCH-00/01 保持 done，ARCH-03 及以后仍 pending，当前无实施中的阶段。此前“先完成并归档 ARCH-02，再启动 ARCH-03”的授权保留，但本次收尾提交仅覆盖 ARCH-02，不混入下一阶段修改。
- 两份累计报告同步本次最终人工确认与版本安排。**本阶段无新增核验，继承上一条结论。** 产品事实/来源/授权、Key/版本/消息裁剪/迁移、API/推荐/降级、隐私/上传边界不变；AGENTS/FINAL-PROMPT、服务端/public/data/样式/依赖/视频及比赛材料未改。大分包/Three.js 弃用、严格像素几何差异、真实手机/默认动效/实际网关/provider 未增加自动覆盖等历史限制继续保留，人工确认不扩充自动测试结论或认定差异成因。
- 本段写入时尚未暂存/提交/推送/创建标签；只提交本步 16 文件，随后推送固定开发分支并核对实际远端 SHA，在该收尾提交建立带注释的唯一 arch-stage-02，再推送并核对标签对象和 ^{} 指向。实际 SHA/远端标签由归档回执先行报告，下次文档同步回填，不 amend 或额外改写历史。只有远端分支与标签核验一致后，才报告“ARCH-02 已完成归档”。回退按该实际提交及后续依赖 git revert 并复验，保留全部历史与标签；Git 不恢复浏览器数据/环境变量/外部状态。

### ARCH-03：`assistant`

**状态：`done`（2026-11-17 剩余人工核验由负责人豁免；最终提交和阶段标签的实际远端核验见本次归档回执）**

**允许范围**：`XiaoYAssistant.jsx`、新 `features/assistant/`、已完成的 storage 与 makeup-plan 公共入口、相关测试和文档。

**任务顺序**：

1. 将 `detectIntent`、`needsOnlineResearch` 迁入 `intentUtils.js`。
2. 将画像提取、站内推荐、本地回复、错误清理和方案消息格式化迁入 `assistantUtils.js`。
3. 将 `requestAssistant` 迁入 `assistantApi.js`，妆容请求复用 `makeupPlanApi.js`。
4. 将消息、画像、存储、忙碌状态、发送和降级流程迁入 `useAssistant.js`。
5. 按实际复杂度拆出消息区、画像摘要、推荐产品和来源列表。
6. 将业务函数测试从 UI 组件迁移到对应模块。

**边界**：前端意图只选择前端流程；服务端 `intentRouter` 不移动、不复制，推荐规则和提示词不变。

**验收**：本地推荐、结构化问答、联网与无 Key 降级、画像与消息恢复、小Y生成方案均保持原行为；测试和构建通过。

**ARCH-03-S01：前端流程意图工具抽取（2026-11-17，北京时间；自动验证完成，待人工验收）**

- 启动授权：前次只读预检确认 ARCH-02 已归档，但 ARCH-03 仍 pending，按本次任务门禁停止且未改文件。负责人在获知需登记唯一 current 后明确回复“开始执行”，据此先更新本文；不将启动授权解释为本小步人工验收或提交授权。ARCH-00/01/02 保持 done，ARCH-04 及后续 pending。
- 已验收基线：固定分支 `codex/frontend-contracts-yas-2026-0055`，HEAD/实际远端为 `f0d02eb64ced01c0fd1fa5fc210eb687050620e5`（ARCH-02-S02）；起始工作树、未跟踪文件和暂存区均为空，ahead/behind 0/0。远端 `arch-stage-02` 对象及指向见上表；ARCH-02 收尾 SHA/tag 在本次同步回填，保留旧待提交快照。公共规范为已 fetch 核对的 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 副本无差异，前置关联 `YAS-2026-0055`，无新增问题编号。
- 迁移原因：前端流程判断从 UI 导出，测试必须加载 React 组件；其中产品提及匹配又被本地推荐/回复共享。抽取同一文本判断工具，保留唯一匹配实现，避免组件与领域模块相互引用。
- 拟改文件与映射：`src/components/XiaoYAssistant.jsx` 的 `detectIntent`、`needsOnlineResearch` 及其共享依赖 `findMentionedProducts` → `src/features/assistant/intentUtils.js`；组件直接导入三项工具，删除原实现及两项转发导出。本地推荐、评分、画像、API、状态与 JSX 暂留原处。原测试中两项意图测试 → 就近 `intentUtils.test.js`，保留原断言并验证规则优先级；相关浏览器脚本、README 与本文同步。
- 验证方法：先用原实现运行意图断言及桌面 1440×900/手机 360×800 页面基线，再用同样场景验证迁移后流程。覆盖本地推荐/比较、结构化采集、产品事实与通用问答、模拟联网及来源、无 Key/失败/超时披露、画像与消息恢复、旧迁移/20 条限制、对话方案及失败降级、真实详情/来源交互。运行 assistant、storage、makeup-plan 相关测试、`npm test`、`npm run build` 和 `git diff --check`；未取得的结果不预填通过。
- 行为边界：保持匹配条件、优先级、返回值、产品顺序和前端流程选择；不复制或改写服务端 intentRouter。纯文本工具只依赖受控产品数据，无 React/fetch/localStorage；不改推荐、API/字段/错误/降级、UI/DOM/样式、存储或依赖。本步不提前迁移剩余业务函数、API、Hook、组件或 ARCH-04。
- 回退范围：本小步新工具/测试、原组件及原测试引用、相关浏览器脚本、README 和本文。未提交工作树不构成新版本回退点；人工确认形成提交后按实际 SHA/依赖使用 git revert 并复验，不清理用户文件、真实存储或移动标签。
- 当前门禁：未暂存、未提交、未推送、未建 `arch-stage-03`；人工验收待进行，修改后 SHA 不存在。按 AGENTS 13.2，本步验收并建立提交后才继续下一小步；未到完整阶段收尾，两份累计报告届时按 12.1 同步。无新增核验，继承上一结论。实际验证、文件和剩余风险在取得后追加。

**S01 实际交付记录（2026-11-17，北京时间）**

| 原位置/职责 | 本步实际映射 |
| --- | --- |
| XiaoYAssistant.jsx 的 detectIntent / needsOnlineResearch | features/assistant/intentUtils.js；判断条件、顺序、返回值和原 profile 参数保持不变，只负责前端流程 |
| 同组件的 findMentionedProducts | 同一 intentUtils.js 共用文本匹配；本地推荐/回复直接导入，匹配规则、受控 products 对象及顺序不变，无重复实现或循环 |
| XiaoYAssistant.test.js 的两项意图测试 | intentUtils.test.js，就近保留原 13 条断言，新增四项优先级、大小写/简称、联网标志及画像兼容用例；其余八项业务测试保留原处 |
| 缺少小Y API/来源/错误流程浏览器检查 | tests/browser/arch03-assistant.mjs；独立临时上下文与合成响应，方案正常值复用现有服务端无模型规则，不读取真实 Key |

- 实际修改共 7 文件：`src/components/XiaoYAssistant.jsx`、`src/components/XiaoYAssistant.test.js`、`src/features/assistant/intentUtils.js`、`src/features/assistant/intentUtils.test.js`、`tests/browser/arch03-assistant.mjs`、`README.md` 和本文。其中 3 个新文件；App 直接引用未受影响。storage、makeup-plan 实现/测试、contracts、服务端、public、data、样式、API/字段/提示词/推荐规则/依赖均未修改。没有新增无意义的入口文件或转发导出。
- 自动验证：03:03:16 在原 UI 实现上执行 `npm test -- src/features/assistant/intentUtils.test.js`，1 文件 6/6；抽取后 03:06:09 执行 `npm test -- src/features/assistant src/components/XiaoYAssistant.test.js src/components/XiaoYAssistant.storage.test.jsx src/lib/storage src/features/makeup-plan`，10 文件 80/80（447ms）；03:06:30 执行 `npm test`，21 文件 142/142（1.87s）。均退出码 0；原 Three.js CommonJS 弃用提示保留。
- `npm run build` 退出码 0，2871 模块、1.69s，主 JS 743.47 kB（gzip 225.18 kB）、3D 异步块 1292.96 kB（gzip 355.95 kB），原超过 500 kB 分包提示保留。`node --check src/features/assistant/intentUtils.js`、`node --check tests/browser/arch03-assistant.mjs`、`git diff --check` 均退出码 0；文档及未跟踪文件的最终范围/空白检查在交付前另行追加。
- 页面基线：`node tests/browser/arch03-assistant.mjs` 首轮 4/8；比较断言误用中文品牌名（受控数据实际为 Estée Lauder），合成来源页未声明 UTF-8，导致两视口各两例失败。只修正测试品牌断言与合成 HTML 编码，生产代码尚未迁移；03:04:27 复跑 8/8。历史首轮结果及失败截图保留，不将脚本错误写为产品问题或抹去失败。
- 迁移后页面：同脚本 03:06:44 为 8/8；为使取景显示最新消息，测试截图先滚动消息区到底部，并增加超时/方案文本降级截图，03:09:18 最终复跑 8/8。03:07:39 复跑 `node tests/browser/arch01-storage.mjs` 14/14，03:07:33 复跑 `node tests/browser/arch02-makeup-plan.mjs` 14/14；本步迁移后共 36 场景通过，未修改这两份已有脚本，不把 ARCH-02 的旧结果冒充本次验证。
- 环境与覆盖：复用已有 `http://127.0.0.1:5175`，已核对返回本仓库小Y模块；已有 Playwright + Chrome 157.0.8103.52、1440×900 / 360×800、deviceScaleFactor=1、reducedMotion=reduce。所有 API 请求被测试路由拦截，普通问答/事实/追问、联网来源与错误均为合成响应；正常方案调用现有 createMakeupPlanService，provider configured=false，不实现第二套方案生成器或真实外部调用。真实导航、Enter/发送、忙碌禁用/防重复、仅历史末 8 条/role-content 请求、有效 ID 去重最多 3 条、来源链接弹窗打开/关闭、消息滚动和刷新恢复均覆盖。
- 本地与方案：缺肤质追问、油皮/400 元硬条件真实站内候选、本地产品比较/详情按钮与 Escape/滚动均通过；旧值迁移、当前值优先、损坏值、20 条裁剪及旧凭据清理由原 storage 脚本覆盖。工作台结构化采集与调整、聊天中修改画像/预算/场景后衔接方案、唯一 makeupPlanApi 请求、7 步成功与原文本降级、无效产品 ID 过滤由原工作台及新小Y脚本覆盖；无新增 Key/版本/存储迁移逻辑。
- 失败与控制台：新脚本每视口显式制造 4 次 HTTP 503/504（模拟无 Key、联网失败、天气失败和上游超时）及 1 次 timedout，另有方案 503 文本降级，各精确记录 6 条预期资源错误和 1 条 /api/assistant 失败请求。原工作台脚本每视口精确记录 3 条预期资源错误和 1 条方案 timedout；storage 无错误。所有 36 场景 pageerror 均为空，正常场景 console.error/失败请求为空；空响应/坏 JSON、错误标识和恢复继续保留。无 Key/联网/超时检查是模拟，不代表实际网关/provider 被验证；timedout 也不代表新增主动请求超时。
- 行为对比：只读检查将原实现的三项函数逐字比对到新文件，全部相同；组件去除这三段原实现/两项旧导出、加入新 import 后，其余代码与基线完全一致，包含发送时序、画像/存储、API/错误/降级和完整 JSX。迁移前后 8 场景的请求字段、回复文本、产品 ID、方案参数及失败披露逐项一致，comparison.json 保存结果；不把静态相同或行为一致扩充为像素一致。
- 截图与限制：已查看桌面/手机的来源、推荐/比较、方案和失败等截图；几何断言无横向溢出、画像与消息区域重叠或输入/发送控件重叠。真实手机、默认动效、真实 provider、弱网和字体加载后的排版仍待人工复验；ARCH-02 已披露的严格几何差异及未确认字体原因继续保留。本步不修改 CSS、字体资源或加入前端超时/重试。
- 本地证据均在忽略目录 `.qa/arch-03-s01-{before,before-rerun,after,final,storage,makeup-plan}/results.json` 与截图；首轮和前后证据不覆盖，不提交 QA 临时物。03:09 健康冒烟只读取 8787 `/api/health` 的 ok=true/status=ready，未读取模型 Key，也不据此宣称 provider 或实际问答调用通过。
- 复跑环境沿用 ARCH-02 示例的 `YAS_QA_PLAYWRIGHT_MODULE` / `YAS_QA_BROWSER_EXECUTABLE` / `YAS_QA_BASE_URL`；将 `YAS_QA_OUTPUT_DIR` 分别设为独立忽略目录后执行上面三份浏览器脚本。原脚本不计入 Vitest 文件数，无新增依赖或浏览器用户数据访问。
- 用户入口：主站“小Y智能选妆”，上方结构化采集、下方自由对话。人工重点为本地推荐/比较与真实详情、带实时词的问题和来源、错误后继续使用、本地消息与画像刷新/重新开始、画像修改后生成完整妆容、360px 消息/详情/来源滚动与键盘操作。模拟外部结果可复跑新脚本；普通人工测试不要求提供 API Key。
- 文档和未完成项：README 当前树、路径、依赖、21/142 与页面覆盖边界已同步；AGENTS、FINAL-PROMPT、视频及比赛材料未改。后续 assistantUtils、assistantApi、useAssistant 和展示组件仍待各小步迁移，ARCH-03 保持 current；尚未到整阶段收尾，两份累计报告将在完整阶段按 12.1 同步。**无新增核验，继承上一结论。** 既有产品来源/图片授权 pending/公开门禁、存储异常继续抛出、无主动请求超时、大分包与弃用提示均保留。
- 版本与人工门禁：本 S01 尚未人工验收，未暂存/提交/推送/创建 `arch-stage-03`，修改后 SHA 不存在，HEAD 仍为已验收基线 `f0d02eb64ced01c0fd1fa5fc210eb687050620e5`。回退范围精确为上述 7 文件；当前工作树不是新回退点，未来按实际已验收提交/依赖使用 git revert 并复验，Git 不恢复浏览器数据、环境变量或外部服务状态。
- 最终只读交付检查：Node 内联检查退出码 0，核对精确 7 文件（含 3 个未跟踪新文件）、固定分支/HEAD、远端跟踪 0/0、空暂存区、AGENTS 与公共规范一致、无 `arch-stage-03`，以及 UTF-8/末尾换行/含新文件的空白、9 条本地文档链接、12 阶段正文/总表唯一 ARCH-03 current。三项迁出函数逐字相同，原两项意图测试完整保留、组件其余实现和八项业务测试不变；最终 8 场景请求/回复/产品 ID 对比一致，storage/makeup-plan 各 14/14 证据核对通过，结果写入 `.qa/arch-03-s01-final/comparison.json`。只读核对确认无范围外差异；文档检查不计为新增业务测试。追加此记录后再检查 `git diff --check`、空暂存区和新脚本语法，不重复已通过的业务验证。

**S01 人工验收与提交授权（2026-11-17，北京时间）**

- 确认人：项目负责人；明确回复“S01 已通过，按门禁提交推送后继续”。确认范围为本步已交付的 7 文件及其自动验证/页面边界，不虚构负责人设备或具体操作。此确认授权 S01 在固定开发分支提交/推送，并继续 ARCH-03；不授权 ARCH-04、合并 master、完整阶段标签或未来尚未验收改动的提交。
- 提交前重新 fetch master 与同名开发分支，实际远端/HEAD 仍为已验收基线 `f0d02eb64ced01c0fd1fa5fc210eb687050620e5`，公共规范 master `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 无差异，起始暂存区为空，工作树精确为本步 7 文件。确认后仅同步 README 和本文，五个代码/测试文件以 SHA-256 复核保持已验收内容。
- 沿用已取得的相关 80/80、全量 142/142、构建及迁移后 36/36 页面结果；未改代码/测试，不重复测试或扩充覆盖。提交前复核 UTF-8/空白、文件范围、规则/阶段状态、脚本语法和已验收文件哈希，并检查暂存内容。
- ARCH-03 保持唯一 current，完整阶段剩余职责尚未迁移；未建 `arch-stage-03`。本条写入时尚未暂存/提交/推送，实际 SHA 与远端核验由回执先行给出、下次文档同步回填，不 amend。未到整阶段收尾，两份累计报告届时同步；**无新增核验，继承上一结论。** 回退范围仍为本步 7 文件，形成提交后按实际 SHA/依赖 git revert 并复验。

**S01 提交与远端核验回填（2026-11-17，北京时间）**

- 人工验收后只暂存本步 7 文件，暂存空白检查通过；提交 `a7222feca91c90160a69114e702a851802342e0f` 已推送固定开发分支，`git ls-remote` 实际远端 SHA 与 HEAD 相同，工作树和暂存区均为空。未建立 `arch-stage-03`，不改写此前待提交的历史快照。

**ARCH-03-S02：业务纯函数与就近测试迁移（2026-11-17，北京时间；实施前登记）**

- 原因与范围：画像、候选评分/硬条件、本地回复、方案输入/消息适配、模型产品标记解析和错误清理仍耦合在 UI，业务测试依赖组件。仅迁移这些纯函数与其唯一内部常量；本步不迁移 API、Hook 或展示组件，不修改任何判断、候选、文案或返回结构。
- 修改前已验收基线：`a7222feca91c90160a69114e702a851802342e0f`（S01 已人工验收并推送）；固定分支正确，实时远端与 HEAD 相同，ahead/behind 0/0，起始工作树/暂存区为空。公共规范 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82` 已 fetch 核对，AGENTS 无差异；关联问题沿用 `YAS-2026-0055`。
- 拟改文件与映射：`XiaoYAssistant.jsx` 内 `extractProfile`、`pickShade`、`scoreProduct`、`recommendProducts`、`localReply`、`planPayloadFromConversation`、`formatPlanReply`、`localMakeupReply`、`parseAssistantResult`、`cleanErrorMessage` 和 `SCENE_OPTIONS` → 新 `src/features/assistant/assistantUtils.js`；`scoreProduct`/常量保留模块内部，其他仅导出实际调用所需函数。原 `src/components/XiaoYAssistant.test.js` 的 8 项业务测试 → 新 `src/features/assistant/assistantUtils.test.js`，原文件删除，组件不保留转发导出；README 和本文同步实际树/依赖/证据。
- 验证方法：保留原 8 项有效断言，对画像修正、明确提及产品、消息 ID/格式边界增加回归，并先在旧实现上运行；迁移后运行 assistant、受影响 storage/makeup-plan 测试、`npm test`、`npm run build`、`git diff --check`。复跑已有三份浏览器脚本，桌面 1440×900/手机 360×800 对比 S01 请求/回复/产品 ID；函数原文和组件其余内容逐字核对，不以静态检查代替页面回归。
- 回退范围：上述组件、原/新业务测试、新 Utils、README 和本文六个路径；本步未提交，不属于新回退点。人工验收形成提交后，按实际 SHA 和后续依赖执行 `git revert` 并复验；不恢复或删除浏览器数据、环境变量、外部服务状态。未验收不提交、不推送、不打标签；ARCH-03 仍唯一 current。

**S02 自动验证与交付记录（2026-11-17，北京时间；待人工验收）**

- 实际修改精确为实施前登记的 6 路径：修改 `src/components/XiaoYAssistant.jsx`、README、本文；新增 `src/features/assistant/assistantUtils.js` 和 `assistantUtils.test.js`；删除 `src/components/XiaoYAssistant.test.js`。10 个函数体和 SCENE_OPTIONS 原文相同，组件仅移除这些实现、旧业务导出并更新 import，其余 API、状态、发送/降级、完整 JSX 与已验收基线相同。`scoreProduct` 保持内部函数，`pickShade` 由现有产品展示实际使用，未新增桶式或转发导出。
- 原 8 项业务测试的全部断言完整保留；新增 5 项覆盖画像纠正保留其他字段/不修改旧值并衔接方案、明确提及产品的既有优先行为、肤质追问与条件解释、模型方案文本/颜色省略/三条产品上限、真实 ID 去重/顺序/清理。迁移前先执行 `npm test -- src/components/XiaoYAssistant.test.js`，13/13；迁移后 `npm test -- src/features/assistant src/components/XiaoYAssistant.storage.test.jsx src/lib/storage src/features/makeup-plan`，10 文件 85/85；`npm test`，21 文件 147/147；`npm run build` 成功，2872 模块，主包 743.50 kB/gzip 225.18 kB，3D 包 1292.96 kB/gzip 355.95 kB。既有 Three.js CJS 弃用和 >500 kB 提示保留，不实施后续拆包。
- 静态验证：10 个函数原文、场景常量、组件其余实现、原 8 测试逐字核对相同；Utils 无 React/fetch/localStorage 副作用；旧业务 UI 导出/旧测试移除，引用均指向唯一实现。迁移脚本首次将 LF 写成 CRLF，`git diff --check` 据实报空白问题，已恢复 LF 后通过，未改变业务。浏览器汇总脚本首次错误假定三份结果都用 pageErrors 字段而失败，修正为读取 makeup-plan 的 errors 后通过；三份实际浏览器测试均首轮通过，不将汇总脚本错误写成产品缺陷。
- 页面命令：复用已确认本仓库的 `http://127.0.0.1:5175`，采用 S01 已有 Playwright/Chrome 环境变量，依次指定独立输出目录后执行 `node tests/browser/arch03-assistant.mjs`、`node tests/browser/arch01-storage.mjs`、`node tests/browser/arch02-makeup-plan.mjs`。实际 Chrome 157.0.8103.52，1440×900 / 360×800，临时上下文、合成数据、reducedMotion=reduce；分别 8/8、14/14、14/14，总计 36/36。
- 页面范围：本地真实候选/硬条件/比较及详情打开关闭/滚动，结构化采集/修改条件/方案生成，通用/产品事实请求，来源打开关闭/消息滚动，画像/消息刷新、20 条裁剪、旧值迁移与凭据清理，忙碌状态/Enter/防重复，修改画像后会话方案衔接及原文本降级；模拟无 Key、联网/天气失败、上游错误/超时、网络 timedout、错误恢复均保持原行为。8 个 assistant 场景除几何外的全部记录（请求、回复、产品 ID、错误）与 S01 完全相同。方案请求仍只复用 makeupPlanApi，无第二套实现、前端主动超时或重试。
- 控制台与视觉：36 场景无 pageerror；正常场景无 console.error。assistant 的显式失败场景合计 12 条预期资源错误、2 次 timedout 失败请求；makeup-plan 合计 6 条预期资源错误、2 次 timedout 失败请求，既有脚本精确检查数量/类型/端点，storage 控制台无错误。已实际查看桌面/手机来源、桌面比较、手机方案和手机超时共 5 张截图，几何断言未发现新增横向溢出/重叠；不声称像素一致。真实 provider、真实手机、默认动效、弱网和字体加载后的排版待人工验证；ARCH-02 严格几何差异及未确认字体原因继续保留。联网/无 Key/失败为模拟，不扩充为真实外部服务验证。
- 证据保留在已忽略的 `.qa/arch-03-s02-{assistant,storage,makeup-plan}/results.json` 和截图，函数/页面对比为 `.qa/arch-03-s02-checks/{source-comparison,browser-comparison}.json`；不暂存 QA 临时文件。不读取真实 Key、环境配置、个人浏览器数据或真实用户对话；API 拦截隔离实际 provider。未改服务端、public、data、CSS、依赖、契约、AGENTS、FINAL-PROMPT、视频或比赛材料。
- 文档/版本/回退：README 当前树、测试路径/数量和实际依赖已同步；ARCH-03 唯一 current，S02 未人工验收、未暂存/提交/推送、无阶段标签。修改前基线/实际远端为 `a7222feca91c90160a69114e702a851802342e0f`，本工作树不是已建立回退点；回退范围为登记的 6 路径，形成提交后按实际 SHA/后续依赖 revert 并复验。业务 API、Hook、展示组件尚待后续小步；依据 AGENTS 13.2，先交本步人工验收，确认并形成提交后继续，不借 S01 授权提交未来改动。整阶段尚未收尾，两份累计报告届时按 12.1 同步；**无新增核验，继承上一结论。** 产品来源/图片授权 pending、存储异常抛出、无主动超时及既有公开风险均未改变。
- 人工入口：主站“小Y智能选妆”，下方自由对话和上方结构化方案。重点检查改肤质/预算后推荐及方案参数、产品比较/详情、回复/错误文本、刷新与重新开始、桌面/360px 消息和详情/来源滚动、来源新页关闭与键盘操作；无需填写 Key。未实际执行的真实设备/provider 场景保持待人工验证。
- 最终只读检查退出码 0：固定分支/已验收 HEAD、远端跟踪 0/0、空暂存区、精确 6 个路径、UTF-8/末尾换行/空白、12 阶段正文与总表一致且仅 ARCH-03 current、无 lib/api 或阶段标签、原业务断言保留；记录于 `.qa/arch-03-s02-checks/final-check.json`。首轮阶段解析漏计 ARCH-00 状态行中的历史括号说明，修正只读解析后通过，未为检查改动阶段状态。`git diff --check`、`git diff --cached --check` 和两份新 JS 的 `node --check` 均通过。文档更新后再查空白与范围，不重复已通过的业务验证。

**S02 人工验收与提交授权（2026-11-17，北京时间）**

- 项目负责人明确回复“S02 已通过，继续”，对应此前交付的 6 路径及自动验证/页面边界。按 AGENTS 13.2 授权本步在固定开发分支提交/推送后继续；不扩充为未来小步的人工验收、整阶段标签或合并 master 授权，不虚构人工设备和操作。
- 提交前重新 fetch master 和同名开发分支，HEAD/实际远端仍为 `a7222feca91c90160a69114e702a851802342e0f`，ahead/behind 0/0，起始暂存区为空，工作树精确为已交付 6 路径；公共规范仍为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 无差异，远端 README/计划公共约定已复核。
- 确认后仅同步 README 和本文的验收记录，三份现存代码/测试以 SHA-256 复核，原组件业务测试维持已验收删除状态。沿用本步相关 85/85、全量 147/147、构建及 36/36 页面证据；未改代码，不重复业务验证。提交前检查范围、UTF-8/空白、哈希和暂存内容，只提交本步 6 路径。
- 本条写入时尚未提交/推送；实际 SHA 与远端核验由回执先行给出、下次文档同步回填，不 amend。ARCH-03 仍唯一 current，后续 API/Hook/展示迁移待执行，无 `arch-stage-03`；两份累计报告在整阶段收尾按 12.1 同步。**无新增核验，继承上一结论。** 回退范围仍为本步 6 路径，形成提交后按实际 SHA/后续依赖 revert 并复验。

**S02 提交与远端核验回填（2026-11-17，北京时间）**

- 仅暂存本步 6 路径并检查暂存内容，形成提交 `42585e110e0d19a611b6565a9c79d0cb24a143c5`，推送固定开发分支后以 `git ls-remote` 核对实际远端与 HEAD 相同。代码/测试哈希保持人工验收内容，提交后工作树与暂存区为空；无阶段标签，保留此前待提交快照。

**ARCH-03-S03：小Y业务 API 迁移（2026-11-17，北京时间；实施前登记）**

- 原因与基线：请求/响应适配仍在 UI；将网络职责迁入业务模块，以便直接验证 HTTP 字段、来源/产品标记及错误边界。已验收基线为 `42585e110e0d19a611b6565a9c79d0cb24a143c5`（S02 已人工验收并推送），固定分支正确，实际远端与 HEAD 相同，ahead/behind 0/0，起始工作树/暂存区为空；已 fetch 复核公共规范 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 无差异，关联 `YAS-2026-0055`。
- 拟改路径与迁移映射：`src/components/XiaoYAssistant.jsx` 内 ASSISTANT_ENDPOINT、`requestAssistant`、会话 `requestMakeupPlan` 适配 → 新 `src/features/assistant/assistantApi.js`；新 `assistantApi.test.js` 验证请求与响应/错误，并通过已完成的 makeupPlanApi 真实函数和模拟 fetch 验证复用。同步 README 和本文，共 5 路径；原组件直接引用两项业务 API，不保留转发导出或重复 fetch。
- 保持边界：两个请求函数体原文不变；`/api/assistant`、末 8 条 role/content 历史、画像与 query 字段、来源/模式/模型默认值、产品 ID 清理、JSON/状态/错误 code 和消息原样保留。会话方案仅转换参数并调用现有 makeupPlanApi，再格式化方案；不修改该 API 或新增第二套方案请求，不引入 lib/api、超时/重试或运行时 schema。UI、状态/存储、发送时序和 catch 降级仍在组件。
- 验证计划：就近 API 契约测试覆盖正常响应/默认值/无效 ID、HTTP 失败/坏 JSON/空 answer、网络拒绝，以及方案公共 API 的调用、唯一 POST、参数/消息适配和原错误传播；运行相关 assistant/storage/makeup-plan、`npm test`、`npm run build`、`git diff --check`。复跑三份已有浏览器脚本的桌面/360px 共 36 场景，对比 S02 记录的请求/回复/产品 ID/失败披露；逐字核对迁移函数和其余组件。
- 回退范围为本步上述 5 路径；本工作树未形成提交回退点，未来经人工确认形成提交后，按实际 SHA 和后续依赖 git revert 并复验。不触碰浏览器真实存储、环境变量或外部服务。未人工验收不提交、不推送、不打阶段标签；ARCH-03 仍唯一 current，ARCH-04 及以后 pending。

**S03 自动验证与交付记录（2026-11-17，北京时间；待人工验收）**

- 实际修改为登记的 5 路径：修改 `src/components/XiaoYAssistant.jsx`、README、本文；新增 `src/features/assistant/assistantApi.js` 和 `assistantApi.test.js`。两个异步函数体及 ASSISTANT_ENDPOINT 与 S02 基线原文相同；组件仅移除这些实现和更新 import，其余状态、存储、发送/降级时序与完整 JSX 原文相同。assistantApi 用 JSDoc 引用现有 AssistantMessage/AssistantProfile，不改集中契约；无 React、存储或服务端路由依赖。
- API 直接验证：`npm test -- src/features/assistant/assistantApi.test.js`，1 文件 15/15。覆盖一次 POST、末 8 条 role/content 且不发送 UI 元数据、不修改原画像/消息、真实产品 ID 去重/三条上限和标记移除、来源原对象/模式/模型与默认值、保留 HTTP 成功的既有接纳边界、HTTP 503/504/500 消息与 code、HTTP 200/502 坏 JSON、null/缺失/空 answer，以及网络错误原对象传播/无重试。会话方案的 local/model 两种响应都经过真实 makeupPlanApi：测试 spy 原函数并执行其 fetch，断言一次共享调用/唯一 POST、完整结构化字段、原消息/产品 ID/模式；共享 HTTP 和网络错误原样抛给原组件，不在 API 伪装本地成功。
- 相关命令 `npm test -- src/features/assistant src/components/XiaoYAssistant.storage.test.jsx src/lib/storage src/features/makeup-plan`：11 文件 100/100；`npm test`：22 文件 162/162；`npm run build`：成功，2873 模块，主包 743.48 kB/gzip 225.20 kB，3D 包 1292.96 kB/gzip 355.95 kB。既有 Three.js CJS 弃用和 >500 kB 分包提示保留，不新增依赖或扩张到后续性能改造。已有 147 项测试全部保留，新 API 测试未替换任何业务断言。
- 页面复跑三份已有脚本（未改脚本）：`node tests/browser/arch03-assistant.mjs` 8/8、`node tests/browser/arch01-storage.mjs` 14/14、`node tests/browser/arch02-makeup-plan.mjs` 14/14，总计 36/36，均首轮通过。使用已有 5175 本仓库服务、同一 Playwright 模块与 Chrome 157.0.8103.52，1440×900 / 360×800、临时浏览器上下文与合成数据、reducedMotion=reduce；YAS_QA_OUTPUT_DIR 分别设为 `.qa/arch-03-s03-{assistant,storage,makeup-plan}`，其他运行环境变量沿用 S01 命令。
- 页面行为覆盖：本地硬条件/真实候选、产品比较与详情打开关闭/滚动，结构化问答/方案生成和条件调整，通用/事实请求与来源打开关闭/滚动，忙碌禁用/Enter/防重复，画像/消息刷新、20 条限制、旧迁移/旧凭据清理，画像修正后衔接会话方案、方案失败文本降级，无 Key/联网失败/上游失败/超时和恢复。小Y 8 场景除几何外全部记录（请求、回复、产品 ID、错误披露）与 S02 完全相同。两个函数体/组件其余内容静态比较和旧模块未变检查通过；无第二套方案 HTTP 实现、lib/api、超时/重试或新 schema 接纳条件。
- 错误与视觉：36 场景无 pageerror，正常场景无 console.error；assistant 显式失败场景合计 12 条预期资源错误和 2 次 timedout 失败请求，makeup-plan 合计 6 条预期资源错误和 2 次 timedout 失败请求，既有断言精确检查类型/数量/端点；storage 控制台无错误。已查看桌面/手机来源、手机方案和桌面超时 4 张截图，几何断言未见新增横向溢出/重叠，不声称像素一致。真实 provider、真实手机、默认动效、弱网与字体加载后的排版仍待人工验证，ARCH-02 的严格几何差异与未确认原因保留。联网/无 Key/上游/超时结果使用合成拦截；方案正常响应调用现有无模型规则服务，不读取或请求真实 Key/provider，也未新增前端主动超时。
- 证据保留于上述忽略目录的 results.json/截图，以及 `.qa/arch-03-s03-checks/source-comparison.json` 和 `browser-comparison.json`，不提交浏览器 QA 临时物。所有用户数据为临时上下文中的合成值，不接触真实浏览器档案、环境配置或私有会话。无服务端、public、data、CSS、依赖、contracts、storage/makeup-plan 原实现、AGENTS、FINAL-PROMPT、视频或比赛材料修改。
- 文档/门禁/回退：README 已同步实际目录、22 测试文件/162 项及依赖图，S02 的实际 SHA/远端核验已回填；ARCH-03 唯一 current，S03 未人工验收、未暂存/提交/推送、无阶段标签，HEAD/远端基线为 `42585e110e0d19a611b6565a9c79d0cb24a143c5`。当前工作树不是版本回退点，回退范围为登记的 5 路径；形成提交后按实际 SHA/依赖 revert 并复验，Git 不恢复浏览器数据、环境变量或外部服务。Hook/展示组件仍待后续小步；依据 AGENTS 13.2，先人工验收并形成提交再继续。完整阶段尚未收尾，两份累计报告届时按 12.1 同步；**无新增核验，继承上一结论。** 原存储异常、无主动超时、产品/图片 pending 与公开门禁风险继续保留。
- 人工入口与重点：主站“小Y智能选妆”，发送普通问题/产品事实/带实时词的问题，检查回答或明确失败提示与来源；本地推荐及真实详情继续可用。修改肤质/预算/场景再发送“给我完整妆容”，核对参数衔接、方案文本/失败恢复和刷新记录，检查桌面/360px 键盘及消息/来源/详情滚动。普通用户不提供 Key，未实际执行的外部服务/真实设备场景保持待人工验证。
- 最终只读交付检查退出码 0：精确 5 路径、固定分支/基线 HEAD、远端跟踪 0/0、空暂存区、规则无差异、UTF-8/末尾换行/空白、9 条本地文档链接、12 阶段正文/总表一致且 ARCH-03 唯一 current、无 lib/api/阶段标签均通过，代码/测试 SHA-256 保存在 `.qa/arch-03-s03-checks/final-check.json`。`git diff --check`、`git diff --cached --check` 及两份新 JS 的 `node --check` 均通过；追加本条后只复核文档空白与状态，不重复已通过的业务验证。

**S03 人工验收与提交授权（2026-11-17，北京时间）**

- 项目负责人明确确认“S03 已通过，提交推送后继续”，范围为此前交付的 5 路径与实际测试/页面边界；按 AGENTS 13.2 授权仅本步在固定开发分支提交/推送，不涵盖未来小步、整阶段标签或合并 master。未虚构人工设备与具体操作。
- 提交前重新 fetch master 与同名开发分支，HEAD/实际远端仍为 `42585e110e0d19a611b6565a9c79d0cb24a143c5`，ahead/behind 0/0，起始暂存区为空，工作树精确为本步 5 路径。公共规范 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`、AGENTS 无差异和远端公共约定已核对；三份代码/测试的 SHA-256 与交付检查一致。
- 确认后只同步 README 与本文的人工验收记录，沿用 API 15/15、相关 100/100、全量 162/162、构建及页面 36/36，未改代码不重复业务验证。只暂存本步 5 路径，提交前检查范围/哈希/UTF-8/空白与暂存差异；实际 SHA/远端核验由回执先给出、下次文档同步回填，不 amend。
- 本条写入时尚未提交/推送，无阶段标签，ARCH-03 保持唯一 current；Hook 与展示迁移尚未实施。完整阶段收尾时按 12.1 同步两份累计报告；**无新增核验，继承上一结论。** 回退范围仍为本步 5 路径，形成提交后按实际 SHA/后续依赖 revert 并复验。

**S03 提交与远端核验回填（2026-11-17，北京时间）**

- 只暂存本步 5 路径并检查暂存内容，提交为 `e119a44843d2604e85e467df9de5b7c80b2ee1c3`，推送固定开发分支后实际远端 SHA 与 HEAD 相同，工作树与暂存区为空。三份代码/测试维持已交付哈希，无阶段标签；此前待提交快照保留，不 amend。

**ARCH-03-S04：状态与交互流程迁移（2026-11-17，北京时间；实施前登记）**

- 原因与基线：会话状态、存储 effect、发送分支和异常恢复仍与 JSX 耦合，迁出 Hook 以直接验证状态时序与降级边界。已验收基线为 `e119a44843d2604e85e467df9de5b7c80b2ee1c3`（S03 已人工验收并推送），固定分支正确，HEAD/实际远端相同，ahead/behind 0/0，起始工作树/暂存区为空；公共规范 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82` 已 fetch 核对，AGENTS 无差异，关联 `YAS-2026-0055`。
- 拟改路径与映射：`src/components/XiaoYAssistant.jsx` 内 welcomeMessage/createMessage、7 项状态、messageEndRef、4 个 effect、profileTags、sendMessage/resetConversation → 新 `src/features/assistant/hooks/useAssistant.js`。原 `src/components/XiaoYAssistant.storage.test.jsx` → 新 `hooks/useAssistant.storage.test.js`，保留原 3 项全部断言，仅改被测 Hook 入口；新 `hooks/useAssistant.test.js` 补状态/交互边界。同步 README 和本文，共 7 路径，原存储测试删除；不留 UI 转发导出或第二份实现。
- 保持边界：Hook 仅通过已完成的 lib/storage 各公共模块读取/写入/迁移/清理，消息仍 slice(-20)，全部原状态初值/effect/发送/重置函数体原文迁移；API/意图/纯函数复用已验收模块。保持原基于 React 渲染 busy 值的重复发送保护，不新增锁、请求取消、超时、重试、状态优化或错误吞掉；JSX、DOM、quickPrompts、产品打开与全部文案原样保留。
- 验证方法：状态测试隔离 React 状态/effect 边界、使用真实 storage 和模拟业务 API，验证画像/历史快照、请求顺序、加载/重复提交、来源模式与错误优先级、方案降级、错误后恢复、重置和滚动 effect；不以自制 Hook harness 代替 DOM 验证。运行 assistant/storage/makeup-plan 相关测试、npm test、npm run build、git diff --check，并复跑既有三份浏览器脚本的桌面/360px 36 场景，对比 S03 请求/回复/产品 ID/错误。原文/存储断言/组件其余内容逐字检查。
- 回退范围为上述 7 路径；未提交工作树不是新版本回退点。人工验收形成提交后按实际 SHA 和后续依赖 git revert 并复验；Git 不恢复浏览器数据、环境变量或外部服务状态。未人工验收不提交、不推送、不打阶段标签；ARCH-03 仍唯一 current，展示组件尚未迁移，ARCH-04 及后续 pending。

**S04 自动验证与交付记录（2026-11-17，北京时间；待人工验收）**

- 实际修改精确为登记的 7 路径：修改 `src/components/XiaoYAssistant.jsx`、README 和本文；新增 `src/features/assistant/hooks/useAssistant.js`、`useAssistant.test.js`、`useAssistant.storage.test.js`；删除 `src/components/XiaoYAssistant.storage.test.jsx`。7 项 useState、ref、4 个 effect、profileTags 与发送/重置整体代码、welcomeMessage/createMessage 原文一致。组合入口只改 import 和用 Hook 返回值替换原流程，剩余 quickPrompts/展示子组件/完整 JSX 原文一致；没有复制状态逻辑或转发导出。
- 原 3 项真实存储集成测试只替换 import/初始化调用为 Hook，其余全部断言逐字保留，迁移后单独执行 `npm test -- src/features/assistant/hooks/useAssistant.storage.test.js` 为 3/3。新增 27 项状态测试使用真实 storage/意图/纯函数，仅模拟业务 API 和 React 状态/effect 边界；覆盖欢迎/输入/模式/活动初值、空输入、问候/肤质追问/真实产品推荐/比较、用户消息与画像先落地、请求取得发送前历史快照、渲染 busy 后防重复、来源与 answerMode 优先级、联网产品请求、画像修正后方案 local/model 分支、方案文本降级、外部/天气/联网/联网方案错误优先级与标点清理、失败后本地恢复、重置草稿/忙碌/未取消响应、页面内完整历史与持久化末 20 条及重新挂载恢复、稳定 ref/滚动 effect、读写清理失败继续抛出。
- 首轮 `npm test -- src/features/assistant/hooks` 为 29/30：新测试误将“底妆”推断为画像 category，实际基线 extractProfile 只有明确品类或“粉底”才设置该字段，因此“我是油皮，预算 400 元，想要柔雾通勤底妆”为无 category 的 4 项偏好。只修正新测试预期，不改规则；随后相关测试包含 Hook/存储全部 30/30 通过。原 162 项测试和有效断言保留，未以渲染冒烟替代业务测试；自制 Hook harness 不等同于真实 React/DOM，另有下述浏览器验证。
- 实际命令与结果：`npm test -- src/features/assistant src/lib/storage src/features/makeup-plan` 为 12 文件 127/127；`npm test` 为 23 文件 189/189；`npm run build` 成功，2874 模块，主包 743.78 kB/gzip 225.30 kB，3D 包 1292.96 kB/gzip 355.95 kB。已有 Three.js CJS 弃用和 >500 kB 构建提示保留，不修改依赖或提前优化后续阶段。新 3 份 JS 的 `node --check`、`git diff --check` 已通过，最终文档/范围检查随后记录。
- 页面复跑未改的三份脚本：`node tests/browser/arch03-assistant.mjs` 8/8、`node tests/browser/arch01-storage.mjs` 14/14、`node tests/browser/arch02-makeup-plan.mjs` 14/14，共 36/36，均首轮通过。沿用 S01 命令的已有 Playwright 模块/Chrome 路径和 5175 本仓库服务；YAS_QA_OUTPUT_DIR 分别指定 `.qa/arch-03-s04-{assistant,storage,makeup-plan}`。Chrome 157.0.8103.52，1440×900/360×800，临时上下文、合成数据和减少动效，不接触用户真实浏览器档案。
- 页面覆盖：本地真实候选/硬条件/比较和产品详情，结构化采集与方案生成/调整，通用/产品事实请求，来源新页打开/关闭及消息/详情滚动，刷新/重置/旧迁移/旧凭据清理与 20 条限制，忙碌禁用/Enter/防重复，画像更正后衔接方案/原文本降级，无 Key/联网/上游错误/超时及恢复。小Y 8 场景除几何外全部记录（请求、回复、产品 ID、错误）与 S03 完全一致；不以逐字代码比较代替页面结果。静态核对确认已验收 API/Utils/意图、storage 与 makeup-plan 模块无修改；Hook 只调用已完成公共入口，不直接使用 localStorage/fetch。
- 控制台/视觉：36 场景无 pageerror、正常场景无 console.error。assistant 显式失败场景总计 12 条预期资源错误/2 次 timedout 请求失败，makeup-plan 总计 6 条预期资源错误/2 次 timedout 请求失败，脚本精确检查数量/类型/端点，storage 控制台无错误。已看桌面比较/超时、手机来源/方案/原文本降级共 5 张截图，几何断言无新增横向溢出/重叠，不声称像素一致。真实手机、默认动效、弱网、字体加载后的排版、真实 provider 仍待人工验证；ARCH-02 严格几何差异与未确认原因保留。外部成功/错误/无 Key/超时使用模拟拦截，正常方案复用现有无模型规则服务；无真实 Key 读取/记录/provider 请求，不增加前端主动超时。
- 保留的行为边界：页面内消息不截断、仅存储末 20 条；状态 busy 仍来自当前 React 渲染，不增加同一旧闭包内的额外锁。重新开始仍只重置消息/画像/模式/模型，不清空草稿、busy/activity 或取消已有请求，后到响应仍能追加；存储异常仍抛出。本步按行为保持迁移而未修正这些边界，不扩张成功/取消语义。API/字段、推荐规则/产品 ID、文案/样式/来源结构/错误与方案复用不变，未实施 ARCH-04。
- 文档/隐私/版本：README 的实际树、测试分布、路径/依赖与边界已同步，S03 实际 SHA/远端核验已回填。无 AGENTS、FINAL-PROMPT、服务端、public、data、CSS、依赖、contracts、视频/比赛材料修改；产品事实/来源/图片授权 pending 和公开门禁不变。阶段尚未收尾，两份累计报告将在完整阶段按 12.1 同步；**无新增核验，继承上一结论。** 所有测试画像/消息为合成值，旧凭据仅合成标记，不读取真实 Key/环境配置/个人会话。
- 交付与回退：ARCH-03 仍唯一 current，S04 未人工验收、未暂存/提交/推送、无阶段标签，HEAD/实际远端基线为 `e119a44843d2604e85e467df9de5b7c80b2ee1c3`。未提交工作树不是新回退点，范围为本步 7 路径；人工确认形成提交后，按实际 SHA/后续依赖 revert 并复验，不恢复浏览器数据/环境变量/外部状态。依据 AGENTS 13.2，下一展示拆分小步在本步人工验收并提交后继续。证据为上述目录的 results.json/截图和 `.qa/arch-03-s04-checks/{source-comparison,browser-comparison}.json`，不提交 QA 临时物。
- 人工入口：主站“小Y智能选妆”，重点检查发送/加载/重复点击、修改画像后推荐与方案衔接、来源和详情滚动、失败后继续发送、刷新恢复/重新开始、桌面与 360px 输入/Enter/关闭操作。普通用户不填写 Key，真实设备/provider 等未实际执行场景保持待人工验证。
- 最终只读交付检查退出码 0：精确 7 路径、固定分支/基线 HEAD、远端跟踪 0/0、空暂存区、AGENTS 无差异、UTF-8/末尾换行/空白、9 条本地文档链接、12 阶段正文/总表一致且仅 ARCH-03 current、无 lib/api 或阶段标签均通过。代码/测试 SHA-256 和检查结果写入 `.qa/arch-03-s04-checks/final-check.json`；`git diff --check`、`git diff --cached --check` 与新 3 份 JS 语法检查通过。原 Hook 流程/辅助函数、剩余 JSX 和迁移存储断言的原文核对通过；追加本条后再检查文档空白/范围，不重复已通过的业务验证。

**剩余人工门禁调整与 S04 提交授权（2026-11-17，北京时间）**

- 项目负责人最新明确指示：“剩下的不用人工核验，全部尽快完成”。依据当前任务明确要求优先于仓库一般规则，取消本次 ARCH-03 的 S04 及剩余小步逐次人工验收等待；完成自动验证后直接提交/推送、同步阶段收尾并建立原计划的唯一阶段标签。此为本任务授权调整，不改公共 AGENTS，不扩张到 ARCH-04/master 合并/发布；也不将豁免描述为已经执行人工测试。
- S04 沿用已真实完成的相关 127/127、全量 189/189、构建与桌面/360px 36/36，无新增代码修改。提交前重新 fetch、核对固定分支/HEAD/实际远端 `e119a44843d2604e85e467df9de5b7c80b2ee1c3`、ahead/behind 0/0、空暂存区及精确 7 路径；公共规范仍为 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，AGENTS 无差异，无既有 arch-stage-03。确认后仅同步两份文档的授权记录，4 份代码/测试哈希须与交付结果一致。
- 按原定小步先提交/推送 S04，核对远端实际 SHA 后再拆展示组件。S04 本身不打阶段标签，ARCH-03 保持 current；完整阶段最终提交后再归档。无人工设备/操作/通过结果新增，既有未覆盖场景与风险不因豁免升级。实际 SHA 下次同步回填，保留原待人工验收快照。

**S04 提交回填与 ARCH-03-S05 实施前登记（2026-11-17，北京时间）**

- S04 依负责人取消剩余人工核验的授权提交，实际 SHA 为 `7ce13eded4261d0e2afa43df4cf2fa2ba702793f`，已推送并核对实际远端相同；暂存前四份代码/测试哈希不变，工作树/暂存区已清空。7 个文件路径在 Git 提交统计中因存储测试被识别为 rename，显示为 6 个变更条目，不是遗漏文件。无 S04 人工测试通过记录，无阶段标签。
- S05 原因/基线：原组合入口仍含消息、画像、产品和来源展示；按实际职责拆分以收敛入口，保留唯一实现。前步已验证且获负责人授权提交的基线为 `7ce13eded4261d0e2afa43df4cf2fa2ba702793f`，固定分支/实际远端一致、ahead/behind 0/0，起始工作树/暂存区为空；沿用已 fetch 的公共规范 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，关联 `YAS-2026-0055`。
- 拟改 13 路径：`src/components/XiaoYAssistant.jsx`；新 `src/features/assistant/components/AssistantMessages.jsx`、`ProfileSummary.jsx`、`AssistantProduct.jsx`、`SourceList.jsx` 及各自就近 `.test.jsx`；README、本文、`docs/stage-delivery-test-report.md`、`docs/product-data-accuracy-audit.md`。三个既有展示函数原文迁移；消息区完整 JSX 迁入 AssistantMessages，内部保留真实 ID 查询/空 ID 跳过、消息角色/加载/来源与底部 ref，原入口组合 Hook/工作台/消息/画像及输入。无额外空组件/转发入口，不变动文案/样式/数据/API/存储/业务逻辑。
- 测试与收尾：新增展示边界测试验证有效/未知产品、原对象详情回调、画像字段/缺省、来源链接与加载/角色/ref，不替换已有业务断言。运行 assistant/storage/makeup-plan 相关、npm test、npm run build、git diff --check；重跑三份既有桌面/360px 浏览器脚本并与 S04 比较请求/回复/产品 ID/错误，检查截图/控制台/溢出。全部通过后依负责人最新豁免完成阶段文档、固定分支提交/推送、唯一带注释 arch-stage-03 标签与实际远端核验，ARCH-04 保持 pending、不启动。
- 回退范围为本步 13 路径；提交前不是新版本回退点，形成提交后按实际 SHA/后续依赖 git revert 并复验，保留旧阶段证据/标签，不恢复浏览器数据或环境/外部状态。完整阶段最终状态先写入收尾提交，实际提交/标签对象在回执先给出、下次文档同步回填，不 amend。

**ARCH-03-S05 自动验证与完整阶段收尾（2026-11-17，北京时间）**

- 本步实际修改为登记的 13 路径：XiaoYAssistant 组合入口、四个展示组件及各自就近测试、README、本文和两份累计报告。消息区具有角色/加载/有效 ID/来源/ref 的实际职责，画像/产品/来源保留原展示；未新建或移动 XiaoYAssistant 入口到 feature，不增加空壳、额外 DOM 或桶式转发。assistant 业务测试已在 S01/S02/S03/S04 随职责就近迁移，本步补展示测试而不复写业务断言。
- 源码核对退出码 0：ProfileSummary、AssistantProduct、SourceList 的函数体与 S04 原文相同；完整消息 JSX 仅缩进变化，组合入口仅替换组件调用/import。Hook/API/Utils/intent、storage、makeup-plan、contracts、server、public、data、CSS 和依赖均未改。结果保存在忽略目录 .qa/arch-03-s05-checks/source-comparison.json。
- 展示边界测试首轮运行 npm test -- src/features/assistant/components，4 文件 10/10、退出码 0，覆盖消息角色/顺序/文本转义、真实/未知 ID、原产品对象详情回调、来源顺序/URL/编号/新窗口属性、画像字段/缺省/预算、加载及底部原 ref。不是仅检查成功渲染的替代测试。
- 04:07:19（北京时间）npm test -- src/features/assistant src/lib/storage src/features/makeup-plan：16 文件 137/137、526ms、退出码 0。04:07:33 npm test：27 文件 199/199、4.59s、退出码 0；保留 Three.js CommonJS 弃用提示。npm run build：2878 模块、1.94s、退出码 0，主 JS 744.35 kB / gzip 225.35 kB，3D 异步块 1292.96 kB / gzip 355.95 kB，仍有超过 500 kB 提示；不安装依赖或扩张包体优化阶段。
- 三份现有浏览器脚本依次名为 node tests/browser/arch03-assistant.mjs、arch01-storage.mjs、arch02-makeup-plan.mjs，本轮独立并行执行且退出码均为 0，分别 8/8、14/14、14/14，共 36/36。沿用已有 5175 服务与 Playwright/Chrome 157.0.8103.52，1440×900 和 360×800，deviceScaleFactor 1、reducedMotion reduce；每场景独立临时上下文，不接触用户浏览器数据。完整环境变量复跑说明见两份累计报告中的阶段技术记录。
- 实际覆盖本地推荐/结构化追问/产品事实/比较/通用/联网选择、合成来源顺序/打开/关闭/滚动、无 Key/联网失败/上游错误/HTTP504/网络 timedout 明确失败及恢复、加载/Enter 与重复操作、画像和消息刷新/旧值迁移/20 条保存/清理、小Y方案生成/画像修改衔接/文本降级、有效产品详情按钮/Escape/滚动。无 pageerror；正常场景无 console.error。显式失败场景精确出现预期资源错误，assistant 合计 12 条 console 资源错误/2 个 timedout 请求，makeup-plan 6 条/2 个失败请求，storage 0；不能将这些模拟失败写成正常场景控制台异常或零错误。
- 小Y全部非 geometry 结果与 S04 逐项相同，包括请求、回复、产品 ID、失败提示、来源；比较退出码 0。已查看桌面比较/超时、手机来源/方案/文本降级 5 图，几何断言无新增横向溢出/控件重叠。证据 .qa/arch-03-s05-{assistant,storage,makeup-plan}/results.json 与截图、.qa/arch-03-s05-checks/browser-comparison.json，全部忽略不提交。
- 自动覆盖限制：API/无 Key/联网/上游/超时均用合成响应或现有服务端 configured=false 规则生成，不代表真实网关/provider/付费调用通过；未读取真实 Key。真实手机、默认动效、弱网、字体加载后排版仍待人工验证，但负责人已免除本次等待；不声称像素一致，不抹去 ARCH-02 的严格几何差异或未经证实的字体成因。
- 行为和剩余风险：页面内消息不截断、保存末 20 条、旧凭据清理/Key/版本保持，storage 异常仍抛出；busy 仍使用当前渲染值，重置保留草稿且不取消在途响应；没有新增前端超时/重试。既有松散旧数据形状、产品/图片授权 pending/blocked、商品来源/链接政策差异及公开门禁继续保留。未改推荐硬条件/候选/ID/依据、API 地址/字段/来源/错误/降级、服务端提示词或联网策略。
- 文档与授权：README 同步实际目录、27/199 测试、引用路径和依赖边界；docs/stage-delivery-test-report.md 与 docs/product-data-accuracy-audit.md 按 12.1 追加整阶段记录，**无新增核验，继承上一结论**。AGENTS、FINAL-PROMPT、视频/比赛材料不改；不把组织迁移写成新产品能力或真实外部核验成功。负责人明确要求“剩下的不用人工核验，全部尽快完成”，作为 S04/S05 及阶段收尾授权，未新增人工执行/验收通过事实。
- 最终状态：ARCH-03 全部计划职责已迁移并完成自动验证，按本任务豁免标记 done；ARCH-00/01/02 保持 done，ARCH-04 至 ARCH-11 全部 pending，当前无 current，不自动开始下一阶段。公共规范仍为已 fetch 核对的 master 19b87df58d0f8bf3874dc8e958175c7c22ac6f82；S04 实际远端为 7ce13eded4261d0e2afa43df4cf2fa2ba702793f。
- 写入时 S05 尚未提交/推送、arch-stage-03 尚未创建，最终 SHA 尚不存在。按授权仅暂存本步 13 路径、提交并推送固定分支，再在收尾提交建立唯一带注释标签并核对远端分支 SHA、标签对象及 ^{} 指向；实际值由本次回执先行提供，下次文档同步回填，不 amend、不复用标签或强推。回退本步 13 路径用未来实际 SHA 的 git revert；整阶段回退需确认下游依赖，按 S05→S04→S03→S02→S01 顺序验证，不能保证任意单提交无冲突。Git 不恢复浏览器数据/环境变量/外部服务状态。

- S05 最终只读交付检查退出码 0：精确 13 路径、固定分支/基线 HEAD、实际远端及跟踪 0/0、空暂存区、公共 AGENTS 无差异、UTF-8/LF/末尾换行/行尾空白、11 条本地文档链接、12 阶段正文/总表一致（00–03 done、04–11 pending、无 current）、两份累计报告仅追加历史均通过，无 lib/api 或本地/远端 arch-stage-03。源码和浏览器比较已通过，代码/测试 SHA-256 保存在 .qa/arch-03-s05-checks/final-check.json；git diff --check 与 git diff --cached --check 退出码 0。追加本条后仅复核文档及范围/哈希，不重复已通过业务验证。

### ARCH-04：`lib/api`

**状态：`done`**（2026-11-17，北京时间，完整人工验收通过；归档实值见本次回执）

**允许范围**：`assistantApi.js`、`makeupPlanApi.js`、新 `lib/api/`、相关测试和文档。

**任务**：

- 抽取 `client.js`、`errors.js` 和 `endpoints.js`。
- 两个业务 API 统一使用公共 Client，业务参数和响应适配仍留在 features。
- 保持 API 地址、字段、错误消息和降级语义不变。

**边界**：不顺便改变超时、重试、限流或服务端行为。

**验收**：小Y问答和方案请求完整回归，失败路径不变；测试和构建通过。

**ARCH-04-S01：公共请求骨架与错误兼容迁移（2026-11-17，北京时间；实施前登记）**

- 启动授权：本任务初次只读检查发现 ARCH-04 仍 pending，已按负责人要求停止且未改文件。负责人随后明确回复“授权，03已经全部完成”，据此将本阶段登记为唯一 current；ARCH-00–03 保持 done，ARCH-05–11 保持 pending。此授权仅启动本阶段，不构成人工验收、提交、推送或标签授权。
- 修改前已验收基线：固定分支 `codex/frontend-contracts-yas-2026-0055`，HEAD 与 fetch 后远端同名分支均为 `bf7e2254001fe3cc1fa7619c925fb3a8a00d456c`；ahead/behind 0/0，起始工作树、未跟踪文件和暂存区均为空。ARCH-03 收尾实际远端已核对：带注释标签对象 `b8bacb242f91983b471ccd097470aca6287d5152`，`^{}` 指向上述基线；保留此前待提交快照，实际归档值在本条回填。关联 `YAS-2026-0055`，没有新增问题编号。
- 公共规范：2026-11-17 北京时间重新执行 `git fetch origin master codex/frontend-contracts-yas-2026-0055`；采用 `origin/master` 的 `19b87df58d0f8bf3874dc8e958175c7c22ac6f82`，远端 AGENTS、README 公共约定及迁移约束已读取，`git diff origin/master -- AGENTS.md` 为空。未同步无关 master 历史或改变公共规则。
- 迁移原因与事实：两个业务 API 重复 POST/Content-Type/JSON 序列化及 JSON 解析失败回退 null。两者都没有主动定时超时、AbortController、取消或重试；网络错误原对象向上抛出。小Y HTTP 错误附带原业务 code/default REQUEST_FAILED，成功无 answer 为无 code 的 Error；方案 HTTP/空 plan 按原消息抛出无 code 的 Error，不能为统一而改变这些边界。
- 拟改文件：两个业务 API 及其就近测试；新 `src/lib/api/{client,errors,endpoints}.js`、`client.test.js`、`errors.test.js`；README、本文和两份累计报告，共 13 路径。既有浏览器脚本直接复用，不计划更改组件、Hook、Utils、contracts、server、public、data、UI/样式/文案或依赖。
- 迁移映射：两枚端点常量 → endpoints；共同 POST/JSON 读取和 HTTP 检查 → client 的单一 postJson；Error 构建及有/无 code 的既有区别 → errors。具体 HTTP 错误消息/code 的选择、answer/plan 检查、来源/产品 ID 和会话方案适配仍由各 feature 负责；表单转换保留 makeupPlanUtils，意图与本地推荐不进入 lib。公共模块无业务反向依赖。
- 验证方法：在改代码前运行两个业务 API 原测试和已有小Y/方案浏览器脚本形成基线；迁移后补公共成功/HTTP/坏 JSON/解析失败/网络/超时/取消原对象传播及检查顺序测试，并运行两个业务 API 适配、assistant/makeup-plan 相关测试、`npm test`、`npm run build`、`git diff --check`。桌面 1440×900、手机 360×800 复跑同脚本，比对请求/回复/产品 ID/来源/错误/表单，检查截图/控制台/溢出；所有结果取得后追加，不预写通过。
- 回退与版本门禁：一个原子小步覆盖上述 13 路径，尚未形成新的提交回退点；人工确认并形成提交后按实际 SHA/后续依赖 `git revert` 并复验，保留 ARCH-03 标签及历史证据。Git 不恢复浏览器数据、环境变量或外部服务。当前未暂存、未提交、未推送、未创建 arch-stage-04，人工验收待进行；ARCH-04 保持 current，不进入 ARCH-05。两份累计文档先记录待验收准备，完整阶段收尾须再同步确认结果；无新增核验，继承上一结论。

**S01 实际交付与阶段收尾准备（2026-11-17，北京时间；待人工验收）**

| 原职责 | 实际迁移位置与保留边界 |
| --- | --- |
| assistantApi / makeupPlanApi 的路径常量 | lib/api/endpoints.js，仅两枚实际端点，不增加天气/第三方地址 |
| 两业务 API 重复 POST/Content-Type/JSON.stringify/JSON 读取 | lib/api/client.js 的 postJson，先 JSON.catch(null) 再 HTTP 检查，不适配业务数据 |
| Error 创建、有/无 code 的错误区别 | lib/api/errors.js 的 createApiError，保持普通 Error 原型和可选 code；不包装网络/超时/取消原对象 |
| HTTP 消息/code、answer/plan 检查 | 仍在两个 feature API；Client 调用其 HTTP 错误工厂；方案空 plan 沿用同一错误消息工厂 |
| 参数转换、产品 ID/来源/回复/降级 | 原 Utils、feature API 与 Hook 原地保持，无组件或直接调用方修改 |

- 实际修改 15 路径：原计划 13 路径加 `tests/browser/arch02-makeup-plan.mjs` 和 `tests/browser/arch03-assistant.mjs`，后两者只将一行拦截规则改为 URL pathname.startsWith('/api/')。原 glob `**/api/**` 会误拦截新 `/src/lib/api/client.js`，必须修正才能继续真实开发页面测试；方法/端点/响应/错误/几何断言均未放宽。该必要相关测试修复仍属于本步，无新增依赖或阶段扩张。
- 代码边界：两个 API 的导出与调用方路径不变，无转发层；公共模块无 features/components/contracts/data/React/storage 依赖。小Y仍只发送 query/profile/末 8 条 role-content，原来源/模式/模型默认值和 ID 过滤保持。方案仍返回原 plan 对象，成功接纳边界不变；具体消息/code/空响应检查保留原语义。没有超时定时器、signal、重试、缓存、鉴权、并发或服务端策略改变。
- 08:45:49 迁移前执行 `npm test -- src/features/assistant/assistantApi.test.js src/features/makeup-plan/makeupPlanApi.test.js`，2 文件 25/25，退出码 0。08:48:45 迁移后执行 `npm test -- src/lib/api src/features/assistant/assistantApi.test.js src/features/makeup-plan/makeupPlanApi.test.js`，4 文件 51/51（公共 19、业务 API 32），退出码 0。保留原 25 项 API 断言；新增 HTTP 优先级、有/无 code、原生 TimeoutError/AbortError 身份、JSON 读取与 HTTP 顺序、坏 JSON/JSON 读取拒绝回退 null、同步解析错误/序列化失败及 fake timers 推进 5 分钟仍无新增超时/取消/重试等针对性边界，不将虚拟计时写成真实弱网等待。
- 08:49:16 执行 `npm test -- src/lib/api src/features/assistant src/features/makeup-plan src/lib/storage`，18 文件 163/163、509ms，退出码 0；08:49:18 执行 `npm test`，29 文件 225/225、2.49s，退出码 0。原 199 项及有效断言保留，Three.js CommonJS 弃用提示仍在。`npm run build` 退出码 0，2881 模块、1.48s；主 JS 744.39 kB/gzip 225.38 kB，3D 块 1292.96 kB/gzip 355.95 kB，仍有 >500 kB 提示。未安装依赖，未改变 UI/样式或实施拆包优化。
- 页面环境与命令：原 5175 不可达，因此新启动 `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175 --strictPort`，没有停止用户服务。已有 Playwright/Chrome 157.0.8103.52，1440×900 与 360×800、deviceScaleFactor 1、reducedMotion reduce，每场景独立临时上下文；沿用下列环境分别执行 `node tests/browser/arch03-assistant.mjs` 与 `node tests/browser/arch02-makeup-plan.mjs`。正常方案复用既有 createMakeupPlanService/configured=false，其他 API 由合成路由返回，不调用付费 provider。

```powershell
$env:YAS_QA_PLAYWRIGHT_MODULE = 'file:///C:/Users/%E5%B4%94%E9%A6%A8%E7%91%9C/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
$env:YAS_QA_BROWSER_EXECUTABLE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:YAS_QA_BASE_URL = 'http://127.0.0.1:5175'
$env:YAS_QA_OUTPUT_DIR = '.qa/arch-04-s01-after-rerun-assistant'
node tests/browser/arch03-assistant.mjs
$env:YAS_QA_OUTPUT_DIR = '.qa/arch-04-s01-after-rerun-makeup-plan'
node tests/browser/arch02-makeup-plan.mjs
```

- 迁移前 8/8+14/14，退出码均为 0，证据 `.qa/arch-04-s01-before-{assistant,makeup-plan}`。迁移后首轮误拦截源模块：方案脚本在 Unexpected API call 断言处退出码 1；小Y出现两次导航定位超时后主动中断，退出码 1，无完整汇总，不能记为 0/8 完整执行。保留首轮 `.qa/arch-04-s01-after-*` 的可用截图与本条工具输出事实。仅修正上述两行测试路由后，复跑 8/8+14/14，共 22/22，退出码均为 0，证据 `.qa/arch-04-s01-after-rerun-{assistant,makeup-plan}`，未再次修改生产代码。
- 实际页面覆盖：本地推荐/比较/无需请求、通用问答/产品事实/来源顺序与新页开关/滚动；末 8 条历史和画像、加载/Enter/防重复；无 Key/联网失败/上游失败/HTTP503/504/模拟网络 timedout 的明确披露和恢复；空 answer/plan、坏 JSON、无照片生成 7 步、条件修改后重生及其他字段保留、失败保留旧方案/重试；小Y画像修正衔接方案/原文本降级，真实产品 ID/无效 ID 过滤、依据/详情按钮与 Escape/滚动。全部 22 场景无 pageerror；正常场景无 console.error。故意失败场景精确记录预期资源错误，小Y合计 12 条/2 个 timedout 请求、方案 6 条/2 个失败请求，恢复成功，不声称零资源错误。
- 行为与视觉证据：`node .qa/arch-04-s01-checks/compare-browser.mjs` 退出码 0，将两脚本全部场景除 geometry 字段外的每项记录逐项对比，均相同，保存 browser-comparison.json。已查看桌面/手机来源、桌面/手机方案结果、手机网络失败和文本降级共 6 图，原几何断言无新增横向溢出/重叠。不声称严格像素一致，保留 ARCH-02 几何差异及未证实字体成因；真实手机、默认动画、弱网和字体加载后的严格排版仍待人工验证。
- 真实本地代理冒烟：保留 5175 前端与 8787 无 Key 测试网关供人工体验；临时进程禁用 dotenv 文件加载并显式空 Key，不读私有 .env、不改配置文件。`node .qa/arch-04-s01-checks/smoke.mjs` 最终退出码 0：health ok=true/assistant=false；普通问答 503/PROVIDER_NOT_CONFIGURED、原消息“智能服务暂未配置，请使用站内推荐或稍后再试。”；方案 200/sourceMode=local/7 步/photoEnabled=false。首次临时冒烟误按合成响应期待 AI_NOT_CONFIGURED，实际服务端原码为 PROVIDER_NOT_CONFIGURED，断言失败并伴随 Windows Node 清理断言；核对 app.cjs/原测试后仅改临时预期，复跑通过，不修改服务端或前端映射。此为健康/无 Key/方案正常代理冒烟，不扩大为真实 provider/真实联网/实际上游失败页面验证。
- 文档/审计/隐私：README 同步当前结构、依赖与受影响路径；两份累计报告追加本阶段待验收准备和 ARCH-03 实际归档回填，**无新增核验，继承上一结论**。没有产品、价格、图片、来源、评分或授权变化，pending/blocked/链接政策差异与公开门禁保留。测试只用合成画像/对话/来源，未新增照片、上传、存储范围、日志或第三方调用；AGENTS/FINAL-PROMPT、服务端/public/data/组件/Hook/Utils/CSS/依赖/视频与比赛材料未改。
- 人工入口与剩余门禁：主站“小Y智能选妆”，上方工作台、下方对话。重点检查无照片成功/改条件重生、来源及详情打开关闭、失败后恢复、桌面/360px 加载与操作。真实付费 provider/真实联网仍待人工验证，不要求普通用户输入 Key。当前无人工确认人/日期/通过结果，ARCH-04 仍唯一 current；未暂存、未提交、未推送、未创建 arch-stage-04，修改后 SHA 不存在，ARCH-05 未启动。实际范围及回退扩大到上述 15 路径；完整收尾需人工确认后再同步两份报告、提交/推送和标签核验，当前工作树不是新的 Git 回退点。
- 最终只读检查：`node .qa/arch-04-s01-checks/final-check.mjs` 退出码 0，精确 15 文件、固定分支/基线/远端跟踪 0/0、空暂存区、公共规则无差异、UTF-8/末尾换行/无行尾空白、11 条本地文档链接、12 阶段正文/总表一致且仅 ARCH-04 current、两份报告只追加历史、公共依赖边界/端点/原调用方、两浏览器脚本仅一行匹配修正及 22 场景对比均通过。全部 11 个变更 JS/MJS 语法、`git diff --check`、`git diff --cached --check` 退出码 0；证据和各文件 SHA-256 保存在忽略目录 checks/final-check.json。交付前再次只读查询实际远端，开发分支仍为 bf7e225，ARCH-03 对象/指向一致，无 arch-stage-04；此后仅补文档并复核范围/空白，不重复已通过业务验证。

**整阶段统一交付（2026-11-17，北京时间）**

- 负责人补充“把全部的完成我再核验”，据此一次性交付本次 ARCH-04 全部开发内容；不是启动 ARCH-05 或免除最终人工验收的指令。三个公共模块、两个 API 接入、业务适配和错误兼容测试、两视口成功/失败/降级回归、README 及两份累计报告均已纳入 S01，没有尚待实施的 ARCH-04 后续小步。现有代码/测试保持已验证内容，本次只澄清虚拟计时证据及整阶段交付状态，不扩大验证结论。
- ARCH-04 保持唯一 current，等待负责人对本阶段完整 15 文件统一核验；未暂存、未提交、未推送、未打标签。核验通过后的版本归档和最终状态更新仍待该明确确认。无新增核验，继承上一结论；真实 provider/真机等未执行项与历史风险按上文保留。

**ARCH-04-S01 人工验收与完整阶段收尾（2026-11-17，北京时间）**

- 项目负责人在完整 15 文件统一交付后明确回复“人工核验完毕”，据 AGENTS.md 13.2 记为本步及完整 ARCH-04 人工验收通过，并构成固定开发分支提交、推送与阶段标签归档的授权。不虚构负责人所用设备、逐项操作或真实 provider 测试结果；前述 current/待验收/未提交记录保留为当时快照。
- 验收后复核：分支仍为 codex/frontend-contracts-yas-2026-0055，HEAD、fetch 后同名远端与修改前已验收基线仍为 bf7e2254001fe3cc1fa7619c925fb3a8a00d456c，ahead/behind 0/0，暂存区起始为空；再次读取远端公共约定，规范 master 仍为 19b87df58d0f8bf3874dc8e958175c7c22ac6f82，AGENTS 副本无差异；本地和远端均无 arch-stage-04。未切换分支、清理用户修改或同步无关 master 历史。
- 确认后仅更新 README、本文、阶段交付报告及产品数据审计四份文档的人工确认/最终状态。验收快照保存在忽略目录 .qa/arch-04-s01-checks/accepted-snapshot.json，11 个代码/测试文件 SHA-256 必须逐一与快照一致；提交范围仍为同一小步的完整 15 路径，不添加后续阶段或新的实质改动。
- 沿用本步实际取得的公共/API 51/51、相关 163/163、全量 225/225、生产构建 2881 模块、两视口 22/22 及真实无 Key 代理冒烟结果；本轮只验证文档、范围、哈希、链接、阶段状态和 Git 空白，不声称重跑整套功能测试。首轮浏览器拦截失败、临时冒烟错误预期及 Windows 清理断言、既有几何差异/字体成因未确认、Three.js 弃用/大分包风险和真实 provider/真机/默认动画/弱网/严格排版覆盖限制全部保留；人工验收不把未执行场景补记为已测试。
- 两份累计报告按 12.1 同步，**本阶段无新增核验，继承上一条结论。** 未改产品事实、价格、图片、评分、来源、授权或链接政策状态，pending/blocked 与公开门禁不升级；没有新增上传、保存范围、真实用户数据或第三方凭据处理。AGENTS/FINAL-PROMPT、视频及比赛材料未改。
- ARCH-04 更新为 done，ARCH-00–03 仍 done，ARCH-05–11 全部 pending，当前无 current；本次不启动 ARCH-05、不合并 master。写入时新提交 SHA 尚未产生、尚未推送/建立标签；依授权先提交上述 15 文件、推送并核对实际分支 SHA，再在同一收尾提交建立唯一带注释 arch-stage-04、推送并核对标签对象及 ^{} 指向。实际 SHA/标签由本次归档回执先行报告、下次文档同步回填，不 amend 自引用或虚构远端状态；远端匹配后才称已归档。
- 回退范围为本 S01 的完整 15 路径，形成提交后按实际 SHA 和下游依赖使用 git revert 并重新验证；保留全部失败/审计记录及既有标签，不强推或移动标签。Git 不恢复浏览器本地数据、环境变量或外部服务状态。

- 验收后提交前只读检查：node .qa/arch-04-s01-checks/acceptance-check.mjs 退出码 0，精确 15 路径、11 个代码/测试文件与验收快照 SHA-256 一致、11 条本地文档链接、UTF-8/换行/行尾空白、两份报告只追加、12 阶段正文/总表一致（00–04 done、05–11 pending、无 current）、公共依赖/端点边界、22 场景非几何比较与 11 文件语法检查均通过；git diff --check 与 git diff --cached --check 退出码 0。最新实际远端查询确认开发分支 bf7e225、master 19b87df、无 arch-stage-04；一次普通沙箱查询因 schannel 凭据通道失败，使用允许的网络权限复核成功，未改变凭据或远端状态。补本条后再核对文档/范围/哈希/空白；暂存后另核对索引精确范围及内容，不重复已通过业务测试。

### ARCH-05：`makeup-table`

**状态：`done`**（2026-11-17 项目负责人对整阶段明确回复“人工验证通过”；Git归档结果按真实回执记录）

**允许范围**：2D/3D 化妆台组件、对应 CSS 与测试、`makeup-table-3d/`、直接引用方和文档。

**任务**：

- 迁入 `features/makeup-table/`，保持内部 Three.js 模块边界。
- 以 `MakeupTableExperience` 作为对外入口，封装 3D、2D 和失败回退。
- 保持懒加载、性能档位、减少动效和资源路径不变。

**验收**：3D 加载、WebGL 不可用的 2D 回退、减少动效、跳过和资源加载行为不变；桌面与手机回归通过。

**执行记录**：2026-11-17（北京时间），负责人确认将本阶段由 pending 改为唯一 current；仅指定下一阶段，尚未实施。需先完成本次 master 切换的整体人工验收、提交/推送和分支归档，再开始本阶段代码工作。后续整阶段完成后一次性交人工验收，不再逐小步等待。

**2026-11-17 10:23（北京时间）ARCH-05 启动记录，关联 YAS-2026-0055**

- 当前任务明确授权在 master 连续完成整个 ARCH-05，最后统一交人工验收；ARCH-06～11 保持 pending，不开始实现。不新建问题编号或小步编号，不提交、推送、打标签或删除分支。
- 修改前已验收基线、HEAD、fetch 后 origin/master 与实际远端均为 `3b7ceee79576d8d38ff3821d1d688914d49c2f18`，ahead/behind 0/0，起始工作树、未跟踪文件与暂存区为空。2026-11-17 10:21 实际查询确认原开发分支本地/远端已删除，arch-stage-00～04 的对象与提交指向仍为第 1 节原值，无 arch-stage-05。前次分支切换的纯文档归档 SHA 在此回填；普通合并及原阶段历史保留。
- 已完整阅读 AGENTS、FINAL-PROMPT、README、本文，读取 ARCH-00 映射、两份累计报告与相关源文件/测试。普通沙箱 fetch 被 `.git/FETCH_HEAD` 写权限阻止、ls-remote 遇 Windows schannel 凭据通道失败；使用允许的命令权限重试均成功，未改凭据、配置或工作树。
- 范围与依赖：原 2D 组件/CSS/测试迁入 `features/makeup-table/components/`；原 3D 的状态、检测、时序、SceneErrorBoundary 和 2D fallback 进入 `MakeupTableExperience.jsx`，场景展示 JSX 留在 `MakeupTable3D.jsx`；内部八文件（含 GhostCursor.css）整体迁入 `features/makeup-table/makeup-table-3d/`。App/HomeView 仅使用 lazy Experience，原 Suspense 占位不变。旧实现/转发/空目录不保留；README 与本文及两份报告同步。
- 迁移前实跑：相关 3 文件 11/11、全量 29 文件 225/225、构建 2881 模块通过；Three.js CJS 弃用及 >500 kB 分包提示保留。先用新独立浏览器脚本建立两视口页面基线，实际结果在后续追加，不以常量测试冒充真实 WebGL。
- 既有缺口：lazy 模块下载拒绝发生于运行边界加载之前，原化妆台没有专门捕获，能造成根视图卸载；与 Scene 运行错误、6 秒未就绪回退分开测试并保留，不在目录迁移中新增失败行为。2D 关闭的焦点 RAF、妆具 hover 的 body cursor 等清理边界按基线保留，不据代码搬迁宣称所有异常均已解决。
- 回退范围：上述化妆台/内部模块、App 的直接装配、相关测试和四份文档。现有基线为 3b7ceee / arch-stage-04（后者在原 ARCH-04 收尾提交），未提交现场不是新版本恢复点；人工验收后才按实际提交及下游依赖评估 revert，不自动丢弃或暂存。
- **本阶段无新增核验，继承上一条结论。** 不改产品、服务端、public、依赖、API、推荐、存储 Key、隐私处理、视频或比赛材料；授权待核验、来源/链接政策差异与公开门禁保留。

**2026-11-17（北京时间）ARCH-05 整阶段交付：待人工验收**

| 迁移前 | 当前实际位置 / 职责 |
| --- | --- |
| src/components/MakeupTable.jsx、MakeupTable.css、MakeupTable.test.js | src/features/makeup-table/components/ 下同名三文件；只调整产品数据相对引用 |
| src/components/MakeupTable3D.jsx 的能力/错误/状态/effect/2D 回退 | components/MakeupTableExperience.jsx；原函数体、effect 依赖、时序和回调语义保留 |
| 同文件 3D section JSX、GHOST_PARTICLES | components/MakeupTable3D.jsx；无新增 DOM，保留 Scene、GhostCursor、工具、轨道、加载和说明 |
| src/components/MakeupTable3D.css、MakeupTable3D.test.js | components/ 下同名两文件；原测试断言不变，常量改从 Experience 导入 |
| src/components/makeup-table-3d/Scene.jsx、CosmeticItem.jsx、DressingTable.jsx、ParticleBurst.jsx | makeup-table-3d/ 下同名四文件，字节不变 |
| 同目录 GhostCursor.jsx、GhostCursor.css、cosmetics.js、performance-profile.js | makeup-table-3d/ 下同名四文件，字节不变 |
| App 内 HomeView 的 lazy MakeupTable/Suspense | 仅改 lazy 指向 Experience 与使用名称；占位、props、openingReady 和页面结构不变 |
| 原缺少化妆台页面行为测试 | tests/browser/arch05-makeup-table.mjs；已有 Playwright/Chrome，无新依赖 |

以上 components/ 与 makeup-table-3d/ 目标前缀均为 src/features/makeup-table/。原 14 文件迁为 15 个实际 feature 文件，旧路径/重复实现/转发/空目录均不存在。README 当前树、依赖、CSS 与第三方 GhostCursor 源码路径已同步；ARCH-00 清单保持归档时历史，不反写旧行号。

- 验证：迁移前相关 3 文件11/11（10:23）、全量29文件225/225（10:24）、构建2881模块；迁移后相关11/11（10:35）、全量225/225（10:46）、构建2882模块，退出码均0。新脚本为独立浏览器回归，不计入Vitest。主JS从744.39→744.42kB，Three.js仍在异步Experience块1293.47kB（原1292.96kB），CSS19.04kB内容不变；原CJS弃用/>500kB提示保留。
- 源码比对：node .qa/arch-05-checks/compare-source.mjs 退出码0；8内部文件和3CSS原字节相同；2D仅改import；原两测试断言不变；Experience的检测、状态/effect/回调与原文一致，3D展示仅参数改名；App仅两处引用变化。不是用静态相同替代浏览器交互。
- 浏览器：node tests/browser/arch05-makeup-table.mjs，在Chrome157.0.8103.52、1440×900/360×800、独立临时上下文运行，不读真实档案/凭据，不调用API/provider。迁移前真实工作树最终14/14，迁移后14/14；补在途取消、开幕前不挂载和6秒实际等待后，迁移前原字节快照参考服务5193与迁移后5192各16/16。参考服务是忽略目录中的Vite内存load插件，消费before.json中与3b7ceee一致的原源码，无分支恢复/工作树覆盖；独立缓存，不改变生产配置。
- 真实场景与模拟区分：实际Canvas报告ANGLE Intel UHD Graphics/D3D11，正常开幕及跳过、自动花瓣展开、恢复/拖动视角、轨道进入腮红产品库、切页/重进均运行真实场景；减少动效/低性能档实跑，2D用getContext返回null模拟WebGL不可用并验证最多5产品、详情/Escape/焦点恢复/查看全部。运行错误通过只替换Scene抛错，未就绪通过只替换Scene不调用onReady，实际等待约6秒才回退；这两例不是GPU故障实测。lazy模块拒绝另用route.abort复现，根视图卸载的基线缺口保持；不是2D回退成功。
- 清理：真实桌面普通动效收拢后记录光标启用，离开首页后本测试跟踪的计时器/RAF/监听/Observer/光标WebGL资源为0；360px无光标。补未就绪中途离开验证在途定时器清除，重新进入可再次自动展开。R3F卸载画布验证、8内部文件原字节和既有GSAP/资源释放保留；不据此宣称穷尽所有GPU驱动/内存泄漏或修复基线2D焦点RAF/hover光标边界。
- 首轮失败与修正：浏览器脚本3/14；拖动点落在妆具而导航，详情关闭和首页按钮名称/粉底数量预期错误，Scene模拟错误使用了Vite CJS模块的命名导入，另有外部字体拒绝。仅修测试：空白处拖动、真实可访问名称、以受控数据计数、复用同一个React默认导出、按域名独立记录外部字体失败并继续拒绝任一本地失败；第二轮10/14仍是轨道按钮名与21款计数，修后14/14。生产代码迁移在真实基线14/14之后才执行；全部原失败JSON/截图保留，未放宽业务断言或修改产品数据。
- 控制台/资源：正常本地路径无pageerror、无HTTP资源失败；fonts.googleapis.com有ERR_NETWORK_ACCESS_DENIED，按具体URL保留，不称零资源错误。模拟Scene抛错包含React预期错误及原warn；下载拒绝包含预期ERR_FAILED及未处理动态导入pageerror。未增加真实断网恢复能力。无新增静态URL/模型/贴图/许可变化，public/服务端/data/API/存储Key/依赖/其他feature未改。
- 页面截图/结果、等待计时和清理统计保存在忽略目录.qa/arch-05-{before,before-rerun,before-final,after,after-final,reference-final}/；源码比对/before快照在.qa/arch-05-checks/。已经查看真实桌面/手机展开、桌面收拢与手机2D面板；补充动效结束取景证据及最终核对在下条追加。不声称像素一致或真实触摸设备已通过。
- 两份累计报告按12.1同步。**本阶段无新增核验，继承上一条结论。** 产品价格/评分/图片/来源/授权pending/blocked、链接政策差异、公开门禁均不升级；没有新照片/上传/保存/日志/第三方处理，视频/比赛材料未改。真实手机/触摸、其他GPU/驱动、严格字体排版及实际生产CDN断网恢复未验证，原缺口与历史风险保留。
- 当前分支master，HEAD/已核验远端仍为3b7ceee79576d8d38ff3821d1d688914d49c2f18；暂存区为空，本次范围仅未暂存现场。ARCH-05保持唯一current、交付待人工验收、人工确认人/日期/结果尚无；06～11 pending。未提交、未推送、未创建arch-stage-05或删除分支，无修改后SHA。负责人对整阶段明确回复“人工验证通过”后，再追加真实确认/收尾、05 done/06唯一current，复核fetch/远端及范围，在master按规定格式提交正常推送，并在最终状态提交建立唯一带注释arch-stage-05核对对象/提交指向；标签已存在则报告不移动。只指定ARCH-06，不实施。回退范围为本阶段上述源码/测试和四份文档，形成提交后再按依赖revert；未提交现场不是恢复点。

**2026-11-17 10:57（北京时间）ARCH-05 补充对照与交付前核验**

- 最终等待原GSAP结束再取景，`.qa/arch-05-reference-settled/` 与 `.qa/arch-05-after-settled/` 各16/16；已查看桌面收拢、手机展开和桌面未就绪回退等补充截图。`node .qa/arch-05-checks/compare-browser.mjs` 记录操作/状态/回调/清理等非时钟尺寸证据一致，记录的控件布局一致，但严格初次canvas缓冲高度为桌面717→718、手机558→557，各差1px。原严格比较失败保留，诊断结果strictGeometryEqual=false，不改视觉参数或声称像素一致。
- 为判断该差异是否由迁移引入，仅在忽略目录运行 `diagnose-canvas-size.mjs`，两版本×两视口×2次，共8次真实Canvas测量。迁移后同一桌面代码出现717和718两种缓冲高度、客户端均718；原版本也出现717，进入动画期间可读到717.9999389648438。手机迁移后原558/557差异在补测中均为558；两版本稳定客户端均558。既有react-use-measure读取getBoundingClientRect、Three.js对尺寸×DPR向下取整与记录相符；证据支持既有小数测量/取整波动，未发现新的CSS布局变化，但不把该解释扩大为严格像素验收通过。诊断脚本不改生产代码，也不作为新增的正式行为测试。
- 最终普通动效两视口的Google字体失败前后各1条；其他正常本地请求无失败。场景抛错与lazy下载失败的预期日志及未捕获缺口保持。真实手机/触摸、其他GPU、穷尽内存、外部字体成功后的严格排版及生产CDN断网恢复仍未验证。
- 10:56再次fetch及实际ls-remote核对：master/HEAD/origin/master均3b7ceee79576d8d38ff3821d1d688914d49c2f18，ahead/behind0/0；旧分支本地/远端仍不存在，arch-stage-00～04原对象和提交不变，无arch-stage-05。当前35原始变更路径均为本阶段、暂存区空；没有提交/推送/标签/删除操作。两份累计报告已追加ARCH-05启动/迁移/验证/风险/验收计划并回填前次归档SHA；**本阶段无新增核验，继承上一条结论。** 最终文档/范围/空白核对随后追加真实结果，ARCH-05仍唯一current、待人工验收。

**2026-11-17 11:00（北京时间）ARCH-05 最终自动核对**

- `node .qa/arch-05-checks/verify-final.mjs` 退出码0：35原始变更路径/15实际feature文件均符合范围，工作树修改全部未暂存；两报告在原文后追加、ARCH-00～04正文不变、ARCH-06～11正文不变、12阶段表/正文唯一ARCH-05 current。README树118实际路径、9条Markdown本地链接/锚点、feature相对import有效，29个Vitest文件保留。原五标签对象/提交及旧分支缺席再核对，无arch-stage-05。
- `node .qa/arch-05-checks/compare-source.mjs` 再次退出码0；`node --check tests/browser/arch05-makeup-table.mjs`、`git diff --check`、空暂存区的`git diff --cached --check`退出码均0；新未跟踪文件另经逐行空白/UTF-8/结尾换行核对，避免把Git未覆盖的新文件遗漏。src/tests/README引用扫描只剩新feature入口，无旧运行引用或空目录。最终追加此条后再次核对文档和空白。
- 自10:46全量225/225与构建后未改变生产源码或正式浏览器脚本，沿用真实结果，不虚构重复执行；8次补充尺寸诊断仅在忽略目录。最终证据为`.qa/arch-05-checks/final-verification.json`等，临时物不提交。人工入口5192保留，参考快照5193检查结束后停止，不改产品运行方式。
- ARCH-05保持唯一current/待人工验收，06～11pending；未暂存、未提交、未推送、未创建标签或删除分支。**本阶段无新增核验，继承上一条结论。** 人工通过后的提交/推送/唯一注释标签计划及未执行检查保持上述记录，不启动下一阶段。

**2026-11-17（北京时间）ARCH-05整阶段人工验收通过与收尾记录，关联YAS-2026-0055**

- 人工确认：项目负责人在本次交付后明确回复原话“人工验证通过”，确认范围为本阶段35原始变更路径（14旧文件删除、15新feature文件、App、独立浏览器脚本和四文档）。立即将ARCH-05改为done、ARCH-06改为唯一current，07～11仍pending；不是ARCH-06实施授权，本次未开始后续代码工作。
- 验收后11:18 fetch/实际ls-remote核对master仍为3b7ceee79576d8d38ff3821d1d688914d49c2f18，ahead/behind0/0、索引空、35路径均为已验收现场；原开发分支不存在，arch-stage-00～04原对象和提交不变，无arch-stage-05。verify-final与源码对照再次通过，未发现外来修改。
- 本轮只修改README和本计划的当前状态，追加两份累计报告的真实人工确认/收尾；17个已验收代码/测试文件保持内容不变。沿用本次相关11/11、全量225/225、build2882模块及最终前后浏览器各16/16的实跑结果，不声称验收后重跑；文档/路径/状态、工作树与暂存区空白及已验收内容hash在提交前复核。
- 人工确认不扩大真实GPU/手机/像素等自动证据：lazy下载拒绝造成根卸载的既有缺口未修复，1px严格比较未通过和尺寸波动诊断、Google字体拒绝、真实手机/其他GPU/穷尽内存/生产下载恢复未执行项保留。产品数据、来源、授权和隐私边界不变；**本阶段无新增核验，继承上一条结论。** 视频/比赛材料未改，README只更新实际目录和阶段状态。
- 此确认按本次任务第八部分授权已验收范围在master提交、正常推送和唯一带注释arch-stage-05归档。拟以一个可构建回退的清晰提交包含代码、最终状态、人工确认和收尾记录；提交信息遵循“【问题】[ARCH-05][YAS-2026-0055] … 【修改】…”。只显式暂存35路径，不纳入.qa/dist/依赖/凭据/用户数据；正常推送后查询实际远端SHA匹配，再确认05标签不存在，建立/推送标签并核对对象及实际提交。已存在则报告，不移动/覆盖/复用。
- 本条写入时尚未产生本阶段提交SHA/标签对象、尚未推送；实际结果取得后在交付回执给出，下次文档同步回填，不通过amend/强推制造自引用。原历史、失败、标签和回退依据全部保留；若收尾验证或远端状态异常先停留报告，不先上传修补。形成归档后按真实提交及后续依赖评估revert，不承诺任意提交可无冲突单独撤销；Git不恢复本地浏览器数据/环境变量/外部状态。不删除分支，不实施ARCH-06。

**2026-11-17 11:24（北京时间）验收后提交范围核对**

- `verify-acceptance.mjs`退出码0：ARCH-05 done/ARCH-06唯一current、12阶段状态一致，17个已验收源码测试hash未变；README118树路径/9条本地链接、相对import、29测试文件、原五标签和原阶段历史核对通过，两报告保留验收前全部证据并只追加。
- 依明确授权显式枚举暂存35原始路径；Git识别迁移后显示22条文件变更，不是范围减少。`verify-index.mjs`确认索引恰为35原始路径、无未暂存或未跟踪文件、17个已验收hash不变，`git diff --cached --check`和`git diff --check`均退出码0；源码对照和正式浏览器脚本语法检查亦通过。追加本条后只重新暂存三份记录文档并再次核对，不修改已验收实现或数据。
- 一个阶段提交将同时包含最终done/current状态、真实人工确认和上述收尾记录；本条写入时仍未提交/推送/创建标签，实际SHA、远端及唯一注释标签结果在取得后以回执提供并于下次同步回填，禁止自引用改写。只登记下一阶段，不实施ARCH-06。

### ARCH-06：`catalog`

**状态：`done`**（2026-11-17 项目负责人明确回复“人工验收通过 继续”；提交/推送和唯一阶段标签的真实结果由收尾回执提供，下次同步回填）

**允许范围**：App 中产品筛选和展示代码、新 `features/catalog/`、直接引用方、相关测试和文档。

**任务顺序**：

1. 抽取文本匹配、筛选和排序纯函数。
2. 建立 `catalogService.js`，统一产品读取和按 ID 查询。
3. 抽取产品卡、筛选面板、产品详情和详情抽屉。
4. 抽取 `useCatalog.js` 管理筛选与排序状态。

**边界**：产品事实仍只来自 `src/data/`，不改筛选结果、详情字段或产品深链接语义。

**验收**：搜索、筛选、排序、产品详情、深链接和打开关闭行为不变；测试、构建和视口回归通过。

**执行记录**：2026-11-17（北京时间），ARCH-05整阶段人工验收通过后指定为唯一current；本次仅登记下一阶段，未开展catalog迁移、未创建相关feature或测试，不因current推定已获本阶段实施授权。开始下一任务前先定位ARCH-05实际归档提交/标签并按AGENTS 13.3重新核对。

**2026-11-17（北京时间）ARCH-06 启动与整阶段交付，关联 YAS-2026-0055**

- 当前附件明确授权整个ARCH-06，在master实施并统一交人工验收；不新增问题或小步编号。11:38 fetch完成并只读核对：master HEAD、origin/master、实际远端均 bf988460ae8c9611eaae21adb02a34c3bfc53fa1，ahead/behind 0/0，初始工作树/暂存区/未跟踪文件为空。ARCH-05原“人工验证通过”记录及最终提交可定位，arch-stage-05 本地/远端对象 11b0d3e419b1fe642e3ed650fb07b9fc4ab9ceba、^{} 指向上述提交；这是上次收尾真实结果回填。12:19实际远端复核相同且无arch-stage-06。普通沙箱fetch因FETCH_HEAD写权限、ls-remote因schannel凭据通道失败，允许的同命令权限重试成功；未改凭据或Git配置。
- 先建立测试/构建和真实页面基线再迁移。最终范围为App、下表8个源码、4个就近测试、tests/browser/arch06-catalog.mjs及README/本文/两报告，共18路径。数据文件仍是唯一事实源；App保留导航/历史/详情打开关闭与收藏共享逻辑，不导出或复制StatusControl到catalog。

| 修改前 App.jsx 职责 | 实际目标 / 消费方 | 原有保障及补测 |
| --- | --- | --- |
| :60 toggleArrayValue、:64 containsText、:72 productMatches、:178 排序 | src/features/catalog/catalogUtils.js；useCatalog 消费 | 原来无直接测试；新增 catalogUtils.test.js，21 项，保留搜索字段、大小写/空白、组内 OR/组间 AND、边界/空值、排序/稳定 ties |
| :90 productById、页面产品数组读取 | src/features/catalog/catalogService.js；App 导航/Home/Favorites、LibraryView、ProductDetailDrawer 消费 | 新增 catalogService.test.js 2 项，原数组和每个稳定 ID 对象引用相同，严格匹配/未知 ID 返回 null；不复制数据或增加运行时 schema |
| :106 filters、:107 sort、:111 filterPanelOpen、:178 结果、:191 updateFilter/clearFilters | src/features/catalog/hooks/useCatalog.js；App 保留搜索/快捷/品类到导航的连接 | 新增 hooks/useCatalog.test.js 4 项；初值、更新、清空不关闭面板、搜索保留条件、快捷替换条件但保留 sort |
| :496 LibraryView、:542 SortSelect、:722 EmptyResults | src/features/catalog/components/LibraryView.jsx；小型子组件仍同文件 | components/catalogComponents.test.jsx 中业务回调与空态断言；真实浏览器搜索/四排序/无结果 |
| :521 FilterPanel、:538 FilterGroup | src/features/catalog/components/FilterPanel.jsx；LibraryView 消费 | 全部选项、scalar/multiple 回调、清空/关闭/遮罩；两视口每组35单项筛选、组合与恢复 |
| :546 ProductCard | src/features/catalog/components/ProductCard.jsx；LibraryView 和 App 内首页静态回退复用 | 原产品对象打开、收藏稳定 ID、图片失败、色块/编辑评分边界；原 JSX 原样迁入 |
| :565 ProductProfileView、:638 ParameterRow | src/features/catalog/components/ProductProfile.jsx；App 产品页消费 | 原购买 gate、reviewedFacts、解读/来源/删除入口、返回；App 通过 statusControl 节点传原收藏控件 |
| :642 DetailDrawer、:671 Metric | src/features/catalog/components/ProductDetailDrawer.jsx；App 所有产品详情回调消费 | 原色号初始化/effect、遮罩事件、详情/完整资料/相似产品次序；同一 statusControl 插槽保留原收藏控件 |


| 命令 / 检查 | 迁移前实际结果 | 迁移后实际结果 |
| --- | --- | --- |
| npm test -- src/data/product-verification.test.js src/data/home-featured.test.js src/lib/navigation-history.test.js | 11:41，3 文件 12/12，退出码0 | 相关命令包含原三文件，原断言保留 |
| npm test -- src/features/catalog src/data/product-verification.test.js src/data/home-featured.test.js src/lib/navigation-history.test.js | 迁移前尚无 catalog 测试 | 12:15:23，7 文件46/46，451ms，退出码0 |
| npm test | 11:41:05，29 文件225/225，2.30s | 12:16:00，33 文件259/259，2.12s，退出码0 |
| npm run build | 2882 模块，1.79s；主JS744.42kB，3D1293.47kB | 2890 模块，1.78s；主JS745.05kB/gzip226.55kB，3D1293.47kB；退出码0 |
| node tests/browser/arch06-catalog.mjs | 最终14/14；.qa/arch-06-before-final/results.json | 14/14；.qa/arch-06-after/results.json；退出码0 |
| PowerShell 内联 Node 前后 evidence 逐项递归比较 | 同一数据/脚本/视口的真实迁移前页面 | differences=[]，14组全部相同，退出码0；保存 .qa/arch-06-checks/browser-compare.json |
| node .qa/arch-06-checks/verify-source.mjs | before.json 保存原源码/文档 | 原函数/组件主体、导航/收藏/其他页面核对通过；6个新JS和1个MJS逐个 node --check，通过，退出码0 |
| git diff --check、git diff --cached --check | 初始工作树/索引干净 | 最终文档同步后核对，真实结果见后续最终核对记录 |


Chrome 157.0.8103.52，1440×900 与 360×800，deviceScaleFactor=1、reducedMotion=reduce，每场景独立临时浏览器上下文，无真实用户档案。每视口7组共14组：搜索/排序、筛选、抽屉/历史/收藏、直接深链接、首页/指南入口、图片失败、空目录。每组包含多次真实交互；14不是全部点击次数，也不计入259项Vitest。

- 主导航真实入口；6种搜索（大小写品牌、空白、色号、场景、品类、不存在）和清空恢复；全部4种排序，并用键盘切换排序。
- 每视口35个单项筛选（含每品类、肤质、妆效、遮瑕、持妆、氧化、地区、价格），逐个选择/取消；双肤质加妆效/价格组合，跨页返回保留条件；移动筛选关闭按钮、Escape和遮罩关闭。
- 全目录按产品名称映射原稳定ID并核对完整有序结果；首款真实 estee-lauder-double-wear 的详情、第二色号选择、相似商品打开和色号重置、完整资料、关闭按钮/返回按钮/Escape、桌面遮罩关闭；抽屉实际内部滚动桌面1048px/手机1647px，记录字段/URL/history.state/焦点/滚动和节点尺寸。
- 产品深链接直接进入、刷新字段不变、返回；抽屉刷新恢复；收藏“想买→正在用”、跨页/详情/完整资料共享、刷新恢复及移除，仍使用 base-archive-collection 原始对象。首页搜索、6个快捷筛选、指南肤质筛选、首页编辑精选打开同一目录商品，均从真实入口操作。
- 图片失败仅在测试中拒绝封面请求，验证原“图片暂不可用”；空目录仅拦截开发模块返回空数组，原空态/清空可操作。二者均为故障模拟，不是实际源站/网络或商品核验。目录操作没有 /api/ 请求，不将此结论扩张为外部服务成功/超时/限流验证。
- 最终 before-final 与 after 的全部 evidence（含产品ID/次序、详情/来源文案、URL/history、收藏、焦点、滚动、控件几何）逐项比较差异0；不比较调度时机造成的图片失败请求次数，不宣称严格像素一致。
- pageerror 两版本均0；除故意图片失败外本地资源无失败，HTTP>=400为0。外部 Google Fonts 在前后各22次请求被环境 ERR_NETWORK_ACCESS_DENIED；图片故障组前34/后46次封面拒绝随懒加载调度不同，均只允许对应封面失败；console.error 仅这些已记录资源错误，无非预期JS错误，不能写成所有控制台/资源错误为零。
- 已实际查看迁移前桌面产品库/手机抽屉，迁移后手机产品库/桌面完整资料，并继续核对关键抽屉/筛选截图；记录的横向宽度不溢出，所查看页面未见新增控件重叠或不可关闭面板。手机视口不是手机硬件验收。当前抽屉关闭没有新增焦点管理，关闭后焦点记录保持基线，不宣称新增完整焦点陷阱/返回实现。


- 失败保留：首次页面12/14，两视口收藏导航因为可访问名称带数量而测试exact匹配超时；只改定位为原名称前缀并扩充色号/遮罩/首页详情覆盖，再在生产源码未迁移时建立14/14基线，后续同脚本14/14。初次源码比较工具只去掉第一处export，误把后续函数拼在同一块而失败；改工具为全局归一后通过，没有改生产函数追平。中断后重复启动5194遇端口占用，复用原测试服务，未杀其他服务。首轮失败JSON/截图在.qa/arch-06-before/保留。
- 证据：.qa/arch-06-before-final/、.qa/arch-06-after/、.qa/arch-06-checks/；截图/原源码快照与临时工具均被忽略、不提交。完整可复跑浏览器命令、每文件测试及覆盖限制见同日累计交付报告。

本阶段内实现、自动验证及文档已交付；人工验收和Git归档尚未完成。真实手机/触摸、其他浏览器/操作系统、默认动效、字体成功加载后的严格排版、实际断网/弱网、外部provider和生产同源服务未新增验证。图片/空目录为合成故障；既有lazy下载拒绝根卸载、Three.js CommonJS弃用、大于500kB分包、待授权图片与历史商品链接政策差异继续保留，不因本次通过而消失。

只改变本阶段代码组织/必要直接引用，无服务端、public、产品数据、contracts、存储模块、CSS、依赖或API变更。不提前实施collection/home/guide/culture/app/整体清理。原StatusControl、收藏Key/格式/effect及状态回调仍在App；没有新增用户照片、上传、持久化、日志或第三方个人数据处理，没有展示真实Key或调用付费模型。小Y/方案/化妆台各自产品数据消费不全局改写。视频/比赛材料未改，不得把目录迁移描述为新增AI、视觉或商品核验能力。

**本阶段无新增核验，继承上一条结论。** 产品事实、价格、色号、评分、图片、来源、授权pending/blocked及公开状态均未升级。图片来源/删除声明不等于取得授权；品牌官网商品来源/e.tb.cn与现行直接官方旗舰店规则的历史差异继续待独立整改。

回退范围为App、8个catalog源码、4份就近测试、独立浏览器脚本和四文档，共18路径。现在全部为未暂存现场，未形成新的Git回退点；上一已验收归档基线为 bf988460ae8c9611eaae21adb02a34c3bfc53fa1/arch-stage-05。验收归档后如需回退，先确认实际提交和后续依赖，再按授权revert并重跑测试/构建/页面；若后续collection/home消费catalog，须按依赖从新到旧处理，不承诺任意提交无冲突。Git不恢复浏览器数据、环境变量或外部状态；不自动清理/丢弃现场。

**当前：ARCH-06唯一current、待人工验收、未提交、未推送、未创建arch-stage-06；ARCH-07～11 pending。** 本次没有人工确认人/日期/结果，没有修改后提交SHA。负责人对本阶段完整范围明确验收通过后，再记录真实确认/收尾、06 done/07唯一current，按规则执行获授权的提交、正常推送和唯一带注释标签核验；不据此提前实现07，也不推定分支删除授权。



**2026-11-17 12:32（北京时间）ARCH-06 最终自动核对**

- node .qa/arch-06-checks/verify-final.mjs 退出码0：精确18变更路径、12个feature源码/测试文件、空暂存区，master/HEAD/origin/master仍为bf988460ae8c9611eaae21adb02a34c3bfc53fa1；两报告只追加，ARCH-00～05正文与ARCH-07～11计划正文原样，12阶段正文/总表一致且仅ARCH-06 current。README 134个实际树路径、10条本地链接/锚点、相对import、33个Vitest文件、7个新JS/MJS语法、全部新文件UTF-8/末尾换行/行尾空白通过；源函数/组件主体及App导航/收藏/其他页面保留核对通过。
- node .qa/arch-06-checks/compare-browser.mjs 退出码0：前后各14/14，全部已记录evidence差异0；补充对已记录的手机筛选/排序控件、抽屉返回/关闭及面板清空/关闭的矩形互斥检查通过。已实际再查看迁移后1440目录、360筛选和360抽屉截图，未见新增重叠或不可关闭面板。此为记录几何检查，不是严格像素或全部设备结论。
- git diff --check、git diff --cached --check 退出码0；首次文档同步出现累计报告EOF额外空行，已只移除新增空行后复核。此前259/259、构建2890模块及前后各14/14沿用本次真实实跑，文档追加未重跑业务验证、不称重复执行。最终记录追加后再次复核文档/范围/空白。
- 当前仍待人工验收、未暂存、未提交、未推送、未创建arch-stage-06；未删除分支或实施ARCH-07。12:19实际远端核验事实、首轮失败、字体拒绝/模拟故障、真机/服务未覆盖及所有历史数据风险保持。**本阶段无新增核验，继承上一条结论。**

**2026-11-17（北京时间）ARCH-06 人工验收通过与收尾，关联 YAS-2026-0055**

- 确认人：项目负责人；本聊天原话“人工验收通过 继续”。确认范围为此前整阶段交付的18个路径及行为保持、测试/构建/两视口比较和四文档，不虚构负责人使用的设备或具体测试步骤。依据AGENTS 13.2，将ARCH-06设为done、ARCH-07设为唯一current、ARCH-08～11仍pending；本次只收尾ARCH-06，不实施collection或删除分支。
- 提交前12:41再次git fetch origin master并实际git ls-remote：master/HEAD/origin/master仍为bf988460ae8c9611eaae21adb02a34c3bfc53fa1，ahead/behind 0/0；arch-stage-05本地/远端对象11b0d3e419b1fe642e3ed650fb07b9fc4ab9ceba、提交指向上述基线，arch-stage-06不存在。普通沙箱fetch写FETCH_HEAD被拒，同命令经允许的权限重试成功，未改Git凭据/配置。工作区为本任务已知18路径、索引为空，无来源不明修改。
- 验收后仅更新README、本文及两份累计报告的当前状态和确认记录；保存验收时14个代码/测试路径的SHA-256，收尾前逐项复核不变。沿用本次已实跑相关46/46、全量33文件259/259、构建2890模块、前后各14/14页面和7个新JS/MJS语法结果，不把沿用写成重跑。此前12:32/12:36/12:42范围/路径/状态/空白核对和失败证据保留；收尾文档再核对链接、状态、历史、精确范围与git diff --check。
- 收尾提交只包含已验收18路径，使用规定的【问题】[ARCH-06][YAS-2026-0055]…【修改】…格式，纳入done/current及本条真实确认；正常推送master并核对实际SHA，在最终提交建立唯一带注释arch-stage-06并推送，核对标签对象及^{}指向。此条写入时尚未产生修改后SHA、标签对象或推送结果，取得后先在回执提供、下次文档同步回填，不amend、不强推、不移动或复用标签。
- 上述待人工验收/未提交/06 current记录为各自验收前快照，原样保留；最新状态以本条及顶部/总表为准。真实设备/provider、字体拒绝、模拟故障、lazy下载缺口、大分包和数据/授权/商品链接差异继续保留。**本阶段无新增核验，继承上一条结论。**
- 回退范围仍为18路径；形成提交并归档后，按实际SHA及后续catalog消费依赖评估授权revert并复验，Git不恢复浏览器数据、环境变量或外部状态。下一阶段须定位本次真实归档点并重新核对，不以本条提前修改其代码。



**2026-11-17 12:45（北京时间）验收收尾自动核对**：node .qa/arch-06-checks/verify-acceptance.mjs 退出码0；14个已验收代码/测试路径SHA-256不变，18路径精确范围、空索引、两报告只追加、ARCH-00～05历史及ARCH-08～11计划不变、12阶段状态一致且ARCH-07唯一current、README134树路径/10条本地链接、33个Vitest文件、相对import、原标签、源码/语法和git diff --check全部通过。收尾仅文档确认，不重跑或扩大原业务验证；尚未产生本次提交/推送/标签结果，待实际回执。**本阶段无新增核验，继承上一条结论。**

### ARCH-07：`collection`

**状态：`done`**

**允许范围**：App 中收藏代码、新 `features/collection/`、`lib/storage`、catalog 公共组件、相关测试和文档。

**任务**：

- 抽取收藏状态纯函数、`collectionStorage.js` 和 `useCollection.js`。
- 拆出收藏页面和状态控件。
- 保持首页、产品库、详情和收藏页共享同一份状态。

**边界**：收藏 Key、状态值、刷新恢复和跨页面共享行为不变。ARCH-00-S03 源码核对确认当前没有 `storage` 事件监听，跨标签页实时同步尚未实现；本阶段不以“保持同步”为由新增该能力。

**验收**：收藏新增、状态修改、移除、刷新恢复和各页面同步不变；测试、构建和视口回归通过。

**执行记录**：2026-11-17（北京时间），项目负责人对ARCH-06整阶段明确回复“人工验收通过 继续”，按AGENTS 13.2登记本阶段为唯一current。本次仅完成ARCH-06收尾，未实施collection；开始后续代码前须先定位ARCH-06实际提交及远端arch-stage-06归档点并重新核对。

**2026-11-17（北京时间）ARCH-07 整阶段实施与交付：待人工验收，关联 YAS-2026-0055**

- 启动核验时间 12:52：先执行 `git fetch origin master`，再 `git ls-remote origin refs/heads/master refs/tags/arch-stage-06 'refs/tags/arch-stage-06^{}'`。当前分支 master，HEAD/origin/master/实际远端和 ARCH-06 最终归档提交均为 `e78c87f6768444138b88adca33b1221aa6c03d89`；带注释标签对象本地/远端均 `dc38c7ac170701918cae4e08bf20e2ccee2ffd50`，提交指向该基线，ahead/behind 0/0；起始工作树、索引、未跟踪文件为空。06 人工确认和归档证据存在，07 为唯一 current，08～11 pending，通过门禁后才实施。普通沙箱 fetch 写 FETCH_HEAD 被拒、ls-remote 遇 schannel 凭据通道失败，经同命令权限重试成功；未改 Git 凭据或配置。中断后 12:56 复核分支/HEAD/空索引与工作树，复用本任务 5195 服务，无清理/切分支/stash。
- 基线差异说明：旧计划目标文字含“旧 Key 兼容”，实际收藏只有 `base-archive-collection`，不存在另一个已实现的收藏旧 Key 或版本迁移；兼容的是该 Key 下历史原始对象。小Y当前/旧画像、消息 Key 是独立数据，不作为收藏迁移源。没有为满足目标措辞新增 Key、版本包装、迁移或删除逻辑。

| 原 App 位置（ARCH-06归档版本） | 目标模块 / 引用方 | 原行为、测试与缺口 |
| --- | --- | --- |
| :30 STORAGE_KEY、:48 getStoredCollection、:108 写入 effect | collectionStorage.js → lib/storage/storageClient；useCollection 消费 | 唯一 Key、原始对象；读取失败回退、写失败抛出；15项 storage 测试 |
| :31 statusOptions、:154 setStatus、:158 removeFavorite、:138 count、:438 list filter | collectionUtils.js → Hook / 两组件 | 三状态原序、spread更新/delete、计数与目录序过滤；14项 Utils 测试 |
| :69 collection state / effect / callbacks | hooks/useCollection.js → App唯一实例 | 首页/库/详情/收藏页共用；3项隔离状态测试+真实页面回归，无跨标签监听 |
| :433 StatusControl | components/CollectionStatusControl.jsx；App详情插槽、CollectionView消费 | 原 JSX/文案/CSS、默认想买/取消/三状态；组件回调/SSR边界测试 |
| :437 FavoritesView | components/CollectionView.jsx；App传原 products 数组和共享 callbacks | 原列表/空态/产品对象/顺序；与控件共3项组件测试，无 catalog/App反向导入 |

以上 collection 目标前缀为 `src/features/collection/`。实际17路径：App、collection 的5个源码/4份就近测试、公共 storageClient.js 及其原测试、独立 tests/browser/arch07-collection.mjs、README/本文/两份累计报告。catalog 原源码和测试完全未改；旧收藏实现从App移除。公共 storage 新增原始 JSON 读写复用；既有 readJson 的nullish回退、writeVersioned版本1和访问/序列化错误传播保持，收藏使用raw读取保留null，并在领域层保留原读异常回退。无空目录/空Hook/转发/第二套状态。

- 状态基线保持：`想买 / 正在用 / 会回购`；卡片未收藏时添加“想买”，已收藏时点击移除；详情/收藏控件可切换状态或取消。spread保留对象键序，列表按原产品数组过滤，与插入顺序无关；导航数是Object.keys长度，未知ID/falsy值不显示在列表但仍计键。刷新恢复相同原始对象，没有存储schema修复。缺失/空串/坏JSON和读取拒绝回退{}，effect随状态保存；写入拒绝/序列化错误仍抛出。合法JSON null仍触发Object.keys异常、根视图卸载；写入故障也会卸载根视图，属于保留缺口。没有storage监听/跨标签实时同步、账号、云收藏或服务端持久化。
- 迁移前实跑（12:54）：相关8文件75/75、全量33文件259/259、build2890模块通过。迁移后 `npm test -- src/features/collection src/lib/storage src/features/catalog src/lib/navigation-history.test.js`：13:06，12文件112/112；`npm test`：13:07，37文件296/296；`npm run build`：2895模块、主JS745.49kB/gzip226.61kB、3D1293.47kB，通过。原259项保留，新增collection35项（Utils14/Storage15/Hook3/组件3）、公共raw存储2项。CSS三产物名称/大小不变；Three.js弃用和>500kB警告仍在。Hook测试为隔离state/effect，组件为真实节点/SSR/回调，不冒称RTL挂载。
- 独立脚本使用现有Playwright/Chrome157.0.8103.52、1440×900和360×800、reducedMotion=reduce、deviceScaleFactor=1、临时上下文/合成数据。`node tests/browser/arch07-collection.mjs` 前后各16/16；原 `node tests/browser/arch06-catalog.mjs` 前后各14/14。启动命令 `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5195 --strictPort`，环境和可复跑完整命令见累计报告。浏览器测试用Vite开发服务，生产构建单独验证；未新增生产同源HTTP验收。
- 覆盖：首页静态回退卡片添加/详情切状态；库卡片添加/取消、抽屉与完整资料添加/取消/三状态、收藏页修改/移除与其他页面立即反映、筛选跨页保持、刷新/深链接恢复、原始对象/目录次序/未知与falsy键、空态、坏JSON/读写故障/null、非收藏当前/旧画像/消息及其他数据保留。catalog原脚本另验证搜索/35单项筛选/四排序/详情色号/相似产品/内部滚动/历史关闭、模拟图片失败及空目录；无API/provider调用，不新增跨标签测试。
- `node .qa/arch-07-checks/compare-browser.mjs`：16组收藏和14组catalog全部evidence逐项相同（存储字节/状态/产品ID/顺序、页面文字、URL/历史/刷新及记录几何），收藏预期pageerror也相同；不声称严格像素一致。`verify-source.mjs`：两组件主体、App非收藏部分/导航原文不变，10类原始存储输入及既有readJson行为等价；公共lib无features依赖，App仅一个收藏实例；9个变更JS/MJS语法检查通过。`git diff --check`及最终文档/范围核对在交付前再次记录。
- 正常场景无新增未处理JS错误，故意存储写失败（StrictMode每视口2条）和null（每视口1条）前后均6条预期pageerror、根卸载保留。收藏前后各22次Google Fonts环境ERR_NETWORK_ACCESS_DENIED/对应console资源错误；catalog各22字体失败及44次显式封面拒绝（24桌面/20手机），无其他本地失败/HTTP>=400。不能称控制台/资源错误全为零。已实际查看前桌面列表/手机原始对象列表和后桌面列表/手机列表/手机抽屉；几何断言无横向溢出/所检控件重叠，关闭及键盘选择可用。手机“查看详情”按钮本来隐藏，以产品名称打开详情；不为此改CSS。
- 失败保留：新收藏脚本首轮14/16，查询“持妆粉底液”误期待唯一商品；改品牌+名称后15/16，手机脚本误点隐藏的桌面详情按钮；再改产品名称入口、原生select Escape/Tab收起后，在生产源码迁移前建立16/16完整基线，迁移后同脚本16/16。只修测试定位/取景，未改产品或业务。证据：`.qa/arch-07-before/`、`before-final/`、`before-complete/`、`after/`（均带arch-07前缀），catalog前后及checks；QA/截图/快照被忽略不提交。
- README 当前树/37测试文件/真实存储与catalog/App依赖、本文、两累计报告已同步。**本阶段无新增核验，继承上一条结论。** 不改产品事实/价格/评分/素材/来源/授权pending或blocked/公开状态，不改服务端、public、contracts、data、CSS、依赖、API/推荐/小Y数据/视频/比赛材料。测试为合成数据，未读取真实用户档案、照片、对话、Key或私有环境文件，没有新上传/日志/第三方个人数据处理。
- 未覆盖：真实手机/触摸、其他浏览器/系统、默认动画、字体成功加载后的严格排版、真实断网/弱网、真实存储配额耗尽、provider/生产同源HTTP。本次故障是定向模拟，不代表实际权限或磁盘故障。原懒加载下载拒绝根卸载、大包/弃用、图片授权及商品直接链接政策差异继续保留；收藏null/写失败未修，不把保留缺口当作成功降级。
- 回退范围为上述17路径；上一已验收归档为e78c87f/arch-stage-06，未提交现场不是Git回退点。获人工确认并归档后按实际SHA及后续home/app对Hook/组件、其他feature对公共storage依赖评估授权revert，必要时从新到旧回退并重新测试/构建/页面；不承诺任意提交无冲突。Git不恢复浏览器数据/环境变量/外部状态，不自动清理/覆盖或丢弃现场。
- **当前：待人工验收、未提交、未推送、未创建 arch-stage-07。** 无本阶段修改后SHA/人工确认人/日期/通过结果；ARCH-07保持唯一current，08～11pending；未暂存、不打标签、不删分支、不实施08。人工验收由AGENTS13.2和本次任务第七节明确要求，待负责人核对完整结果后才按规则收尾。
- **13:21 最终自动核对**：`node .qa/arch-07-checks/verify-final.mjs` 退出码0，精确17路径/9个feature文件、空索引、master/HEAD/origin/master/arch-stage-06定位不变、无07标签；两累计报告只追加、00～06历史正文和08～11计划正文原样、12阶段正文/总表一致且07唯一current。README147个实际树路径、13条本地链接/锚点、4个第三方披露源码路径有效；167个相对引用、无循环/反向依赖、原存储断言和源码快照、37个Vitest文件、9个变更JS/MJS语法、UTF-8/末尾换行/行尾空白、源码与浏览器对照及工作树/索引空白检查通过。首轮临时检查器误把JSDoc中的示意import当真实引用，排除注释后通过，只修忽略QA检查器。随后再查看迁移后桌面/手机列表及手机抽屉，未见新增重叠/溢出；追加本结果后再复核，不重跑或扩大原业务验证。**本阶段无新增核验，继承上一条结论。** 当前仍待人工验收，未提交/推送/建标签/删分支或实施08。



**2026-11-17（北京时间）ARCH-07 人工验收通过与版本收尾**

- 项目负责人在整阶段交付后明确回复原话“人工验收通过”，确认已交付17路径；按AGENTS13.2将07改done、08登记为唯一current，09～11pending。本次只收尾ARCH-07，不实施08，不推定分支删除授权；不虚构负责人使用的设备、操作步骤或未执行检查。
- 首次收尾在15:08～15:17核验遇本机7890代理未监听、GitHub直连连接重置/无法连接，OpenSSL重试未取得远端，停止挂起查询并只读核对；未暂存/提交/改阶段或配置。负责人随后回复“网络已恢复”并要求继续，授权保持有效。15:26～15:32重新git fetch origin master及实际git ls-remote成功：HEAD/origin/master/实际远端仍为e78c87f6768444138b88adca33b1221aa6c03d89，arch-stage-06对象dc38c7ac170701918cae4e08bf20e2ccee2ffd50及^{}一致，远端无arch-stage-07。普通沙箱写FETCH_HEAD被拒，同命令权限重试成功；未改Git凭据/配置。
- 验收后只更新README/本文/两累计报告的状态、确认及追溯，13个已验收代码与测试文件保存并逐一复核SHA-256不变。17路径均在范围，索引空，无来源不明改动。沿用本阶段实跑的相关112/112、全量296/296、构建2895模块、前后收藏16/16与catalog14/14；不称验收后重跑或扩大覆盖。提交前核对文档路径/链接/历史/唯一current、源码对照、语法、工作树及暂存空白，真实结果另追加。
- 收藏Key/对象/三状态/异常及唯一共享实例、UI/CSS、API/规则/产品事实/依赖不变；当前/旧小Y与其他存储不改。入口仍为主站5195、产品库/我的收藏/详情；无新上传、个人数据日志或第三方处理。**本阶段无新增核验，继承上一条结论。** 原存储null/写失败根卸载、字体拒绝/模拟图片失败、lazy下载缺口、大分包、数据来源/授权/直接官方旗舰店链接差异及全部未覆盖项保留。视频/比赛材料未改。
- 原待验收/current/未提交快照和失败完整保留，最新状态以本条及顶部/总表为准。本条写入时尚无ARCH-07新SHA/标签对象或推送结果；最终状态、人工确认和收尾记录与已验收实现共同纳入规定格式的提交，再在该提交建立唯一带注释arch-stage-07并正常推送、核对实际远端master/对象/^{}。真实结果由本次回执先提供、下次同步回填，不amend、不强推或移动/复用标签。
- 上一已归档定位仍为e78c87f/arch-stage-06，当前未提交现场不是新恢复点。形成实际归档后按后续home/app和公共storage依赖评估授权revert及复验，保留原历史，Git不恢复浏览器数据/环境变量/外部状态。开始ARCH-08前须先定位07最终归档并重新核对；本次不删分支或实施08。


**2026-11-17 15:36（北京时间）验收收尾自动核对**：node .qa/arch-07-checks/verify-acceptance.mjs 退出码0，13个已验收代码/测试文件SHA-256不变，精确17路径/空索引、两累计报告仅追加、00～06历史及09～11计划不变、07原证据保留、08仅登记current/未实施，12阶段正文与总表一致。README147实际路径/13本地链接与锚点/4第三方披露路径、167相对引用/无循环或反向依赖、原断言/源码快照、37测试文件、9个JS/MJS语法、UTF-8/换行/空白、源码及浏览器证据对照通过；git diff --check和git diff --cached --check退出码0。确认后只同步四文档，沿用112/112、296/296、build2895、前后16+14的真实结果，不称重跑。追加本结果后再核对，暂存后再核对精确范围与内容；此时尚无本阶段提交/推送/标签结果，待实际回执。**本阶段无新增核验，继承上一条结论。**


**2026-11-17 15:40（北京时间）暂存内容核对**：显式暂存已确认的17路径后，Node只读核对退出码0；暂存清单精确匹配17路径、各暂存blob与工作树按Git过滤后的内容一致、无未暂存或未跟踪文件，13个已验收代码/测试文件SHA-256仍不变，工作树和暂存空白检查均通过。本次仅追加此收尾证据后重新暂存三份记录文档并复核，不改实现、阶段范围或原风险。本条与最终状态/人工确认共同纳入ARCH-07收尾提交，此时新SHA/推送/标签尚未产生，实际结果待回执。**本阶段无新增核验，继承上一条结论。**

### ARCH-08：`home`

**状态：`done`**

**本次有效范围（2026-11-17 负责人具体任务覆盖旧计划）**：App 原首页组合和必要引用、实际使用的新 features/home、相关测试/必要浏览器直接引用和四文档。保留所有现有 CSS/视觉组件位置和内容；不机械创建不存在的预览。

**本次有效任务**：将实际 HomeView 及首页专用引用迁入 feature，复用 makeup-table/catalog 和 App 唯一收藏/导航，保留 App 的 EnhancementBoundary 并注入；补真实节点/回调测试与页面前后对照。详见下方实际映射。

**原计划快照（保留追溯，以下任务未在本次实施）**：

**允许范围**：App 中首页代码、新 `features/home/`、首页视觉组件及 CSS、相关测试和文档。

**任务**：

- 拆出 `HomeView.jsx`、`HeroSection.jsx`、`EditorSelection.jsx` 和必要的首页产品区域。
- 将 `ScrollFloat`、`StrokeText`、`FlexCarousel` 及对应 CSS 迁入 `components/visual/`。
- 建立 `homeContent.js`，只保存首页文案、精选产品 ID 和展示顺序。
- 组合已迁移的 makeup-table 与 catalog，不复制其产品或渲染逻辑。

**验收**：首页布局、Slogan、精选顺序、轮播、滚动动效、CTA、3D/2D 回退和响应式表现不变；测试和构建通过。

**执行记录**：2026-11-17（北京时间），项目负责人明确确认ARCH-07“人工验收通过”，按AGENTS13.2将本阶段登记为唯一current。本次只确定下一阶段，尚未实施ARCH-08；开始代码前必须定位ARCH-07实际提交及远端arch-stage-07归档并重新核对。

**2026-11-17（北京时间）ARCH-08 整阶段实施记录：待人工验收，YAS-2026-0055**

- 启动门禁：15:52 已先执行 `git fetch origin master`，实际查询 `git ls-remote origin refs/heads/master refs/tags/arch-stage-07 'refs/tags/arch-stage-07^{}'`。master、HEAD、origin/master、实际远端及 ARCH-07 最终归档提交均为 `7f71699ddea914c36a1ad3b0c877ad0d6eb31755`，ahead/behind 0/0；带注释标签本地/远端对象均为 `c7765c37a83ce0dc4806d2db50ae84ebfbd9c4a9`，^{} 指向该提交。初始工作树/索引/未跟踪均空，07 已人工验收归档，08 唯一 current、09～11 pending；本条回填实际归档，不覆盖07历史。普通沙箱 fetch 写 FETCH_HEAD、ls-remote schannel 通道失败后同命令权限重试成功，未改凭据/配置。
- 基线差异先行说明：归档源码没有首页快捷问题弹层、新手流程、模板/技法预览；CTA 为 `onNavigate('assistant')`，不带预填参数，小Y四问题在其原页面直接 `sendMessage(prompt)` 并清空草稿。桌面/360px 实测 hero 都为 display:block、完整高度，不是任务文字中的桌面隐藏/手机短 banner。曾在早期沟通误判隐藏/短 banner 存在，后已明确纠正。按本次“保持实际现状、不造假区块、不改CSS”的具体授权执行；不新建 QuickQuestionSheet/TemplatePreview/TechniquePreview 或重复 homeContent，不把缺失场景记为已实现/已通过。

| 原归档位置 | 实际目标 / 直接与间接引用 | 状态、测试与缺口 |
| --- | --- | --- |
| App.jsx:328 HomeView 主体 | features/home/components/HomeView.jsx → App；main → App 为间接入口 | 原 JSX/文案/本地搜索草稿/按rating排序前12对象原样；7项真实节点/SSR/回调测试及浏览器12场景 |
| App:13～16 首页 lazy/视觉引用、首页专用图标/quickFilters/ProductCard | 同一 HomeView 文件 → 原 makeup-table Experience、原 components 视觉和 catalog/ProductCard/Service | 保留资源/动态导入边界、三层静态精选回退；不搬CSS、不复制产品数据/组件 |
| App:31 EnhancementBoundary，:224 首页组合 | 边界类留App，通过稳定组件属性注入HomeView | 不反向导入App、不提前ARCH-10；导航/history/唯一useCollection及详情原代码保留 |
| arch05浏览器脚本从App寻找lazy入口 | 脚本必要直接引用适配：从App或HomeView按所属目录解析 | 原全部行为断言保留；支持旧源码快照；无生产测试开关 |
| 任务中的三个预览/新手流程/隐藏hero | 实际没有对应定义或调用方 | 不创建空组件、不改视觉、不虚构预览验收 |

目标路径前缀为 `src/`。实际9路径：App、home的HomeView/就近测试、新tests/browser/arch08-home.mjs、已有tests/browser/arch05-makeup-table.mjs的入口发现适配，以及README/本文/两累计报告。catalog/collection/assistant/产品数据/服务端/素材/依赖/CSS均未改。原296项有效断言保留。

- 迁移前15:53～15:54：`npm test -- src/features/catalog src/features/collection src/data/home-featured.test.js src/lib/navigation-history.test.js` 10文件74/74；`npm test` 37文件296/296；`npm run build` 2895模块通过。迁移后16:10：相关命令增加 `src/features/home`，11文件81/81（841ms）；`npm test` 38文件303/303（3.00s）；`npm run build` 2896模块（2.30s），主JS745.63kB/gzip227.05kB、3D1293.47kB/gzip356.09kB。三CSS产物hash/大小不变，Three.js弃用和>500kB提示保留，不宣称体积优化。
- `node tests/browser/arch08-home.mjs`：实际迁移前 `.qa/arch-08-before-final/` 与迁移后 `.qa/arch-08-after/` 各12/12；Chrome157.0.8103.52、1440×900/360×800、DPR1、独立合成临时上下文。增强轮播用no-preference，其余reduce。覆盖真实首页/CTA/工作台、小Y四问题直接发送及消息切页/刷新、搜索/六筛选、真实12产品ID/顺序、增强轮播Home/ArrowRight/Enter、详情滚动/关闭/Escape、收藏跨首页/库/详情/完整资料/收藏页/刷新/移除，以及定向封面失败和空目录。
- 原 `arch06-catalog.mjs` 和 `arch07-collection.mjs` 未修改；补充前轮运行跨过源码迁移，不作为纯前基线。通过忽略目录Vite插件仅加载已保存且与HEAD原文相同的App，在5199参考服务补跑完整基线，再在5198当前服务复跑：catalog各14/14，collection各16/16。`.qa/arch-08-{catalog,collection}-{reference,after}/` 保留JSON/截图，`verify-source.mjs`实际确认参考服务含旧内嵌HomeView；无切分支/覆盖生产文件。参考服务首次相对Vite路径错误，改为已有包导入后成功，不改生产依赖。
- `node .qa/arch-08-checks/compare-browser.mjs`：首页全部非几何记录一致，静态hero/网格及抽屉记录一致；增强轮播瞬时坐标有33个字段差异，最大横向约2.93px、纵向约0.24px，宽高仅浮点微差，严格几何比较未通过。记录时仍有原CSS过渡，未单独证明差异成因，不称像素一致。catalog14组/collection16组全部evidence相同。`verify-source.mjs`确认Home主体原文相同、App仅删除原首页及替换必要引用/注入，导航/其他页面/边界原样且只一个收藏实例。
- 正常路径无新增未处理错误；首页/catalog pageerror=0；收藏显式写失败/null前后各6条预期pageerror/根卸载保持。首页前后各58条资源错误（16字体拒绝+42显式封面失败）；catalog参考52/后58（各22字体+30/36定向封面失败，数量受懒加载调度影响），collection各22字体拒绝；HTTP>=400均0，无API/provider调用。不是控制台全零。轮播详情关闭后焦点为BODY、滚动锁为空，前后一致，不宣称新增焦点恢复。
- 已实际查看前后1440/360 hero、前后轮播、手机静态网格及抽屉等关键截图，脚本所检控件无重叠/文档横向溢出。当前轮播沿用原轨道定位和动效，不借迁移修正已有视觉。截图/源码快照/对照均只存忽略`.qa/`，不提交。完整可复跑环境、补充化妆台结果、失败及最终语法/范围检查见累计报告本阶段末尾，不预写未运行结果。
- 首次home基线10/12：脚本全设reduce导致轮播正常回退网格，两轮播定位超时；只修测试配置后在迁移生产代码前建立完整12/12基线。失败 `.qa/arch-08-before/` 保留。补跑原化妆台脚本首次在启动发现入口断言退出（旧脚本只读App），随后仅适配实际迁移后的引用发现，不放宽任何行为断言；真实结果追加记录。
- README当前home树/38测试文件/边界及第三方路径、本文、两累计报告同步。**本阶段无新增核验，继承上一条结论。** 产品价格/图片/评分/来源/授权pending或blocked/链接历史差异/公开状态不升级；不读真实用户照片/画像/对话/Key/.env/旧memory，无新上传、存储位置、日志或第三方个人数据处理。视频/比赛材料未改。
- 用户入口为[当前前端首页](http://127.0.0.1:5198/)；CTA进入主站小Y中的真实工作台，向下看精选并打开详情、改收藏后跨页/刷新核对。真实手机/触摸、其他浏览器/系统、全部默认动效、字体成功后的严格排版、真实弱网/断网/存储权限或配额、生产同源HTTP/provider和严格像素未完整验证；原收藏null/写失败、lazy下载拒绝根卸载及产品公开风险保留，不把缺口当成功降级。
- 可回退范围为上述9路径；上一归档 `7f71699d/arch-stage-07`，本地未提交现场不是新Git回退点。人工通过并实际归档后，按实际SHA和后续ARCH-09/10/11对App/Home及相关脚本的依赖评估授权revert，从新到旧处理必要范围并复验；不恢复浏览器数据/环境变量/外部状态，不自动清理/丢弃文件。
- **待人工验收、未提交、未推送、未创建 arch-stage-08**；暂存区空，无本阶段修改后SHA、人工确认人/日期/通过结果。ARCH-08保持唯一current，09～11pending，不提交/推送/打标签/删分支/实施09。整阶段人工确认来自本次任务第七节及AGENTS13.2，完整结果交付后才等待确认。

**2026-11-17 16:27（北京时间）补充化妆台与最终自动核对**：原arch05脚本仅适配lazy入口发现后，归档App参考服务与当前工作树各16/16；真实WebGL/2D/运行失败/未就绪/卸载/清理及下载拒绝缺口均验证。compare-table确认非计时行为和记录几何/Canvas尺寸相同，实际计时单列，不声称严格像素或全部GPU通过。已查看前后桌面真实展开和手机2D截图。前后各2条下载拒绝pageerror、6条console.error（2字体+2Scene抛错+2下载拒绝）与4次失败请求原样，正常本地资源无失败。node .qa/arch-08-checks/verify-final.mjs退出码0：精确9路径、2个home文件、空索引/master/基线/标签/无08标签、两报告只追加、00～07历史和09～11计划不变、唯一08 current、38测试文件；README152树路径/14本地链接锚点/4第三方源码路径、172相对引用/无循环反向依赖、原首页/App其余源码及原化妆台全部行为断言、两MJS语法/UTF-8/换行/空白、git diff --check和git diff --cached --check通过。补记后再次复核，不重复已通过业务测试/构建。当前仍待人工验收、未提交、未推送、未创建 arch-stage-08；**本阶段无新增核验，继承上一条结论。**


**2026-11-17（北京时间）ARCH-08 人工验收通过与版本收尾**

关联YAS-2026-0055。项目负责人对本阶段整阶段交付明确回复原话“人工核验完毕”，确认已交付9路径；按AGENTS13.2将ARCH-08改done、ARCH-09仅登记为唯一current且未实施、10～11pending。不虚构负责人设备、操作或未执行验证，不推定分支删除授权。

16:36起重新执行git fetch origin master及实际git ls-remote，master/HEAD/origin/master仍为 **7f71699ddea914c36a1ad3b0c877ad0d6eb31755**，ahead/behind0/0；arch-stage-07本地/远端对象 **c7765c37a83ce0dc4806d2db50ae84ebfbd9c4a9**、^{}指向该提交，远端无arch-stage-08。沙箱FETCH_HEAD写权限及Schannel通道失败后，同命令权限重试成功，未改Git配置/凭据，没有自动审批拒绝。工作树仍精确为已交付9路径，起始索引空。

验收后仅同步README、迁移计划和两累计报告；五个已验收代码/测试文件以SHA-256逐一核对不变，代码/测试不作实质修改。README开头遗留296项计数同步为已实跑303项，修正文档内部不一致。沿用相关81/81、全量38文件303/303、build2896、桌面/360px首页前后12/12、catalog14/14、collection16/16、化妆台16/16，不称验收后重跑。收尾重新检查范围、阶段状态、路径/链接、源码与行为证据、语法/空白及暂存内容，真实结果另追加。

原失败与风险全部保留：首页33个瞬时几何字段差异、严格几何比较未通过，收藏null/写失败与lazy下载拒绝根卸载，字体拒绝、模拟封面/Scene故障、大包/弃用及首次测试定位/参考服务失败不抹去；真机/触摸、其他浏览器/GPU、全部默认动效、字体成功排版、真实弱网/存储权限/配额、生产HTTP/provider、穷尽泄漏和严格像素未扩大验证。人工确认不等于这些问题已整改。入口仍为主站5198首页/工作台/产品库/详情/收藏；参考5199已在最终核对后停止，原源码与浏览器结果保留在忽略.qa。

**本阶段无新增核验，继承上一条结论。** 产品事实、价格/评分、来源、图片授权pending或blocked、历史商品链接与现行直接官方旗舰店规则差异和公开门禁不升级；无新上传、个人数据日志、第三方处理或存储位置变化，未读真实Key/.env/用户照片/画像/对话。AGENTS/FINAL-PROMPT、视频及比赛材料未改。

本次收尾将已验收App、HomeView/测试、arch08浏览器脚本、arch05入口发现适配及四文档共9路径纳入规定格式的[ARCH-08]提交。本条写入时未提交、未推送、未创建arch-stage-08，实际新SHA/带注释标签对象及^{}远端核验由本次回执先提供、下次同步回填，不amend或虚构自引用；原待验收/current快照保留。上一归档为7f71699d/arch-stage-07；实际归档后按后续ARCH-09/10/11的App/Home/脚本依赖评估授权revert，从新到旧处理必要范围并复验，Git不恢复浏览器数据/环境变量/外部状态。此确认不授权实施09或删除分支。


**2026-11-17 16:41（北京时间）验收收尾自动核对**：node .qa/arch-08-checks/verify-acceptance.mjs退出码0；五个已验收代码/测试文件SHA-256不变，精确9路径、空索引、master/原基线/07标签/无08标签、两报告只追加、00～07历史及10～11计划不变，08原证据保留，09仅登记current且未实施。12阶段正文/总表一致，README152实际树路径/14本地链接锚点/4第三方源码路径、172相对引用/无循环反向依赖、原首页/App其余源码/arch05行为断言、38测试文件、两MJS语法/UTF-8/换行/空白、已保存浏览器与化妆台对照、git diff --check及git diff --cached --check均通过。参考服务已停止，本次源检查验证保存原文与HEAD一致，不冒称重新检查参考服务响应。确认后只更新四文档，沿用81/303/build2896及前后12+14+16+16实跑结果；补记后再复核，并在暂存后核对精确范围与blob。此时实际提交/推送/新标签尚未产生，待回执。**本阶段无新增核验，继承上一条结论。**


**2026-11-17 16:43（北京时间）提交前与暂存内容核对**：再次fetch及实际ls-remote确认master仍为7f71699ddea914c36a1ad3b0c877ad0d6eb31755、07标签对象/指向不变、无08标签。显式暂存已确认9路径后，YAS_QA_VERIFY_STAGED=1运行node .qa/arch-08-checks/verify-acceptance.mjs退出码0：暂存清单精确匹配9路径、每个暂存blob与工作树经Git过滤后内容相同，无未暂存/未跟踪文件，五个代码/测试哈希仍不变，全部状态/文档/源码/语法/证据及工作树和暂存空白检查通过。本次仅追加此收尾证据后重新暂存三份记录文档并复核，不改实现或验证范围。本条与人工确认和最终阶段状态共同纳入ARCH-08收尾提交，此时新SHA/推送/标签尚未产生，实际结果待回执。**本阶段无新增核验，继承上一条结论。**

### ARCH-09：`guide` 与 `culture`

**状态：`done`**

**允许范围**：指南页、品牌文化页、直接引用方、相关测试与浏览器回归脚本及四份文档。

**任务**：按本次负责人确认，将实际 GuideView、CultureView 迁入 `features/guide-culture/components/`，只抽取实际页面和内容，不增加空 Hooks、Utils 或 Service。原分别迁入 guide/culture 的目标保留在 ARCH-00 历史清单；本次明确范围优先。

**验收**：页面内容、导航和响应式布局不变；测试、构建和视口回归通过。

**执行记录**：2026-11-17（北京时间），负责人对ARCH-08完整阶段回复“人工核验完毕”，按AGENTS13.2将本阶段登记为唯一current。本次只收尾08，未实施09；开始09代码前必须先定位08实际提交及远端arch-stage-08归档并重新核对。

**2026-11-17 16:51（北京时间）ARCH-09 启动与范围确认，YAS-2026-0055**

- 已执行 `git fetch origin master`；分支 master，HEAD/origin/master/FETCH_HEAD/实际远端 master 均为 `aee4175bd09be01b065d5875c0f1305e55410cd9`，起始工作树、索引、未跟踪文件为空。ARCH-08 已整阶段人工验收并实际归档；带注释 `arch-stage-08` 本地/实际远端对象均为 `be773944bdae29408bc3eecdfc6789dc831ab0d1`，`^{}` 均指向该基线。实际远端查询 `git ls-remote origin refs/heads/master refs/tags/arch-stage-08 'refs/tags/arch-stage-08^{}'` 已于16:51:03核对。本条回填原08“Git收尾中”快照后的真实结果，不改写历史。
- 沙箱首次 fetch 写 FETCH_HEAD 被拒，普通 ls-remote 出现 Schannel 凭据通道错误；同命令权限重试成功，未改 Git 配置或凭据。09唯一current、10/11pending，不切换/清理/stash/暂存或执行版本归档。
- 任务与事实差异已报告，负责人明确选择“按实际基线迁移两个页面（推荐）”：实际只有 GuideView/CultureView，桌面导航直接显示肤质指南/品牌文化，手机沿用折叠菜单；没有 BeautyView、CultureSheet、MainBrowser、文化弹层或可迁出的文化 overlay 逻辑。因此只迁两个真实页面，保留名称与UI/导航/History，不创建无用途组件/useOverlay，不重构小Y/产品详情/筛选/移动菜单弹层。此为实施范围确认，不是整阶段人工验收。
- 映射：App.jsx:322 GuideView及内嵌guides → guide-culture/components/GuideView.jsx；:331 CultureView → 同目录CultureView.jsx；唯一直接消费方为App的guide/culture条件分支，间接为main→App→Header真实导航。Guide回调仍经chooseQuickFilter→useCatalog.applyQuickFilter→navigate('library')；Culture仍onNavigate('library')；App保留跨页状态、History与全部overlay控制，不提前ARCH-10。
- 行为基线：主视图均为 `/`，History保存view/depth/scrollY；标题不按页面另设，hash不作路由。导航/刷新/前进后退及跨页筛选/排序/收藏/小Y状态由同一新浏览器脚本在迁移前后实跑，缺失的MainBrowser/文化弹层场景明确不适用，不写成已通过。
- 16:53迁移前相关10文件80/80、全量38文件303/303、构建2896模块通过，保留原THREE_CJS_DEPRECATED和>500kB提示。先新增 `tests/browser/arch09-guide-culture.mjs` 建立真实页面基线，再迁移源码；真实结果完成后追加。上一可回退归档为上述08提交/tag，未提交现场不是新恢复点；实际归档后按后续App收敛依赖评估授权revert及复验。


**2026-11-17（北京时间）ARCH-09 整阶段自动验证与统一交付：待人工验收**

关联既有 **YAS-2026-0055**，不新建问题编号。2026-11-17（北京时间），本阶段只迁移两个现有页面，负责人已明确选择“按实际基线迁移两个页面（推荐）”；此为范围确认，不构成整阶段人工验收。ARCH-09保持唯一current、交付状态“待人工验收”，ARCH-10/11保持pending、未实施。

启动先运行git fetch origin master，再实际查询git ls-remote origin refs/heads/master refs/tags/arch-stage-08 'refs/tags/arch-stage-08^{}'，16:51:03核验：分支master，HEAD/origin/master/FETCH_HEAD/实际远端master/ARCH-08最终归档均为 **aee4175bd09be01b065d5875c0f1305e55410cd9**，ahead/behind0/0；带注释arch-stage-08本地/远端对象均为 **be773944bdae29408bc3eecdfc6789dc831ab0d1**，^{}指向该提交。起始工作树/索引/未跟踪为空；08已有“人工核验完毕”和实际归档，本次回填真实SHA/tag，原收尾时待产生的快照保留。沙箱FETCH_HEAD写权限和Schannel通道首次失败，同命令权限重试成功，未改配置/凭据，没有自动审批拒绝。

实际 **9个变更路径**：

| 原位置（aee4175） / 修改文件 | 实际目标与职责 |
| --- | --- |
| src/App.jsx:322 GuideView及内嵌guides | src/features/guide-culture/components/GuideView.jsx；原函数体原文相同，只增加Lucide导入及默认导出 |
| src/App.jsx:331 CultureView | src/features/guide-culture/components/CultureView.jsx；原函数体、文案、SVG路径及返回结构相同 |
| src/App.jsx | 只增加两个导入、移除旧同文件定义；原条件渲染、Header/Footer/EnhancementBoundary、导航/History、共享状态、详情/Escape原文不变 |
| 新就近测试 | src/features/guide-culture/components/guideCulture.test.jsx；6项SSR/React元素/事件断言，非RTL或DOM挂载 |
| 新浏览器回归 | tests/browser/arch09-guide-culture.mjs；迁移前后使用同一脚本，不新增依赖 |
| 四份文档 | README.md、docs/frontend-architecture-migration-plan.md、docs/stage-delivery-test-report.md、docs/product-data-accuracy-audit.md |

唯一直接调用方是App的guide/culture条件分支；间接为main→App→Header桌面/手机真实入口。Guide的onApplyFilter经App.chooseQuickFilter→useCatalog.applyQuickFilter→navigate('library')；Culture仍onNavigate('library')。页面只依赖Lucide，无History/存储/网络或App反向导入；App保留跨页组合与唯一useCollection。未创建空Hook、转发、重复实现或第二套路由。

任务文字差异按负责人明确确认处理：实际无BeautyView、CultureSheet、MainBrowser或文化弹层，不创建这些组件及app-shell/useOverlay；桌面肤质指南/品牌文化直接可见，手机沿用折叠菜单。相关缺失场景明确不适用，不冒充测试通过；不把产品详情/筛选/移动菜单或小Y弹层纳入新抽象，不提前ARCH-10。

| 真实命令 | 迁移前结果 | 迁移后结果 |
| --- | --- | --- |
| npm test -- src/lib/navigation-history.test.js src/features/catalog src/features/collection src/features/home | 16:53:47，10文件80/80，507ms，退出码0 | 同范围加src/features/guide-culture，17:02:02，11文件86/86，648ms，退出码0 |
| npm test | 16:53:49，38文件303/303，2.70s | 17:02:05，39文件309/309，2.93s；退出码0 |
| npm run build | 2896模块、1.60s，主JS745.63kB/gzip227.05kB | 2898模块、1.94s，主JS745.77kB/gzip227.16kB；退出码0 |
| node tests/browser/arch09-guide-culture.mjs | .qa/arch-09-before-complete/results.json，10/10，退出码0 | .qa/arch-09-after/results.json，10/10，退出码0 |
| node .qa/arch-09-checks/compare-browser.mjs | 相同脚本/数据/浏览器/视口 | 全部evidence递归比较differences=[]，含已记录几何；退出码0 |
| node .qa/arch-09-checks/verify-source.mjs | before.json保存HEAD原文 | 两页面原函数体及App其余代码原文相同，master/HEAD/空索引/无09标签/无提前阶段核对通过；退出码0 |
| node --check tests/browser/arch09-guide-culture.mjs | 新MJS语法检查 | 退出码0；JSX通过Vitest转换及生产构建验证，本阶段无新增运行时JS Hook |
| git diff --check；git diff --cached --check | 起始干净 | 源码迁移后退出码0；文档同步后最终范围/空白/新文件检查另追加真实记录 |

迁移后相关完整命令为npm test -- src/features/guide-culture src/lib/navigation-history.test.js src/features/catalog src/features/collection src/features/home。全部原303项及测试文件未改，新6项覆盖三指南的原条件对象与回调、页面文案/结构/素材、文化产品库入口。SSR/元素测试不替代真实浏览器。构建仍保留THREE_CJS_DEPRECATED及>500kB分包提示；3D异步块1293.47kB。三个CSS产物仍index-BTPGBce7.css、FlexCarousel-BXfJaBAn.css、MakeupTableExperience-DUcrjJjC.css，名称/hash/大小不变，不称性能优化。

测试服务命令：node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5200 --strictPort。已有Playwright/Chrome157.0.8103.52，1440×900与360×800，DPR1、reducedMotion=reduce，每场景独立临时上下文和合成数据，不使用个人浏览器档案。复跑：

~~~powershell
$env:YAS_QA_PLAYWRIGHT_MODULE = 'file:///C:/Users/%E5%B4%94%E9%A6%A8%E7%91%9C/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
$env:YAS_QA_BROWSER_EXECUTABLE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:YAS_QA_BASE_URL = 'http://127.0.0.1:5200'
$env:YAS_QA_OUTPUT_DIR = '.qa/arch-09-recheck'
node tests/browser/arch09-guide-culture.mjs
~~~

每视口5组共10组，不是全部点击次数：

- 真实桌面/手机入口、条件渲染；指南三卡全文、三项筛选的真实产品ID/次序、返回后内容、刷新和History状态。桌面入口可见；手机菜单可打开/再次点击关闭、选择后关闭，Escape按基线不关闭菜单。
- 文化全文/原品牌SVG、无文化dialog、产品库按钮；整页滚动、按钮键盘焦点、Escape不改变当前页面/焦点、前进/后退/刷新与scrollY恢复、同页导航不增加History长度。
- URL主视图均为 /，标题沿用index；应用导航保留view/depth/scrollY。原生同文档/#culture先保留Hash且history.state=null，刷新后App恢复首页并规范化为/；不存在Hash路由或MainBrowser，不新增标题/URL语义。
- 产品库nArS/price-asc经过指南/文化返回仍保留；产品详情打开、内部滚动、关闭控件焦点及Escape，收藏“想买→正在用”、两页进出/History返回及刷新保留原始JSON；完整资料/products/estee-lauder-double-wear进入文化后返回、刷新保持。
- 小Y原快捷问题纯本地回复、画像/工作台字段和保存消息经过指南/文化返回保持；首页可返回，开幕/主入口无新增行为。没有API/provider调用，不把本地回归扩张为在线问答/方案生成已重验。

上述前后全部记录的文字、入口、URL/Hash/标题、History长度/状态、焦点/overflow、文化滚动、筛选排序/产品ID/收藏与小Y及所记录控件几何差异0；不声称严格像素一致。已实际查看迁移前桌面指南/手机文化/桌面详情，及迁移后桌面和手机指南/文化全文截图。所检控件无重叠、文档无横向溢出；文化为整页而非内部滚动弹层。原产品详情关闭焦点BODY、overflow空串等基线保持，未实现焦点陷阱/恢复或新增背景锁滚动，不能把该迁移称为无障碍整改。

前后pageerror均0、非预期console.error为0、本地资源失败和HTTP>=400均0、API请求0；各22次fonts.googleapis.com请求被环境ERR_NETWORK_ACCESS_DENIED，console中同样各22条对应资源错误，完整URL/原因保留，不写成所有资源错误为0。正常本地素材/字体引用不移动，外部字体成功后的排版未验证。

失败保留：首轮.qa/arch-09-before/为8/10，两视口Hash场景错误预期同页Hash跳转已执行挂载，实际history.state为null；仅修测试加入原生Hash与刷新分开断言。次轮.qa/arch-09-before-final/为9/10，桌面减少动效开幕自动结束使跳过按钮在点击时卸载，定位器超时；仅将测试跳过点击改为1秒，并仅在按钮确已消失时继续等待首页就绪。最终在生产源码未迁移时取得before-complete10/10，再实施源码迁移；迁移后同脚本10/10。原失败JSON/截图保留，不用业务修改迎合测试。文档工具首次README patch因旧缩进锚点不匹配未应用，改用精确校验后更新，无生产影响。

本地证据：.qa/arch-09-before-complete/、.qa/arch-09-after/和.qa/arch-09-checks/（before.json、源码核对、browser-comparison.json等）。QA截图/临时脚本与合成数据忽略不提交。关键图为两目录的1440/360-guide-entries-filters.png、culture-history-scroll.png及catalog-collection-detail-drawer.png；实际查看范围如上，不声称所有截图均逐张人工检查。

用户体验入口：[本地主站](http://127.0.0.1:5200/)的“肤质指南 / 品牌文化”；360px先打开导航。指南“按此筛选”进入原产品库；文化页底部“浏览产品库”可返回现有筛选。README实际/目标结构、当前依赖与测试路径已同步；文化品牌SVG /assets/logo/yaspretty-monogram.svg?v=20261104-y-seal-lines、全局CSS/字体、第三方视觉源码与许可引用路径未改。AGENTS.md、FINAL-PROMPT.md、server/public/data/contracts/依赖/视频/比赛材料未改，不把代码组织迁移描述为新AI、视觉或商品能力。

**本阶段无新增核验，继承上一条结论。** 未新增产品、价格、规格、色号、店铺、链接、成分/功效、评分样本或图片授权证据。原图片pending/blocked、来源披露不等于授权、品牌官网商品页/e.tb.cn与直接官方旗舰店链接政策差异和公开门禁保持；文化文案未改，不将其中“真实体验”等编辑表达升级为独立实测证据。无真实Key/.env/旧memory/用户照片或个人画像/对话读取，无新上传、持久化、日志或第三方个人数据处理；测试只使用临时合成数据。

未覆盖真实手机/触摸、其他浏览器/系统、默认动效、字体成功后的排版、严格像素、实际弱网/断网/存储配额或权限、生产同源HTTP/provider/在线模型及穷尽GPU/泄漏；不扩大此前阶段验证结论。既有收藏null/写失败和lazy下载拒绝根卸载、大分包/弃用、来源授权风险继续保留。

回退范围为上述9路径。上一已验收归档点是 **aee4175bd09be01b065d5875c0f1305e55410cd9 / arch-stage-08**；当前未提交现场不是新的Git恢复点，不自动暂存、stash、清理或覆盖。人工通过并实际归档后按本阶段真实提交及后续ARCH-10 App装配/ARCH-11引用依赖评估授权git revert，从新到旧撤销必要范围并重跑验证；不承诺任意提交无冲突，Git不恢复浏览器数据、环境变量或外部服务状态。原标签与历史保留。

**当前为待人工验收、未提交、未推送、未创建 arch-stage-09，暂存区为空。** 没有本阶段修改后SHA、整阶段人工确认人/日期/通过结果；负责人此前选择仅确认本次迁移范围。按本任务第七节及AGENTS.md 13.2等待整阶段明确人工验收后再执行获授权收尾，不标09 done、不实施10/11、不删除分支。


**2026-11-17 17:09（北京时间）ARCH-09 最终自动核对**：node .qa/arch-09-checks/verify-final.mjs退出码0；精确9路径/3个guide-culture文件、master及基线aee4175、原08标签对象/指向、空索引和无09标签通过。两份累计报告只追加、ARCH-00～08执行正文及ARCH-10/11计划正文不变，12阶段正文/总表一致且09唯一current；README158实际树路径、15本地链接/锚点、4第三方源码路径、176相对引用/无循环及39个测试文件核对通过。两页面主体及App其余源码与归档原文相同；前后10/10全部evidence差异0；新增MJS语法、全部9路径UTF-8/末尾换行/无行尾空白及git diff --check、git diff --cached --check通过。此轮只同步文档与只读核对，沿用本次已实跑86/86、309/309、build2898及前后各10/10，不虚构重复运行。当前仍待人工验收、未提交、未推送、未创建 arch-stage-09；10/11pending，无分支删除。**本阶段无新增核验，继承上一条结论。** 补记后再复核文档/范围/空白，原失败、字体拒绝、无障碍与未覆盖限制保留。

**2026-11-17 17:18:20（北京时间）ARCH-09 整阶段人工验收通过与归档收尾，YAS-2026-0055**

- 项目负责人在本会话明确回复“人工核验通过”，确认本次 ARCH-09 完整阶段；此前“按实际基线迁移两个页面（推荐）”的范围确认与本次整阶段验收分别保留。按 AGENTS.md 13.2，ARCH-09 立即改为 done，ARCH-10 登记为唯一 current，ARCH-11 仍 pending；本次仅收尾09，不实施10/11，不删除分支。
- 17:16:16 已重新执行 git fetch origin master 并实际查询远端 master/全部已归档 arch-stage 标签：master、HEAD、origin/master、FETCH_HEAD 与实际远端 master 仍为 aee4175bd09be01b065d5875c0f1305e55410cd9，ahead/behind 0/0；arch-stage-08 本地/远端对象 be773944bdae29408bc3eecdfc6789dc831ab0d1、^{}均指向该基线；00～08 标签对象/指向保留，09 本地及远端均未创建。精确九个已验收路径、暂存区为空，无来源不明变更；提交和推送前将再次 fetch 核对。
- 人工确认后只更新 README.md、迁移计划和两份累计报告的阶段状态、验收与收尾记录；五个已验收代码/测试文件 SHA-256 保持原内容。17:16:33 再运行 node .qa/arch-09-checks/verify-final.mjs，退出码0，九路径、源码等价、前后浏览器 evidence、原历史、README 路径/链接、引用/无循环和空白检查通过。沿用本次真实相关86/86、全量309/309、build2898及迁移前后各10/10；不把文档收尾核对写成重复执行了业务测试或扩大真机/provider等覆盖。
- 原 Hash 断言错误、开幕跳过竞态、外部字体环境拒绝、无障碍与未覆盖限制、构建警告和数据/图片/链接风险全部保留。用户入口仍为主站“肤质指南 / 品牌文化”；UI、导航、History、存储、API和隐私边界未变。AGENTS.md、FINAL-PROMPT.md、产品/素材、服务端、视频及比赛材料无需同步，本次未改。
- **本阶段无新增核验，继承上一条结论。** 不新增或升级商品事实、价格、图片授权、评分样本或公开状态。
- 本条写入时：人工验收已通过，尚未提交、尚未推送、尚未创建 arch-stage-09；上述原“待人工验收”记录为当时快照。按本次明确验收授权，仅暂存已验收九路径，使用规定格式在 master 创建最终确认提交、正常推送并核对实际远端 SHA，再在同一提交创建唯一带注释 arch-stage-09 并推送核对对象/指向。实际修改后 SHA/tag 由收尾回执先行提供，下次文档同步回填；不为自引用 amend、移动标签或虚构成功。
- 上一归档基线为上述 ARCH-08；本阶段实际归档后按真实最终提交及后续 ARCH-10/11 依赖评估获授权的 git revert，从新到旧撤销必要范围并复验。只回退本阶段九路径，不承诺无冲突，不恢复浏览器数据、环境变量或外部服务状态，原提交、标签与失败证据保留。

**2026-11-17 17:19（北京时间）验收后提交前核对**：17:18:53运行 node .qa/arch-09-checks/verify-acceptance.mjs退出码0；精确九路径、五个已验收代码/测试SHA-256未变、累计报告继续只追加、00～08执行正文不变、10只登记状态/启动门禁及11正文未改、12阶段正文/总表一致且10唯一current。README158实际路径/15本地链接锚点/4第三方路径、176相对引用无循环、39测试文件、原源码等价/前后浏览器evidence相同、语法/UTF-8/换行及两项diff --check通过。17:19:39再次fetch和实际ls-remote确认master仍为aee4175bd09be01b065d5875c0f1305e55410cd9，00～08标签保留且09不存在，分支master、ahead/behind0/0、索引空。补记后再复核上述文档/范围/空白；只同步验收收尾，不重复业务测试。本阶段无新增核验，继承上一条结论。提交/推送/阶段标签实际结果仍由回执先行提供、下次同步回填。

### ARCH-10：收敛 `app`

**状态：`done`（2026-11-17 整阶段“人工审核完毕”，按人工验收通过收尾；实际提交/推送/标签见本次回执并下次同步回填）**

**允许范围（2026-11-17 本次负责人明确要求覆盖旧目标）**：`src/App.jsx`、新 `src/features/app-shell/`、本阶段直接引用方、相关 Vitest/独立浏览器脚本，以及 README、本文和两份累计报告。main、品牌开幕、视觉边界原路径保留；不新建 src/app/，不执行 ARCH-11。

**任务**：

- 按真实 DOM 抽取 TopHeader、手机下拉导航及 AppShell，保持类名、结构、文案和事件。
- useAppNavigation 统一导航/详情/History 操作与原四个 Effect，保留 App 的跨页面状态与领域 Hook 实例；不增加 Context 或路由库。
- Sidebar、MobileBottomNav 按实际职责落地；当前不存在这两种结构，不为满足文件名新增 UI。不存在 MainBrowser，按现有页面验收。
- 同场景建立迁移前后行为证据并补就近测试；只移除本阶段被迁出的旧结构，不开展最终死文件清理。

**验收**：所有页面入口、浏览器前进后退、产品深链接、移动菜单、Escape 关闭和返回顶部行为不变；测试、构建和完整主流程回归通过。

**执行记录**：2026-11-17（北京时间），负责人对ARCH-09完整阶段明确回复“人工核验通过”，按AGENTS.md 13.2登记本阶段为唯一current。本次仅收尾09，未实施10；开始10前必须先定位09实际最终提交及远端arch-stage-09归档并重新核对。

**2026-11-17 17:26–17:39（北京时间）ARCH-10 启动与迁移映射，YAS-2026-0055**

先执行 git fetch origin master，沙箱写 FETCH_HEAD 拒绝后同命令获准重试成功；实际 ls-remote 普通通道 Schannel 失败，同命令权限重试成功，无配置/凭据修改、无自动审批拒绝。核验时 master、HEAD、origin/master、实际远端 master 与 ARCH-09 最终归档提交均为 `8cbac32e0e1cc480f6b573688f05c3caa93c27a3`，ahead/behind 0/0；arch-stage-09 本地/远端带注释对象 `72428c4ce8b4dc2a81213fc78a3bda0e489907bc`，^{} 均指向该提交；起始工作树、暂存及未跟踪为空。09整阶段人工通过记录存在，10唯一current，11pending，启动门禁通过。回填09实际归档，原待提交快照保留。

负责人本次明确要求 features/app-shell，覆盖原 src/app/、移动开幕/main/视觉边界目标；ARCH-00 清单保留历史，不改 AGENTS/FINAL-PROMPT。实际没有独立侧栏、底部导航或 MainBrowser；不虚构已迁移对象。App 的完整328行及直接引用/测试用于下列映射（原行号取上述基线）：

| 原位置、状态/Effect/Ref/回调 | 依赖与引用方 | 本次归属与边界 |
| --- | --- | --- |
| App:42 currentNavigationEntry | lib/navigation-history、catalogService；初始化、snapshot、navigate、详情关闭 | 移入 useAppNavigation 模块；原无效产品/抽屉ID规范化不变 |
| App:50 initialEntry、:52 openingActive、:53 view | 初次 History/路径、开幕/主视图、所有条件渲染 | App保留跨页输入；传给导航Hook，不复制状态 |
| App:54 useCatalog（filters/sort/panel/results及操作） | Home/Guide搜索筛选、Library、Escape | App唯一实例保持；setFilterPanelOpen供导航Hook关闭面板 |
| App:55 useCollection（collection/favoriteCount/操作） | Header计数、Home/Library/Collection/两种详情 | App唯一实例保持，同对象/操作通过props与插槽连接 |
| App:51/56/57 profileProduct、selectedProduct | 初始深链接/History，产品页/详情抽屉 | useAppNavigation持有；App继续连接实际产品与收藏控件 |
| App:58 mobileMenuOpen、:59 makeupFocusAppliedRef、:60 completeOpening | Header菜单、首页仅一次聚焦、BrandOpening回调 | 导航Hook，原顺序为selected/profile/menu/ref/callback；不增加持久化 |
| App:62 开幕锁滚动Effect | [openingActive,view]；body/root overflow快照与清理，scrollTo auto 0 | 导航Hook第1个原Effect |
| App:76 首页聚焦Effect | 同依赖、ref仅一次；RAF scrollTo 0、2600ms timer及清理 | 导航Hook第2个原Effect；不新增RAF取消语义 |
| App:94 Escape Effect | [selectedProduct]；关闭详情、setFilterPanelOpen(false) | 导航Hook第3个原Effect；不让Escape新增关闭手机菜单 |
| App:107 History Effect | [initialEntry]；manual scrollRestoration、replaceState、popstate监听/清理 | 导航Hook第4个原Effect；原解析/scroll时机不变 |
| App:123/128/133 runSearch/chooseQuickFilter/openCategory | useCatalog操作后navigate(library)，Home/Guide/化妆台 | App保留跨领域连接 |
| App:137–214 apply/snapshot/push/replace/navigate/open/close详情 | History state的marker/view/depth/scrollY、productId/drawerProductId；RAF恢复 | 导航Hook；同页smooth顶滚，不加History；抽屉替换/新开、depth回退不变 |
| App:217–284 页面条件与产品抽屉 | 七种页面、原领域props/statusControl插槽 | App保留页面与overlay连接，作为children/overlay交AppShell |
| App:217根div、opening、Header、main、Footer、抽屉兄弟序 | 现有CSS、品牌素材、图片说明与删除联系 | AppShell保持原DOM层级，开幕/overlay为原节点插槽；Footer留Shell内部 |
| App:287 Header全部DOM与navItems | activeView映射product→library、favoriteCount、onNavigate、menu回调 | TopHeader及MobileNavigation（原下拉nav）；无Sidebar/BottomNav |
| App:25 EnhancementBoundary | HomeView prop、原精选fallback；BrandOpening仍在components | 本次留App，不提前执行旧目标或ARCH-11 |
| 小Y/工作台加载、请求、草稿、来源弹层 | useAssistant/useMakeupPlan各自状态/effect与API；App只条件挂载入口 | 原域实现不动；无请求序号/主动取消/过期屏障；卸载后新实例不接收旧响应，重置会话不会取消在途请求 |

原Hook展开顺序（initial/opening/view→catalog→collection→selected/profile/menu/ref/callback）及Effect先后保持；领域状态不进入Shell或Context。消息/画像由原本地存储恢复；草稿、工作台结果/手填条件离页重置，不能把目标中的持续恢复写成已有能力。详情原无焦点陷阱/主动背景锁滚动，关闭后焦点可为BODY；本阶段保留并测试，不称无障碍整改。

迁移前已实跑相关14文件121/121、npm test 39文件309/309、npm run build 2898模块（17:28–17:32），Three.js弃用与>500kB提示保留。已有catalog与guide脚本分别14/14、10/10；新arch10脚本首轮0/12（12场景全部失败）因等待load遇外部字体pending超时，改为DOM就绪+真实UI状态；次轮滚动断言错误（自动把顶部导航滚入视口改变快照）保留，改走文化页底部真实按钮，不修改生产源码迎合测试；最终基线结果后续追加。所有浏览器为已有Playwright/Chrome临时上下文，不读个人档案或真实Key。

修改前归档点为上述09提交/tag。当前工作树尚非Git恢复点；未来人工通过并归档后，按App/Shell/Hook及后续11依赖评估获授权revert，从新到旧撤销必要范围并重验；Git不恢复浏览器存储、环境变量或外部服务。当前未提交、未推送、未创建arch-stage-10，不自动暂存/stash/清理/切换/删分支。


**2026-11-17（北京时间）ARCH-10 整阶段自动交付，YAS-2026-0055**

交付状态：**待人工验收、未提交、未推送、未创建 arch-stage-10**；ARCH-10仍唯一current，ARCH-11 pending且未实施。无本阶段人工确认、修改后提交SHA或标签；暂存区空。09已验收归档的提交/tag与远端核验见上述启动记录。

实际修改共13路径：`src/App.jsx`；新 `src/features/app-shell/components/{AppShell,TopHeader,MobileNavigation}.jsx`、`components/appShell.test.jsx`、`hooks/useAppNavigation.js`、`hooks/useAppNavigation.test.js`、`App.test.jsx`；新 `tests/browser/arch10-app-shell.mjs`；README、本文、累计交付报告、产品数据审计四文档。只删除App中已迁出的Header/Footer/导航实现，没有新建appContext/Sidebar/MobileBottomNav/useOverlay或src/app，不清理其他文件。生产实现4个新文件、App328→142行；既有领域源码、main/开幕/视觉边界、CSS/图标/素材/API/Key/服务端/依赖版本不变。App保留页面与跨领域连接，Shell仅组合原结构，详细状态/Effect/Ref/回调映射见上表。新增3个Vitest文件27项（结构7、App连接9、导航生命周期11），原309项及其文件不变；测试为SSR/元素回调/隔离Hook边界，真实DOM另由Playwright验证。

| 实跑验证（退出码均0） | 结果 |
| --- | --- |
| 迁移前相关测试 / npm test / npm run build | 14文件121/121；39文件309/309；2898模块 |
| 迁移后相关测试，完整命令见累计报告 | 17文件148/148 |
| npm test | 42文件336/336 |
| npm run build | 2902模块；主JS747.03kB/gzip227.76、异步3D1293.47kB/gzip356.09；Three.js弃用与>500kB提示保留 |
| node --check（新增Hook JS、Hook测试JS、浏览器MJS） | 通过；JSX由Vitest/Vite编译验证 |
| git diff --check / git diff --cached --check | 通过；新文件空白另行核对 |
| 新arch10脚本，开发5201迁移前/后 | 各12/12 |
| 未修改的arch06-catalog / arch09-guide-culture脚本，迁移前/后 | 各14/14、10/10，共各36/36 |
| node .qa/arch-10-checks/compare.mjs | 36场景的记录evidence差异0、请求差异0（含所记录布局字段；非像素比较） |
| 新arch10脚本，生产构建预览5202 | 12/12 |
| node .qa/arch-10-checks/smoke.mjs，实际Fastify同源8787 | health ok/assistant=false；HTML/构建JS/产品深链接200，问答503/PROVIDER_NOT_CONFIGURED，方案200/local/7步/photoEnabled=false |

浏览器为已有Playwright/Chrome157.0.8103.52，独立合成上下文，1440×900及360×800、DPR1。除开幕/菜单/筛选场景默认动效外使用减少动效。覆盖全部现有导航/标题/激活/页面条件，URL/Hash规范化、History/前后退/刷新、有效及无效产品直达、详情抽屉替换/全页/关闭/焦点/内部滚动、收藏同步、首页/指南/文化入口、35个单项筛选和搜索排序/空态、手机菜单及筛选Escape、开幕滚动锁和返回滚动、画像预填/消息恢复/草稿原重置、挂起请求加载/离页重挂载释放旧响应、7步方案/重复提交禁用/空响应/超时/重试/预算重生成及离页原重置。MainBrowser、侧栏、底部导航不存在；未补造验收对象。小Y重置不取消在途响应、无请求序号/主动取消/过期屏障、草稿/工作台不跨挂载保留、抽屉无焦点陷阱/主动背景锁/关闭后焦点BODY、Escape不关手机菜单，均为原基线，不描述为本阶段修复。

前后逐项比较全部记录导航/URL/Hash/标题/History、产品ID/收藏/筛选排序、请求/加载/结果、焦点/滚动和所检控件布局一致；滚动测试使用文化页底部真实按钮避免Playwright先把header滚入视口。无文档横向溢出/所检按钮输入重叠。实际查看前置手机菜单/桌面方案/手机抽屉及迁移后手机方案/桌面指南/手机抽屉/桌面在途加载截图，另查看生产桌面首页3D与手机结果；截图清单及限制见累计报告。不声称严格像素或所有动态帧一致。

控制台/资源：全部成功套件pageerror0、badResponses0、无非预期console.error/本地失败。arch10开发前/后各5条console.error/失败请求（3字体环境拒绝+2故意API timedout），各10次API POST；guide前/后各22字体失败；catalog前62/后52（各22字体，故意cover.webp拦截前40/后30，资源时序/加载数量不同，不能称日志计数相同）；生产预览26条（24字体+2故意timedout）、10次API POST。字体/故障日志不删除、不称全零。浏览器API均为受控合成或既有无模型规则，真实HTTP冒烟另列，未验证真实付费provider/联网、真机/其他浏览器、字体成功排版、真实弱网/配额、全部动效/GPU及完整无障碍。

首轮失败保留：.qa/arch-10-before为0/12，默认load等待外部字体pending超时；修正脚本就绪条件到domcontentloaded+真实UI。before-final为9/12，2个滚动断言因顶部定位器自动滚动、1个手机遮罩阻挡菜单；before-complete为11/12，仍为手机遮罩阻挡菜单。改用文化页底部真实入口和浏览器Back/Forward测试遮罩清理，未改业务迎合断言。最终before-accepted 12/12在生产源码迁移前取得。其他临时读取JSON曾因Python默认GBK解码失败，改UTF-8后完成统计，无生产影响。

证据均在忽略的.qa：arch-10-before-accepted/arch-10-after（新脚本）、arch-10-before-catalog/arch-10-after-catalog、arch-10-before-guide/arch-10-after-guide，各results.json及PNG；arch-10-production为构建回归；arch-10-checks/browser-comparison.json与production-http.json保存对照/HTTP结果。临时8787服务禁用dotenv文件读取并显式空Key，提供构建/API供人工体验；5201为开发、5202为构建预览。没有读取真实.env/Key/照片/用户画像或对话，没有新上传/日志/持久化位置；API/存储/错误/降级和产品事实/来源/授权状态不变。**本阶段无新增核验，继承上一条结论。** README同步真实树/依赖/测试/披露路径；两份累计报告追加记录；AGENTS/FINAL-PROMPT、视频与比赛材料未改，不能据此升级其未验证表述。

回退边界：上述13路径尚未提交，不是新Git恢复点；上一可定位归档为ARCH-09的8cbac32e0e1cc480f6b573688f05c3caa93c27a3/arch-stage-09。人工确认并实际归档后，需按App→Shell/Hook与后续ARCH-11依赖评估授权revert，从新到旧撤销必要范围并重验；Git不恢复浏览器/环境变量/外部状态，不自动清理、stash、丢弃或建立备份提交，保留历史、失败和原标签。


**2026-11-17 18:01:16（北京时间）ARCH-10 最终自动核对**：node .qa/arch-10-checks/verify-final.mjs退出码0，精确13路径、app-shell七文件（四生产/三测试）、master/ARCH-09基线及本地09标签、空暂存区和无10标签通过；两报告只追加、ARCH-00～09执行正文及ARCH-11正文未改、12阶段正文/总表一致且10唯一current。README169实际树路径、16本地链接/锚点、4第三方源码路径及本阶段39相对引用有效；未执行ARCH-11全局导入/死文件扫描。原39测试文件内容不变、总42测试文件；原导航函数/四Effect/状态顺序/跨域回调/页面props/抽屉/顶部与手机DOM/Footer/视觉边界源码等价，三JS/MJS语法、全部13路径UTF-8/换行/行尾空白及两项git diff --check通过。保存的前后各36场景evidence/请求差异0、生产12/12和真实无KeyHTTP证据均核对。临时源码对照首轮因截取器结束标记先于起点导致“Mobile DOM unchanged”断言失败，修正截取器和状态变量定位后通过；只改临时核对脚本，无生产影响，未掩盖失败。此轮为文档/只读核对，沿用已实跑148/336/build2902与页面结果，不冒称业务测试重跑。补记后再次核对。当前仍**待人工验收、未提交、未推送、未创建 arch-stage-10**；11 pending且未实施，无删分支。**本阶段无新增核验，继承上一条结论。**


**2026-11-17 18:06:54（北京时间）ARCH-10 整阶段人工验收通过与归档收尾，YAS-2026-0055**

- 项目负责人在本会话对已交付的完整13路径明确回复原话“人工审核完毕”；本次按整阶段人工验收通过收尾，ARCH-10立即改done、ARCH-11仅登记为唯一current且未实施。不虚构负责人的设备/操作或其他人工检查细节，不扩充真实provider/真机/无障碍等未验证结论，不推定分支删除授权。
- 18:04重新执行git fetch origin master，普通沙箱FETCH_HEAD权限失败后同命令权限重试成功；18:05实际git ls-remote查询确认master/HEAD/origin/master/FETCH_HEAD/实际远端master均为8cbac32e0e1cc480f6b573688f05c3caa93c27a3，ahead/behind0/0。00～09本地/实际远端标签对象和^{}指向均一致保留，arch-stage-09对象72428c4ce8b4dc2a81213fc78a3bda0e489907bc、^{}为上述基线；10本地/远端未创建。精确13个已验收路径，暂存区空、无来源不明文件；没有改配置/凭据、没有自动审批拒绝。
- 18:05:08再次运行node .qa/arch-10-checks/verify-final.mjs退出码0，13路径、源码等价、原测试/阶段历史/ARCH-11正文、前后页面证据、README路径/链接/披露、语法/编码/空白检查通过。确认后只更新README、迁移计划及两累计报告；九个已验收代码/测试/脚本以SHA-256快照逐一核对不变。沿用真实相关148/148、全量42文件336/336、build2902、前后各36/36、生产构建12/12及真实无Key同源HTTP证据，不把文档/只读收尾核对写成重跑业务测试。后续收尾验证实际结果另追加。
- 首轮0/12、9/12、11/12脚本错误及截取器首轮失败、字体环境拒绝、故意封面/超时日志、原请求/草稿/焦点缺口、存储与lazy风险、构建提示和数据/链接/图片授权风险全部保留。**本阶段无新增核验，继承上一条结论。** API、存储、隐私和素材/产品事实不变；AGENTS/FINAL-PROMPT、服务端、视频/比赛材料不修改。
- 本条写入时：ARCH-10已人工验收通过、done，尚未提交、尚未推送、尚未创建arch-stage-10；此前待验收/current记录均为真实历史快照。按本次确认及AGENTS.md 13.2只暂存已验收13路径，在master以规定格式创建最终确认提交、正常推送并核对实际远端SHA，再于同一提交建立唯一带注释arch-stage-10并推送核验标签对象及^{}。实际SHA/tag由收尾回执先提供、下次文档同步回填，不为自引用amend/移动标签或虚构成功，不实施ARCH-11或删除分支。
- 上一归档为上述ARCH-09。实际归档后按最终提交及App→Shell/Hook、后续ARCH-11依赖评估获授权revert，从新到旧撤销必要范围并复验；范围仍13路径，不承诺无冲突，Git不恢复浏览器/环境变量/外部状态，保留原提交/标签/失败证据。


**2026-11-17 18:08:49（北京时间）ARCH-10 验收收尾自动核对**：18:07:42运行node .qa/arch-10-checks/verify-acceptance.mjs退出码0；九个已验收代码/测试/脚本SHA-256不变、精确13路径、索引空、master/ARCH-09基线/09标签及无10标签、两累计报告只追加、ARCH-00～09执行历史不变、ARCH-10 done与ARCH-11仅登记current通过。12阶段正文/总表一致，README169实际树路径/16本地链接锚点/4第三方路径、本阶段39相对引用、原39测试文件/源码等价/前后各36场景记录及生产12/12和无KeyHTTP证据、语法/UTF-8/换行/空白均通过。18:08:11再次fetch及实际ls-remote核对master仍为8cbac32e0e1cc480f6b573688f05c3caa93c27a3、00～09标签保留且10不存在，HEAD/origin/master/FETCH_HEAD一致。只同步验收文档、沿用已实跑业务验证，不称重跑测试。补记后复核，再仅暂存已确认13路径并核对blob；实际提交/推送/标签仍待本次回执。**本阶段无新增核验，继承上一条结论。**


**2026-11-17 18:09:31（北京时间）ARCH-10 提交前暂存核对**：18:09:08以YAS_QA_VERIFY_STAGED=1运行node .qa/arch-10-checks/verify-acceptance.mjs退出码0，暂存清单精确匹配已验收13路径、各blob与工作树经Git过滤内容相同，无未暂存或未跟踪文件；九代码/测试/脚本哈希不变，阶段状态、原历史、两报告只追加、路径/链接/源码等价/语法/页面证据及工作树与索引空白检查通过。只补记本条、重新暂存三份记录并复核，不改实现/验证范围。最终确认与收尾记录纳入本次ARCH-10提交；此时新SHA/推送/标签尚未产生，实际结果由回执提供。**本阶段无新增核验，继承上一条结论。**

### ARCH-11：整体清理与最终回归

**状态：`done`**

**允许范围**：仅src确有必要的导入/引用/迁移残余、相关测试/浏览器脚本与README/本文/两累计报告，不新增功能或视觉调整。负责人在真实生产故障调试后明确“授权这项最小服务端修复”，例外允许server/app.cjs增加产品深链接路由及相关验证；其余src/data、public、server、AGENTS、FINAL-PROMPT、产品素材/视频/比赛材料禁改范围保持。

**任务**：

- 检查重复文件、旧路径、无效导出和循环依赖。
- 检查组件中是否仍散落新的 `fetch` 或 `localStorage` 逻辑。
- 检查 `lib` 不依赖 features，`makeup-plan` 不反向依赖 assistant。
- 运行 `npm test`、`npm run build` 和 `git diff --check`。
- 检查桌面与 360px 级手机视口、浏览器控制台及主要成功、失败、降级路径。
- 将 README 当前实际结构更新为最终落地状态，核对第三方披露中的所有迁移路径。

**验收**：目标结构真实落地，验证结果可复跑，文档与代码一致，所有剩余问题明确记录。

**执行记录**：2026-11-17，负责人对ARCH-10完整阶段回复“人工审核完毕”，按AGENTS.md 13.2登记本阶段为唯一current。本次仅收尾10，未实施11；开始11前须先核对10最终提交/实际远端标签归档。

#### 2026-11-17（北京时间）ARCH-11 实施与最终交付记录，YAS-2026-0055

交付状态：**待人工验收、未提交、未推送、未创建 arch-stage-11**。ARCH-00～10 保持 done，ARCH-11 保持唯一 current；没有提前宣布本轮迁移完成。本次没有新问题编号、功能、依赖、产品事实、素材、存储或降级语义变更。项目负责人在发现生产深链接失败后，明确回复 **“授权这项最小服务端修复”**，例外仅覆盖 `server/app.cjs` 产品深链接路由及相关测试、完整复验；其余原禁止范围保持。不以这项授权推定 Git 收尾授权。

**启动门禁与 ARCH-10 归档回填**

先执行 `git fetch origin master`；首次沙箱写 FETCH_HEAD 失败，同命令权限重试成功。普通 `git ls-remote` 曾报 Schannel 凭据错误，同命令权限重试成功，没有修改凭据、Git 配置或自动审批拒绝。2026-11-17 **18:31:10**（北京时间）再次实际查询远端 `master` 和所有 `arch-stage-*`：

- 分支 master；HEAD、origin/master、实际远端 master、ARCH-10 最终归档提交均为 **f8fcbfa2673af1b9f9f470796f6a206aedeffcc9**，ahead/behind 0/0。启动工作树、暂存区和未跟踪均为空。
- 本地及实际远端带注释 `arch-stage-10` 对象均为 **d51f5ee44f5140be1c38a2e4b6be133f2ca144c6**，`^{}` 均指向上述提交；ARCH-00～09 标签对象和指向保留，无 arch-stage-11。
- ARCH-10 整阶段负责人原话“人工审核完毕”、done、实际提交/推送/归档存在；ARCH-00～10 done、11 唯一 current，未自行改阶段状态后启动。上阶段文档写入时尚未产生的 SHA/tag 在此按实际结果回填，历史快照、失败、豁免与风险原文保留。
- 原始远端结果：`.qa/arch-11-checks/remote-refs.txt`。本次只读核对没有切换、清理、覆盖、暂存、stash、提交、推送、打标签或删除分支。

**最终目录与导入映射**

完整真实 `src/` 树、测试入口和职责见 README“当前实际结构 / 本轮最终职责映射”；AST 全图见 `.qa/arch-11-checks/import-audit-final.json`。

| 阶段/职责 | 最终实际位置与引用 | 旧目标/保留边界 |
| --- | --- | --- |
| ARCH-00 契约 | `src/contracts/` 六个 JSDoc 文件，由领域模块/契约通过类型 import 使用 | 没有运行时 schema，不把无运行时可达性当死文件 |
| ARCH-01 存储 | `lib/storage/{storageClient,storageKeys,migrations,clearUserData}.js` → 小Y/收藏 | 旧 xiaoy-storage.js 无运行入口或转发 |
| ARCH-02 方案 | `features/makeup-plan/` 的 API、Utils、Hook、四展示组件 | 小Y与工作台共用方案 API；无 assistant 反向依赖 |
| ARCH-03 小Y | `features/assistant/` 的 API、Utils、intentUtils、Hook、四展示组件 | `components/XiaoYAssistant.jsx` 仍有标题/快捷问题/输入/工作台组合职责；非空转发 |
| ARCH-04 API | `lib/api/{client,errors}.js` → 两个领域 API | 公共层无领域/React/存储反向依赖；仅此处执行前端 HTTP fetch |
| ARCH-05 化妆台 | `features/makeup-table/components/` 与 `makeup-table-3d/`、三 CSS | Experience 由 HomeView lazy 导入；内部场景不泄露到 App；2D 为真实降级 |
| ARCH-06 产品库 | `features/catalog/` Utils/Service/Hook/五展示组件 | App/首页/导航真实消费；产品事实仍唯一来自 data |
| ARCH-07 收藏 | `features/collection/` Utils/Storage/Hook/两展示组件 | App 单实例，通过 props/插槽共享；catalog 与 collection 不互相导入 |
| ARCH-08 首页 | `features/home/components/HomeView.jsx` | 负责人确认保持共享视觉原路径，未创建 homeContent、模板或技法预览 |
| ARCH-09 指南/文化 | `features/guide-culture/components/{GuideView,CultureView}.jsx` | 已确认合并 feature；没有 MainBrowser/文化弹层/useOverlay |
| ARCH-10 应用 | `App.jsx` → `features/app-shell/components/` 与 `hooks/useAppNavigation.js` | main/BrandOpening/EnhancementBoundary 原路径；无 src/app、侧栏、底部导航 |
| ARCH-11 最终核对 | 入口 `index.html → main.jsx → App.jsx`，App 当前实际 130 行 | 保留应用组合、唯一 catalog/collection、真实跨页连接和已有视觉边界；没有继续拆分 |

扫描同时覆盖静态/动态导入、re-export、JSDoc 类型引用、字符串模块引用、Vite 入口、测试、大小写、CSS/公开资源、纯转发、重复函数体、未用导出、空目录和依赖环。现有 Vite/Rolldown AST 解析，无新依赖；**117 个 src 文件、122 个解析模块、72 个生产 JS/JSX、214 条相对运行/测试边、39 条类型引用、44 项字符串模块引用、121 项字面资源引用**。缺失/大小写错误/边界错误/循环/纯转发/未用导入/未用导出/空目录均为 0。字符串中的外部 Playwright 环境模块是显式外部测试运行时；历史源拦截用字符串是故障注入，不是运行导入。业务组件没有新增 fetch/localStorage：HTTP 在 lib/api/client，实际持久化在 lib/storage；GhostCursor 的 GLSL `fetch` 是着色器函数。

**实际删除项及证据**

整文件删除 **0**，目录删除 **0**。没有仅凭搜索删除文件。只收回两项无消费者的导出，函数/常量本体和内部引用保留：

| 项目 | 原职责 / 最终去向 | 无引用与验证证据 |
| --- | --- | --- |
| navigation-history.js 的 MAIN_VIEWS 导出修饰符 | 导航合法视图列表，仍是本模块内部常量 | 清理前 AST 图及 src/tests/脚本字符串搜索无外部导入；内部 createNavigationEntry/resolve 仍使用；导航测试、全量、构建与 History 回归通过 |
| StrokeText.jsx 的 prefersReducedMotion 命名导出语句 | 本组件减少动效判断，函数与调用仍留原文件 | 静态/动态/测试/字符串无消费者；BrandOpening 的同名导出是另一函数且有测试，未删除；构建与原开幕/首页回归通过 |

另将 `contracts/assistant.js` 中旧 xiaoy-storage 注释更新为真实 `features/assistant/hooks/useAssistant.js` / `lib/storage/`，不改变类型或运行代码。

**保留的可疑残留与原因**

- 六个 contracts 是唯一未从运行入口到达的生产 JS，含真实 JSDoc 引用；`export {}` 只声明类型模块，非业务转发，按 ARCH-00 约定保留。
- XiaoYAssistant、BrandOpening、FlexCarousel、ScrollFloat、StrokeText 及相应 CSS 有真实装配/共享视觉职责和静态或动态消费者；没有为追求目标树挪路径。BrandOpening 与 StrokeText 的两段短 reduced-motion 判断体相同，属于局部适配；为此提炼公共函数会扩大本阶段范围，保留。
- MakeupTableExperience 的装配与错误边界不是无意义转发；`LegacyMakeupTable` 是正在使用的 2D fallback 别名，内部 3D、GhostCursor、cosmetics/performance 均有引用。
- `src/data/home-featured.test.js` 仍核对受控数据/12 精选及资源，ARCH-08 按确认范围没有创建 homeContent；页面回归覆盖实际精选，未修改 src/data 测试或产品事实。
- 全局 styles/xiaoy CSS 仍由 main 顺序导入，其他 CSS 随真实组件导入；没有按“看起来没用”删除资源。
- beauty-assistant.html 是明确保留的历史备份；ARCH-00 清单、旧阶段报告、失败证据、回退记录、服务端旧 memory 数据、生成脚本与比赛材料保留。历史目录目标只在原记录中追溯，不当作当前路径。

**生产深链接失败、重试与最小修复（本次明确授权的范围例外）**

清理前生产构建实际暴露：正常首页 HTML 966 字节，`/products/nars-light-reflecting` / `/products/estee-lauder-double-wear` HTTP 200 但正文 0 字节、无 HTML 类型，桌面/手机空白。三轮实际 HTTP、Fastify inject、Vite 预览对照相同；Vite 返回完整 HTML。最小独立 Fastify/static 服务复现：真实产品 ID 对应同名图片目录，未带末尾 `/` 的目录处理提前结束空响应；带 `/`、未知 ID 和封面 URL 可用。不是字体、导入清理或产品数据问题。具体证据：`production-deep-link-baseline.json`、`deep-link-debug-retry.json`、`deep-link-minimal-reproduction.json`、`deep-link-directory-debug.json`，均在 `.qa/arch-11-checks/`。

首先按原禁止 server 规则只报告，负责人随后明确授权最小服务端修复。实际只在 `server/app.cjs` 的 serveStatic 分支、现有静态注册后增加 `GET /products/:id → reply.sendFile('index.html')` 及两行说明，避免该地址进入静态目录分支；现有 API、CSP、购买/数据门禁、图片静态路径和前端 URL 保持。新增 `tests/architecture/arch11-production-routes.mjs` 检查 HTML MIME/正文与首页完全相同，以及图片类型与真实字节；不是只检查 HTTP200。

相同专项命令修复前 **37/73，退出1**，35 产品直达及带查询参数的 NARS 地址失败；缺失产品、斜杠和35封面通过。修复后 **73/73，退出0**。已有 ARCH-10 “深链接 HTTP200”历史快照保留；本次更严格的正文检查发现原问题，不把旧 HTTP200 当页面通过。

**真实命令与自动结果**

| 命令 | 本次结果 / 证据 |
| --- | --- |
| 清理前 `npm test` | 42 文件，336/336；18:20:44，3.04s；baseline-test.log |
| 清理前 `npm run build` | 2902 模块，1.83s；baseline-build.log |
| 清理后初次相关测试 | 8 文件49/49；18:34:27；related-test.log |
| 清理后初次 `npm test` | 42 文件336/336；18:36:18；final-test.log |
| 授权修复后 `npm test -- src/components/BrandOpening.test.js src/lib/navigation-history.test.js src/features/app-shell src/features/home src/features/makeup-table server/app.test.js` | 9 文件71/71；18:50:06，1.54s；related-test-final.log |
| 授权修复后 `npm test` | 42 文件336/336；18:50:09，2.30s；final-test-complete.log，原42测试文件均未改 |
| 授权修复后 `npm run build` | 2902 模块，1.27s；final-build.log；既有 >500kB 提示保留 |
| `node tests/architecture/arch11-production-routes.mjs` | YAS_QA_BASE_URL=生产5212；73/73，退出0；production-routes-after.json/log；修复前失败保留 |
| `node tests/architecture/arch11-imports.mjs` | 退出0；上述全图/边界/资源核对，import-audit-final.json/log |
| `node --check` | navigation-history.js、contracts/assistant.js、server/app.cjs、arch11-imports.mjs、arch11-production-routes.mjs、arch11-final-regression.mjs 六文件通过；JSX 经 Vitest/Vite 解析编译 |
| lint | **项目未配置 lint 脚本**，未新增依赖或伪造结果 |
| 架构检查 | package.json 没有独立依赖图/lint 脚本；旧 .qa/arch-XX-checks/verify-final.mjs 为硬编码历史阶段证据，不能冒充11检查；本次新增全局 AST 脚本实际执行 |
| `git diff --check` / `git diff --cached --check` | 最终实际执行结果见末尾交付核对；索引应为空 |

最终构建原始输出（kB / gzip kB）：index.html **0.96 / 0.50**；FlexCarousel CSS **2.58 / 0.94**；MakeupTableExperience CSS **19.04 / 4.58**；index CSS **70.95 / 15.61**；FlexCarousel JS **7.12 / 2.86**；src 异步 JS **44.20 / 12.91**；主 JS **747.03 / 227.76**；3D Experience JS **1293.47 / 356.09**。构建前后完整 dist 270 文件 SHA-256/大小对照见最终核对；Three.js CJS 弃用提示及大包警告保持，不升级为已解决。

**最终浏览器回归、截图与请求**

使用已存在的外部 Playwright 运行时和本机 Chrome **157.0.8103.52**，未安装依赖；1440×900、360×800，独立临时上下文/合成存储。原脚本中的 reduced-motion、少量默认开幕/轮播与真实 WebGL 场景保留。开发与静态预览成功/失败响应由现有 route 拦截或本地无模型规则合成，必须与真实无 Key Fastify/离线检查区分。

复跑环境：`YAS_QA_PLAYWRIGHT_MODULE=file:///C:/Users/%E5%B4%94%E9%A6%A8%E7%91%9C/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`，`YAS_QA_BROWSER_EXECUTABLE=C:/Program Files/Google/Chrome/Application/chrome.exe`；`YAS_QA_BASE_URL` 选择下表本地服务，`YAS_QA_OUTPUT_DIR` 指定独立输出。

| 命令 / 场景 | 基线 | 最终 |
| --- | --- | --- |
| `node tests/browser/arch11-final-regression.mjs`，Vite5211，九套原脚本 | 116/116，.qa/arch-11-before | 116/116，.qa/arch-11-final |
| 九套数量（storage / plan / assistant / table / catalog / collection / home / guide / app-shell） | 14/14/8/16/14/16/12/10/12 | 同一组断言，未放宽 |
| `node tests/browser/arch11-final-regression.mjs --static-preview`，Vite5213，原构建 | 36/36，.qa/arch-11-before-static | 最终构建与基线字节比较另核对；不把静态预览当实际网关 |
| `node tests/browser/arch11-final-regression.mjs --production`，实际无 Key Fastify5212 | 初次60场景32通过，失败保留于 .qa/arch-11-before-production | 38/38，.qa/arch-11-final-production；适用 storage14/guide10/shell12 +真实在线/离线2 |
| `node tests/browser/arch11-final-regression.mjs --production --live-only` | 修正测试后2/2，.qa/arch-11-before-production-assets | 包含在最终生产组合中 |

真实生产检查：启动时禁止 dotenv 读取 .env，显式空 Key、不发起真实 provider 调用；健康 assistant=false。270 个 dist 文件逐一实际 HTTP200、非 HTML 资源无 HTML 伪响应、字节与本地构建一致；预算-1 API 返回400/VALIDATION_ERROR，浏览器原生非法预算阻止发送；合法表单真实返回本地7步；外部普通问题实际503/PROVIDER_NOT_CONFIGURED；临时浏览器 offline 后外部问答明确失败、本地推荐/已加载产品库仍可用。不是实际智谱、真实联网检索或弱网验证。

开发原脚本覆盖首页CTA/六快捷筛选/小Y四问题与精选/3D、画像/消息存储恢复与清空、工作台字段/优先步骤/生成/改条件重生成、产品搜索/35单项筛选/排序/空态/详情、深链接/刷新/前进后退、收藏新增/三状态/移除/跨页/刷新、指南/文化、顶部/手机菜单、加载/挂起离页重挂载、Escape/焦点/背景及内部滚动。未存在的模板/技法预览、独立单步骤调整/工作台清空、MainBrowser/文化弹层、桌面侧栏/手机底部导航列为不适用，不伪造已验收。busy、离页重挂载可观察，但原实现没有主动取消/序号/过期响应屏障；reset 不取消在途请求，不能称这些能力通过。

实际查看清理前桌面首页、手机工作台/详情，以及清理后同类关键截图；最终生产截图查看结果在交付核对补记。基线与清理后的前端产物和布局证据结合检查，不声称严格像素一致。早期 evidence 对比除几何/计时外状态相同；3D 手机控件曾整体纵向相差240px（取景/滚动位置），两项6秒等待实测时长不同，未把几何差异删除或写为0。关键截图相对仓库路径：

- `.qa/arch-11-after/arch08-home/1440-entry-cta-assistant-hero.png`
- `.qa/arch-11-after/arch10-app-shell/360-workbench-generation-failures-result.png`
- `.qa/arch-11-after/arch09-guide-culture/360-catalog-collection-detail-drawer.png`
- 最终 `.qa/arch-11-final/` 同目录，以及 `.qa/arch-11-final-production/` 的实际无 Key/离线截图和各套页面截图。

所检正常页面无新增文档横向溢出/控件遮挡或不可关闭详情；完整布局稳定性/CLS、全键盘无障碍和焦点陷阱未验收。pageerror/console/request 逐场景原始记录保留；正常场景没有非预期未处理异常。故意收藏 null/写失败导致6条预期 pageerror/根卸载、lazy 下载拒绝导致2条预期 pageerror，既有缺口不因脚本预期而成为通过的产品能力。Google Fonts 环境拒绝、故意图片/超时/HTTP错误及实际离线错误均单列；不声称所有 console.error/失败请求为0。最终实测汇总见交付核对。

**失败记录与修正**

1. AST 审计初稿把示例 JSDoc、资源查询串和测试中的产品 URL 误判为模块/资源；只修扫描器，保留 import-audit-before.json，修正后基线与最终通过。StrokeText 去导出时 EOF 多空行曾触发 diff --check，已修正。
2. README 临时生成脚本首轮缺少函数闭合括号报 SyntaxError，未写入 README；只修临时工具再执行，不影响生产代码。
3. 初次生产误把原 plan/assistant 脚本直接当生产通用脚本，0/14、0/8：短导航超时和外部字体环境错误与原严格日志断言冲突。原始60场景32通过：storage14、guide8、shell10，live0；指南/导航4项及live2因真实深链接空白失败。保留全部结果，不把它们改成绿色。最终生产只组合可适用三套与真实HTTP/离线场景；完整plan/assistant断言仍在九套开发回归执行，未删断言或掩盖生产错误。
4. 新 live 检查初稿给300元预算却要求一定出现候选，实际可为空，导致0/2；改用原已确认能匹配的“不设预算柔雾通勤”场景，重试2/2；此为测试假设修正，没有改产品推荐/预算。资源遍历初稿也误把目录视作文件，已改为递归只检查构建文件并核对真实字节。原失败目录 .qa/arch-11-before-production-live 保留。
5. 真实产品深链接73项专项37/73为独立真实产品缺陷，按负责人明确范围例外修复，73/73与完整复验后才交付；不删除原失败、不以末尾斜杠绕过最终测试。

**实际修改清单（11路径）**

- `src/lib/navigation-history.js`、`src/components/StrokeText.jsx`、`src/contracts/assistant.js`。
- 经单独明确授权的 `server/app.cjs`，仅上述产品深链接路由。
- `tests/architecture/arch11-imports.mjs`、`tests/architecture/arch11-production-routes.mjs`、`tests/browser/arch11-final-regression.mjs`。
- `README.md`、`docs/frontend-architecture-migration-plan.md`、`docs/stage-delivery-test-report.md`、`docs/product-data-accuracy-audit.md`。

src/data、public、AGENTS、FINAL-PROMPT、依赖锁文件、原42测试文件、素材/视频/比赛材料均未改。临时日志/截图/调试服务均放被忽略的 .qa，不提交，不包含用户档案/真实 Key/用户照片。

**文档、未完成能力、风险与回退**

四文档同步实际树、现有职责/测试、归档回填、本次清理/例外授权/失败与真实复验。README 核对 StrokeText/ScrollFloat/FlexCarousel/GhostCursor 四个第三方源码路径；新增测试只消费 Vite 已有 Rolldown，不新增第三方运行依赖或模型。现有 Google Fonts/网络图片来源与完整许可证清单、公开门禁如实保留。照片分析/MediaPipe 当前未实现；没有升级为可用。**本阶段无新增核验，继承上一条结论。** 产品价格、链接、图片授权 pending/blocked、编辑评分与公开状态不变；原官方商品直接链接/e.tb.cn/品牌官网差异、完整 LICENSE/第三方清单及历史安全/依赖风险保持。

剩余限制：真实智谱/付费调用/实时检索、真机触摸/其他浏览器、字体成功后排版、真实弱网/超时、穷尽GPU/默认动效、跨标签同步、全部无障碍/CLS/像素一致未覆盖；无新照片/隐私处理。存储 null/写失败、lazy 下载拒绝卸载根视图，抽屉无焦点陷阱/背景主动锁滚动/关闭焦点恢复，菜单Escape和在途请求控制缺口保持；不得把回归预期当作修复。

用户入口：主站首页“创建我的妆容方案”→小Y/工作台；顶部或手机下拉“产品库/肤质指南/品牌文化/我的收藏”；产品完整资料与 `/products/nars-light-reflecting` 直接访问/刷新。源环境 Vite5211，实际隔离无 Key 构建5212，均仅本机。可定位恢复基线为上述 ARCH-10 提交/tag；当前11路径未提交、未跟踪脚本不构成新 Git 恢复点。人工验收和实际归档后，按导出清理、路由/测试与原00～10及后续依赖评估获授权的 revert，从新到旧撤销必要范围并重跑；不承诺任意提交无冲突，不 reset/强推/移动标签。Git 不恢复浏览器本地数据、环境变量或外部服务状态。

当前仍 **待人工验收、未提交、未推送、未创建 arch-stage-11**，11唯一current；不提前done，不提前写无新的current，不删分支。仅在负责人明确整阶段人工验收通过后，才另行更新最终状态、正常提交/推送、创建不可复用带注释标签并核对实际远端。

18:55:48（北京时间）交付前再次 fetch 及实际 ls-remote：master/HEAD/origin/master/FETCH_HEAD 仍为上述 ARCH-10 归档提交，00～10 本地与实际远端标签对象/^{} 保留一致，11 未创建；原始结果 remote-refs-final.txt。完整 dist 270 文件 SHA-256/大小与清理前完全相同（dist-comparison.json），不因此宣称浏览器像素严格相同。

**2026-11-17 19:00（北京时间）ARCH-11 最终交付核对，YAS-2026-0055**

18:59:52 实际运行 `node .qa/arch-11-checks/verify-final.mjs`，退出0（final-verification.json / final-verification-retry.log）：精确11个授权路径，master/ARCH-10基线及带注释标签/^{}、ahead/behind0/0、空索引/无11标签通过；两累计报告仅追加、ARCH-00～10执行正文不变、12阶段正文与总表一致且11唯一current。README 184实际树路径覆盖全部117个src文件和三新增脚本、18本地链接/锚点、四第三方源码路径有效。原42测试文件未改；三个src文件仅两项导出和一条注释变化，server仅负责人授权的产品HTML路由。六JS/CJS/MJS语法、UTF-8/末尾换行/行尾空白、`git diff --check` 和 `git diff --cached --check` 均通过。AST审计、开发基线/最终各116、原构建预览36、最终实际生产38、路由73、270构建文件HTTP/字节与前后SHA-256证据均核对。文档检查首轮因新累计报告标题漏写YAS编号失败；补入既有YAS-2026-0055后通过，原日志final-verification.log保留，没有生产/测试逻辑变化。

已实际查看最终桌面首页、手机工作台结果、生产桌面/手机直达产品完整页、手机抽屉、真实无Key与离线产品库截图。直达页记录标题“超方瓶粉底液”、pageerror0、无文档横向溢出：`.qa/arch-11-final-production/direct-product-screenshots.json`；对应 `1440-direct-product.png` / `360-direct-product.png`。其余重点为 `.qa/arch-11-final/arch08-home/1440-entry-cta-assistant-hero.png`、`arch10-app-shell/360-workbench-generation-failures-result.png`，以及 `.qa/arch-11-final-production/arch09-guide-culture/360-catalog-collection-detail-drawer.png`、`360-live-no-key.png`、`360-live-offline-catalog.png`。未因截图相似宣称严格像素一致，也未为截图改UI。

最终逐场景日志实测汇总如下；console/request不是全零。数量来自本次保存结果，正常资源与明确故障/环境错误通过原脚本分别断言，未过滤删除原日志。完整 URL/消息见 `.qa/arch-11-checks/browser-error-summary.json` 和各套 results.json。

| 开发套件 | 场景通过 | pageerror | console.error | 失败请求 |
| --- | --- | --- | --- | --- |
| storage | 14/14 | 0 | 0 | 原脚本不单列 |
| makeup-plan | 14/14 | 0（errors） | 6 | 2，故意失败/超时 |
| assistant | 8/8 | 0 | 12 | 2，故意失败/超时 |
| makeup-table | 16/16 | 2，故意lazy拒绝 | 6 | 4，字体/故意失败 |
| catalog | 14/14 | 0 | 68 | 68，字体/故意封面失败 |
| collection | 16/16 | 6，故意null/写失败 | 22 | 22，字体 |
| home | 12/12 | 0 | 58 | 58，字体/故意封面失败 |
| guide-culture | 10/10 | 0 | 22 | 22，字体 |
| app-shell | 12/12 | 0 | 5 | 5，字体/故意封面/超时 |

最终生产三旧套共36/36、pageerror0；storage的22条console.error为字体失败，guide的22条console.error/22失败请求为字体，app-shell的26条console.error/26失败请求为字体和指定封面/超时故障，badResponses及routeErrors均0。真实在线/离线2/2，pageerror0：桌面console.error13、失败请求12，手机console.error10、失败请求9；各1次真实503，无Key失败明确可见，其余为各1字体拒绝、离线API和未缓存封面请求。离线产品数据/筛选仍可用不代表离线全部图片可用，没有新增Service Worker或离线持久缓存。270文件在线HTTP检查全通过；不把离线预期资源失败称为路径缺失，也不把字体环境拒绝称为已修复。

四文档补记后再次执行同一只读核对及两项diff空白检查，结果应以最终日志为准；没有新生产变更，沿用18:50实跑71/336/build2902及最终116/38/73证据，不冒称再次跑业务测试。**本阶段无新增核验，继承上一条结论。** 当前仍 **待人工验收、未提交、未推送、未创建 arch-stage-11**，ARCH-11唯一current；后续仅等待整阶段人工验收，不自动done或归档。

**ARCH-11 本机复跑服务入口（PowerShell，仓库根目录，独立终端）**

开发九套：`node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5211 --strictPort`。原构建静态预览使用 `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5213 --strictPort`，只作与真实网关对照。生产先运行 `npm run build`，再启动以下隔离无 Key 服务，不读取 .env、不修改服务器配置文件；已有5212服务时勿重复启动。

```powershell
@'
require('dotenv').config = () => ({ parsed: {} })
const { loadConfig } = require('./server/config.cjs')
const { buildApp } = require('./server/app.cjs')
const config = loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 })
buildApp({ config, logger: false }).then(app => app.listen({ host: '127.0.0.1', port: 5212 }))
'@ | node
```

另一个终端设置上文外部Playwright模块/Chrome两个环境变量；`$env:YAS_QA_BASE_URL='http://127.0.0.1:5211'`、`$env:YAS_QA_OUTPUT_DIR='.qa/arch-11-repeat-dev'` 后运行开发组合；改为5212和新的独立输出目录后运行 `node tests/browser/arch11-final-regression.mjs --production`。生产专项先设置 `$env:YAS_QA_ROUTE_OUTPUT='.qa/arch-11-checks/production-routes-repeat.json'` 再运行 `node tests/architecture/arch11-production-routes.mjs`；AST可设置 `$env:YAS_QA_AUDIT_OUTPUT='.qa/arch-11-checks/import-audit-repeat.json'` 再执行审计。新复跑使用独立输出目录，保留本次基线/失败/最终证据。上述脚本无安装步骤，不依赖个人Chrome档案。


**2026-11-17 19:08:13（北京时间）ARCH-11 人工验收入口更正，YAS-2026-0055**：负责人截图显示“智能服务暂未配置”。此前提供的5212是专为真实无Key/降级回归启动的隔离服务，刻意禁读.env且使用空Key；将其作为一般人工验收入口不妥，原降级结果和截图继续保留。只读状态核对确认现有服务端配置已存在，模型为glm-5.3-flash，未读取/展示密钥内容、未改配置或代码。另用现有启动入口（FISHTALK_PORT=5214、NODE_ENV=production）启动正常配置服务；实际GET /api/health为200、ok=true、services.assistant=true，产品深链接200且完整HTML为966字节。**正常人工验收入口更正为 http://127.0.0.1:5214/；5212仅用于无Key降级对照。** 本次只执行健康/静态HTTP检查，没有实际模型、天气或联网调用，不把配置启用当真实provider成功验证；不同端口为不同浏览器存储来源，5212对话不会自动迁移到5214。没有新增源代码变更，不重跑或升级此前71/336/build2902、开发116/生产38/路由73的自动覆盖结论。ARCH-11仍唯一current、待人工验收、未提交、未推送、未创建arch-stage-11；不记人工验收通过。**本阶段无新增核验，继承上一条结论。**


**2026-11-17 19:13（北京时间）ARCH-11 人工验收外部连接故障定位，YAS-2026-0055**：负责人在正常配置5214页面再次反馈天气“连接失败”和趋势问答“智能服务连接失败”；这不是人工验收通过。服务器日志分别为WEATHER_PROVIDER_UNAVAILABLE/503与PROVIDER_UNAVAILABLE/502，健康检查assistant=true只代表配置存在，不能证明供应商可用。无密钥探测在沙箱进程内对智谱与Open-Meteo均立即失败，底层EACCES；权限对照下智谱站点200、聊天/检索API无鉴权HEAD均401且约240ms，证明原验收服务受到沙箱出站网络限制。已停止本次自行启动的5214沙箱实例，并以普通本机进程在同一端口使用原代码/配置重启；不修改系统代理、TLS校验、密钥或任何源码，保持浏览器存储来源。现有系统/环境没有已配置代理。

天气另有独立外部可用性失败：普通进程两次访问api.open-meteo.com仍为超时，进一步记录UND_ERR_CONNECT_TIMEOUT，尚未解决；不绕过校验、不换供应商或扩大server/provider修改范围。无Key探测的401是预期的未鉴权响应，只证明网络可达，不证明真实Key、额度、模型或联网回答成功；本次没有主动付费模型调用。底层原始证据在.qa/arch-11-checks/network-probe-sandbox.json、network-probe-normal.json和normal-upstream-connectivity.json，不含Key/Authorization。

正常验收地址仍为http://127.0.0.1:5214/；已加载的旧失败消息不会因服务重启自动改写。真实智谱/检索端到端与天气可用性不得标成已验收，天气外部超时作为本次剩余问题保留。此前无Key/合成浏览器116/38与单元336/构建/路由73的证据保持原边界，不升级真实provider覆盖。本次仅重启自己的服务和追加四文档，未新增源码改动，文档/历史/范围/空白核对另跑；ARCH-11仍唯一current、待人工验收，未提交、未推送、未创建arch-stage-11。**本阶段无新增核验，继承上一条结论。** 该句指产品事实审计，不代表没有进行上述网络诊断。

**2026-11-17 19:21（北京时间）ARCH-11 整阶段人工验收通过与最终归档收尾，YAS-2026-0055**

- 项目负责人在本会话对本阶段回复原话 **“人工核验完成”**；据此按完整阶段人工验收通过处理，ARCH-11 改为 done，ARCH-00～11 均 done，**无新的 current**。不虚构人工使用的设备、操作或供应商成功结果；本轮架构阶段收尾不等于全部产品能力实现或生产就绪，不推定分支删除授权。
- 19:17:04及19:20再次实际核对：已执行 git fetch origin master；master、HEAD、origin/master、FETCH_HEAD 与实际远端 master 均为上一归档 **f8fcbfa2673af1b9f9f470796f6a206aedeffcc9**，ahead/behind 0/0。本地/实际远端带注释 arch-stage-10 对象 **d51f5ee44f5140be1c38a2e4b6be133f2ca144c6**，^{} 指向该提交；00～10 标签完整一致、11 尚不存在。精确11个已验收路径、索引空，无来源不明文件；保留 remote-refs-acceptance.txt 与 remote-refs-precommit.txt 原始输出。
- 19:17:51运行 node .qa/arch-11-checks/verify-final.mjs 退出码0。人工确认后仅同步 README、迁移计划及两累计报告；19:20:49为七个已验收代码/测试文件保存 SHA-256 快照，后续逐一核对不变。实际范围仍为 src/components/StrokeText.jsx、src/contracts/assistant.js、src/lib/navigation-history.js、获明确授权的 server/app.cjs、tests/architecture/arch11-imports.mjs、tests/architecture/arch11-production-routes.mjs、tests/browser/arch11-final-regression.mjs 及上述四文档。无整文件删除，无新增依赖/产品事实/UI/API/存储语义或隐私变更。
- 沿用本次真实相关9文件71/71、全量42文件336/336、build2902、开发清理前后各116/116、原构建预览36/36、最终真实无Key生产38/38、深链接修复后73/73及270构建文件HTTP/字节/前后哈希证据。项目未配置 lint 脚本。文档收尾只复核范围、状态、历史、源码哈希、路径/链接/披露、语法/编码/空白和既有验证证据，不冒称重跑业务测试；实际收尾核对结果另追加。
- 原37/73生产失败、扫描/脚本初轮失败、故意存储/lazy异常、字体拒绝、图片/超时/离线日志、构建提示、取消/过期控制与焦点/锁滚动缺口，以及真机/其他浏览器/完整无障碍/像素等未覆盖范围全部保留。正常配置入口仍为 http://127.0.0.1:5214/；5212仅作无Key降级对照。普通进程的天气连接超时尚未解决，智谱无鉴权401只证明网络可达；真实Key/额度/模型/联网端到端未由本次自动化验证，人工接受不升级这些结论。不读取或修改凭据、用户数据、照片、旧memory、素材及比赛材料。
- **本阶段无新增核验，继承上一条结论。** 此句指产品事实审计；官方旗舰店链接差异、价格/来源/图片授权pending与公开风险不因技术或人工验收升级。四文档与所有历史失败/豁免/回退证据保留；AGENTS.md、FINAL-PROMPT.md 无须且未修改。
- 本条写入时已人工验收、done，尚未提交/推送/创建 arch-stage-11。按本次确认及 AGENTS.md 13.2，仅暂存已验收11路径，在 master 创建规定格式最终确认提交并正常推送，再于该最终提交建立不可复用的带注释 arch-stage-11，核对实际远端 master、标签对象和^{}后才报告归档成功。实际 SHA/tag 由本次收尾回执先提供、下次文档同步回填；不 amend、自引用、移动标签、强推或删除分支。此前 current/待人工验收记录均为真实历史快照。
- 归档后如需回退，按最终提交中的两导出/注释/路由/验证脚本与下游依赖评估获授权 git revert，从新到旧撤销必要范围并重新验证；不保证无冲突，不恢复浏览器本地存储、环境变量或外部服务状态，不删除旧提交、标签和失败证据。后续产品能力或天气/provider修复需另行明确范围，不自动开启新架构阶段。



**2026-11-17 19:24（北京时间）ARCH-11 验收收尾自动核对，YAS-2026-0055**：首轮临时文档写入器将四文档原LF转成CRLF，git diff --check产生换行/空白报告并使临时Node捕获达到缓冲上限ENOBUFS；原始acceptance-verification.log完整保留。已只恢复四文档原有LF，未改实现或规避空白检查。19:23:35再次运行node .qa/arch-11-checks/verify-acceptance.mjs退出码0：精确11路径、七代码/测试SHA-256不变、索引空、master/ARCH-10基线及本地/实际远端00～10标签一致、无11标签、12阶段正文/总表均done、无新的current、两报告只追加且00～10历史及原42测试不变；README全部117src/184树路径/18本地链接锚点/四披露、两项导出/注释与授权路由等价、原自动化证据、六语法/UTF-8/换行/工作树和索引空白检查通过。后续只补本条并消除README当前摘要的旧待验收措辞，保留带时间历史快照，补记后复核再暂存。沿用71/336/build2902/开发116/生产38/路由73证据，不称重跑业务测试；实际Git归档尚待本次回执，原网络/天气/授权风险保持。**本阶段无新增核验，继承上一条结论。**



**2026-11-17 19:26（北京时间）ARCH-11 最终确认提交前暂存核对，YAS-2026-0055**：19:25:18再次fetch并实际ls-remote，master仍为f8fcbfa2673af1b9f9f470796f6a206aedeffcc9，00～10标签对象/指向一致、11不存在；原始远端记录保留。19:25:53以YAS_QA_VERIFY_STAGED=1运行node .qa/arch-11-checks/verify-acceptance.mjs退出码0，暂存清单精确为已验收11路径、每个Git blob与工作树经过滤内容一致，无未暂存/未跟踪文件；七代码/测试哈希不变，12阶段done、无新的current、历史/追加报告/原测试/目录链接披露/语法编码/原自动证据及两项diff检查通过。仅补记本条并重新暂存三份记录、复核后执行本次已授权最终提交/正常推送/唯一带注释标签，不改实现或覆盖结论；此时真实新SHA/tag尚未产生，结果由归档回执提供。不删分支。**本阶段无新增核验，继承上一条结论。**

### ARCH-12：展示层所有权收敛

**状态：`done`；当前无新的 `current`**

#### 2026-11-17（北京时间）授权与实施前登记，YAS-2026-0055

负责人明确授权以 `57b0a877a9a6bbd769fdb079c2c4ef71629e28e9` 为修改前基线新增本阶段。ARCH-11 已在原批准范围内归档，本阶段是后续展示层归属整改，不否定 ARCH-11 测试或验收；禁止将其记成“ARCH-11 补充整改”。ARCH-00～11 历史正文、提交和标签保持。

- 允许范围：三个共享视觉组件及 CSS → `src/components/visual/`；XiaoYAssistant → `src/features/assistant/components/`；BrandOpening 及测试 → `src/features/app-shell/components/`；将首页、小Y、工作台、品牌开幕和全局样式分归实际所有者，删除已完全迁移的 `src/xiaoy.css`；同步静态/动态引用、测试 mock、README 及必要披露路径。
- 不改变 UI 效果、文案、DOM、业务/API、产品事实、数据、存储 Key 或依赖；原其他页面样式保留，不扩大为资料库/收藏/指南/文化的新阶段重构。
- 远端预检：19:39–19:40 fetch 与实际 ls-remote 成功，master、HEAD、origin/master、FETCH_HEAD 均为上述基线，ahead/behind 0/0；起始工作树与索引为空，00～11 本地/远端标签完整，12 不存在。默认沙箱 fetch 无法写 FETCH_HEAD、ls-remote 出现 Schannel 凭据错误；经授权范围内提升执行成功，不修改凭据、TLS 或 Git 配置。
- 迁移前实际验证：19:43 Vitest 42 文件 336/336；生产构建 2902 模块通过；`arch11-imports.mjs` 全图检查通过。19:44:43–19:54:26 九套浏览器回归 116/116；19:55:22 完成桌面 1440×900 / 手机 360×800 样式与相对几何基线 20/20。基线证据位于忽略的 `.qa/arch-12/`，均为独立临时上下文、合成数据和无 Key 本地规则，不证明真实供应商成功。
- 验证计划：相关测试、`npm test`、`npm run build`、两项 diff 空白检查、全图/所有权/样式声明检查；迁移前后同场景桌面/360px 回归及关键截图复核，构建产物加载与隔离无 Key 同源回归。
- 交付门禁：阶段始终 `current`，完成实施和文档后写“待人工验收”，给出完整文件映射、CSS 映射及真实证据。未经负责人再次明确人工验收及针对 ARCH-12 的 Git 授权，不暂存、提交、推送、打标签、删分支或开启其他阶段。此专门授权要求优先于旧阶段流程中“确认自动包含 Git 授权”的通用约定。
- 后续仅在收到针对 ARCH-12 的明确授权后，才可写 done/无新的 current、创建规定格式的最终确认提交、正常推送 master、建立并推送唯一带注释 `arch-stage-12`，并核对远端 master、标签对象及 `arch-stage-12^{}`。不复用/移动/删除 `arch-stage-11`，不 amend、rebase 已推送历史、reset --hard、clean、强推或删旧证据。
- 回退范围为本阶段文件迁移、CSS、直接引用及验证/文档；当前未提交现场不是 Git 恢复点。形成获准提交后按实际 SHA 和后续依赖评估 `git revert` 并复验；不自动回退或覆盖浏览器数据、环境配置及外部服务。无新的提交 SHA/tag，不虚构结果。
- 产品审计：**本阶段无新增核验，继承上一条结论。** 原来源/图片授权 pending、素材及公开风险不升级。


#### ARCH-12 实施结果与完整文件/CSS 映射

交付状态：**已完成人工验收并归档收尾**。当前无新的 `current`；ARCH-11 在原批准范围内已经归档，本阶段为后续新增展示层归属整改，不否定其测试或验收结论。

| 修改前文件 | 实际目标文件 |
| --- | --- |
| `src/components/FlexCarousel.jsx` | `src/components/visual/FlexCarousel.jsx` |
| `src/components/FlexCarousel.css` | `src/components/visual/FlexCarousel.css` |
| `src/components/ScrollFloat.jsx` | `src/components/visual/ScrollFloat.jsx` |
| `src/components/ScrollFloat.css` | `src/components/visual/ScrollFloat.css` |
| `src/components/StrokeText.jsx` | `src/components/visual/StrokeText.jsx` |
| `src/components/StrokeText.css` | `src/components/visual/StrokeText.css` |
| `src/components/XiaoYAssistant.jsx` | `src/features/assistant/components/XiaoYAssistant.jsx` |
| `src/components/BrandOpening.jsx` | `src/features/app-shell/components/BrandOpening.jsx` |
| `src/components/BrandOpening.test.js` | `src/features/app-shell/components/BrandOpening.test.js` |
| `src/styles.css` + `src/xiaoy.css` | 按下表拆为五个归属文件；原 xiaoy.css 完全迁出后删除 |

| 其他实际修改文件 | 修改内容 |
| --- | --- |
| `src/App.jsx` | 两个入口导入改为 app-shell/assistant；其余应用装配原样 |
| `src/main.jsx` | 先导入全局 styles.css，再导入 App；移除 xiaoy.css 导入 |
| `src/features/home/components/HomeView.jsx` | ScrollFloat/StrokeText 静态引用、FlexCarousel 动态引用指向 visual；自行加载 HomeView.css |
| `src/features/makeup-plan/components/MakeupWorkbench.jsx` | 自行加载 MakeupWorkbench.css |
| `src/features/home/components/HomeView.test.jsx` | 三个 mock 路径同步，原断言不变 |
| `src/features/app-shell/App.test.jsx` | 小Y导入同步，原断言不变 |
| `tests/browser/arch08-home.mjs` | 故障注入匹配旧/新轮播路径，保留基线复跑能力及原断言 |
| `tests/browser/arch12-style-ownership.mjs`（新） | 20 个状态计算样式/相对几何/截图与基线对照；隔离 API 与字体 |
| `tests/architecture/arch12-ownership.mjs`（新） | 九文件迁移/主体等价、CSS 声明序列、历史只追加及阶段归属只读检查 |
| `scripts/fill_ai_usage_statement.py` | 披露中的小Y与工作台实际路径；未执行生成器或重制比赛材料 |
| `README.md` | 当前实际树/测试分布/依赖/披露/本阶段状态与专门 Git 门禁 |
| `docs/frontend-architecture-migration-plan.md` | 新增唯一 current ARCH-12、完整映射和真实执行；00～11 阶段正文不变 |
| `docs/stage-delivery-test-report.md`、`docs/product-data-accuracy-audit.md` | 仅追加本阶段交付与审计 |
| `docs/arch-12-css-ownership.md`（新） | 全量原选择器、原行号、媒体条件、使用方与目标 CSS 映射 |

以上共 39 个工作树路径（移动计原/新路径，未暂存）；九个移动无转发壳、旧根 components 仅余 visual 目录。AGENTS.md、FINAL-PROMPT.md 和旧设计/阶段材料中的原路径作为历史/规则文本保留，当前实际映射由本次明确授权和 README/本文说明，不把历史字符串当成运行引用。

| CSS 所有者 / 目标 | 原来源与实际使用方 | 守恒项数（单选择器/关键帧含原媒体上下文） |
| --- | --- | --- |
| `src/styles.css` | 原全站基础/共享展示与其余页面样式；从 xiaoy.css 接收 980px 导航覆盖和小Y/工作台共用的唯一 xiaoy-spin | 511 |
| `src/features/home/components/HomeView.css`（新） | 原 styles.css 首页/hero/精选/收尾/占位/动效，加原 xiaoy.css 首页 CTA；由 HomeView 导入 | 127 |
| `src/features/assistant/assistant.css`（新） | 原两 CSS 的 xiaoy-* 页面/消息/画像/产品/来源/设置等；XiaoYAssistant 导入；未恢复旧 Key/设置 UI | 118 |
| `src/features/makeup-plan/components/MakeupWorkbench.css`（新） | 原两 CSS 的工作台/表单/步骤/结果/依据/错误等；MakeupWorkbench 导入；不依赖 assistant.css | 88 |
| `src/features/app-shell/components/BrandOpening.css`（新） | 原 styles.css 的 brand-opening/opening-*、关键帧、手机和减少动效；BrandOpening 导入 | 79 |

总计 923 项、817 个不同的选择器与上下文组合，全部声明和值/important/同选择器顺序/关键帧一致；混合选择器按所有者拆分，没有补样式或删旧规则。三个 visual CSS 整文件逐字相同，且维持组件自行导入。全局先于组件基础，visual CSS 先于所属页面 CSS；共享加载关键帧保持原名且只定义一次。全量 792 行规则归属映射见 [CSS 所有权表](arch-12-css-ownership.md)；拆分合写选择器增加构建 CSS 字节，不是新增视觉效果。

#### 自动验证与页面回归（真实运行，2026-11-17 北京时间）

| 命令/检查 | 实际结果与证据（.qa 均仅本地忽略，不纳入 Git） |
| --- | --- |
| 迁移前 npm test / build | 42 文件 336/336；2902 模块成功；before-test.log / before-build.log |
| npm test -- src/features/app-shell src/features/home src/features/assistant src/features/makeup-plan | 20:06:36–20:06:38，18 文件 143/143，退出码 0；related-test.log / related-test-meta.json |
| npm test | 20:06:42–20:06:47，42 文件 336/336，退出码 0；final-test.log / final-test-meta.json；原 42 文件与断言保留（只迁移一文件及改引用） |
| npm run build | 20:01:57–20:02:01，退出码 0，2905 模块；after-build.log。主 CSS 71.95 kB/gzip 15.68 kB，主 JS 747.09 kB/gzip 227.75 kB；原 Three.js CJS 弃用及 >500kB 提示保留 |
| node tests/architecture/arch11-imports.mjs | 120 src 文件、124 JS/JSX/MJS 解析文件、72 生产模块；219 导入、39 类型引用、121 字面资源；断链/大小写/循环/反向边界/转发壳/未用导入导出/空目录均无问题；after-imports.json / .log |
| node tests/architecture/arch12-ownership.mjs | 九文件迁移、三个装配主体、923 CSS 项/817 组合、00～11 历史正文、两累计报告只追加及唯一 current 核对通过；ownership.json / .log（交付末尾复核） |
| node tests/browser/arch11-final-regression.mjs | 开发基线 19:44:43–19:54:26 与迁移后 20:06:39–20:15:07 各 116/116，退出码 0；before-browser / after-browser（九套 results.json 与截图） |
| node tests/browser/arch12-style-ownership.mjs | 20:02:07 完成归档源码稳定参考，20:07:16 完成迁移后：20/20、计算样式和相对几何差异 0；baseline-styles-stable / after-styles-final，comparison.json；归一化本机端口，不改资源路径 |
| node tests/browser/arch11-final-regression.mjs --production | 20:09:58–20:15:40，隔离真实无 Key 同源构建 38/38，退出码 0；production-browser / .log / -meta.json |
| node tests/architecture/arch11-production-routes.mjs | 20:10:00，73/73；所有产品及未知/尾斜杠/查询深链接正文与 SPA 一致，封面 HTTP/类型/字节正确；production-routes.json / production-routes-recorded.log |
| diff / 语法 / 文档 / 版本检查 | 两项 git diff --check、两新 MJS 与原浏览器脚本 node --check、Python ast 披露脚本解析通过；最终路径/链接/UTF-8/LF/空索引/固定 HEAD/原标签检查在交付末尾追加真实结果 |

浏览器均使用现有 Playwright 与 Chrome **157.0.8103.52**，**1440×900 / 360×800**，隔离临时上下文和合成画像/消息，无真实浏览器资料、用户照片或模型调用。原九套分别 storage 14、makeup-plan 14、assistant 8、makeup-table 16、catalog 14、collection 16、home 12、guide-culture 10、app-shell 12。包括真实 UI 导航/搜索/筛选/收藏/详情/来源、旧存储/刷新/重置、生成/修改/加载/错误/重试、开幕/跳过/减少动效、轮播及 WebGL/2D 故障回退；合成 API/网络故障与真实无 Key 同源 HTTP 分开记录。生产测试同时逐个核对构建文件 HTTP/字节、真实 400/503、local 七步方案及离线浏览。

已实际查看前后手机 hero、前后桌面开幕、迁移后桌面/手机首页、小Y/来源、工作台结果/错误、精选等截图。所检控件无新增重叠或文档横向溢出；首页手机插画背景仍延续基线构图，不借迁移重设计。20 状态对照固定回退字体、鼠标移出控件并等待两帧；正常动效另由原脚本抽样，不能扩张为全站逐像素、真机或全部动画一致。

原定向故障的 collection 存储写入/null 导致根卸载、lazy 场景下载拒绝的预期 pageerror/控制台记录全部保留；其余场景按原断言检查，未发现新增未处理错误。Google Fonts 环境拒绝、故意图片/HTTP/超时日志保留，不声称“所有 console.error 均为零”。六个契约仅 JSDoc、原重复 prefersReducedMotion 辅助函数仍保留，不因目录整理引入运行 schema 或抽象。

#### 失败、纠正与未覆盖边界

- 样式脚本首轮误把减少动效模式的 ProductCard 回退当成增强轮播等待，超时；仅修正测试定位器和合成回答字段，源码未为此修改。before-styles.log 与原截图保留。
- 首轮迁移对照两个按钮出现点击/悬停/0.001s 过渡时刻差异；固定鼠标位置、滚入视口后等待两帧，用基线 SHA 的 118 文件只读源码参考服务 5223 复跑（未复制 .env、凭据或用户数据）。随后开幕差异仅为 5221/5223 资源 URL 端口，保留原失败日志并归一化 origin 后 20/20；未降低任何 CSS 声明检查或用额外样式遮盖差异。before/after-styles* 失败证据不删除。
- 临时基线源码里的 37 份测试曾被 Vitest 自动发现，首轮显示 79 文件/633 项；该结果不计为正式项目全量。将仅用于归档参考的测试文件改为非测试后缀并保留，未动生产源码/配置；重新实跑正式全量为 42 文件 336/336。after-test.log 与 final-test.log 同时保留。
- 人工文档补丁有一次因整行不匹配被原子拒绝，临时差异打印器有一次语法错误；均只影响工具脚本/文档操作，修正后通过，不是产品失败，也不冒称整轮首试全绿。
- 真实智谱/联网/天气成功、真实手机/触摸/其他浏览器、外部字体成功后的排版、全部默认动效/GPU、真实弱网未新增验证。ARCH-11 的外部连接/天气超时、素材授权 pending、官方旗舰店链接差异、大包与旧存储异常抛出等风险继续保留；不利用本阶段修复后端或产品能力。

#### 复跑、人工入口与收尾边界

PowerShell 环境变量与外部运行时沿用本机现有安装（无安装或依赖变化）：

```powershell
$env:YAS_QA_PLAYWRIGHT_MODULE='file:///C:/Users/%E5%B4%94%E9%A6%A8%E7%91%9C/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
$env:YAS_QA_BROWSER_EXECUTABLE='C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:YAS_QA_BASE_URL='http://127.0.0.1:5221'
$env:YAS_QA_OUTPUT_DIR='.qa/arch-12/replay-dev'
node tests/browser/arch11-final-regression.mjs
$env:YAS_QA_STYLE_BASELINE='.qa/arch-12/baseline-styles-stable/results.json'
$env:YAS_QA_OUTPUT_DIR='.qa/arch-12/replay-styles'
node tests/browser/arch12-style-ownership.mjs
$env:YAS_QA_BASE_URL='http://127.0.0.1:5222'
$env:YAS_QA_OUTPUT_DIR='.qa/arch-12/replay-production'
node tests/browser/arch11-final-regression.mjs --production
$env:YAS_QA_ROUTE_OUTPUT='.qa/arch-12/replay-routes.json'
node tests/architecture/arch11-production-routes.mjs
$env:YAS_QA_AUDIT_OUTPUT='.qa/arch-12/replay-imports.json'
node tests/architecture/arch11-imports.mjs
$env:YAS_QA_OWNERSHIP_JSON='.qa/arch-12/replay-ownership.json'
node tests/architecture/arch12-ownership.mjs
```

开发页面 5221 是禁止读取 .env 的 Vite 测试服务（现有测试路由隔离 API）；基线参考 5223 以 57b0a877 的 src/index.html（字节来自 git show）及原 public 只读运行。稳定样式比较的原始基线截图和 JSON 只在本机忽略证据里，后续跨机需从该 SHA 重建参考并先运行同脚本，不把缺失基线当成比较通过。生产服务 5222 启动前禁用 dotenv.config，并显式 ZHIPU_API_KEY=''、NODE_ENV=production，buildApp 提供 dist 和 API，避免读取真实配置或付费调用；具体启动器可用下述仓库根目录命令复跑：

```powershell
node --input-type=module -e "import {createServer} from 'vite';const s=await createServer({envDir:false,server:{host:'127.0.0.1',port:5221,strictPort:true}});await s.listen();s.printUrls()"
# 另一个终端（先 npm run build）；仅为无 Key / 本地规则验收
node -e "require('dotenv').config=()=>({parsed:{}});const {loadConfig}=require('./server/config.cjs');const {buildApp}=require('./server/app.cjs');const config=loadConfig({NODE_ENV:'production',ZHIPU_API_KEY:'',API_RATE_LIMIT_MAX:10000,AI_RATE_LIMIT_MAX:1000,AI_DAILY_LIMIT:100000});buildApp({config,logger:false}).then(app=>app.listen({host:'127.0.0.1',port:5222}))"
```

人工页面入口为 **http://127.0.0.1:5222/**，明确为**隔离无 Key**服务，适合本阶段 UI/本地降级验收；“智能服务暂未配置”是此入口预期，不能用来判断真实配置/供应商故障。正常配置的运行方法仍见 README；此前 ARCH-11 的 5214 入口是历史服务，不冒称本阶段已验证真实回答。重点检查开幕/跳过、首页 CTA/搜索/精选、手机导航、小Y输入/消息/来源和方案生成/修改/详情，桌面及 360px 各一轮。

交付状态为 **done / 当前无新的 current**；负责人已完成人工验收并明确授权本次 Git 收尾。修改后提交 SHA、远端 master、`arch-stage-12` 对象及 `arch-stage-12^{}` 指向由本次实际操作产生并核验；不得复用、移动或删除 `arch-stage-11`。

代码、README/披露及两累计报告按上述真实边界一致；未改视频、比赛材料、AGENTS.md 或 FINAL-PROMPT.md，不声称全部产品阶段完成。照片分析、独立步骤调整、账号/跨设备等未实现内容保持原状。回退范围为上述 39 路径，当前未提交现场不是新 Git 恢复点；已有恢复基线为 57b0a877/arch-stage-11，获授权归档后按实际 SHA/后续依赖评估 git revert 并复验，保留所有旧证据，不执行自动清理或恢复外部状态。

**本阶段无新增核验，继承上一条结论。** 该句仅指产品数据核验，技术/页面测试不升级产品、价格、色号、图片、评分、来源或授权结论。

**2026-11-17（北京时间）ARCH-12 人工验收与归档授权收尾，YAS-2026-0055**：负责人先确认“ARCH12 人工核验没问题”，后确认“12人工核验结束”，据此按完整阶段人工验收通过处理。ARCH-12 状态改为 `done`，当前无新的 `current`；ARCH-11 在原批准范围内已经归档，本次不是对其测试或验收结论的否定。

- 本次收尾范围为已验收的 39 条工作树路径，包含展示层迁移、CSS 所有权、引用/mock/披露同步、ARCH-12 审计脚本及四份项目文档；不修改服务端、产品数据、AGENTS.md、FINAL-PROMPT.md、视频或比赛材料。
- `npm test` 42 文件 336/336、`npm run build` 2905 模块、`git diff --check`、导入/所有权审计均已通过；页面回归沿用 ARCH-12 已记录的桌面 1440×900 / 手机 360×800 证据，本次收尾未新增浏览器性能测试。
- 本条写入时最终提交 SHA、远端分支 SHA、带注释 `arch-stage-12` 对象及 `arch-stage-12^{}` 指向尚待本次 Git 操作实际产生并核验；核验结果由归档回执提供，不 amend、rebase、reset、强推或删除旧标签/分支。

## 7. 阶段状态总表

| 阶段 | 模块 | 状态 | 验证与提交记录 |
| --- | --- | --- | --- |
| 前置 | contracts（原开发分支，现纳入 master 合并工作树） | done | `86b25b3`；项目负责人确认已推送 |
| ARCH-00 | 迁移基线 | done | S04 `8c95966cf61367396fd6783da1f86c8569546668` 与 `arch-stage-00` 已再次核对实际远端；基线测试 12/73、构建通过，人工验收通过 |
| ARCH-01 | lib/storage | done | S01 `5e58236f6897147b354153ea9b02d080641a3cea` 与远端 `arch-stage-01` 已核对；人工验收归档，原测试/构建/页面证据保留 |
| ARCH-02 | makeup-plan | done | S01 aa564870；S02 `f0d02eb64ced01c0fd1fa5fc210eb687050620e5` 与 `arch-stage-02` 远端对象/指向已核对；整阶段人工验收归档 |
| ARCH-03 | assistant | done | 收尾 bf7e225 与 arch-stage-03 对象/指向已核对实际远端；S01–S03 人工验收，S04/S05 人工等待由负责人豁免；历史自动验证和风险保留 |
| ARCH-04 | lib/api | done | 收尾 `4062153c512107534b88f3bc6011ffa869334c8a`；`arch-stage-04` 对象/指向已核对实际远端；2026-11-17 完整人工验收通过，原验证及风险保留 |
| ARCH-05 | makeup-table | done | 最终提交 bf988460ae8c9611eaae21adb02a34c3bfc53fa1；arch-stage-05 对象 11b0d3e419b1fe642e3ed650fb07b9fc4ab9ceba 指向该提交，11:38/12:19 实际远端一致；原验收和证据保留 |
| ARCH-06 | catalog | done | e78c87f6768444138b88adca33b1221aa6c03d89；arch-stage-06对象dc38c7ac170701918cae4e08bf20e2ccee2ffd50指向该提交，12:52实际远端一致；原人工确认/证据保留 |
| ARCH-07 | collection | done | 最终提交 7f71699ddea914c36a1ad3b0c877ad0d6eb31755；arch-stage-07 对象 c7765c37a83ce0dc4806d2db50ae84ebfbd9c4a9 指向该提交，15:52 实际远端一致；原人工确认/失败/证据保留 |
| ARCH-08 | home | done | aee4175bd09be01b065d5875c0f1305e55410cd9；arch-stage-08对象be773944bdae29408bc3eecdfc6789dc831ab0d1指向该提交，16:51:03实际远端一致；原人工确认/验证/失败和限制保留 |
| ARCH-09 | guide-culture | done | 完整阶段“人工核验通过”；最终提交8cbac32e0e1cc480f6b573688f05c3caa93c27a3，arch-stage-09对象72428c4ce8b4dc2a81213fc78a3bda0e489907bc及^{}指向于17:26本地/实际远端核对一致；原验证/失败/限制保留 |
| ARCH-10 | app | done | 完整13路径“人工审核完毕”；最终f8fcbfa2673af1b9f9f470796f6a206aedeffcc9，本地/实际远端arch-stage-10对象d51f5ee44f5140be1c38a2e4b6be133f2ca144c6、^{}指向该提交；18:55:48核对一致；原证据/失败/限制保留 |
| ARCH-11 | 整体回归 | done | 已在原批准范围归档：`57b0a877a9a6bbd769fdb079c2c4ef71629e28e9` / arch-stage-11（对象 `89aa7c31466b3d270bab4820d0b34c6c38730c4e`）；原验收、验证、失败和风险全部保留 |
| ARCH-12 | 展示层所有权收敛 | done | 负责人已完成人工验收并授权归档；最终提交与 `arch-stage-12` 的实际 SHA/对象由本次收尾回执核验；当前无新的 `current`，不否定 ARCH-11 的测试或验收结论 |

2026-11-17 后续 `dev` 工作区记录（未提交、待负责人本地核验）：从已归档 master `4862e2759ba3b7785b4138a2ae88b5e8053f292a` 创建 `dev`。本次为独立的首页美妆店体验改造，不改写 ARCH-00～12 的验收和归档状态，也不新增其 `current`。新增根目录 `beauty-shop-3d.html` 作为 Vite 第二 HTML 构建入口；`src/features/makeup-table/components/MakeupTableExperience.jsx` 与同名 CSS 负责 iframe 状态、返回和品类导航，原 `MakeupTable.jsx` 仍为 2D 回退；`HomeView` 调整标题与节奏；`server/app.cjs` 将 iframe 的 CSP 与 X-Frame-Options 同时限制为仅同源，并在 `server/app.test.js` 验证；新增 `tests/browser/beauty-shop-experience.mjs`。场景运行时使用本地打包的 Three.js，页面只接收受控品类事件，不把模型文案作为产品事实。当前改动在 `dev`，未提交、未推送、未归档；待负责人体验后再决定提交。开发及生产同源地址的桌面1440px/手机360px商店、妆台、返回及实际模型品类点击回归均已通过；真实设备触控与运行性能尚待本地核验。阶段累计报告暂不将本次记为已完成阶段。

2026-11-18 `dev` 性能与视觉修订（负责人已授权仅推送开发分支，待本地核验）：场景删去雨、水花、积水蒙版、镜面反射与 Bloom 后处理；路灯光池减弱，地台裙边下沉以消除与人行道共面闪烁，初始镜头拉近，店体与陈设时间轴衔接缩短。品牌开幕简化并由 5.2 秒调整至 4.2 秒，3D iframe 在开幕期间创建并预编译；最初曾在开幕结束时强制调用 `intro.finish()`，导致店铺物件出场动效被跳过。负责人指出后，已改为开幕期间暂停入场动画、开幕结束后从起点播放，店体、街边道具、柜台与商品的生成动效保留。场景静止时最多约 30 次/秒绘制，离开视口或隐藏标签页时暂停。开发和同源生产预览在 1440px / 360px 验证正常开场、柜台中段升起、进入妆台、返回、品类跳转与无 WebGL 回退；桌面测试约 4.7 至 4.9 秒露出场景并开始动画，静止约 27 帧/秒、离开视口 0 帧/秒；此数据只代表当前自动化环境，不代表真机帧率。此前约 5.4 秒直接进入完整店铺的结果属于已撤销的强制结束方案，不再作为当前体验结论。修正后 `npm test` 42 文件 336 项、`npm run build`、`git diff --check` 通过。未更改已归档 ARCH 阶段状态，也未完成真机触控、弱网与多 GPU 性能验收。

## 8. 阶段执行记录模板

每个完整阶段从开始到交付，在对应阶段“执行记录”追加以下事实；整阶段统一人工验收并同步累计报告，不覆盖旧小步、失败和回退记录。提交 SHA 和标签只能在实际产生后记录，可先在交付中给出、下一次文档同步时回填，不通过 amend 或强推回填：

```text
日期（北京时间）：
阶段编号（ARCH-XX；旧小步编号如有则保留）：
关联 YAS 编号（有则保留，无则写无）：
问题现象或迁移原因、复现步骤与预期结果：
当前分支、修改前已验收基线 SHA：
master 基线 SHA、远端 master SHA 与核验时间（不再双分支规范同步）：
实际修改文件：
测试命令与真实结果：
页面与视口回归：
交付状态（待人工验收 / done）、人工测试人、确认日期与结果：
确认对应的修改范围（后续实质修改需重新确认）：
README 同步位置：
阶段累计报告与数据审计位置（未到收尾时注明）：
未完成项与剩余风险：
修改后提交 SHA（未提交则明确写未提交）：
远端分支 SHA 与核对时间（未推送/未核验如实注明）：
阶段标签（仅完整阶段，未创建则明确写未创建）：
远端标签及其指向的提交（未推送/未核验如实注明）：
可回退位置、后续依赖与回退顺序：
故障/回退记录（如发生：原提交、原因、授权、反向提交和复验结果）：
```

## 9. 后续提示词

常规继续：

```text
按迁移计划只实施唯一 current，在 master 完成整个阶段的实现、自动测试、构建、页面回归和文档同步后，一次性交我人工验收；标待人工验收，不提交、不推送、不打标签、不删除分支。
```

只预检：

```text
读取架构迁移计划，只对 current 阶段做预检，列出修改文件、迁移映射、风险和验证命令，不修改代码。
```

人工测试通过后：

```text
当前完整阶段人工验收通过。立即将本阶段改为 done、下一阶段改为唯一 current（最后阶段则无新的 current），追加真实执行/确认记录。检查实际 diff，按 [ARCH-XX] 和规定格式提交并正常推送 master，在最终收尾提交建立并推送唯一 arch-stage-XX 标签，核对远端 SHA/标签后报告；不据此删除未经另行明确授权的分支。
```

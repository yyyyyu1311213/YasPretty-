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
| 切换完成 master SHA / 已核验远端 | 普通合并 `8caf4dcdad416a2a8fbc6057a7f5a289403e9a1c`；后续仅追加归档文档，本条所在提交的最终 SHA 由交付回执给出、下次文档同步回填，不为自引用改写历史 |
| 当前阶段 | `ARCH-05`：`makeup-table`，唯一 `current`；只确定下一阶段，尚未实施 |
| 下一阶段 | `ARCH-06`：`catalog`，`pending` |
| 已归档阶段 | ARCH-00～04：`done`，代码、测试、两份累计报告、人工确认或明确豁免及远端标签均已核对 |
| 前置 contracts | 六个 JSDoc 契约文件；原提交 `86b25b331106b49b02f10b499de7f7d94c24032b`（YAS-2026-0055）随合并保留 |
| ARCH-00 | `arch-stage-00` 对象 `cb811573c820bc01bd5ee5628f24c5e30fc6600e` → `8c95966cf61367396fd6783da1f86c8569546668` |
| ARCH-01 | `arch-stage-01` 对象 `ba59303891315291dcdab02b6906971b1799d339` → `5e58236f6897147b354153ea9b02d080641a3cea` |
| ARCH-02 | `arch-stage-02` 对象 `47a9d3a27bf11a305c2ecb94eacea0e99195b2af` → `f0d02eb64ced01c0fd1fa5fc210eb687050620e5` |
| ARCH-03 | `arch-stage-03` 对象 `b8bacb242f91983b471ccd097470aca6287d5152` → `bf7e2254001fe3cc1fa7619c925fb3a8a00d456c` |
| ARCH-04 | `arch-stage-04` 对象 `21597c84fa0d0c44a1ef3d4dd24ef0a8c36af78d` → `4062153c512107534b88f3bc6011ffa869334c8a`；“人工核验完毕”及两份累计报告存在 |
| 最近远端核对 | 2026-11-17 10:07（北京时间）；master 与本地合并 SHA 一致，原开发分支已删除，五个带注释标签对象与提交指向均与本地及原记录一致 |
| 最近验证结果 | 本次切换 npm test 29 文件 225/225、构建 2881 模块及三份既有桌面/360px 浏览器脚本 36/36 通过；真实无 Key 构建同源 HTTP 冒烟通过；完整结果和覆盖限制见 5.2 及同日累计报告 |

实际代码与测试是判断模块是否落地的事实依据。本地和已核验远端 master 均已包含 ARCH-00～04。本文随后追加的归档记录使用独立文档提交并正常推送，最终 HEAD 由实际交付回执提供；不把历史待提交快照误读为当前状态。

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

**状态：`current`**（本次只确定下一阶段，尚未实施 ARCH-05）

**允许范围**：2D/3D 化妆台组件、对应 CSS 与测试、`makeup-table-3d/`、直接引用方和文档。

**任务**：

- 迁入 `features/makeup-table/`，保持内部 Three.js 模块边界。
- 以 `MakeupTableExperience` 作为对外入口，封装 3D、2D 和失败回退。
- 保持懒加载、性能档位、减少动效和资源路径不变。

**验收**：3D 加载、WebGL 不可用的 2D 回退、减少动效、跳过和资源加载行为不变；桌面与手机回归通过。

**执行记录**：2026-11-17（北京时间），负责人确认将本阶段由 pending 改为唯一 current；仅指定下一阶段，尚未实施。需先完成本次 master 切换的整体人工验收、提交/推送和分支归档，再开始本阶段代码工作。后续整阶段完成后一次性交人工验收，不再逐小步等待。

### ARCH-06：`catalog`

**状态：`pending`**

**允许范围**：App 中产品筛选和展示代码、新 `features/catalog/`、直接引用方、相关测试和文档。

**任务顺序**：

1. 抽取文本匹配、筛选和排序纯函数。
2. 建立 `catalogService.js`，统一产品读取和按 ID 查询。
3. 抽取产品卡、筛选面板、产品详情和详情抽屉。
4. 抽取 `useCatalog.js` 管理筛选与排序状态。

**边界**：产品事实仍只来自 `src/data/`，不改筛选结果、详情字段或产品深链接语义。

**验收**：搜索、筛选、排序、产品详情、深链接和打开关闭行为不变；测试、构建和视口回归通过。

**执行记录**：待执行。

### ARCH-07：`collection`

**状态：`pending`**

**允许范围**：App 中收藏代码、新 `features/collection/`、`lib/storage`、catalog 公共组件、相关测试和文档。

**任务**：

- 抽取收藏状态纯函数、`collectionStorage.js` 和 `useCollection.js`。
- 拆出收藏页面和状态控件。
- 保持首页、产品库、详情和收藏页共享同一份状态。

**边界**：收藏 Key、状态值、刷新恢复和跨页面共享行为不变。ARCH-00-S03 源码核对确认当前没有 `storage` 事件监听，跨标签页实时同步尚未实现；本阶段不以“保持同步”为由新增该能力。

**验收**：收藏新增、状态修改、移除、刷新恢复和各页面同步不变；测试、构建和视口回归通过。

**执行记录**：待执行。

### ARCH-08：`home`

**状态：`pending`**

**允许范围**：App 中首页代码、新 `features/home/`、首页视觉组件及 CSS、相关测试和文档。

**任务**：

- 拆出 `HomeView.jsx`、`HeroSection.jsx`、`EditorSelection.jsx` 和必要的首页产品区域。
- 将 `ScrollFloat`、`StrokeText`、`FlexCarousel` 及对应 CSS 迁入 `components/visual/`。
- 建立 `homeContent.js`，只保存首页文案、精选产品 ID 和展示顺序。
- 组合已迁移的 makeup-table 与 catalog，不复制其产品或渲染逻辑。

**验收**：首页布局、Slogan、精选顺序、轮播、滚动动效、CTA、3D/2D 回退和响应式表现不变；测试和构建通过。

**执行记录**：待执行。

### ARCH-09：`guide` 与 `culture`

**状态：`pending`**

**允许范围**：指南页、品牌文化页、直接引用方和文档。

**任务**：分别迁入 `features/guide/` 和 `features/culture/`，只抽取实际页面和内容，不增加空 Hooks、Utils 或 Service。

**验收**：页面内容、导航和响应式布局不变；测试、构建和视口回归通过。

**执行记录**：待执行。

### ARCH-10：收敛 `app`

**状态：`pending`**

**允许范围**：`src/App.jsx`、`src/main.jsx`、新 `src/app/`、各页面组合引用和文档。

**任务**：

- 将 App 迁入 `src/app/App.jsx`，拆出 Header、Footer 和视觉增强错误边界。
- 将品牌开幕迁入 `app/opening/`。
- 更新 `main.jsx` 和全部受影响引用。
- App 最终只保留页面导航、页面组合、必要共享状态和跨功能连接。
- 确认无引用后清理旧入口和重复实现，不删除历史文档或备份。

**验收**：所有页面入口、浏览器前进后退、产品深链接、移动菜单、Escape 关闭和返回顶部行为不变；测试、构建和完整主流程回归通过。

**执行记录**：待执行。

### ARCH-11：整体清理与最终回归

**状态：`pending`**

**允许范围**：本轮迁移文件、引用、测试和文档；不进行新功能或视觉调整。

**任务**：

- 检查重复文件、旧路径、无效导出和循环依赖。
- 检查组件中是否仍散落新的 `fetch` 或 `localStorage` 逻辑。
- 检查 `lib` 不依赖 features，`makeup-plan` 不反向依赖 assistant。
- 运行 `npm test`、`npm run build` 和 `git diff --check`。
- 检查桌面与 360px 级手机视口、浏览器控制台及主要成功、失败、降级路径。
- 将 README 当前实际结构更新为最终落地状态，核对第三方披露中的所有迁移路径。

**验收**：目标结构真实落地，验证结果可复跑，文档与代码一致，所有剩余问题明确记录。

**执行记录**：待执行。

## 7. 阶段状态总表

| 阶段 | 模块 | 状态 | 验证与提交记录 |
| --- | --- | --- | --- |
| 前置 | contracts（原开发分支，现纳入 master 合并工作树） | done | `86b25b3`；项目负责人确认已推送 |
| ARCH-00 | 迁移基线 | done | S04 `8c95966cf61367396fd6783da1f86c8569546668` 与 `arch-stage-00` 已再次核对实际远端；基线测试 12/73、构建通过，人工验收通过 |
| ARCH-01 | lib/storage | done | S01 `5e58236f6897147b354153ea9b02d080641a3cea` 与远端 `arch-stage-01` 已核对；人工验收归档，原测试/构建/页面证据保留 |
| ARCH-02 | makeup-plan | done | S01 aa564870；S02 `f0d02eb64ced01c0fd1fa5fc210eb687050620e5` 与 `arch-stage-02` 远端对象/指向已核对；整阶段人工验收归档 |
| ARCH-03 | assistant | done | 收尾 bf7e225 与 arch-stage-03 对象/指向已核对实际远端；S01–S03 人工验收，S04/S05 人工等待由负责人豁免；历史自动验证和风险保留 |
| ARCH-04 | lib/api | done | 收尾 `4062153c512107534b88f3bc6011ffa869334c8a`；`arch-stage-04` 对象/指向已核对实际远端；2026-11-17 完整人工验收通过，原验证及风险保留 |
| ARCH-05 | makeup-table | current | 2026-11-17 负责人确认；只确定下一阶段，尚未实施；先完成 master 切换验收归档 |
| ARCH-06 | catalog | pending | 待执行 |
| ARCH-07 | collection | pending | 待执行 |
| ARCH-08 | home | pending | 待执行 |
| ARCH-09 | guide、culture | pending | 待执行 |
| ARCH-10 | app | pending | 待执行 |
| ARCH-11 | 整体回归 | pending | 待执行 |

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

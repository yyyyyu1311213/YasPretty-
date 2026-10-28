# YasPretty 提交、版本与问题追踪规范

最后更新：2026-10-28（北京时间）

## 目的

本文件用于保证参赛提交和后续公开迭代满足三个要求：

1. 每次改动都能找到原因、范围、测试和责任上下文。
2. 每个可交付版本都能恢复到明确的代码状态。
3. 出现问题时可以定位到版本、提交、测试证据和相关数据/素材记录。

本文是工程流程记录，不替代 `AGENTS.md`、`FINAL-PROMPT.md` 或官方报名材料。两个根本约束文件保持只读。

## 当前基线事实

截至 2026-10-28：

- 当前分支为 `master`。
- Git 尚无任何提交，`git log` 为空。
- 项目文件仍是未跟踪状态；因此当前还没有可供 `git revert` 使用的正式版本基线。
- `node_modules/`、`dist/`、本地记忆、密钥文件、浏览器 QA 目录和待核验图片已被 `.gitignore` 排除。
- 阶段 0、1、2 的技术和测试记录位于 `docs/`；产品准确性单独记录在 `docs/product-data-accuracy-audit.md`。

这意味着当前风险不是“没有文档”，而是“文档和工作区还没有被一个 Git commit 固定”。在完成首次基线提交前，不得声称已经具备可审计的版本回退能力。

## 分支规范

分支名必须表达工作类型和范围，不使用无意义的 `test`、`new`、`final2` 等名称：

```text
feature/stage-2-makeup-plan
fix/data-accuracy-label
docs/submission-traceability
chore/dependency-audit
release/2026-10-28-stage-2
```

规则：

- `master` 只接受经过验证的可演示状态，不直接在上面堆叠实验性改动。
- 一个分支只处理一个阶段或一个可独立验收的问题。
- 不把真实密钥、用户照片、真实对话、本地记忆或未授权图片放入分支。
- 比赛演示分支必须保留对应的测试结果、素材授权状态和文档版本。

## 提交信息规范

采用 Conventional Commits，并要求正文说明范围和验证：

```text
<type>(<scope>): <短句>

Why:
- 为什么需要这次改动。

What:
- 实际修改了哪些模块。

Verification:
- 运行了什么命令或手工验证。
- 结果是什么。

Risk:
- 未实现内容、降级行为和剩余风险。
```

允许的 `type`：

| type | 用途 |
| --- | --- |
| `feat` | 新增用户可用能力 |
| `fix` | 修复已确认的问题 |
| `docs` | 只修改文档或记录 |
| `test` | 新增或修正测试 |
| `refactor` | 不改变外部行为的结构调整 |
| `chore` | 工具、依赖和工程维护 |
| `security` | 密钥、隐私、权限或安全边界修正 |

示例：

```text
feat(stage-2): add validated makeup plan fallback

Why:
- 让没有模型 Key 时仍能生成完整的本地方案。

What:
- 新增 UserProfile、MakeupRequest、MakeupPlan schema。
- 增加候选 evidence 和 7 步本地模板。

Verification:
- npm run check
- POST /api/makeup-plans 返回 7 步方案。

Risk:
- 产品价格、图片和外部事实仍待核验。
```

一次提交只解决一个完整问题。不要把“数据核验、UI 重做、依赖升级和无关重构”混成一个不可审查的大提交。

## 提交前门禁

提交前必须执行并把结果写入提交正文或对应阶段记录：

```powershell
git status --short --branch
npm run check
npm audit --registry=https://registry.npmjs.org
```

涉及产品数据或素材时，还必须检查：

```powershell
rg -n "priceVerifiedAt|imageSource|informationSources|verificationStatus" src docs
git check-ignore -v node_modules dist server/key.txt server/memory public/product public/brand
```

提交前确认：

- 没有真实 API Key、Authorization、用户数据或照片。
- 没有把编辑示例评分写成用户统计。
- 没有把待核验价格、图片或外部事实写成已确认事实。
- 测试、构建、审计和浏览器验证结果与文档一致。
- `AGENTS.md` 和 `FINAL-PROMPT.md` 没有被改动。
- 阶段报告和产品数据审计记录已经反映当前真实状态。

## 版本标记与发布记录

只有完成首次基线提交后，才允许创建版本 tag。版本号必须与交付范围一致：

```text
v0.1.0-stage-0
v0.2.0-stage-1
v0.3.0-stage-2
```

每个版本必须留下一个发布记录，至少包括：

```text
版本：v0.x.0-stage-x
基线提交：<完整 commit SHA>
发布日期：YYYY-MM-DD（北京时间）
入口：<本地或部署 URL>
阶段报告：<docs/stage-delivery-test-report.md 对应章节>
数据审计：<对应数据审计文件和结论>
测试：<命令、数量、结果>
已知风险：<逐项列出>
回退方式：git revert <commit SHA> 或恢复到指定 tag
```

版本说明只能描述真实运行能力。没有真实模型 Key、授权图片或公网部署时，必须明确写“未验证”或“未完成”。

## 问题追踪规范

问题编号使用：

```text
YAS-<年份>-<四位流水号>
```

例如 `YAS-2026-0001`。每个问题至少记录：

- 发现日期、发现入口和复现步骤。
- 当前版本 tag 或完整 commit SHA；如果尚无提交，明确写 `NO_COMMIT_BASELINE`。
- 影响范围：用户流程、数据、隐私、安全、素材、模型、费用或部署。
- 预期行为与实际行为。
- 日志、截图、测试输出或 API 响应证据；不得附真实密钥、完整用户输入或未授权照片。
- 修复提交 SHA、回归测试和关闭日期。

问题状态只使用：`open`、`triaged`、`in_progress`、`fixed`、`verified`、`wont_fix`。安全、隐私、事实来源和素材授权问题不能用 `wont_fix` 隐藏；必须记录负责人决定和风险接受依据。

## 回退流程

### 有正式 commit 和 tag 时

1. 记录当前问题编号和当前完整 SHA。
2. 先在独立分支复现，不直接改写 `master` 历史。
3. 用 `git show <tag>` 确认目标版本的代码、测试和文档。
4. 优先用 `git revert <bad-commit>` 生成可审查的反向提交；不要直接删除历史。
5. 运行 `npm ci`、`npm run check`、安全扫描和主演示冒烟。
6. 在问题记录中关联修复提交、验证结果和回退后的剩余风险。

### 当前尚无 commit 时

- 不得声称可以用 Git 回退到阶段 0、1 或 2。
- 先保留当前工作区，不执行破坏性清理。
- 由项目负责人授权后创建首次基线提交；提交前必须核对 `.gitignore` 和密钥扫描。
- 首次提交后，再按阶段或修复范围建立小提交和 tag。

## 首次基线提交建议

首次提交前建议按以下顺序操作；本文件不代替项目负责人的提交授权：

```powershell
git status --short --branch
git check-ignore -v node_modules dist server/key.txt server/memory public/product public/brand
npm run check
npm audit --registry=https://registry.npmjs.org
git add .
git diff --cached --stat
git diff --cached --name-only
git commit -m "chore(repo): establish auditable project baseline"
git tag -a v0.3.0-stage-2 -m "YasPretty stage 2 structured makeup plan baseline"
```

执行 `git add .` 前必须人工确认暂存区不包含真实数据、密钥、未授权图片、`dist/` 和 `node_modules/`。如果审查发现问题，应取消暂存并修正，不得为了生成 tag 强行提交。

## 交付物关联表

| 事项 | 记录位置 |
| --- | --- |
| 阶段目的、用户价值、测试和剩余风险 | `docs/stage-delivery-test-report.md` |
| 阶段技术实现 | `docs/phase-0-baseline.md`、`docs/phase-1-ai-gateway.md` 及后续阶段记录 |
| 产品事实和图片授权状态 | `docs/product-data-accuracy-audit.md`、`docs/product-image-collection.md` |
| 代码状态 | Git commit SHA、tag 和 `git show` |
| 问题与修复 | `YAS-YYYY-NNNN` 问题记录及关联 commit |
| 参赛视频和材料 | 只引用已验证版本，不把效果图或概念功能当作运行证据 |

## 当前待办门禁

- [ ] 项目负责人授权并完成首次基线提交。
- [ ] 首次提交后创建阶段 2 版本 tag。
- [ ] 为每个公开问题分配 `YAS-YYYY-NNNN` 编号。
- [ ] 将真实测试输出和版本 SHA 绑定到参赛材料。
- [ ] 完成产品来源和图片授权后，再解除对应产品的“禁止公开”状态。

在首次基线提交完成前，最准确的状态描述是：**代码和文档可运行，但 Git 版本基线尚未建立，尚不具备正式的 commit 级回退证据。**

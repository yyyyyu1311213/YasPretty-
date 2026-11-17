# YasPretty 项目介绍 PPT 追溯说明

问题编号：`YAS-2026-0052`、`YAS-2026-0053`、`YAS-2026-0054`

初版材料提交：`8a699018be8aa9507e616520bc8f991e0dcb37ee`。唯一最终版提交：`69184054986f04efa6a42a5e80f40a5a5cc3e8bf`。封面完整图片修订：`c26acedb6129c56a7d22dd8326a709bb96f81216`。未创建 tag，未推送远端。

用途：生活服务赛道项目介绍，团队名称“人均180”。本目录只记录已经生成并校验的演示文件，不代表阶段 5 已整体完成，也不改变产品、价格、图片授权或公网发布状态。

## 版本

| 版本 | 文件 | SHA-256 | 状态 | 变更说明 |
| --- | --- | --- | --- | --- |
| 最终版 | `YasPretty-项目介绍-人均180-最终版.pptx` | `F77B687EEB991C054EAB85C917A0F98B4576703E7D4CDFC94EF9F55ED5C32E36` | 当前唯一 PPTX | 保留两处项目网页链接；封面改用竖版 Hero 并完整显示，不再裁掉右侧插画主体。 |

历史 v1.0 和 v1.1 已按项目负责人要求从当前目录移除，可从 Git 提交 `8a699018be8aa9507e616520bc8f991e0dcb37ee` 恢复。

## 数据口径

- `35 条产品资料`、`35 份核验档案`、`111 份商品与店铺证据`来自当前 `README.md` 的真实能力与数据状态记录。
- `73 项 Vitest 测试`来自 2026-11-07 的完整测试基线，不表述为 React Testing Library 或 Playwright 覆盖。
- `7 步妆容方案`来自当前 `MakeupPlan` 本地模板和 schema，不代表每一步都有已核验商品。
- 当前没有照片上传或分析能力。PPT 将照片分析明确列为后续工作。
- 产品图片来源已披露，明确再利用授权仍待核验。PPT 未将其表述为已授权、自主拍摄或自主制作。
- PPT 包含项目负责人提供的 `https://yaspretty.netlify.app/` 项目网页链接。链接本身不作为在线 AI 能力已经复验的证据。
- PPT 不包含二维码、用户数据、API Key 或真实用户照片。

## 素材与来源

- 品牌字标、Hero、分享封面和手绘素材来自 `public/assets/`，状态见 `public/assets/asset-manifest.json`。
- 产品图片来自 `public/products/`，逐张来源和授权状态见 `src/data/product-image-sources.js`。
- 界面截图于 2026-11-08（北京时间）从本地真实入口采集，包含首页、妆容工作台、方案结果、产品详情、手机视口和 WebGL 化妆桌。
- 每页讲者备注记录了主要代码、文档或素材来源及公开边界。
- 封面和结尾页的项目网页文字均写入 PowerPoint 外部超链接关系。
- 2026-11-08（北京时间）对 `https://yaspretty.netlify.app/` 发起真实 GET 请求，返回 HTTP 200；该结果只证明项目网页入口可访问，不证明在线 AI 和全部 API 已完成公网复验。

## 生成与校验

构建脚本：`scripts/build-yaspretty-presentation.mjs`。

运行前使用 Codex `load_workspace_dependencies` 返回的路径设置：

```powershell
$env:RUNTIME_NODE_MODULES = '<Node.js packages>'
$env:RUNTIME_PYTHON = '<Python executable>'
$env:PRESENTATION_SKILL_DIR = '<Presentations skill directory>'
node scripts/build-yaspretty-presentation.mjs
```

脚本默认输出“最终版”。如需复验，设置 `YASPRETTY_PRESENTATION_VERSION` 和 `YASPRETTY_PRESENTATION_OUTPUT_DIR`，将输出定向到 `.qa/`，不得覆盖当前最终文件。

脚本使用 Codex bundled workspace runtime 的 `@oai/artifact-tool`，输出 16:9、9 页 PPTX，并完成以下检查：

- PPTX 包结构完整；
- 页数为 9；
- 页面尺寸为 13.3333 × 7.5 英寸；
- 只使用 `Noto Sans SC` 和 `Noto Serif SC`；
- 标题适配检查无 finding；
- 第一方 Artifact Tool 能重新导入最终文件；
- 逐页 PNG 和整套 montage 已人工检查。

私有构建和截图目录位于被 Git 忽略的 `.qa/`，不纳入提交。

## 回退方法

- 内容回退：从 Git 提交 `8a699018be8aa9507e616520bc8f991e0dcb37ee` 恢复 v1.0 或 v1.1。
- 代码回退：通过本文件记录的 Git 提交查看或恢复 `scripts/build-yaspretty-presentation.mjs` 和对应 PPTX。
- 当前目录只保留最终版。后续修订先生成独立候选文件，验证完成后再替换最终版，并记录新 SHA-256、问题编号和变更原因。

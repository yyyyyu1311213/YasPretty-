# YasPretty 项目介绍 PPT 追溯说明

问题编号：`YAS-2026-0052`

用途：生活服务赛道项目介绍，团队名称“人均180”。本目录只记录已经生成并校验的演示文件，不代表阶段 5 已整体完成，也不改变产品、价格、图片授权或公网发布状态。

## 版本

| 版本 | 文件 | SHA-256 | 状态 | 变更说明 |
| --- | --- | --- | --- | --- |
| v1.0 | `YasPretty-项目介绍-人均180-v1.0.pptx` | `7369B0FE26D1C3E5E91DB7D9E8503A35BC949FBD6E5079A31F8D70AF8C6DF7E9` | 回退版本 | 9 页初版，结构与字体校验通过；第 4 页说明区较紧凑。 |
| v1.1 | `YasPretty-项目介绍-人均180-v1.1.pptx` | `FFED60CE28BB31E93268B85BAFE62B7B215CCE2B35441031981E70DB85FDB9EB` | 当前交付版 | 调整第 4 页截图高度和四步说明间距，避免说明文字接近页脚。 |

## 数据口径

- `35 条产品资料`、`35 份核验档案`、`111 份商品与店铺证据`来自当前 `README.md` 的真实能力与数据状态记录。
- `73 项 Vitest 测试`来自 2026-11-07 的完整测试基线，不表述为 React Testing Library 或 Playwright 覆盖。
- `7 步妆容方案`来自当前 `MakeupPlan` 本地模板和 schema，不代表每一步都有已核验商品。
- 当前没有照片上传或分析能力。PPT 将照片分析明确列为后续工作。
- 产品图片来源已披露，明确再利用授权仍待核验。PPT 未将其表述为已授权、自主拍摄或自主制作。
- PPT 不包含未经复验的公网链接、二维码、用户数据、API Key 或真实用户照片。

## 素材与来源

- 品牌字标、Hero、分享封面和手绘素材来自 `public/assets/`，状态见 `public/assets/asset-manifest.json`。
- 产品图片来自 `public/products/`，逐张来源和授权状态见 `src/data/product-image-sources.js`。
- 界面截图于 2026-11-08（北京时间）从本地真实入口采集，包含首页、妆容工作台、方案结果、产品详情、手机视口和 WebGL 化妆桌。
- 每页讲者备注记录了主要代码、文档或素材来源及公开边界。

## 生成与校验

构建脚本：`scripts/build-yaspretty-presentation.mjs`。

运行前使用 Codex `load_workspace_dependencies` 返回的路径设置：

```powershell
$env:RUNTIME_NODE_MODULES = '<Node.js packages>'
$env:RUNTIME_PYTHON = '<Python executable>'
$env:PRESENTATION_SKILL_DIR = '<Presentations skill directory>'
node scripts/build-yaspretty-presentation.mjs
```

如需生成新版本，设置 `YASPRETTY_PRESENTATION_VERSION`，不得覆盖已有 PPTX。`YASPRETTY_PRESENTATION_OUTPUT_DIR` 可将复验输出定向到 `.qa/`。

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

- 内容回退：直接使用本目录的 v1.0 文件。
- 代码回退：通过本文件记录的 Git 提交查看或恢复 `scripts/build-yaspretty-presentation.mjs` 和对应 PPTX。
- 新版本不得覆盖旧文件。修改脚本中的版本号后输出新的 PPTX，并在本表追加 SHA-256、问题编号和变更原因。

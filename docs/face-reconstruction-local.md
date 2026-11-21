# 本机面部表面重建（待人工验收）

2026-11-21，北京时间。分支 dev；基线 `144e942f75ffa0213987b75a07adb0cf75c62455`。独立产品阶段 4 范围，不新建 ARCH 阶段，未提交、未推送、未公开上线。

## 本次明确授权

负责人要求移除小Y中的照片入口，从首页末尾进入独立模块，结果不带入小Y。负责人明确同意“先按本机后端开发验证”，用途为“仅非商业科研或教育验证，不公开上线”。随后明确要求无需 FLAME 注册下载流程时切换至 3DDFA_V2。实际采用 **FaceBoxes + 3DDFA_V2 + ONNX Runtime + Three.js**，没有安装或运行 DECA。

以上是本次任务对原浏览器本地照片方案的明确调整。AGENTS.md、FINAL-PROMPT.md 原文保留，不据此修改其他约束或授权商业上线。

## 使用与真实处理

`npm run dev` 后，访问 `http://127.0.0.1:5174/` 首页末尾“面部分析”，或直接访问 `/face-study`。API 沿用 8787。上传或相机拍照前必须勾选本机处理同意。

浏览器统一方向、去除元数据并缩放到最长边 1600px，交给本机 Fastify API。照片经内存管道交给常驻 Python worker；FaceBoxes 检测人脸，3DDFA_V2 回归 62 个参数，BFM 解码为 **38,365 顶点、76,073 三角面、68 关键点**。推理仅使用 CPUExecutionProvider，不依赖 GPU。

真实结果返回后，用原图像素坐标正交投影贴合照片；自上至下显露网格 1.8 秒，照片渐隐 1.1 秒，最后显示眉形、眼部、鼻部、唇部和下颌引线。扫描动画不代表模型逐行识别。可旋转、照片对照、重播、删除；减少动效偏好直接显示结果。手机用编号对应下方说明。

用户确认贴合且无遮挡后展开基础妆容建议。单张照片仅估计可见表面，不测量真实骨骼，不识别身份，不提供未经标定的准确率。角度、模糊和光照问题会抑制精确比例文案。没有可靠自动遮挡判断，也不重建牙齿、头发或完整头部；细节比 DECA 平滑。

## 本机环境与准备

实际环境为 Windows、Python 3.13.5、NumPy 2.1.3、OpenCV 4.11.0、Pillow 11.1.0、ONNX Runtime 1.26.0、CPU PyTorch 2.14.1。设备有 RTX 3060 Laptop 6 GB，但此次没有使用 CUDA，也没有修改显卡驱动。

本次在 `.runtime/3ddfa/venv` 使用 `--system-site-packages` 复用既有包，只在该虚拟环境添加 ONNX 1.20.1 和 ml_dtypes 0.7.0；未升级全局依赖。新机器可用独立虚拟环境准备：

```powershell
node scripts/setup-face-models.mjs
python -m venv .runtime/3ddfa/venv
.runtime/3ddfa/venv/Scripts/python.exe -m pip install -r server/face-reconstruction/requirements.txt
.runtime/3ddfa/venv/Scripts/python.exe -m pip install torch onnx==1.20.1
.runtime/3ddfa/venv/Scripts/python.exe scripts/export-face-models.py
npm run dev
```

下载使用官方固定版本及 Git blob 哈希校验，记录每文件 SHA-256。导出时严格加载权重，排除官方训练专用 `fc_lm` 头；原始 PyTorch 与 ONNX 输出一致性验证通过后生成 manifest，启动 worker 时再次校验。无需 PyTorch3D、Cython 编译器或 FLAME 账号。推理本身不导入 PyTorch。

模型需先准备，再启动 API。资源位于 Git 忽略的 `.runtime/3ddfa`，不移入 public。未准备、校验失败或推理失败均明确报错，不使用通用人脸兜底。Linux 解释器路径兼容 `venv/bin/python`，尚未实测该平台。

## 接口与隐私

- `GET /api/face-reconstruction/status` 只返回本机能力状态，不暴露模型路径。
- `POST /api/face-reconstruction` 使用 `application/octet-stream`、`X-Face-Consent: local-research-v1`，最大 8 MiB。后端独立解码并验证格式、尺寸、2400 万像素上限、无人脸与多人脸。
- 只在 development 且绑定回环地址时启用，连接源也必须是回环地址；生产环境、外部连接均拒绝。不存在第三方照片上传、数据库、照片文件或人脸内容日志。
- 每分钟最多 8 次照片请求，单个 worker 同时只处理一张，不排队。60 秒超时；取消/超时结束进程，后续可重新启动。成功/失败均清空 Node 照片缓冲区，Python 释放本次照片与结果引用。释放内存不等同于操作系统级物理擦除。
- 离页、撤回同意或删除时中止请求、停止相机、释放 object URL/WebGL 资源。接口 no-store，支持 gzip；不将网格、照片或摘要带入小Y。
- 既有接口仍限 64 KiB，仅照片路由单独限 8 MiB。CSP 增加 blob 图片/媒体用于预览，保留脚本及同源约束。

Windows 虚拟环境解释器包含启动器与实际 Python 子进程；取消、超时和关闭通过已知 worker PID 结束整个进程树，再清除管道状态，避免只结束启动器。

## 来源与许可

- https://github.com/cleardusk/3DDFA_V2 ，固定提交 `1b6c67601abffc1e9f248b291708aef0e43b55ae`。
- 代码 MIT；完整声明见 `server/face-reconstruction/THIRD_PARTY_LICENSE.txt`。worker 的裁剪、先验框、NMS、投影按官方代码适配为 NumPy，不宣称模型自研。
- https://github.com/cleardusk/3DDFA_V2/blob/master/bfm/readme.md 明确修改后的 BFM2009 **仅供学术使用**；商用须另行取得许可。代码 MIT 不覆盖 BFM，本次只按已确认的科研/教育用途验证。
- 检测权重、对齐权重和几何均来自上述官方固定版本；运行模型约 39.2 MB。来源哈希在本机 `.runtime/3ddfa/source.json`，转换哈希在 `models/manifest.json`。不公开或提交这些资产。
- 保留旧 MediaPipe 源码/资源以保全原未提交现场，新入口不调用旧模型或摘要链路。

## 验证和局限

真实 HTTP 首次约 2838 ms（含进程与模型启动、重建、序列化、传输及解析），后续约 403/395 ms，其中检测与重建约 64/57.3 ms。仅代表本机单张现有示意照片、单用户测试，不能推导准确率或并发性能。

真实 Playwright 验证 1440×900 与 360×900：入口、同意、非法文件、真实模型、扫描/渐隐、旋转、照片对照、建议确认、无人脸/多人脸、删除、关闭相机、离页清理和小Y无照片入口；无 pageerror 或横向溢出。截图发现背景透出后修正暖色底面并重新检查。测试使用仓库既有示意照片，QA 产物在忽略的 `.qa/face-study/`，无新增用户照片。

```powershell
npm test
npm run build
node tests/face-reconstruction-worker.mjs
node tests/browser/face-reconstruction.mjs
git diff --check
```

worker 集成测试使用真实模型验证并发拒绝、取消后结束进程、再次启动、非法图片、超时、不同照片产生不同几何。浏览器脚本默认读取已有 `.qa/playwright` 和 Edge，可用 `YAS_QA_PLAYWRIGHT_MODULE`、`YAS_QA_BROWSER_EXECUTABLE`、`YAS_QA_BASE_URL` 调整。旧 `tests/browser/visual-analysis.mjs` 是旧 MediaPipe/小Y流程历史脚本，当前流程改用上述新脚本。

尚未验证真实手机相机、其他浏览器、多用户负载和准确率数据集；不是商业上线交付。待负责人完成人工验收，不提交、不推送、不打标签。

最终补充检查：真实浏览器禁用 WebGL 后，保留可读照片、显示明确错误且不生成成功标签；Windows 进程树关闭补强后，真实 worker 生命周期测试、368 项全量测试、生产构建和 diff 检查再次通过。

2026-11-21 dev 整合：本文早期 3DDFA 单模型、核对门槛与五处引线描述保留作历史。当前版本为独立双模型模块，以[双模型与三庭说明](deca-comparison-local.md)和实际界面为准。

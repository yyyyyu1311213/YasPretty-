# DECA / 3DDFA 本机对照实验（进行中）

2026-11-21，北京时间。负责人明确授权新建 DECA 测试分支；仅非商业科研/教育验证，不公开上线。此记录不修改 AGENTS.md / FINAL-PROMPT.md 的公共约束，也不推进 ARCH 阶段。

## 隔离与启动

- 原目录 `E:\work\game\CODING\repo\Y02\YasPretty-` 保留在 `dev`。
- 实验目录 `E:\work\game\CODING\repo\Y02\YasPretty-deca-compare`，分支 `experiment/deca-comparison`。
- 两者基线均为 `144e942f75ffa0213987b75a07adb0cf75c62455`。本次开始时 fetch 和实时远端核对一致。
- 原目录已有 50 个修改/未跟踪文件，复制到实验目录作为起点，未覆盖或清理原目录。原路径与 SHA-256 保存在实验目录忽略的 `.qa/dev-baseline.json`。未提交修改不是 Git 回退点；本次没有提交、推送或打标签。
- 实验目录 `node_modules` 使用本机 junction 复用原依赖，未新增 npm 依赖。实验 Vite 缓存置于 `.runtime/vite-comparison`；Python 依赖在实验目录独立虚拟环境。

在实验目录运行：

```powershell
node scripts/dev-face-comparison.mjs
```

访问 `http://127.0.0.1:5175/face-study`，API 为 8788。原站仍用 5174 / 8787。返回原方案只需访问原站，无需在有未提交修改的目录执行 `git switch`。实验启动器只结束自己启动的进程树。

## 当前真实状态

2026-11-21 补充：负责人已提供 Tools/FLAME2020.zip 与 deca_model.tar。FLAME ZIP 全部条目 CRC 通过，三个 DECA 网络严格加载权重通过，真实 FLAME/DECA 初始化和照片推理成功。两种方案已可在 5175 页面用同一照片切换。**技术接入与两张仓库示意照对照完成，个人照片形似仍待负责人验收**；不是准确率或正式上线验收。缺模型仍返回 unavailable，不回退为另一模型。

以下官方文件现已由负责人下载并导入，无需再次下载；来源保留用于复现：

1. [FLAME 官网](https://flame.is.tue.mpg.de/)：自行注册、接受许可并下载 **FLAME2020.zip**，其中必须包含 `generic_model.pkl`。不以 FLAME2023 或表情纹理包替代。
2. [DECA 官方权重](https://drive.google.com/file/d/1rp8kdyLPvErw2dTmqtjISRVvQLj6Yzje/view)：`deca_model.tar`。本机 gdown 连接失败，官方 docs.google.com / drive.usercontent.google.com 下载端点也超时；未改用来源不明镜像。

模型导入命令（已执行）：

```powershell
.runtime/deca/venv/Scripts/python.exe scripts/prepare-deca-assets.py --flame '本机FLAME2020.zip绝对路径' --checkpoint '本机deca_model.tar绝对路径'
```

脚本只提取指定模型文件，不解压任意 ZIP 路径；复制并验证已有 FaceBoxes 检测器，生成文件摘要，然后检查真实模型初始化。失败时不保留 ready manifest。成功后重启实验服务。

## 环境复现

Python 3.10 用于兼容 DECA 的旧版 Chumpy / NumPy。PyTorch 执行两个编码器及细节解码器，ONNX Runtime 复用 FaceBoxes 检测器；这些依赖只在本机后端，不增加浏览器下载体积。第三方组件许可证继承各发行包，DECA / FLAME 单独受非商业科研许可限制，不能因为 PyTorch 或适配器许可而推定模型可商用。

```powershell
uv venv --python 3.10 .runtime/deca/venv
uv pip install --python .runtime/deca/venv/Scripts/python.exe pip setuptools==69.5.1 wheel numpy==1.23.5 scipy==1.10.1 six
uv pip install --python .runtime/deca/venv/Scripts/python.exe --no-build-isolation -r server/face-reconstruction/deca-requirements.txt
uv pip install --python .runtime/deca/venv/Scripts/python.exe torch==2.5.1 torchvision==0.20.1
node scripts/setup-deca-models.mjs
```

本机 PyPI 下载停滞后，Python 依赖使用清华 PyPI 镜像安装。CUDA 12.1 的 2.3 GiB PyTorch 包下载重试，当前先准备 CPU 版本；GPU 性能没有测试。后续可在同一个实验虚拟环境安装官方 cu121 版本，`YAS_DECA_DEVICE=auto` 将使用可用 GPU；可显式设为 `cpu` 或 `cuda`，指定 cuda 不可用时会失败，不冒充 GPU 推理。

## 模型来源与实现边界

- [DECA 官方仓库](https://github.com/yfeng95/DECA)，固定 `a11554ae2a2b0f3998cf1fa94dd4db03babb34a2`。源码及辅助几何通过 GitHub 官方 API 获取，校验 Git blob SHA-1 并记录 SHA-256 到 `.runtime/deca/source.json`。
- 上游许可证保存在 `.runtime/deca/upstream/LICENSE`。源码、辅助数据、FLAME 与训练权重均留在忽略的 `.runtime/`，不复制入公共资产、dist 或提交。
- `deca-worker.py` 调用官方 E_flame / E_detail / D_detail、FLAME、vertex_normals、upsample_mesh，严格加载权重。细节网格遵循上游 `save_obj` 的位移图与最终 OBJ 三角面顺序（外层翻转后，未贴图 write_obj 再次翻转，净顺序与模板相同）。Three.js 承担网站渲染，没有安装 Windows 编译光栅器，没有纹理/肤色贴图。
- 使用共享的 FaceBoxes 检测框，按 DECA 的 bbox 模式（224 裁剪、1.25 倍尺度）推理并映射回同一原图；这不是官方默认 FAN 检测器。已通过两张示意照真实推理及原图叠加检查，但没有以官方 FAN + 光栅器作数值等价验收，不宣称与官方完整渲染完全一致。
- 3DDFA 实验展示修正图像 Y 翻转对应的三角面绕序，避免错误法线影响立体光照。原 dev 展示未改；这个修正本身不提高身份形状拟合能力。
- DECA 细节模板有 59,315 个顶点、117,380 个三角面；实际两张示意照重建均返回这一拓扑规模；顶点数量不是准确率证据。

## 对照方法与隐私

同一张规范化照片仅在浏览器内存保留；切换到另一方案时仍发送给本机后端，后端处理后释放。当前照片的两组结果只放页面内存，删除、撤销同意或离页同时清空。沿用同意、仅 loopback、本地开发环境、8 MiB、限流、取消和超时门禁，不传给小Y或第三方，不保存照片/网格。

对照时先看正面原图叠加，依次检查内外眼角、鼻翼/鼻尖、上下唇/嘴角及下颌边缘；再在相同材质与视角下看纯模型与小角度旋转。显示检测重建耗时及请求耗时，区分首次启动、后续请求和动画。人工评估形似与位置分别记录；只有两种模型输出不能构成真实深度误差基准，也不能把顶点数量当成准确率。

```powershell
node tests/face-model-comparison.mjs
```

真实双模型脚本测冷/热请求、检查来源与输入尺寸，不落盘照片或网格，不输出个人关键点。此前缺资产时明确拒绝运行；文件到位后，两张示意照的真实双模型冷/热请求检查已通过。形似结论仍需独立人工评估。

## 初次准备时的验证记录（文件到位前，保留历史）

- `npm test`：46 文件、372 项通过（含 DECA 不可用不回退、来源不匹配、隐私门禁）。测试桩只验证接口行为，不计为真实 DECA 推理。
- `npm run build`：1,879 模块通过；原有超过 500 kB 的包体提示保留。
- `tests/browser/face-reconstruction.mjs`：真实 3DDFA，1440×900 / 360×900，扫描、渐隐、旋转、照片对照、清除、摄像头与错误状态通过，无 pageerror/溢出。截图在 `.qa/face-study/`。
- `tests/browser/face-comparison.mjs`：真实 DECA 不可用状态、禁止假回退；模拟 readiness 过期后使用真实 503，验证原模型恢复和删除后不复用照片。未模拟 DECA 成功几何。
- `prepare-deca-assets.py`：准确报告缺 `generic_model.pkl` 与 `deca_model.tar`。
- Python 语法检查通过。实际 DECA 加载和照片推理待模型；本实验仍进行中，不作完成/上线结论。

Playwright 复用原目录 `.qa/playwright/node_modules/playwright/index.mjs`，通过 `YAS_QA_PLAYWRIGHT_MODULE` 指定 file URL；`YAS_QA_BASE_URL=http://127.0.0.1:5175`。


2026-11-21 补充实测：独立 Python 3.10 环境安装完成，PyTorch 2.5.1+cpu / torchvision 0.20.1。`tests/deca-adapter.py` 通过依赖导入、相机/裁剪投影、官方 UV 插值和缺模型拒绝检查；这些检查未加载训练权重、不产生个人重建，不能替代真实 DECA 对照。上游 torch.cross / torchvision 旧参数警告保留，未修改受限第三方源码。原 dev 的 50 个起始变更文件 SHA-256 全部与隔离前一致；原分支/HEAD 未变。`git diff --check` 通过。


## 文件到位后的真实对照（2026-11-21，北京时间）

使用仓库已有 oily-skin.jpg、camera-ready-skin.jpg 示意照片，未使用或保存用户个人照片。FLAME2020.zip 为 153,841,121 字节、deca_model.tar 为 434,142,943 字节，运行资产的 SHA-256 在忽略的 .runtime/deca/models/manifest.json；不提交受限模型。首次不完整 crdownload 的 generic_model.pkl CRC 失败，完整重下载后 ZIP 全量 CRC 通过，保留此失败记录。

| 同照片测试 | 3DDFA 首次/再次请求 | DECA 首次/再次请求 | DECA 检测重建（首次/再次） |
| --- | --- | --- | --- |
| oily-skin | 4052 / 225 ms | 11930 / 730 ms | 793.7 / 423.5 ms |
| camera-ready-skin | 1330 / 314 ms | 42255 / 796 ms | 794.4 / 548.6 ms |

均为本机 CPU 单次实测，不是均值、p95 或 GPU 性能。第二张冷启动与浏览器 DECA 冷启动并行，资源竞争明显；浏览器原 30 秒等待因此超时，改为与后端 60 秒边界兼容的 70 秒测试等待后顺序执行。页面推理本身不扩展后端超时。请求耗时包含启动、校验、重建和 IPC，浏览器 HTTP/渲染另有开销；动画不计入上述耗时。

真实浏览器对照在桌面 1440×900 测两张照片，360×900 测第二张，DECA 检测/重建为 707 / 762.5 / 615 ms，3DDFA 为 77.9 / 151.7 / 115.8 ms。上传 Blob 的 SHA-256 在页面测试内比较，两种模型收到同一组规范化照片字节。扫描、渐隐、原图叠加、旋转、来回切换缓存、清除后不可复用、无额外照片 POST、无 pageerror/横向溢出均通过。真实测试未 mock 模型结果。测试初版 Playwright postDataBuffer 无法读取 Blob 而报空值，已改为发送前计算摘要；摘要不写日志/结果文件。

视觉检查：DECA 额外提供头顶、耳部、颈部以及唇周/面颊表面细节；第一张模型位置基本贴合，嘴部开口和鼻形仍有估计偏差。第二张近景照中眼部及下颌也不完全贴合，头顶和颈部会超出画框（两模型仍按原照片统一尺度，未各自缩放美化）。3DDFA 仅覆盖面部，细节较平滑，但不能据两张照片断言其个体形似必然较差。两者的眼球、口腔和不可见区域都是模型估计，额外头颈不等于照片实测。没有独立 3D 真值或人工标注，未计算/声称准确率提升。保留两种方案交负责人试用，未改默认方案、算法裁剪或公共页面目标。

QA 证据：.qa/deca-comparison/ 中的 mesh/overlay 截图、measurements.json，以及 sample-comparison.png（左原图、中 3DDFA、右 DECA，网格截图中心裁切，保留相同像素比例）。这些都是仓库示意图测试产物，不上传 Git。复跑：

```powershell
node tests/face-model-comparison.mjs
node tests/face-model-comparison.mjs public/assets/skin-guide/camera-ready-skin.jpg
$env:YAS_TEST_FACE_ENGINE='DECA'
node tests/face-reconstruction-worker.mjs
# 按前文配置 Playwright 路径
node tests/browser/face-comparison-real.mjs
node tests/browser/face-comparison.mjs
```

DECA 真实 worker 的取消、并发拒绝、重启、非法照片、超时和不同输入几何检查通过。缺模型浏览器测试现显式模拟 readiness / 503，以便已安装环境复跑；其成功不计为真实推理，真实推理由 face-comparison-real.mjs 单独验证。

分支仍基于 144e942；后续 fetch 发现 origin/dev 前进到 ad9ffe6（小Y规格追问修复），未自动合并或覆盖。原 dev 的 50 个起始改动文件哈希全部未变。实验仍未暂存、提交、推送或打标签；AGENTS.md / FINAL-PROMPT.md 未改，当前交付为待人工验收。


## 2026-11-21 扫描完成后模型归中（待人工验收）

负责人反馈：照片中人脸位于右下角时，扫描结束仍停在右下角。实验分支 FaceStudyViewer.jsx 改为两个展示位置：扫描/渐隐/原图对照使用原照片坐标，照片消失后用 650 ms 平滑移动到模型包围盒中心与模块中心重合的位置；五官锚点加上同一平移，归中结束显示标签并允许旋转。重播或原图对照时重置相机并恢复原位。减少动态效果设置直接归中。切换结果/卸载清理 animation frame，resize 重新计算平移。仅平移，不自动缩放或改变重建几何、姿态、默认引擎；大头像裁切/小头像尺寸不在此次授权调整范围。

新增 tests/browser/face-centering.mjs：将仓库示意人脸放在 1600×1600 图像右下角，经真实 3DDFA/DECA 推理，在 1440×900 与 360×900 验证。通过渲染截图与隐藏模型背景做像素差分，四组完成时中心误差均小于 1px；原图对照中心回到右下角且与原始几何投影中心误差小于 5px。引线锚点跟随，重播重新归中，删除清理及无 pageerror 通过。截图在忽略的 .qa/face-centering/，不含用户个人照片。测试初版隐藏 canvas 后使用 element screenshot 不可见超时，以及元素截图/page clip 的一像素尺寸差，均仅为测试截图方式问题，改为同一个 page clip 捕获后通过。现有双模型真实浏览器脚本改为等待归中完成再截图/旋转。

npm test 46 文件/372 项与 npm run build 1879 模块通过，已有大包提示保留。原 dev 50 个起始修改哈希未变；HEAD 144e942、origin/dev ad9ffe6，fetch 核对后保持隔离未合并。无暂存/提交/推送，AGENTS.md 和 FINAL-PROMPT.md 未改。

关于精度：仅给方案评估，未启动训练、微调或单图拟合。官方 DECA Training 指引要求图像数据、68 点标注、皮肤 mask、身份特征损失网络和训练配置；当前环境只有 CPU 推理适配器，不是完整训练环境。缺少本项目授权训练集、独立验证集和 3D 真值时不能承诺短期微调收益。建议后续先评估每图关键点约束拟合（调整相机/姿态/表情/形状参数，不更新网络权重），代价是额外计算且二维贴合不等于真实深度精度。用户原照片处理许可不包含留存训练；没有收集或保存训练照片。参考 https://github.com/yfeng95/DECA#training ，本地固定源码 README Training 节已读取。

归中后的最终回归：tests/browser/face-comparison-real.mjs 两种真实模型、桌面两张示意图/360px 一张示意图全部通过；包含归中后旋转、原图叠加、切换缓存和清除，无 pageerror/溢出。git diff --check 通过。


## 2026-11-21（北京时间）形态倾向与本地妆容报表，待人工验收

产品阶段 4 独立功能，问题编号未分配，不推进 ARCH 阶段。负责人确认：双模型后续保留到 dev；本轮先以本地几何规则判断五官/脸型倾向，允许修正，不确定时不强行输出丹凤眼等细类；下方本地生成简单妆容适配报表，不调用外部 AI、不推荐商品、不带入小Y。本轮仍在 experiment/deca-comparison 实验目录，原 dev 保留。fetch 核对 origin/dev 已前进至 c4dbbb7，本实验 HEAD 仍为 144e942，未自动合并，不声称包含新 dev 的小Y修复。尚未暂存/提交/推送，无新提交 SHA/tag。

实际文件：新增 faceFeatures.js、faceMakeupReport.js、FaceFeatureReport.jsx，调整 FaceStudy.jsx/CSS、faceAnnotations.js 与规则测试；新增 tests/browser/face-feature-report.mjs，既有浏览器测试同步确认文案。入口仍 http://127.0.0.1:5175/face-study；扫描/归中后核对照片，勾选核对项查看五项形态参考，可逐项选择形态、暂不判断或看不清/有遮挡，再展开六部分报表。眉妆、眼妆、鼻部修容、唇妆、腮红布局、脸部修容各包含采用特征、手法与理由。脸型不再展示下颌比例；眼距等仅在信息允许时作为次要参考。

规则版本 face-features.v1：模型投影的 68 点以双眼轴归一旋转，所有判据用无量纲比例/角度。眉形采用两侧眉弧与眉尾升幅一致性；眼型参考睑裂高宽比与眼尾走向，鼻部仅参考鼻翼宽与内眼角间距关系，唇部参考内外唇缘厚度并拒绝明显张嘴；脸型结合眉部到下巴的长度代理、下颌宽度和转折角。没有发际线点，不把代理长度当完整脸长。鼻梁高低、眉骨、单/双眼皮、种族或身份不在输出范围。

阈值是未标定的保守编辑规则，不是训练模型或医学标准：眼部高宽 .26–.30 且眼尾变化较小为杏仁倾向，>.34 为偏圆，<.23 为细长（再看眼尾）；眉弧高/宽 >.16 的范围考虑弯眉；鼻翼/眼距 <.82 或 >1.20 对应偏窄/偏宽，中间留未归类区间；上/下唇厚度 <.70 或 >1.30 对应上薄/上饱满；脸型需长度代理、下颌宽和转折共同符合。详细门槛以代码为准，边界区间保持 unknown。偏航 >20°、任一后端画质提示、无效/退化关键点不自动分类；闭眼、左右不一致、张嘴等另按部位处理。没有独立标注集，不显示虚构百分比置信度或准确率，使用几何倾向/信息不足/用户修正说明来源。遮挡不能凭现有关键点可靠检测，用户核对后仍可逐项标记。

用户选择与几何估计分开记录，只在页面内存保留；用户选择不写成模型已验证。看不清或暂不判断的部位输出通用手法，不偷偷使用旧估计。模型引线标签、形态卡与报表共享同一解释；修改脸型更新腮红/轮廓，两者以外内容保持。切换引擎（含缓存）、重新选图、取消核对、取消同意、删除或离页清空相应修正/报表，不能恢复旧结论。后端路由、模型文件、照片处理范围未变，没有新增依赖、网络调用或持久化。前端模块分包约 24.89 kB（gzip 11.14 kB）；不进入主站同步模型包。

真实验证：npm test 46 文件/377 项通过，npm run build 1882 模块通过，原 >500 kB 包体提示保留。8 项规则/报表测试使用明确几何夹具验证缩放/平移/旋转不变性、分类分支、不确定/闭眼/张嘴/异常输入、用户修正来源、针对性更新与通用降级；不作为真实分类准确率。face-feature-report.mjs 使用真实 DECA / 3DDFA，在 1440×900、360×900 验证核对门禁、裁切照片不强行分类、五项自选、六项报表、脸型关联更新、遮挡降级、撤销核对/引擎切换/缓存/删除清理，未新增照片 POST 或 local/sessionStorage，无 pageerror/横向溢出。截图 .qa/face-feature-report/*-report-user-corrected.png 明确属于用户修正场景，不能作为自动分类效果证据。既有 face-reconstruction.mjs 桌面/手机、无人脸/多人脸、相机释放、扫描/归中/旋转、删除、WebGL 失败回归通过。

真实样本限制：现有 oily-skin、camera-ready-skin、dry-skin 示意照受偏航/边缘/模糊提示影响，本轮保持保守拒绝自动分类。额外只读检查 scikit-image 自带 NASA astronaut 公共领域样本（包内 _fetchers.py 说明来源 https://flic.kr/p/r9qvLn），原图人脸太小被后端 LOW_RESOLUTION 拒绝，没有放大绕过质量门禁或添加到站内素材。没有通过这些例子证明分类准确率，自动命名仍需后续授权清晰正面样本人工核对。没有使用、保存或训练用户照片。

原 dev 的 50 个起始修改文件 SHA-256 全部未变；AGENTS.md / FINAL-PROMPT.md 项目约束未改。当前供负责人体验形态/报表交互，待人工验收与后续 dev 整合，不自行开始训练、精度拟合或提交。

## 2026-11-21 可见发际线与逐部位方案（本机实验，待人工验收）

重建覆盖完整面部，但只对眉、眼、鼻分类并显示引线。脸型只接受自选；不分析唇形。扫描后直接展示观察与对应建议，保留上传前同意、撤销、删除及离页清理。商品按钮打开主站详情；不向外部 AI 或小Y传递照片或特征。

采用 [BiSeNet ResNet18](https://github.com/yakhyo/face-parsing/tree/4f0632b17a3e729a7871683aab7c89b6a595da9f)，代码 MIT，训练来源 [CelebAMask-HQ](https://github.com/switchablenorms/CelebAMask-HQ) 限非商业研究。通过固定版本 [ONNX 文件](https://huggingface.co/jbrownkramer/face-parsing/tree/4be031c61a22e801ab389ab9ccf954781772fd42) 准备权重（53,205,364 字节，SHA-256 见准备脚本），不纳入 Git 或前端包。相比 SegFormer，这里优先验证能直接用现有 ONNX Runtime 的较小模型；未做两个分割网络的精度排名。仅在本机照片处理进程中复用会话；模型缺失/损坏或运行失败仍可重建。原图、mask、网格均未因本调整新增持久化或第三方请求。

在纠正平面旋转后的正面裁切上，检查额中央和两侧连续皮肤到头发边界，拒绝帽子、裁断、遮挡嫌疑、明显左右不一致、侧脸、俯仰和画质告警。使用可见发际线、双眉内端平均点、鼻底点、颏点的纵向投影计算三段占比；短下巴单独参考下唇到颏点在下庭中的占比，明显张口时不输出。偏长/偏短是未经人群标定的编辑提示，不是标准脸比例。没有三庭引线。用户可按部位纠正或跳过三庭。平直厚刘海可能仍被误认为发际线；此模型识别可见头发，不可能从遮挡区域获得真实边界。

复跑：在本实验 worktree 执行 `.runtime/deca/venv/Scripts/python.exe scripts/setup-face-parsing.py --qa`，重启本机实验服务 `node scripts/dev-face-comparison.mjs`，再运行 `.runtime/deca/venv/Scripts/python.exe tests/face-thirds-real.py`、`node tests/browser/face-feature-report.mjs`（Playwright 路径同上）。上游四张展示照固定在上述源提交，仅在忽略的 .qa/hairline 中用于研究；不作为公开网页资产。两种引擎均对 1、1321 给出比例，对 1112（帽子）、1309（侧刘海）和 1 的裁切拒绝输出完整三庭。样例 1：3DDFA 33.7% / 33.9% / 32.4%，DECA 35.4% / 33.1% / 31.4%。测试还覆盖缺权重保留重建。四张原图分割单次本机 CPU 耗时 166–313 ms，不含重建和浏览器开销；非 p95 或准确率。无独立发际线真值，无用户照片用于训练。

2026-11-21 本机实验更新：模型与卡片显示形态名称及“照片估算”来源；桌面模型旁、手机模型下沿同步显示三庭比例、检测失败原因或跳过状态。已知形态提供推荐妆造、理由、手法及收尾检查；每步从受控库选取最多 3 个不同商品并分别说明用法。同类可替换，显式跳过/遮挡不作个性化推荐。

2026-11-21 整合至 dev：上文实验分支、目录和端口描述为历史记录。当前在项目根目录运行；先按基础模型说明准备 `.runtime/3ddfa`，再按本文准备 `.runtime/deca` 和可选分割模型。`npm run dev` 默认在 5174 / 8787 提供本机双模型体验，也可用 `node scripts/dev-face-comparison.mjs` 启用 5175 / 8788。模型文件、样例、用户照片和 Python 环境不随仓库分发。

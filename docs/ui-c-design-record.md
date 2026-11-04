# UI-C 互动化妆桌动效记录

记录日期：2026-11-04（北京时间）

回退基点：本地分支 `codex/ui-c-rollback-base`，指向提交 `2c3d8b0`。该基点未改写或覆盖工作树中已有的未提交内容。

## 实现范围

本次新增 `src/components/MakeupTable.jsx` 与 `src/components/MakeupTable.css`，接入首页并置于 Hero 之前，作为品牌开幕淡出后的第一视觉。桌面从页面纸张背景中延展出来，不使用独立海报式矩形底图；产品位置保留为后续产品展示和 slogan 动效的承载层。化妆桌从 `src/data/products.js` 的 `categoryOptions` 和 `products` 动态聚合品类，只渲染当前存在真实产品的类别；每个类别最多展开 5 款产品，`查看全部` 进入现有产品库并应用类别筛选，产品点击复用现有详情抽屉和导航历史。

桌面端采用 React 状态、CSS `transform`/`opacity`、固定尺寸和有限的错峰延迟实现入场与品类展开；移动端切换为底部产品面板，支持关闭按钮、Esc 和下滑关闭。`prefers-reduced-motion: reduce` 下取消位移、旋转和错峰，仅保留稳定显示。

## React Bits 来源与适配

本实现借鉴了 React Bits 下列公开组件的布局和动效思路，没有引入其运行时依赖，也没有复制其演示图片或示例产品数据：

- [Bounce Cards 页面](https://reactbits.dev/components/bounce-cards) / [上游源码](https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/BounceCards)：扇形卡片、错峰入场、焦点上浮。
- [Circular Carousel 页面](https://reactbits.dev/components/circular-carousel) / [上游源码](https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/CircularCarousel)：中心到两侧的入场节奏、缓出 easing 和有限的图片预加载。
- [Orbit Images 页面](https://reactbits.dev/components/orbit-images) / [上游源码](https://github.com/DavidHDev/react-bits/tree/main/src/content/Animations/OrbitImages)：围绕中心主体计算有限展开位置的思路。
- [Tilted Card 页面](https://reactbits.dev/components/tilted-card) / [上游源码](https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/TiltedCard)：产品单元悬停/聚焦时的轻微倾斜。
- [Animated List 页面](https://reactbits.dev/components/animated-list) / [上游源码](https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/AnimatedList)：移动端列表式选择和键盘交互的参考。
- [Ghost Cursor 页面](https://reactbits.dev/components/ghost-cursor) / [上游源码](https://github.com/DavidHDev/react-bits)：化妆桌教程层使用其 WebGL 烟雾光标源码，实际文件为 `src/components/makeup-table-3d/GhostCursor.jsx`，并通过 `GhostCursor.css` 保持透明覆盖层。YasPretty 只调整粉色主题、轨迹长度、像素预算、淡出时机和展开状态下的卸载行为；不把该第三方实现表述为自主研发。

React Bits 上游许可证为 [MIT + Commons Clause](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)。本项目保留来源披露；本次实现是 YasPretty 的独立 React/CSS 适配，不安装 `motion/react`、GSAP 或 `@hugeicons/*`。

## 产品数据边界

截至记录日期，受控数据中 8 个目标品类均有产品：粉底液、气垫、遮瑕、散粉、眼影、睫毛膏、腮红和唇妆。产品事实、图片来源、核验状态和图片授权状态继续以产品档案字段为准；页面不会为缺少数据的品类创建虚构商品。


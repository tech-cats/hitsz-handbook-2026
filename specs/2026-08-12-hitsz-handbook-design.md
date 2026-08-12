# HITSZ Handbook 2026 文档站设计

日期：2026-08-12
状态：已批准（含修订：哈工大蓝配色、十字准心旋转波纹）

> 变更记录：2026-08-12 —— 十字准心波纹按用户要求移除（暂不使用），动画仅保留转场 / 下划线 / 按压 / 降级。

## 目标

搭建一个可部署到 GitHub Pages 的静态文档站：布局与设计参考 VuePress（使用其官方继任者 VitePress 默认主题），动画采用页面转场与微交互体系（淡出/淡入转场、下划线、按压反馈、降级策略），配色采用哈工大蓝。

## 技术栈

- **VitePress 1.6.x**（pnpm 管理，Node 24）
- 内容：Markdown + frontmatter，纯静态输出
- 部署：GitHub Actions（`actions/deploy-pages`）推送构建产物到 GitHub Pages

## 布局（参考 VuePress）

VitePress 默认主题三栏文档布局，全部保留：
- 顶部导航栏（标题 + 导航链接 + 深色模式 + 本地搜索）
- 左侧分组侧边栏（可折叠）
- 右侧当前页大纲
- Markdown 渲染（代码高亮、表格、提示块）

## 设计系统（哈工大蓝）

哈工大蓝主色 `#004098`（HIT blue），围绕它构建品牌色阶，覆盖 VitePress 品牌变量：

| 令牌 | 值 | 用途 |
|---|---|---|
| `--vp-c-brand-1` | `#004098` | 主品牌色：链接、当前页高亮、按钮 |
| `--vp-c-brand-2` | `#0053b8` | hover 态 |
| `--vp-c-brand-3` | `#003a82` | active 态 |
| `--vp-c-brand-soft` | `rgba(0, 64, 152, .13)` | 选中项浅底、提示块 |

中性色采用 slate 蓝灰系（`#f8fafc` 浅底 / `#1e293b` 正文 / `#64748b` 次级文字 / `#e2e8f0` 边框），深色模式 slate-950 底。字体栈：PingFang SC / Hiragino Sans GB / Microsoft YaHei / Noto Sans CJK SC。

动效令牌：

```
--ease-standard:   cubic-bezier(0.2, 0.8, 0.2, 1)   常态过渡
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1)    入场
--ease-in-quart:   cubic-bezier(0.5, 0, 0.75, 0)    退场
--ease-pop:        cubic-bezier(0.34, 1.56, 0.64, 1) 弹性（搜索面板）
```

## 动画

1. **页面转场**：路由切换时内容淡出 200ms ease-in-quart、淡入 300ms ease-standard（Vue Transition 驱动，覆盖全局 Content 组件实现）；顶部导航栏位于 Content 之外，转场期间保持原位。
2. **点击波纹 —— 十字准心旋转扩大**（用户修订）：点击站内链接时，在点击坐标出现十字准心（中心点 + 横竖十字线，哈工大蓝），`rotate 0→360deg` 且 `scale 0.2→1.6` 同步扩大，500ms ease-out-expo，透明度 0.9→0 淡出。
3. **导航下划线**：顶部导航链接 hover 时 1px 哈工大蓝线自左向右 `scaleX` 生长。
4. **按压反馈**：可点击元素 active 时 `scale 0.96`（80ms）。
5. **焦点可见性**：`focus-visible` 哈工大蓝 2px 细环。
6. **降级**：`prefers-reduced-motion` 关闭全部动画；`@media print` 去掉装饰。

## 目录结构

```
hitsz-handbook-2026/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts
│   │   └── theme/
│   │       ├── index.ts     # 主题入口：Content 转场
│   │       └── style.css    # 设计系统 + 动画
│   ├── index.md             # 首页 hero
│   └── guide/hello.md       # Hello, world
├── .github/workflows/deploy.yml
├── specs/                   # 设计文档（避开 docs/ 内容目录）
├── package.json
├── .gitignore
└── README.md
```

## 部署（GitHub Pages + CI/CD）

- `deploy.yml`：push main 触发 → pnpm install → `pnpm docs:build` → `configure-pages` → `upload-pages-artifact` → `deploy-pages`；`permissions: pages: write, id-token: write`。
- base 路径环境变量注入：本地默认 `/`；CI 设置 `VITEPRESS_BASE=/hitsz-handbook-2026/`（项目页）。
- README 说明：Settings → Pages → Source 选 GitHub Actions。

## 验证

1. `pnpm docs:build` 成功。
2. 本地 `pnpm docs:preview` + 浏览器：验证转场、下划线、按压、焦点环、reduced-motion 降级、深色模式、搜索。

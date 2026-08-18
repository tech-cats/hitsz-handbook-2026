# HITSZ Handbook 2026

哈尔滨工业大学（深圳）2026 新生手册 —— 基于 [VitePress](https://vitepress.dev) 的静态文档站。

布局与设计参考 VuePress 文档站形态，动画采用页面转场、导航下划线、按压反馈与 reduced-motion 降级体系，配色为哈工大蓝。

## 本地开发

```bash
pnpm install
pnpm docs:dev        # 开发服务器 http://localhost:5173
pnpm docs:build      # 生产构建 → docs/.vitepress/dist
pnpm docs:preview    # 本地预览构建产物
```

## 内容

Markdown 文件放在 `docs/` 下，导航与侧边栏在 `docs/.vitepress/config.mts` 中配置。

源稿可按章节同步到文档站。迁移脚本只导入正文，不会导入标有“不进入正文”的讨论稿：

```bash
pnpm content:migrate ~/笔记/生存手册26/哈工深2026生存手册.md
```

## 部署（GitHub Pages + CI/CD）

1. 将仓库推送到 GitHub（`ci` 分支）。
2. 仓库 Settings → Pages → **Build and deployment / Source** 选择 **GitHub Actions**。
3. push 后由 `.github/workflows/deploy.yml` 自动构建并部署；也可以在 Actions 页面手动运行。

工作流会根据仓库名自动设置 VitePress 的 `base`：普通仓库发布到
`https://<owner>.github.io/<repo>/`，名为 `<owner>.github.io` 的仓库发布到站点根路径。

## 目录结构

```
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts        # 站点配置
│   │   └── theme/
│   │       ├── index.ts      # 主题入口：Content 转场
│   │       └── style.css     # 设计系统（哈工大蓝）+ 动画
│   ├── index.md              # 首页
│   └── guide/                # 文档内容
├── .github/workflows/deploy.yml
└── specs/                    # 设计文档
```

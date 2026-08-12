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

## 部署（GitHub Pages + CI/CD）

1. 将仓库推送到 GitHub（main 分支）。
2. 仓库 Settings → Pages → **Build and deployment / Source** 选择 **GitHub Actions**。
3. push 后由 `.github/workflows/deploy.yml` 自动构建并部署。

> 项目页（`https://<user>.github.io/<repo>/`）需将 `deploy.yml` 中的 `VITEPRESS_BASE` 改为 `/你的仓库名/`；部署到用户页（`<user>.github.io`）则删除该环境变量。

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

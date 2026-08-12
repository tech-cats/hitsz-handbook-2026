import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

// GitHub Pages 项目页时由 CI 注入 /<repo>/，本地默认 /
const base = process.env.VITEPRESS_BASE ?? '/'

const GITHUB_URL = 'https://github.com/tech-cats/hitsz-handbook-2026'

/** 构建期统计站点数据：内容页数 + 最后更新时间（排除首页/404） */
function collectSiteStats() {
  const docsDir = fileURLToPath(new URL('..', import.meta.url))
  let pages = 0
  let latest = 0
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.')) continue
        walk(join(dir, entry.name))
      } else if (
        entry.name.endsWith('.md') &&
        !['index.md', '404.md'].includes(entry.name)
      ) {
        pages++
        latest = Math.max(latest, statSync(join(dir, entry.name)).mtimeMs)
      }
    }
  }
  walk(docsDir)
  const lastUpdated = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(latest))
  return { pages, lastUpdated }
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'HITSZ Handbook 2026',
  description: '哈尔滨工业大学（深圳）2026 新生手册',
  base,
  cleanUrls: true,
  lastUpdated: true,
  appearance: false,
  themeConfig: {
    siteStats: collectSiteStats(),
    github: GITHUB_URL,
    issues: `${GITHUB_URL}/issues`,
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/hello' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [{ text: 'Hello, World', link: '/guide/hello' }],
        },
      ],
    },
    outline: { label: '本页目录', level: [2, 3] },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: GITHUB_URL }],
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新' },
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    langMenuLabel: '语言',
  },
})

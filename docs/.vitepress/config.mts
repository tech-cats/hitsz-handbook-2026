import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

// GitHub Pages 项目页时由 CI 注入 /<repo>/，本地默认 /
const base = process.env.VITEPRESS_BASE ?? '/'

const GITHUB_URL = 'https://github.com/tech-cats/hitsz-handbook-2026'
const HIDDEN_SECTION_DIRS = new Set([
  'guide/relationships',
  'guide/fireside',
])
const HIDDEN_SECTION_GLOBS = [...HIDDEN_SECTION_DIRS].map((dir) => `${dir}/**`)

/** 构建期统计站点数据：内容页数 + 最后更新时间（排除首页/404） */
function collectSiteStats() {
  const docsDir = fileURLToPath(new URL('..', import.meta.url))
  let pages = 0
  let latest = 0
  const walk = (dir: string, relativeDir = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const relativePath = relativeDir
        ? `${relativeDir}/${entry.name}`
        : entry.name
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || HIDDEN_SECTION_DIRS.has(relativePath)) continue
        walk(join(dir, entry.name), relativePath)
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
  // 暂不发布“待人接物”与“围炉夜话”，源文件仍保留以便继续编辑。
  srcExclude: HIDDEN_SECTION_GLOBS,
  lastUpdated: true,
  appearance: false,
  themeConfig: {
    siteStats: collectSiteStats(),
    github: GITHUB_URL,
    issues: `${GITHUB_URL}/issues`,
    nav: [
      { text: '首页', link: '/' },
      { text: '手册', link: '/guide/' },
    ],
    sidebar: {
      '/guide/': [
        { text: '前言', link: '/guide/' },
        {
          text: '见招拆招',
          items: [
            { text: '手册', link: '/guide/practical/handbook' },
            { text: '社群与平台、官方民间与…', link: '/guide/practical/communities' },
            { text: '选课与学分', link: '/guide/practical/course-selection' },
            { text: '先修、英语分级考、大一立项', link: '/guide/practical/pre-study' },
          ],
        },
        { text: '在最后之后', link: '/guide/afterword' },
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

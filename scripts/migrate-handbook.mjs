import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceArg = process.argv.slice(2).find((arg) => arg !== '--')

if (!sourceArg) {
  console.error('用法: pnpm content:migrate <源 Markdown 路径>')
  process.exit(1)
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = await readFile(resolve(sourceArg), 'utf8')
const lines = source.replaceAll('\r\n', '\n').split('\n')

function extractSection(heading) {
  const marker = `${'#'.repeat(heading.level)} ${heading.text}`
  const start = lines.findIndex((line) => line === marker)

  if (start === -1) {
    throw new Error(`源稿中找不到标题：${marker}`)
  }

  let end = lines.length
  for (let index = start + 1; index < lines.length; index++) {
    const match = /^(#+)\s/.exec(lines[index])
    if (match && match[1].length <= heading.level) {
      end = index
      break
    }
  }

  return lines.slice(start + 1, end).join('\n').trim()
}

function page(title, body) {
  return `---\ntitle: ${title}\n---\n\n# ${title}\n\n${body}\n`
}

const directPages = [
  ['docs/guide/index.md', '前言', 2],
  ['docs/guide/practical/handbook.md', '手册', 3],
  ['docs/guide/practical/communities.md', '社群与平台、官方民间与…', 3],
  ['docs/guide/practical/course-selection.md', '选课与学分', 3],
  ['docs/guide/practical/pre-study.md', '先修、英语分级考、大一立项', 3],
  ['docs/guide/relationships/communication.md', '与人交流', 3],
  ['docs/guide/afterword.md', '在最后之后', 2],
]

const pages = directPages.map(([path, title, level]) => ({
  path,
  content: page(title, extractSection({ text: title, level })),
}))

const currentAffairsPages = [
  ['docs/guide/fireside/knowledge-ai.md', '求知、能力与AI'],
  ['docs/guide/fireside/self-organization.md', '自组织与识人'],
]

for (const [path, sourceTitle] of currentAffairsPages) {
  pages.push({
    path,
    content: page(`时·${sourceTitle}`, extractSection({ text: sourceTitle, level: 4 })),
  })
}

const currentAffairs = ['前言', '从上行期到后疫情时代']
  .map((title) => `## ${title}\n\n${extractSection({ text: title, level: 4 })}`)
  .join('\n\n')

pages.push({
  path: 'docs/guide/fireside/current-affairs.md',
  content: page('时·时局之问', currentAffairs),
})

for (const output of pages) {
  const target = resolve(rootDir, output.path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, output.content, 'utf8')
  console.log(`已迁移 ${output.path}`)
}

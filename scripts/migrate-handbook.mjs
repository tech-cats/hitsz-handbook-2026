import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceArg = process.argv.slice(2).find((arg) => arg !== '--')

async function envValue(name) {
  if (process.env[name]) return process.env[name]

  try {
    const env = await readFile(resolve(rootDir, '.env'), 'utf8')
    const line = env
      .split(/\r?\n/)
      .find((candidate) => candidate.trimStart().startsWith(`${name}=`))
    if (!line) return undefined
    return line.slice(line.indexOf('=') + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    throw error
  }
}

const sourcePath = sourceArg ?? await envValue('MD_UPSTREAM')

if (!sourcePath) {
  console.error(
    '未找到上游 Markdown。请设置 MD_UPSTREAM，或传入路径：pnpm content:migrate <path>',
  )
  process.exit(1)
}

const resolvedSourcePath = sourcePath.startsWith('~/')
  ? resolve(homedir(), sourcePath.slice(2))
  : resolve(sourcePath)
const source = await readFile(resolvedSourcePath, 'utf8')
const lines = source.replaceAll('\r\n', '\n').split('\n')
const headings = []
const headingStack = []

lines.forEach((line, index) => {
  const match = /^(#+)\s+(.+?)\s*$/.exec(line)
  if (!match) return

  const heading = { level: match[1].length, title: match[2], start: index }
  while (headingStack.at(-1)?.level >= heading.level) headingStack.pop()
  heading.path = [...headingStack.map((parent) => parent.title), heading.title]
  headings.push(heading)
  headingStack.push(heading)
})

function sectionByPath(titlePath) {
  const indexes = headings.flatMap((heading, index) =>
    heading.path.length === titlePath.length &&
    heading.path.every((title, pathIndex) => title === titlePath[pathIndex])
      ? [index]
      : [],
  )
  if (indexes.length !== 1) {
    throw new Error(
      `标题路径必须唯一匹配，实际找到 ${indexes.length} 处：${titlePath.join(' / ')}`,
    )
  }

  const [index] = indexes
  const heading = headings[index]
  const nextHeading = headings.slice(index + 1).find((candidate) => candidate.level <= heading.level)
  const end = nextHeading?.start ?? lines.length
  return lines
    .slice(heading.start + 1, end)
    .map((line) => {
      const match = /^(#+)(\s+.*)$/.exec(line)
      if (!match || match[1].length <= heading.level) return line
      return `${'#'.repeat(match[1].length - heading.level + 1)}${match[2]}`
    })
    .join('\n')
    .trim()
}

function renderPage(title, body) {
  return `---\ntitle: ${title}\n---\n\n# ${title}\n\n${body}\n`
}

const definePage = (path, ...sourcePath) => ({
  path,
  title: sourcePath.at(-1),
  sourcePath,
})
const pageRules = [
  definePage('docs/guide/index.md', '前言'),
  definePage('docs/guide/practical/handbook.md', '见招拆招', '手册'),
  definePage('docs/guide/practical/communities.md', '见招拆招', '社群与平台、官方民间与…'),
  definePage('docs/guide/practical/course-selection.md', '见招拆招', '选课与学分'),
  definePage('docs/guide/practical/pre-study.md', '见招拆招', '先修、英语分级考、大一立项'),
  definePage('docs/guide/practical/graduate-recommendation.md', '见招拆招', '综测与保研'),
  definePage('docs/guide/relationships/communication.md', '行事', '与人交流'),
  definePage('docs/guide/relationships/learning-computer-technology.md', '行事', '如何学习计算机技术'),
  definePage('docs/guide/afterword.md', '在最后之后'),
  definePage('docs/guide/fireside/interview-science-engineering.md', '围炉夜话', '路径之问', '访谈：理与工'),
  definePage('docs/guide/fireside/current-affairs-preface.md', '围炉夜话', '时局之问', '前言'),
  definePage('docs/guide/fireside/post-pandemic-era.md', '围炉夜话', '时局之问', '从上行期到后疫情时代'),
  definePage('docs/guide/fireside/knowledge-ai.md', '围炉夜话', '时局之问', '求知、能力与AI'),
  definePage('docs/guide/fireside/self-organization.md', '围炉夜话', '时局之问', '自组织与识人'),
  definePage('docs/guide/fireside/rationality.md', '围炉夜话', '时局之问', '所谓理性'),
]

const outputs = pageRules.map(({ path, title, sourcePath }) => ({
  path,
  content: renderPage(title, sectionByPath(sourcePath)),
}))

for (const output of outputs) {
  const target = resolve(rootDir, output.path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, output.content, 'utf8')
  console.log(`已迁移 ${output.path}`)
}

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import TransitionContent from './TransitionContent.vue'
import MyLayout from './MyLayout.vue'
import './style.css'

/**
 * 主题增强：
 * - Layout 包装为 MyLayout：首页注入站点数据条（章节数 / 最后更新 / GitHub）
 * - 覆盖全局 <Content/> 为 TransitionContent —— 路由切换时页面内容
 *   淡出（200ms ease-in-quart）→ 淡入（300ms ease-standard），
 *   导航栏/侧边栏在 Content 之外，转场期间保持原位。
 */
export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app }) {
    app.component('Content', TransitionContent)
  },
} satisfies Theme

<script setup lang="ts">
import { useData } from 'vitepress'

const { theme } = useData()
const stats = theme.value.siteStats
const issues = theme.value.issues
</script>

<template>
  <div class="home-stats">
    <span class="home-stats-item">{{ stats.pages }} 个章节</span>
    <span class="home-stats-sep">·</span>
    <span class="home-stats-item">最后更新 {{ stats.lastUpdated }}</span>
    <span class="home-stats-sep">·</span>
    <a
      class="home-stats-item home-stats-link"
      :href="issues"
      target="_blank"
      rel="noopener noreferrer"
    >
      Issues ↗
    </a>
  </div>
</template>

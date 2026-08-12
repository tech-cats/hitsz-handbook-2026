<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomeStats from './HomeStats.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <Layout>
    <template #home-hero-actions-after>
      <HomeStats v-if="frontmatter.layout === 'home'" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { useData, useRoute } from 'vitepress'
import { contentUpdatedCallbacks } from 'vitepress/dist/client/app/utils'

defineOptions({ name: 'TransitionContent', inheritAttrs: false })

const route = useRoute()
const { site } = useData()
const attrs = useAttrs()

const runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn())
</script>

<template>
  <Transition name="vp-page" mode="out-in">
    <div
      :key="route.path"
      v-bind="attrs"
      :style="site.contentProps?.style ?? { position: 'relative' }"
      @vue:mounted="runCbs"
      @vue:updated="runCbs"
      @vue:unmounted="runCbs"
    >
      <component :is="route.component" v-if="route.component" />
      <template v-else>404 Page Not Found</template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { CALENDAR_APP_KEY } from '@/composables'
import ResourceSidebar from './ResourceSidebar.vue'
import ResourceTimeGrid from './ResourceTimeGrid.vue'
import type { Resource } from '@/types'

const app = inject(CALENDAR_APP_KEY)!

const resources = computed(() => app.config.resources)
const currentDate = computed(() => app.state.currentDate.value)

function onResourceClick(resource: Resource) {
  app.config.callbacks.onResourceClick?.(resource)
}
</script>

<template>
  <div class="vc-resource-view">
    <ResourceSidebar :resources="resources" @resource-click="onResourceClick" />
    <ResourceTimeGrid
      :date="currentDate"
      :resources="resources"
      :custom-content="app.config.customComponents.resourceEvent"
    />
  </div>
</template>

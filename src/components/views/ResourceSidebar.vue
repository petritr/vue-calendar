<script setup lang="ts">
import { inject, computed } from 'vue'
import type { Resource } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import { vRipple } from '@/directives/ripple'

defineProps<{
  resources: Resource[]
}>()

const emit = defineEmits<{
  resourceClick: [resource: Resource]
}>()

const app = inject(CALENDAR_APP_KEY)!
const isDark = computed(() => app.state.isDark.value)

function getInitial(label: string): string {
  return label.charAt(0).toUpperCase()
}

function getAvatarColors(resource: Resource) {
  const colors = isDark.value ? resource.darkColors : resource.lightColors
  if (!colors) return {}
  return {
    background: colors.main,
    color: '#ffffff',
  }
}
</script>

<template>
  <div class="vc-resource-sidebar">
    <div class="vc-resource-sidebar__header">Resources</div>
    <div class="vc-resource-sidebar__list">
      <div
        v-for="resource in resources"
        :key="resource.id"
        v-ripple
        class="vc-resource-sidebar__item"
        @click="emit('resourceClick', resource)"
      >
        <div class="vc-resource-sidebar__avatar" :style="getAvatarColors(resource)">
          <img v-if="resource.avatar" :src="resource.avatar" :alt="resource.label" />
          <template v-else>{{ getInitial(resource.label) }}</template>
        </div>
        <span class="vc-resource-sidebar__label">{{ resource.label }}</span>
      </div>
    </div>
  </div>
</template>

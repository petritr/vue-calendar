<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import { CALENDAR_APP_KEY } from '@/composables'
import { getWeekDates, formatDate, formatWeekday, isSameDay, todayDate } from '@/core'
import ResourceSidebar from './ResourceSidebar.vue'
import ResourceTimeGrid from './ResourceTimeGrid.vue'
import type { Resource } from '@/types'

const app = inject(CALENDAR_APP_KEY)!

const resources = computed(() => app.config.resources)

const dates = computed(() =>
  getWeekDates(
    app.state.currentDate.value,
    app.config.firstDayOfWeek,
    app.config.weekOptions.nDays!,
  ),
)

const selectedDateIndex = ref(0)
const selectedDate = computed(() => dates.value[selectedDateIndex.value])

function selectDay(index: number) {
  selectedDateIndex.value = index
}

function formatDayLabel(date: Temporal.PlainDate): string {
  const dayName = formatWeekday(date, app.config.locale)
  return `${dayName} ${date.day}`
}

function isToday(date: Temporal.PlainDate): boolean {
  return isSameDay(date, todayDate())
}

function onResourceClick(resource: Resource) {
  app.config.callbacks.onResourceClick?.(resource)
}
</script>

<template>
  <div class="vc-resource-week-view">
    <!-- Day tabs -->
    <div class="vc-resource-week-view__tabs">
      <button
        v-for="(date, index) in dates"
        :key="formatDate(date)"
        :class="[
          'vc-resource-week-view__tab',
          { 'vc-resource-week-view__tab--active': index === selectedDateIndex },
          { 'vc-resource-week-view__tab--today': isToday(date) },
        ]"
        @click="selectDay(index)"
      >
        {{ formatDayLabel(date) }}
      </button>
    </div>

    <!-- Resource view for selected day -->
    <div class="vc-resource-week-view__content">
      <ResourceSidebar :resources="resources" @resource-click="onResourceClick" />
      <ResourceTimeGrid
        :date="selectedDate"
        :resources="resources"
        :custom-content="app.config.customComponents.resourceEvent"
      />
    </div>
  </div>
</template>

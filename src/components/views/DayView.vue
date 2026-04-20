<script setup lang="ts">
import { computed, inject } from 'vue'
import type { InternalCalendarEvent } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import TimeGrid from '../shared/TimeGrid.vue'

const app = inject(CALENDAR_APP_KEY)!
const openModal =
  inject<(event: InternalCalendarEvent, anchor?: { x: number; y: number }) => void>(
    'openEventModal',
  )!

const dates = computed(() => [app.state.currentDate.value])

function onEventClick(event: InternalCalendarEvent, anchor: { x: number; y: number }) {
  openModal(event, anchor)
}
</script>

<template>
  <TimeGrid :dates="dates" @event-click="onEventClick" />
</template>

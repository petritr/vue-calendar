<script setup lang="ts">
import { computed, inject } from 'vue'
import { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import { startOfMonth, endOfMonth, isSameDay, todayDate } from '@/core'
import CalendarEvent from '../shared/CalendarEvent.vue'

const app = inject(CALENDAR_APP_KEY)!
const openModal =
  inject<(event: InternalCalendarEvent, anchor?: { x: number; y: number }) => void>(
    'openEventModal',
  )!
const { locale, customComponents } = app.config

interface DayGroup {
  date: Temporal.PlainDate
  label: string
  isToday: boolean
  events: InternalCalendarEvent[]
}

const eventGroups = computed(() => {
  const start = startOfMonth(app.state.currentDate.value)
  const end = endOfMonth(app.state.currentDate.value)
  const today = todayDate()

  const startDt = start.toPlainDateTime({ hour: 0, minute: 0 })
  const endDt = end.add({ days: 1 }).toPlainDateTime({ hour: 0, minute: 0 })

  // Filter events in the current month range
  const monthEvents = app.events.list.value.filter((event) => {
    return (
      Temporal.PlainDateTime.compare(event._startDate, endDt) < 0 &&
      Temporal.PlainDateTime.compare(event._endDate, startDt) > 0
    )
  })

  // Group by start date
  const groups = new Map<string, InternalCalendarEvent[]>()
  for (const event of monthEvents) {
    const key = event._startDate.toPlainDate().toString()
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(event)
  }

  // Convert to sorted array
  const result: DayGroup[] = []
  const sortedKeys = [...groups.keys()].sort()
  for (const key of sortedKeys) {
    const date = Temporal.PlainDate.from(key)
    result.push({
      date,
      label: date.toLocaleString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      isToday: isSameDay(date, today),
      events: groups.get(key)!,
    })
  }

  return result
})

function formatEventTime(event: InternalCalendarEvent): string {
  if (event._isFullDay) return 'All day'
  const fmt = (d: Temporal.PlainDateTime) =>
    d.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })
  return `${fmt(event._startDate)} - ${fmt(event._endDate)}`
}

function onEventClick(event: InternalCalendarEvent, anchor: { x: number; y: number }) {
  openModal(event, anchor)
  app.config.callbacks.onEventClick?.(event)
}

function onEventDblClick(event: InternalCalendarEvent, _anchor: { x: number; y: number }) {
  app.config.callbacks.onEventDoubleClick?.(event)
}
</script>

<template>
  <div class="vc-list-view">
    <div v-if="eventGroups.length === 0" class="vc-list-view__empty">No events this month</div>

    <div v-for="group in eventGroups" :key="group.date.toString()" class="vc-list-view__group">
      <div
        :class="[
          'vc-list-view__date-header',
          { 'vc-list-view__date-header--today': group.isToday },
        ]"
      >
        {{ group.label }}
      </div>
      <div class="vc-list-view__events">
        <div v-for="event in group.events" :key="event.id" class="vc-list-view__event-row">
          <span class="vc-list-view__event-time">{{ formatEventTime(event) }}</span>
          <CalendarEvent
            :event="event"
            variant="month"
            :custom-content="customComponents.monthGridEvent"
            class="vc-list-view__event"
            @click="onEventClick"
            @dblclick="onEventDblClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vc-list-view {
  height: 100%;
  overflow-y: auto;
  padding: 0;
}

.vc-list-view__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vc-color-on-surface-variant);
  font-size: var(--vc-font-size);
}

.vc-list-view__group {
  border-bottom: 1px solid var(--vc-border-color);
}

.vc-list-view__date-header {
  padding: 10px 16px;
  font: var(--vc-typescale-label-large);
  color: var(--vc-color-on-surface);
  background: var(--vc-color-surface-container);
  position: sticky;
  top: 0;
  z-index: 1;
}

.vc-list-view__date-header--today {
  color: var(--vc-color-primary);
  font-weight: 600;
}

.vc-list-view__events {
  display: flex;
  flex-direction: column;
}

.vc-list-view__event-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 16px 6px 24px;
  border-bottom: 1px solid var(--vc-color-surface-container);
}

.vc-list-view__event-row:last-child {
  border-bottom: none;
}

.vc-list-view__event-time {
  flex-shrink: 0;
  width: 130px;
  font: var(--vc-typescale-body-small);
  color: var(--vc-color-on-surface-variant);
}

.vc-list-view__event {
  flex: 1;
}
</style>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import { startOfMonth, endOfMonth, getEventsForDay, isSameDay, todayDate } from '@/core'
import CalendarEvent from '../shared/CalendarEvent.vue'

const app = inject(CALENDAR_APP_KEY)!
const openModal =
  inject<(event: InternalCalendarEvent, anchor?: { x: number; y: number }) => void>(
    'openEventModal',
  )!
const { locale, customComponents } = app.config

const daysInMonth = computed(() => {
  const start = startOfMonth(app.state.currentDate.value)
  const end = endOfMonth(app.state.currentDate.value)
  const days: Temporal.PlainDate[] = []
  let current = start
  while (Temporal.PlainDate.compare(current, end) <= 0) {
    days.push(current)
    current = current.add({ days: 1 })
  }
  return days
})

const daysWithEvents = computed(() => {
  const today = todayDate()
  return daysInMonth.value
    .map((date) => ({
      date,
      events: getEventsForDay(app.events.list.value, date),
      isToday: isSameDay(date, today),
    }))
    .filter((d) => d.events.length > 0)
})

function formatDayLabel(date: Temporal.PlainDate) {
  return date.toLocaleString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
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
  <div class="vc-month-agenda">
    <div v-if="daysWithEvents.length === 0" class="vc-month-agenda__empty">
      No events this month
    </div>

    <div v-for="day in daysWithEvents" :key="day.date.toString()" class="vc-month-agenda__day">
      <div :class="['vc-month-agenda__date', { 'vc-month-agenda__date--today': day.isToday }]">
        {{ formatDayLabel(day.date) }}
      </div>
      <div class="vc-month-agenda__events">
        <CalendarEvent
          v-for="event in day.events"
          :key="event.id"
          :event="event"
          variant="month"
          :custom-content="customComponents.monthAgendaEvent ?? customComponents.monthGridEvent"
          @click="onEventClick"
          @dblclick="onEventDblClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vc-month-agenda {
  height: 100%;
  overflow-y: auto;
  padding: 8px 0;
}

.vc-month-agenda__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vc-color-on-surface-variant);
  font-size: var(--vc-font-size);
}

.vc-month-agenda__day {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--vc-border-color);
}

.vc-month-agenda__date {
  flex-shrink: 0;
  width: 120px;
  font-weight: 500;
  font-size: var(--vc-font-size-sm);
  color: var(--vc-color-on-surface-variant);
  padding-top: 2px;
}

.vc-month-agenda__date--today {
  color: var(--vc-color-primary);
  font-weight: 600;
}

.vc-month-agenda__events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>

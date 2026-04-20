<script setup lang="ts">
import { computed, inject } from 'vue'
import { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import { getWeekDates, getEventsForDay, isSameDay, todayDate } from '@/core'
import CalendarEvent from '../shared/CalendarEvent.vue'

const app = inject(CALENDAR_APP_KEY)!
const openModal =
  inject<(event: InternalCalendarEvent, anchor?: { x: number; y: number }) => void>(
    'openEventModal',
  )!
const { locale, firstDayOfWeek, customComponents } = app.config

const dates = computed(() =>
  getWeekDates(app.state.currentDate.value, firstDayOfWeek, app.config.weekOptions.nDays!),
)

const daysWithEvents = computed(() => {
  const today = todayDate()
  return dates.value.map((date) => ({
    date,
    events: getEventsForDay(app.events.list.value, date),
    isToday: isSameDay(date, today),
  }))
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
  <div class="vc-week-agenda">
    <div v-if="daysWithEvents.every((d) => d.events.length === 0)" class="vc-week-agenda__empty">
      No events this week
    </div>

    <div v-for="day in daysWithEvents" :key="day.date.toString()" class="vc-week-agenda__day">
      <div
        :class="[
          'vc-week-agenda__date',
          { 'vc-week-agenda__date--today': day.isToday },
          { 'vc-week-agenda__date--empty': day.events.length === 0 },
        ]"
      >
        {{ formatDayLabel(day.date) }}
      </div>
      <div class="vc-week-agenda__events">
        <CalendarEvent
          v-for="event in day.events"
          :key="event.id"
          :event="event"
          variant="month"
          :custom-content="customComponents.monthAgendaEvent ?? customComponents.monthGridEvent"
          @click="onEventClick"
          @dblclick="onEventDblClick"
        />
        <div v-if="day.events.length === 0" class="vc-week-agenda__no-events">No events</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vc-week-agenda {
  height: 100%;
  overflow-y: auto;
  padding: 8px 0;
}

.vc-week-agenda__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vc-color-on-surface-variant);
  font-size: var(--vc-font-size);
}

.vc-week-agenda__day {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--vc-border-color);
}

.vc-week-agenda__date {
  flex-shrink: 0;
  width: 120px;
  font-weight: 500;
  font-size: var(--vc-font-size-sm);
  color: var(--vc-color-on-surface-variant);
  padding-top: 2px;
}

.vc-week-agenda__date--today {
  color: var(--vc-color-primary);
  font-weight: 600;
}

.vc-week-agenda__date--empty {
  opacity: 0.5;
}

.vc-week-agenda__events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vc-week-agenda__no-events {
  font-size: var(--vc-font-size-sm);
  color: var(--vc-color-on-surface-variant);
  opacity: 0.5;
  padding: 2px 0;
}
</style>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import {
  getMonthGridDates,
  getEventsForDay,
  isSameDay,
  formatWeekday,
  formatDate,
  addDays,
  startOfWeek,
  todayDate,
} from '@/core'
import CalendarEvent from '../shared/CalendarEvent.vue'

const app = inject(CALENDAR_APP_KEY)!
const openModal =
  inject<(event: InternalCalendarEvent, anchor?: { x: number; y: number }) => void>(
    'openEventModal',
  )!
const { locale, firstDayOfWeek, monthGridOptions, customComponents } = app.config

const gridDates = computed(() => getMonthGridDates(app.state.currentDate.value, firstDayOfWeek))

const weekdays = computed(() => {
  const start = startOfWeek(todayDate(), firstDayOfWeek)
  return Array.from({ length: 7 }, (_, i) => formatWeekday(addDays(start, i), locale))
})

const currentMonth = computed(() => app.state.currentDate.value.month)

const today = computed(() => todayDate())

// Expanded day — when "+N more" is clicked, show all events for that date
const expandedDateKey = ref<string | null>(null)

function cellClasses(date: Temporal.PlainDate) {
  return {
    'vc-month-grid__cell--outside': date.month !== currentMonth.value,
    'vc-month-grid__cell--today': isSameDay(date, today.value),
  }
}

function getAllEvents(date: Temporal.PlainDate) {
  return getEventsForDay(app.events.list.value, date)
}

function getVisibleEvents(date: Temporal.PlainDate) {
  const events = getAllEvents(date)
  if (expandedDateKey.value === formatDate(date)) {
    return events
  }
  return events.slice(0, monthGridOptions.nEventsPerDay ?? 3)
}

function getOverflowCount(date: Temporal.PlainDate) {
  if (expandedDateKey.value === formatDate(date)) return 0
  const events = getAllEvents(date)
  return Math.max(0, events.length - (monthGridOptions.nEventsPerDay ?? 3))
}

function onDateClick(date: Temporal.PlainDate) {
  app.config.callbacks.onDateClick?.(formatDate(date))
}

function onDateDblClick(date: Temporal.PlainDate) {
  app.config.callbacks.onDateDoubleClick?.(formatDate(date))
}

function onEventClick(event: InternalCalendarEvent, anchor: { x: number; y: number }) {
  openModal(event, anchor)
  app.config.callbacks.onEventClick?.(event)
}

function onEventDblClick(event: InternalCalendarEvent, _anchor: { x: number; y: number }) {
  app.config.callbacks.onEventDoubleClick?.(event)
}

function onMoreClick(e: MouseEvent, date: Temporal.PlainDate) {
  e.stopPropagation()
  const key = formatDate(date)
  if (expandedDateKey.value === key) {
    expandedDateKey.value = null
  } else {
    expandedDateKey.value = key
  }
}
</script>

<template>
  <div class="vc-month-grid">
    <div class="vc-month-grid__weekdays">
      <div v-for="day in weekdays" :key="day" class="vc-month-grid__weekday">
        {{ day }}
      </div>
    </div>

    <div class="vc-month-grid__body">
      <div
        v-for="(date, i) in gridDates"
        :key="i"
        :class="[
          'vc-month-grid__cell',
          cellClasses(date),
          { 'vc-month-grid__cell--expanded': expandedDateKey === formatDate(date) },
        ]"
        @click="onDateClick(date)"
        @dblclick="onDateDblClick(date)"
      >
        <span class="vc-month-grid__day-number">{{ date.day }}</span>

        <div class="vc-month-grid__events">
          <CalendarEvent
            v-for="event in getVisibleEvents(date)"
            :key="event.id"
            :event="event"
            variant="month"
            :custom-content="customComponents.monthGridEvent"
            @click="onEventClick"
            @dblclick="onEventDblClick"
          />
          <span
            v-if="getOverflowCount(date) > 0"
            class="vc-month-grid__more"
            @click.stop="onMoreClick($event, date)"
          >
            +{{ getOverflowCount(date) }} more
          </span>
          <span
            v-if="
              expandedDateKey === formatDate(date) &&
              getAllEvents(date).length > (monthGridOptions.nEventsPerDay ?? 3)
            "
            class="vc-month-grid__more"
            @click.stop="onMoreClick($event, date)"
          >
            show less
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

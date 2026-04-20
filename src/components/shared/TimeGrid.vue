<script setup lang="ts">
import { computed, inject, ref, watch, nextTick, onMounted } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import { useTimeGridInteraction } from '@/composables/useTimeGridInteraction'
import {
  getHoursArray,
  getEventsForDay,
  partitionEvents,
  resolveOverlaps,
  getTimeGridPosition,
  formatWeekday,
  formatHour,
  isSameDay,
  formatDateTime,
  todayDate,
} from '@/core'
import { currentTimeRef } from '@/plugins/current-time'
import CalendarEvent from './CalendarEvent.vue'

const props = defineProps<{
  dates: Temporal.PlainDate[]
}>()

const emit = defineEmits<{
  eventClick: [event: InternalCalendarEvent, anchor: { x: number; y: number }]
}>()

const app = inject(CALENDAR_APP_KEY)!
const { dayBoundaries, locale, customComponents } = app.config

const hours = computed(() => getHoursArray(dayBoundaries.start, dayBoundaries.end - 1))
const totalHours = computed(() => dayBoundaries.end - dayBoundaries.start)

// Column DOM refs
const columnRefs = ref<HTMLElement[]>([])

function setColumnRef(el: unknown, index: number) {
  if (el instanceof HTMLElement) {
    columnRefs.value[index] = el
  }
}

// Time grid interaction (drag + resize)
const interaction = useTimeGridInteraction({
  dragState: app.dnd.dragState,
  resizeState: app.resize.resizeState,
  startDrag: app.dnd.startDrag,
  endDrag: app.dnd.endDrag,
  cancelDrag: app.dnd.cancelDrag,
  startResize: app.resize.startResize,
  endResize: app.resize.endResize,
  cancelResize: app.resize.cancelResize,
  startHour: dayBoundaries.start,
  endHour: dayBoundaries.end,
})

// Update column refs when dates change
watch(
  () => props.dates,
  () => {
    nextTick(() => {
      interaction.setColumns(columnRefs.value, props.dates)
    })
  },
  { immediate: true },
)

const timeGridBodyRef = ref<HTMLElement | null>(null)

onMounted(() => {
  interaction.setColumns(columnRefs.value, props.dates)

  // Scroll to initialScroll hour
  const initialScroll = app.config.weekOptions.initialScroll
  if (initialScroll != null && timeGridBodyRef.value) {
    const totalH = dayBoundaries.end - dayBoundaries.start
    const scrollHour = Math.max(0, initialScroll - dayBoundaries.start)
    const scrollRatio = scrollHour / totalH
    timeGridBodyRef.value.scrollTop = scrollRatio * timeGridBodyRef.value.scrollHeight
  }
})

const dayData = computed(() => {
  const today = todayDate()
  return props.dates.map((date) => {
    const dayEvents = getEventsForDay(app.events.list.value, date)
    const { fullDay, timed } = partitionEvents(dayEvents)
    const positioned = resolveOverlaps(timed)

    for (const pe of positioned) {
      const pos = getTimeGridPosition(pe.event, date, dayBoundaries.start, dayBoundaries.end)
      pe.top = pos.top
      pe.height = pos.height
    }

    return {
      date,
      isToday: isSameDay(date, today),
      fullDayEvents: fullDay,
      positionedEvents: positioned,
    }
  })
})

const hasFullDayEvents = computed(() => dayData.value.some((d) => d.fullDayEvents.length > 0))

function isEventDragging(event: InternalCalendarEvent): boolean {
  const ds = app.dnd.dragState.value
  const rs = app.resize.resizeState.value
  return (
    (ds.isDragging && ds.event?.id === event.id) || (rs.isResizing && rs.event?.id === event.id)
  )
}

function onDateTimeClick(date: Temporal.PlainDate, hour: number) {
  const dt = date.toPlainDateTime({ hour, minute: 0 })
  app.config.callbacks.onDateTimeClick?.(formatDateTime(dt))
}

function onDateTimeDblClick(date: Temporal.PlainDate, hour: number) {
  const dt = date.toPlainDateTime({ hour, minute: 0 })
  app.config.callbacks.onDateTimeDoubleClick?.(formatDateTime(dt))
}

function onEventClick(event: InternalCalendarEvent, anchor: { x: number; y: number }) {
  emit('eventClick', event, anchor)
  app.config.callbacks.onEventClick?.(event)
}

function onEventDblClick(event: InternalCalendarEvent, _anchor: { x: number; y: number }) {
  app.config.callbacks.onEventDoubleClick?.(event)
}

function onDragStart(event: InternalCalendarEvent, mouseEvent: MouseEvent) {
  interaction.beginDrag(event, mouseEvent)
}

function onResizeStart(
  event: InternalCalendarEvent,
  edge: 'top' | 'bottom',
  mouseEvent: MouseEvent,
) {
  interaction.beginResize(event, edge, mouseEvent)
}

// Current time indicator
const hasCurrentTimePlugin = computed(() =>
  app.config.plugins.some((p) => p.name === 'current-time'),
)

function currentTimePosition(date: Temporal.PlainDate): number | null {
  const now = currentTimeRef.value
  if (now.year !== date.year || now.month !== date.month || now.day !== date.day) return null
  const minutes = (now.hour - dayBoundaries.start) * 60 + now.minute
  const total = (dayBoundaries.end - dayBoundaries.start) * 60
  if (minutes < 0 || minutes > total) return null
  return (minutes / total) * 100
}
</script>

<template>
  <div class="vc-time-grid">
    <!-- Day headers -->
    <div class="vc-time-grid__header">
      <div class="vc-time-grid__header-gutter" />
      <div class="vc-time-grid__header-days">
        <div
          v-for="day in dayData"
          :key="day.date.toString()"
          :class="['vc-time-grid__header-day', { 'vc-time-grid__header-day--today': day.isToday }]"
        >
          <div class="vc-time-grid__header-day-name">
            {{ formatWeekday(day.date, locale) }}
          </div>
          <div class="vc-time-grid__header-day-number">
            {{ day.date.day }}
          </div>
        </div>
      </div>
    </div>

    <!-- Full-day events row -->
    <div v-if="hasFullDayEvents" class="vc-time-grid__allday">
      <div class="vc-time-grid__allday-gutter">all-day</div>
      <div class="vc-time-grid__allday-content">
        <div
          v-for="day in dayData"
          :key="'allday-' + day.date.toString()"
          class="vc-time-grid__allday-day"
        >
          <CalendarEvent
            v-for="event in day.fullDayEvents"
            :key="event.id"
            :event="event"
            variant="allday"
            :custom-content="customComponents.dateGridEvent"
            @click="onEventClick"
            @dblclick="onEventDblClick"
          />
        </div>
      </div>
    </div>

    <!-- Time body -->
    <div ref="timeGridBodyRef" class="vc-time-grid__body">
      <div class="vc-time-grid__body-inner" :style="{ height: `${totalHours * 60}px` }">
        <!-- Time axis -->
        <div class="vc-time-grid__time-axis">
          <div
            v-for="hour in hours"
            :key="hour"
            class="vc-time-grid__time-label"
            :style="{ top: `${((hour - dayBoundaries.start) / totalHours) * 100}%` }"
          >
            {{ formatHour(hour, locale) }}
          </div>
        </div>

        <!-- Day columns -->
        <div class="vc-time-grid__columns">
          <div
            v-for="(day, colIndex) in dayData"
            :key="'col-' + day.date.toString()"
            :ref="(el) => setColumnRef(el, colIndex)"
            class="vc-time-grid__column"
          >
            <!-- Hour rows for grid lines -->
            <div
              v-for="hour in hours"
              :key="hour"
              class="vc-time-grid__hour-row"
              @click="onDateTimeClick(day.date, hour)"
              @dblclick="onDateTimeDblClick(day.date, hour)"
            />

            <!-- Positioned timed events -->
            <div class="vc-time-grid__events-layer">
              <CalendarEvent
                v-for="pe in day.positionedEvents"
                :key="pe.event.id"
                :event="pe.event"
                variant="time"
                :is-dragging="isEventDragging(pe.event)"
                :custom-content="customComponents.timeGridEvent"
                :style="{
                  top: `${pe.top}%`,
                  height: `${pe.height}%`,
                  left: `${pe.left}%`,
                  width: `${pe.width}%`,
                }"
                @click="onEventClick"
                @dblclick="onEventDblClick"
                @dragstart="onDragStart"
                @resizestart="onResizeStart"
              />
            </div>

            <!-- Current time indicator -->
            <div
              v-if="hasCurrentTimePlugin && currentTimePosition(day.date) !== null"
              class="vc-current-time"
              :style="{ top: `${currentTimePosition(day.date)}%` }"
            />

            <!-- Ghost element for drag/resize preview -->
            <div
              v-if="
                interaction.mode.value !== 'idle' && interaction.ghostColumnIndex.value === colIndex
              "
              class="vc-event vc-event--time vc-event--ghost"
              :style="{
                top: `${interaction.ghostTop.value}%`,
                height: `${interaction.ghostHeight.value}%`,
                left: '0',
                width: '100%',
              }"
            >
              <div class="vc-event__title">{{ interaction.ghostTitle.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

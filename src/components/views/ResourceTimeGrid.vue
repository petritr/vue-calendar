<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, inject, type Component } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent, Resource, CalendarCategory } from '@/types'
import { CALENDAR_APP_KEY } from '@/composables'
import { getHoursArray, getEventsForDay, formatHour } from '@/core'
import { useResourceTimeGridInteraction } from '@/composables/useResourceTimeGridInteraction'

const props = defineProps<{
  date: Temporal.PlainDate
  resources: Resource[]
  customContent?: Component
}>()

const app = inject(CALENDAR_APP_KEY)!
const { dayBoundaries, locale, callbacks } = app.config

const hours = computed(() => getHoursArray(dayBoundaries.start, dayBoundaries.end - 1))
const totalHours = computed(() => dayBoundaries.end - dayBoundaries.start)
const totalMinutes = computed(() => totalHours.value * 60)

const openModal = inject('openEventModal') as (
  event: InternalCalendarEvent,
  anchor?: { x: number; y: number },
) => void

// Interaction composable
const interaction = useResourceTimeGridInteraction({
  callbacks,
  updateEvent: (evt) => app.events.update(evt),
  startHour: dayBoundaries.start,
  endHour: dayBoundaries.end,
  resources: props.resources,
})

// DOM refs
const bodyRef = ref<HTMLElement | null>(null)
const headerScrollRef = ref<HTMLElement | null>(null)
const rowRefs = ref<HTMLElement[]>([])

function setRowRef(el: unknown, index: number) {
  if (el instanceof HTMLElement) {
    rowRefs.value[index] = el
  }
}

onMounted(() => {
  if (bodyRef.value) {
    interaction.setBody(bodyRef.value)
  }
  nextTick(() => {
    interaction.setRows(rowRefs.value)
  })
})

watch(
  () => props.resources,
  () => {
    nextTick(() => {
      interaction.setRows(rowRefs.value)
    })
  },
)

// Sync horizontal scroll between header and body
function onBodyScroll() {
  if (bodyRef.value && headerScrollRef.value) {
    headerScrollRef.value.style.transform = `translateX(-${bodyRef.value.scrollLeft}px)`
  }
}

// Events per resource
const resourceData = computed(() => {
  const allEvents = app.events.list.value
  const dayEvents = getEventsForDay(allEvents, props.date)

  return props.resources.map((resource) => {
    const events = dayEvents.filter((e) => e.resourceId === resource.id)

    // Position events horizontally + stack overlaps
    const positioned = positionEventsHorizontally(events)

    return {
      resource,
      events: positioned,
    }
  })
})

interface PositionedResourceEvent {
  event: InternalCalendarEvent
  left: number // percent
  width: number // percent
  subRow: number
  totalSubRows: number
}

function positionEventsHorizontally(events: InternalCalendarEvent[]): PositionedResourceEvent[] {
  if (events.length === 0) return []

  const tm = totalMinutes.value
  const startH = dayBoundaries.start

  const positioned: PositionedResourceEvent[] = events.map((event) => {
    const startMinutes = Math.max(
      0,
      (event._startDate.hour - startH) * 60 + event._startDate.minute,
    )
    const endMinutes = Math.min(tm, (event._endDate.hour - startH) * 60 + event._endDate.minute)
    return {
      event,
      left: (startMinutes / tm) * 100,
      width: (Math.max(endMinutes - startMinutes, 15) / tm) * 100,
      subRow: 0,
      totalSubRows: 1,
    }
  })

  // Detect overlaps and assign sub-rows
  positioned.sort((a, b) => a.left - b.left)
  for (let i = 0; i < positioned.length; i++) {
    const a = positioned[i]
    for (let j = i + 1; j < positioned.length; j++) {
      const b = positioned[j]
      if (b.left < a.left + a.width) {
        // Overlap
        if (b.subRow === a.subRow) {
          b.subRow = a.subRow + 1
        }
        a.totalSubRows = Math.max(a.totalSubRows, b.subRow + 1)
        b.totalSubRows = Math.max(b.totalSubRows, b.subRow + 1)
      }
    }
  }

  // Normalize totalSubRows for groups
  for (let i = 0; i < positioned.length; i++) {
    const a = positioned[i]
    for (let j = 0; j < positioned.length; j++) {
      const b = positioned[j]
      if (i !== j && b.left < a.left + a.width && a.left < b.left + b.width) {
        const max = Math.max(a.totalSubRows, b.totalSubRows)
        a.totalSubRows = max
        b.totalSubRows = max
      }
    }
  }

  return positioned
}

function getEventColors(event: InternalCalendarEvent) {
  const cal: CalendarCategory | undefined = event.calendarId
    ? app.config.calendars[event.calendarId]
    : undefined
  if (!cal) {
    // Check resource colors
    const resource = props.resources.find((r) => r.id === event.resourceId)
    if (resource) {
      const colors = app.state.isDark.value ? resource.darkColors : resource.lightColors
      if (colors) {
        return {
          '--vc-event-bg': colors.container,
          '--vc-event-color': colors.onContainer,
          '--vc-event-accent': colors.main,
        }
      }
    }
    return {}
  }
  const colors = app.state.isDark.value ? cal.darkColors : cal.lightColors
  return {
    '--vc-event-bg': colors.container,
    '--vc-event-color': colors.onContainer,
    '--vc-event-accent': colors.main,
  }
}

function formatEventTime(event: InternalCalendarEvent): string {
  const fmt = (d: Temporal.PlainDateTime) =>
    d.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })
  return `${fmt(event._startDate)} - ${fmt(event._endDate)}`
}

function isEventDragging(event: InternalCalendarEvent): boolean {
  return interaction.mode.value !== 'idle' && interaction.activeEvent.value?.id === event.id
}

let wasDragged = false

function onEventClick(event: InternalCalendarEvent, e: MouseEvent) {
  if (wasDragged) {
    wasDragged = false
    return
  }
  callbacks.onEventClick?.(event)
  openModal(event, { x: e.clientX, y: e.clientY })
}

// Track mousedown to distinguish click from drag
let mouseDownPos = { x: 0, y: 0 }

function onEventMouseDown(event: InternalCalendarEvent, e: MouseEvent) {
  mouseDownPos = { x: e.clientX, y: e.clientY }
  wasDragged = false

  function onMouseMoveDetect(me: MouseEvent) {
    const dx = Math.abs(me.clientX - mouseDownPos.x)
    const dy = Math.abs(me.clientY - mouseDownPos.y)
    if (dx > 3 || dy > 3) {
      wasDragged = true
      document.removeEventListener('mousemove', onMouseMoveDetect)
      document.removeEventListener('mouseup', onMouseUpDetect)
      interaction.beginDrag(event, e, props.date)
    }
  }

  function onMouseUpDetect() {
    document.removeEventListener('mousemove', onMouseMoveDetect)
    document.removeEventListener('mouseup', onMouseUpDetect)
  }

  document.addEventListener('mousemove', onMouseMoveDetect)
  document.addEventListener('mouseup', onMouseUpDetect)
}

function onResizeMouseDown(event: InternalCalendarEvent, e: MouseEvent) {
  e.stopPropagation()
  interaction.beginResize(event, e, props.date)
}

function getEventSubRowStyle(pe: PositionedResourceEvent) {
  if (pe.totalSubRows <= 1) return {}
  const rowHeight = 100 / pe.totalSubRows
  return {
    top: `${pe.subRow * rowHeight}%`,
    bottom: `${(pe.totalSubRows - pe.subRow - 1) * rowHeight}%`,
  }
}
</script>

<template>
  <div class="vc-resource-time-grid">
    <!-- Hour header -->
    <div class="vc-resource-time-grid__header">
      <div ref="headerScrollRef" class="vc-resource-time-grid__header-scroll">
        <div v-for="hour in hours" :key="hour" class="vc-resource-time-grid__hour-label">
          {{ formatHour(hour, locale) }}
        </div>
      </div>
    </div>

    <!-- Body: rows per resource -->
    <div ref="bodyRef" class="vc-resource-time-grid__body" @scroll="onBodyScroll">
      <div class="vc-resource-time-grid__body-inner">
        <div
          v-for="(rd, rowIndex) in resourceData"
          :key="rd.resource.id"
          :ref="(el) => setRowRef(el, rowIndex)"
          class="vc-resource-time-grid__row"
        >
          <!-- Background cells (hour grid lines) -->
          <div class="vc-resource-time-grid__row-bg">
            <div v-for="hour in hours" :key="hour" class="vc-resource-time-grid__cell" />
          </div>

          <!-- Events layer -->
          <div class="vc-resource-time-grid__events-layer">
            <div
              v-for="pe in rd.events"
              :key="pe.event.id"
              :class="[
                'vc-resource-event',
                { 'vc-resource-event--dragging': isEventDragging(pe.event) },
              ]"
              :style="{
                left: `${pe.left}%`,
                width: `${pe.width}%`,
                ...getEventColors(pe.event),
                ...getEventSubRowStyle(pe),
              }"
              @click.stop="onEventClick(pe.event, $event)"
              @mousedown.prevent="onEventMouseDown(pe.event, $event)"
            >
              <component :is="customContent" v-if="customContent" :calendar-event="pe.event" />
              <template v-else>
                <span class="vc-resource-event__title">{{ pe.event.title }}</span>
                <span class="vc-resource-event__time">{{ formatEventTime(pe.event) }}</span>
              </template>
              <div
                v-if="!pe.event._options?.disableResize"
                class="vc-resource-event__resize-handle"
                @mousedown.prevent="onResizeMouseDown(pe.event, $event)"
              />
            </div>

            <!-- Ghost element -->
            <div
              v-if="
                interaction.mode.value !== 'idle' &&
                interaction.ghostResourceIndex.value === rowIndex
              "
              class="vc-resource-event vc-resource-event--ghost"
              :style="{
                left: `${interaction.ghostLeft.value}%`,
                width: `${interaction.ghostWidth.value}%`,
              }"
            >
              <span class="vc-resource-event__title">{{ interaction.ghostTitle.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

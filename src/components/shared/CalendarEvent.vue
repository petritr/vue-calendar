<script setup lang="ts">
import { computed, inject, type Component } from 'vue'
import type { InternalCalendarEvent, CalendarCategory } from '@/types'
import type { Temporal } from 'temporal-polyfill'
import { CALENDAR_APP_KEY } from '@/composables'
import { vRipple } from '@/directives/ripple'

const props = defineProps<{
  event: InternalCalendarEvent
  variant: 'month' | 'time' | 'allday'
  style?: Record<string, string>
  isDragging?: boolean
  customContent?: Component
}>()

const emit = defineEmits<{
  click: [event: InternalCalendarEvent, anchor: { x: number; y: number }]
  dblclick: [event: InternalCalendarEvent, anchor: { x: number; y: number }]
  dragstart: [event: InternalCalendarEvent, mouseEvent: MouseEvent]
  resizestart: [event: InternalCalendarEvent, edge: 'top' | 'bottom', mouseEvent: MouseEvent]
}>()

const app = inject(CALENDAR_APP_KEY)!

const calendar = computed<CalendarCategory | undefined>(() => {
  if (!props.event.calendarId) return undefined
  return app.config.calendars[props.event.calendarId]
})

const eventColors = computed(() => {
  const cal = calendar.value
  if (!cal) return {}
  const colors = app.state.isDark.value ? cal.darkColors : cal.lightColors
  return {
    '--vc-event-bg': colors.container,
    '--vc-event-color': colors.onContainer,
    '--vc-event-accent': colors.main,
  }
})

const timeLabel = computed(() => {
  if (props.event._isFullDay) return ''
  const s = props.event._startDate
  const e = props.event._endDate
  const fmt = (d: Temporal.PlainDateTime) =>
    d.toLocaleString(app.config.locale, { hour: '2-digit', minute: '2-digit' })
  return `${fmt(s)} - ${fmt(e)}`
})

// Track mousedown/touchstart to distinguish click from drag (time variant only)
let mouseDownPos = { x: 0, y: 0 }
let wasDragged = false
let touchHoldTimer: ReturnType<typeof setTimeout> | null = null

function onMouseDown(e: MouseEvent) {
  if (props.variant !== 'time') return
  mouseDownPos = { x: e.clientX, y: e.clientY }
  wasDragged = false

  function onMouseMoveDetect(me: MouseEvent) {
    const dx = Math.abs(me.clientX - mouseDownPos.x)
    const dy = Math.abs(me.clientY - mouseDownPos.y)
    if (dx > 3 || dy > 3) {
      wasDragged = true
      document.removeEventListener('mousemove', onMouseMoveDetect)
      document.removeEventListener('mouseup', onMouseUpDetect)
      emit('dragstart', props.event, e)
    }
  }

  function onMouseUpDetect() {
    document.removeEventListener('mousemove', onMouseMoveDetect)
    document.removeEventListener('mouseup', onMouseUpDetect)
  }

  document.addEventListener('mousemove', onMouseMoveDetect)
  document.addEventListener('mouseup', onMouseUpDetect)
}

function onTouchStart(e: TouchEvent) {
  if (props.variant !== 'time') return
  const touch = e.touches[0]
  mouseDownPos = { x: touch.clientX, y: touch.clientY }
  wasDragged = false

  // Use a short hold to initiate drag (prevents accidental drags while scrolling)
  touchHoldTimer = setTimeout(() => {
    wasDragged = true
    document.removeEventListener('touchmove', onTouchMoveDetect)
    document.removeEventListener('touchend', onTouchEndDetect)
    // Create a synthetic MouseEvent from the touch for the drag system
    const syntheticEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    emit('dragstart', props.event, syntheticEvent)
  }, 200)

  function onTouchMoveDetect(te: TouchEvent) {
    const t = te.touches[0]
    const dx = Math.abs(t.clientX - mouseDownPos.x)
    const dy = Math.abs(t.clientY - mouseDownPos.y)
    if (dx > 5 || dy > 5) {
      if (touchHoldTimer) clearTimeout(touchHoldTimer)
      touchHoldTimer = null
      document.removeEventListener('touchmove', onTouchMoveDetect)
      document.removeEventListener('touchend', onTouchEndDetect)
    }
  }

  function onTouchEndDetect() {
    if (touchHoldTimer) clearTimeout(touchHoldTimer)
    touchHoldTimer = null
    document.removeEventListener('touchmove', onTouchMoveDetect)
    document.removeEventListener('touchend', onTouchEndDetect)
  }

  document.addEventListener('touchmove', onTouchMoveDetect, { passive: true })
  document.addEventListener('touchend', onTouchEndDetect)
}

function onClick(e: MouseEvent) {
  if (wasDragged) {
    wasDragged = false
    return
  }
  emit('click', props.event, { x: e.clientX, y: e.clientY })
}

function onDblClick(e: MouseEvent) {
  emit('dblclick', props.event, { x: e.clientX, y: e.clientY })
}

function onResizeMouseDown(e: MouseEvent) {
  e.stopPropagation()
  emit('resizestart', props.event, 'bottom', e)
}

function onResizeTouchStart(e: TouchEvent) {
  e.stopPropagation()
  const touch = e.touches[0]
  const syntheticEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  emit('resizestart', props.event, 'bottom', syntheticEvent)
}
</script>

<template>
  <div
    v-ripple
    :class="[
      'vc-event',
      `vc-event--${variant}`,
      { 'vc-event--dragging': isDragging },
      { 'vc-event--background': event._options?.isBackground },
      ...(event._options?.additionalClasses ?? []),
    ]"
    :style="{ ...eventColors, ...style }"
    @click.stop="event._options?.isBackground ? undefined : onClick($event)"
    @dblclick.stop="event._options?.isBackground ? undefined : onDblClick($event)"
    @mousedown.prevent="event._options?.isBackground ? undefined : onMouseDown($event)"
    @touchstart="event._options?.isBackground ? undefined : onTouchStart($event)"
  >
    <component :is="customContent" v-if="customContent" :calendar-event="event" />
    <template v-else>
      <div class="vc-event__title">{{ event.title }}</div>
      <div v-if="variant === 'time' && timeLabel" class="vc-event__time">
        {{ timeLabel }}
      </div>
    </template>
    <div
      v-if="variant === 'time' && !event._options?.disableResize && !event._options?.isBackground"
      class="vc-event__resize-handle"
      @mousedown.prevent="onResizeMouseDown"
      @touchstart.prevent="onResizeTouchStart"
    />
  </div>
</template>

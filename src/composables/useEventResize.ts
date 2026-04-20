import { ref } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent, CalendarCallbacks, CalendarEvent, ResizeState } from '@/types'
import { formatDateTime, formatDate, toExternalEvent } from '@/core'

export function useEventResize(
  callbacks: CalendarCallbacks,
  updateEvent: (event: CalendarEvent) => void,
) {
  const resizeState = ref<ResizeState>({
    isResizing: false,
    event: null,
    edge: 'bottom',
    startY: 0,
    originalStart: '',
    originalEnd: '',
  })

  function startResize(
    event: InternalCalendarEvent,
    edge: 'top' | 'bottom',
    mouseEvent: MouseEvent,
  ) {
    if (event._options?.disableResize) return

    resizeState.value = {
      isResizing: true,
      event,
      edge,
      startY: mouseEvent.clientY,
      originalStart: event.start,
      originalEnd: event.end,
    }
  }

  async function endResize(newStart: Temporal.PlainDateTime, newEnd: Temporal.PlainDateTime) {
    const state = resizeState.value
    if (!state.isResizing || !state.event) return

    const isFullDay = state.event._isFullDay
    const newStartStr = isFullDay ? formatDate(newStart) : formatDateTime(newStart)
    const newEndStr = isFullDay ? formatDate(newEnd) : formatDateTime(newEnd)

    const oldEvent: CalendarEvent = {
      ...toExternalEvent(state.event),
      start: state.originalStart,
      end: state.originalEnd,
    }
    const newEvent: CalendarEvent = {
      ...toExternalEvent(state.event),
      start: newStartStr,
      end: newEndStr,
    }

    let allowed = true
    if (callbacks.onBeforeEventUpdate) {
      allowed = await callbacks.onBeforeEventUpdate(oldEvent, newEvent)
    }

    if (allowed) {
      updateEvent(newEvent)
    }

    resetState()
  }

  function cancelResize() {
    resetState()
  }

  function resetState() {
    resizeState.value = {
      isResizing: false,
      event: null,
      edge: 'bottom',
      startY: 0,
      originalStart: '',
      originalEnd: '',
    }
  }

  return { resizeState, startResize, endResize, cancelResize }
}

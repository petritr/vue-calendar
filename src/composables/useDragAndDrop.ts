import { ref } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent, CalendarCallbacks, CalendarEvent, DragState } from '@/types'
import { formatDateTime, formatDate, toExternalEvent } from '@/core'

export function useDragAndDrop(
  callbacks: CalendarCallbacks,
  updateEvent: (event: CalendarEvent) => void,
) {
  const dragState = ref<DragState>({
    isDragging: false,
    event: null,
    startY: 0,
    startX: 0,
    originalStart: '',
    originalEnd: '',
  })

  function startDrag(event: InternalCalendarEvent, mouseEvent: MouseEvent) {
    if (event._options?.disableDnD) return

    dragState.value = {
      isDragging: true,
      event,
      startY: mouseEvent.clientY,
      startX: mouseEvent.clientX,
      originalStart: event.start,
      originalEnd: event.end,
    }
  }

  async function endDrag(newStart: Temporal.PlainDateTime, newEnd: Temporal.PlainDateTime) {
    const state = dragState.value
    if (!state.isDragging || !state.event) return

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

    dragState.value = {
      isDragging: false,
      event: null,
      startY: 0,
      startX: 0,
      originalStart: '',
      originalEnd: '',
    }
  }

  function cancelDrag() {
    dragState.value = {
      isDragging: false,
      event: null,
      startY: 0,
      startX: 0,
      originalStart: '',
      originalEnd: '',
    }
  }

  return { dragState, startDrag, endDrag, cancelDrag }
}

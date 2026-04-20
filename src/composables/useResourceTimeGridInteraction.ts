import { ref, computed } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type {
  InternalCalendarEvent,
  CalendarEvent,
  ResourceInteractionMode,
  ResourceTimeGridInteractionOptions,
} from '@/types'
import { formatDateTime, formatDate, toExternalEvent } from '@/core'

const SNAP_MINUTES = 15
const MIN_EVENT_MINUTES = 15

export function useResourceTimeGridInteraction(options: ResourceTimeGridInteractionOptions) {
  const { callbacks, updateEvent, startHour, endHour, resources } = options

  const mode = ref<ResourceInteractionMode>('idle')
  const totalMinutes = (endHour - startHour) * 60

  // Ghost element state
  const ghostLeft = ref(0)
  const ghostWidth = ref(0)
  const ghostResourceIndex = ref(0)
  const ghostTitle = ref('')

  // The body element used for coordinate calculation
  const bodyEl = ref<HTMLElement | null>(null)

  // Rows mapping
  const rowEls = ref<HTMLElement[]>([])

  // Current drag/resize state
  const activeEvent = ref<InternalCalendarEvent | null>(null)
  const originalStart = ref('')
  const originalEnd = ref('')
  const originalResourceId = ref<string | number | undefined>(undefined)
  const currentNewStart = ref<Temporal.PlainDateTime | null>(null)
  const currentNewEnd = ref<Temporal.PlainDateTime | null>(null)
  const currentResourceId = ref<string | number | undefined>(undefined)

  const ghostStyle = computed(() => {
    if (mode.value === 'idle') return null
    return {
      position: 'absolute' as const,
      left: `${ghostLeft.value}%`,
      width: `${ghostWidth.value}%`,
      top: '2px',
      bottom: '2px',
      pointerEvents: 'none' as const,
    }
  })

  function pixelToMinutes(clientX: number): number {
    if (!bodyEl.value) return 0
    const rect = bodyEl.value.getBoundingClientRect()
    const offsetX = Math.max(
      0,
      Math.min(clientX - rect.left + bodyEl.value.scrollLeft, bodyEl.value.scrollWidth),
    )
    const ratio = offsetX / bodyEl.value.scrollWidth
    const rawMinutes = ratio * totalMinutes
    return Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES
  }

  function minutesToPercent(minutes: number): number {
    return (minutes / totalMinutes) * 100
  }

  function findResourceIndex(clientY: number): number {
    for (let i = 0; i < rowEls.value.length; i++) {
      const rect = rowEls.value[i].getBoundingClientRect()
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return i
      }
    }
    return ghostResourceIndex.value
  }

  function minutesToDateTime(minutes: number, date: Temporal.PlainDate): Temporal.PlainDateTime {
    const totalMins = startHour * 60 + minutes
    return date.toPlainDateTime({
      hour: Math.floor(totalMins / 60),
      minute: totalMins % 60,
    })
  }

  function beginDrag(
    event: InternalCalendarEvent,
    mouseEvent: MouseEvent,
    date: Temporal.PlainDate,
  ) {
    if (event._options?.disableDnD) return

    mode.value = 'drag'
    activeEvent.value = event
    originalStart.value = event.start
    originalEnd.value = event.end
    originalResourceId.value = event.resourceId

    const eventStartMinutes = (event._startDate.hour - startHour) * 60 + event._startDate.minute
    const eventEndMinutes = (event._endDate.hour - startHour) * 60 + event._endDate.minute
    const duration = eventEndMinutes - eventStartMinutes

    ghostLeft.value = minutesToPercent(eventStartMinutes)
    ghostWidth.value = minutesToPercent(duration)
    ghostTitle.value = event.title

    const resIdx = resources.findIndex((r) => r.id === event.resourceId)
    ghostResourceIndex.value = resIdx >= 0 ? resIdx : 0

    const startOffsetMinutes = pixelToMinutes(mouseEvent.clientX)

    function onMouseMove(e: MouseEvent) {
      e.preventDefault()
      const ri = findResourceIndex(e.clientY)
      ghostResourceIndex.value = ri

      const currentMinutes = pixelToMinutes(e.clientX)
      const delta = currentMinutes - startOffsetMinutes
      let newStartMinutes = eventStartMinutes + delta
      let newEndMinutes = newStartMinutes + duration

      if (newStartMinutes < 0) {
        newStartMinutes = 0
        newEndMinutes = duration
      }
      if (newEndMinutes > totalMinutes) {
        newEndMinutes = totalMinutes
        newStartMinutes = totalMinutes - duration
      }

      ghostLeft.value = minutesToPercent(newStartMinutes)
      ghostWidth.value = minutesToPercent(duration)

      currentNewStart.value = minutesToDateTime(newStartMinutes, date)
      currentNewEnd.value = minutesToDateTime(newEndMinutes, date)
      currentResourceId.value = resources[ri]?.id
    }

    function onMouseUp() {
      cleanup()
      finishDrag()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        cleanup()
        cancelInteraction()
      }
    }

    function cleanup() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.userSelect = ''
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
  }

  function beginResize(
    event: InternalCalendarEvent,
    _mouseEvent: MouseEvent,
    date: Temporal.PlainDate,
  ) {
    if (event._options?.disableResize) return

    mode.value = 'resize'
    activeEvent.value = event
    originalStart.value = event.start
    originalEnd.value = event.end
    originalResourceId.value = event.resourceId

    const eventStartMinutes = (event._startDate.hour - startHour) * 60 + event._startDate.minute
    const eventEndMinutes = (event._endDate.hour - startHour) * 60 + event._endDate.minute

    ghostLeft.value = minutesToPercent(eventStartMinutes)
    ghostWidth.value = minutesToPercent(eventEndMinutes - eventStartMinutes)
    ghostTitle.value = event.title

    const resIdx = resources.findIndex((r) => r.id === event.resourceId)
    ghostResourceIndex.value = resIdx >= 0 ? resIdx : 0

    function onMouseMove(e: MouseEvent) {
      e.preventDefault()
      const currentMinutes = pixelToMinutes(e.clientX)
      const newEndMinutes = Math.max(
        Math.min(currentMinutes, totalMinutes),
        eventStartMinutes + MIN_EVENT_MINUTES,
      )

      ghostWidth.value = minutesToPercent(newEndMinutes - eventStartMinutes)
      currentNewStart.value = minutesToDateTime(eventStartMinutes, date)
      currentNewEnd.value = minutesToDateTime(newEndMinutes, date)
      currentResourceId.value = event.resourceId
    }

    function onMouseUp() {
      cleanup()
      finishResize()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        cleanup()
        cancelInteraction()
      }
    }

    function cleanup() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.userSelect = ''
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
  }

  async function finishDrag() {
    if (!activeEvent.value || !currentNewStart.value || !currentNewEnd.value) {
      cancelInteraction()
      return
    }

    const event = activeEvent.value
    const isFullDay = event._isFullDay
    const newStartStr = isFullDay
      ? formatDate(currentNewStart.value)
      : formatDateTime(currentNewStart.value)
    const newEndStr = isFullDay
      ? formatDate(currentNewEnd.value)
      : formatDateTime(currentNewEnd.value)

    const oldEvent: CalendarEvent = {
      ...toExternalEvent(event),
      start: originalStart.value,
      end: originalEnd.value,
      resourceId: originalResourceId.value,
    }
    const newEvent: CalendarEvent = {
      ...toExternalEvent(event),
      start: newStartStr,
      end: newEndStr,
      resourceId: currentResourceId.value,
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

  async function finishResize() {
    if (!activeEvent.value || !currentNewStart.value || !currentNewEnd.value) {
      cancelInteraction()
      return
    }

    const event = activeEvent.value
    const isFullDay = event._isFullDay
    const newStartStr = isFullDay
      ? formatDate(currentNewStart.value)
      : formatDateTime(currentNewStart.value)
    const newEndStr = isFullDay
      ? formatDate(currentNewEnd.value)
      : formatDateTime(currentNewEnd.value)

    const oldEvent: CalendarEvent = {
      ...toExternalEvent(event),
      start: originalStart.value,
      end: originalEnd.value,
    }
    const newEvent: CalendarEvent = {
      ...toExternalEvent(event),
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

  function cancelInteraction() {
    resetState()
  }

  function resetState() {
    mode.value = 'idle'
    activeEvent.value = null
    currentNewStart.value = null
    currentNewEnd.value = null
    currentResourceId.value = undefined
  }

  function setBody(el: HTMLElement) {
    bodyEl.value = el
  }

  function setRows(els: HTMLElement[]) {
    rowEls.value = els
  }

  return {
    mode,
    ghostLeft,
    ghostWidth,
    ghostResourceIndex,
    ghostTitle,
    ghostStyle,
    activeEvent,
    beginDrag,
    beginResize,
    setBody,
    setRows,
  }
}

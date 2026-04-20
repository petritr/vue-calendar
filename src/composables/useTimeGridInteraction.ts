import { ref, computed } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent, InteractionMode, TimeGridInteractionOptions } from '@/types'

const SNAP_MINUTES = 15
const MIN_EVENT_MINUTES = 15

export function useTimeGridInteraction(options: TimeGridInteractionOptions) {
  const { endDrag, cancelDrag, endResize, cancelResize, startHour, endHour } = options

  const mode = ref<InteractionMode>('idle')
  const columnEls = ref<HTMLElement[]>([])
  const columnDates = ref<Temporal.PlainDate[]>([])

  // Ghost element positioning
  const ghostTop = ref(0)
  const ghostHeight = ref(0)
  const ghostColumnIndex = ref(0)
  const ghostTitle = ref('')

  // Computed new start/end during interaction
  const currentNewStart = ref<Temporal.PlainDateTime | null>(null)
  const currentNewEnd = ref<Temporal.PlainDateTime | null>(null)

  const totalMinutes = (endHour - startHour) * 60

  const ghostStyle = computed(() => {
    if (mode.value === 'idle') return null
    return {
      position: 'absolute' as const,
      top: `${ghostTop.value}%`,
      height: `${ghostHeight.value}%`,
      left: '0',
      width: '100%',
      pointerEvents: 'none' as const,
    }
  })

  function pixelToMinutes(clientY: number, columnEl: HTMLElement): number {
    const rect = columnEl.getBoundingClientRect()
    const offsetY = Math.max(0, Math.min(clientY - rect.top, rect.height))
    const ratio = offsetY / rect.height
    const rawMinutes = ratio * totalMinutes
    return Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES
  }

  function minutesToDateTime(minutes: number, dayDate: Temporal.PlainDate): Temporal.PlainDateTime {
    const totalMins = startHour * 60 + minutes
    return dayDate.toPlainDateTime({
      hour: Math.floor(totalMins / 60),
      minute: totalMins % 60,
    })
  }

  function findColumnIndex(clientX: number): number {
    for (let i = 0; i < columnEls.value.length; i++) {
      const rect = columnEls.value[i].getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) {
        return i
      }
    }
    return ghostColumnIndex.value
  }

  function minutesToPercent(minutes: number): number {
    return (minutes / totalMinutes) * 100
  }

  // --- Drag ---

  function beginDrag(event: InternalCalendarEvent, mouseEvent: MouseEvent) {
    if (event._options?.disableDnD) return

    options.startDrag(event, mouseEvent)
    mode.value = 'drag'

    const eventStartMinutes = (event._startDate.hour - startHour) * 60 + event._startDate.minute
    const eventEndMinutes = (event._endDate.hour - startHour) * 60 + event._endDate.minute
    const duration = eventEndMinutes - eventStartMinutes

    ghostTop.value = minutesToPercent(eventStartMinutes)
    ghostHeight.value = minutesToPercent(duration)
    ghostTitle.value = event.title

    // Determine which column this event is in
    const colIdx = findColumnIndex(mouseEvent.clientX)
    ghostColumnIndex.value = colIdx

    const startOffsetMinutes = pixelToMinutes(mouseEvent.clientY, columnEls.value[colIdx])

    function handleDragMove(clientX: number, clientY: number) {
      const colI = findColumnIndex(clientX)
      ghostColumnIndex.value = colI
      const col = columnEls.value[colI] ?? columnEls.value[0]

      const currentMinutes = pixelToMinutes(clientY, col)
      const delta = currentMinutes - startOffsetMinutes
      let newStartMinutes = eventStartMinutes + delta
      let newEndMinutes = newStartMinutes + duration

      // Clamp
      if (newStartMinutes < 0) {
        newStartMinutes = 0
        newEndMinutes = duration
      }
      if (newEndMinutes > totalMinutes) {
        newEndMinutes = totalMinutes
        newStartMinutes = totalMinutes - duration
      }

      ghostTop.value = minutesToPercent(newStartMinutes)
      ghostHeight.value = minutesToPercent(duration)

      const dayDate = columnDates.value[colI] ?? columnDates.value[0]
      currentNewStart.value = minutesToDateTime(newStartMinutes, dayDate)
      currentNewEnd.value = minutesToDateTime(newEndMinutes, dayDate)
    }

    function onMouseMove(e: MouseEvent) {
      e.preventDefault()
      handleDragMove(e.clientX, e.clientY)
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const t = e.touches[0]
      handleDragMove(t.clientX, t.clientY)
    }

    function cleanup() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.userSelect = ''
    }

    function onMouseUp() {
      cleanup()

      if (currentNewStart.value && currentNewEnd.value) {
        endDrag(currentNewStart.value, currentNewEnd.value)
      } else {
        cancelDrag()
      }

      mode.value = 'idle'
      currentNewStart.value = null
      currentNewEnd.value = null
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        cleanup()
        cancelDrag()
        mode.value = 'idle'
        currentNewStart.value = null
        currentNewEnd.value = null
      }
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
  }

  // --- Resize ---

  function beginResize(
    event: InternalCalendarEvent,
    edge: 'top' | 'bottom',
    mouseEvent: MouseEvent,
  ) {
    if (event._options?.disableResize) return

    options.startResize(event, edge, mouseEvent)
    mode.value = 'resize'

    const eventStartMinutes = (event._startDate.hour - startHour) * 60 + event._startDate.minute
    const eventEndMinutes = (event._endDate.hour - startHour) * 60 + event._endDate.minute

    ghostTop.value = minutesToPercent(eventStartMinutes)
    ghostHeight.value = minutesToPercent(eventEndMinutes - eventStartMinutes)
    ghostTitle.value = event.title

    const colIdx = findColumnIndex(mouseEvent.clientX)
    ghostColumnIndex.value = colIdx

    function handleResizeMove(clientY: number) {
      const col = columnEls.value[colIdx] ?? columnEls.value[0]
      const currentMinutes = pixelToMinutes(clientY, col)

      let newStartMinutes = eventStartMinutes
      let newEndMinutes = eventEndMinutes

      if (edge === 'bottom') {
        newEndMinutes = Math.max(currentMinutes, newStartMinutes + MIN_EVENT_MINUTES)
        newEndMinutes = Math.min(newEndMinutes, totalMinutes)
      } else {
        newStartMinutes = Math.min(currentMinutes, newEndMinutes - MIN_EVENT_MINUTES)
        newStartMinutes = Math.max(newStartMinutes, 0)
      }

      ghostTop.value = minutesToPercent(newStartMinutes)
      ghostHeight.value = minutesToPercent(newEndMinutes - newStartMinutes)

      const dayDate = columnDates.value[colIdx] ?? columnDates.value[0]
      currentNewStart.value = minutesToDateTime(newStartMinutes, dayDate)
      currentNewEnd.value = minutesToDateTime(newEndMinutes, dayDate)
    }

    function onMouseMove(e: MouseEvent) {
      e.preventDefault()
      handleResizeMove(e.clientY)
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      handleResizeMove(e.touches[0].clientY)
    }

    function cleanup() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.userSelect = ''
    }

    function onMouseUp() {
      cleanup()

      if (currentNewStart.value && currentNewEnd.value) {
        endResize(currentNewStart.value, currentNewEnd.value)
      } else {
        cancelResize()
      }

      mode.value = 'idle'
      currentNewStart.value = null
      currentNewEnd.value = null
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        cleanup()
        cancelResize()
        mode.value = 'idle'
        currentNewStart.value = null
        currentNewEnd.value = null
      }
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
  }

  function setColumns(els: HTMLElement[], dates: Temporal.PlainDate[]) {
    columnEls.value = els
    columnDates.value = dates
  }

  return {
    mode,
    ghostTop,
    ghostHeight,
    ghostColumnIndex,
    ghostTitle,
    ghostStyle,
    beginDrag,
    beginResize,
    setColumns,
  }
}

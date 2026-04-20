import type { Ref } from 'vue'
import { Temporal } from 'temporal-polyfill'
import type { ViewName, CalendarCallbacks } from '@/types'
import { formatDate, startOfWeek, startOfMonth, endOfMonth, todayDate, parseDateOnly } from '@/core'

export function useCalendarNavigation(
  currentDate: Ref<Temporal.PlainDate>,
  currentView: Ref<ViewName>,
  firstDayOfWeek: number,
  callbacks: CalendarCallbacks,
  minDate: string | null,
  maxDate: string | null,
) {
  const minBound = minDate ? parseDateOnly(minDate) : null
  const maxBound = maxDate ? parseDateOnly(maxDate) : null

  function clampDate(date: Temporal.PlainDate): Temporal.PlainDate {
    if (minBound && Temporal.PlainDate.compare(date, minBound) < 0) return minBound
    if (maxBound && Temporal.PlainDate.compare(date, maxBound) > 0) return maxBound
    return date
  }
  function emitRangeUpdate() {
    if (!callbacks.onRangeUpdate) return

    const date = currentDate.value
    let start: string
    let end: string

    switch (currentView.value) {
      case 'day':
      case 'resource-day':
        start = formatDate(date)
        end = formatDate(date)
        break
      case 'week':
      case 'resource-week':
      case 'week-agenda':
        start = formatDate(startOfWeek(date, firstDayOfWeek))
        end = formatDate(startOfWeek(date, firstDayOfWeek).add({ days: 6 }))
        break
      case 'month-grid':
      case 'month-agenda':
        start = formatDate(startOfMonth(date))
        end = formatDate(endOfMonth(date))
        break
      default:
        start = formatDate(date)
        end = formatDate(date)
    }

    callbacks.onRangeUpdate({ start, end })
  }

  function next() {
    let target: Temporal.PlainDate
    switch (currentView.value) {
      case 'day':
      case 'resource-day':
        target = currentDate.value.add({ days: 1 })
        break
      case 'week':
      case 'resource-week':
      case 'week-agenda':
        target = currentDate.value.add({ days: 7 })
        break
      case 'month-grid':
      case 'month-agenda':
        target = currentDate.value.add({ months: 1 })
        break
      default:
        target = currentDate.value.add({ days: 1 })
    }
    currentDate.value = clampDate(target)
    emitRangeUpdate()
  }

  function prev() {
    let target: Temporal.PlainDate
    switch (currentView.value) {
      case 'day':
      case 'resource-day':
        target = currentDate.value.subtract({ days: 1 })
        break
      case 'week':
      case 'resource-week':
      case 'week-agenda':
        target = currentDate.value.subtract({ days: 7 })
        break
      case 'month-grid':
      case 'month-agenda':
        target = currentDate.value.subtract({ months: 1 })
        break
      default:
        target = currentDate.value.subtract({ days: 1 })
    }
    currentDate.value = clampDate(target)
    emitRangeUpdate()
  }

  function today() {
    currentDate.value = clampDate(todayDate())
    emitRangeUpdate()
  }

  return { next, prev, today, emitRangeUpdate }
}

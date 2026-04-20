import { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent, PositionedEvent } from '@/types'

/**
 * Calculate vertical position of a timed event within a day's time grid.
 */
export function getTimeGridPosition(
  event: InternalCalendarEvent,
  _dayStart: Temporal.PlainDate,
  startHour: number,
  endHour: number,
): { top: number; height: number } {
  const totalMinutes = (endHour - startHour) * 60
  const eventStart = event._startDate
  const eventEnd = event._endDate

  const startMinutes = Math.max((eventStart.hour - startHour) * 60 + eventStart.minute, 0)
  const endMinutes = Math.min((eventEnd.hour - startHour) * 60 + eventEnd.minute, totalMinutes)

  const top = (startMinutes / totalMinutes) * 100
  const height = Math.max(((endMinutes - startMinutes) / totalMinutes) * 100, 1)

  return { top, height }
}

/**
 * Resolve overlapping events into columns for side-by-side display.
 */
export function resolveOverlaps(events: InternalCalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) return []

  const sorted = [...events].sort((a, b) =>
    Temporal.PlainDateTime.compare(a._startDate, b._startDate),
  )

  const groups: InternalCalendarEvent[][] = []
  let currentGroup: InternalCalendarEvent[] = [sorted[0]]
  let currentGroupEnd = sorted[0]._endDate

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i]
    if (Temporal.PlainDateTime.compare(event._startDate, currentGroupEnd) < 0) {
      currentGroup.push(event)
      if (Temporal.PlainDateTime.compare(event._endDate, currentGroupEnd) > 0) {
        currentGroupEnd = event._endDate
      }
    } else {
      groups.push(currentGroup)
      currentGroup = [event]
      currentGroupEnd = event._endDate
    }
  }
  groups.push(currentGroup)

  const result: PositionedEvent[] = []

  for (const group of groups) {
    const columns: InternalCalendarEvent[][] = []

    for (const event of group) {
      let placed = false
      for (const element of columns) {
        const lastInCol = element.at(-1)!
        if (Temporal.PlainDateTime.compare(lastInCol._endDate, event._startDate) <= 0) {
          element.push(event)
          placed = true
          break
        }
      }
      if (!placed) {
        columns.push([event])
      }
    }

    const totalColumns = columns.length
    for (let col = 0; col < columns.length; col++) {
      for (const event of columns[col]) {
        result.push({
          event,
          top: 0,
          height: 0,
          left: (col / totalColumns) * 100,
          width: 100 / totalColumns,
          column: col,
          totalColumns,
        })
      }
    }
  }

  return result
}

/**
 * Get events that occur on a specific date.
 */
export function getEventsForDay(
  events: InternalCalendarEvent[],
  date: Temporal.PlainDate,
): InternalCalendarEvent[] {
  const dayStart = date.toPlainDateTime({ hour: 0, minute: 0 })
  const dayEnd = date.add({ days: 1 }).toPlainDateTime({ hour: 0, minute: 0 })

  return events.filter((event) => {
    return (
      Temporal.PlainDateTime.compare(event._startDate, dayEnd) < 0 &&
      Temporal.PlainDateTime.compare(event._endDate, dayStart) > 0
    )
  })
}

/**
 * Separate full-day and timed events.
 */
export function partitionEvents(events: InternalCalendarEvent[]): {
  fullDay: InternalCalendarEvent[]
  timed: InternalCalendarEvent[]
} {
  const fullDay: InternalCalendarEvent[] = []
  const timed: InternalCalendarEvent[] = []

  for (const event of events) {
    if (event._isFullDay || event._isMultiDay) {
      fullDay.push(event)
    } else {
      timed.push(event)
    }
  }

  return { fullDay, timed }
}

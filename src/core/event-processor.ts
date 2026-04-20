import { Temporal } from 'temporal-polyfill'
import type { CalendarEvent, InternalCalendarEvent } from '@/types'
import { parseDateTime, isFullDayEvent, diffInMinutes } from './date-utils'

/**
 * Convert a user-facing CalendarEvent into an InternalCalendarEvent
 * with pre-computed Temporal objects and derived flags.
 */
export function toInternalEvent(event: CalendarEvent): InternalCalendarEvent {
  const startDate = parseDateTime(event.start)
  const endDate = parseDateTime(event.end)
  const isFullDay = isFullDayEvent(event.start)
  const isMultiDay =
    !isFullDay && Temporal.PlainDate.compare(startDate.toPlainDate(), endDate.toPlainDate()) !== 0

  return {
    ...event,
    _startDate: startDate,
    _endDate: endDate,
    _isFullDay: isFullDay,
    _isMultiDay: isFullDay
      ? Temporal.PlainDate.compare(startDate.toPlainDate(), endDate.toPlainDate()) !== 0
      : (isMultiDay as boolean),
    _durationMinutes: isFullDay ? 1440 : diffInMinutes(startDate, endDate),
  }
}

/**
 * Process an array of CalendarEvents into sorted InternalCalendarEvents.
 */
export function processEvents(events: CalendarEvent[]): InternalCalendarEvent[] {
  return events
    .map(toInternalEvent)
    .sort((a, b) => Temporal.PlainDateTime.compare(a._startDate, b._startDate))
}

/**
 * Strip internal fields from an InternalCalendarEvent to produce a clean CalendarEvent.
 * This prevents leaking _startDate, _endDate, etc. to external callbacks.
 */
export function toExternalEvent(event: InternalCalendarEvent): CalendarEvent {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(event)) {
    if (!key.startsWith('_')) {
      result[key] = event[key]
    }
  }
  // Preserve _options since it's user-facing
  if (event._options) {
    result._options = event._options
  }
  return result as CalendarEvent
}

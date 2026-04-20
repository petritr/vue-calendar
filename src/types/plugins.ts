import type { InternalCalendarEvent, CalendarEvent } from './calendar-event'
import type { ViewName } from './views'

export interface EventsService {
  get: (id: string | number) => InternalCalendarEvent | undefined
  getAll: () => InternalCalendarEvent[]
  add: (event: CalendarEvent) => void
  update: (event: CalendarEvent) => void
  remove: (id: string | number) => void
  set: (events: CalendarEvent[]) => void
}

export interface CalendarControls {
  setView: (view: ViewName) => void
  setDate: (date: string) => void
  getView: () => ViewName
  getDate: () => string
  setDark: (isDark: boolean) => void
}

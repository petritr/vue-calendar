import type { Temporal } from 'temporal-polyfill'

export interface CalendarEventOptions {
  disableDnD?: boolean
  disableResize?: boolean
  isBackground?: boolean
  additionalClasses?: string[]
}

export interface CalendarEvent {
  id: string | number
  title: string
  start: string // ISO date or datetime string: 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm'
  end: string
  description?: string
  location?: string
  people?: string[]
  calendarId?: string
  resourceId?: string | number
  _options?: CalendarEventOptions
  [key: string]: unknown
}

export interface InternalCalendarEvent extends CalendarEvent {
  _startDate: Temporal.PlainDateTime
  _endDate: Temporal.PlainDateTime
  _isFullDay: boolean
  _isMultiDay: boolean
  _durationMinutes: number
}

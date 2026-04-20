import type { Component } from 'vue'
import type { CalendarEvent } from './calendar-event'
import type { CalendarPlugin } from './plugin'
import type { ViewConfig } from './views'
import type { Resource } from './resource'

export interface CustomComponents {
  /**
   * Custom content for timed events in week/day time grid views.
   * Receives prop: `calendarEvent: InternalCalendarEvent`
   */
  timeGridEvent?: Component
  /**
   * Custom content for all-day/multi-day events in the time grid header.
   * Receives prop: `calendarEvent: InternalCalendarEvent`
   */
  dateGridEvent?: Component
  /**
   * Custom content for events in the month grid view.
   * Receives prop: `calendarEvent: InternalCalendarEvent`
   */
  monthGridEvent?: Component
  /**
   * Custom content for events in the month agenda view.
   * Falls back to `monthGridEvent` if not provided.
   * Receives prop: `calendarEvent: InternalCalendarEvent`
   */
  monthAgendaEvent?: Component
  /**
   * Custom event modal replacing the default detail popup.
   * Receives props: `calendarEvent: InternalCalendarEvent`, `locale: string`
   * Must emit: `close`
   */
  eventModal?: Component
  /**
   * Custom content for events in the resource view.
   * Receives prop: `calendarEvent: InternalCalendarEvent`
   */
  resourceEvent?: Component
}

export interface CalendarColors {
  main: string
  container: string
  onContainer: string
}

export interface CalendarCategory {
  colorName: string
  label?: string
  lightColors: CalendarColors
  darkColors: CalendarColors
}

export interface DayBoundaries {
  start: number // Hour (0-23)
  end: number // Hour (0-23)
}

export interface WeekOptions {
  gridHeight?: number
  nDays?: number
  eventWidth?: number
  timeAxisFormatOptions?: Intl.DateTimeFormatOptions
  initialScroll?: number // Hour to scroll to on mount (e.g. 8 for 8:00 AM)
}

export interface MonthGridOptions {
  nEventsPerDay?: number
}

export interface CalendarCallbacks {
  onEventClick?: (event: CalendarEvent) => void
  onEventDoubleClick?: (event: CalendarEvent) => void
  onDateClick?: (date: string) => void
  onDateDoubleClick?: (date: string) => void
  onDateTimeClick?: (dateTime: string) => void
  onDateTimeDoubleClick?: (dateTime: string) => void
  onRangeUpdate?: (range: { start: string; end: string }) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onBeforeEventUpdate?: (
    oldEvent: CalendarEvent,
    newEvent: CalendarEvent,
  ) => boolean | Promise<boolean>
  onResourceClick?: (resource: Resource) => void
}

export interface CalendarConfig {
  views: ViewConfig[]
  defaultView?: string
  events?: CalendarEvent[]
  calendars?: Record<string, CalendarCategory>
  locale?: string
  firstDayOfWeek?: number // 0 = Sunday, 1 = Monday
  isDark?: boolean
  isResponsive?: boolean
  selectedDate?: string // 'YYYY-MM-DD'
  dayBoundaries?: DayBoundaries
  minDate?: string
  maxDate?: string
  weekOptions?: WeekOptions
  monthGridOptions?: MonthGridOptions
  resources?: Resource[]
  plugins?: CalendarPlugin[]
  callbacks?: CalendarCallbacks
  customComponents?: CustomComponents
}

export type ResolvedCalendarConfig = Required<
  Pick<
    CalendarConfig,
    | 'views'
    | 'defaultView'
    | 'locale'
    | 'firstDayOfWeek'
    | 'isDark'
    | 'isResponsive'
    | 'dayBoundaries'
    | 'weekOptions'
    | 'monthGridOptions'
  >
> & {
  events: CalendarEvent[]
  calendars: Record<string, CalendarCategory>
  selectedDate: string
  minDate: string | null
  maxDate: string | null
  resources: Resource[]
  plugins: CalendarPlugin[]
  callbacks: CalendarCallbacks
  customComponents: CustomComponents
}

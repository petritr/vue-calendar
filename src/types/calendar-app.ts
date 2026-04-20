import type { Ref, ShallowRef } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from './calendar-event'
import type { ResolvedCalendarConfig } from './calendar-config'
import type { ViewName } from './views'
import type { CalendarPlugin } from './plugin'

export interface CalendarState {
  currentView: Ref<ViewName>
  currentDate: Ref<Temporal.PlainDate>
  isSmallScreen: Ref<boolean>
  isDark: Ref<boolean>
}

export interface CalendarEvents {
  list: ShallowRef<InternalCalendarEvent[]>
}

export interface CalendarApp {
  config: ResolvedCalendarConfig
  state: CalendarState
  events: CalendarEvents
  plugins: CalendarPlugin[]
}

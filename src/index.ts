// Components
export { default as VueCalendar } from './components/VueCalendar.vue'

// Composables
export { useCalendarApp, CALENDAR_APP_KEY } from './composables'

// View factories
export {
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
  createViewMonthAgenda,
  createViewWeekAgenda,
  createViewList,
  createViewResourceDay,
  createViewResourceWeek,
} from './views'

// Plugins
export {
  createEventsServicePlugin,
  createCalendarControlsPlugin,
  createCurrentTimePlugin,
} from './plugins'

// Types
export type {
  CalendarConfig,
  CalendarEvent,
  CalendarEventOptions,
  CalendarCategory,
  CalendarColors,
  CalendarCallbacks,
  CalendarPlugin,
  ViewConfig,
  ViewName,
  DayBoundaries,
  WeekOptions,
  MonthGridOptions,
  CalendarApp,
  CustomComponents,
  Resource,
  ResourceColors,
  ResourceViewConfig,
  EventsService,
  CalendarControls,
  PositionedEvent,
  DragState,
  ResizeState,
  InteractionMode,
  TimeGridInteractionOptions,
  ResourceInteractionMode,
  ResourceTimeGridInteractionOptions,
} from './types'

// Core utilities (for advanced usage)
export {
  formatDate,
  formatDateTime,
  parseDateTime,
  parseDateOnly,
  isSameDay,
  addDays,
  addMonths,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  getMonthGridDates,
  getWeekDates,
  todayDate,
} from './core'

// Styles
import './styles/index.css'

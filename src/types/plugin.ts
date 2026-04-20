import type { CalendarApp } from './calendar-app'

export interface CalendarPlugin {
  name: string
  beforeRender?: (app: CalendarApp) => void
  onRender?: (app: CalendarApp) => void
  destroy?: () => void
  [key: string]: unknown
}

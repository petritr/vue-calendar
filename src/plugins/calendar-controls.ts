import { Temporal } from 'temporal-polyfill'
import type { CalendarPlugin, CalendarApp, ViewName, CalendarControls } from '@/types'

export function createCalendarControlsPlugin(): CalendarPlugin & {
  controls: CalendarControls | null
} {
  let controls: CalendarControls | null = null

  return {
    name: 'calendar-controls',
    controls: null,

    onRender(app: CalendarApp) {
      controls = {
        setView(view: ViewName) {
          app.state.currentView.value = view
        },
        setDate(date: string) {
          app.state.currentDate.value = Temporal.PlainDate.from(date)
        },
        getView() {
          return app.state.currentView.value
        },
        getDate() {
          return app.state.currentDate.value.toString()
        },
        setDark(isDark: boolean) {
          app.state.isDark.value = isDark
        },
      }
      this.controls = controls
    },
  }
}

import { type InjectionKey } from 'vue'
import type { CalendarApp, CalendarConfig, ResolvedCalendarConfig } from '@/types'
import { useCalendarState } from './useCalendarState'
import { useCalendarEvents } from './useCalendarEvents'
import { useCalendarNavigation } from './useCalendarNavigation'
import { useDragAndDrop } from './useDragAndDrop'
import { useEventResize } from './useEventResize'
import { todayDate } from '@/core'

export const CALENDAR_APP_KEY: InjectionKey<ReturnType<typeof useCalendarApp>> =
  Symbol('CalendarApp')

function resolveConfig(config: CalendarConfig): ResolvedCalendarConfig {
  return {
    views: config.views,
    defaultView: config.defaultView ?? config.views[0]?.name ?? 'month-grid',
    events: config.events ?? [],
    calendars: config.calendars ?? {},
    locale: config.locale ?? 'en-US',
    firstDayOfWeek: config.firstDayOfWeek ?? 0,
    isDark: config.isDark ?? false,
    isResponsive: config.isResponsive ?? true,
    selectedDate: config.selectedDate ?? todayDate().toString(),
    dayBoundaries: config.dayBoundaries ?? { start: 0, end: 24 },
    minDate: config.minDate ?? null,
    maxDate: config.maxDate ?? null,
    weekOptions: {
      gridHeight: 1200,
      nDays: 7,
      eventWidth: 100,
      ...config.weekOptions,
    },
    monthGridOptions: {
      nEventsPerDay: 3,
      ...config.monthGridOptions,
    },
    resources: config.resources ?? [],
    plugins: config.plugins ?? [],
    callbacks: config.callbacks ?? {},
    customComponents: config.customComponents ?? {},
  }
}

export function useCalendarApp(config: CalendarConfig) {
  const resolved = resolveConfig(config)

  const state = useCalendarState(resolved)
  const events = useCalendarEvents(resolved.events, resolved.callbacks)
  const navigation = useCalendarNavigation(
    state.currentDate,
    state.currentView,
    resolved.firstDayOfWeek,
    resolved.callbacks,
    resolved.minDate,
    resolved.maxDate,
  )
  const dnd = useDragAndDrop(resolved.callbacks, (evt) => events.update(evt))
  const resize = useEventResize(resolved.callbacks, (evt) => events.update(evt))

  const app: CalendarApp = {
    config: resolved,
    state: {
      currentView: state.currentView,
      currentDate: state.currentDate,
      isSmallScreen: state.isSmallScreen,
      isDark: state.isDark,
    },
    events: { list: events.list },
    plugins: resolved.plugins,
  }

  // Expose event methods for plugins (e.g. EventsService)
  ;(app as unknown as Record<string, unknown>).__eventMethods = {
    get: events.get,
    getAll: events.getAll,
    add: events.add,
    update: events.update,
    remove: events.remove,
    set: events.set,
  }

  // Run plugin beforeRender hooks
  for (const plugin of resolved.plugins) {
    plugin.beforeRender?.(app)
  }

  return {
    config: resolved,
    state,
    events,
    navigation,
    dnd,
    resize,
    app,
  }
}

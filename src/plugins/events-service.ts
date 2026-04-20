import type {
  CalendarPlugin,
  CalendarApp,
  CalendarEvent,
  InternalCalendarEvent,
  EventsService,
} from '@/types'

export function createEventsServicePlugin(): CalendarPlugin & { service: EventsService } {
  const plugin: CalendarPlugin & { service: EventsService } = {
    name: 'events-service',
    service: null!,

    beforeRender(app: CalendarApp) {
      const methods = (app as unknown as Record<string, unknown>).__eventMethods as {
        get: (id: string | number) => InternalCalendarEvent | undefined
        getAll: () => InternalCalendarEvent[]
        add: (event: CalendarEvent) => void
        update: (event: CalendarEvent) => void
        remove: (id: string | number) => void
        set: (events: CalendarEvent[]) => void
      }

      plugin.service = {
        get: (id) => methods.get(id),
        getAll: () => methods.getAll(),
        add: (event) => methods.add(event),
        update: (event) => methods.update(event),
        remove: (id) => methods.remove(id),
        set: (events) => methods.set(events),
      }
    },
  }

  return plugin
}

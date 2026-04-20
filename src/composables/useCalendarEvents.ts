import { shallowRef } from 'vue'
import { Temporal } from 'temporal-polyfill'
import type { CalendarEvent, InternalCalendarEvent, CalendarCallbacks } from '@/types'
import { processEvents, toInternalEvent } from '@/core'

export function useCalendarEvents(initialEvents: CalendarEvent[], callbacks: CalendarCallbacks) {
  const list = shallowRef<InternalCalendarEvent[]>(processEvents(initialEvents))

  function set(events: CalendarEvent[]) {
    list.value = processEvents(events)
  }

  function add(event: CalendarEvent) {
    list.value = [...list.value, toInternalEvent(event)].sort((a, b) =>
      Temporal.PlainDateTime.compare(a._startDate, b._startDate),
    )
  }

  function update(updated: CalendarEvent) {
    const idx = list.value.findIndex((e) => e.id === updated.id)
    if (idx === -1) return
    const newList = [...list.value]
    newList[idx] = toInternalEvent(updated)
    list.value = newList.sort((a, b) => Temporal.PlainDateTime.compare(a._startDate, b._startDate))
    callbacks.onEventUpdate?.(updated)
  }

  function remove(id: string | number) {
    list.value = list.value.filter((e) => e.id !== id)
  }

  function get(id: string | number): InternalCalendarEvent | undefined {
    return list.value.find((e) => e.id === id)
  }

  function getAll(): InternalCalendarEvent[] {
    return list.value
  }

  return { list, set, add, update, remove, get, getAll }
}

import type { Ref } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent, CalendarEvent } from './calendar-event'
import type { CalendarCallbacks } from './calendar-config'
import type { Resource } from './resource'

export interface DragState {
  isDragging: boolean
  event: InternalCalendarEvent | null
  startY: number
  startX: number
  originalStart: string
  originalEnd: string
}

export interface ResizeState {
  isResizing: boolean
  event: InternalCalendarEvent | null
  edge: 'top' | 'bottom'
  startY: number
  originalStart: string
  originalEnd: string
}

export type InteractionMode = 'idle' | 'drag' | 'resize'

export interface TimeGridInteractionOptions {
  dragState: Ref<DragState>
  resizeState: Ref<ResizeState>
  startDrag: (event: InternalCalendarEvent, mouseEvent: MouseEvent) => void
  endDrag: (newStart: Temporal.PlainDateTime, newEnd: Temporal.PlainDateTime) => void
  cancelDrag: () => void
  startResize: (
    event: InternalCalendarEvent,
    edge: 'top' | 'bottom',
    mouseEvent: MouseEvent,
  ) => void
  endResize: (newStart: Temporal.PlainDateTime, newEnd: Temporal.PlainDateTime) => void
  cancelResize: () => void
  startHour: number
  endHour: number
}

export type ResourceInteractionMode = 'idle' | 'drag' | 'resize'

export interface ResourceTimeGridInteractionOptions {
  callbacks: CalendarCallbacks
  updateEvent: (event: CalendarEvent) => void
  startHour: number
  endHour: number
  resources: Resource[]
}

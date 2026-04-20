import type { InternalCalendarEvent } from './calendar-event'

export interface PositionedEvent {
  event: InternalCalendarEvent
  top: number // percentage or px from top of time grid
  height: number // percentage or px height
  left: number // percentage offset for overlapping events
  width: number // percentage width
  column: number
  totalColumns: number
}

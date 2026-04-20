import { Temporal } from 'temporal-polyfill'

const FULL_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function parseDateTime(value: string): Temporal.PlainDateTime {
  if (FULL_DAY_REGEX.test(value)) {
    return Temporal.PlainDate.from(value).toPlainDateTime({ hour: 0, minute: 0 })
  }
  return Temporal.PlainDateTime.from(value.replace(' ', 'T'))
}

export function parseDateOnly(value: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(value.slice(0, 10))
}

export function isFullDayEvent(start: string): boolean {
  return FULL_DAY_REGEX.test(start)
}

export function formatDate(date: Temporal.PlainDate | Temporal.PlainDateTime): string {
  if (date instanceof Temporal.PlainDateTime) {
    return date.toPlainDate().toString()
  }
  return date.toString()
}

export function formatDateTime(dt: Temporal.PlainDateTime): string {
  return `${dt.toPlainDate().toString()} ${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}`
}

export function isSameDay(
  a: Temporal.PlainDate | Temporal.PlainDateTime,
  b: Temporal.PlainDate | Temporal.PlainDateTime,
): boolean {
  const aDate = a instanceof Temporal.PlainDateTime ? a.toPlainDate() : a
  const bDate = b instanceof Temporal.PlainDateTime ? b.toPlainDate() : b
  return Temporal.PlainDate.compare(aDate, bDate) === 0
}

export function addDays(date: Temporal.PlainDate, days: number): Temporal.PlainDate {
  return days >= 0 ? date.add({ days }) : date.subtract({ days: -days })
}

export function addMonths(date: Temporal.PlainDate, months: number): Temporal.PlainDate {
  return months >= 0 ? date.add({ months }) : date.subtract({ months: -months })
}

export function startOfWeek(date: Temporal.PlainDate, firstDayOfWeek: number): Temporal.PlainDate {
  const day = date.dayOfWeek % 7 // 0=Sunday, 1=Monday, ..., 6=Saturday
  const diff = (day - firstDayOfWeek + 7) % 7
  return date.subtract({ days: diff })
}

export function startOfMonth(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ day: 1 })
}

export function endOfMonth(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ day: date.daysInMonth })
}

export function getDaysInMonth(date: Temporal.PlainDate): number {
  return date.daysInMonth
}

export function getMonthGridDates(
  date: Temporal.PlainDate,
  firstDayOfWeek: number,
): Temporal.PlainDate[] {
  const start = startOfWeek(startOfMonth(date), firstDayOfWeek)
  const dates: Temporal.PlainDate[] = []
  // Always show 6 weeks (42 days) for consistent grid height
  for (let i = 0; i < 42; i++) {
    dates.push(start.add({ days: i }))
  }
  return dates
}

export function getWeekDates(
  date: Temporal.PlainDate,
  firstDayOfWeek: number,
  nDays: number,
): Temporal.PlainDate[] {
  const start = startOfWeek(date, firstDayOfWeek)
  const dates: Temporal.PlainDate[] = []
  for (let i = 0; i < nDays; i++) {
    dates.push(start.add({ days: i }))
  }
  return dates
}

export function getHoursArray(startHour: number, endHour: number): number[] {
  const hours: number[] = []
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i)
  }
  return hours
}

export function diffInMinutes(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): number {
  const aMs = a.toZonedDateTime('UTC').epochMilliseconds
  const bMs = b.toZonedDateTime('UTC').epochMilliseconds
  return Math.round((bMs - aMs) / 60000)
}

export function formatMonthYear(date: Temporal.PlainDate, locale: string): string {
  return date.toLocaleString(locale, { month: 'long', year: 'numeric' })
}

export function formatWeekday(
  date: Temporal.PlainDate,
  locale: string,
  format: 'long' | 'short' = 'short',
): string {
  return date.toLocaleString(locale, { weekday: format })
}

export function formatHour(hour: number, locale: string): string {
  const dt = Temporal.PlainDateTime.from({ year: 2000, month: 1, day: 1, hour, minute: 0 })
  return dt.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })
}

export function toPlainDate(dt: Temporal.PlainDate | Temporal.PlainDateTime): Temporal.PlainDate {
  return dt instanceof Temporal.PlainDateTime ? dt.toPlainDate() : dt
}

export function todayDate(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO()
}

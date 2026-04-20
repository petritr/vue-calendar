# @vue-calendar/core

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/vue-3.4+-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6.svg)](https://www.typescriptlang.org/)

A modern, fully-featured Vue 3 calendar component inspired by [schedule-x](https://github.com/schedule-x/schedule-x) -- rebuilt from scratch with native Vue reactivity, the Temporal API, and Material Design 3 theming. Every feature ships free and open source, with no paywalled premium tiers.

**[Live Demo](https://petritr.github.io/vue-calendar/)**

---

## Features

- **8 Views** -- Month Grid, Week, Day, Month Agenda, Week Agenda, List, Resource Day, Resource Week
- **Drag & Drop** -- Reschedule events by dragging, with `onBeforeEventUpdate` veto support
- **Event Resize** -- Resize events by dragging edges
- **Resource Scheduling** -- Multi-resource day and week views with per-resource colors
- **Dark Mode** -- Full light/dark theme support with Material Design 3 tokens
- **Responsive** -- Automatic view switching for small screens via ResizeObserver
- **Plugins** -- Extensible plugin system with lifecycle hooks (`beforeRender`, `onRender`, `destroy`)
- **Custom Components** -- Override event rendering in every view context
- **Background Events** -- Non-interactive events for blocking time, holidays, etc.
- **Touch Support** -- Drag & resize work on touch devices
- **Localization** -- Full `Intl` locale support, configurable first day of week
- **TypeScript** -- Complete type definitions included
- **Zero CSS import needed** -- Styles are injected automatically via JS

## Installation

```bash
npm install @vue-calendar/core
```

Vue 3.4+ is required as a peer dependency.

## Quick Start

```vue
<script setup lang="ts">
import { VueCalendar, createViewMonthGrid, createViewWeek, createViewDay } from '@vue-calendar/core'
import type { CalendarConfig } from '@vue-calendar/core'

const config: CalendarConfig = {
  views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
  events: [
    {
      id: '1',
      title: 'Team Meeting',
      start: '2026-04-20 09:00',
      end: '2026-04-20 10:30',
    },
    {
      id: '2',
      title: 'Conference',
      start: '2026-04-22',
      end: '2026-04-24',
    },
  ],
}
</script>

<template>
  <div style="height: 800px">
    <VueCalendar :config="config" />
  </div>
</template>
```

> The calendar fills its parent container. Make sure the parent has a defined height.

## Views

```typescript
import {
  createViewMonthGrid,    // Traditional month calendar
  createViewWeek,         // Week with time grid
  createViewDay,          // Single day with time grid
  createViewMonthAgenda,  // Month events in agenda format
  createViewWeekAgenda,   // Week events in agenda format
  createViewList,         // Flat event list
  createViewResourceDay,  // Resource scheduler (day)
  createViewResourceWeek, // Resource scheduler (week)
} from '@vue-calendar/core'
```

Pass the views you want to the `views` array in config. The first view is used as the default unless `defaultView` is set.

## Configuration

```typescript
const config: CalendarConfig = {
  // Required
  views: [createViewMonthGrid(), createViewWeek(), createViewDay()],

  // Navigation
  defaultView: 'week',
  selectedDate: '2026-04-20',
  minDate: '2026-01-01',
  maxDate: '2026-12-31',

  // Localization
  locale: 'en-US',
  firstDayOfWeek: 1, // 0 = Sunday, 1 = Monday

  // Appearance
  isDark: false,
  isResponsive: true,
  dayBoundaries: { start: 6, end: 22 },

  // Week/day view options
  weekOptions: {
    gridHeight: 1200,
    nDays: 7,
    eventWidth: 100,
    initialScroll: 8, // Scroll to 8:00 AM on mount
    timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
  },

  // Month grid options
  monthGridOptions: {
    nEventsPerDay: 3,
  },

  // Event calendars (color categories)
  calendars: {
    work: {
      colorName: 'work',
      label: 'Work',
      lightColors: { main: '#1a73e8', container: '#d2e3fc', onContainer: '#174ea6' },
      darkColors: { main: '#8ab4f8', container: '#1a3a5c', onContainer: '#aecbfa' },
    },
  },

  // Events, resources, plugins, callbacks, custom components
  events: [],
  resources: [],
  plugins: [],
  callbacks: {},
  customComponents: {},
}
```

## Events

```typescript
interface CalendarEvent {
  id: string | number
  title: string
  start: string  // 'YYYY-MM-DD' (full-day) or 'YYYY-MM-DD HH:mm' (timed)
  end: string
  description?: string
  location?: string
  people?: string[]
  calendarId?: string          // Links to a calendar color category
  resourceId?: string | number // Links to a resource
  _options?: {
    disableDnD?: boolean        // Disable drag & drop for this event
    disableResize?: boolean     // Disable resize for this event
    isBackground?: boolean      // Render as non-interactive background event
    additionalClasses?: string[] // Extra CSS classes
  }
  [key: string]: unknown       // Arbitrary extra data
}
```

### Background Events

Non-interactive events for blocking time, holidays, or out-of-office:

```typescript
{
  id: 'bg-1',
  title: 'Out of Office',
  start: '2026-04-20 12:00',
  end: '2026-04-20 13:00',
  _options: { isBackground: true },
}
```

## Callbacks

```typescript
const config: CalendarConfig = {
  callbacks: {
    onEventClick: (event) => { /* ... */ },
    onEventDoubleClick: (event) => { /* ... */ },
    onDateClick: (date) => { /* ... */ },
    onDateDoubleClick: (date) => { /* ... */ },
    onDateTimeClick: (dateTime) => { /* ... */ },
    onDateTimeDoubleClick: (dateTime) => { /* ... */ },
    onRangeUpdate: (range) => { /* { start, end } */ },
    onEventUpdate: (event) => { /* After drag/resize completes */ },
    onResourceClick: (resource) => { /* ... */ },

    // Return false to veto a drag/resize operation
    onBeforeEventUpdate: (oldEvent, newEvent) => {
      return newEvent.start >= '2026-04-01' // Only allow future dates
    },
  },
}
```

## Plugins

### Events Service

Programmatic CRUD for events after the calendar mounts:

```typescript
import { createEventsServicePlugin } from '@vue-calendar/core'

const eventsService = createEventsServicePlugin()

const config: CalendarConfig = {
  plugins: [eventsService],
  // ...
}

// After mount:
eventsService.service.add({
  id: '3',
  title: 'New Event',
  start: '2026-04-20 14:00',
  end: '2026-04-20 15:00',
})

eventsService.service.getAll()      // All events
eventsService.service.get('3')      // Single event
eventsService.service.update({...}) // Update event
eventsService.service.remove('3')   // Remove by ID
eventsService.service.set([...])    // Replace all events
```

### Calendar Controls

Programmatic navigation and state control:

```typescript
import { createCalendarControlsPlugin } from '@vue-calendar/core'

const calendarControls = createCalendarControlsPlugin()

const config: CalendarConfig = {
  plugins: [calendarControls],
  // ...
}

// After mount:
calendarControls.controls.setView('day')
calendarControls.controls.setDate('2026-06-01')
calendarControls.controls.setDark(true)
calendarControls.controls.getView() // Current view name
calendarControls.controls.getDate() // Current date string
```

### Current Time Indicator

Renders a red line at the current time in week/day views, updated every 60 seconds:

```typescript
import { createCurrentTimePlugin } from '@vue-calendar/core'

const config: CalendarConfig = {
  plugins: [createCurrentTimePlugin()],
  // ...
}
```

### Writing Custom Plugins

```typescript
import type { CalendarPlugin } from '@vue-calendar/core'

const myPlugin: CalendarPlugin = {
  name: 'my-plugin',
  beforeRender(app) { /* Before the calendar mounts */ },
  onRender(app) { /* After the calendar mounts */ },
  destroy() { /* Cleanup on unmount */ },
}
```

## Resource Scheduling

Assign events to resources (rooms, people, equipment) and display them in dedicated resource views:

```typescript
import { createViewResourceDay, createViewResourceWeek } from '@vue-calendar/core'
import type { CalendarConfig, Resource } from '@vue-calendar/core'

const resources: Resource[] = [
  { id: 'r1', label: 'Room A' },
  {
    id: 'r2',
    label: 'Dr. Smith',
    avatar: 'https://example.com/avatar.jpg',
    lightColors: { main: '#1565c0', container: '#bbdefb', onContainer: '#0d47a1' },
    darkColors: { main: '#64b5f6', container: '#0d47a1', onContainer: '#bbdefb' },
  },
]

const config: CalendarConfig = {
  views: [createViewResourceDay(), createViewResourceWeek()],
  resources,
  events: [
    {
      id: '1',
      title: 'Meeting',
      start: '2026-04-20 09:00',
      end: '2026-04-20 10:00',
      resourceId: 'r1',
    },
  ],
  callbacks: {
    onResourceClick: (resource) => { /* ... */ },
  },
}
```

## Custom Components

Override event rendering per view context. Each custom component receives a `calendarEvent` prop:

```typescript
import MyTimeEvent from './MyTimeEvent.vue'
import MyMonthEvent from './MyMonthEvent.vue'
import MyEventModal from './MyEventModal.vue'

const config: CalendarConfig = {
  customComponents: {
    timeGridEvent: MyTimeEvent,      // Week/day timed events
    dateGridEvent: MyAllDayEvent,    // All-day events in time grid header
    monthGridEvent: MyMonthEvent,    // Month grid events
    monthAgendaEvent: MyAgendaEvent, // Month agenda events
    resourceEvent: MyResourceEvent,  // Resource view events
    eventModal: MyEventModal,        // Event detail modal (must emit 'close')
  },
}
```

## Theming

All visual properties are controlled via CSS custom properties with a `--vc-` prefix, following Material Design 3 token naming:

```css
/* Override the default theme */
:root {
  --vc-color-primary: #0ea5e9;
  --vc-color-surface: #f8fafc;
  --vc-color-on-surface: #0f172a;
  --vc-font-family: 'Inter', sans-serif;
  --vc-shape-small: 6px;
}
```

Available token categories:
- **Color**: `--vc-color-primary`, `--vc-color-surface`, `--vc-color-outline`, etc.
- **Typography**: `--vc-font-family`, `--vc-typescale-body-medium`, etc.
- **Shape**: `--vc-shape-small` through `--vc-shape-full`
- **Elevation**: `--vc-elevation-0` through `--vc-elevation-5`
- **Motion**: `--vc-motion-easing-*`, `--vc-motion-duration-*`
- **Layout**: `--vc-time-axis-width`, `--vc-hour-height`, `--vc-resource-sidebar-width`

Dark mode is activated via the `isDark` config option or `calendarControls.controls.setDark(true)`.

## Exports

```typescript
// Component
export { VueCalendar } from '@vue-calendar/core'

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
} from '@vue-calendar/core'

// Plugins
export {
  createEventsServicePlugin,
  createCalendarControlsPlugin,
  createCurrentTimePlugin,
} from '@vue-calendar/core'

// Date utilities (for advanced usage)
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
} from '@vue-calendar/core'

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
  EventsService,
  CalendarControls,
} from '@vue-calendar/core'
```

## Browser Support

Requires browsers that support:
- ES2022
- ResizeObserver
- CSS custom properties

The Temporal API is polyfilled via [temporal-polyfill](https://github.com/nicolo-ribaudo/temporal-polyfill).

## Contributing

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build the library
npm run build

# Lint & format
npm run lint
npm run format
```

## License

[MIT](LICENSE)

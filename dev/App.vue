<script setup lang="ts">
import {
  VueCalendar,
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
  createViewMonthAgenda,
  createViewResourceDay,
  todayDate,
} from '../src'
import type { CalendarConfig, CalendarEvent, Resource } from '@'

const todayStr = todayDate().toString()

// Patient resources
const resources: Resource[] = [
  {
    id: 'dr-smith',
    label: 'Dr. Smith',
    lightColors: {
      main: '#1565c0',
      container: '#bbdefb',
      onContainer: '#0d47a1',
    },
    darkColors: {
      main: '#64b5f6',
      container: '#0d47a1',
      onContainer: '#bbdefb',
    },
  },
  {
    id: 'dr-johnson',
    label: 'Dr. Johnson',
    lightColors: {
      main: '#2e7d32',
      container: '#c8e6c9',
      onContainer: '#1b5e20',
    },
    darkColors: {
      main: '#66bb6a',
      container: '#1b5e20',
      onContainer: '#c8e6c9',
    },
  },
  {
    id: 'dr-williams',
    label: 'Dr. Williams',
    lightColors: {
      main: '#e65100',
      container: '#ffe0b2',
      onContainer: '#bf360c',
    },
    darkColors: {
      main: '#ffb74d',
      container: '#bf360c',
      onContainer: '#ffe0b2',
    },
  },
  {
    id: 'dr-davis',
    label: 'Dr. Davis',
    lightColors: {
      main: '#6a1b9a',
      container: '#e1bee7',
      onContainer: '#4a148c',
    },
    darkColors: {
      main: '#ce93d8',
      container: '#4a148c',
      onContainer: '#e1bee7',
    },
  },
  {
    id: 'dr-martinez',
    label: 'Dr. Martinez',
    lightColors: {
      main: '#00838f',
      container: '#b2ebf2',
      onContainer: '#006064',
    },
    darkColors: {
      main: '#4dd0e1',
      container: '#006064',
      onContainer: '#b2ebf2',
    },
  },
]

// Patient appointment events
const events: CalendarEvent[] = [
  // Dr. Smith appointments
  {
    id: 101,
    title: 'Anna Mueller - Checkup',
    start: `${todayStr} 08:00`,
    end: `${todayStr} 08:45`,
    resourceId: 'dr-smith',
    calendarId: 'appointments',
  },
  {
    id: 102,
    title: 'Ben Carter - Follow-up',
    start: `${todayStr} 09:00`,
    end: `${todayStr} 09:30`,
    resourceId: 'dr-smith',
    calendarId: 'appointments',
  },
  {
    id: 103,
    title: 'Clara Jensen - Lab Review',
    start: `${todayStr} 10:00`,
    end: `${todayStr} 10:45`,
    resourceId: 'dr-smith',
    calendarId: 'appointments',
  },
  {
    id: 104,
    title: 'David Park - Physical',
    start: `${todayStr} 13:00`,
    end: `${todayStr} 14:00`,
    resourceId: 'dr-smith',
    calendarId: 'appointments',
  },

  // Dr. Johnson appointments
  {
    id: 201,
    title: 'Emma Wilson - Consultation',
    start: `${todayStr} 08:30`,
    end: `${todayStr} 09:15`,
    resourceId: 'dr-johnson',
    calendarId: 'appointments',
  },
  {
    id: 202,
    title: 'Frank Liu - Blood Work',
    start: `${todayStr} 09:30`,
    end: `${todayStr} 10:00`,
    resourceId: 'dr-johnson',
    calendarId: 'appointments',
  },
  {
    id: 203,
    title: 'Grace Kim - Annual Exam',
    start: `${todayStr} 11:00`,
    end: `${todayStr} 12:00`,
    resourceId: 'dr-johnson',
    calendarId: 'appointments',
  },
  {
    id: 204,
    title: 'Henry Brooks - Vaccination',
    start: `${todayStr} 14:00`,
    end: `${todayStr} 14:30`,
    resourceId: 'dr-johnson',
    calendarId: 'appointments',
  },

  // Dr. Williams appointments
  {
    id: 301,
    title: 'Isabel Torres - Dermatology',
    start: `${todayStr} 09:00`,
    end: `${todayStr} 09:45`,
    resourceId: 'dr-williams',
    calendarId: 'appointments',
  },
  {
    id: 302,
    title: 'Jake Robinson - Wound Care',
    start: `${todayStr} 10:30`,
    end: `${todayStr} 11:15`,
    resourceId: 'dr-williams',
    calendarId: 'appointments',
  },
  {
    id: 303,
    title: 'Karen Chen - Allergy Test',
    start: `${todayStr} 13:30`,
    end: `${todayStr} 14:30`,
    resourceId: 'dr-williams',
    calendarId: 'appointments',
  },

  // Dr. Davis appointments
  {
    id: 401,
    title: 'Leo Martin - Therapy',
    start: `${todayStr} 08:00`,
    end: `${todayStr} 09:00`,
    resourceId: 'dr-davis',
    calendarId: 'appointments',
  },
  {
    id: 402,
    title: 'Mia Santos - Cardio Check',
    start: `${todayStr} 10:00`,
    end: `${todayStr} 10:45`,
    resourceId: 'dr-davis',
    calendarId: 'appointments',
  },
  {
    id: 403,
    title: 'Noah Evans - X-Ray Review',
    start: `${todayStr} 11:00`,
    end: `${todayStr} 11:30`,
    resourceId: 'dr-davis',
    calendarId: 'appointments',
  },
  {
    id: 404,
    title: 'Olivia Reed - Prenatal',
    start: `${todayStr} 14:00`,
    end: `${todayStr} 15:00`,
    resourceId: 'dr-davis',
    calendarId: 'appointments',
  },

  // Dr. Martinez appointments
  {
    id: 501,
    title: 'Peter Hoffman - ENT',
    start: `${todayStr} 09:00`,
    end: `${todayStr} 09:45`,
    resourceId: 'dr-martinez',
    calendarId: 'appointments',
  },
  {
    id: 502,
    title: 'Quinn Adams - Post-Op',
    start: `${todayStr} 11:30`,
    end: `${todayStr} 12:15`,
    resourceId: 'dr-martinez',
    calendarId: 'appointments',
  },
  {
    id: 503,
    title: 'Rachel Green - Ortho',
    start: `${todayStr} 13:00`,
    end: `${todayStr} 13:45`,
    resourceId: 'dr-martinez',
    calendarId: 'appointments',
  },
  {
    id: 504,
    title: 'Sam Turner - Sports Med',
    start: `${todayStr} 15:00`,
    end: `${todayStr} 16:00`,
    resourceId: 'dr-martinez',
    calendarId: 'appointments',
  },

  // Regular calendar events (no resource)
  {
    id: 5,
    title: 'Staff Meeting',
    start: todayStr,
    end: todayStr,
    calendarId: 'work',
  },
]

const config: CalendarConfig = {
  views: [
    createViewResourceDay(),
    createViewWeek(),
    createViewDay(),
    createViewMonthGrid(),
    createViewMonthAgenda(),
  ],
  defaultView: 'resource-day',
  events,
  resources,
  locale: 'en-US',
  firstDayOfWeek: 1,
  dayBoundaries: { start: 6, end: 22 },
  calendars: {
    work: {
      colorName: 'work',
      label: 'Work',
      lightColors: {
        main: '#4f46e5',
        container: '#e0e7ff',
        onContainer: '#312e81',
      },
      darkColors: {
        main: '#818cf8',
        container: '#312e81',
        onContainer: '#e0e7ff',
      },
    },
    appointments: {
      colorName: 'appointments',
      label: 'Appointments',
      lightColors: {
        main: '#0e7490',
        container: '#cffafe',
        onContainer: '#164e63',
      },
      darkColors: {
        main: '#22d3ee',
        container: '#164e63',
        onContainer: '#cffafe',
      },
    },
  },
  callbacks: {
    onEventClick(event) {
      console.log('Event clicked:', event)
    },
    onResourceClick(resource) {
      console.log('Resource clicked:', resource)
    },
    onEventUpdate(event) {
      console.log('Event updated:', event)
    },
    onRangeUpdate(range) {
      console.log('Range updated:', range)
    },
  },
}
</script>

<template>
  <div style="padding: 24px; height: 100%; display: flex; flex-direction: column">
    <h1 style="margin-bottom: 16px; font-size: 24px; font-weight: 700">
      Vue Calendar — Patient Scheduler
    </h1>
    <div style="flex: 1; min-height: 0">
      <VueCalendar :config="config" />
    </div>
  </div>
</template>

import type { ViewConfig } from '@/types'
import MonthGridView from '@/components/views/MonthGridView.vue'
import WeekView from '@/components/views/WeekView.vue'
import DayView from '@/components/views/DayView.vue'
import MonthAgendaView from '@/components/views/MonthAgendaView.vue'
import WeekAgendaView from '@/components/views/WeekAgendaView.vue'
import ListView from '@/components/views/ListView.vue'
import ResourceDayView from '@/components/views/ResourceDayView.vue'
import ResourceWeekView from '@/components/views/ResourceWeekView.vue'

export function createViewMonthGrid(): ViewConfig {
  return {
    name: 'month-grid',
    label: 'Month',
    component: MonthGridView,
    hasSmallScreenCompat: false,
    hasWideScreenCompat: true,
  }
}

export function createViewWeek(): ViewConfig {
  return {
    name: 'week',
    label: 'Week',
    component: WeekView,
    hasSmallScreenCompat: false,
    hasWideScreenCompat: true,
  }
}

export function createViewDay(): ViewConfig {
  return {
    name: 'day',
    label: 'Day',
    component: DayView,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: true,
  }
}

export function createViewMonthAgenda(): ViewConfig {
  return {
    name: 'month-agenda',
    label: 'Agenda',
    component: MonthAgendaView,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: true,
  }
}

export function createViewWeekAgenda(): ViewConfig {
  return {
    name: 'week-agenda',
    label: 'Week',
    component: WeekAgendaView,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: true,
  }
}

export function createViewList(): ViewConfig {
  return {
    name: 'list',
    label: 'List',
    component: ListView,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: true,
  }
}

export function createViewResourceDay(): ViewConfig {
  return {
    name: 'resource-day',
    label: 'Resources',
    component: ResourceDayView,
    hasSmallScreenCompat: false,
    hasWideScreenCompat: true,
  }
}

export function createViewResourceWeek(): ViewConfig {
  return {
    name: 'resource-week',
    label: 'Resource Week',
    component: ResourceWeekView,
    hasSmallScreenCompat: false,
    hasWideScreenCompat: true,
  }
}

import type { Component } from 'vue'

export type ViewName =
  | 'month-grid'
  | 'week'
  | 'day'
  | 'month-agenda'
  | 'week-agenda'
  | 'list'
  | 'resource-day'
  | 'resource-week'

export interface ViewConfig {
  name: ViewName
  label: string
  component: Component
  hasSmallScreenCompat: boolean
  hasWideScreenCompat: boolean
}

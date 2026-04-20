import { ref, computed, type Ref } from 'vue'
import type { CalendarState, ResolvedCalendarConfig, ViewName, ViewConfig } from '@/types'
import { parseDateOnly } from '@/core'
import type { Temporal } from 'temporal-polyfill'

export function useCalendarState(config: ResolvedCalendarConfig): CalendarState & {
  setView: (view: ViewName) => void
  setDate: (date: Temporal.PlainDate) => void
  availableViews: Ref<ViewConfig[]>
} {
  const currentView = ref<ViewName>(config.defaultView as ViewName)
  const currentDate = ref(parseDateOnly(config.selectedDate))
  const isSmallScreen = ref(false)
  const isDark = ref(config.isDark)

  const availableViews = computed(() => {
    if (!config.isResponsive) return config.views
    return config.views.filter((v) =>
      isSmallScreen.value ? v.hasSmallScreenCompat : v.hasWideScreenCompat,
    )
  })

  function setView(view: ViewName) {
    const viewExists = config.views.some((v) => v.name === view)
    if (viewExists) {
      currentView.value = view
    }
  }

  function setDate(date: Temporal.PlainDate) {
    currentDate.value = date
  }

  return {
    currentView,
    currentDate,
    isSmallScreen,
    isDark,
    availableViews,
    setView,
    setDate,
  }
}

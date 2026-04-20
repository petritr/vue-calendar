import { ref } from 'vue'
import type { CalendarPlugin, CalendarApp } from '@/types'
import { Temporal } from 'temporal-polyfill'

/** Reactive current time ref, updated every 60s by the plugin. */
export const currentTimeRef = ref<Temporal.PlainDateTime>(Temporal.Now.plainDateTimeISO())

export function createCurrentTimePlugin(): CalendarPlugin {
  let intervalId: ReturnType<typeof setInterval> | null = null

  return {
    name: 'current-time',

    onRender(_app: CalendarApp) {
      currentTimeRef.value = Temporal.Now.plainDateTimeISO()
      intervalId = setInterval(() => {
        currentTimeRef.value = Temporal.Now.plainDateTimeISO()
      }, 60000)
    },

    destroy() {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    },
  }
}

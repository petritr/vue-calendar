<script setup lang="ts">
import { provide, onMounted, onBeforeUnmount, computed, watch, ref } from 'vue'
import type { CalendarConfig, InternalCalendarEvent } from '@/types'
import { useCalendarApp, CALENDAR_APP_KEY } from '@/composables'
import CalendarHeader from './header/CalendarHeader.vue'
import EventModal from './shared/EventModal.vue'

const props = defineProps<{
  config: CalendarConfig
}>()

const app = useCalendarApp(props.config)
provide(CALENDAR_APP_KEY, app)

// Centralized modal state
const selectedEvent = ref<InternalCalendarEvent | null>(null)
const modalAnchor = ref<{ x: number; y: number } | null>(null)

// Child components call this to open modal near the clicked element
provide('openEventModal', (event: InternalCalendarEvent, anchor?: { x: number; y: number }) => {
  selectedEvent.value = event
  modalAnchor.value = anchor ?? null
})

function closeModal() {
  selectedEvent.value = null
}

const activeViewComponent = computed(() => {
  const viewName = app.state.currentView.value
  const view = app.config.views.find((v) => v.name === viewName)
  return view?.component ?? null
})

const customModal = computed(() => app.config.customComponents.eventModal)

// Responsive breakpoint detection
let resizeObserver: ResizeObserver | null = null
const calendarEl = ref<HTMLElement | null>(null)

onMounted(() => {
  for (const plugin of app.config.plugins) {
    plugin.onRender?.(app.app)
  }
  app.navigation.emitRangeUpdate()

  if (app.config.isResponsive && calendarEl.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        app.state.isSmallScreen.value = entry.contentRect.width < 700
      }
    })
    resizeObserver.observe(calendarEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  for (const plugin of app.config.plugins) {
    plugin.destroy?.()
  }
})

watch(
  () => [app.state.currentView.value, app.state.currentDate.value],
  () => app.navigation.emitRangeUpdate(),
)
</script>

<template>
  <div ref="calendarEl" class="vc-calendar" :data-vc-dark="app.state.isDark.value">
    <CalendarHeader />
    <div class="vc-view">
      <component :is="activeViewComponent" v-if="activeViewComponent" />
    </div>

    <Teleport to="body">
      <template v-if="selectedEvent">
        <component
          :is="customModal"
          v-if="customModal"
          :calendar-event="selectedEvent"
          :locale="app.config.locale"
          :anchor="modalAnchor"
          @close="closeModal"
        />
        <EventModal
          v-else
          :event="selectedEvent"
          :locale="app.config.locale"
          :anchor="modalAnchor"
          @close="closeModal"
        />
      </template>
    </Teleport>
  </div>
</template>

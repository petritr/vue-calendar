<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { CALENDAR_APP_KEY } from '@/composables'
import { formatMonthYear } from '@/core'
import type { ViewName } from '@/types'
import { vRipple } from '@/directives/ripple'

const app = inject(CALENDAR_APP_KEY)!

const title = computed(() => {
  const date = app.state.currentDate.value
  const locale = app.config.locale
  const view = app.state.currentView.value

  if (view === 'day' || view === 'resource-day') {
    return date.toLocaleString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (view === 'week' || view === 'resource-week' || view === 'week-agenda') {
    return date.toLocaleString(locale, {
      month: 'long',
      year: 'numeric',
    })
  }

  return formatMonthYear(date, locale)
})

// View selector dropdown
const isViewSelectorOpen = ref(false)
const selectedViewLabel = computed(() => {
  const current = app.state.currentView.value
  const view = app.state.availableViews.value.find((v) => v.name === current)
  return view?.label ?? current
})

function setView(name: ViewName) {
  app.state.setView(name)
  isViewSelectorOpen.value = false
}

function toggleViewSelector() {
  isViewSelectorOpen.value = !isViewSelectorOpen.value
}

function closeViewSelector() {
  isViewSelectorOpen.value = false
}
</script>

<template>
  <div class="vc-header">
    <div class="vc-header__content">
      <div class="vc-header__nav">
        <button
          v-ripple
          class="vc-header__btn"
          aria-label="Previous"
          @click="app.navigation.prev()"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <button v-ripple class="vc-header__btn" aria-label="Next" @click="app.navigation.next()">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      <button v-ripple class="vc-header__today-btn" @click="app.navigation.today()">Today</button>

      <span class="vc-header__title">{{ title }}</span>
    </div>

    <div v-if="app.state.availableViews.value.length > 1" class="vc-header__view-selector">
      <button class="vc-header__view-selector-trigger" @click="toggleViewSelector">
        <span>{{ selectedViewLabel }}</span>
        <svg
          :class="['vc-header__chevron', { 'vc-header__chevron--open': isViewSelectorOpen }]"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
      </button>

      <Teleport to="body">
        <div v-if="isViewSelectorOpen" class="vc-header__view-overlay" @click="closeViewSelector" />
      </Teleport>

      <div v-if="isViewSelectorOpen" class="vc-header__view-dropdown">
        <button
          v-for="view in app.state.availableViews.value"
          :key="view.name"
          :class="[
            'vc-header__view-option',
            { 'vc-header__view-option--active': app.state.currentView.value === view.name },
          ]"
          @click="setView(view.name)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>
  </div>
</template>

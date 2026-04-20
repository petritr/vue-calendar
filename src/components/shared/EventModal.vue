<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref, nextTick } from 'vue'
import type { Temporal } from 'temporal-polyfill'
import type { InternalCalendarEvent } from '@/types'

const props = defineProps<{
  event: InternalCalendarEvent
  locale?: string
  anchor?: { x: number; y: number } | null
}>()

const emit = defineEmits<{
  close: []
}>()

const effectiveLocale = computed(() => props.locale ?? 'en-US')
const modalEl = ref<HTMLElement | null>(null)
const position = ref<{ top: string; left: string }>({ top: '50%', left: '50%' })
const useTransformCenter = ref(true)

const timeLabel = computed(() => {
  if (props.event._isFullDay) {
    return props.event.start === props.event.end
      ? props.event.start
      : `${props.event.start} - ${props.event.end}`
  }
  const fmt = (d: Temporal.PlainDateTime) =>
    d.toLocaleString(effectiveLocale.value, {
      hour: '2-digit',
      minute: '2-digit',
    })
  const dateFmt = (d: Temporal.PlainDateTime) =>
    d.toPlainDate().toLocaleString(effectiveLocale.value, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  return `${dateFmt(props.event._startDate)} ${fmt(props.event._startDate)} - ${fmt(props.event._endDate)}`
})

function clampPosition() {
  if (!props.anchor || !modalEl.value) return

  const modal = modalEl.value
  const rect = modal.getBoundingClientRect()
  const pad = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  let x = props.anchor.x + 8
  let y = props.anchor.y + 8

  // Prefer right side of click, fall back to left if overflows
  if (x + rect.width + pad > vw) {
    x = props.anchor.x - rect.width - 8
  }
  // Clamp horizontal
  x = Math.max(pad, Math.min(x, vw - rect.width - pad))

  // Prefer below click, fall back to above if overflows
  if (y + rect.height + pad > vh) {
    y = props.anchor.y - rect.height - 8
  }
  // Clamp vertical
  y = Math.max(pad, Math.min(y, vh - rect.height - pad))

  position.value = { top: `${y}px`, left: `${x}px` }
  useTransformCenter.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  if (props.anchor) {
    nextTick(clampPosition)
  }
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="vc-event-modal__overlay" @click="emit('close')" />
  <div
    ref="modalEl"
    class="vc-event-modal"
    :class="{ 'vc-event-modal--centered': useTransformCenter }"
    :style="{ top: position.top, left: position.left }"
    role="dialog"
    aria-modal="true"
  >
    <button class="vc-event-modal__close" aria-label="Close" @click="emit('close')">&times;</button>
    <div class="vc-event-modal__title">{{ event.title }}</div>
    <div class="vc-event-modal__detail">{{ timeLabel }}</div>
    <div v-if="event.location" class="vc-event-modal__detail">{{ event.location }}</div>
    <div v-if="event.description" class="vc-event-modal__detail">
      {{ event.description }}
    </div>
    <div v-if="event.people?.length" class="vc-event-modal__detail">
      {{ event.people.join(', ') }}
    </div>
  </div>
</template>

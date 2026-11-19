<template>
  <div class="savings-gauge">
    <div class="gauge-arc-wrapper">
      <svg viewBox="0 0 100 60" class="gauge-svg">
        <!-- Background Track -->
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          class="gauge-bg"
        />
        <!-- Active Progress Track -->
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          class="gauge-progress"
          :stroke="gaugeColor"
          :stroke-dasharray="`${progressLength} 126`"
        />
      </svg>
      <div class="gauge-center-info">
        <span class="rate-number" :style="{ color: gaugeColor }">{{ rate.toFixed(1) }}%</span>
        <span class="rate-status">{{ statusText }}</span>
      </div>
    </div>
    <div class="gauge-target">
      <span>Mục tiêu an toàn: &gt; 20%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rate: number // 0 to 100
}

const props = defineProps<Props>()

// Total length of semicircle radius 40 is PI * 40 ~= 125.66
const progressLength = computed(() => {
  const clamped = Math.max(0, Math.min(100, props.rate))
  return (clamped / 100) * 125.66
})

const gaugeColor = computed(() => {
  if (props.rate >= 50) return '#10B981' // Excellent green
  if (props.rate >= 20) return '#3B82F6' // Good blue
  if (props.rate >= 0) return '#F59E0B' // Warning orange
  return '#EF4444' // Negative red
})

const statusText = computed(() => {
  if (props.rate >= 50) return 'Tuyệt vời'
  if (props.rate >= 20) return 'Đạt mục tiêu'
  if (props.rate >= 0) return 'Cần cải thiện'
  return 'Thâm hụt ngân sách'
})
</script>

<style scoped lang="scss">
.savings-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;

  .gauge-arc-wrapper {
    position: relative;
    width: 180px;
    height: 105px;
  }

  .gauge-svg {
    width: 100%;
    height: 100%;
  }

  .gauge-bg {
    fill: none;
    stroke: var(--app-card-border);
    stroke-width: 10;
    stroke-linecap: round;
  }

  .gauge-progress {
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dasharray 0.6s ease, stroke 0.3s ease;
  }

  .gauge-center-info {
    position: absolute;
    bottom: 5px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .rate-number {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .rate-status {
      font-size: 0.75rem;
      color: var(--app-text-muted);
      margin-top: 4px;
      font-weight: 500;
    }
  }

  .gauge-target {
    font-size: 0.75rem;
    color: var(--app-text-muted);
    margin-top: 6px;
  }
}
</style>

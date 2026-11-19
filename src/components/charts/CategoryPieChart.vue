<template>
  <div class="category-pie-chart">
    <div v-if="!data || data.length === 0" class="empty-chart">
      <el-empty description="Chưa có dữ liệu chi tiêu" :image-size="80" />
    </div>

    <div v-else class="chart-content">
      <!-- Donut SVG -->
      <div class="donut-wrapper">
        <svg viewBox="0 0 100 100" class="donut-svg">
          <circle
            cx="50"
            cy="50"
            r="38"
            class="donut-bg"
          />
          <circle
            v-for="(slice, idx) in slices"
            :key="idx"
            cx="50"
            cy="50"
            r="38"
            class="donut-segment"
            :stroke="slice.color"
            :stroke-dasharray="`${slice.dashLength} ${100 * Math.PI * 0.76 - slice.dashLength}`"
            :stroke-dashoffset="slice.dashOffset"
            @mouseenter="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
          />
        </svg>
        <div class="donut-center">
          <span class="center-label">Tổng chi</span>
          <strong class="center-value">{{ formatCompactCurrency(totalExpense) }}</strong>
        </div>
      </div>

      <!-- Categories Legend -->
      <div class="chart-legend">
        <div
          v-for="(item, idx) in sortedData"
          :key="idx"
          class="legend-item"
          :class="{ 'is-hovered': hoveredIndex === idx }"
          @mouseenter="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        >
          <div class="legend-info">
            <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-name">{{ item.name }}</span>
          </div>
          <div class="legend-values">
            <span class="legend-percentage">{{ calcPercentage(item.amount) }}%</span>
            <span class="legend-amount">{{ formatCompactCurrency(item.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CategoryExpenseDataPoint } from '@/types/dashboard'
import { formatCompactCurrency } from '@/utils/currency'

interface Props {
  data: CategoryExpenseDataPoint[]
}

const props = defineProps<Props>()
const hoveredIndex = ref<number | null>(null)

const sortedData = computed(() => {
  return [...props.data].sort((a, b) => b.amount - a.amount)
})

const totalExpense = computed(() => {
  return sortedData.value.reduce((sum, item) => sum + item.amount, 0)
})

function calcPercentage(amount: number) {
  if (totalExpense.value === 0) return '0'
  return ((amount / totalExpense.value) * 100).toFixed(1)
}

// Circumference of radius 38 is ~ 238.76
const circumference = 2 * Math.PI * 38

const slices = computed(() => {
  let accumulated = 0
  return sortedData.value.map(item => {
    const ratio = totalExpense.value > 0 ? item.amount / totalExpense.value : 0
    const dashLength = ratio * circumference
    const dashOffset = -accumulated
    accumulated += dashLength
    return {
      name: item.name,
      color: item.color,
      dashLength,
      dashOffset
    }
  })
})
</script>

<style scoped lang="scss">
.category-pie-chart {
  width: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;

  .empty-chart {
    width: 100%;
    padding: 20px 0;
  }

  .chart-content {
    display: flex;
    align-items: center;
    gap: 24px;
    width: 100%;

    @media (max-width: 640px) {
      flex-direction: column;
      gap: 16px;
    }
  }

  .donut-wrapper {
    position: relative;
    width: 160px;
    height: 160px;
    flex-shrink: 0;
    margin: 0 auto;
  }

  .donut-svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .donut-bg {
    fill: none;
    stroke: var(--app-card-border);
    stroke-width: 14;
  }

  .donut-segment {
    fill: none;
    stroke-width: 14;
    cursor: pointer;
    transition: stroke-width 0.2s, filter 0.2s;

    &:hover {
      stroke-width: 17;
      filter: brightness(1.15);
    }
  }

  .donut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    display: flex;
    flex-direction: column;

    .center-label {
      font-size: 0.75rem;
      color: var(--app-text-muted);
    }

    .center-value {
      font-size: 0.9375rem;
      color: var(--app-text);
      font-weight: 700;
    }
  }

  .chart-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 220px;
    overflow-y: auto;
    width: 100%;

    .legend-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background-color 0.2s;

      &.is-hovered {
        background-color: var(--el-table-header-bg-color);
      }

      .legend-info {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex-shrink: 0;
      }

      .legend-name {
        color: var(--app-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .legend-values {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;

        .legend-percentage {
          color: var(--app-text-muted);
          font-weight: 600;
          font-size: 0.75rem;
        }

        .legend-amount {
          color: var(--app-text);
          font-weight: 600;
        }
      }
    }
  }
}
</style>

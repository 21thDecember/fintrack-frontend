<template>
  <div class="income-expense-chart">
    <div class="chart-header">
      <div class="chart-legend">
        <span class="legend-item">
          <span class="dot income"></span>
          Thu nhập
        </span>
        <span class="legend-item">
          <span class="dot expense"></span>
          Chi tiêu
        </span>
      </div>
    </div>

    <!-- Empty state when no transactions -->
    <div v-if="!hasData" class="empty-chart">
      <el-empty description="Chưa có dữ liệu thu chi trong kỳ" :image-size="70" />
    </div>

    <!-- Bars container when data exists -->
    <div v-else class="bars-container" ref="containerRef">
      <div v-for="(item, idx) in data" :key="idx" class="bar-group" @mouseenter="hoveredIndex = idx" @mouseleave="hoveredIndex = null">
        <!-- Bars -->
        <div class="bars-track">
          <!-- Income Bar -->
          <div
            class="bar income-bar"
            :style="{ height: `${calcHeight(item.income)}%` }"
          ></div>
          <!-- Expense Bar -->
          <div
            class="bar expense-bar"
            :style="{ height: `${calcHeight(item.expense)}%` }"
          ></div>
        </div>

        <!-- Label -->
        <div class="bar-label">{{ item.label }}</div>

        <!-- Tooltip -->
        <div v-if="hoveredIndex === idx" class="chart-tooltip">
          <div class="tooltip-title">{{ item.label }}</div>
          <div class="tooltip-row text-income">
            <span>Thu:</span>
            <strong>{{ formatCurrency(item.income) }}</strong>
          </div>
          <div class="tooltip-row text-expense">
            <span>Chi:</span>
            <strong>{{ formatCurrency(item.expense) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IncomeExpenseDataPoint } from '@/types/dashboard'
import { formatCurrency } from '@/utils/currency'

interface Props {
  data: IncomeExpenseDataPoint[]
}

const props = defineProps<Props>()
const hoveredIndex = ref<number | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const hasData = computed(() => {
  return props.data && props.data.length > 0 && props.data.some(d => (d.income || 0) > 0 || (d.expense || 0) > 0)
})

const maxVal = computed(() => {
  let m = 0
  props.data.forEach(d => {
    if (d.income > m) m = d.income
    if (d.expense > m) m = d.expense
  })
  return m === 0 ? 1000000 : m * 1.15
})

function calcHeight(val: number) {
  if (!val || val <= 0) return 3
  return Math.max(4, Math.min(100, (val / maxVal.value) * 100))
}
</script>

<style scoped lang="scss">
.income-expense-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 260px;
  position: relative;

  .empty-chart {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
  }

  .chart-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .chart-legend {
    display: flex;
    gap: 16px;
    font-size: 0.8125rem;
    color: var(--app-text-muted);

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;

        &.income {
          background-color: #10B981;
        }

        &.expense {
          background-color: #EF4444;
        }
      }
    }
  }

  .bars-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex: 1;
    gap: 8px;
    padding-bottom: 24px;
    position: relative;
    border-bottom: 1px dashed var(--app-card-border);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
  }

  .bar-group {
    flex: 1;
    min-width: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    position: relative;
    cursor: pointer;

    &:hover {
      .bar {
        filter: brightness(1.1);
      }
    }
  }

  .bars-track {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 4px;
    width: 100%;
    height: calc(100% - 20px);
  }

  .bar {
    width: 38%;
    max-width: 16px;
    border-radius: 4px 4px 0 0;
    transition: height 0.4s ease, filter 0.2s;

    &.income-bar {
      background: linear-gradient(180deg, #34D399 0%, #10B981 100%);
    }

    &.expense-bar {
      background: linear-gradient(180deg, #F87171 0%, #EF4444 100%);
    }
  }

  .bar-label {
    position: absolute;
    bottom: -22px;
    font-size: 0.75rem;
    color: var(--app-text-muted);
    font-weight: 500;
  }

  .chart-tooltip {
    position: absolute;
    top: -65px;
    background: rgba(15, 23, 42, 0.95);
    color: #FFFFFF;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;

    .tooltip-title {
      font-weight: 700;
      margin-bottom: 2px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 2px;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
  }
}
</style>

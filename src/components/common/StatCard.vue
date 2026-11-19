<template>
  <el-card class="stat-card" :body-style="{ padding: '20px' }" shadow="hover">
    <div class="stat-card-content">
      <div class="stat-info">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-value-row">
          <span class="stat-value" :class="valueClass">
            {{ displayValue }}
          </span>
        </div>
        <div v-if="subtitle || trend !== undefined" class="stat-footer">
          <TrendBadge v-if="trend !== undefined" :value="trend" />
          <span v-if="subtitle" class="stat-subtitle">{{ subtitle }}</span>
        </div>
      </div>
      <div v-if="icon || $slots.icon" class="stat-icon-wrapper" :style="{ backgroundColor: iconBg || 'rgba(16, 185, 129, 0.12)' }">
        <slot name="icon">
          <el-icon :size="24" :style="{ color: iconColor || '#10B981' }">
            <component :is="icon" />
          </el-icon>
        </slot>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import TrendBadge from './TrendBadge.vue'

interface Props {
  title: string
  value: number | string
  isCurrency?: boolean
  subtitle?: string
  icon?: any
  iconBg?: string
  iconColor?: string
  trend?: number
  valueClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  isCurrency: true
})

const displayValue = computed(() => {
  if (typeof props.value === 'number' && props.isCurrency) {
    return formatCurrency(props.value)
  }
  return props.value
})
</script>

<style scoped lang="scss">
.stat-card {
  height: 100%;

  .stat-card-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .stat-title {
    font-size: 0.875rem;
    color: var(--app-text-muted);
    font-weight: 500;
    margin-bottom: 6px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.25;
    color: var(--app-text);
    word-break: break-all;

    @media (max-width: 640px) {
      font-size: 1.25rem;
    }
  }

  .stat-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 0.75rem;
  }

  .stat-subtitle {
    color: var(--app-text-muted);
  }

  .stat-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    flex-shrink: 0;
  }
}
</style>

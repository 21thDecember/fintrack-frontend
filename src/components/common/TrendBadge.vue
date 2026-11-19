<template>
  <span
    class="trend-badge"
    :class="{
      'trend-up': isPositive,
      'trend-down': isNegative,
      'trend-neutral': isNeutral
    }"
  >
    <el-icon :size="12">
      <Top v-if="isPositive" />
      <Bottom v-else-if="isNegative" />
      <Minus v-else />
    </el-icon>
    <span>{{ formattedValue }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Top, Bottom, Minus } from '@element-plus/icons-vue'

interface Props {
  value: number
  suffix?: string
  invertColors?: boolean // e.g. for expense increase = red
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '%',
  invertColors: false
})

const isPositive = computed(() => (props.invertColors ? props.value < 0 : props.value > 0))
const isNegative = computed(() => (props.invertColors ? props.value > 0 : props.value < 0))
const isNeutral = computed(() => props.value === 0)

const formattedValue = computed(() => {
  const abs = Math.abs(props.value)
  return `${abs.toFixed(1)}${props.suffix}`
})
</script>

<style scoped lang="scss">
.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;

  &.trend-up {
    color: #10B981;
    background-color: rgba(16, 185, 129, 0.12);
  }

  &.trend-down {
    color: #EF4444;
    background-color: rgba(239, 68, 68, 0.12);
  }

  &.trend-neutral {
    color: #64748B;
    background-color: rgba(100, 116, 139, 0.12);
  }
}
</style>

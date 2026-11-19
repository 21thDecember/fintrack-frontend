<template>
  <span
    class="amount-display"
    :class="[
      `size-${size}`,
      {
        'is-income': direction === 'IN' || isPositive,
        'is-expense': direction === 'OUT' || isNegative,
        'is-neutral': direction === 'NONE' || (!direction && !isPositive && !isNegative)
      }
    ]"
  >
    <span v-if="showSign && direction === 'IN'">+</span>
    <span v-else-if="showSign && direction === 'OUT'">-</span>
    {{ formattedAmount }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import type { TransactionDirection } from '@/types/transaction'

interface Props {
  amount: number
  direction?: TransactionDirection
  showSign?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'NONE',
  showSign: true,
  size: 'md'
})

const isPositive = computed(() => props.direction === 'NONE' && props.amount > 0)
const isNegative = computed(() => props.direction === 'NONE' && props.amount < 0)

const formattedAmount = computed(() => {
  return formatCurrency(Math.abs(props.amount))
})
</script>

<style scoped lang="scss">
.amount-display {
  font-family: var(--el-font-family);
  font-weight: 600;
  white-space: nowrap;

  &.is-income {
    color: #10B981;
  }

  &.is-expense {
    color: #EF4444;
  }

  &.is-neutral {
    color: var(--app-text);
  }

  &.size-sm {
    font-size: 0.875rem;
  }

  &.size-md {
    font-size: 1rem;
  }

  &.size-lg {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &.size-xl {
    font-size: 1.75rem;
    font-weight: 800;
  }
}
</style>

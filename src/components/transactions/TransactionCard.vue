<template>
  <div class="transaction-card" @click="$emit('click', transaction)">
    <div class="card-left">
      <div
        class="category-icon-box"
        :style="{
          backgroundColor: transaction.category?.color ? `${transaction.category.color}20` : '#F1F5F9',
          color: transaction.category?.color || '#64748B'
        }"
      >
        <span class="icon-text">{{ getCategoryInitials(transaction.category?.name) }}</span>
      </div>

      <div class="details">
        <div class="title-row">
          <span class="description">{{ transaction.description || transaction.originalDescription || 'Giao dịch' }}</span>
          <el-tag
            v-if="transaction.classificationStatus === 'UNCLASSIFIED'"
            size="small"
            type="warning"
            effect="plain"
          >
            Chưa phân loại
          </el-tag>
        </div>

        <div class="sub-info">
          <span class="date">{{ formatDateTime(transaction.transactionDate) }}</span>
          <span class="bullet">•</span>
          <span class="account-name">{{ transaction.account?.name || 'Tài khoản' }}</span>
          <span v-if="transaction.category?.name" class="bullet">•</span>
          <span v-if="transaction.category?.name" class="cat-name">{{ transaction.category.name }}</span>
          <span v-if="transaction.personName" class="bullet">•</span>
          <span v-if="transaction.personName" class="person-tag">👤 {{ transaction.personName }}</span>
          <span v-if="transaction.allocations && transaction.allocations.length > 0" class="bullet">•</span>
          <span v-if="transaction.allocations && transaction.allocations.length > 0" class="split-tag">⚡ Chia {{ transaction.allocations.length }} người</span>
        </div>
      </div>
    </div>

    <div class="card-right">
      <AmountDisplay
        :amount="transaction.amount"
        :direction="transaction.direction"
        size="md"
      />
      <span class="type-tag" :class="`type-${transaction.type.toLowerCase()}`">
        {{ getTransactionTypeLabel(transaction.type) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types/transaction'
import { formatDateTime } from '@/utils/date'
import { getTransactionTypeLabel } from '@/utils/constants'
import AmountDisplay from '@/components/common/AmountDisplay.vue'

interface Props {
  transaction: Transaction
}

defineProps<Props>()
defineEmits<{
  (e: 'click', tx: Transaction): void
}>()

function getCategoryInitials(name?: string) {
  if (!name) return '💰'
  return name.slice(0, 2).toUpperCase()
}
</script>

<style scoped lang="scss">
.transaction-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: var(--app-card-bg);
  border: 1px solid var(--app-card-border);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.99);
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .category-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8125rem;
    flex-shrink: 0;
  }

  .details {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 2px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 6px;

    .description {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--app-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .sub-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--app-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .bullet {
      opacity: 0.6;
    }

    .person-tag {
      color: #059669;
      font-weight: 500;
    }

    .split-tag {
      color: #d97706;
      font-weight: 500;
    }
  }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
    margin-left: 10px;

    .type-tag {
      font-size: 0.6875rem;
      color: var(--app-text-muted);
    }
  }
}
</style>

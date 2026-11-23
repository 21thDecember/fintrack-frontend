<template>
  <div class="learning-header-container">
    <!-- Top Row: Page Title + LifeOS Tag & Primary Action -->
    <div class="header-main-row">
      <div class="title-meta">
        <h1 class="page-title">
          <span>{{ title }}</span>
          <span v-if="badge" class="lifeos-badge">{{ badge }}</span>
        </h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>

      <div class="header-action-slot">
        <slot name="action" />
      </div>
    </div>

    <!-- Modern Segmented Navigation Bar -->
    <div class="segmented-nav-wrapper">
      <div class="segmented-nav">
        <router-link
          v-for="item in navTabs"
          :key="item.path"
          :to="item.path"
          class="nav-tab-item"
          :class="{ active: currentTab === item.key }"
        >
          <el-icon class="tab-icon"><component :is="item.icon" /></el-icon>
          <span class="tab-label">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataAnalysis,
  VideoPlay,
  Reading,
  Aim,
  Timer,
  Notebook
} from '@element-plus/icons-vue'

interface Props {
  title: string
  subtitle?: string
  badge?: string
  activeTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  badge: 'LifeOS',
  subtitle: ''
})

const route = useRoute()

const currentTab = computed(() => {
  if (props.activeTab) return props.activeTab
  const path = route.path
  if (path.includes('/courses')) return 'courses'
  if (path.includes('/books')) return 'books'
  if (path.includes('/skills')) return 'skills'
  if (path.includes('/sessions')) return 'sessions'
  if (path.includes('/notes')) return 'notes'
  return 'overview'
})

const navTabs = [
  { key: 'overview', path: '/learning/overview', label: 'Tổng quan', icon: DataAnalysis },
  { key: 'courses', path: '/learning/courses', label: 'Khóa học', icon: VideoPlay },
  { key: 'books', path: '/learning/books', label: 'Tủ sách', icon: Reading },
  { key: 'skills', path: '/learning/skills', label: 'Kỹ năng', icon: Aim },
  { key: 'sessions', path: '/learning/sessions', label: 'Lịch sử học', icon: Timer },
  { key: 'notes', path: '/learning/notes', label: 'Sổ tay ghi chú', icon: Notebook }
]
</script>

<style scoped lang="scss">
.learning-header-container {
  margin-bottom: 24px;
}

.header-main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;

  .title-meta {
    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 6px 0;

      .lifeos-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 10px;
        border-radius: 999px;
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
        border: 1px solid rgba(59, 130, 246, 0.2);
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
    }

    .page-subtitle {
      font-size: 13.5px;
      color: var(--app-text-muted, #64748b);
      margin: 0;
      line-height: 1.4;
    }
  }

  .header-action-slot {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.segmented-nav-wrapper {
  overflow-x: auto;
  max-width: 100%;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .segmented-nav {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--app-bg-secondary, #f1f5f9);
    padding: 5px;
    border-radius: 12px;
    border: 1px solid var(--app-card-border, #e2e8f0);

    .nav-tab-item {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--app-text-muted, #64748b);
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      .tab-icon {
        font-size: 15px;
      }

      &:hover {
        color: var(--app-text, #1e293b);
      }

      &.active {
        background: var(--app-card-bg, #ffffff);
        color: #2563eb;
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
      }
    }
  }
}

@media (max-width: 768px) {
  .learning-header-container {
    margin-bottom: 16px;
  }

  .header-main-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .header-action-slot {
      width: 100%;

      :deep(.el-button) {
        width: 100%;
      }
    }
  }

  .segmented-nav-wrapper {
    margin-left: -4px;
    margin-right: -4px;
    padding-left: 4px;
    padding-right: 4px;

    .segmented-nav {
      width: max-content;

      .nav-tab-item {
        padding: 6px 12px;
        font-size: 13px;
      }
    }
  }
}
</style>

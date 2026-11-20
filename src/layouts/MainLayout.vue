<template>
  <div class="app-layout" :class="{ 'is-mobile': isMobile, 'is-collapsed': isCollapsed }">
    <!-- Desktop & Tablet Sidebar -->
    <aside v-if="!isMobile" class="app-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="brand">
          <span class="brand-logo">✨</span>
          <span v-if="!isCollapsed" class="brand-name">LifeOS</span>
        </div>
        <el-button
          text
          class="collapse-btn"
          @click="isCollapsed = !isCollapsed"
        >
          <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
        </el-button>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'router-link-active': isRouteActive(item.path) }"
          :title="isCollapsed ? item.label : undefined"
        >
          <el-icon :size="20" class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
          <el-badge
            v-if="!isCollapsed && item.path === '/transactions' && unclassifiedCount > 0"
            :value="unclassifiedCount"
            class="nav-badge"
            type="warning"
          />
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div v-if="!isCollapsed" class="user-info">
          <el-avatar :size="32" class="user-avatar">
            {{ (authStore.user?.fullName || authStore.user?.username || 'U')[0].toUpperCase() }}
          </el-avatar>
          <div class="user-text">
            <span class="user-name">{{ authStore.user?.fullName || 'Người dùng' }}</span>
            <span class="user-role">{{ authStore.user?.username }}</span>
          </div>
        </div>
        <div class="footer-actions">
          <el-button
            circle
            size="small"
            :title="isDark ? 'Chuyển sang Giao diện sáng' : 'Chuyển sang Giao diện tối'"
            @click="toggleDark"
          >
            <el-icon><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
          </el-button>
          <el-button
            circle
            size="small"
            type="danger"
            plain
            title="Đăng xuất"
            @click="handleLogout"
          >
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="app-main">
      <!-- Top Header -->
      <header class="app-header">
        <div class="header-left">
          <div v-if="isMobile" class="mobile-brand">
            <span class="brand-logo">💰</span>
            <span class="brand-name">FinTrack VN</span>
          </div>
          <h2 v-else class="page-title">{{ currentRouteTitle }}</h2>
        </div>

        <div class="header-right">
          <!-- Unclassified Transactions Indicator -->
          <router-link
            v-if="unclassifiedCount > 0"
            to="/transactions?status=UNCLASSIFIED"
            class="unclassified-indicator"
          >
            <el-badge :value="unclassifiedCount" type="warning">
              <el-button size="small" type="warning" plain round>
                <el-icon><Bell /></el-icon>
                <span v-if="!isMobile">Chưa phân loại</span>
              </el-button>
            </el-badge>
          </router-link>

          <!-- Quick Action Button -->
          <router-link v-if="route.path !== '/transactions/create'" to="/transactions/create">
            <el-button type="primary" :icon="Plus" round>
              <span v-if="!isMobile">Thêm giao dịch</span>
            </el-button>
          </router-link>

          <!-- Mobile Theme Toggle -->
          <el-button
            v-if="isMobile"
            circle
            size="small"
            @click="toggleDark"
          >
            <el-icon><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
          </el-button>
        </div>
      </header>

      <!-- Page View -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Mobile Bottom Navigation Bar (5 Tabs) -->
    <nav v-if="isMobile" class="mobile-bottom-nav">
      <router-link to="/dashboard" class="bottom-nav-item">
        <el-icon :size="22"><Odometer /></el-icon>
        <span>Tổng quan</span>
      </router-link>

      <router-link to="/transactions" class="bottom-nav-item">
        <el-badge :value="unclassifiedCount" :hidden="unclassifiedCount === 0" type="warning">
          <el-icon :size="22"><Tickets /></el-icon>
        </el-badge>
        <span>Giao dịch</span>
      </router-link>

      <!-- Center Floating Plus -->
      <router-link to="/transactions/create" class="bottom-nav-fab">
        <div class="fab-circle">
          <el-icon :size="24"><Plus /></el-icon>
        </div>
      </router-link>

      <router-link to="/debts" class="bottom-nav-item">
        <el-icon :size="22"><Money /></el-icon>
        <span>Công nợ</span>
      </router-link>

      <router-link to="/reports" class="bottom-nav-item">
        <el-icon :size="22"><DataAnalysis /></el-icon>
        <span>Báo cáo</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  Checked,
  Timer,
  Trophy,
  Tickets,
  Money,
  DataAnalysis,
  Wallet,
  Menu,
  Setting,
  Plus,
  Bell,
  Fold,
  Expand,
  Moon,
  Sunny,
  SwitchButton
} from '@element-plus/icons-vue'
import { useResponsive } from '@/composables/useResponsive'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transaction'

const route = useRoute()
const { isMobile, isTablet } = useResponsive()
const { isDark, toggleDark } = useTheme()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const isCollapsed = ref(isTablet.value)

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Odometer },
  { path: '/tasks', label: 'Công việc', icon: Checked },
  { path: '/habits', label: 'Thói quen', icon: Timer },
  { path: '/goals', label: 'Mục tiêu', icon: Trophy },
  { path: '/transactions', label: 'Giao dịch', icon: Tickets },
  { path: '/debts', label: 'Sổ nợ / Công nợ', icon: Money },
  { path: '/reports', label: 'Báo cáo', icon: DataAnalysis },
  { path: '/accounts', label: 'Tài khoản', icon: Wallet },
  { path: '/categories', label: 'Danh mục', icon: Menu },
  { path: '/settings', label: 'Cài đặt', icon: Setting }
]

const currentRouteTitle = computed(() => {
  return (route.meta?.title as string) || 'Quản Lý Tài Chính'
})

const unclassifiedCount = computed(() => {
  return transactionStore.transactions.filter(t => t.classificationStatus === 'UNCLASSIFIED').length
})

function isRouteActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  return route.path.startsWith(path)
}

function handleLogout() {
  authStore.logout()
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--app-bg);
}

// Sidebar
.app-sidebar {
  width: 240px;
  background-color: var(--app-sidebar-bg);
  border-right: 1px solid var(--app-sidebar-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-collapsed {
    width: 72px;

    .sidebar-header {
      justify-content: center;
      padding: 16px 8px;
    }

    .nav-link {
      justify-content: center;
      padding: 12px;
    }

    .sidebar-footer {
      justify-content: center;
      padding: 12px 8px;
    }
  }

  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--app-sidebar-border);

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;

      .brand-logo {
        font-size: 1.5rem;
      }

      .brand-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--app-text);
        letter-spacing: -0.02em;
        white-space: nowrap;
      }
    }
  }

  .sidebar-menu {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      color: var(--app-text-muted);
      font-weight: 500;
      font-size: 0.9375rem;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background-color: var(--el-table-header-bg-color);
        color: var(--app-text);
      }

      &.router-link-active {
        background-color: rgba(16, 185, 129, 0.12);
        color: #10B981;
        font-weight: 600;

        .nav-icon {
          color: #10B981;
        }
      }

      .nav-badge {
        margin-left: auto;
      }
    }
  }

  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid var(--app-sidebar-border);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;

      .user-avatar {
        background: #10B981;
        color: #FFFFFF;
        font-weight: 700;
      }

      .user-text {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
      }
    }

    .footer-actions {
      display: flex;
      gap: 6px;
    }
  }
}

// Main Content
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  min-height: 100vh;
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .app-layout.is-collapsed & {
    margin-left: 72px;
  }

  .app-layout.is-mobile & {
    margin-left: 0;
    padding-bottom: 70px; // space for bottom nav
  }

  .app-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background-color: var(--app-card-bg);
    border-bottom: 1px solid var(--app-card-border);
    position: sticky;
    top: 0;
    z-index: 40;

    @media (max-width: 640px) {
      padding: 0 16px;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--app-text);
    }

    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 8px;

      .brand-logo {
        font-size: 1.25rem;
      }

      .brand-name {
        font-size: 1rem;
        font-weight: 700;
        color: var(--app-text);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .page-content {
    flex: 1;
    padding: 24px;

    @media (max-width: 640px) {
      padding: 16px;
    }
  }
}

// Mobile Bottom Navigation Bar
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--app-card-bg);
  border-top: 1px solid var(--app-card-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--app-text-muted);
    font-size: 0.6875rem;
    gap: 3px;
    flex: 1;
    height: 100%;
    transition: color 0.2s;

    &.router-link-active {
      color: #10B981;
      font-weight: 600;
    }
  }

  .bottom-nav-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    top: -14px;
    z-index: 101;

    .fab-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #10B981;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

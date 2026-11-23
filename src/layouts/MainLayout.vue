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

      <!-- Navigation Menu: Parent & Submenu Structure -->
      <nav class="sidebar-menu">
        <!-- Dashboard Standalone Item -->
        <router-link
          to="/dashboard"
          class="nav-link"
          :class="{ 'router-link-active': isRouteActive('/dashboard') }"
          :title="isCollapsed ? 'Dashboard' : undefined"
        >
          <el-icon :size="20" class="nav-icon"><Odometer /></el-icon>
          <span v-if="!isCollapsed" class="nav-label">Dashboard</span>
        </router-link>

        <!-- Module 1: LifeOS (Quản lý cá nhân) -->
        <div class="nav-group" :class="{ 'is-open': openGroups.lifeos, 'is-active': isGroupActive('lifeos') }">
          <el-popover
            :disabled="!isCollapsed"
            placement="right"
            :width="190"
            trigger="hover"
            popper-class="sidebar-flyout-popper"
          >
            <template #reference>
              <button
                type="button"
                class="nav-parent-btn"
                :class="{ 'is-active': isGroupActive('lifeos') }"
                @click="toggleGroup('lifeos')"
                :title="isCollapsed ? 'LifeOS (Cá nhân)' : undefined"
              >
                <div class="parent-left">
                  <el-icon :size="20" class="nav-icon"><Compass /></el-icon>
                  <span v-if="!isCollapsed" class="nav-label">LifeOS</span>
                </div>
                <div v-if="!isCollapsed" class="parent-right">
                  <span class="module-tag lifeos-tag">Cá nhân</span>
                  <el-icon class="arrow-icon" :class="{ rotated: openGroups.lifeos }">
                    <ArrowDown />
                  </el-icon>
                </div>
              </button>
            </template>

            <!-- Flyout for Collapsed Sidebar -->
            <div class="popover-nav-list">
              <div class="popover-header">✨ LifeOS (Cá nhân)</div>
              <router-link
                v-for="sub in lifeosItems"
                :key="sub.path"
                :to="sub.path"
                class="popover-sub-link"
                :class="{ active: isRouteActive(sub.path) }"
              >
                <el-icon :size="16"><component :is="sub.icon" /></el-icon>
                <span>{{ sub.label }}</span>
              </router-link>
            </div>
          </el-popover>

          <!-- Submenu when Expanded -->
          <transition name="submenu-slide">
            <div v-if="!isCollapsed && openGroups.lifeos" class="submenu-list">
              <router-link
                v-for="sub in lifeosItems"
                :key="sub.path"
                :to="sub.path"
                class="nav-sub-link"
                :class="{ 'router-link-active': isRouteActive(sub.path) }"
              >
                <el-icon :size="16" class="sub-icon"><component :is="sub.icon" /></el-icon>
                <span class="sub-label">{{ sub.label }}</span>
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Module 2: Quản lý Tài chính -->
        <div class="nav-group" :class="{ 'is-open': openGroups.finance, 'is-active': isGroupActive('finance') }">
          <el-popover
            :disabled="!isCollapsed"
            placement="right"
            :width="200"
            trigger="hover"
            popper-class="sidebar-flyout-popper"
          >
            <template #reference>
              <button
                type="button"
                class="nav-parent-btn"
                :class="{ 'is-active': isGroupActive('finance') }"
                @click="toggleGroup('finance')"
                :title="isCollapsed ? 'Quản lý Tài chính' : undefined"
              >
                <div class="parent-left">
                  <el-icon :size="20" class="nav-icon"><Wallet /></el-icon>
                  <span v-if="!isCollapsed" class="nav-label">Tài chính</span>
                </div>
                <div v-if="!isCollapsed" class="parent-right">
                  <el-badge
                    v-if="!openGroups.finance && unclassifiedCount > 0"
                    :value="unclassifiedCount"
                    type="warning"
                    class="group-badge"
                  />
                  <span class="module-tag finance-tag">Tiền tệ</span>
                  <el-icon class="arrow-icon" :class="{ rotated: openGroups.finance }">
                    <ArrowDown />
                  </el-icon>
                </div>
              </button>
            </template>

            <!-- Flyout for Collapsed Sidebar -->
            <div class="popover-nav-list">
              <div class="popover-header">💰 Quản lý Tài chính</div>
              <router-link
                v-for="sub in financeItems"
                :key="sub.path"
                :to="sub.path"
                class="popover-sub-link"
                :class="{ active: isRouteActive(sub.path) }"
              >
                <el-icon :size="16"><component :is="sub.icon" /></el-icon>
                <span>{{ sub.label }}</span>
                <el-badge
                  v-if="sub.path === '/transactions' && unclassifiedCount > 0"
                  :value="unclassifiedCount"
                  type="warning"
                  class="popover-badge"
                />
              </router-link>
            </div>
          </el-popover>

          <!-- Submenu when Expanded -->
          <transition name="submenu-slide">
            <div v-if="!isCollapsed && openGroups.finance" class="submenu-list">
              <router-link
                v-for="sub in financeItems"
                :key="sub.path"
                :to="sub.path"
                class="nav-sub-link"
                :class="{ 'router-link-active': isRouteActive(sub.path) }"
              >
                <el-icon :size="16" class="sub-icon"><component :is="sub.icon" /></el-icon>
                <span class="sub-label">{{ sub.label }}</span>
                <el-badge
                  v-if="sub.path === '/transactions' && unclassifiedCount > 0"
                  :value="unclassifiedCount"
                  class="nav-badge"
                  type="warning"
                />
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Settings Standalone Item -->
        <router-link
          to="/settings"
          class="nav-link"
          :class="{ 'router-link-active': isRouteActive('/settings') }"
          :title="isCollapsed ? 'Cài đặt' : undefined"
        >
          <el-icon :size="20" class="nav-icon"><Setting /></el-icon>
          <span v-if="!isCollapsed" class="nav-label">Cài đặt</span>
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
            <el-button
              text
              circle
              class="mobile-menu-trigger"
              @click="isMobileDrawerOpen = true"
            >
              <el-icon :size="20"><Menu /></el-icon>
            </el-button>
            <span class="brand-logo">✨</span>
            <span class="brand-name">LifeOS</span>
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

          <!-- Quick Action Button (Desktop & Tablet only, mobile uses bottom FAB) -->
          <router-link v-if="!isMobile && route.path !== '/transactions/create'" to="/transactions/create">
            <el-button type="primary" :icon="Plus" round>
              Thêm giao dịch
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

    <!-- Mobile Drawer Menu -->
    <el-drawer
      v-if="isMobile"
      v-model="isMobileDrawerOpen"
      direction="ltr"
      size="280px"
      :with-header="false"
      class="mobile-drawer-menu"
    >
      <div class="mobile-drawer-content">
        <div class="drawer-header">
          <div class="brand">
            <span class="brand-logo">✨</span>
            <span class="brand-name">LifeOS</span>
          </div>
          <el-button circle size="small" text @click="isMobileDrawerOpen = false">
            <el-icon :size="18"><Fold /></el-icon>
          </el-button>
        </div>

        <div class="drawer-nav">
          <!-- Dashboard -->
          <router-link
            to="/dashboard"
            class="drawer-link"
            :class="{ active: isRouteActive('/dashboard') }"
            @click="isMobileDrawerOpen = false"
          >
            <el-icon :size="18"><Odometer /></el-icon>
            <span>Dashboard</span>
          </router-link>

          <!-- LifeOS Section -->
          <div class="drawer-section">
            <div class="drawer-section-title">
              <span class="sec-left">
                <el-icon :size="16"><Compass /></el-icon>
                <span>LifeOS (Cá nhân)</span>
              </span>
              <span class="module-tag lifeos-tag">{{ lifeosItems.length }} mục</span>
            </div>
            <div class="drawer-sub-links">
              <router-link
                v-for="sub in lifeosItems"
                :key="sub.path"
                :to="sub.path"
                class="drawer-sub-link"
                :class="{ active: isRouteActive(sub.path) }"
                @click="isMobileDrawerOpen = false"
              >
                <el-icon :size="16"><component :is="sub.icon" /></el-icon>
                <span>{{ sub.label }}</span>
              </router-link>
            </div>
          </div>

          <!-- Finance Section -->
          <div class="drawer-section">
            <div class="drawer-section-title">
              <span class="sec-left">
                <el-icon :size="16"><Wallet /></el-icon>
                <span>Quản lý Tài chính</span>
              </span>
              <span class="module-tag finance-tag">5 mục</span>
            </div>
            <div class="drawer-sub-links">
              <router-link
                v-for="sub in financeItems"
                :key="sub.path"
                :to="sub.path"
                class="drawer-sub-link"
                :class="{ active: isRouteActive(sub.path) }"
                @click="isMobileDrawerOpen = false"
              >
                <el-icon :size="16"><component :is="sub.icon" /></el-icon>
                <span>{{ sub.label }}</span>
                <el-badge
                  v-if="sub.path === '/transactions' && unclassifiedCount > 0"
                  :value="unclassifiedCount"
                  type="warning"
                  class="ml-auto"
                />
              </router-link>
            </div>
          </div>

          <!-- Settings -->
          <router-link
            to="/settings"
            class="drawer-link"
            :class="{ active: isRouteActive('/settings') }"
            @click="isMobileDrawerOpen = false"
          >
            <el-icon :size="18"><Setting /></el-icon>
            <span>Cài đặt</span>
          </router-link>
        </div>

        <div class="drawer-footer">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ (authStore.user?.fullName || authStore.user?.username || 'U')[0].toUpperCase() }}
            </el-avatar>
            <div class="user-text">
              <span class="user-name">{{ authStore.user?.fullName || 'Người dùng' }}</span>
              <span class="user-role">{{ authStore.user?.username }}</span>
            </div>
          </div>
          <el-button circle size="small" type="danger" plain @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- Mobile Bottom Navigation Bar (5 Tabs) -->
    <nav v-if="isMobile" class="mobile-bottom-nav">
      <router-link to="/dashboard" class="bottom-nav-item">
        <el-icon :size="22"><Odometer /></el-icon>
        <span>Tổng quan</span>
      </router-link>

      <router-link to="/tasks" class="bottom-nav-item">
        <el-icon :size="22"><Checked /></el-icon>
        <span>Công việc</span>
      </router-link>

      <!-- Center Floating Plus -->
      <router-link to="/transactions/create" class="bottom-nav-fab">
        <div class="fab-circle">
          <el-icon :size="24"><Plus /></el-icon>
        </div>
      </router-link>

      <router-link to="/transactions" class="bottom-nav-item">
        <el-badge :value="unclassifiedCount" :hidden="unclassifiedCount === 0" type="warning">
          <el-icon :size="22"><Tickets /></el-icon>
        </el-badge>
        <span>Giao dịch</span>
      </router-link>

      <router-link to="/goals" class="bottom-nav-item">
        <el-icon :size="22"><Trophy /></el-icon>
        <span>Mục tiêu</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  Compass,
  Checked,
  Timer,
  Trophy,
  Wallet,
  Tickets,
  Money,
  DataAnalysis,
  CreditCard,
  Folder,
  Setting,
  Plus,
  Bell,
  Fold,
  Expand,
  Moon,
  Sunny,
  SwitchButton,
  ArrowDown,
  Menu,
  EditPen,
  Reading
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
const isMobileDrawerOpen = ref(false)

// Open / Closed state of Parent Menus
const openGroups = ref<Record<string, boolean>>({
  lifeos: true,
  finance: true
})

// Submenu Items for LifeOS Module
const lifeosItems = [
  { path: '/tasks', label: 'Công việc', icon: Checked },
  { path: '/habits', label: 'Thói quen', icon: Timer },
  { path: '/goals', label: 'Mục tiêu', icon: Trophy },
  { path: '/journals', label: 'Nhật ký & Review', icon: EditPen },
  { path: '/learning', label: 'Học tập & Kỹ năng', icon: Reading }
]

// Submenu Items for Finance Module
const financeItems = [
  { path: '/transactions', label: 'Giao dịch', icon: Tickets },
  { path: '/debts', label: 'Sổ nợ / Công nợ', icon: Money },
  { path: '/reports', label: 'Báo cáo', icon: DataAnalysis },
  { path: '/accounts', label: 'Tài khoản', icon: CreditCard },
  { path: '/categories', label: 'Danh mục', icon: Folder }
]

const currentRouteTitle = computed(() => {
  return (route.meta?.title as string) || 'LifeOS'
})

const unclassifiedCount = computed(() => {
  return transactionStore.transactions.filter(t => t.classificationStatus === 'UNCLASSIFIED').length
})

function toggleGroup(groupId: string) {
  if (isCollapsed.value) {
    isCollapsed.value = false
    openGroups.value[groupId] = true
    return
  }
  openGroups.value[groupId] = !openGroups.value[groupId]
}

function isGroupActive(groupId: string): boolean {
  if (groupId === 'lifeos') {
    return route.path.startsWith('/tasks') ||
           route.path.startsWith('/habits') ||
           route.path.startsWith('/goals') ||
           route.path.startsWith('/journals') ||
           route.path.startsWith('/learning')
  }
  if (groupId === 'finance') {
    return route.path.startsWith('/transactions') ||
           route.path.startsWith('/debts') ||
           route.path.startsWith('/reports') ||
           route.path.startsWith('/accounts') ||
           route.path.startsWith('/categories')
  }
  return false
}

function isRouteActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  return route.path.startsWith(path)
}

// Auto expand parent group if user visits a child route
watch(
  () => route.path,
  () => {
    if (isGroupActive('lifeos')) openGroups.value.lifeos = true
    if (isGroupActive('finance')) openGroups.value.finance = true
  },
  { immediate: true }
)

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

    .nav-link,
    .nav-parent-btn {
      justify-content: center;
      padding: 12px;

      .parent-left {
        justify-content: center;
      }
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
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--app-card-border);
      border-radius: 4px;
    }

    /* Standalone Nav Link (Dashboard, Settings) */
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: 10px;
      color: var(--app-text-muted);
      font-weight: 500;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      &:active {
        transform: scale(0.97);
      }

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
    }

    /* Parent Group Container */
    .nav-group {
      display: flex;
      flex-direction: column;

      .nav-parent-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 12px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: var(--app-text);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:active {
          transform: scale(0.98);
        }

        &:hover {
          background-color: var(--el-table-header-bg-color);
        }

        &.is-active {
          color: var(--app-text);
          background-color: rgba(0, 0, 0, 0.025);
        }

        .parent-left {
          display: flex;
          align-items: center;
          gap: 12px;

          .nav-icon {
            color: var(--app-text-muted);
          }
        }

        .parent-right {
          display: flex;
          align-items: center;
          gap: 6px;

          .module-tag {
            font-size: 0.625rem;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px;

            &.lifeos-tag {
              background: rgba(99, 102, 241, 0.15);
              color: #6366F1;
            }

            &.finance-tag {
              background: rgba(16, 185, 129, 0.15);
              color: #10B981;
            }
          }

          .arrow-icon {
            font-size: 0.6875rem;
            color: var(--app-text-muted);
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

            &.rotated {
              transform: rotate(180deg);
            }
          }
        }
      }

      /* Indented Submenu List */
      .submenu-list {
        margin-left: 20px;
        padding-left: 10px;
        border-left: 1.5px solid var(--app-sidebar-border);
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
        margin-bottom: 4px;

        .nav-sub-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 0.8125rem;
          color: var(--app-text-muted);
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;

          &:active {
            transform: scale(0.97);
          }

          &:hover {
            background-color: var(--el-table-header-bg-color);
            color: var(--app-text);
          }

          &.router-link-active {
            background-color: rgba(16, 185, 129, 0.12);
            color: #10B981;
            font-weight: 600;

            .sub-icon {
              color: #10B981;
            }
          }

          .nav-badge {
            margin-left: auto;
          }
        }
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

// Submenu Slide Transition
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 250px;
  overflow: hidden;
  opacity: 1;
}

.submenu-slide-enter-from,
.submenu-slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  margin-top: 0;
  margin-bottom: 0;
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
    min-width: 0;
    max-width: 100vw;
    overflow-x: hidden;
    padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
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
      height: 56px;
      padding: 0 12px;
      max-width: 100vw;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
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
      padding: 14px 12px calc(84px + env(safe-area-inset-bottom, 0px));
      min-width: 0;
      max-width: 100%;
      overflow-x: hidden;
    }
  }
}

// Mobile Bottom Navigation Bar
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(60px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
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
    text-decoration: none;
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease;

    &:active {
      transform: scale(0.92);
    }

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
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;

      &:active {
        transform: scale(0.92);
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
      }
    }
  }
}

// Mobile Drawer Content
.mobile-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: var(--app-sidebar-bg);

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--app-sidebar-border);

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--app-text);
    }
  }

  .drawer-nav {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .drawer-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: var(--app-text);
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:active {
        transform: scale(0.97);
      }

      &.active {
        background: rgba(16, 185, 129, 0.12);
        color: #10B981;
      }
    }

    .drawer-section {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .drawer-section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--app-text-muted);

        .sec-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .module-tag {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;

          &.lifeos-tag {
            background: rgba(99, 102, 241, 0.15);
            color: #6366F1;
          }

          &.finance-tag {
            background: rgba(16, 185, 129, 0.15);
            color: #10B981;
          }
        }
      }

      .drawer-sub-links {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-left: 8px;

        .drawer-sub-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--app-text-muted);
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

          &:active {
            transform: scale(0.97);
          }

          &.active {
            background: rgba(16, 185, 129, 0.12);
            color: #10B981;
            font-weight: 600;
          }

          .ml-auto {
            margin-left: auto;
          }
        }
      }
    }
  }

  .drawer-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--app-sidebar-border);

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .user-avatar {
        background: #10B981;
        color: #FFFFFF;
        font-weight: 700;
      }

      .user-text {
        display: flex;
        flex-direction: column;

        .user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text);
        }

        .user-role {
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
      }
    }
  }
}

// Smooth Page Slide-Fade transition
.fade-enter-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<style lang="scss">
/* Global styles for popover menu when sidebar is collapsed */
.sidebar-flyout-popper {
  padding: 8px 10px !important;
  border-radius: 12px !important;
  background: var(--app-card-bg) !important;
  border: 1px solid var(--app-card-border) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;

  .popover-nav-list {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .popover-header {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--app-text-muted);
      padding: 4px 8px 6px;
      border-bottom: 1px solid var(--app-card-border);
      margin-bottom: 4px;
      letter-spacing: 0.03em;
    }

    .popover-sub-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 0.8125rem;
      color: var(--app-text);
      text-decoration: none;
      transition: background 0.15s;

      &:hover {
        background-color: var(--el-table-header-bg-color);
      }

      &.active {
        background: rgba(16, 185, 129, 0.12);
        color: #10B981;
        font-weight: 600;
      }

      .popover-badge {
        margin-left: auto;
      }
    }
  }
}
</style>

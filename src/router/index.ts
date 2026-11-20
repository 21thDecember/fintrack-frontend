import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Đăng nhập', guestOnly: true }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Tổng quan LifeOS' }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/tasks/TaskListView.vue'),
        meta: { title: 'Quản lý Công việc' }
      },
      {
        path: 'habits',
        name: 'Habits',
        component: () => import('@/views/habits/HabitListView.vue'),
        meta: { title: 'Theo dõi Thói quen' }
      },
      {
        path: 'goals',
        name: 'Goals',
        component: () => import('@/views/goals/GoalListView.vue'),
        meta: { title: 'Mục tiêu cá nhân' }
      },
      {
        path: 'goals/:id',
        name: 'GoalDetail',
        component: () => import('@/views/goals/GoalDetailView.vue'),
        meta: { title: 'Chi tiết Mục tiêu' }
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/transactions/TransactionListView.vue'),
        meta: { title: 'Sổ giao dịch' }
      },
      {
        path: 'transactions/create',
        name: 'TransactionCreate',
        component: () => import('@/views/transactions/TransactionFormView.vue'),
        meta: { title: 'Ghi nhận giao dịch' }
      },
      {
        path: 'transactions/:id',
        name: 'TransactionEdit',
        component: () => import('@/views/transactions/TransactionFormView.vue'),
        meta: { title: 'Chỉnh sửa giao dịch' }
      },
      {
        path: 'debts',
        name: 'Debts',
        component: () => import('@/views/debts/DebtListView.vue'),
        meta: { title: 'Quản lý Công nợ' }
      },
      {
        path: 'debts/:id',
        name: 'DebtDetail',
        component: () => import('@/views/debts/DebtDetailView.vue'),
        meta: { title: 'Chi tiết khoản nợ' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/ReportView.vue'),
        meta: { title: 'Báo cáo & Phân tích' }
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/accounts/AccountListView.vue'),
        meta: { title: 'Quản lý Tài khoản' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/CategoryListView.vue'),
        meta: { title: 'Danh mục Thu & Chi' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { title: 'Cài đặt hệ thống' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation Guards: Auth check & Page title
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const title = (to.meta?.title as string) || 'Quản Lý Tài Chính Cá Nhân'
  document.title = `${title} | FinTrack VN`

  if (to.meta?.requiresAuth && !token) {
    next('/login')
  } else if (to.meta?.guestOnly && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router

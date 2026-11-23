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
        path: 'journals',
        name: 'Journals',
        component: () => import('@/views/journal/JournalOverviewView.vue'),
        meta: { title: 'Nhật ký & Đánh giá' }
      },
      {
        path: 'journals/daily',
        name: 'DailyJournal',
        component: () => import('@/views/journal/DailyJournalView.vue'),
        meta: { title: 'Nhật ký ngày & Tâm trạng' }
      },
      {
        path: 'journals/mood',
        name: 'MoodCalendar',
        component: () => import('@/views/journal/MoodCalendarView.vue'),
        meta: { title: 'Lịch theo dõi Tâm trạng' }
      },
      {
        path: 'journals/reviews',
        name: 'WeeklyReview',
        component: () => import('@/views/journal/WeeklyReviewView.vue'),
        meta: { title: 'Tổng kết & Đánh giá Tuần' }
      },
      {
        path: 'learning',
        name: 'Learning',
        redirect: '/learning/overview',
        children: [
          {
            path: 'overview',
            name: 'LearningOverview',
            component: () => import('@/views/learning/LearningOverviewView.vue'),
            meta: { title: 'Học tập & Kỹ năng' }
          },
          {
            path: 'courses',
            name: 'LearningCourses',
            component: () => import('@/views/learning/CoursesView.vue'),
            meta: { title: 'Khóa học' }
          },
          {
            path: 'books',
            name: 'LearningBooks',
            component: () => import('@/views/learning/BooksView.vue'),
            meta: { title: 'Tủ sách' }
          },
          {
            path: 'skills',
            name: 'LearningSkills',
            component: () => import('@/views/learning/SkillsView.vue'),
            meta: { title: 'Kỹ năng' }
          },
          {
            path: 'sessions',
            name: 'LearningSessions',
            component: () => import('@/views/learning/LearningSessionsView.vue'),
            meta: { title: 'Lịch sử học' }
          },
          {
            path: 'notes',
            name: 'LearningNotes',
            component: () => import('@/views/learning/StudyNotesView.vue'),
            meta: { title: 'Sổ tay ghi chú' }
          }
        ]
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

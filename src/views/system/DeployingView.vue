<template>
  <div class="deploying-page">
    <!-- Header -->
    <header class="page-header">
      <div class="brand">
        <span class="logo">💰</span>
        <span class="brand-name">FinTrack VN</span>
      </div>
      <el-button size="small" text @click="toggleDark">
        {{ isDark ? '☀️ Giao diện sáng' : '🌙 Giao diện tối' }}
      </el-button>
    </header>

    <!-- Main Content -->
    <main class="page-main">
      <div class="deploy-card">
        <!-- Rocket Animated Icon -->
        <div class="icon-wrapper">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay"></div>
          <div class="icon-box">
            <span v-if="deployStore.isBackendAlive" class="emoji-icon">✅</span>
            <span v-else class="emoji-icon">🚀</span>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="status-badge" :class="deployStore.isBackendAlive ? 'ready' : 'deploying'">
          <span class="dot-ping" :class="{ 'green-dot': deployStore.isBackendAlive }"></span>
          <span>{{ badgeText }}</span>
        </div>

        <h1 class="main-title">{{ deployStore.title }}</h1>
        <p class="main-desc">{{ deployStore.message }}</p>

        <!-- Bento Grid Status -->
        <div class="bento-grid">
          <div class="bento-item">
            <div class="item-header">
              <span class="item-title">🌐 Giao diện (Frontend)</span>
              <span class="tag-status green">Đã sẵn sàng</span>
            </div>
            <div class="item-detail">Phiên bản: <strong>v1.0.0</strong></div>
          </div>

          <div class="bento-item">
            <div class="item-header">
              <span class="item-title">⚙️ Máy chủ (Backend API)</span>
              <span class="tag-status" :class="deployStore.isBackendAlive ? 'green' : 'amber'">
                {{ deployStore.isBackendAlive ? 'Đang hoạt động' : 'Đang triển khai' }}
              </span>
            </div>
            <div class="item-detail">
              Trạng thái: 
              <strong>{{ deployStore.isBackendAlive ? '200 OK (Sẵn sàng)' : 'Đang đợi kết nối...' }}</strong>
            </div>
          </div>

          <div class="bento-item full-width">
            <div class="item-header">
              <span class="item-title">⏱️ Chu kỳ kiểm tra tự động</span>
              <span class="item-countdown">thử lại sau <strong>{{ deployStore.retrySeconds }}s</strong></span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(deployStore.retrySeconds / 5) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="actions-group">
          <el-button
            type="primary"
            size="large"
            class="btn-primary"
            :loading="deployStore.isChecking"
            @click="deployStore.checkHealth()"
          >
            <el-icon v-if="!deployStore.isChecking" style="margin-right: 6px;"><Refresh /></el-icon>
            Kiểm tra kết nối lại ngay
          </el-button>

          <el-button
            size="large"
            class="btn-secondary"
            @click="router.push('/dashboard')"
          >
            Vào Bảng điều khiển (Dashboard)
          </el-button>
        </div>

        <div class="page-footer">
          Hệ thống sẽ tự động chuyển hướng khi Backend hoàn tất khởi động.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { useDeployStore } from '@/stores/deploy'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const deployStore = useDeployStore()
const { isDark, toggleDark } = useTheme()

const badgeText = computed(() => {
  if (deployStore.isBackendAlive) return 'Hệ thống đã sẵn sàng'
  return 'Hệ thống đang triển khai'
})

onMounted(() => {
  // Trigger check and retry when visiting this page directly
  deployStore.triggerDeploy(
    'backend',
    'Hệ thống đang được triển khai & cập nhật',
    'Máy chủ Backend hoặc Frontend đang cập nhật phiên bản mới. Trang sẽ tự động đưa bạn vào ứng dụng khi hoàn tất.'
  )
})

onUnmounted(() => {
  deployStore.stopAutoRetry()
})
</script>

<style scoped lang="scss">
.deploying-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg);
  color: var(--app-text);
  padding: 20px;
}

.page-header {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;

    .logo {
      font-size: 1.5rem;
    }

    .brand-name {
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--app-text);
    }
  }
}

.page-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}

.deploy-card {
  width: 100%;
  max-width: 540px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-card-border);
  border-radius: 16px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
}

.icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #10B981;
    opacity: 0.2;
    animation: ripple 2s infinite ease-out;

    &.delay {
      animation-delay: 0.7s;
    }
  }

  .icon-box {
    position: relative;
    z-index: 1;
    width: 68px;
    height: 68px;
    border-radius: 16px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;

    .emoji-icon {
      font-size: 32px;
    }
  }
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.4; }
  100% { transform: scale(1.6); opacity: 0; }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 16px;

  &.deploying {
    background: rgba(245, 158, 11, 0.12);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  &.ready {
    background: rgba(16, 185, 129, 0.12);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .dot-ping {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #F59E0B;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6);
    animation: dot-pulse 1.5s infinite;

    &.green-dot {
      background: #10B981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
    }
  }
}

@keyframes dot-pulse {
  0% { box-shadow: 0 0 0 0 currentColor; }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.main-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--app-text);
  margin-bottom: 10px;
  line-height: 1.3;
}

.main-desc {
  font-size: 0.9375rem;
  color: var(--app-text-muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

/* Bento Grid */
.bento-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
  text-align: left;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  .bento-item {
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid var(--app-card-border);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.full-width {
      grid-column: 1 / -1;
    }

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--app-text-muted);
      }

      .item-countdown {
        font-size: 0.8125rem;
        color: var(--app-text-muted);

        strong {
          color: var(--app-text);
        }
      }

      .tag-status {
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;

        &.green {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }

        &.amber {
          background: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
        }
      }
    }

    .item-detail {
      font-size: 0.8125rem;
      color: var(--app-text);
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: var(--app-card-border);
      border-radius: 99px;
      overflow: hidden;
      margin-top: 4px;

      .progress-fill {
        height: 100%;
        background: #10B981;
        transition: width 1s linear;
      }
    }
  }
}

:global(html.dark) .bento-item {
  background: rgba(255, 255, 255, 0.02) !important;
}

/* Actions */
.actions-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .btn-primary {
    width: 100%;
    border-radius: 10px;
    font-weight: 700;
    background: #10B981;
    border-color: #10B981;

    &:hover {
      background: #059669;
      border-color: #059669;
    }
  }

  .btn-secondary {
    width: 100%;
    border-radius: 10px;
    font-weight: 600;
    color: var(--app-text-muted);
    background: transparent;
    border: 1px solid var(--app-card-border);
    margin-left: 0 !important;

    &:hover {
      color: var(--app-text);
      border-color: var(--app-text-muted);
    }
  }
}

.page-footer {
  margin-top: 24px;
  font-size: 0.75rem;
  color: var(--app-text-muted);
}
</style>

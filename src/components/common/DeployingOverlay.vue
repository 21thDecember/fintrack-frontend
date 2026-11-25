<template>
  <Transition name="deploy-fade">
    <div v-if="deployStore.isDeploying" class="deploy-overlay-wrapper">
      <div class="deploy-backdrop" @click="handleBackdropClick"></div>

      <div class="deploy-card">
        <!-- Close button if testing / preview -->
        <button
          v-if="deployStore.allowOfflineMode"
          class="close-btn"
          title="Đóng / Bỏ qua"
          @click="deployStore.dismissDeploy()"
        >
          ✕
        </button>

        <!-- Rocket Animated Icon -->
        <div class="icon-wrapper">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay"></div>
          <div class="icon-box">
            <span v-if="deployStore.isBackendAlive" class="emoji-icon">✅</span>
            <span v-else-if="deployStore.deployType === 'frontend'" class="emoji-icon">🌐</span>
            <span v-else class="emoji-icon">🚀</span>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="status-badge" :class="deployStore.isBackendAlive ? 'ready' : 'deploying'">
          <span class="dot-ping" :class="{ 'green-dot': deployStore.isBackendAlive }"></span>
          <span>{{ badgeText }}</span>
        </div>

        <!-- Main Title & Desc -->
        <h2 class="deploy-title">{{ deployStore.title }}</h2>
        <p class="deploy-desc">{{ deployStore.message }}</p>

        <!-- Bento Status Box -->
        <div class="bento-status-box">
          <div class="status-item">
            <div class="item-left">
              <span class="item-icon">🌐</span>
              <span class="item-label">Giao diện (Frontend)</span>
            </div>
            <span class="item-status green">● Đang hoạt động</span>
          </div>

          <div class="status-item">
            <div class="item-left">
              <span class="item-icon">⚙️</span>
              <span class="item-label">Máy chủ API (Backend)</span>
            </div>
            <span
              class="item-status"
              :class="deployStore.isBackendAlive ? 'green' : 'amber'"
            >
              {{ deployStore.isBackendAlive ? '● Sẵn sàng' : '● Đang triển khai...' }}
            </span>
          </div>

          <div class="status-item">
            <div class="item-left">
              <span class="item-icon">⏱️</span>
              <span class="item-label">Tự động thử lại</span>
            </div>
            <span class="item-status">sau {{ deployStore.retrySeconds }}s</span>
          </div>

          <!-- Progress Bar -->
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${(deployStore.retrySeconds / 5) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <el-button
            type="primary"
            class="action-btn-primary"
            :loading="deployStore.isChecking"
            @click="deployStore.checkHealth()"
          >
            <el-icon v-if="!deployStore.isChecking" style="margin-right: 6px;"><Refresh /></el-icon>
            Kiểm tra kết nối lại ngay
          </el-button>

          <el-button
            v-if="deployStore.allowOfflineMode"
            class="action-btn-secondary"
            @click="deployStore.enableOfflineFallback()"
          >
            Tiếp tục với Dữ liệu tạm thời (Offline)
          </el-button>
        </div>

        <div class="card-footer-note">
          Hệ thống FinTrack VN sẽ tự động khôi phục ngay khi máy chủ phản hồi.
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useDeployStore } from '@/stores/deploy'

const deployStore = useDeployStore()

const badgeText = computed(() => {
  if (deployStore.isBackendAlive) return 'Hệ thống đã sẵn sàng'
  if (deployStore.deployType === 'frontend') return 'Đang cập nhật giao diện'
  if (deployStore.deployType === 'backend') return 'Máy chủ đang triển khai'
  return 'Bảo trì hệ thống'
})

function handleBackdropClick() {
  if (deployStore.allowOfflineMode) {
    deployStore.dismissDeploy()
  }
}
</script>

<style scoped lang="scss">
.deploy-overlay-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.deploy-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
}

.deploy-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-card-border);
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 480px) {
    padding: 24px 18px;
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.125rem;
  color: var(--app-text-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    color: var(--app-text);
    background: rgba(0, 0, 0, 0.05);
  }
}

/* Icon */
.icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

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
    width: 60px;
    height: 60px;
    border-radius: 14px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;

    .emoji-icon {
      font-size: 28px;
      line-height: 1;
    }
  }
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.4; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 14px;

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

.deploy-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--app-text);
  margin-bottom: 8px;
  line-height: 1.3;
}

.deploy-desc {
  font-size: 0.875rem;
  color: var(--app-text-muted);
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Bento Box */
.bento-status-box {
  width: 100%;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--app-card-border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  text-align: left;

  .status-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8125rem;

    .item-left {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--app-text-muted);
    }

    .item-status {
      font-weight: 600;
      color: var(--app-text);

      &.green { color: #10B981; }
      &.amber { color: #F59E0B; }
    }
  }

  .progress-track {
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

:global(html.dark) .bento-status-box {
  background: rgba(255, 255, 255, 0.03);
}

/* Buttons */
.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .action-btn-primary {
    width: 100%;
    height: 42px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.875rem;
    background: #10B981;
    border-color: #10B981;

    &:hover {
      background: #059669;
      border-color: #059669;
    }
  }

  .action-btn-secondary {
    width: 100%;
    height: 38px;
    border-radius: 10px;
    font-size: 0.8125rem;
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

.card-footer-note {
  margin-top: 18px;
  font-size: 0.6875rem;
  color: var(--app-text-muted);
}

/* Fade animation */
.deploy-fade-enter-active,
.deploy-fade-leave-active {
  transition: opacity 0.25s ease;
}

.deploy-fade-enter-from,
.deploy-fade-leave-to {
  opacity: 0;
}
</style>

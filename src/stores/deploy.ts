import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export type DeployType = 'backend' | 'frontend' | 'maintenance'

export const useDeployStore = defineStore('deploy', () => {
  const isDeploying = ref(false)
  const deployType = ref<DeployType>('backend')
  const title = ref('Hệ thống đang được triển khai')
  const message = ref('Máy chủ Backend đang cập nhật phiên bản mới. Trang sẽ tự động kết nối lại khi hoàn tất.')
  const retrySeconds = ref(5)
  const isChecking = ref(false)
  const isBackendAlive = ref(false)
  const allowOfflineMode = ref(false)
  const autoRetryEnabled = ref(true)

  let timer: any = null

  function triggerDeploy(
    type: DeployType = 'backend',
    customTitle?: string,
    customMessage?: string,
    canOffline: boolean = true
  ) {
    // Avoid re-triggering if already deploying
    if (isDeploying.value && deployType.value === type) return

    isDeploying.value = true
    deployType.value = type
    allowOfflineMode.value = canOffline

    if (type === 'backend') {
      title.value = customTitle || 'Máy chủ Backend đang triển khai'
      message.value =
        customMessage ||
        'Hệ thống đang cập nhật dịch vụ Backend hoặc đang khởi động lại. Quá trình thường mất khoảng 30 - 60 giây.'
    } else if (type === 'frontend') {
      title.value = customTitle || 'Giao diện đang cập nhật phiên bản mới'
      message.value =
        customMessage ||
        'Đã có bản cập nhật giao diện mới. Hệ thống đang đồng bộ và nạp lại mã nguồn mới nhất...'
    } else {
      title.value = customTitle || 'Hệ thống đang bảo trì'
      message.value =
        customMessage || 'Hệ thống đang được nâng cấp định kỳ. Vui lòng quay lại sau ít phút.'
    }

    startAutoRetry()
  }

  function dismissDeploy() {
    isDeploying.value = false
    stopAutoRetry()
  }

  async function checkHealth(): Promise<boolean> {
    if (isChecking.value) return isBackendAlive.value
    isChecking.value = true

    try {
      const res = await fetch(`/api/health?t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-cache'
      })

      if (res.ok) {
        const body = await res.json()
        if (body?.data?.status === 'UP' || body?.success) {
          isBackendAlive.value = true
          onSystemOnline()
          return true
        }
      }
    } catch {
      // Backend still down or deploying
    } finally {
      isChecking.value = false
    }

    isBackendAlive.value = false
    retrySeconds.value = 5
    return false
  }

  function onSystemOnline() {
    stopAutoRetry()
    ElMessage.success('Hệ thống đã hoạt động trở lại bình thường!')
    setTimeout(() => {
      dismissDeploy()
      // If triggered by frontend update, reload to get fresh assets
      if (deployType.value === 'frontend') {
        window.location.reload()
      }
    }, 1200)
  }

  function startAutoRetry() {
    stopAutoRetry()
    retrySeconds.value = 5
    autoRetryEnabled.value = true

    timer = setInterval(() => {
      if (!autoRetryEnabled.value) return
      retrySeconds.value--
      if (retrySeconds.value <= 0) {
        checkHealth()
      }
    }, 1000)

    // Run first check after 800ms
    setTimeout(checkHealth, 800)
  }

  function stopAutoRetry() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function enableOfflineFallback() {
    dismissDeploy()
    ElMessage.info('Đang sử dụng dữ liệu tạm thời (Offline Mode).')
  }

  return {
    isDeploying,
    deployType,
    title,
    message,
    retrySeconds,
    isChecking,
    isBackendAlive,
    allowOfflineMode,
    autoRetryEnabled,
    triggerDeploy,
    dismissDeploy,
    checkHealth,
    startAutoRetry,
    stopAutoRetry,
    enableOfflineFallback
  }
})

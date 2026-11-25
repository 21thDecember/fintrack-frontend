<template>
  <el-config-provider :locale="locale">
    <router-view />
    <DeployingOverlay />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElConfigProvider, ElMessage } from 'element-plus'
import vi from 'element-plus/es/locale/lang/vi'
import { useTheme } from '@/composables/useTheme'
import DeployingOverlay from '@/components/common/DeployingOverlay.vue'
import { useDeployStore } from '@/stores/deploy'

const locale = ref(vi)
useTheme() // initialize theme preference

const deployStore = useDeployStore()
let versionCheckTimer: any = null
let currentBuildTime: number | null = null

async function checkFrontendVersion() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-cache' })
    if (!res.ok) return
    const data = await res.json()
    if (data && data.buildTime) {
      if (currentBuildTime === null) {
        currentBuildTime = data.buildTime
      } else if (currentBuildTime !== data.buildTime) {
        console.log('[Deploy Detector] New frontend version detected:', data.buildTime)
        currentBuildTime = data.buildTime
        deployStore.triggerDeploy(
          'frontend',
          'Đã có phiên bản giao diện mới',
          'Hệ thống vừa cập nhật phiên bản mới nhất. Đang tự động nạp lại ứng dụng...'
        )
      }
    }
  } catch {
    // Ignore version check network errors
  }
}

onMounted(() => {
  // Check if reloaded after frontend deploy chunk error
  const notice = sessionStorage.getItem('deploy_notice')
  if (notice === 'frontend') {
    sessionStorage.removeItem('deploy_notice')
    ElMessage.success('Ứng dụng đã được cập nhật lên phiên bản mới nhất!')
  }

  // Initial version fetch
  checkFrontendVersion()

  // Poll version every 60 seconds
  versionCheckTimer = setInterval(checkFrontendVersion, 60000)
})

onUnmounted(() => {
  if (versionCheckTimer) {
    clearInterval(versionCheckTimer)
  }
})
</script>

<style>
/* Global reset handled in main.scss */
</style>

<template>
  <div class="login-page">
    <div class="login-card-container">
      <div class="login-header">
        <div class="logo-box">💰</div>
        <h1 class="login-title">FinTrack VN</h1>
        <p class="login-subtitle">Hệ thống Quản lý Tài chính Cá nhân</p>
      </div>

      <el-card class="login-card" shadow="always">
        <el-form
          ref="loginFormRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="Tên đăng nhập" prop="username">
            <el-input
              v-model="form.username"
              placeholder="Nhập tên đăng nhập"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item label="Mật khẩu" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              :prefix-icon="Lock"
              show-password
              size="large"
            />
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="form.rememberMe">Ghi nhớ đăng nhập</el-checkbox>
            <el-link type="primary" :underline="false">Quên mật khẩu?</el-link>
          </div>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="authStore.loading"
            native-type="submit"
          >
            Đăng nhập ngay
          </el-button>
        </el-form>
      </el-card>

      <footer class="login-footer">
        © 2026 FinTrack VN • Quản lý ngân sách, sổ nợ & tài sản an toàn
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loginFormRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  rememberMe: true
})

const rules: FormRules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      await authStore.login({
        username: form.username,
        password: form.password,
        rememberMe: form.rememberMe
      })
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #ECFDF5 0%, #F8FAFC 50%, #F1F5F9 100%);
  padding: 20px;

  html.dark & {
    background: radial-gradient(circle at top right, #064E3B 0%, #0B0F19 60%, #030712 100%);
  }

  .login-card-container {
    width: 100%;
    max-width: 440px;
    animation: loginFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes loginFadeUp {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .login-header {
    text-align: center;
    margin-bottom: 24px;

    .logo-box {
      font-size: 3rem;
      margin-bottom: 8px;
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--app-text);
      letter-spacing: -0.03em;
    }

    .login-subtitle {
      font-size: 0.875rem;
      color: var(--app-text-muted);
      margin-top: 4px;
    }
  }

  .login-card {
    border-radius: 16px !important;
    padding: 10px;
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 0.875rem;
  }

  .submit-btn {
    width: 100%;
    height: 46px;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 10px !important;
  }

  .login-footer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--app-text-muted);
    margin-top: 24px;
  }
}
</style>

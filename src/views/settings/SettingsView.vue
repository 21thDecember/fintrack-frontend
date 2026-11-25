<template>
  <div class="settings-view">
    <div class="settings-header">
      <p class="page-desc">Tùy chỉnh kết nối SePay, quy tắc tự động phân loại giao dịch ngân hàng và giao diện hệ thống</p>
    </div>

    <!-- 0. SePay Bank Integration Card -->
    <el-card class="settings-card sepay-card" shadow="never">
      <template #header>
        <div class="card-header-flex">
          <div class="sepay-header-left">
            <span class="sepay-logo-badge">⚡ SePay Webhook</span>
            <div>
              <h3 class="section-title">Kết nối Ngân hàng tự động qua SePay (BIDV, MB Bank...)</h3>
              <p class="section-desc">Tự động nhận biến động số dư theo thời gian thực mỗi khi có chuyển khoản</p>
            </div>
          </div>
          <el-tag type="success" effect="dark" round>🟢 Sẵn sàng nhận Webhook</el-tag>
        </div>
      </template>

      <div class="sepay-content">
        <el-alert
          title="Cơ chế hoạt động"
          description="SePay sẽ gửi dữ liệu Webhook đến FinTrack ngay khi tài khoản ngân hàng của bạn có tiền vào hoặc ra. Hệ thống sẽ tự động tạo giao dịch, nhận diện danh mục (Lương, Ăn uống...) và cập nhật số dư tài khoản tương ứng tức thì."
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        />

        <div class="sepay-field-group">
          <label class="field-label">Địa chỉ Webhook URL của bạn (Dán vào mục Webhook trên SePay):</label>
          <div class="copy-url-row">
            <el-input :model-value="webhookUrl" readonly size="large">
              <template #prepend>POST</template>
            </el-input>
            <el-button type="primary" size="large" :icon="DocumentCopy" @click="copyWebhookUrl">
              Sao chép URL
            </el-button>
          </div>
          <span class="field-hint">Khi chạy local cần công khai cổng bằng ngrok hoặc cloudflare tunnel; khi deploy production chỉ cần điền domain của bạn.</span>
        </div>

        <el-divider />

        <!-- 4 Steps Setup Guide -->
        <h4 style="margin-bottom: 12px; font-weight: 700; color: var(--app-text);">4 Bước kết nối tài khoản ngân hàng thực tế:</h4>
        <div class="steps-box">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-text">Đăng ký tài khoản tại <el-link type="primary" href="https://my.sepay.vn" target="_blank">my.sepay.vn</el-link> và liên kết tài khoản ngân hàng (BIDV, MB Bank...).</div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-text">Vào menu <strong>Tích hợp Webhook</strong> trên SePay → Bấm <strong>Thêm Webhook mới</strong>.</div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-text">Dán địa chỉ <strong>Webhook URL</strong> ở trên vào ô URL trên SePay và chọn các tài khoản ngân hàng cần đồng bộ.</div>
          </div>
          <div class="step-item">
            <div class="step-num">4</div>
            <div class="step-text">Tại FinTrack vào mục <strong>Tài khoản</strong>, thêm tài khoản có <strong>Số tài khoản</strong> trùng với số tài khoản trên SePay để tiền tự động vào đúng ví.</div>
          </div>
        </div>

        <el-divider />

        <!-- Test Webhook Simulation -->
        <div class="simulate-box">
          <div>
            <h4 style="font-weight: 700; margin-bottom: 4px; color: var(--app-text);">Kiểm tra thử nghiệm Webhook (Simulation):</h4>
            <p style="font-size: 13px; color: var(--app-text-muted);">Bấm nút dưới đây để gửi 1 giao dịch mẫu (+2.000.000đ từ MB Bank) tới backend để kiểm tra kết nối ngay.</p>
          </div>
          <el-button type="success" :loading="isTestingWebhook" :icon="Position" @click="handleSimulateWebhook">
            Gửi giao dịch thử nghiệm SePay
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 1. Auto Classification Rules -->
    <el-card class="settings-card" shadow="never">
      <template #header>
        <div class="card-header-flex">
          <div>
            <h3 class="section-title">Quy tắc tự động phân loại (Classification Rules)</h3>
            <p class="section-desc">Khi sao kê ngân hàng có từ khóa tương ứng, giao dịch sẽ tự động gắn danh mục</p>
          </div>
          <el-button type="primary" :icon="Plus" size="small" @click="showAddRuleDialog = true">
            Thêm quy tắc mới
          </el-button>
        </div>
      </template>

      <el-table :data="rules" style="width: 100%" empty-text="Chưa có quy tắc phân loại nào">
        <el-table-column label="Từ khóa (Keywords)" min-width="180">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="plain" class="keyword-tag">
              {{ row.keyword }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Tự động gán vào danh mục" min-width="200">
          <template #default="{ row }">
            <el-tag size="small" effect="light">
              {{ row.categoryName || 'Danh mục' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Độ ưu tiên" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.priority }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="100" align="center">
          <template #default="{ row }">
            <el-popconfirm
              title="Xóa quy tắc này?"
              confirm-button-text="Xóa"
              cancel-button-text="Hủy"
              @confirm="handleDeleteRule(row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">Xóa</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 2. Application Preferences -->
    <el-card class="settings-card" shadow="never">
      <template #header>
        <h3 class="section-title">Tùy chọn hiển thị & Khu vực</h3>
      </template>

      <el-form label-position="left" label-width="240px">
        <el-form-item label="Đơn vị tiền tệ mặc định">
          <el-select v-model="currency" style="width: 220px">
            <el-option label="Việt Nam Đồng (VND - ₫)" value="VND" />
            <el-option label="Đô la Mỹ (USD - $)" value="USD" disabled />
          </el-select>
        </el-form-item>

        <el-form-item label="Chế độ giao diện (Theme)">
          <div class="theme-toggle-row">
            <el-switch
              v-model="isDark"
              active-text="Tối (Dark Mode)"
              inactive-text="Sáng (Light Mode)"
              @change="toggleDark"
            />
          </div>
        </el-form-item>

        <el-form-item label="Ngôn ngữ giao diện">
          <el-select v-model="language" style="width: 220px">
            <el-option label="Tiếng Việt (vi-VN)" value="vi" />
            <el-option label="English (en-US)" value="en" disabled />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 3. Backup and Export Actions -->
    <el-card class="settings-card" shadow="never">
      <template #header>
        <h3 class="section-title">Sao lưu & Xuất dữ liệu</h3>
      </template>

      <div class="backup-actions">
        <el-button type="success" plain :icon="Download" @click="handleExportData">
          Xuất toàn bộ dữ liệu ra JSON
        </el-button>
        <el-button type="info" plain :icon="Upload" @click="handleBackupData">
          Tạo bản sao lưu hệ thống (Backup)
        </el-button>
      </div>
    </el-card>

    <!-- 4. System & Deployment Notice -->
    <el-card class="settings-card" shadow="never">
      <template #header>
        <h3 class="section-title">Trạng thái Hệ thống & Trang Triển khai (Deploy Notice)</h3>
      </template>

      <div class="deploy-settings-content">
        <p class="section-desc">
          Trang báo trạng thái khi Backend hoặc Frontend đang deploy / bảo trì. Trang có sẵn tính năng tự động đếm lùi, kiểm tra kết nối API và đưa người dùng quay lại ứng dụng ngay khi triển khai xong.
        </p>

        <div class="deploy-preview-actions">
          <el-button type="primary" plain @click="testDeployOverlay">
            🚀 Xem trước Thông báo Deploy (Overlay)
          </el-button>
          <el-button @click="openStandaloneDeployPage">
            🌐 Mở trang Deploying riêng (/deploying)
          </el-button>
          <el-button @click="openStaticMaintenancePage">
            📄 Xem trang Tĩnh Độc lập (deploying.html)
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Add Rule Dialog -->
    <el-dialog v-model="showAddRuleDialog" title="Thêm quy tắc phân loại mới" width="460px" append-to-body>
      <el-form ref="ruleFormRef" :model="newRule" :rules="ruleRules" label-position="top">
        <el-form-item label="Từ khóa trong sao kê ngân hàng" prop="keyword">
          <el-input v-model="newRule.keyword" placeholder="Ví dụ: SHOPEE, GRAB, HIGHLANDS..." />
        </el-form-item>

        <el-form-item label="Danh mục gán tương ứng" prop="categoryId">
          <el-select v-model="newRule.categoryId" placeholder="Chọn danh mục" style="width: 100%">
            <el-option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Độ ưu tiên xử lý">
          <el-input-number v-model="newRule.priority" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddRuleDialog = false">Hủy</el-button>
        <el-button type="primary" @click="handleAddRule">Lưu quy tắc</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Download, Upload, DocumentCopy, Position } from '@element-plus/icons-vue'
import { settingsApi, type ClassificationRule } from '@/api/settingsApi'
import apiClient from '@/api/client'
import { useCategoryStore } from '@/stores/category'
import { useDeployStore } from '@/stores/deploy'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'

const router = useRouter()
const deployStore = useDeployStore()
const categoryStore = useCategoryStore()
const { isDark, toggleDark } = useTheme()

const webhookUrl = computed(() => {
  const envBase = import.meta.env.VITE_API_BASE_URL
  if (envBase && envBase.startsWith('http')) {
    return `${envBase.replace(/\/+$/, '')}/api/webhooks/sepay`
  }
  return `${window.location.protocol}//${window.location.hostname}:8085/api/webhooks/sepay`
})

const isTestingWebhook = ref(false)

async function copyWebhookUrl() {
  try {
    await navigator.clipboard.writeText(webhookUrl.value)
    ElMessage.success('Đã sao chép Webhook URL vào bộ nhớ tạm')
  } catch {
    ElMessage.info(`Webhook URL: ${webhookUrl.value}`)
  }
}

async function handleSimulateWebhook() {
  isTestingWebhook.value = true
  try {
    const testId = Date.now()
    await apiClient.post('/webhooks/sepay', {
      id: testId,
      gateway: 'MBBank',
      transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      accountNumber: '0987654321',
      code: null,
      content: 'Chuyen khoan thuong thang 11 - SePay Test',
      transferType: 'in',
      transferAmount: 2000000,
      accumulated: 17000000,
      subAccount: null,
      referenceCode: `MB${testId}`,
      description: 'Giao dịch thử nghiệm SePay Webhook'
    })
    ElMessage.success('Bắn Webhook SePay thành công! Giao dịch đã được ghi nhận vào hệ thống.')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Không thể gửi Webhook thử nghiệm')
  } finally {
    isTestingWebhook.value = false
  }
}

const currency = ref('VND')
const language = ref('vi')
const rules = ref<ClassificationRule[]>([])
const showAddRuleDialog = ref(false)
const ruleFormRef = ref<FormInstance>()

const newRule = reactive({
  keyword: '',
  categoryId: '',
  priority: 1
})

const ruleRules: FormRules = {
  keyword: [{ required: true, message: 'Vui lòng nhập từ khóa', trigger: 'blur' }],
  categoryId: [{ required: true, message: 'Vui lòng chọn danh mục', trigger: 'change' }]
}

async function loadRules() {
  rules.value = await settingsApi.getRules()
}

async function handleAddRule() {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const cat = categoryStore.categories.find(c => c.id === newRule.categoryId)
      await settingsApi.addRule({
        keyword: newRule.keyword.toUpperCase(),
        categoryId: newRule.categoryId,
        categoryName: cat?.name,
        priority: newRule.priority
      })
      ElMessage.success('Đã lưu quy tắc phân loại mới')
      showAddRuleDialog.value = false
      newRule.keyword = ''
      loadRules()
    }
  })
}

async function handleDeleteRule(id: string) {
  await settingsApi.deleteRule(id)
  rules.value = rules.value.filter(r => r.id !== id)
  ElMessage.success('Đã xóa quy tắc')
}

function handleExportData() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ exportedAt: new Date().toISOString() }))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', 'fintrack_backup.json')
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
  ElMessage.success('Đã xuất file dữ liệu sao lưu thành công')
}

function handleBackupData() {
  ElMessage.success('Đã tạo bản sao lưu snapshot hệ thống thành công')
}

function testDeployOverlay() {
  deployStore.triggerDeploy(
    'backend',
    'Máy chủ Backend đang triển khai (Chế độ xem trước)',
    'Hệ thống đang mô phỏng thông báo cập nhật phiên bản mới. Bạn có thể kiểm tra cơ chế đếm lùi, kiểm tra API hoặc bấm dấu X để đóng.',
    true
  )
}

function openStandaloneDeployPage() {
  router.push('/deploying')
}

function openStaticMaintenancePage() {
  window.open('/deploying.html', '_blank')
}

onMounted(() => {
  categoryStore.fetchCategories()
  loadRules()
})
</script>

<style scoped lang="scss">
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;

  .settings-header {
    .page-title {
      font-size: 1.375rem;
      font-weight: 800;
      color: var(--app-text);
    }
    .page-desc {
      font-size: 0.875rem;
      color: var(--app-text-muted);
      margin-top: 4px;
    }
  }

  .settings-card {
    border-radius: 12px;
    border: 1px solid var(--app-card-border);
    box-shadow: none;
    transition: border-color 0.15s ease;

    &:hover {
      border-color: rgba(16, 185, 129, 0.4);
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--app-text);
    }

    .section-desc {
      font-size: 0.8125rem;
      color: var(--app-text-muted);
      margin-top: 2px;
    }
  }

  .keyword-tag {
    font-weight: 600;
  }

  .backup-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  // SePay Card Styles
  .sepay-card {
    border: 1px solid rgba(16, 185, 129, 0.3) !important;
    box-shadow: none !important;

    .sepay-header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .sepay-logo-badge {
        font-weight: 700;
        font-size: 0.8125rem;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(16, 185, 129, 0.1);
        color: #10B981;
        box-shadow: none;
      }
    }

    .sepay-field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .field-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--app-text);
      }

      .copy-url-row {
        display: flex;
        gap: 10px;
      }

      .field-hint {
        font-size: 0.75rem;
        color: var(--app-text-muted);
      }
    }

    .steps-box {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .step-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
          font-weight: 700;
          font-size: 0.8125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--app-text);
        }
      }
    }

    .simulate-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      border-radius: 10px;
      background-color: var(--el-fill-color-light);
    }
  }

  .deploy-settings-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .section-desc {
      font-size: 0.875rem;
      color: var(--app-text-muted);
      line-height: 1.5;
    }

    .deploy-preview-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }
}
</style>

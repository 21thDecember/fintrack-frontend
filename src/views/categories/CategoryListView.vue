<template>
  <div class="categories-view">
    <div class="categories-header">
      <div class="title-info">
        <h1 class="page-heading">Danh mục Thu & Chi</h1>
        <p class="sub-heading">Phân loại các khoản chi tiêu và nguồn thu để báo cáo chính xác hơn</p>
      </div>

      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        Thêm danh mục mới
      </el-button>
    </div>

    <!-- Category Tabs: Income / Expense -->
    <el-card class="categories-card" shadow="never">
      <el-tabs v-model="activeTab" class="category-tabs">
        <!-- Tab 1: Expense -->
        <el-tab-pane label="Danh mục Chi tiêu (EXPENSE)" name="EXPENSE">
          <div class="category-grid" v-loading="categoryStore.loading">
            <div
              v-for="cat in categoryStore.expenseCategories"
              :key="cat.id"
              class="category-item-card"
              :class="{ 'is-inactive': !cat.isActive }"
            >
              <div class="cat-left">
                <div class="cat-dot" :style="{ backgroundColor: cat.color }"></div>
                <div class="cat-info">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-type-tag">Chi tiêu</span>
                </div>
              </div>

              <div class="cat-right">
                <el-switch
                  v-model="cat.isActive"
                  inline-prompt
                  active-text="Bật"
                  inactive-text="Ẩn"
                  @change="(val: boolean | string | number) => handleToggleStatus(cat.id, Boolean(val))"
                />
                <el-button link type="primary" size="small" @click="openEditDialog(cat)">
                  Sửa
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2: Income -->
        <el-tab-pane label="Danh mục Thu nhập (INCOME)" name="INCOME">
          <div class="category-grid" v-loading="categoryStore.loading">
            <div
              v-for="cat in categoryStore.incomeCategories"
              :key="cat.id"
              class="category-item-card"
              :class="{ 'is-inactive': !cat.isActive }"
            >
              <div class="cat-left">
                <div class="cat-dot" :style="{ backgroundColor: cat.color }"></div>
                <div class="cat-info">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-type-tag">Thu nhập</span>
                </div>
              </div>

              <div class="cat-right">
                <el-switch
                  v-model="cat.isActive"
                  inline-prompt
                  active-text="Bật"
                  inactive-text="Ẩn"
                  @change="(val: boolean | string | number) => handleToggleStatus(cat.id, Boolean(val))"
                />
                <el-button link type="primary" size="small" @click="openEditDialog(cat)">
                  Sửa
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Create / Edit Category Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'"
      width="460px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Loại danh mục" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button label="EXPENSE">Chi tiêu</el-radio-button>
            <el-radio-button label="INCOME">Thu nhập</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Tên danh mục" prop="name">
          <el-input v-model="form.name" placeholder="Ví dụ: Ăn uống, Mua sắm, Lương..." />
        </el-form-item>

        <el-form-item label="Màu sắc đại diện">
          <div class="color-picker-row">
            <div
              v-for="color in PRESET_COLORS"
              :key="color"
              class="color-choice"
              :style="{ backgroundColor: color }"
              :class="{ 'is-selected': form.color === color }"
              @click="form.color = color"
            ></div>
          </div>
        </el-form-item>

        <el-form-item label="Biểu tượng">
          <el-select v-model="form.icon" placeholder="Chọn biểu tượng" style="width: 100%">
            <el-option
              v-for="icon in PRESET_ICONS"
              :key="icon.name"
              :label="icon.label"
              :value="icon.name"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="categoryStore.loading" @click="handleSubmit">
          Lưu danh mục
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useCategoryStore } from '@/stores/category'
import type { Category, CategoryType, CreateCategoryDto } from '@/types/category'
import { PRESET_COLORS, PRESET_ICONS } from '@/utils/constants'

const categoryStore = useCategoryStore()
const formRef = ref<FormInstance>()
const activeTab = ref<CategoryType>('EXPENSE')

const dialogVisible = ref(false)
const editingId = ref<string | null>(null)

const form = reactive<CreateCategoryDto>({
  name: '',
  type: 'EXPENSE',
  color: PRESET_COLORS[0],
  icon: 'utensils'
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên danh mục', trigger: 'blur' }],
  type: [{ required: true, message: 'Vui lòng chọn loại danh mục', trigger: 'change' }]
}

function openCreateDialog() {
  editingId.value = null
  form.name = ''
  form.type = activeTab.value
  form.color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
  form.icon = 'utensils'
  dialogVisible.value = true
}

function openEditDialog(cat: Category) {
  editingId.value = cat.id
  form.name = cat.name
  form.type = cat.type
  form.color = cat.color
  form.icon = cat.icon
  dialogVisible.value = true
}

async function handleToggleStatus(id: string, active: boolean) {
  await categoryStore.toggleActive(id, active)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (editingId.value) {
        await categoryStore.updateCategory(editingId.value, form)
      } else {
        await categoryStore.createCategory(form)
      }
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<style scoped lang="scss">
.categories-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .categories-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .page-heading {
      font-size: 1.375rem;
      font-weight: 800;
      color: var(--app-text);
    }

    .sub-heading {
      font-size: 0.875rem;
      color: var(--app-text-muted);
    }
  }

  .categories-card {
    border-radius: 12px;

    .category-tabs {
      border-bottom: none;
    }
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    padding-top: 10px;
  }

  .category-item-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--app-bg);
    border: 1px solid var(--app-card-border);
    transition: all 0.2s ease;

    &.is-inactive {
      opacity: 0.5;
    }

    .cat-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .cat-dot {
        width: 14px;
        height: 14px;
        border-radius: 4px;
      }

      .cat-info {
        display: flex;
        flex-direction: column;

        .cat-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--app-text);
        }

        .cat-type-tag {
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
      }
    }

    .cat-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .color-picker-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .color-choice {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s ease;

      &:hover {
        transform: scale(1.15);
      }

      &.is-selected {
        outline: 3px solid #10B981;
        outline-offset: 2px;
      }
    }
  }
}
</style>

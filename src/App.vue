<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import vi from 'element-plus/es/locale/lang/vi'
import { useTheme } from '@/composables/useTheme'

const locale = ref(vi)
useTheme() // initialize theme preference
</script>

<style>
/* Global reset handled in main.scss */
</style>

<template>
  <div class="fixed z-[60] bottom-4 left-1/2 -translate-x-1/2 space-y-2 w-[calc(100%-1.5rem)] xs:max-w-sm">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id" role="status"
           class="rounded-xl px-4 py-3 bg-white/90 dark:bg-gray-900/90 border border-black/10 dark:border-white/10 shadow-lg backdrop-blur text-sm flex items-start gap-3">
        <Icon :name="t.icon || 'mdi:information-outline'" class="mt-0.5" />
        <div class="flex-1">
          <p class="font-medium">{{ t.title }}</p>
          <p v-if="t.message" class="opacity-80">{{ t.message }}</p>
        </div>
        <button class="opacity-70 hover:opacity-100" @click="dismiss(t.id)" aria-label="Dismiss">
          <Icon name="mdi:close" />
        </button>
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { toastBus, type Toast } from '~/utils/toastBus';
const toasts = ref<Toast[]>([]);
function dismiss(id: number) { toasts.value = toasts.value.filter(t => t.id !== id); }
watchEffect(() => { toasts.value = toastBus.toasts.value; });
</script>
<style>
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>
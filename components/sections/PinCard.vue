<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-wider text-gray-400">PIN</p>
        <div class="mt-1 flex items-center gap-3">
          <code class="text-xl font-bold tracking-widest">{{ pin || '— — — —' }}</code>
          <button class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm" @click="copy" :disabled="!pin">Copy</button>
        </div>
      </div>
      <button class="opacity-80 hover:opacity-100" @click="$emit('edit')" aria-label="Edit PIN">
        <Icon name="mdi:pencil" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { toastBus } from '~/utils/toastBus';
const props = defineProps<{ pin: string | null }>();
async function copy(){ if(!props.pin) return; await navigator.clipboard.writeText(props.pin); toastBus.show({ title: 'PIN copied', icon: 'mdi:clipboard-check-outline' }); }
</script>

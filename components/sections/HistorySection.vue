<template>
  <section class="px-4 lg:px-6 py-8" aria-labelledby="history">
    <div class="flex items-center justify-between">
      <h2 id="history" class="text-xl font-semibold">Transfer history</h2>
      <div class="flex items-center gap-2">
        <button class="text-sm opacity-80 hover:opacity-100" @click="$emit('clear')" aria-label="Clear history">
          <Icon name="mdi:delete-outline" /> Clear
        </button>
      </div>
    </div>
    <div class="mt-4 grid md:grid-cols-2 gap-4">
      <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h3 class="font-semibold flex items-center gap-2"><Icon name="mdi:upload-outline" /> Sent</h3>
        <div v-if="sent.length === 0" class="text-sm text-gray-400 mt-2">No sent files yet.</div>
        <ul v-else class="mt-2 space-y-2">
          <li v-for="(item, idx) in sent" :key="idx" class="flex items-center gap-3">
            <Icon name="mdi:file-outline" />
            <div class="min-w-0 flex-1">
              <p class="truncate">{{ item.name }}</p>
              <p class="text-xs text-gray-400">{{ item.size }} • {{ item.time }}</p>
            </div>
            <SpeedIndicator :bps="item.bps" />
          </li>
        </ul>
      </div>
      <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h3 class="font-semibold flex items-center gap-2"><Icon name="mdi:download-outline" /> Received</h3>
        <div v-if="received.length === 0" class="text-sm text-gray-400 mt-2">No received files yet.</div>
        <ul v-else class="mt-2 space-y-2">
          <li v-for="(item, idx) in received" :key="idx" class="flex items-center gap-3">
            <Icon name="mdi:file-outline" />
            <div class="min-w-0 flex-1">
              <p class="truncate">{{ item.name }}</p>
              <p class="text-xs text-gray-400">{{ item.size }} • {{ item.time }}</p>
            </div>
            <button class="text-sm opacity-80 hover:opacity-100" @click="$emit('download', item)"><Icon name="mdi:download" /></button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import SpeedIndicator from '~/components/sections/SpeedIndicator.vue';
const props = defineProps<{ sent: { name: string; size: string; time: string; bps?: number }[]; received: { name: string; size: string; time: string; url?: string }[] }>();
</script>

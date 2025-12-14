<template>
  <section class="px-4 lg:px-6 py-6" aria-labelledby="devices" id="devices">
    <div class="flex items-center justify-between">
      <h2 id="devices" class="text-xl font-semibold">Nearby devices</h2>
      <button class="text-sm opacity-80 hover:opacity-100" @click="$emit('refresh')"><Icon name="mdi:refresh"/> Refresh</button>
    </div>
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <slot name="skeleton" />
      <div v-for="peer in peers" :key="peer.id" @click="$emit('select', peer.id)"
           class="group rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur cursor-pointer hover:scale-[1.01] transition-transform">
        <div class="flex items-center gap-3">
          <Icon :name="iconFor(peer.deviceType)" class="text-3xl" />
          <div class="min-w-0">
            <p class="font-semibold truncate">{{ peer.alias }}</p>
            <p class="text-xs text-gray-400">{{ peer.deviceModel || 'Unknown' }}</p>
          </div>
          <span class="ml-auto size-2 rounded-full" :class="peer.online ? 'bg-emerald-400' : 'bg-gray-500'" />
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ClientInfo } from '~/services/signaling';
const props = defineProps<{ peers: ClientInfo[] }>();
function iconFor(type: string){
  switch(type){
    case 'desktop': return 'mdi:monitor';
    case 'laptop': return 'mdi:laptop';
    case 'tablet': return 'mdi:tablet';
    case 'phone': return 'mdi:cellphone';
    default: return 'mdi:devices';
  }
}
</script>

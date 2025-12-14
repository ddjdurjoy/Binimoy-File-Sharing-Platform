<template>
  <div
    class="flex py-4 px-3 text-white drop-shadow-lg rounded-2xl min-h-[72px] cursor-pointer active:scale-[0.99] transition-transform"
    :style="{
      background: 'var(--primary-600)',
    }"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    :class="hover ? 'ring-2 ring-[color:var(--primary-400)]' : ''"
  >
    <div class="flex items-center justify-center px-2">
      <Icon :name="iconName" class="size-12" />
    </div>
    <div class="flex-1">
      <p class="text-[1.15rem] font-semibold leading-tight">{{ props.peer.alias }}</p>
      <p class="text-xs mt-1 mb-1">
        <span class="px-1 py-0.5 rounded" :style="{ background: 'var(--primary-800)' }">{{
          props.peer.deviceModel ?? "Unknown"
        }}</span>
        <span class="ml-2 px-1 py-0.5 rounded" :style="{ background: 'var(--primary-800)' }">WebRTC</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ClientInfo } from "@/services/signaling";
const hover = ref(false);

const props = defineProps<{
  peer: ClientInfo;
}>();

const iconName = computed(() => {
  switch (props.peer.deviceType) {
    case "mobile":
      return "material-symbols:smartphone";
    case "desktop":
      return "material-symbols:computer";
    case "web":
      return "material-symbols:language";
    case "headless":
      return "material-symbols:terminal";
    case "server":
      return "material-symbols:dns";
    default:
      return "material-symbols:help";
  }
});
</script>

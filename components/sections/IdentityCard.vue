<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center justify-between">
    <div class="flex items-center gap-3 min-w-0">
      <div class="size-12 rounded-full bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold animate-pulseGlow">
        {{ initials }}
      </div>
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-wider text-gray-400">You</p>
        <button class="mt-0.5 text-base font-semibold hover:underline truncate" @click="$emit('edit')">{{ alias }}</button>
      </div>
    </div>
    <span class="inline-flex items-center gap-2 text-xs text-emerald-400"><span class="size-2 rounded-full bg-emerald-400"></span> Online</span>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ alias: string }>();
const initials = computed(() => props.alias?.slice(0,2)?.toUpperCase() || 'BW');
</script>

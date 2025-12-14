<template>
  <div class="w-full h-2 rounded-lg mt-1" :style="{ background: 'rgba(0,0,0,0.1)' }">
    <div
      class="h-full rounded-lg transition-all"
      :style="{ width: `${props.progress * 100}%`, background: 'var(--primary-500)' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: number;
}>();
</script>

<template>
  <div class="w-full h-2 rounded-lg mt-1 bg-black/10 dark:bg-white/10">
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

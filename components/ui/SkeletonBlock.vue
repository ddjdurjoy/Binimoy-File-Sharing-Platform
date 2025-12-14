<template>
  <div :class="['animate-pulse rounded-lg bg-white/5', blockClass]" aria-hidden="true"></div>
</template>
<script setup lang="ts">
const props = defineProps<{ blockClass?: string }>();
</script>

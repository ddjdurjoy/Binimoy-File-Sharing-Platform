<template>
  <div class="w-full overflow-hidden">
    <div class="relative h-3 bg-gray-200 dark:bg-slate-700 rounded-full shadow-inner">
      <div
        class="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-lg"
        :style="{ width: `${props.progress * 100}%` }"
      >
        <!-- Shimmer effect -->
        <div
          class="absolute inset-0 rounded-full opacity-50"
          style="
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 2s infinite;
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: number;
}>();
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>

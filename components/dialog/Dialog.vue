<template>
  <transition name="dialog">
    <div
      v-if="props.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white dark:bg-slate-800 w-full max-w-2xl mx-4 rounded-2xl shadow-2xl text-gray-900 dark:text-white overflow-hidden border border-gray-100 dark:border-slate-700 transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.2s ease-in-out;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div,
.dialog-leave-to > div {
  transform: scale(0.95) translateY(-10px);
}
</style>

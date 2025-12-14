<template>
  <Dialog v-model="open">
    <template #title>How it works</template>
    <template #content>
      <ol class="list-decimal pl-5 space-y-2 text-sm text-gray-300">
        <li>Open Binimoy on two devices on the same network.</li>
        <li>Select a device from the grid and confirm the PIN.</li>
        <li>Drag-and-drop to send files, or tap to browse.</li>
      </ol>
    </template>
    <template #footer>
      <button class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10" @click="open=false">Got it</button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import Dialog from '~/components/dialog/Dialog.vue';
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e:'update:modelValue', v: boolean): void }>();
const open = computed({ get:()=>props.modelValue, set:(v)=>emit('update:modelValue', v) });
</script>

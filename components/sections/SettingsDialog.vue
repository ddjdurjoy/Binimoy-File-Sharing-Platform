<template>
  <Dialog v-model="open">
    <template #title>Settings</template>
    <template #content>
      <div class="space-y-3">
        <label class="flex items-center justify-between">
          <span>Dark Mode</span>
          <ThemeSwitcher />
        </label>
        <label class="flex items-center justify-between">
          <span>Language</span>
          <LanguageSwitcher />
        </label>
      </div>
    </template>
    <template #footer>
      <button class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10" @click="open=false">Close</button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import Dialog from '~/components/dialog/Dialog.vue';
import ThemeSwitcher from '~/components/ThemeSwitcher.vue';
import LanguageSwitcher from '~/components/LanguageSwitcher.vue';
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e:'update:modelValue', v: boolean): void }>();
const open = computed({ get:()=>props.modelValue, set:(v)=>emit('update:modelValue', v) });
</script>

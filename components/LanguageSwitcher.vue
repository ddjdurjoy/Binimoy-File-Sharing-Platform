<template>
  <div v-if="i18nEnabled" class="flex items-center">
    <!-- limit to English and Bengali only -->
    <Icon name="material-symbols:translate" class="me-1 dark:text-white" />
    <select
      v-bind:value="localeIdentity"
      class="rounded-lg text-black dark:text-white bg-gray-200 dark:bg-gray-900"
      :style="{ width: `${switchWidth}px` }"
      @change="changeLocale"
    >
      <option
        v-for="(locale, index) in filteredLocales"
        :key="index"
        :value="locale.code"
      >
        {{ locale.name }}
      </option>
    </select>
  </div>

  <div class="absolute top-0 pointer-events-none">
    <!-- dummy select to get the width of the select based on the selected item -->
    <select ref="switch-width" style="visibility: hidden">
      <option>{{ currLocaleName }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n();
// Filter to only en and bn just in case
const filteredLocales = computed(() => locales.value.filter(l => ['en', 'bn'].includes(l.code)));

const switchLocalePath = useSwitchLocalePath();

const localeIdentity = ref("");
const switchWidth = ref(0);
const switchWidthRef = useTemplateRef("switch-width");

const changeLocale = (e: Event) => {
  const target = e.target as HTMLSelectElement;

  // @ts-ignore
  const path = switchLocalePath(target.value);
  navigateTo(path);

  setTimeout(() => {
    switchWidth.value = switchWidthRef.value!.offsetWidth;
  }, 100);
};

const currLocaleName = computed(() => {
  return filteredLocales.value.find((l) => l.code === locale.value)?.name;
});

const i18nEnabled = computed(() => {
  // returns true if the resulting path is not empty
  return switchLocalePath("en");
});

watch(locale, () => {
  localeIdentity.value = locale.value;
});

onMounted(() => {
  localeIdentity.value = locale.value;

  switchWidth.value = switchWidthRef.value!.offsetWidth;
});
</script>

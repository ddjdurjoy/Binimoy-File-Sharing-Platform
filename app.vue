<template>
  <NuxtLayout>
    <NuxtPage />
    <div class="fixed z-50 flex gap-2 items-center px-2.5 py-1.5 rounded-full shadow-md backdrop-blur-md bg-white/70 dark:bg-gray-800/60 border border-black/5 dark:border-white/5"
         style="top: calc(14px + env(safe-area-inset-top)); right: calc(14px + env(safe-area-inset-right))">
      <ThemeSwitcher />
      <div class="w-px h-5 bg-black/10 dark:bg-white/10" />
      <LanguageSwitcher />
    </div>
  </NuxtLayout>
</template>

<style>
:root {
  /* Binimoy brand palette */
  --primary-50: #ecfeff;
  --primary-100: #cffafe;
  --primary-200: #a5f3fc;
  --primary-300: #67e8f9;
  --primary-400: #22d3ee;
  --primary-500: #06b6d4; /* base */
  --primary-600: #0891b2;
  --primary-700: #0e7490;
  --primary-800: #155e75;
  --primary-900: #164e63;
}
.dark:root, .dark {
  --primary-50: #05252c;
  --primary-100: #08323b;
  --primary-200: #0c4450;
  --primary-300: #0f5a69;
  --primary-400: #0ea5b1;
  --primary-500: #06b6d4;
  --primary-600: #22d3ee;
  --primary-700: #67e8f9;
  --primary-800: #a5f3fc;
  --primary-900: #cffafe;
}
</style>

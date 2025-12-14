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

<template>
  <div class="inline-flex items-center select-none">
    <!-- Light mode logo: intended for light backgrounds (White Mode) -->
    <img
      src="/Binimoy Logo - White Mode.png"
      alt="Binimoy Logo"
      class="h-10 md:h-12 dark:hidden"
      loading="eager"
      decoding="async"
    />
    <!-- Dark mode logo: intended for dark backgrounds (Dark Mode) -->
    <img
      src="/Binimoy Logo - Dark Mode.png"
      alt="Binimoy Logo"
      class="h-10 md:h-12 hidden dark:inline"
      loading="eager"
      decoding="async"
    />
  </div>
</template>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500"
  >
    <!-- Gradient Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <!-- Content -->
    <div class="relative z-10 flex items-start gap-4">
      <!-- Icon Container -->
      <div class="flex-shrink-0">
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
          <Icon :name="iconName" class="w-8 h-8 text-white" />
        </div>
      </div>

      <!-- Info Container -->
      <div class="flex-1 min-w-0">
        <!-- Device Name -->
        <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ props.peer.alias }}
        </h3>

        <!-- Device Details -->
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {{ props.peer.deviceModel ?? "Unknown Device" }}
          </span>
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Icon name="material-symbols:cloud-sync" class="w-4 h-4" />
            Connected
          </span>
        </div>

        <!-- Version Info -->
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Version {{ props.peer.version }}
        </p>
      </div>

      <!-- Arrow Indicator -->
      <div class="flex-shrink-0">
        <Icon name="material-symbols:arrow-forward-ios" class="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
      </div>
    </div>

    <!-- Bottom Action Hint -->
    <div class="mt-4 text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      Click to send files →
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ClientInfo } from "@/services/signaling";

const props = defineProps<{
  peer: ClientInfo;
}>();

const iconName = computed(() => {
  switch (props.peer.deviceType) {
    case "mobile":
      return "material-symbols:smartphone";
    case "desktop":
      return "material-symbols:computer";
    case "web":
      return "material-symbols:language";
    case "headless":
      return "material-symbols:terminal";
    case "server":
      return "material-symbols:dns";
    default:
      return "material-symbols:help";
  }
});
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
}

.group:hover .w-16 {
  animation: float 2s ease-in-out;
}
</style>

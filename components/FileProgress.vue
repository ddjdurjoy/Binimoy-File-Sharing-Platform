<template>
  <div class="p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow">
    <!-- File Header -->
    <div class="flex items-start gap-3 mb-3">
      <!-- File Icon -->
      <div class="flex-shrink-0 mt-1">
        <Icon :name="getFileIcon()" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>

      <!-- File Info -->
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 dark:text-white truncate text-sm">
          {{ props.state.name }}
        </p>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ totalBytesFormatted }}
          </p>
          <span 
            v-if="props.state.state !== 'pending'"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="getStatusClass()"
          >
            <Icon :name="getStatusIcon()" class="w-3 h-3" />
            {{ getStatusText() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <ProgressBar :progress="props.state.curr / props.state.total" />

    <!-- Progress Text -->
    <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
      {{ formatBytes(props.state.curr) }} / {{ totalBytesFormatted }}
    </p>

    <!-- Error Message -->
    <p v-if="props.state.error" class="text-xs text-red-600 dark:text-red-400 mt-2">
      Error: {{ props.state.error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatBytes } from "~/utils/fileSize";
import type { FileState } from "~/services/store";

const props = defineProps<{
  state: FileState;
}>();

const totalBytesFormatted = computed(() => {
  return formatBytes(props.state.total);
});

const getFileIcon = () => {
  const name = props.state.name.toLowerCase();
  if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "material-symbols:image";
  if (name.match(/\.(mp4|webm|avi|mov)$/i)) return "material-symbols:video-library";
  if (name.match(/\.(mp3|wav|flac|aac)$/i)) return "material-symbols:audio-file";
  if (name.match(/\.(pdf)$/i)) return "material-symbols:picture-as-pdf";
  if (name.match(/\.(zip|rar|7z|tar|gz)$/i)) return "material-symbols:folder-zip";
  return "material-symbols:file-present";
};

const getStatusClass = () => {
  switch (props.state.state) {
    case "finished":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "skipped":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
    case "sending":
    case "sending":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
  }
};

const getStatusIcon = () => {
  switch (props.state.state) {
    case "finished":
      return "material-symbols:check-circle";
    case "error":
      return "material-symbols:error";
    case "skipped":
      return "material-symbols:skip-next";
    default:
      return "material-symbols:hourglass-empty";
  }
};

const getStatusText = () => {
  switch (props.state.state) {
    case "finished":
      return "Completed";
    case "error":
      return "Failed";
    case "skipped":
      return "Skipped";
    case "sending":
      return "Sending...";
    default:
      return "Pending";
  }
};
</script>

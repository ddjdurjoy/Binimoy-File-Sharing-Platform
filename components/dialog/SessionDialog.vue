<template>
  <Dialog :visible="store.session.state !== SessionState.idle">
    <div class="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
      <!-- Header -->
      <div class="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div class="flex items-center gap-3 mb-2">
          <Icon 
            :name="store.session.state === SessionState.sending ? 'material-symbols:upload' : 'material-symbols:download'" 
            class="w-6 h-6 text-blue-600 dark:text-blue-400"
          />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{
              store.session.state === SessionState.sending
                ? t("index.progress.titleSending")
                : t("index.progress.titleReceiving")
            }}
          </h1>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ store.session.state === SessionState.sending ? 'Uploading to peer' : 'Receiving from peer' }}
        </p>
      </div>

      <!-- Content -->
      <div class="px-6 py-6">
        <!-- Overall Progress -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Progress</p>
            <p class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ totalCurr }} / {{ totalTotal }}</p>
          </div>
          <ProgressBar :progress="store.session.curr / store.session.total" />
          <div class="mt-2 flex items-center justify-between">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ (((store.session.curr / store.session.total) * 100).toFixed(1)) }}% Complete
            </p>
          </div>
        </div>

        <!-- Files List -->
        <div>
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Files:</p>
          <div class="space-y-3 max-h-[400px] overflow-y-auto">
            <FileProgress
              v-for="file in store.session.fileState"
              :key="file.id"
              :state="file"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 rounded-b-2xl">
        <p class="text-xs text-gray-600 dark:text-gray-400 text-center">
          Keep your browser window open until the transfer completes
        </p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { SessionState, store } from "~/services/store";
import { formatBytes } from "~/utils/fileSize";

const { t } = useI18n();

const totalCurr = computed(() => {
  return formatBytes(store.session.curr);
});

const totalTotal = computed(() => {
  return formatBytes(store.session.total);
});
</script>

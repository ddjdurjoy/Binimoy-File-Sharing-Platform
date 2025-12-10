<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <!-- Header -->
    <header class="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                src="/apple-touch-icon.png"
                alt="Binimoy Logo"
                class="h-12 w-12 rounded-xl shadow-lg"
              />
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity"></div>
            </div>
            <div class="flex flex-col">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Binimoy</h1>
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">P2P File Sharing</p>
            </div>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- User Info Card -->
      <div v-if="store.client" class="mb-12">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Your Identity -->
            <div class="flex flex-col">
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Identity</p>
              <div class="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
                <p class="text-3xl font-bold text-gray-900 dark:text-white break-words cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" @click="updateAlias" :title="store.client.alias">
                  {{ store.client.alias }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Click to change</p>
              </div>
            </div>

            <!-- Security PIN -->
            <div class="flex flex-col">
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Security PIN</p>
              <div class="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700 rounded-lg border border-green-200 dark:border-slate-600">
                <p class="text-3xl font-bold text-gray-900 dark:text-white font-mono cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors" @click="updatePIN">
                  {{ store.pin ?? "None" }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Click to {{ store.pin ? 'change' : 'add' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div
        v-if="!store.signaling"
        class="flex flex-col items-center justify-center min-h-96 text-center px-2"
      >
        <div class="mb-6">
          <div class="relative inline-block">
            <div class="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
            <div class="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-500 animate-spin"></div>
          </div>
        </div>
        <h2 v-if="minDelayFinished" class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{
            webCryptoSupported
              ? t("index.connecting")
              : t("index.webCryptoNotSupported")
          }}
        </h2>
        <p v-if="minDelayFinished && webCryptoSupported" class="text-lg text-gray-600 dark:text-gray-400">Please wait while we establish secure connection...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="store.peers.length === 0"
        class="flex flex-col items-center justify-center min-h-96 text-center px-2"
      >
        <div class="mb-8">
          <div class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-700 rounded-3xl flex items-center justify-center">
            <Icon name="material-symbols:devices-other" class="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">{{ t("index.empty.title") }}</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-2">{{ t("index.empty.deviceHint") }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-500">{{ t("index.empty.lanHint") }}</p>
      </div>

      <!-- Peers Grid -->
      <div v-else>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Available Devices</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PeerCard
            v-for="peer in store.peers"
            :key="peer.id"
            :peer="peer"
            @click="selectPeer(peer.id)"
          />
        </div>
      </div>
    </main>

    <!-- Session Dialog -->
    <SessionDialog />
  </div>
</template>

<script setup lang="ts">
import { PeerDeviceType } from "@/services/signaling";
import {
  setupConnection,
  startSendSession,
  store,
  updateAliasState,
} from "@/services/store";
import { getAgentInfoString } from "~/utils/userAgent";
import { protocolVersion } from "~/services/webrtc";
import { generateRandomAlias } from "~/utils/alias";
import { useFileDialog } from "@vueuse/core";
import SessionDialog from "~/components/dialog/SessionDialog.vue";
import LanguageSwitcher from "~/components/LanguageSwitcher.vue";
import ThemeSwitcher from "~/components/ThemeSwitcher.vue";
import {
  cryptoKeyToPem,
  generateClientTokenFromCurrentTimestamp,
  generateKeyPair,
  isWebCryptoSupported,
  upgradeToEd25519IfSupported,
} from "~/services/crypto";

definePageMeta({
  title: "index.seo.title",
  description: "index.seo.description",
});

const { t } = useI18n();

const { open: openFileDialog, onChange } = useFileDialog();

onChange(async (files) => {
  if (!files) return;

  if (files.length === 0) return;

  if (!store.signaling) return;

  await startSendSession({
    files,
    targetId: targetId.value,
    onPin: async () => {
      return prompt(t("index.enterPin"));
    },
  });
});

const minDelayFinished = ref(false);
const webCryptoSupported = ref(true);

const targetId = ref("");

const selectPeer = (id: string) => {
  targetId.value = id;
  openFileDialog();
};

const updateAlias = async () => {
  if (!store.client) return;

  const current = store.client;
  if (!current) return;

  const alias = prompt(t("index.enterAlias"), current.alias);
  if (!alias || !store.signaling) return;

  store.signaling.send({
    type: "UPDATE",
    info: {
      alias: alias,
      version: current.version,
      deviceModel: current.deviceModel,
      deviceType: current.deviceType,
      token: current.token,
    },
  });

  updateAliasState(alias);
};

const updatePIN = async () => {
  const pin = prompt(t("index.enterPin"));
  if (typeof pin === "string") {
    store.pin = pin ? pin : null;
  }
};

onMounted(async () => {
  webCryptoSupported.value = isWebCryptoSupported();

  setTimeout(() => {
    // to prevent flickering during initial connection
    // i.e. show blank screen instead of "Connecting..."
    minDelayFinished.value = true;
  }, 1000);

  if (!webCryptoSupported.value) {
    console.error("Web Crypto API is not supported in this browser.");
    return;
  }

  await upgradeToEd25519IfSupported();

  store.key = await generateKeyPair();

  console.log(await cryptoKeyToPem(store.key.publicKey));

  const userAgent = navigator.userAgent;
  const token = await generateClientTokenFromCurrentTimestamp(store.key);

  const info = {
    alias: generateRandomAlias(),
    version: protocolVersion,
    deviceModel: getAgentInfoString(userAgent),
    deviceType: PeerDeviceType.web,
    token: token,
  };

  await setupConnection({
    info,
    onPin: async () => {
      return prompt(t("index.enterPin"));
    },
  });
});
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div {
  animation: slideIn 0.3s ease-out;
}
</style>

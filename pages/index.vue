<template>
  <div class="dark:text-white flex flex-col min-h-screen">
    <div class="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 bg-white/80 dark:bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <Logo />
      <div class="flex flex-col justify-center">
        <h1 class="text-2xl md:text-3xl font-semibold tracking-tight">Binimoy Web</h1>
        <h2 class="leading-none mt-0.5 text-sm md:text-base text-gray-600 dark:text-gray-300">Peer-to-Peer File Sharing</h2>
      </div>
    </div>

    <div v-if="store.client" class="px-4 mt-4">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ t("index.you") }}</p>
                <button class="mt-1 inline-flex items-center gap-2 text-base font-semibold hover:underline"
                        @click="updateAlias">
                  <Icon name="mdi:account" />
                  {{ store.client.alias }}
                </button>
              </div>
              <Icon name="mdi:pencil" class="opacity-60" />
            </div>
          </div>
          <div class="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ t("index.pin.label") }}</p>
                <button class="mt-1 inline-flex items-center gap-2 text-base font-semibold hover:underline"
                        @click="updatePIN">
                  <Icon name="mdi:key-variant" />
                  {{ store.pin ?? t("index.pin.none") }}
                </button>
              </div>
              <Icon name="mdi:pencil" class="opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!store.signaling"
      class="flex-1 flex flex-col items-center justify-center text-center px-2"
    >
      <h3 v-if="minDelayFinished" class="text-3xl">
        {{
          webCryptoSupported
            ? t("index.connecting")
            : t("index.webCryptoNotSupported")
        }}
      </h3>
    </div>

    <div
      v-else-if="store.peers.length === 0"
      class="flex-1 flex flex-col items-center justify-center text-center px-6"
    >
      <Icon name="mdi:lan-connect" class="text-[56px] opacity-70" />
      <h3 class="text-2xl font-semibold mt-2">{{ t("index.empty.title") }}</h3>
      <p class="mt-2 text-gray-600 dark:text-gray-300 max-w-xl">{{ t("index.empty.deviceHint") }}</p>
      <p class="text-gray-600 dark:text-gray-300">{{ t("index.empty.lanHint") }}</p>
    </div>

    <div v-else class="flex justify-center px-3 sm:px-4 pb-10">
      <div class="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PeerCard
          v-for="peer in store.peers"
          :key="peer.id"
          :peer="peer"
          class="mb-0"
          @click="selectPeer(peer.id)"
        />
      </div>
    </div>

    <SessionDialog />
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Logo from "~/components/Logo.vue";
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

<style>
/* moved global variables to app.vue */
:root {
  /* Primary palette tuned to match Binimoy brand */
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
  --primary-50: #0b1f24;
  --primary-100: #0e2b33;
  --primary-200: #114050;
  --primary-300: #155e75;
  --primary-400: #0ea5b1;
  --primary-500: #06b6d4;
  --primary-600: #22d3ee;
  --primary-700: #67e8f9;
  --primary-800: #a5f3fc;
  --primary-900: #cffafe;
}
</style>

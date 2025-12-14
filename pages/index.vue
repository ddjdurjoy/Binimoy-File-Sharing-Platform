<template>
  <div class="dark:text-white flex flex-col min-h-screen">
    <ToastHost />
    <div class="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 bg-[#0A0E1A]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-white/5">
      <Logo />
      <div class="flex flex-col justify-center">
        <h1 class="text-2xl md:text-3xl font-semibold tracking-tight">Binimoy Web</h1>
        <h2 class="leading-none mt-0.5 text-sm md:text-base text-gray-300">Peer-to-Peer File Sharing</h2>
      </div>
    </div>

    <HeroSection />

    <div v-if="store.client" class="px-4 mt-4">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IdentityCard :alias="store.client.alias" @edit="updateAlias" />
          <PinCard :pin="store.pin" @edit="updatePIN" />
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

    <div v-else-if="store.peers.length === 0" class="flex-1 px-4">
      <DeviceGrid :peers="[]">
        <template #skeleton>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <SkeletonBlock v-for="n in 6" :key="n" block-class="h-24 bg-white/5 border border-white/10" />
          </div>
        </template>
      </DeviceGrid>
    </div>

    <div v-else class="flex justify-center px-3 sm:px-4 pb-10" id="devices">
      <div class="w-full max-w-6xl">
        <DeviceGrid :peers="store.peers" @select="selectPeer">
          <template #skeleton />
        </DeviceGrid>
      </div>
      <div class="w-full max-w-6xl"><DeviceGrid :peers="store.peers" @select="selectPeer" /></div>
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
import ToastHost from "~/components/ui/ToastHost.vue";
import HeroSection from "~/components/sections/HeroSection.vue";
import IdentityCard from "~/components/sections/IdentityCard.vue";
import PinCard from "~/components/sections/PinCard.vue";
import DeviceGrid from "~/components/sections/DeviceGrid.vue";
import UploadZone from "~/components/sections/UploadZone.vue";
import FeaturesShowcase from "~/components/sections/FeaturesShowcase.vue";
import Logo from "~/components/Logo.vue";
import { PeerDeviceType } from "@/services/signaling";
import SkeletonBlock from "~/components/ui/SkeletonBlock.vue";
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

const onFilesPicked = (picked: FileList) => { filesToSend.value = picked; };
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

<template>
  <section class="px-4 lg:px-6 py-10" aria-labelledby="features">
    <h2 id="features" class="text-xl font-semibold">Why Binimoy?</h2>
    <div class="mt-4 grid sm:grid-cols-3 gap-4">
      <div class="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur">
        <Icon name="mdi:account-off-outline" class="text-2xl" />
        <h3 class="mt-2 font-semibold">No account required</h3>
        <p class="text-sm text-gray-300">Just open and share. No sign ups, no hassle.</p>
      </div>
      <div class="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur">
        <Icon name="mdi:shield-lock-outline" class="text-2xl" />
        <h3 class="mt-2 font-semibold">End-to-end encrypted</h3>
        <p class="text-sm text-gray-300">Your files never touch a server unencrypted.</p>
      </div>
      <div class="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur">
        <Icon name="mdi:flash-outline" class="text-2xl" />
        <h3 class="mt-2 font-semibold">Lightning fast</h3>
        <p class="text-sm text-gray-300">Direct, local connections for maximum speed.</p>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

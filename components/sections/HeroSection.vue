<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.35),transparent_60%)] blur-2xl"></div>
      <div class="absolute top-20 -left-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_60%)] blur-2xl"></div>
    </div>
    <div class="grid lg:grid-cols-2 gap-6 items-center py-6 lg:py-10">
      <div class="px-4 lg:px-6">
        <h1 class="text-3xl lg:text-5xl font-extrabold tracking-tight">Share files instantly with Binimoy</h1>
        <p class="mt-3 text-gray-300">Peer-to-peer, end-to-end encrypted, blazingly fast. No accounts, no limits, just share.</p>
        <div class="mt-5 flex gap-3">
          <a href="#upload" class="px-5 py-3 rounded-xl bg-[#0066FF] hover:brightness-110 transition text-white shadow-glow">Send files</a>
          <a href="#devices" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition text-white border border-white/10">Connect device</a>
        </div>
      </div>
      <div class="px-4 lg:px-6">
        <div class="relative rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur">
          <div class="absolute -top-3 -right-3 px-2 py-1 rounded-full text-xs bg-[#8B5CF6] text-white">P2P</div>
          <svg viewBox="0 0 400 200" class="w-full h-[220px]" role="img" aria-label="P2P Illustration">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0066FF"/>
                <stop offset="100%" stop-color="#8B5CF6"/>
              </linearGradient>
            </defs>
            <circle cx="70" cy="100" r="26" fill="url(#g1)" class="animate-float" />
            <circle cx="330" cy="60" r="22" fill="url(#g1)" style="animation-delay:.4s" class="animate-float" />
            <circle cx="320" cy="150" r="18" fill="url(#g1)" style="animation-delay:.8s" class="animate-float" />
            <path d="M96 100 Q200 60 308 58" stroke="url(#g1)" stroke-width="3" fill="none" />
            <path d="M96 100 Q210 100 302 148" stroke="url(#g1)" stroke-width="3" fill="none" />
          </svg>
          <p class="text-sm text-gray-300">Direct browser-to-browser connections using WebRTC.</p>
        </div>
      </div>
    </div>
  </section>
</template>
<style>
.animate-float{ animation: float 6s ease-in-out infinite; }
</style>

<template>
  <section class="px-4 lg:px-6 py-6" aria-labelledby="upload" id="upload">
    <h2 id="upload" class="text-xl font-semibold">Upload files</h2>
    <div ref="drop" class="mt-3 rounded-2xl p-6 border-2 border-dashed border-white/15 bg-white/5 backdrop-blur text-center transition shadow-inner"
         :class="dragOver ? 'border-[#0066FF]/50 shadow-glow' : ''"
         @click="pick">
      <input ref="input" type="file" class="hidden" multiple @change="onPick" />
      <Icon name="mdi:cloud-upload-outline" class="text-4xl mx-auto" />
      <p class="mt-2">Drag & drop files here or click to browse</p>
      <p class="text-sm text-gray-400">Up to your browser limits. Encrypted end-to-end.</p>
    </div>

    <div v-if="files.length" class="mt-4 grid gap-3">
      <div v-for="f in files" :key="f.id" class="rounded-xl bg-white/5 border border-white/10 p-3">
        <div class="flex items-center gap-3">
          <Icon name="mdi:file-outline" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ f.file.name }}</p>
            <ProgressBar :progress="f.progress" />
          </div>
          <button class="text-sm opacity-80 hover:opacity-100" @click="remove(f.id)"><Icon name="mdi:close"/></button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import ProgressBar from '~/components/ProgressBar.vue';

const emit = defineEmits<{ (e:'files', files: FileList): void; (e:'readyToSend'): void }>();
const input = ref<HTMLInputElement|null>(null);
const drop = ref<HTMLElement|null>(null);
const dragOver = ref(false);
const files = ref<{ id: number, file: File, progress: number }[]>([]);
let id = 0;
function pick(){ input.value?.click(); }
function onPick(e: Event){ const target = e.target as HTMLInputElement; if(target.files) { emit('files', target.files); addFiles(target.files); target.value = ''; } }
function remove(fid:number){ files.value = files.value.filter(x=>x.id!==fid); }
function addFiles(list: FileList){ for(const f of Array.from(list)){ files.value.push({ id: ++id, file: f, progress: 0 }); } emit('readyToSend'); }

onMounted(() => {
  if(!drop.value) return;
  const el = drop.value;
  const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const ondrag = (e: DragEvent) => { prevent(e); dragOver.value = true; };
  const onleave = (e: DragEvent) => { prevent(e); dragOver.value = false; };
  const ondrop = (e: DragEvent) => {
    prevent(e); dragOver.value = false; if(e.dataTransfer?.files){ emit('files', e.dataTransfer.files); addFiles(e.dataTransfer.files); }
  };
  el.addEventListener('dragover', ondrag); el.addEventListener('dragenter', ondrag);
  el.addEventListener('dragleave', onleave); el.addEventListener('drop', ondrop);
});
</script>

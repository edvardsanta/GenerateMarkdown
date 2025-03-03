<template>
  <div>
    <button
      class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white"
      @click="triggerFileInput"
    >
      Open File
    </button>
    <input
      ref="fileInputRef"
      type="file"
      accept=".md,.markdown,.txt"
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TextHandlingService } from '~/services/TextHandlingService';

const emit = defineEmits(['file-loaded']);
const fileInputRef = ref<HTMLInputElement | null>(null);
const textService = new TextHandlingService();

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  
  if (!input.files || input.files.length === 0) {
    return;
  }
  
  const file = input.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    if (!e.target || typeof e.target.result !== 'string') {
      return;
    }
    
    const content = e.target.result;
    const { sections, hasTOC } = textService.parseMarkdownContent(content);
    
    // Emit the loaded file data
    emit('file-loaded', {
      fileName: file.name.replace(/\.(md|markdown|txt)$/, ''),
      sections,
      includeTOC: hasTOC
    });
    
    // Reset the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  };
  
  reader.readAsText(file);
};
</script>
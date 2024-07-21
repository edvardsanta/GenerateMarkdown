<template>
  <div class="flex flex-row gap-4 p-4">
    <div class="flex-1">
      <input
        type="file"
        accept=".md"
        class="mb-4 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-300"
        @change="handleFileUpload"
      >
      <MarkdownEditor
        class="w-full h-full bg-white p-4 border border-gray-300 rounded-lg shadow-inner"
        :markdown-content="markdownContent"
        @update:markdown-content="handleMarkdownChange"
      />
    </div>

    <div class="flex-1 bg-white p-4 border border-gray-300 rounded-md">
      <DisplayMarkdown :markdown-content="markdownContent" />
      <DownloadMarkdown :markdown-content="markdownContent" class="mt-4" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const markdownContent = ref<string>("");

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;
    markdownContent.value = content;
  };

  reader.readAsText(file);
};

const handleMarkdownChange = (newContent: string) => {
  markdownContent.value = newContent;
};
</script>

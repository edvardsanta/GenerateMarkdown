<template>
  <div class="flex flex-row gap-4 p-4">
    <div class="flex-1">
      <MarkdownEditor
        class="w-full h-full"
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
const markdownContent = ref<string>();

const handleMarkdownChange = ((newContent: string) => {
  console.log(newContent);
  markdownContent.value = newContent;
})
</script>

<style></style>

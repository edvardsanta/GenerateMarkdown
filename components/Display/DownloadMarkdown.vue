<template>
  <div
    class="download-markdown flex items-center justify-between p-4 border-t border-gray-200 mt-4"
  >
    <input
      v-model="fileName"
      type="text"
      placeholder="Enter filename (without extension)"
      class="mr-2 px-3 py-2 border border-gray-300 rounded-md flex-1"
    >
    <button
      class="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      @click="downloadMarkdown"
    >
      Download Markdown
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  markdownContent: String(""),
});

const fileName = ref("");

function downloadMarkdown() {
  if (!props.markdownContent || !fileName.value.trim()) {
    alert("Please enter a filename to download.");
    return;
  }
  const blob = new Blob([props.markdownContent], { type: "text/markdown" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${fileName.value.trim()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
</script>

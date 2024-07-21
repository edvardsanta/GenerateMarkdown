<template>
  <button
    class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded opacity-75 hover:opacity-100 transition-opacity duration-150"
    @click="copyToClipboard"
  >
    Copy Markdown
  </button>
</template>

<script lang="ts" setup>
const props = defineProps({
  markdownContent: {
    type: String,
    default: () => "",
  },
});

const copyToClipboard = async () => {
  try {
    if (!props.markdownContent) return;
    await navigator.clipboard.writeText(props.markdownContent);
    alert("Markdown copied to clipboard!");
  } catch (err) { /* empty */ }
};
</script>

<style></style>

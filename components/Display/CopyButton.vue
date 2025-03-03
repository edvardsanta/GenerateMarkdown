<template>
  <button
    class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded opacity-75 hover:opacity-100 transition-opacity duration-150 flex items-center gap-2"
    @click="copyToClipboard"
  >
    <FontAwesomeIcon :icon="copyIcon" />
    <span>{{ buttonText }}</span>
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  markdownContent: {
    type: String,
    default: () => "",
  },
});

const copyIcon = ref('fa-solid fa-copy');
const buttonText = ref('Copy Markdown');

const copyToClipboard = async () => {
  try {
    if (!props.markdownContent) return;
    
    await navigator.clipboard.writeText(props.markdownContent);
    
    copyIcon.value = 'fa-solid fa-check';
    buttonText.value = 'Copied!';

    setTimeout(() => {
      copyIcon.value = 'fa-solid fa-copy';
      buttonText.value = 'Copy Markdown';
    }, 2000);
  } catch (err) { /* empty */ }
};
</script>

<style></style>
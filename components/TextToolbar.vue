<template>
  <div class="text-toolbar p-2 bg-gray-200 bg-opacity-50 rounded-lg shadow">
    <button class="p-2 bg-gray-800 text-white rounded hover:bg-blue-700 transition-colors" @click="addLink">
      <font-awesome :icon="faLink" />
    </button>
    <button class="p-2 ml-2 bg-gray-800 text-white rounded hover:bg-green-700 transition-colors" @click="addCodeBlock">
      <font-awesome :icon="faCode" />
    </button>
    <button class="p-2 ml-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors" @click="addBreakLine">
      <font-awesome :icon="faMinus" />  
    </button>
  </div>
</template>

<script setup>
import {faCode, faLink, faMinus} from '@fortawesome/free-solid-svg-icons'
const selectedText = inject('selectedText');
const updateText = inject('updateText');
const currentIndex = inject('currentIndex'); 
const addLink = () => {
  const url = prompt("Enter the URL:");
  if (selectedText.value && url) {
    const markdownLink = `[${selectedText.value}](${url})`;
    updateText(markdownLink, currentIndex.value); 
  }
};

const addCodeBlock = () => {
  if (selectedText.value) {
    const markdownCode = `\`\`\`\n${selectedText.value}\n\`\`\``;
    updateText(markdownCode, currentIndex.value); 
  }
};

// TODO: That is not working yet
const addBreakLine = () => {
  const breakLineMarkdown = "  \n"; 
  updateText(breakLineMarkdown, currentIndex.value); 
};
</script>

<template>
  <div
    class="max-w-2xl mx-auto my-8 p-4 border border-gray-200 rounded-lg shadow"
  >
    <DisplayCopyButton :markdown-content="markdownContent" />

    <label class="block mb-4 text-right">
      <input v-model="showCode" type="checkbox" class="mr-2 leading-tight" >
      <span>Show Markdown Code</span>
    </label>

    <div v-if="showCode" class="p-4 bg-gray-100 rounded">
      <pre class="whitespace-pre-wrap overflow-auto">{{ markdownContent }}</pre>
    </div>

    <div v-else class="prose" v-html="renderedHtml" />
  </div>
</template>

<script setup lang="ts">
import { remark } from "remark";
import html from "remark-html";

const props = defineProps({
  markdownContent: String,
});
const showCode = ref(false);
const renderedHtml = ref("");

watchEffect(async () => {
  if (props.markdownContent) {
    try {
      const processedContent = await remark()
        .use(html)
        .process(props.markdownContent);
      renderedHtml.value = processedContent.toString();
    } catch (error) {
      /* empty */
    }
  }
});
</script>

<style></style>

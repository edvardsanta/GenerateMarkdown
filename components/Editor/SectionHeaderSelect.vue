<template>
  <select
    v-model="section.headerLevel"
    class="mb-2 w-full px-2 py-1 border border-gray-300 rounded-md"
    @change="$emit('change')"
  >
    <option value="1">H1</option>
    <option value="2">H2</option>
    <option value="3">H3</option>
    <option value="4">H4</option>
    <option value="5">H5</option>
  </select>
</template>

<script setup lang="ts">
import type { MarkdownSection } from "~/models/MarkdownSection";

defineProps<{
  section: MarkdownSection;
}>();

defineEmits(["change"]);
</script>

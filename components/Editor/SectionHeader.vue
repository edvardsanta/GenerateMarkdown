<!-- components/Markdown/Editor/SectionHeader.vue -->
<template>
  <button
    class="w-full text-left py-2 px-4 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
    @click="$emit('toggle-section')"
  >
    Seção {{ index + 1 }} - {{ section.title || "Sem Título" }}
    <span v-if="section.hasUnsavedChanges" class="ml-1 text-red-500">*</span>
  </button>
</template>

<script setup lang="ts">
import type { MarkdownSection } from "~/models/MarkdownSection";

defineProps<{
  section: MarkdownSection;
  index: number;
}>();

defineEmits(['toggle-section']);
</script>
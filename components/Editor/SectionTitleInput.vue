<!-- components/Markdown/Editor/SectionTitleInput.vue -->
<template>
  <input
    :value="section.title"
    placeholder="Título da Seção"
    class="w-full mb-2 px-2 py-1 border border-gray-300 rounded-md"
    @input="handleInput"
  >
</template>

<script setup lang="ts">
import type { MarkdownSection } from "~/models/MarkdownSection";

defineProps<{
  section: MarkdownSection;
}>();

const emit = defineEmits(['input', 'update:title']);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:title', target.value);
  emit('input');
};
</script>
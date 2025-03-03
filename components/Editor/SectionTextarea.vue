<template>
  <textarea
    v-model="section.content"
    placeholder="Conteúdo da Seção"
    class="w-full h-32 mb-3 px-2 py-1 border border-gray-300 rounded-md"
    @select="$emit('select', $event)"
    @keydown="$emit('keydown', $event)"
    @input="$emit('input')"
  />
</template>

<script setup lang="ts">
import type { MarkdownSection } from "~/models/MarkdownSection";

defineProps<{
  section: MarkdownSection;
}>();

defineEmits(['select', 'keydown', 'input']);
</script>
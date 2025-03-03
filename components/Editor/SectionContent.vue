<template>
  <div
    class="p-4 border border-gray-300 rounded-md mt-2"
    :data-section-id="`${tabId}-section-${section.id}`"
  >
    <SectionTitleInput
      :section="section"
      @update:title="updateSectionTitle"
      @input="handleSectionTitleChange"
    />

    <SectionHeaderSelect
      :section="section"
      @change="handleSectionHeaderChange"
    />

    <TextToolbar
      :selected-text="selectedText"
      @insert="handleInsert"
      @format="handleFormat"
    />

    <SectionTextarea
      :section="section"
      @select="handleSelect"
      @keydown="handleKeyDown"
      @input="handleSectionContentChange"
    />

    <div class="flex justify-between mt-2">
      <button
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring"
        @click="$emit('remove-section')"
      >
        Remover Seção
      </button>

      <button
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring"
        @click="$emit('add-section')"
      >
        Adicionar Seção Abaixo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { MarkdownSection } from "~/models/MarkdownSection";
import { TextHandlingService } from "~/services/TextHandlingService";
import SectionTitleInput from "@/components/Editor/SectionTitleInput.vue";
import SectionHeaderSelect from "@/components/Editor/SectionHeaderSelect.vue";
import SectionTextarea from "@/components/Editor/SectionTextarea.vue";
import TextToolbar from "@/components/Editor/TextToolbar.vue";
const props = defineProps<{
  tabId: string;
  section: MarkdownSection;
  index: number;
}>();

const emit = defineEmits([
  "remove-section",
  "add-section",
  "section-change",
  "section-title-change",
  "section-header-change",
  "section-content-change",
]);

// Service for handling text operations
const textService = new TextHandlingService();

// State
const selectedText = ref("");

// Event handlers
const handleSectionTitleChange = () => {
  emit("section-title-change");
};

const handleSectionHeaderChange = () => {
  emit("section-header-change");
};

const handleSectionContentChange = () => {
  emit("section-content-change");
};

// Handle text selection in textareas
const handleSelect = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  selectedText.value = textarea.value.substring(
    textarea.selectionStart,
    textarea.selectionEnd
  );
};

// Handle key down events (Tab indentation, etc.)
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Tab") {
    event.preventDefault();

    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = { start, end };

    // Handle indentation
    let result;
    if (event.shiftKey) {
      result = textService.unindent(props.section.content, selection);
    } else {
      result = textService.indent(props.section.content, selection);
    }

    props.section.content = result.text;
    props.section.hasUnsavedChanges = true;

    nextTick(() => {
      textarea.selectionStart = result.selection.start;
      textarea.selectionEnd = result.selection.end;
      textarea.focus();
    });

    emit("section-content-change");
  }
};
// Handle inserting content from toolbar
const handleInsert = (content: string) => {
  const textarea = document.querySelector(
    `[data-section-id="${props.tabId}-section-${props.section.id}"] textarea`
  ) as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selection = { start, end };

  const result = textService.insertContent(
    content,
    props.section.content,
    selection
  );
  props.section.content = result.text;
  props.section.hasUnsavedChanges = true;

  nextTick(() => {
    textarea.selectionStart = result.selection.start;
    textarea.selectionEnd = result.selection.end;
    textarea.focus();
  });

  emit("section-content-change");
};

// Handle formatting (e.g., tables)
const handleFormat = (formattedContent: string) => {
  if (!selectedText.value) return;

  const textarea = document.querySelector(
    `[data-section-id="${props.tabId}-section-${props.section.id}"] textarea`
  ) as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newText =
    props.section.content.substring(0, start) +
    formattedContent +
    props.section.content.substring(end);

  props.section.content = newText;
  props.section.hasUnsavedChanges = true;

  nextTick(() => {
    textarea.selectionStart = start;
    textarea.selectionEnd = start + formattedContent.length;
    textarea.focus();
  });

  emit("section-content-change");
};

const updateSectionTitle = (newTitle: string) => {
  props.section.title = newTitle; // It's OK to modify the prop here since we own it
};
</script>

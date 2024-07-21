<template>
  <div>
    <!-- TODO: Criar tabela de conteudo novamente, ta duplicando -->
    <!-- <TOCCheckbox :include-toc="includeTOC" @update:includeTOC="updateIncludeTOC" /> -->

    <div v-for="(section, index) in sections" :key="index" class="mb-6">
      <button
        class="w-full text-left py-2 px-4 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click="toggleSection(index)"
      >
        Section {{ sectionsInfo[index].number }} - {{ sectionsInfo[index].title }}
      </button>

      <div
        v-show="section.visible"
        class="p-4 border border-gray-300 rounded-md mt-2"
      >
        <input
          v-model="section.title"
          placeholder="Section Title"
          class="section-title w-full mb-2 px-2 py-1 border border-gray-300 rounded-md"
        >
        <select
          v-model="section.headerLevel"
          class="mb-2 w-full px-2 py-1 border border-gray-300 rounded-md"
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
        </select>
        <TextToolbar />
        <textarea
          v-model="section.content"
          placeholder="Section Content"
          class="section-content w-full h-32 mb-3 px-2 py-1 border border-gray-300 rounded-md"
          @select="handleSelect($event)"
        />
        <button
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring"
          @click="removeSection(index)"
        >
          Remove Section
        </button>

        <button
          class="ml-4 py-1 px-2 bg-green-500 text-white rounded focus:outline-none"
          @click="addSection(index + 1)"
        >
          Add Section Below
        </button>
      </div>
    </div>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring"
      @click="addSection(sections.length)"
    >
      Add Section
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch, defineProps, defineEmits } from "vue";

const props = defineProps<{ markdownContent: string }>();

interface MarkdownSection {
  headerLevel: string;
  title: string;
  content: string;
  visible: boolean;
}

const sections = ref<MarkdownSection[]>([
  { headerLevel: "1", title: "", content: "", visible: true },
]);

const includeTOC = ref(false);
const isFileContent = ref(false);

const sectionsInfo = computed(() => {
  return sections.value.map((section, index) => {
    return {
      number: index + 1,
      title: section.title || "Untitled",
    };
  });
});

const addSection = (index: number) => {
  sections.value.splice(index, 0, {
    headerLevel: "1",
    title: "",
    content: "",
    visible: true,
  });
};

const toggleSection = (index: number) => {
  sections.value[index].visible = !sections.value[index].visible;
};

const removeSection = (index: number) => {
  sections.value.splice(index, 1);
};

const generateTOC = (sections: MarkdownSection[]) => {
  return sections
    .map((section) => {
      const sanitizedTitle = section.title.replace(/\s/g, "-").toLowerCase();
      const indentation = "  ".repeat(parseInt(section.headerLevel) - 1);
      return `${indentation}- [${section.title}](#${sanitizedTitle})`;
    })
    .join("\n");
};

const markdownOutput = computed(() => {
  let content = sections.value
    .map((section) => {
      const headerPrefix = "#".repeat(parseInt(section.headerLevel));
      return `${headerPrefix} ${section.title}\n${section.content}`;
    })
    .join("\n\n");

  if (includeTOC.value) {
    const toc = generateTOC(sections.value);
    content = `## Table of Contents\n${toc}\n\n` + content;
  }
  return content;
});

const emit = defineEmits(["update:markdown-content"]);

watch(markdownOutput, (newValue) => {
  if (!isFileContent.value) {
    emit("update:markdown-content", newValue);
  }
});

const selectedText = ref("");
const currentIndex = ref(0);
provide("currentIndex", currentIndex);

const updateText = (newText: string, index: number) => {
  const currentSection = sections.value[index];
  currentSection.content = currentSection.content.replace(
    selectedText.value,
    newText
  );
};

provide("selectedText", selectedText);
provide("updateText", updateText);

const handleSelect = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  selectedText.value = textarea.value.substring(
    textarea.selectionStart,
    textarea.selectionEnd
  );
};

watch(
  () => props.markdownContent,
  (newContent) => {
    if (!newContent || includeTOC.value) return;

    isFileContent.value = true;
    const newSections: MarkdownSection[] = [];
    let currentSection: MarkdownSection | null = null;

    newContent.split("\n").forEach((line) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        if (currentSection) {
          newSections.push(currentSection);
        }
        currentSection = {
          headerLevel: String(headerMatch[1].length),
          title: headerMatch[2],
          content: "",
          visible: true,
        };
      } else if (currentSection) {
        currentSection.content += `${line}\n`;
      }
    });

    if (currentSection) {
      newSections.push(currentSection);
    }

    sections.value = newSections.map((section) => ({
      ...section,
      content: section.content.trim(),
    }));

    isFileContent.value = false;
  },
  { immediate: true }
);
// const updateIncludeTOC = (newValue: boolean) => {
//   if (includeTOC.value !== newValue) {
//     includeTOC.value = newValue;
//   }
// };
</script>

<style scoped></style>

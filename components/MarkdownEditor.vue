<template>
  <div>
    <label class="block mb-4 flex items-center">
      <input type="checkbox" v-model="includeTOC" class="mr-2" />
      <span>Include Table of Contents</span>
    </label>

    <div v-for="(section, index) in sections" :key="index" class="mb-6">
      <button
        @click="toggleSection(index)"
        class="w-full text-left py-2 px-4 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Section {{ sectionsInfo[index].number }} -
        {{ sectionsInfo[index].title }}
      </button>

      <div
        v-show="section.visible"
        class="p-4 border border-gray-300 rounded-md mt-2"
      >
        <input
          v-model="section.title"
          placeholder="Section Title"
          class="section-title w-full mb-2 px-2 py-1 border border-gray-300 rounded-md"
        />
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
        <textarea
          v-model="section.content"
          placeholder="Section Content"
          class="section-content w-full h-32 mb-3 px-2 py-1 border border-gray-300 rounded-md"
        ></textarea>
        <button
          @click="removeSection(index)"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring"
        >
          Remove Section
        </button>
      </div>
    </div>

    <button
      @click="addSection"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring"
    >
      Add Section
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface MarkdownSection {
  headerLevel: string;
  title: string;
  content: string;
  visible: boolean;
}
const sectionsInfo = computed(() => {
  return sections.value.map((section, index) => {
    return {
      number: index + 1,
      title: section.title || "Untitled",
    };
  });
});

const sections = ref<MarkdownSection[]>([
  { headerLevel: "1", title: "", content: "", visible: true },
]);
const includeTOC = ref(false);

const addSection = () => {
  sections.value.push({
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
const emit = defineEmits(["update:markdownContent"]);

watch(markdownOutput, (newValue) => {
  emit("update:markdownContent", newValue);
});
</script>

<style scoped></style>

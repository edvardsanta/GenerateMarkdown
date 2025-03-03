
<template>
  <div :key="`editor-${tabId}`">
    <TOCToggle 
      :tab-id="tabId" 
      :include-t-o-c="localIncludeTOC"
      @toc-change="handleTOCChange" 
    />

    <SectionsList 
      :tab-id="tabId"
      :sections="localSections"
      :active-section="activeSection"
      @toggle-section="toggleSection"
      @add-section="addSection"
      @remove-section="removeSection"
      @section-change="handleSectionChange"
      @section-title-change="handleSectionTitleChange"
      @section-header-change="handleSectionHeaderChange"
      @section-content-change="handleSectionContentChange"
    />

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring mt-4"
      @click="addSection(localSections.length)"
    >
      Adicionar Seção
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import type { MarkdownSection } from "~/models/MarkdownSection";
import type { Tab } from "~/models/TabModels";
import SectionsList from "./Editor/SectionsList.vue";
import TOCToggle from "./Editor/TOCToggle.vue";
// Props with explicit tab id to ensure isolation
const props = defineProps<{
  tab: Tab;
  tabId: string;
}>();

const emit = defineEmits(["section-change", "sections-update", "toc-change"]);

// State variables - each editor has its own independent state
const localSections = ref<MarkdownSection[]>([]);
const localIncludeTOC = ref(false);
const activeSection = ref<number | null>(0);
const isInitializing = ref(true);

const initializeEditor = () => {
  isInitializing.value = true;

  // Deep clone to avoid shared references
  localSections.value =
    props.tab.sections && props.tab.sections.length > 0
      ? JSON.parse(JSON.stringify(props.tab.sections))
      : [initializeBlankSection()];

  // Local TOC configuration from the tab
  localIncludeTOC.value = props.tab.includeTOC || false;
  isInitializing.value = false;
};

// Initialize with a blank section if no content
const initializeBlankSection = (): MarkdownSection => {
  return {
    id: generateUniqueId(),
    headerLevel: "1",
    title: "",
    content: "",
    hasUnsavedChanges: false,
  };
};

// Generate a unique ID for new sections
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Add a new section
const addSection = (index: number) => {
  const newSection = initializeBlankSection();
  localSections.value.splice(index, 0, newSection);
  activeSection.value = index;
  emitSectionsUpdate();
};

// Toggle section visibility
const toggleSection = (index: number) => {
  if (activeSection.value === index) {
    activeSection.value = null;
  } else {
    activeSection.value = index;
  }
};

// Remove a section
const removeSection = (index: number) => {
  if (localSections.value.length <= 1) {
    // Don't remove the last section
    alert("Cannot remove the last section");
    return;
  }

  localSections.value.splice(index, 1);
  if (activeSection.value !== null) {
    if (activeSection.value === index) {
      activeSection.value = Math.min(index, localSections.value.length - 1);
    } else if (activeSection.value > index) {
      activeSection.value -= 1;
    }
  }

  emitSectionsUpdate();
};

// Handle section changes with debounce
const debouncedEmitSectionsUpdate = useDebounceFn(() => {
  if (!isInitializing.value) {
    emitSectionsUpdate();
  }
}, 300);

// Handle TOC checkbox changes
const handleTOCChange = (includeTOC: boolean) => {
  localIncludeTOC.value = includeTOC;
  emit("toc-change", { tabId: props.tabId, includeTOC: localIncludeTOC.value });
  emitSectionsUpdate();
};

// Emit sections update to parent
const emitSectionsUpdate = () => {
  emit("sections-update", {
    tabId: props.tabId,
    sections: localSections.value,
    includeTOC: localIncludeTOC.value,
  });
};

// Handle section changes
const handleSectionChange = (section: MarkdownSection) => {
  emit("section-change", { tabId: props.tabId, section });
  debouncedEmitSectionsUpdate();
};

// Handle section title changes
const handleSectionTitleChange = (section: MarkdownSection) => {
  section.hasUnsavedChanges = true;
  emit("section-change", { tabId: props.tabId, section });
  debouncedEmitSectionsUpdate();
};

// Handle section header level changes
const handleSectionHeaderChange = (section: MarkdownSection) => {
  section.hasUnsavedChanges = true;
  emit("section-change", { tabId: props.tabId, section });
  debouncedEmitSectionsUpdate();
};

// Handle section content changes
const handleSectionContentChange = (section: MarkdownSection) => {
  section.hasUnsavedChanges = true;
  emit("section-change", { tabId: props.tabId, section });
  debouncedEmitSectionsUpdate();
};

// Mark all sections as saved
const markAllSectionsSaved = () => {
  localSections.value.forEach((section) => {
    section.hasUnsavedChanges = false;
  });
};

// Initialize on mounted
onMounted(() => {
  initializeEditor();
});

// Watch for changes in props.tab to reinitialize when needed
watch(
  () => props.tab,
  () => {
    initializeEditor();
  },
  { deep: true }
);

// Expose methods to parent
defineExpose({
  markAllSectionsSaved,
  getSections: () => localSections.value,
  addSection,
  removeSection,
  getIncludeTOC: () => localIncludeTOC.value,
});
</script>
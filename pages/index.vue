<template>
  <div class="flex h-screen flex-col">
    <header class="bg-gray-800 text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">Markdown Editor</h1>
        <div class="flex gap-2">
          <FileLoader @file-loaded="handleFileLoaded" />
          <button
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
            @click="handleSave"
          >
            Save
          </button>
          <button
            class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
            @click="handleNew"
          >
            New
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Tab system -->
      <TabSystem
        ref="tabSystem"
        class="flex-1 flex flex-col h-full"
        @tab-change="handleTabChange"
        @tab-close="handleTabClose"
        @tab-create="handleTabCreate"
      >
        <template #markdown-editor="{ tab }">
          <div class="flex h-full">
            <!-- Editor panel -->
            <div class="w-1/2 p-4 overflow-y-auto border-r border-gray-300">
              <MarkdownEditor
                ref="editorRefs[tab.id]"
                :key="`editor-instance-${tab.id}`"
                :tab-id="tab.id"
                :tab="tab"
                @sections-update="handleSectionsUpdate"
                @section-change="handleSectionChange"
                @toc-change="handleTOCChange"
              />
            </div>

            <!-- Preview panel -->
            <div class="w-1/2 p-4 overflow-y-auto">
              <DisplayMarkdown :markdown-content="getTabMarkdownContent(tab)" />
            </div>
          </div>
        </template>
      </TabSystem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { TextHandlingService } from "~/services/TextHandlingService";
import MarkdownEditor from "~/components/MarkdownEditor.vue";
import DisplayMarkdown from "~/components/DisplayMarkdown.vue";
import TabSystem from "~/components/Tab/TabSystem.vue";
import FileLoader from "~/components/FileLoader.vue";

import type { Tab } from "~/models/TabModels";
import type { MarkdownSection } from "~/models/MarkdownSection";

// References to components
const tabSystem = ref<InstanceType<typeof TabSystem> | null>(null);
const editorRefs = reactive<
  Record<string, InstanceType<typeof MarkdownEditor> | null>
>({});

// Services
const textService = new TextHandlingService();

// Get active tab
const activeTab = computed(() => {
  if (!tabSystem.value) return null;
  return tabSystem.value.getActiveTab();
});

// Get markdown content for display
const getTabMarkdownContent = (tab: Tab): string => {
  return textService.generateMarkdownContent(tab.sections, tab.includeTOC);
};

// Event handlers
const handleTabChange = (_: string) => {};

const handleTabClose = (tabId: string) => {
  // Clean up editor references
  if (Object.prototype.hasOwnProperty.call(editorRefs, tabId)) {
    editorRefs[tabId] = null;
  }
};

const handleTabCreate = (tab: Tab) => {
  editorRefs[tab.id] = null;
};

// Handle file loaded from FileLoader
const handleFileLoaded = ({ fileName, sections, includeTOC }: { 
  fileName: string; 
  sections: MarkdownSection[]; 
  includeTOC: boolean 
}) => {
  if (!tabSystem.value) return;
  
  // Create a new tab with the loaded content
  const newTabId = tabSystem.value.createNewTab(fileName);
  
  if (!newTabId) return;
  
  // Update the tab with the loaded sections
  tabSystem.value.updateTabSections(newTabId, sections, includeTOC);
};

// Handle section changes
const handleSectionChange = ({ 
  _tabId, 
  _section 
}: { 
  _tabId: string; 
  _section: MarkdownSection 
}) => {
  if (!tabSystem.value) return;
  
  // This will be used for more granular operations like
  // syntax highlighting, auto-complete, etc.
};

// Handle sections update
const handleSectionsUpdate = ({ 
  tabId, 
  sections, 
  includeTOC 
}: { 
  tabId: string; 
  sections: MarkdownSection[]; 
  includeTOC: boolean 
}) => {
  if (!tabSystem.value) return;

  tabSystem.value.updateTabSections(tabId, sections, includeTOC);

  // Update tab title based on first section with title
  const firstTitledSection = sections.find((s) => s.title.trim() !== "");
  if (firstTitledSection && firstTitledSection.title) {
    tabSystem.value.updateTabSection(tabId, firstTitledSection.id, {
      title: firstTitledSection.title,
    });
  }
};

// Handle TOC change
const handleTOCChange = ({
  tabId,
  includeTOC,
}: {
  tabId: string;
  includeTOC: boolean;
}) => {
  if (!tabSystem.value) return;

  // Get current tab
  const tab = tabSystem.value.getTabById(tabId);
  if (!tab) return;

  tabSystem.value.updateTabSections(tabId, tab.sections, includeTOC);
};

// Create a new document
const handleNew = () => {
  if (tabSystem.value) {
    tabSystem.value.createNewTab();
  }
};

// Save the current document
const handleSave = async () => {
  if (!tabSystem.value || !activeTab.value) return;

  try {
    // Here you would implement actual saving functionality
    // For example, saving to localStorage, a server, or downloading as a file

    // For this example, we'll simulate a successful save
    const document = getTabMarkdownContent(activeTab.value);

    // Save to localStorage as an example
    localStorage.setItem(`document-${activeTab.value.id}`, document);

    alert(
      `Document "${activeTab.value.title || "Untitled"}" saved successfully!`
    );

    // Mark the tab as saved
    tabSystem.value.markTabAsSaved(activeTab.value.id);

    // If we have a reference to the editor, mark all sections as saved too
    const editor = editorRefs[activeTab.value.id];
    if (editor) {
      editor.markAllSectionsSaved();
    }
  } catch (error) {
    alert("Failed to save the document. Please try again.");
  }
};


onMounted(() => {
  // Any initialization logic
});
</script>
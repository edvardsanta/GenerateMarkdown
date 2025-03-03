<template>
  <div class="flex flex-col h-full">
    <!-- Tab bar -->
    <div class="flex items-center bg-gray-100 border-b border-gray-300">
      <div ref="tabsContainer" class="flex flex-1 overflow-x-auto">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          :data-tab-id="tab.id"
          class="flex items-center px-4 py-2 border-r border-gray-300 cursor-pointer select-none"
          :class="{
            'bg-white': tab.id === activeTabId,
            'bg-gray-100': tab.id !== activeTabId,
            'drop-target': dragOverTabId === tab.id,
          }"
          draggable="true"
          @click="setActiveTab(tab.id)"
          @contextmenu.prevent="showTabContextMenu($event, tab.id)"
          @dragstart="handleDragStart($event, tab.id)"
          @dragover.prevent="handleDragOver($event, tab.id)"
          @dragenter.prevent="dragOverTabId = tab.id"
          @dragleave="dragOverTabId === tab.id && (dragOverTabId = null)"
          @drop="handleDrop($event, tab.id)"
          @dragend="
            draggedTabId = null;
            dragOverTabId = null;
          "
        >
          <span class="max-w-xs truncate">{{ tab.title || "Untitled" }}</span>
          <span v-if="tab.hasUnsavedChanges" class="ml-1 text-red-500">*</span>
          <button
            class="ml-2 text-gray-400 hover:text-gray-700"
            @click.stop="closeTab(tab.id)"
          >
            &times;
          </button>
        </div>
      </div>
      <button
        class="p-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
        @click="createNewTab"
      >
        <span class="text-lg">+</span>
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-grow overflow-y-auto">
      <div
        v-for="tab in tabs"
        v-show="tab.id === activeTabId"
        :key="tab.id"
        class="h-full"
      >
        <div v-if="tab.type === 'markdown'" class="h-full">
          <slot name="markdown-editor" :tab="tab" />
        </div>
      </div>
    </div>

    <!-- Tab context menu -->
    <div
      v-if="showContextMenu"
      ref="contextMenuEl"
      class="context-menu absolute bg-white shadow-lg border border-gray-200 rounded-md py-1 z-50"
      :style="{ top: contextMenuPos.y + 'px', left: contextMenuPos.x + 'px' }"
    >
      <button
        class="w-full text-left px-4 py-2 hover:bg-gray-100"
        @click="closeTabFromContextMenu"
      >
        Close Tab
      </button>
      <button
        class="w-full text-left px-4 py-2 hover:bg-gray-100"
        @click="closeOtherTabs"
      >
        Close Other Tabs
      </button>
      <button
        class="w-full text-left px-4 py-2 hover:bg-gray-100"
        @click="closeAllTabs"
      >
        Close All Tabs
      </button>
      <hr class="my-1 border-gray-200" >
      <button
        class="w-full text-left px-4 py-2 hover:bg-gray-100"
        @click="renameTab"
      >
        Rename Tab
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import type { Tab, TabStorageData } from "~/models/TabModels";
import type { MarkdownSection } from "~/models/MarkdownSection";
import { TextHandlingService } from "~/services/TextHandlingService";

const props = defineProps({
  storageKey: {
    type: String,
    default: "editor-tabs",
  },
});

const emit = defineEmits([
  "tab-change",
  "tab-close",
  "tab-create",
  "section-change",
]);

// Services
const textService = new TextHandlingService();

// Tab state
const tabs = ref<Tab[]>([]);
const activeTabId = ref<string | null>(null);
const tabsContainer = ref<HTMLElement | null>(null);

// Context menu elements
const contextMenuEl = ref<HTMLElement | null>(null);

// Drag and drop state
const draggedTabId = ref<string | null>(null);
const dragOverTabId = ref<string | null>(null);

// Context menu state
const showContextMenu = ref(false);
const contextMenuTabId = ref<string | null>(null);
const contextMenuPos = ref<{ x: number; y: number }>({ x: 0, y: 0 });

// Initialize a blank section
const initializeBlankSection = (): MarkdownSection => {
  return {
    id: generateUniqueId(),
    headerLevel: "1",
    title: "",
    content: "",
    hasUnsavedChanges: false,
  };
};

// Generate a unique ID
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create a new tab
const createNewTab = (title: string = "Untitled"): string => {
  const newTab: Tab = {
    id: uuidv4(),
    title: title,
    type: "markdown",
    sections: [initializeBlankSection()],
    hasUnsavedChanges: false,
    includeTOC: false,
  };

  tabs.value.push(newTab);
  setActiveTab(newTab.id);
  emit("tab-create", newTab);
  saveTabs();
  
  return newTab.id;
};

// Set active tab
const setActiveTab = (tabId: string) => {
  if (activeTabId.value !== tabId) {
    activeTabId.value = tabId;
    emit("tab-change", tabId);
    saveTabs();
  }
};

// Close tab
const closeTab = (tabId: string) => {
  const index = tabs.value.findIndex((tab) => tab.id === tabId);
  if (index !== -1) {
    const tab = tabs.value[index];

    if (tab.hasUnsavedChanges) {
      if (
        !confirm(
          "This tab has unsaved changes. Are you sure you want to close it?"
        )
      ) {
        return;
      }
    }

    tabs.value.splice(index, 1);
    emit("tab-close", tabId);

    // If we closed the active tab, activate another tab
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        // Prefer the tab to the right, or the last tab if we closed the rightmost tab
        const newIndex = Math.min(index, tabs.value.length - 1);
        setActiveTab(tabs.value[newIndex].id);
      } else {
        activeTabId.value = null;
        // Create a new tab if we closed the last one
        createNewTab();
      }
    }

    saveTabs();
  }
};

// Update tab sections
const updateTabSections = (
  tabId: string,
  sections: MarkdownSection[],
  includeTOC: boolean = false
) => {
  const tab = tabs.value.find((tab) => tab.id === tabId);
  if (tab) {
    tab.sections = sections;
    tab.includeTOC = includeTOC;

    // Update tab title based on first section with a title
    const firstTitledSection = sections.find(
      (section) => section.title.trim() !== ""
    );
    if (firstTitledSection) {
      tab.title = firstTitledSection.title;
    }

    // Update hasUnsavedChanges status
    tab.hasUnsavedChanges = sections.some(
      (section) => section.hasUnsavedChanges
    );

    saveTabs();
    return true;
  }
  return false;
};

// Update specific section in a tab
const updateTabSection = (
  tabId: string,
  sectionId: string,
  updatedSection: Partial<MarkdownSection>
) => {
  const tab = tabs.value.find((tab) => tab.id === tabId);
  if (tab) {
    const sectionIndex = tab.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (sectionIndex !== -1) {
      const section = tab.sections[sectionIndex];

      // Update section properties
      Object.assign(section, updatedSection);

      // Mark section as having unsaved changes
      section.hasUnsavedChanges = true;

      // If title was updated, potentially update tab title
      if (updatedSection.title && sectionIndex === 0) {
        tab.title = updatedSection.title;
      }

      // Update tab's hasUnsavedChanges status
      tab.hasUnsavedChanges = tab.sections.some(
        (section) => section.hasUnsavedChanges
      );

      saveTabs();
      emit("section-change", { tabId, sectionId, section });
      return true;
    }
  }
  return false;
};

// Mark tab as saved
const markTabAsSaved = (tabId: string) => {
  const tab = tabs.value.find((tab) => tab.id === tabId);
  if (tab) {
    tab.hasUnsavedChanges = false;
    tab.sections.forEach((section) => {
      section.hasUnsavedChanges = false;
    });
    saveTabs();
  }
};

// Get the markdown content of a tab
const getTabMarkdownContent = (tabId: string): string => {
  const tab = tabs.value.find((tab) => tab.id === tabId);
  if (tab) {
    return textService.generateMarkdownContent(tab.sections, tab.includeTOC);
  }
  return "";
};

// Drag and drop functionality
const handleDragStart = (event: DragEvent, tabId: string) => {
  draggedTabId.value = tabId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", tabId);
    // Hide the drag image
    const dragImage = document.createElement("div");
    dragImage.style.position = "absolute";
    dragImage.style.top = "-9999px";
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }
};

const handleDragOver = (event: DragEvent, tabId: string) => {
  if (draggedTabId.value && draggedTabId.value !== tabId) {
    dragOverTabId.value = tabId;
  }
};

const handleDrop = (event: DragEvent, targetTabId: string) => {
  if (!draggedTabId.value || draggedTabId.value === targetTabId) return;

  const sourceIndex = tabs.value.findIndex(
    (tab) => tab.id === draggedTabId.value
  );
  const targetIndex = tabs.value.findIndex((tab) => tab.id === targetTabId);

  if (sourceIndex !== -1 && targetIndex !== -1) {
    // Remove the dragged tab and insert it at the target index
    const [movedTab] = tabs.value.splice(sourceIndex, 1);
    tabs.value.splice(targetIndex, 0, movedTab);

    saveTabs();
  }

  draggedTabId.value = null;
  dragOverTabId.value = null;
};

// Context menu functionality
const showTabContextMenu = (event: MouseEvent, tabId: string) => {
  contextMenuTabId.value = tabId;
  contextMenuPos.value = { x: event.clientX, y: event.clientY };
  showContextMenu.value = true;

  // Add click outside listener after menu is shown
  nextTick(() => {
    document.addEventListener("click", handleClickOutsideMenu);
  });
};

// Handle click outside menu manually
const handleClickOutsideMenu = (event: MouseEvent) => {
  if (
    contextMenuEl.value &&
    !contextMenuEl.value.contains(event.target as Node)
  ) {
    showContextMenu.value = false;
    document.removeEventListener("click", handleClickOutsideMenu);
  }
};

const closeTabFromContextMenu = () => {
  if (contextMenuTabId.value) {
    closeTab(contextMenuTabId.value);
  }
  showContextMenu.value = false;
  document.removeEventListener("click", handleClickOutsideMenu);
};

const closeOtherTabs = () => {
  if (contextMenuTabId.value) {
    const tabsToClose = tabs.value.filter(
      (tab) => tab.id !== contextMenuTabId.value
    );
    const tabsWithUnsavedChanges = tabsToClose.filter(
      (tab) => tab.hasUnsavedChanges
    );

    if (
      tabsWithUnsavedChanges.length > 0 &&
      !confirm(
        `${tabsWithUnsavedChanges.length} tab(s) have unsaved changes. Close anyway?`
      )
    ) {
      showContextMenu.value = false;
      document.removeEventListener("click", handleClickOutsideMenu);
      return;
    }

    tabs.value = tabs.value.filter((tab) => tab.id === contextMenuTabId.value);
    setActiveTab(contextMenuTabId.value);
    saveTabs();
  }
  showContextMenu.value = false;
  document.removeEventListener("click", handleClickOutsideMenu);
};

const closeAllTabs = () => {
  const tabsWithUnsavedChanges = tabs.value.filter(
    (tab) => tab.hasUnsavedChanges
  );

  if (
    tabsWithUnsavedChanges.length > 0 &&
    !confirm(
      `${tabsWithUnsavedChanges.length} tab(s) have unsaved changes. Close anyway?`
    )
  ) {
    showContextMenu.value = false;
    document.removeEventListener("click", handleClickOutsideMenu);
    return;
  }

  tabs.value = [];
  activeTabId.value = null;
  createNewTab();
  saveTabs();
  showContextMenu.value = false;
  document.removeEventListener("click", handleClickOutsideMenu);
};

const renameTab = () => {
  if (contextMenuTabId.value) {
    const tab = tabs.value.find((tab) => tab.id === contextMenuTabId.value);
    if (tab) {
      const newTitle = prompt("Enter new tab name:", tab.title);
      if (newTitle !== null) {
        tab.title = newTitle;
        saveTabs();
      }
    }
  }
  showContextMenu.value = false;
  document.removeEventListener("click", handleClickOutsideMenu);
};

// Save tabs to localStorage
const saveTabs = () => {
  // Only save essential data to localStorage
  const tabsData: TabStorageData[] = tabs.value.map((tab) => ({
    id: tab.id,
    title: tab.title,
    type: tab.type,
    hasUnsavedChanges: tab.hasUnsavedChanges,
    includeTOC: tab.includeTOC,
    sections: tab.sections,
  }));

  const storageData = {
    tabs: tabsData,
    activeTabId: activeTabId.value,
  };

  try {
    localStorage.setItem(props.storageKey, JSON.stringify(storageData));
  } catch (error) {
    /* empty */
  }
};

// Load tabs from localStorage
const loadTabs = () => {
  try {
    const savedData = localStorage.getItem(props.storageKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);

      if (Array.isArray(parsedData.tabs) && parsedData.tabs.length > 0) {
        tabs.value = parsedData.tabs.map((tabData: TabStorageData) => ({
          ...tabData,
          sections: tabData.sections || [initializeBlankSection()],
        }));

        activeTabId.value = parsedData.activeTabId;
      } else {
        createNewTab(); // No saved tabs, create a new one
      }
    } else {
      createNewTab(); // No saved data, create a new tab
    }
  } catch (error) {
    createNewTab(); // Fallback to creating a new tab
  }
};

// Setup on component mount
onMounted(() => {
  loadTabs();

  // Add listener for browser beforeunload event to warn about unsaved changes
  window.addEventListener("beforeunload", (event) => {
    if (tabs.value.some((tab) => tab.hasUnsavedChanges)) {
      event.preventDefault();
      return "";
    }
  });
});
const getTabById = (tabId: string): Tab | undefined => {
  return tabs.value.find((tab) => tab.id === tabId);
};
// Cleanup event listeners
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideMenu);
  window.removeEventListener("beforeunload", () => {});
});

// Expose methods for parent components
defineExpose({
  createNewTab,
  closeTab,
  setActiveTab,
  updateTabSections,
  updateTabSection,
  markTabAsSaved,
  getTabMarkdownContent,
  getActiveTab: () => tabs.value.find((tab) => tab.id === activeTabId.value),
  getTabById,
});
</script>

<style scoped>
.drop-target {
  background-color: #e9f5ff;
  box-shadow: inset 0 0 0 2px #4299e1;
}
</style>

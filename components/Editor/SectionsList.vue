<template>
  <div>
    <div
      v-for="(section, index) in sections"
      :key="`${tabId}-section-${section.id}`"
      class="mb-6"
    >
      <SectionHeader 
        :section="section" 
        :index="index" 
        @toggle-section="() => $emit('toggle-section', index)"
      />

      <SectionContent 
        v-if="activeSection === index"
        :tab-id="tabId"
        :section="section"
        :index="index"
        @remove-section="() => $emit('remove-section', index)"
        @add-section="() => $emit('add-section', index + 1)"
        @section-change="() => $emit('section-change', section)"
        @section-title-change="() => $emit('section-title-change', section)"
        @section-header-change="() => $emit('section-header-change', section)"
        @section-content-change="() => $emit('section-content-change', section)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarkdownSection } from "~/models/MarkdownSection";
import SectionHeader from "../Editor/SectionHeader.vue";
import SectionContent from "../Editor/SectionContent.vue";
defineProps<{
  tabId: string;
  sections: MarkdownSection[];
  activeSection: number | null;
}>();

defineEmits([
  'toggle-section', 
  'add-section', 
  'remove-section',
  'section-change',
  'section-title-change',
  'section-header-change',
  'section-content-change'
]);
</script>
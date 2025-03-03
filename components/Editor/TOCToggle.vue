<template>
  <div class="mb-4 flex items-center gap-2">
    <input
      :id="`toc-checkbox-${tabId}`"
      :checked="includeTOC"
      type="checkbox"
      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      @change="handleTOCChange"
    >
    <label :for="`toc-checkbox-${tabId}`" class="text-sm text-gray-700">
      Mostrar Tabela de Conteúdos
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabId: string;
  includeTOC: boolean;
  
}>();

const emit = defineEmits(["toc-change"]);

const handleTOCChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("toc-change", target.checked);
};
</script>

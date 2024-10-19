<template>
  <div>
    <!-- TODO: Recriar a tabela de conteúdo (TOC) sem duplicações -->
    <!-- <TOCCheckbox :include-toc="includeTOC" @update:includeTOC="updateIncludeTOC" /> -->

    <div v-for="(section, index) in sections" :key="index" class="mb-6">
      <button
        class="w-full text-left py-2 px-4 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click="toggleSection(index)"
      >
        Seção {{ index + 1 }} - {{ section.title || "Sem Título" }}
      </button>

      <div
        v-if="activeSection === index"
        class="p-4 border border-gray-300 rounded-md mt-2"
      >
        <input
          v-model="section.title"
          placeholder="Título da Seção"
          class="w-full mb-2 px-2 py-1 border border-gray-300 rounded-md"
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
          placeholder="Conteúdo da Seção"
          class="w-full h-32 mb-3 px-2 py-1 border border-gray-300 rounded-md"
          @select="handleSelect($event)"
       />
        <div class="flex justify-between">
          <button
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring"
            @click="removeSection(index)"
          >
            Remover Seção
          </button>

          <button
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring"
            @click="addSection(index + 1)"
          >
            Adicionar Seção Abaixo
          </button>
        </div>
      </div>
    </div>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring"
      @click="addSection(sections.length)"
    >
      Adicionar Seção
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from "vue";

// Propriedades recebidas pelo componente
const props = defineProps<{ markdownContent: string }>();

// Interface para uma seção de markdown
interface MarkdownSection {
  headerLevel: string;
  title: string;
  content: string;
}

// Estado das seções
const sections = ref<MarkdownSection[]>([
  { headerLevel: "1", title: "", content: "" },
]);

// Controle de inclusão da TOC
const includeTOC = ref(false);
const isFileContent = ref(false);

// Índice da seção atualmente ativa (aberta)
const activeSection = ref<number | null>(null);

// Função para adicionar uma nova seção em um índice específico
const addSection = (index: number) => {
  sections.value.splice(index, 0, {
    headerLevel: "1",
    title: "",
    content: "",
  });
  activeSection.value = index; // Abrir a nova seção
};

// Função para alternar a visibilidade de uma seção
const toggleSection = (index: number) => {
  if (activeSection.value === index) {
    activeSection.value = null; // Fechar a seção se já estiver aberta
  } else {
    activeSection.value = index; // Abrir a seção e fechar as outras
  }
};

// Função para remover uma seção
const removeSection = (index: number) => {
  sections.value.splice(index, 1);
  if (activeSection.value) {
    if (activeSection.value === index) {
      activeSection.value = null; // Fechar a seção se ela for removida
    } else if (activeSection.value > index) {
      activeSection.value -= 1; // Ajustar o índice se uma seção anterior for removida
    }
  }
};

// Função para gerar a Tabela de Conteúdos (TOC)
const generateTOC = (sections: MarkdownSection[]) => {
  return sections
    .map((section) => {
      const sanitizedTitle = section.title.replace(/\s/g, "-").toLowerCase();
      const indentation = "  ".repeat(parseInt(section.headerLevel) - 1);
      return `${indentation}- [${section.title}](#${sanitizedTitle})`;
    })
    .join("\n");
};

// Computed para o output do markdown
const markdownOutput = computed(() => {
  let content = sections.value
    .map((section) => {
      const headerPrefix = "#".repeat(parseInt(section.headerLevel));
      return `${headerPrefix} ${section.title}\n${section.content}`;
    })
    .join("\n\n");

  if (includeTOC.value) {
    const toc = generateTOC(sections.value);
    content = `## Tabela de Conteúdos\n${toc}\n\n` + content;
  }
  return content;
});

// Emissão de eventos para atualizar o conteúdo do markdown
const emit = defineEmits(["update:markdown-content"]);

watch(markdownOutput, (newValue) => {
  if (!isFileContent.value) {
    emit("update:markdown-content", newValue);
  }
});

// Seleção de texto dentro de uma seção
const selectedText = ref("");

// Evento de seleção de texto no textarea
const handleSelect = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  selectedText.value = textarea.value.substring(
    textarea.selectionStart,
    textarea.selectionEnd
  );
};

// Watcher para sincronizar o conteúdo markdown recebido via props
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
</script>

<style scoped></style>

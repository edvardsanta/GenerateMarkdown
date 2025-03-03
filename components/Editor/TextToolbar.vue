<template>
  <div class="flex flex-col w-full">
    <!-- Main Toolbar -->
    <div class="flex items-center gap-2 p-2 bg-gray-100 rounded-md mb-2">
      <!-- Common Actions -->
      <div class="flex items-center border-r border-gray-300 pr-2 mr-2">
        <button
          class="p-2 hover:bg-gray-200 rounded-md transition-colors"
          title="Insert Table"
          @click="insertSnippet('table')"
        >
          <FontAwesomeIcon icon="table" class="text-gray-700" />
        </button>

        <button
          class="p-2 hover:bg-gray-200 rounded-md transition-colors"
          title="Format Table"
          :disabled="!selectedText"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedText }"
          @click="formatTable"
        >
          <FontAwesomeIcon icon="list" class="text-gray-700" />
        </button>

        <button
          class="p-2 hover:bg-gray-200 rounded-md transition-colors"
          title="Insert Code Block"
          @click="insertSnippet('code')"
        >
          <FontAwesomeIcon icon="code" class="text-gray-700" />
        </button>
      </div>

      <!-- More Snippets Button -->
      <button
        class="flex items-center gap-1 p-2 hover:bg-gray-200 rounded-md transition-colors"
        title="More Snippets"
        @click="showModal = true"
      >
        <FontAwesomeIcon icon="plus" class="text-gray-700" />
        <span class="text-sm text-gray-700">More Snippets</span>
      </button>
    </div>

    <!-- Snippets Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-medium">Insert Snippet</h3>
          <button
            class="text-gray-500 hover:text-gray-700"
            @click="showModal = false"
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-4">
          <div class="space-y-4">
            <!-- Snippet List -->
            <div
              v-for="snippet in availableSnippets"
              :key="snippet.name"
              class="w-full"
            >
              <button
                class="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                @click="insertSnippetAndClose(snippet.name)"
              >
                <FontAwesomeIcon
                  :icon="getSnippetIcon(snippet.name)"
                  class="text-gray-600"
                />
                <div>
                  <div class="text-sm font-medium">{{ snippet.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ snippet.description }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto-completion Dropdown -->
    <div
      v-if="showCompletions && completions.length > 0"
      class="completions-dropdown fixed bg-white rounded-md shadow-lg border border-gray-200 z-40 min-w-[200px]"
    >
      <button
        v-for="(completion, index) in completions"
        :key="index"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
        @click="insertCompletion(completion)"
      >
        <span class="text-gray-400 text-sm">{{
          getCompletionType(completion)
        }}</span>
        <span>{{ completion }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import type { Ref } from "vue";
import init, { SmartEditor } from "@/rust/pkg/smart_editor";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface Snippet {
  name: string;
  content: string;
  description: string;
}

interface InputContext {
  type: string;
  word: string;
}

interface CaretCoordinates {
  top: number;
  left: number;
}

const props = defineProps<{
  selectedText?: string;
  cursorPosition?: number;
  content?: string;
}>();

const emit = defineEmits<{
  (e: "insert", content: string, position?: number): void;
  (e: "format" | "update:content", content: string): void;
}>();

// Refs
const showModal = ref(false);
const showCompletions = ref(false);
const completions: Ref<string[]> = ref([]);
const smartEditor = ref<SmartEditor | null>(null);
const availableSnippets: Ref<Snippet[]> = ref([]);

// Input Context
const getInputContext = (text: string): InputContext => {
  const contexts = {
    listItem: /^(\s*[-*+]\s+)([^-*+\n]*)$/m,
    heading: /^(#{1,6}\s+)([^#\n]*)$/m,
    link: /\[([^\]]*)](?:\([^)]*\))?$/,
    codeBlock: /^(`{3}|~~~)([^`~\n]*)$/m,
    table: /^\|[^|\n]*$/m,
  };

  for (const [type, regex] of Object.entries(contexts)) {
    const match = text.match(regex);
    if (match) {
      return {
        type,
        word: match[2] || match[1],
      };
    }
  }

  const defaultMatch = text.match(/(?:\s|^)([^\s][^\n]*)$/);
  return {
    type: "word",
    word: defaultMatch ? defaultMatch[1] : "",
  };
};

// Completion Type Helper
const getCompletionType = (completion: string): string => {
  const typeMap: { [key: string]: string } = {
    "http://": "URL",
    "https://": "URL",
    "mailto:": "Email",
    "tel:": "Phone",
    "Task: ": "List",
    "Important: ": "List",
    "Note: ": "List",
    "TODO: ": "List",
    "```": "Code",
    "|": "Table",
  };

  // Verifica se a conclusão começa com algum dos padrões conhecidos
  for (const [pattern, type] of Object.entries(typeMap)) {
    if (completion.startsWith(pattern)) {
      return type;
    }
  }

  // Verifica linguagens de programação para blocos de código
  const programmingLanguages = [
    "javascript",
    "typescript",
    "python",
    "rust",
    "html",
    "css",
  ];
  if (programmingLanguages.includes(completion.toLowerCase())) {
    return "Language";
  }

  return "Text";
};

// WASM Initialization
const initWasm = async () => {
  try {
    await init();
    smartEditor.value = new SmartEditor();
    await loadSnippets();
  } catch (error) { /* empty */ }
};

// Snippets Functions
const loadSnippets = async () => {
  if (!smartEditor.value) return;
  try {
    availableSnippets.value = await smartEditor.value.get_all_snippets();
  } catch (error) { /* empty */ }
};

const getSnippetIcon = (snippetName: string): string => {
  const iconMap: { [key: string]: string } = {
    table: "table",
    code: "code",
    checklist: "check-square",
    quote: "quote-left",
  };
  return iconMap[snippetName] || "code";
};

const insertSnippetAndClose = async (snippetName: string) => {
  await insertSnippet(snippetName);
  showModal.value = false;
};

const insertSnippet = async (snippetName: string) => {
  if (!smartEditor.value) return;

  try {
    const snippet = await smartEditor.value.get_snippet(snippetName);
    if (snippet) {
      emit("insert", snippet.content);
    }
  } catch (error) { /* empty */ }
};
// Adicione estas funções junto com as outras no script setup

const getSuggestionsForContext = async (
  context: InputContext
): Promise<string[]> => {
  if (!context.word || context.word.length < 1) return [];

  const contextSuggestions: { [key: string]: string[] } = {
    listItem: ["Task: ", "Important: ", "Note: ", "TODO: "],
    heading: ["Introduction", "Summary", "Conclusion", "Overview"],
    link: ["http://", "https://", "mailto:", "tel:"],
    codeBlock: ["javascript", "typescript", "python", "rust", "html", "css"],
    table: ["Header |", "Title |", "Name |", "Description |", "Date |"],
  };

  if (context.type === "word" && smartEditor.value) {
    const result = await smartEditor.value.get_completions(context.word);
    return result?.completions || [];
  }

  const suggestions = contextSuggestions[context.type] || [];
  return suggestions.filter((s) =>
    s.toLowerCase().includes(context.word.toLowerCase())
  );
};

const insertCompletion = (completion: string) => {
  if (!props.content || props.cursorPosition === undefined) return;

  const beforeCursor = props.content.substring(0, props.cursorPosition);
  const afterCursor = props.content.substring(props.cursorPosition);
  const context = getInputContext(beforeCursor);

  let newContent = "";
  const wordStart = beforeCursor.lastIndexOf(context.word);

  if (wordStart >= 0) {
    newContent =
      beforeCursor.substring(0, wordStart) + completion + afterCursor;
  } else {
    newContent = beforeCursor + completion + afterCursor;
  }

  emit("update:content", newContent);
  showCompletions.value = false;
};
// Auto-completion Functions
const handleAutoComplete = async (
  text: string,
  position: number,
  context: InputContext
) => {
  if (!smartEditor.value || !text) return;

  try {
    const suggestions = await getSuggestionsForContext(context);

    if (suggestions.length > 0) {
      completions.value = suggestions;
      showCompletions.value = true;

      const textarea = document.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      if (textarea) {
        const coords = getCaretCoordinates(textarea, position);
        const dropdown = document.querySelector(
          ".completions-dropdown"
        ) as HTMLElement;
        if (dropdown) {
          dropdown.style.top = `${coords.top + 20}px`;
          dropdown.style.left = `${coords.left}px`;
        }
      }
    } else {
      showCompletions.value = false;
    }
  } catch (error) {
    showCompletions.value = false;
  }
};

// Other Functions
const formatTable = () => {
  if (!smartEditor.value || !props.selectedText) return;

  try {
    const formattedTable = smartEditor.value.format_table(props.selectedText);
    emit("format", formattedTable);
  } catch (error) { /* empty */ }
};

const getCaretCoordinates = (
  element: HTMLTextAreaElement,
  position: number
): CaretCoordinates => {
  const div = document.createElement("div");
  const styles = getComputedStyle(element);
  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
  ];

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";

  properties.forEach((prop) => {
    div.style[prop as keyof CSSStyleDeclaration] = styles[prop];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(styles.fontSize),
    left: span.offsetLeft,
  };
  document.body.removeChild(div);

  return coordinates;
};

// Watchers
watch(
  () => ({ content: props.content, position: props.cursorPosition }),
  ({ content, position }) => {
    if (content && position !== undefined) {
      const textBeforeCursor = content.substring(0, position);
      const context = getInputContext(textBeforeCursor);
      handleAutoComplete(content, position, context);
    }
  }
);

// Lifecycle
onMounted(() => {
  initWasm();
});

// Expose
defineExpose({
  handleAutoComplete,
});
</script>

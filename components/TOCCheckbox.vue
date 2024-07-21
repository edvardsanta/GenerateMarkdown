<template>
  <label class=" mb-4 flex items-center">
    <input v-model="localIncludeTOC" type="checkbox" class="mr-2" >
    <span>Include Table of Contents</span>
  </label>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps<{ includeTOC: boolean }>();
const emit = defineEmits(['update:includeTOC']);
const localIncludeTOC = ref(props.includeTOC);

watch(localIncludeTOC, (newVal) => {
  if (newVal !== props.includeTOC) {
    emit('update:includeTOC', newVal);
  }
});

watch(() => props.includeTOC, (newVal) => {
  if (newVal !== localIncludeTOC.value) {
    localIncludeTOC.value = newVal;
  }
});
</script>

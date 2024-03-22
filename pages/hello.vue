<template>
  <div>
    <button @click="fetchHelloWorld">Fetch Hello World</button>
    <h1 v-if="message">{{ message }}</h1>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const message = ref<string>("");

async function fetchHelloWorld() {
  try {
    const response = await fetch("/api/hello_world");
    console.log(response);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    message.value = await response.text();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}
</script>

<style scoped></style>

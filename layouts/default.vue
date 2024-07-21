<template>
  <div class="flex flex-col min-h-screen">
    <header class="fixed top-0 left-0 w-full bg-white p-4 shadow-md z-50">
      <div class="flex">
        <nav class="flex-grow flex items-center justify-start space-x-4">
          <NuxtLink to="/" class="text-gray-700 hover:text-gray-900">Generate Markdown</NuxtLink>
          <NuxtLink to="/hello" class="text-gray-700 hover:text-gray-900">Hello</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="pt-20 p-4 flex-grow">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
</script>

<template>
  <div> 
    <aside class="w-64 bg-white p-4 shadow-lg">
      <nav class="flex flex-col space-y-3">
        <NuxtLink class="text-gray-700 hover:text-gray-900" to="/">Generate Markdown</NuxtLink>
        <NuxtLink class="text-gray-700 hover:text-gray-900" to="/hello">Hello</NuxtLink>
      </nav>
    </aside>

    <slot />
  </div>
</template>

<script lang="ts" setup>

</script>

<style>

</style>
<template>
  <router-link to="/" class="lg:hidden flex flex-row items-center">
    <img class="dark:hidden" src="/images/logo/logo-tab.png" width="36px" alt="Logo" />
    <img class="hidden dark:block" src="/images/logo/logo-tab.png" width="36px" alt="Logo" />

    <h1 class="ms-2 font-medium text-gray-700 dark:text-gray-400">Web MNI</h1>
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

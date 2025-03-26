<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <router-view v-slot="{ Component }">
    <transition
      name="fade"
      mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
/**
 * Wrapper component for the router view. It only uses wraps the router view
 * inside a transition. Used to show pages with layout and to prevent to show
 * the layout in public pages like the login view.
 */
</script>

<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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

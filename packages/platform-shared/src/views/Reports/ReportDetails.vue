<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-row flex-wrap bg-light mt-2">
    <template
      v-for="({label, value}) in parameters"
      :key="label">
      <div class="px-4 py-3">
        <small class="text-muted">
          {{ label }}
        </small>
        <div>
          {{ value }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>

defineProps({
  parameters: {
    type: Array,
    default: () => [],
  },
});
</script>

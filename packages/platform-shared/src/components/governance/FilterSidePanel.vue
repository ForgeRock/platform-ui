<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="fr-side-panel d-flex flex-column p-0 rounded-0 mr-3"
    no-body>
    <div class="pb-0 w-100 flex-shrink-0">
      <div class="d-flex px-4 align-items-center justify-content-between">
        <div class="d-flex py-3 align-items-center">
          <h2 class="h5 mb-0 py-3">
            {{ title }}
          </h2>
        </div>
      </div>
    </div>
    <div class="border-top p-2 fr-side-panel-content">
      <slot />
    </div>
  </BCard>
</template>

<script setup>
import { BCard } from 'bootstrap-vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.fr-side-panel {
  flex: 0 0 320px !important;
  position: sticky;
  top: 0;
  align-self: flex-start;
  min-height: 100vh;
  max-height: 100vh;
}

.fr-side-panel-content {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;

  :deep(.rounded-pill.border) {
    border: none !important;
    padding: 0 !important;
    margin: 0 0.25rem 0.25rem 0 !important;
  }

  :deep(.fr-filters-nav) {
    padding-bottom: 0.5rem !important;

    h3 {
      margin-bottom: 0.5rem !important;
    }
  }
}

@media (max-width: 768px) {
  .fr-side-panel {
    flex: 0 0 100% !important;
    width: 100%;
    max-width: 100%;
    position: static;
    max-height: none;
    min-height: auto;
  }

  .fr-side-panel-content {
    flex: none;
    min-height: unset;
    overflow-y: visible;
  }
}
</style>

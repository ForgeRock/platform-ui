<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="py-3">
    <BRow
      v-if="entities.length === 0">
      <BCol
        sm="12"
        class="text-center">
        {{ $t('governance.agents.details.noAssociatedEntities', { entities: type }) }}
      </BCol>
    </BRow>
    <template v-else>
      <BRow
        v-for="entity in entities"
        class="entity-row"
        :key="entity">
        <BCol
          sm="12">
          <div class="d-flex flex-row align-items-center">
            <FrIcon
              :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-3 color-dark${icon.color} bg-light${icon.color} mt-n25`"
              :name="icon.icon" />
            {{ entity }}
          </div>
        </BCol>
      </BRow>
    </template>
  </div>
</template>

<script setup>
import {
  BRow, BCol,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

defineProps({
  entities: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: 'object',
  },
  icon: {
    type: Object,
    default: () => ({
      icon: 'data_object',
      color: 'blue',
    }),
  },
});
</script>
<style lang="scss" scoped>

.entity-row {
  border: 1px solid;
  border-color: $gray-200;
  margin: .5rem;
  padding: 1rem;
  padding-left: 0rem;
}
</style>

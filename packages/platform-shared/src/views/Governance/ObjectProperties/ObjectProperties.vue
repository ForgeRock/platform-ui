<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard>
    <div
      class="d-flex justify-content-between"
      :class="{ 'section-header': enableCollapse }"
      @click="emit('toggle-collapse')">
      <h1 class="h5">
        {{ i18n.global.t(`governance.${object}.details.objectPropertiesTab.title`) }}
      </h1>
      <FrIcon
        v-if="enableCollapse"
        :name="!isCollapsed ? 'keyboard_arrow_down' : 'chevron_right'"
        class="ml-2" />
    </div>
    <BCollapse :visible="!isCollapsed">
      <div class="mt-4">
        <BRow
          v-for="(detail, name) in objectProperties"
          :key="name"
          :name="`property-${name}`">
          <BCol
            sm="4"
            class="weight-600">
            {{ name }}
          </BCol>
          <BCol
            sm="8"
            class="mb-3 text-gray-900">
            {{ detail || blankValueIndicator }}
          </BCol>
        </BRow>
      </div>
    </BCollapse>
  </BCard>
</template>

<script setup>

import {
  BCard, BCol, BRow, BCollapse,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

/**
  * Object properties display component
  */
defineProps({
  objectProperties: {
    type: Object,
    required: true,
  },
  object: {
    type: String,
    default: 'accounts',
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  enableCollapse: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-collapse']);
</script>
<style lang="scss" scoped>

.weight-600 {
  font-weight: 600;
}
.text-gray-900 {
  color: $gray-900
}
.section-header {
  cursor: pointer;
}

</style>

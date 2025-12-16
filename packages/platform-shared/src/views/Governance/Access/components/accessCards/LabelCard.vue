<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueDraggableResizable
    :parent="true"
    :prevent-deactivation="true"
    :x="card.x"
    :y="card.y"
    :draggable="false"
    :resizable="false">
    <div class="d-flex flex-row align-items-center">
      <FrIcon
        :name="iconDisplay.icon"
        :icon-class="`color-${iconDisplay.color} bg-light${iconDisplay.color} rounded-circle md-24 mr-3 p-2`" />
      <div>{{ iconDisplay.label }}</div>
    </div>
  </VueDraggableResizable>
</template>

<script setup>

import { computed } from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import accessConstants from '../../utils/accessConstants';
import i18n from '@/i18n';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  scale: {
    type: Number,
    default: 1,
  },
});

const itemType = computed(() => props.card?.type || '');

const iconDisplay = computed(() => {
  switch (itemType.value) {
    case accessConstants.GRANT_TYPES.ACCOUNT:
      return {
        label: i18n.global.t('common.applications'),
        color: 'orange',
        icon: 'apps',
      };
    case accessConstants.GRANT_TYPES.ENTITLEMENT:
      return {
        label: i18n.global.t('common.entitlements'),
        color: 'purple',
        icon: 'assignment_turned_in',
      };
    case accessConstants.GRANT_TYPES.ROLE:
    default:
      return {
        label: i18n.global.t('common.roles'),
        color: 'blue',
        icon: 'assignment_ind',
      };
  }
});

</script>

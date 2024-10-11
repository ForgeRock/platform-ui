<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButton
      v-for="action in actionButtons"
      :key="action.event"
      @click="$emit('action', action.event)"
      class="mr-1"
      variant="outline-secondary">
      <FrIcon
        :icon-class="`${action.iconClass} mr-2`"
        :name="action.icon">
        {{ action.text }}
      </FrIcon>
    </BButton>
  </div>
</template>

<script setup>
/**
 * This component displays the available actions for a request.
 * Actions are based on the detail type and the user's permissions.
 */
import { computed } from 'vue';
import { BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  permissions: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(['action']);

const sharedActions = {
  reassign: {
    text: i18n.global.t('common.forward'),
    iconClass: '',
    icon: 'redo',
    event: 'REASSIGN',
  },
};

const actionsByType = {
  [detailTypes.APPROVAL]: {
    approve: {
      text: i18n.global.t('common.approve'),
      iconClass: 'text-success',
      icon: 'check',
      event: 'APPROVE',
    },
    reject: {
      text: i18n.global.t('common.reject'),
      iconClass: 'text-danger',
      icon: 'block',
      event: 'REJECT',
    },
    reassign: sharedActions.reassign,
  },
  [detailTypes.ADMIN_REQUEST]: {
    reassign: sharedActions.reassign,
  },
  [detailTypes.FULFILLMENT]: {
    fulfill: {
      text: i18n.global.t('common.complete'),
      iconClass: 'text-success',
      icon: 'check',
      event: 'FULFILL',
    },
    deny: {
      text: i18n.global.t('common.reject'),
      iconClass: 'text-danger',
      icon: 'block',
      event: 'DENY',
    },
    reassign: sharedActions.reassign,
  },
};

/**
 * Builds the action buttons based on the detail type and user permissions.
 * @returns {Array} An array of action button configurations.
 */
const actionButtons = computed(() => {
  const actions = actionsByType[props.type];
  const buttonArray = [];
  Object.keys(actions).forEach((action) => {
    if (props.permissions[action]) buttonArray.push(actions[action]);
  });
  return buttonArray;
});

</script>

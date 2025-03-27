<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex align-items-center justify-content-end text-right dropdown-padding">
    <BDropdown
      boundary="window"
      variant="link"
      no-caret
      right
      toggle-class="text-decoration-none p-0"
      data-testid="dropdown-actions">
      <template #button-content>
        <FrIcon
          icon-class="text-muted md-24"
          name="more_horiz" />
        <p class="sr-only">
          {{ $t('common.accessibleMoreActions') }}
        </p>
      </template>
      <template
        v-for="(action, key) in availableActions"
        :key="key">
        <BDropdownDivider v-if="key === 'divider'" aria-hidden="true"/>
        <BDropdownItem
          v-else
          :data-testid="key === 'details' ? 'view-details-button' : `dropdown-action-${key}`"
          @click="$emit('action', action.event)">
          <FrIcon
            :icon-class="`${action.iconClass} mr-2`"
            :name="action.icon" />
          {{ $t(action.text) }}
        </BDropdownItem>
      </template>
    </BDropdown>
  </div>
</template>

<script setup>
/**
 * This component displays a dropdown of available actions for a request.
 */
import { computed } from 'vue';
import { isEmpty, pickBy } from 'lodash';
import {
  BDropdown,
  BDropdownItem,
  BDropdownDivider,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';

const props = defineProps({
  allowSelfApproval: {
    type: Boolean,
    default: true,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: '',
  },
});

const userId = computed(() => useUserStore().userId);

const sharedActions = {
  cancel: {
    text: 'governance.accessRequest.myRequests.cancelRequest',
    icon: 'cancel',
    event: 'CANCEL',
  },
  comment: {
    text: 'governance.requestModal.addComment',
    icon: 'chat_bubble_outline',
    event: 'COMMENT',
  },
  details: {
    text: 'common.viewDetails',
    icon: 'list_alt',
    event: 'DETAILS',
  },
  reassign: {
    key: 'reassign',
    text: 'common.forward',
    icon: 'redo',
    event: 'REASSIGN',
  },
};

const actionsByType = {
  [detailTypes.APPROVAL]: {
    approve: {
      text: 'common.approve',
      iconClass: 'text-success',
      icon: 'check',
      event: 'APPROVE',
    },
    reject: {
      text: 'common.reject',
      iconClass: 'text-danger',
      icon: 'block',
      event: 'REJECT',
    },
    divider: true,
    reassign: sharedActions.reassign,
    comment: sharedActions.comment,
    details: sharedActions.details,
  },
  [detailTypes.ADMIN_REQUEST]: {
    details: sharedActions.details,
    divider: true,
    reassign: sharedActions.reassign,
    cancel: sharedActions.cancel,
  },
  [detailTypes.USER_REQUEST]: {
    details: sharedActions.details,
    divider: true,
    cancel: sharedActions.cancel,
  },
  [detailTypes.FULFILLMENT]: {
    fulfill: {
      text: 'common.complete',
      iconClass: 'text-success',
      icon: 'check',
      event: 'FULFILL',
    },
    deny: {
      text: 'common.reject',
      iconClass: 'text-danger',
      icon: 'block',
      event: 'DENY',
    },
    divider: true,
    reassign: sharedActions.reassign,
    comment: sharedActions.comment,
    details: sharedActions.details,
  },
};

const isSelfApprover = computed(() => (props.item?.rawData?.user?.id
  ? userId.value === props.item.rawData.user.id
  : false
));

const permissions = computed(() => props.item.rawData?.phases?.[0]?.permissions || {});

const availableActions = computed(() => {
  if (isEmpty(permissions.value)) return actionsByType[props.type];
  function pickFunction(action, permission) {
    switch (permission) {
      case 'approve':
        if (!props.allowSelfApproval && isSelfApprover.value) return false;
        return permissions.value.approve;
      case 'details':
      case 'divider':
        return true;
      default:
        return permissions.value[permission];
    }
  }
  return pickBy(actionsByType[props.type], pickFunction);
});
</script>

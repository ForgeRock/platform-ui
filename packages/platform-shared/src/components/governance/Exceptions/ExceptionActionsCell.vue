<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    no-caret
    boundary="window"
    toggle-class="p-1 d-inline"
    variant="link">
    <template #button-content>
      <FrIcon
        icon-class="text-dark md-24"
        name="more_horiz" />
    </template>

    <template v-if="!isAdmin">
      <!-- Extend -->
      <BDropdownItem
        @click="emit('open-exception-modal', item)">
        <FrIcon
          icon-class="mr-2"
          name="update">
          {{ $t('governance.certificationTask.actions.extendException') }}
        </FrIcon>
      </BDropdownItem>
      <!-- Revoke -->
      <BDropdownItem
        @click="emit('open-revoke-modal', item.id)">
        <FrIcon
          icon-class="mr-2"
          name="block">
          {{ $t('governance.certificationTask.actions.revokeException') }}
        </FrIcon>
      </BDropdownItem>
    </template>
    <BDropdownItem
      @click="emit('open-forward-modal', item)">
      <FrIcon
        icon-class="mr-2"
        name="redo">
        {{ $t('common.forward') }}
      </FrIcon>
    </BDropdownItem>
    <!-- View Details -->
    <template v-if="!isAdmin">
      <BDropdownDivider />
      <BDropdownItem
        @click="viewExceptionDetails(item.id)">
        <FrIcon
          icon-class="mr-2"
          name="article">
          {{ $t('common.viewDetails') }}
        </FrIcon>
      </BDropdownItem>
    </template>
  </BDropdown>
</template>

<script setup>
/**
 * Action cell component for exception list
 */
import {
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { useRouter } from 'vue-router';

const router = useRouter();

const emit = defineEmits(['open-exception-modal', 'open-revoke-modal', 'open-forward-modal']);

defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    required: true,
  },
});

/**
 * View the exception details
 * @param {String} exception - The exception to view details
 */
function viewExceptionDetails(id) {
  router.push({
    name: 'Violation',
    params: {
      violationId: id,
      itemType: 'exception',
    },
  });
}
</script>

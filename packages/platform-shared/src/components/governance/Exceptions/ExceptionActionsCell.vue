<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrActionsCell
    :delete-option="false"
    :divider="false"
    :edit-option="false">
    <template #custom-top-actions>
      <template v-if="!isAdmin">
        <BDropdownItem @click="emit('open-exception-modal', item)">
          <FrIcon
            icon-class="mr-2"
            name="update">
            {{ $t('governance.certificationTask.actions.extendException') }}
          </FrIcon>
        </BDropdownItem>
        <BDropdownItem @click="emit('open-revoke-modal', item.id)">
          <FrIcon
            icon-class="mr-2"
            name="block">
            {{ $t('governance.certificationTask.actions.revokeException') }}
          </FrIcon>
        </BDropdownItem>
      </template>
      <BDropdownItem @click="emit('open-forward-modal', item)">
        <FrIcon
          icon-class="mr-2"
          name="redo">
          {{ $t('common.forward') }}
        </FrIcon>
      </BDropdownItem>
      <template v-if="!isAdmin">
        <BDropdownDivider />
        <BDropdownItem @click="viewExceptionDetails(item.id)">
          <FrIcon
            icon-class="mr-2"
            name="article">
            {{ $t('common.viewDetails') }}
          </FrIcon>
        </BDropdownItem>
      </template>
    </template>
  </FrActionsCell>
</template>

<script setup>
/**
 * Action cell component for exception list
 */
import { BDropdownDivider, BDropdownItem } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { useRouter } from 'vue-router';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';

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

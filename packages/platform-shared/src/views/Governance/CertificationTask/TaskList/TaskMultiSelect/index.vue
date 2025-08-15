<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButton
      data-testid="bulk-select-btn"
      variant="link-dark">
      <FrIcon name="done_all" />
    </BButton>
    <FrActionsMenu data-testid="bulk-select-dropdown">
      <template #button-content>
        <label class="text-secondary mb-0">
          {{ $t('governance.certificationTask.select') }}
        </label>
      </template>
      <BDropdownItem
        @click="$emit('select-all-tasks', true)">
        {{ $t('governance.certificationTask.selectAllTasks') }}
      </BDropdownItem>
      <BDropdownItem
        @click="$emit('select-tasks', true)">
        {{ $t('governance.certificationTask.selectAllTasksThisPage') }}
      </BDropdownItem>
      <BDropdownDivider aria-hidden="true"/>
      <BDropdownItem
        @click="$emit('select-tasks', false)">
        {{ $t('governance.certificationTask.deselectAll') }}
      </BDropdownItem>
    </FrActionsMenu>
  </div>
</template>
<script>
import {
  BButton,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrActionsMenu from '@forgerock/platform-shared/src/components/ActionsMenu/ActionsMenu';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'TaskMultiSelect',
  components: {
    BButton,
    BDropdownDivider,
    BDropdownItem,
    FrActionsMenu,
    FrIcon,
  },
  props: {
    showActions: {
      type: Boolean,
      default: false,
    },
    certGrantType: {
      type: String,
      default: '',
    },
    campaignDetails: {
      type: Object,
      default: () => ({}),
    },
    selectedTasks: {
      type: Array,
      default: () => ([]),
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.menu-container button) {
  text-decoration: none;
  label {
    cursor: pointer;
  }
}

:deep(.dropdown-item:focus) {
  color: $gray-700 !important;
}
</style>

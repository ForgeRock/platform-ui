<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButton
      data-testid="bulk-select-btn"
      variant="link-dark">
      <FrIcon name="done_all" />
    </BButton>
    <BDropdown
      data-testid="bulk-select-dropdown"
      toggle-class="p-1"
      variant="link">
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
      <BDropdownDivider />
      <BDropdownItem
        @click="$emit('select-tasks', false)">
        {{ $t('governance.certificationTask.deselectAll') }}
      </BDropdownItem>
    </BDropdown>
  </div>
</template>
<script>
import {
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'TaskMultiSelect',
  components: {
    BButton,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
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

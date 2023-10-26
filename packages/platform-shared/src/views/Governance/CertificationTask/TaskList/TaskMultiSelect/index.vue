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
        @click="$emit('select-tasks', true)">
        {{ $t('governance.certificationTask.selectAllTasksThisPage') }}
      </BDropdownItem>
      <BDropdownDivider />
      <BDropdownItem
        @click="$emit('select-tasks', false)">
        {{ $t('governance.certificationTask.deselectAll') }}
      </BDropdownItem>
    </BDropdown>
    <BDropdown
      v-if="showActions"
      toggle-class="p-1"
      variant="link">
      <template #button-content>
        <BButton
          variant="none"
          class="text-decoration-none pr-2 border-left">
          {{ $t('common.actions') }}
        </BButton>
      </template>
      <BDropdownItem
        v-if="enableBulkCertify"
        @click="$emit('bulk-action', 'certify')">
        <FrIcon
          :data-testid="`cert-bulk-certify-${certGrantType}`"
          class="mr-2"
          name="check" />
        {{ $t('governance.certificationTask.actions.certify') }}
      </BDropdownItem>
      <BDropdownItem
        v-if="enableBulkRevoke"
        @click="$emit('bulk-action', 'revoke')">
        <FrIcon
          class="mr-2"
          name="block" />
        {{ $t('governance.certificationTask.actions.revoke') }}
      </BDropdownItem>
      <BDropdownItem
        v-if="enableBulkException"
        @click="$emit('bulk-action', 'exception')">
        <FrIcon
          class="mr-2"
          name="schedule" />
        {{ $t('governance.certificationTask.actions.allowException') }}
      </BDropdownItem>
      <BDropdownDivider v-if="(enableBulkCertify || enableBulkRevoke || enableBulkException) && (enableBulkReassign || enableBulkForward)" />
      <BDropdownItem
        v-if="enableBulkReassign"
        @click="$emit('bulk-action', 'reassign')">
        <FrIcon
          class="mr-2"
          name="supervisor_account" />
        {{ $t('governance.certificationTask.actions.reassign') }}
      </BDropdownItem>
      <BDropdownItem
        v-if="enableBulkForward"
        @click="$emit('bulk-action', 'forward')">
        <FrIcon
          :data-testid="`cert-bulk-forward-${certGrantType}`"
          class="mr-2"
          name="redo" />
        {{ $t('governance.certificationTask.actions.forward') }}
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
  computed: {
    enableBulkCertify() {
      return this.selectedTasks.findIndex((task) => task.permissions?.certify === false) === -1;
    },
    enableBulkRevoke() {
      return this.selectedTasks.findIndex((task) => task.permissions?.revoke === false) === -1;
    },
    enableBulkException() {
      if (this.campaignDetails.exceptionDuration === 0) return false;
      return this.selectedTasks.findIndex((task) => task.permissions?.exception === false) === -1;
    },
    enableBulkReassign() {
      if (!this.campaignDetails.enableReassign) return false;
      return this.selectedTasks.findIndex((task) => task.permissions?.reassign === false) === -1;
    },
    enableBulkForward() {
      if (!this.campaignDetails.enableForward) return false;
      return this.selectedTasks.findIndex((task) => task.permissions?.forward === false) === -1;
    },
  },
};
</script>

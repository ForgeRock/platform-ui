<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div role="toolbar">
    <BButtonToolbar class="justify-content-between px-4 py-3">
      <BDropdown
        toggle-class="px-0"
        variant="link">
        <template #button-content>
          <BButton
            class="p-0 toolbar-link-text"
            variant="link">
            <span class="font-weight-bold mr-1">
              {{ `${$t('common.status')}:` }}
            </span>
            {{ selectedStatus.text }}
          </BButton>
        </template>
        <template #default>
          <BDropdownItem
            v-for="status in statusOptions"
            @click="handleStatusChange(status)"
            :active="status.value === selectedStatus.value"
            :key="status.value">
            {{ status.text }}
          </BDropdownItem>
        </template>
      </BDropdown>
      <div>
        <BButton
          @click="showFilters = !showFilters"
          class="toolbar-link-text"
          variant="link">
          <FrIcon
            icon-class="md-24"
            name="filter_list" />
        </BButton>
        <BButton
          variant="link-dark"
          class="mr-2"
          @click="emit('open-columns-modal')">
          <FrIcon
            icon-class="md-24"
            name="view_column" />
        </BButton>
      </div>
    </BButtonToolbar>
    <BCollapse v-model="showFilters">
      <BRow class="p-4 border-bottom">
        <template v-if="isAdmin">
          <BCol lg="6">
            <FrField
              v-model="selectedRule"
              @input="handleRuleChange"
              @search-change="debouncedSearch"
              class="mb-4"
              label="Rule"
              type="select"
              :options="policyRuleOptions" />
          </BCol>
          <BCol lg="6">
            <FrGovResourceSelect
              v-model="selectedUser"
              @input="handleUserChange"
              class="mb-4"
              name="requester"
              resource-path="user"
              :first-option="allUsersOption"
              :initial-data="{ id: 'all' }"
              :label="$t('common.user.user')" />
          </BCol>
        </template>
        <BCol
          v-else
          lg="12">
          <FrSearchInput
            v-model="searchValue"
            class="w-100 mb-4"
            :class="{'fr-search-focus': searchFieldHasFocus}"
            :placeholder="searchInputPlaceholder"
            @search-input-blur="searchFieldHasFocus = false"
            @search-input-focus="searchFieldHasFocus = true"
            @input="debouncedTextSearch" />
        </BCol>
        <BCol lg="6">
          <FrField
            v-model="startDate"
            type="date"
            :label="$t('common.from')"
            @input="handleStartDateChange" />
        </BCol>
        <BCol lg="6">
          <FrField
            v-model="endDate"
            type="date"
            :label="$t('common.to')"
            @input="handleEndDateChange" />
        </BCol>
      </BRow>
    </BCollapse>
  </div>
</template>

<script setup>
/**
 * Contains four inputs that allow a user to filter SOD violations
 * The inputs are: policy rule, user, starting date range, and ending date range
 * A button toggles the visibility of the filter inputs
 */
import { ref } from 'vue';
import { debounce } from 'lodash';
import {
  BButton,
  BButtonToolbar,
  BCol,
  BCollapse,
  BDropdown,
  BDropdownItem,
  BRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import i18n from '@/i18n';

// Emits
const emit = defineEmits(['get-policy-rule-options', 'input']);

// Props
defineProps({
  policyRuleOptions: {
    type: Array,
    default: () => [],
  },
  searchInputPlaceholder: {
    type: String,
    default: i18n.global.t('common.search'),
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Data
const allUsersOption = ref({
  text: i18n.global.t('governance.certificationTask.allUsers'),
  value: 'all',
});
const debouncedSearch = debounce((value) => emit('get-policy-rule-options', value), 350);
const endDate = ref('');
const selectedStatus = ref({
  value: 'pending',
  text: i18n.global.t('governance.violations.status.inProgress'),
});
const selectedRule = ref('');
const selectedUser = ref('');
const showFilters = ref(false);
const startDate = ref('');
const statusOptions = [
  {
    value: 'pending',
    text: i18n.global.t('governance.violations.status.inProgress'),
  },
  {
    value: 'complete',
    text: i18n.global.t('governance.violations.status.complete'),
  },
];
const searchFieldHasFocus = ref(false);
const searchValue = ref('');

// Functions
/**
 * emit a filter object representing all the current form values
 */
function emitFilter() {
  emit('input', {
    status: selectedStatus.value.value,
    rule: selectedRule.value,
    user: selectedUser.value,
    startDate: startDate.value,
    endDate: endDate.value,
    searchValue: searchValue.value,
  });
}
const debouncedTextSearch = debounce(emitFilter, 500);

/**
 * Update status sort to new value and emit new filter values
 * @param {Object} newStatus new status value and text
 */
function handleStatusChange(newStatus) {
  selectedStatus.value = newStatus;
  emitFilter();
}

/**
 * Update the selected rule and emit new filter values
 * @param {String} rule rule id
 */
function handleRuleChange(rule) {
  selectedRule.value = rule;
  emitFilter();
}

/**
 * Update the selected user and emit new filter values
 * @param {String} user new user id
 */
function handleUserChange(user) {
  selectedUser.value = user;
  emitFilter();
}

/**
 * Update the start of the date range and emit new filter values
 * @param {String} date new start date string
 */
function handleStartDateChange(date) {
  startDate.value = date;
  emitFilter();
}

/**
 * Update the end of the date range and emit new filter values
 * @param {String} date new end date string
 */
function handleEndDateChange(date) {
  endDate.value = date;
  emitFilter();
}

emit('get-policy-rule-options', '');
</script>

<style lang="scss" scoped>
.toolbar-link-text {
  color: $gray-900;
}
</style>

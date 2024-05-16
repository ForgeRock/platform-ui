<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div role="toolbar">
    <BButtonToolbar class="justify-content-end px-4 py-3">
      <BButton
        @click="showFilters = !showFilters"
        class="toolbar-link-text"
        variant="link-dark">
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
            @input="debouncedTextSearch " />
        </BCol>
      </BRow>
    </BCollapse>
  </div>
</template>

<script setup>
/**
 * Contains four inputs that allow a user to filter SOD Exceptions
 * The inputs are: policy rule and user
 * A button toggles the visibility of the filter inputs
 * A button allows to customise the visibility and order of the columns
 */
import { ref } from 'vue';
import { debounce } from 'lodash';
import {
  BButton,
  BButtonToolbar,
  BCol,
  BCollapse,
  BRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import i18n from '@/i18n';

// Emits
const emit = defineEmits([
  'get-policy-rule-options',
  'input',
  'open-columns-modal',
]);

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
const searchFieldHasFocus = ref(false);
const searchValue = ref('');
const selectedRule = ref('');
const selectedUser = ref('');
const showFilters = ref(false);

/**
 * emit a filter object representing all the current form values
 */
function emitFilter() {
  emit('input', {
    rule: selectedRule.value,
    user: selectedUser.value,
    searchValue: searchValue.value,
  });
}

const debouncedTextSearch = debounce(emitFilter, 500);

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

emit('get-policy-rule-options', '');
</script>

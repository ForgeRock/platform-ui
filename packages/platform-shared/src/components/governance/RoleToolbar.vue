<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButtonToolbar
      justify
      class="px-4 py-3 border-bottom-0">
      <div>
        <FrActionsMenu
          v-if="!hideStatusFilter"
          data-testid="status-menu"
          variant="link"
          :selected-item-index="selectedStatusIndex"
          toggle-class="text-dark px-0 d-flex">
          <template #button-content>
            <div
              class="p-0 toolbar-link-text"
              data-testid="status-dropdown-button">
              <span class="font-weight-bold mr-1">
                {{ `${$t('common.status')}:` }}
              </span>
              {{ selectedStatus.text }}
            </div>
          </template>
          <template #default>
            <BDropdownItem
              v-for="status in statusOptions"
              :active="status.value === selectedStatus.value"
              @click="handleStatusChange(status)"
              :key="status.value">
              {{ status.text }}
            </BDropdownItem>
          </template>
        </FrActionsMenu>
      </div>
      <div
        class="flex-grow-1"
        :class="{ 'ml-2': !hideStatusFilter }">
        <FrSearchInput
          v-if="!hideSearchFilter"
          v-model="filters.nameFilter"
          class="w-100"
          :placeholder="$t('common.search')"
          @clear="handleFilterChange('nameFilter', '')"
          @search="handleFilterChange('nameFilter', filters.nameFilter)" />
      </div>
      <div>
        <BButton
          @click="showRoleFiltersModal()"
          class="toolbar-link-text"
          aria-labelledby="filter-toggle-label"
          data-testid="filter-toggle"
          variant="link">
          <FrIcon
            icon-class="mr-lg-2"
            name="filter_list">
            <span
              class="d-none d-lg-inline"
              id="filter-toggle-label">
              {{ showFilters ? $t('governance.hideFilters') : $t('governance.showFilters') }}
            </span>
          </FrIcon>
          <BBadge
            v-if="numFilters > 0"
            pill
            class="ml-1"
            data-testid="filter-badge"
            variant="primary">
            {{ numFilters }}
          </BBadge>
        </BButton>
      </div>
    </BButtonToolbar>
    <BModal
      cancel-variant="link"
      no-close-on-backdrop
      no-close-on-esc
      ref="roleFiltersModal"
      :title="$t('governance.accessModeling.filters.filterRoles')">
      <div class="pb-2">
        <BRow>
          <BCol
            lg="12"
            class="mt-2">
            <FrEntitlementSelect
              :model-value="filters.entitlementFilter"
              emit-value-as-object
              @update:modelValue="handleFilterChange('entitlementFilter', $event)" />
          </BCol>
        </BRow>
        <BRow>
          <BCol
            lg="12"
            class="mt-2">
            <FrField
              :value="filters.statusFilter"
              type="select"
              :disabled="disabled"
              :name="$t('common.status')"
              :label="$t('common.status')"
              :options="statusOptions"
              :placeholder="$t('common.status')"
              @input="handleFilterChange('statusFilter', $event)" />
          </BCol>
          <BCol
            lg="12"
            class="mt-2">
            <FrResourceSelect
              v-model="filters.userFilter"
              :fields="['givenName', 'sn', 'userName']"
              :label="$t('common.users')"
              is-empty-by-default
              :resource-path="`${$store.state.realm}_user`"
              type="select"
              @input="handleFilterChange('userFilter', $event)">
              <template #singleLabel="{ option }">
                {{ option.value.userName }}
              </template>
              <template #option="{ option }">
                <BMedia
                  no-body
                  class="py-1">
                  <BImg
                    :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                    :alt="$t('governance.accessRequest.newRequest.userImageAltText', { userName: option.value.userName })"
                    class="mr-2 align-self-center rounded rounded-circle"
                    width="24" />
                  <BMediaBody>
                    <div class="mb-1 text-dark">
                      {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
                    </div>
                    <small class="text-muted">
                      {{ option.value.userName }}
                    </small>
                  </BMediaBody>
                </BMedia>
              </template>
            </FrResourceSelect>
          </BCol>
          <BCol
            lg="12"
            class="mt-2">
            <FrField
              :value="filters.minMembersFilter"
              type="number"
              :disabled="disabled"
              :validation="{ min_value: { min: 0 }}"
              :name="$t('governance.accessModeling.filters.minMembers')"
              :label="$t('governance.accessModeling.filters.minMembersLabel')"
              :placeholder="$t('common.status')"
              @input="handleFilterChange('minMembersFilter', $event)" />
          </BCol>
        </BRow>
        <BRow>
          <BCol
            lg="12"
            class="mt-2">
            <FrField
              :value="filters.minEntitlementsFilter"
              type="number"
              :disabled="disabled"
              :validation="{ min_value: { min: 0 }}"
              :name="$t('governance.accessModeling.filters.minEntitlements')"
              :label="$t('governance.accessModeling.filters.minEntitlementsLabel')"
              :placeholder="$t('common.status')"
              @input="handleFilterChange('minEntitlementsFilter', $event)" />
          </BCol>
        </BRow>
      </div>
      <template #modal-footer>
        <BButton
          variant="outline-secondary"
          @click="clearFilters()">
          {{ $t('governance.accessModeling.filters.clearFilters') }}
        </BButton>
        <BButton
          variant="primary"
          @click="emitFilter()">
          {{ $t('governance.accessModeling.filters.applyFilters') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>

<script setup>
/**
 * Toolbar used for sorting and filtering access requests
 */
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BCol,
  BDropdownItem,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { onMounted, ref } from 'vue';
import { isEmpty } from 'lodash';
import FrActionsMenu from '@forgerock/platform-shared/src/components/ActionsMenu/ActionsMenu';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrResourceSelect from '@forgerock/platform-shared/src/components/Field/ResourceSelect';
import FrEntitlementSelect from '@forgerock/platform-shared/src/components/governance/EntitlementSelect';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const emit = defineEmits([
  'filter-change',
  'sort-change',
  'sort-direction-change',
  'status-change',
]);

const props = defineProps({
  hideStatusFilter: {
    type: Boolean,
    default: false,
  },
  hideSearchFilter: {
    type: Boolean,
    default: true,
  },
  numFilters: {
    type: Number,
    default: 0,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  sortByOptions: {
    type: Array,
    default: () => [],
  },
});

const roleFiltersModal = ref(null);
const filters = ref({
  nameFilter: '',
  applicationFilter: '',
  entitlementFilter: '',
  statusFilter: 'candidate',
  userFilter: [],
  minMembersFilter: 0,
  minEntitlementsFilter: 0,
});
const selectedStatus = ref({});
const selectedStatusIndex = ref(-1);
const showFilters = ref(false);
const userFieldInitialized = ref(false);

onMounted(() => {
  if (props.statusOptions.length) [selectedStatus.value] = props.statusOptions;
});

/**
 * Show the role filters modal
 */
function showRoleFiltersModal() {
  roleFiltersModal.value.show();
  showFilters.value = true;
}

/**
 * Emit the currently selected filters
 */
function emitFilter() {
  const queryFilterParams = {};
  if (filters.value.entitlementFilter) {
    queryFilterParams.entitlementFilter = filters.value.entitlementFilter.id;
  }
  if (filters.value.userFilter) {
    queryFilterParams.userFilter = filters.value.userFilter._id;
  }
  if (filters.value.statusFilter) {
    queryFilterParams.statusFilter = filters.value.statusFilter;
  }
  if (filters.value.minMembersFilter > 0) {
    queryFilterParams.minMembersFilter = filters.value.minMembersFilter;
  }
  if (filters.value.minEntitlementsFilter > 0) {
    queryFilterParams.minEntitlementsFilter = filters.value.minEntitlementsFilter;
  }
  if (filters.value.nameFilter) {
    queryFilterParams.nameFilter = filters.value.nameFilter;
  }
  emit('filter-change', isEmpty(queryFilterParams) ? null : queryFilterParams);
  roleFiltersModal.value.hide();
  showFilters.value = false;
}

/**
 * Clear the currently selected filters
 */
function clearFilters() {
  filters.value = {
    nameFilter: filters.value.nameFilter || '', // Preserve the name filter value in the input field
    applicationFilter: '',
    entitlementFilter: '',
    statusFilter: 'candidate',
    userFilter: [],
    minMembersFilter: 0,
    minEntitlementsFilter: 0,
  };
  emitFilter();
}

/**
 * Set current status and emit event with the status
 * @param {Object} status new status
 */
function handleStatusChange(status) {
  selectedStatus.value = status;
  selectedStatusIndex.value = props.statusOptions.findIndex((option) => option.value === status.value);
  emit('status-change', status.value);
}

/**
 * Update current filters and emit the new value
 * @param {String} filter the filter property to update
 * @param {Any} value the new filter value
 */
function handleFilterChange(filter, value) {
  if (filter === 'userFilter' && !userFieldInitialized.value) {
    userFieldInitialized.value = true;
  } else if (filter === 'nameFilter') {
    filters.value.nameFilter = value;
    emitFilter();
  } else {
    filters.value[filter] = value;
  }
}
</script>
<style lang="scss" scoped>
.toolbar-link-text {
  color: $gray-900;
}
</style>

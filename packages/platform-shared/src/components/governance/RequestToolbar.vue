<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButtonToolbar
      justify
      class="px-4 py-3 border-bottom-0">
      <BDropdown
        data-testid="status-dropdown"
        variant="link"
        toggle-class="px-0">
        <template #button-content>
          <BButton
            class="p-0 toolbar-link-text"
            data-testid="status-dropdown-button"
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
            :active="status.value === selectedStatus.value"
            @click="handleStatusChange(status)"
            :key="status.value">
            {{ status.text }}
          </BDropdownItem>
        </template>
      </BDropdown>
      <div>
        <FrSortDropdown
          class="px-3"
          :selected-item="sortField"
          :hide-labels-on-mobile="true"
          :sort-by-options="sortByOptions"
          @sort-field-change="handleSortChange"
          @sort-direction-change="handleSortDirectionChange" />
        <BButton
          @click="showFilters = !showFilters"
          class="toolbar-link-text"
          :pressed="showFilters"
          aria-labelledby="filter-toggle-label"
          data-testid="filter-toggle"
          variant="link">
          <FrIcon
            icon-class="mr-lg-2"
            name="filter_list">
            <span class="d-none d-lg-inline" id="filter-toggle-label">
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
    <BCollapse
      v-model="showFilters"
      data-testid="filter-collapse"
      id="filter-collapse">
      <div class="p-4 border-top">
        <slot name="filter">
          <FrRequestFilter
            data-testid="request-filter"
            @filter-change="handleFilterChange" />
        </slot>
      </div>
    </BCollapse>
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
  BCollapse,
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import { onMounted, ref } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrRequestFilter from '@forgerock/platform-shared/src/components/governance/RequestFilter';
import FrSortDropdown from '@forgerock/platform-shared/src/components/governance/SortDropdown';

const emit = defineEmits([
  'filter-change',
  'sort-change',
  'sort-direction-change',
  'status-change',
]);

const props = defineProps({
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

const selectedStatus = ref({});
const showFilters = ref(false);
const sortField = ref('date');

onMounted(() => {
  if (props.statusOptions.length) [selectedStatus.value] = props.statusOptions;
});

/**
 * Set number of filters and emit event with the filter and count
 * @param {Object} filter object representing applied filters
 */
function handleFilterChange(event) {
  emit('filter-change', event.filter);
  emit('update:num-filters', event.count);
}

/**
 * Set sort type and emit event
 * @param {String} sort sort type dropdown selection value
 */
function handleSortChange(sort) {
  emit('sort-change', sort);
}

/**
 * Set sort direction and emit event
 * @param {String} direction sort direction dropdown selection value (asc, desc)
 */
function handleSortDirectionChange(direction) {
  emit('sort-direction-change', direction);
}

/**
 * Set current status and emit event with the status
 * @param {Object} status new status
 */
function handleStatusChange(status) {
  selectedStatus.value = status;
  emit('status-change', status.value);
}
</script>
<style lang="scss" scoped>
.toolbar-link-text {
  color: $gray-900;
}
</style>

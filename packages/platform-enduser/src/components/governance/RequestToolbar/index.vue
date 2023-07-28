<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

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
          data-testid="filter-toggle"
          variant="link">
          <FrIcon
            class="mr-lg-2"
            name="filter_list" />
          <span class="d-none d-lg-inline">
            {{ showFilters ? $t('governance.hideFilters') : $t('governance.showFilters') }}
          </span>
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
        <FrRequestFilter
          data-testid="request-filter"
          @filter-change="handleFilterChange" />
      </div>
    </BCollapse>
  </div>
</template>

<script>
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BCollapse,
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrRequestFilter from '@/components/governance/RequestFilter';
import FrSortDropdown from '@/components/governance/SortDropdown';
/**
 * Toolbar used for sorting and filtering access requests
 */
export default {
  name: 'RequestToolbar',
  components: {
    BBadge,
    BButton,
    BButtonToolbar,
    BCollapse,
    BDropdown,
    BDropdownItem,
    FrIcon,
    FrRequestFilter,
    FrSortDropdown,
  },
  props: {
    statusOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      numFilters: 0,
      selectedStatus: {},
      showFilters: false,
      sortByOptions: [
        {
          value: 'date',
          text: this.$t('governance.accessRequest.requestDate'),
        },
        {
          value: 'requestedFor',
          text: this.$t('governance.accessRequest.requestedFor'),
        },
        {
          value: 'priority',
          text: this.$t('common.priority'),
        },
        {
          value: 'id',
          text: this.$t('governance.accessRequest.requestId'),
        },
      ],
      sortField: 'date',
    };
  },
  mounted() {
    if (this.statusOptions.length) [this.selectedStatus] = this.statusOptions;
  },
  methods: {
    /**
     * Set number of filters and emit event with the filter
     * @param {Object} filter object representing applied filters
     * @param {Number} count number of applied filters
     */
    handleFilterChange({ filter, count }) {
      this.numFilters = count;
      this.$emit('filter-change', filter);
    },
    /**
     * Set sort type and emit event
     * @param {String} sort sort type dropdown selection value
     */
    handleSortChange(sort) {
      this.$emit('sort-change', sort);
    },
    /**
     * Set sort direction and emit event
     * @param {String} direction sort direction dropdown selection value (asc, desc)
     */
    handleSortDirectionChange(direction) {
      this.$emit('sort-direction-change', direction);
    },
    /**
     * Set current status and emit event with the status
     * @param {String} status new status
     */
    handleStatusChange(status) {
      this.selectedStatus = status;
      this.$emit('status-change', status.value);
    },
  },
};
</script>
<style lang="scss" scoped>
.toolbar-link-text {
  color: $gray-900;
}
</style>

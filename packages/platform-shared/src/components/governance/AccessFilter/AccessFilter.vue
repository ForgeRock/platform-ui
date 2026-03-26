<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column h-100">
    <div class="flex-grow-1">
      <ul
        v-for="field in inputFields"
        :key="field.name"
        class="px-4 pb-4 list-unstyled fr-filters-nav mt-2">
        <h3 class="text-secondary mb-3">
          {{ field.name }}
        </h3>
        <li
          class="w-100 mb-2">
          <div class="d-flex flex-column">
            <component
              v-for="item in field.components"
              :key="item.id"
              :is="item.component"
              :value="item.props.value"
              :display-text="filterData[item.props.name]?.value"
              v-bind="item.props"
              v-model="filterData[item.props.name].value"
              v-on="item.on"
              @input="debouncedTextSearch(item.props.name, $event)"
              @search:applications="searchApplications"
              @update:applications="updateApplications"
              :application-search-results="applicationSearchResults"
            />
          </div>
        </li>
      </ul>
    </div>
    <div class="p-1 d-flex justify-content-between ">
      <BButton
        class="w-100"
        variant="outline-primary"
        @click="clearFilters()">
        {{ $t('governance.access.filter.clearFilters') }}
      </BButton>
    </div>
  </div>
</template>

<script setup>
/**
  * Filter component for access grants, providing controls to search and filter access items.
  */
import {
  BButton,
} from 'bootstrap-vue';
import {
  debounce,
  merge,
  cloneDeep,
} from 'lodash';
import { ref, watch, isRef } from 'vue';
import { getBasicFilter, getBasicNotFilter, getBasicBooleanFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { convertTargetFilterToQueryFilter } from '../../../utils/governance/filters';
import i18n from '@/i18n';

const emit = defineEmits([
  'clear-filters',
  'update-filter',
]);

const props = defineProps({
  useQueryFilter: {
    type: Boolean,
    default: false,
  },
  inputFields: {
    type: Array,
    default: () => [],
  },
  inputFilterData: {
    type: Object,
    default: () => ({}),
  },
});
const normalizedFilterData = isRef(props.inputFilterData)
  ? props.inputFilterData.value
  : props.inputFilterData;
const filterData = ref(normalizedFilterData);
const initialData = cloneDeep(normalizedFilterData);
const debouncedTextSearch = debounce((field, value) => {
  filterData.value[field].value = value;
}, 300);
function getInputFilters() {
  const obj = {};
  Object.keys(props.inputFields).forEach((item) => {
    merge(obj, props.inputFields[item].filters);
  });
  return obj;
}
const inputFilters = getInputFilters();

const applicationSearchResults = ref([]);

/**
 * Builds unique filters based on filter type and value
 * @param filter Filter key
 * @param value Value to be used for filter
 */
function getSpecificFilter(filter, value) {
  if (inputFilters[filter] && inputFilters[filter].operator === 'IN' && value.length > 0) {
    const specificFilter = inputFilters[filter];
    return getBasicFilter(specificFilter.operator, specificFilter.path, value);
  }

  if (inputFilters[filter] && inputFilters[filter].operator !== 'IN') {
    const specificFilter = inputFilters[filter];
    return specificFilter.not ? getBasicNotFilter(specificFilter.operator, specificFilter.path, specificFilter.value) : getBasicFilter(specificFilter.operator, specificFilter.path, specificFilter.value || value);
  }
  return null;
}

/**
 * Triggers an emit to update the access filter
 */
function updateAccessFilter() {
  const filterValues = {};

  // Populate filter lists for all grants and specific types
  Object.keys(filterData.value).forEach((key) => {
    if (filterData.value[key].value) {
      const filter = getSpecificFilter(key, filterData.value[key].value);
      if (filter) {
        ['all', ...filterData.value[key].grantTypes].forEach((grantType) => {
          if (!filterValues[grantType]) {
            filterValues[grantType] = [];
          }
          filterValues[grantType].push(filter);
        });
      }
    }
  });

  // Create final filter value for each type
  const allFilters = {};
  Object.keys(filterValues).forEach((key) => {
    if (!filterValues[key]) {
      allFilters[key] = 'true';
    } else {
      allFilters[key] = filterValues[key].length === 1 ? filterValues[key][0] : getBasicBooleanFilter('AND', filterValues[key]);
    }
  });

  // Set filter value to be a queryFilter string or a targetFilter object, depending on the underlying API that will be using it
  if (props.useQueryFilter) {
    const queryFilters = Object.fromEntries(
      Object.entries(allFilters).map(([key, value]) => [key, convertTargetFilterToQueryFilter(value)]),
    );
    emit('update-filter', queryFilters);
  } else {
    emit('update-filter', allFilters);
  }
}

/**
 * Triggers an emit to clear all filters to default
 */
function clearFilters() {
  Object.keys(initialData).forEach((key) => {
    filterData.value[key].value = initialData[key].value;
  });
  emit('clear-filters');
}

/**
 * Search the IGA for applications for the application filter field
 * @param {String} queryString query string to search applications
 */
async function searchApplications(queryString) {
  try {
    const { data } = await getResource('application', { queryString, authoritative: false });
    applicationSearchResults.value = data?.result || [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorSearchingApplications'));
  }
}

/**
 * Update applications selected in the application filter field
 * @param {String} applications list of applications selected
 */
async function updateApplications(applications) {
  try {
    filterData.value.applications.value = applications;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorSearchingApplications'));
  }
}

watch(filterData, () => {
  updateAccessFilter();
}, { deep: true });

</script>

<style lang="scss" scoped>
.fr-filters-nav {
  width: 265px;

  h3 {
    font-size: 0.875rem;
  }
}

.popover-body p {
  font-size: 0.9375rem;
}
</style>

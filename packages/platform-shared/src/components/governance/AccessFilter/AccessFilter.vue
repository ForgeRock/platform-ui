<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column h-100">
    <div class="flex-grow-1">
      <ul class="px-4 pb-4 list-unstyled fr-filters-nav mt-2">
        <h3 class="text-secondary mb-3">
          {{ $t('governance.access.filter.generalFilters') }}
        </h3>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrField
              v-model="filterData.neverCertified.value"
              class="mr-2"
              aria-labelledby="label-revoke"
              name="neverCertified"
              :label="$t('governance.access.filter.neverCertified')"
              type="checkbox" />
          </div>
        </li>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrField
              v-model="filterData.roleBased.value"
              class="mr-2"
              aria-labelledby="label-revoke"
              name="roleBased"
              :label="$t('governance.access.filter.roleBased')"
              type="checkbox" />
          </div>
        </li>
      </ul>
      <ul class="px-4 pb-4 list-unstyled fr-filters-nav mb-2">
        <h3 class="text-secondary mb-3">
          {{ $t('common.role') }}
        </h3>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrSearchInput
              :value="filterData.roleName.value"
              class="w-100 mb-2"
              :placeholder="$t('common.role')"
              @input="debouncedTextSearch('roleName', $event)" />
          </div>
        </li>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrField
              v-model="filterData.conditionalRoles.value"
              class="mr-2"
              aria-labelledby="label-revoke"
              name="conditionalRoles"
              :label="$t('governance.access.filter.conditional')"
              type="checkbox" />
          </div>
        </li>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrField
              v-model="filterData.directRoles.value"
              class="mr-2"
              aria-labelledby="label-revoke"
              name="directRoles"
              :label="$t('governance.access.filter.direct')"
              type="checkbox" />
          </div>
        </li>
      </ul>
      <ul class="px-4 pb-4 list-unstyled fr-filters-nav mb-2">
        <h3 class="text-secondary mb-3">
          {{ $t('common.application') }}
        </h3>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrApplicationSearch
              @search:applications="searchApplications"
              @update:applications="updateApplications"
              :applications="filterData.applications.value"
              :application-search-results="applicationSearchResults" />
          </div>
        </li>
      </ul>
      <ul class="px-4 pb-4 list-unstyled fr-filters-nav mb-2">
        <h3 class="text-secondary mb-3">
          {{ $t('common.entitlement') }}
        </h3>
        <li class="w-100 mb-2">
          <div class="d-flex flex-column">
            <FrSearchInput
              :value="filterData.entitlementName.value"
              class="w-100 mb-4"
              :placeholder="$t('common.entitlement')"
              @input="debouncedTextSearch('entitlementName', $event)" />
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
import { debounce } from 'lodash';
import { ref, watch } from 'vue';
import { getBasicFilter, getBasicNotFilter, getBasicBooleanFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrApplicationSearch from '@forgerock/platform-shared/src/components/governance/ApplicationSearch/ApplicationSearch';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { convertTargetFilterToQueryFilter } from '../../../utils/governance/filters';
import accessConstants from '../../../views/Governance/Access/utils/accessConstants';
import i18n from '@/i18n';

const emit = defineEmits([
  'clear-filters',
  'update-filter',
]);

/**
 * Returns the default filter data contents
 */
function getInitialFilterData() {
  return {
    neverCertified: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT, accessConstants.GRANT_TYPES.ROLE],
    },
    roleBased: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    conditionalRoles: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ROLE],
    },
    directRoles: {
      value: false,
      grantTypes: [accessConstants.GRANT_TYPES.ROLE],
    },
    roleName: {
      value: null,
      grantTypes: [accessConstants.GRANT_TYPES.ROLE],
    },
    applications: {
      value: [],
      grantTypes: [accessConstants.GRANT_TYPES.ACCOUNT, accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
    entitlementName: {
      value: null,
      grantTypes: [accessConstants.GRANT_TYPES.ENTITLEMENT],
    },
  };
}
const filterData = ref(getInitialFilterData());
const debouncedTextSearch = debounce((field, value) => {
  filterData.value[field].value = value;
}, 300);

const applicationSearchResults = ref([]);
const props = defineProps({
  useQueryFilter: {
    type: Boolean,
    default: false,
  },
});

/**
 * Builds unique filters based on filter type and value
 * @param filter Filter key
 * @param value Value to be used for filter
 */
function getSpecificFilter(filter, value) {
  if (filter === 'neverCertified') {
    return getBasicNotFilter('EXISTS', 'item.decision.certification.decision', null);
  }
  if (filter === 'roleBased') {
    return getBasicFilter('EQUALS', 'relationship.properties.grantTypes.grantType', 'role');
  }
  if (filter === 'conditionalRoles') {
    return getBasicFilter('EQUALS', 'relationship.properties.grantTypes.conditional', true);
  }
  if (filter === 'directRoles') {
    return getBasicNotFilter('EXISTS', 'relationship.properties.grantTypes.conditional', null);
  }
  if (filter === 'applications' && value.length > 0) {
    return getBasicFilter('IN', 'application.id', value);
  }
  if (filter === 'roleName' && value) {
    return getBasicFilter('CONTAINS', 'role.name', value);
  }
  if (filter === 'entitlementName' && value) {
    return getBasicFilter('CONTAINS', 'descriptor.idx./entitlement.displayName', value);
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
  filterData.value = getInitialFilterData();
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

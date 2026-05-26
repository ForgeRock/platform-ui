<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column h-100">
    <div class="flex-grow-1">
      <ul
        v-for="field in inputFields"
        :key="field.name"
        class="px-4 pb-2 list-unstyled fr-filters-nav mt-2 justify-content-between">
        <li>
          <h3 class="text-secondary mb-2 d-flex align-items-center">
            {{ field.name }}
            <BButton
              v-if="!nonAddable.includes(field.name)"
              class="ml-auto"
              variant="link"
              @click="filterModal(field.name)">
              <FrIcon
                icon-class="mr-1"
                name="add">
                {{ $t('common.add') }}
              </FrIcon>
            </BButton>
          </h3>
        </li>
        <li
          class="w-100 mb-2">
          <div class="d-flex flex-column">
            <component
              v-for="item in field.components"
              :key="item.id"
              :is="item.component"
              :value="item.props.value"
              :display-text="filterData[item.props.name]?.value"
              v-bind="item.id === 'requestType' ? { ...item.props, options: requestTypeOptions } : item.props"
              v-model="filterData[item.props.name].value"
              v-on="item.on"
              @input="item.id !== 'requestType' ? debouncedTextSearch(item.props.name, $event) : undefined"
              @update:value="filterData[item.props.name].value = $event"
              @search:applications="searchApplications"
              @update:applications="updateApplications"
              @search-change="item.id === 'requestType' ? handleRequestTypeSearchChange($event) : undefined"
              @closed="item.id === 'requestType' ? handleRequestTypeClosed() : undefined"
              :application-search-results="applicationSearchResults"
            >
              <template
                v-if="(item.id === 'user' || item.props['resource-path'] === 'alpha_user')"
                #singleLabel="{ option }">
                <div
                  v-if="option.givenName"
                  class="d-flex justify-content-start align-items-center p-2">
                  <BMedia>
                    <template #aside>
                      <BImg
                        height="24"
                        width="24"
                        :alt="option.text"
                        :aria-hidden="true"
                        :src="option.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                    </template>
                    <div
                      class="media-body d-flex flex-column">
                      <div
                        class="mb-0 text-dark text-truncate">
                        {{ `${option.givenName} ${option.sn}` }}
                      </div>
                      <small class="text-truncate">
                        {{ option.userName }}
                      </small>
                    </div>
                  </BMedia>
                </div>
                <div
                  v-if="option.userInfo"
                  class="d-flex justify-content-start align-items-center p-2">
                  <BMedia>
                    <template #aside>
                      <BImg
                        height="24"
                        width="24"
                        :alt="option.text"
                        :aria-hidden="true"
                        :src="option.userInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                    </template>
                    <div
                      class="media-body d-flex flex-column">
                      <div
                        class="mb-0 text-dark text-truncate">
                        {{ `${option.userInfo.givenName} ${option.userInfo.sn}` }}
                      </div>
                      <small class="text-truncate">
                        {{ option.userInfo.userName }}
                      </small>
                    </div>
                  </BMedia>
                </div>
                <div
                  class="certification-task-filter-default"
                  v-if="item.props['resource-path'] !== 'alpha_user' && !option.givenName">
                  {{ $t('governance.certificationTask.allUsers') }}
                </div>
              </template>
              <template
                v-if="(item.id === 'user' || item.props['resource-path'] === 'alpha_user')"
                #option="{ option }">
                <div v-if="!option.value">
                  {{ option.text }}
                </div>
                <div v-else-if="isEmpty(option.value)" />
                <div
                  v-else-if="option.userInfo"
                  class="d-flex justify-content-start align-items-center">
                  <BMedia>
                    <template #aside>
                      <BImg
                        height="24"
                        width="24"
                        :alt="option.userInfo"
                        :aria-hidden="true"
                        :src="option.userInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                    </template>
                    <div
                      class="media-body d-flex flex-column">
                      <div
                        class="mb-0 text-dark text-truncate">
                        {{ `${option.userInfo.givenName} ${option.userInfo.sn}` }}
                      </div>
                      <small class="text-truncate">
                        {{ option.userInfo.userName }}
                      </small>
                    </div>
                  </BMedia>
                </div>
                <div
                  v-else
                  class="d-flex justify-content-start align-items-center">
                  <BMedia>
                    <template #aside>
                      <BImg
                        height="24"
                        width="24"
                        :alt="option.text"
                        :aria-hidden="true"
                        :src="option.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                    </template>
                    <div
                      class="media-body d-flex flex-column">
                      <div
                        class="mb-0 text-dark text-truncate">
                        {{ `${option.givenName} ${option.sn}` }}
                      </div>
                      <small class="text-truncate">
                        {{ option.userName }}
                      </small>
                    </div>
                  </BMedia>
                </div>
              </template>
            </component>
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
  <FrAccessFilterModal
    :filter-schema="filterSchema"
    :selected-item="filterSchemaType"
    @add-filter="addFilter"
    :success-text="$t('governance.entitlements.modifyMembersSuccess')" />
</template>

<script setup>
/**
  * Filter component for access grants, providing controls to search and filter access items.
  */
import {
  BButton,
  BMedia,
  BImg,
} from 'bootstrap-vue';
import {
  debounce,
  merge,
  cloneDeep,
  isEmpty,
  startsWith,
} from 'lodash';
import {
  ref, watch, isRef, onMounted,
} from 'vue';
import { getBasicFilter, getBasicNotFilter, getBasicBooleanFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useRequestTypeOptions } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { convertTargetFilterToQueryFilter } from '../../../utils/governance/filters';
import FrAccessFilterModal from './AccessFilterModal/AccessFilterModal';
import i18n from '@/i18n';

const emit = defineEmits([
  'clear-filters',
  'update-filter',
  'add-filter',
]);

const { bvModal } = useBvModal();

const props = defineProps({
  useQueryFilter: {
    type: Boolean,
    default: false,
  },
  inputFields: {
    type: Object,
    default: () => ({}),
  },
  inputFilterData: {
    type: Object,
    default: () => ({}),
  },
  filterSchema: {
    type: Object,
    default: () => ({}),
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});
const normalizedFilterData = isRef(props.inputFilterData)
  ? props.inputFilterData.value
  : props.inputFilterData;
const filterData = ref(normalizedFilterData);
const initialData = cloneDeep(normalizedFilterData);
const filterSchemaType = ref('');
const nonAddable = ['General', 'Certification'];
function getInputFilters() {
  const obj = {};
  Object.keys(props.inputFields).forEach((item) => {
    merge(obj, props.inputFields[item].filters);
  });
  return obj;
}

const applicationSearchResults = ref([]);

const hasRequestTypeField = Object.values(props.inputFields).some(
  (group) => group.components?.some((c) => c.id === 'requestType'),
);

const { requestTypeOptions, searchRequestTypes } = hasRequestTypeField
  ? useRequestTypeOptions()
  : { requestTypeOptions: ref([]), searchRequestTypes: () => {} };

let requestTypeDropdownClosing = false;

function handleRequestTypeSearchChange(query) {
  if (requestTypeDropdownClosing) {
    requestTypeDropdownClosing = false;
    return;
  }
  searchRequestTypes(query);
}

function handleRequestTypeClosed() {
  requestTypeDropdownClosing = true;
}

onMounted(() => {
  if (hasRequestTypeField) {
    searchRequestTypes('');
  }
});

/**
 * Builds unique filters based on filter type and value
 * @param filter Filter key
 * @param value Value to be used for filter
 */
function getSpecificFilter(filter, value) {
  const inputFilters = getInputFilters();
  if (typeof value === 'object' && value._id) {
    // eslint-disable-next-line no-param-reassign
    value = value._id;
  }
  if (inputFilters[filter] && inputFilters[filter].operator === 'IN' && value.length > 0) {
    const specificFilter = inputFilters[filter];
    return getBasicFilter(specificFilter.operator, specificFilter.path, value);
  }

  if (inputFilters[filter] && inputFilters[filter].operator !== 'IN' && !(inputFilters[filter].operator === 'EQUALS' && !(isEmpty(inputFilters[filter].value) || isEmpty(value)))) {
    const specificFilter = inputFilters[filter];
    return specificFilter.not ? getBasicNotFilter(specificFilter.operator, specificFilter.path, specificFilter.value || value) : getBasicFilter(specificFilter.operator, specificFilter.path, specificFilter.value || value);
  }
  return null;
}

function getDecisionFilter(filters) {
  const decisionsToFilter = [];
  const includeNoDecision = filterData.value.noDecision?.value || false;
  filters.forEach((key) => {
    if (filterData.value[key] && filterData.value[key].value) {
      decisionsToFilter.push(key);
    }
  });
  const noDecisionFilter = {
    operator: 'NOT',
    operand: [getBasicFilter('EXISTS', 'decision.certification.decision')],
  };

  const filteredDecisions = decisionsToFilter.filter((decision) => (decision !== 'noDecision'));
  const decisionFilter = getBasicFilter('IN', 'decision.certification.decision', filteredDecisions);
  const finalFilter = {
    operator: includeNoDecision ? 'OR' : 'AND',
    operand: includeNoDecision ? [decisionFilter, noDecisionFilter] : [decisionFilter],
  };
  return finalFilter;
}

function setFilterType(item) {
  filterSchemaType.value = item ? item.toLowerCase() : '';
}

function filterModal(item) {
  setFilterType(item);
  bvModal.value.show('add-filter');
}

/**
 * Triggers an emit to update the access filter
 */
function updateAccessFilter() {
  const filterValues = {};
  const decisionFilters = ['exception', 'certify', 'revoke', 'noDecision'];
  const decisionFilter = getDecisionFilter(decisionFilters);
  // Populate filter lists for all grants and specific types
  Object.keys(filterData.value).forEach((key) => {
    if (filterData.value[key].value && !decisionFilters.includes(key)) {
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
  if (decisionFilter) {
    allFilters.decision = decisionFilter;
  }

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
 * Searching a given filter field for the value i.e. search for a given user
 * @param {String} field the filter being searched on
 * @param {String} value the value that is being searched for the given filter
 */
function searchFilter(field, value) {
  if (startsWith(value, 'managed')) {
    // eslint-disable-next-line prefer-destructuring, no-param-reassign
    value = value.split('/')[2];
  }
  filterData.value[field].value = value;
  updateAccessFilter();
}
const debouncedTextSearch = debounce(searchFilter, 500);
/**
 * Triggers an emit to clear all filters to default
 */
function clearFilters() {
  Object.keys(initialData).forEach((key) => {
    filterData.value[key].value = initialData[key].value;
  });
  Object.keys(filterData.value).forEach((key) => {
    if (!Object.keys(initialData).includes(key)) {
      if (typeof filterData.value[key].value === 'boolean') {
        filterData.value[key].value = false;
      } else if (typeof filterData.value[key].value === 'object') {
        filterData.value[key].value = {};
      } else {
        filterData.value[key].value = '';
      }
    }
  });
  emit('clear-filters');
}

/**
 * Emitting the filter from the add filter modal to parent component
 * @param {String} newFilter the new filter object being added
 * @param {String} type type of new filter i.e. user
 */
function addFilter(newFilter, type) {
  bvModal.value.hide('add-filter');
  emit('add-filter', newFilter, type);
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
    updateAccessFilter();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorSearchingApplications'));
  }
}

watch(filterData, () => {
  if (props.isTesting) { updateAccessFilter(); }
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
:deep(.certification-task-filter) {
  border: 1px solid $gray-200;

  .certification-task-filter-selected {
    width: 95%;
  }

}
:deep(.certification-task-filter-dropdown) {
  .multiselect__tags {
    min-height: 85px;
  }

  .multiselect__single > .certification-task-filter-default {
    margin-top: 32px;
  }
}
</style>

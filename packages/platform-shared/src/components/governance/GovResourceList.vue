<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <BCardHeader class="p-0 border-bottom-0 flex-column flex-lg-row">
      <BButtonToolbar>
        <div class="mb-lg-0 mr-lg-1 ">
          <BButton
            variant="primary"
            @click="$emit('add-clicked')">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('common.addObject', { object: capitalize(resource)}) }}
            </FrIcon>
          </BButton>
        </div>
        <FrSearchInput
          class="ml-auto"
          v-model="searchValue"
          @clear="search('')"
          @search="search(searchValue)" />
        <slot name="toolbar-right" />
      </BButtonToolbar>
    </BCardHeader>
    <slot name="toolbar-expanded" />
    <BTable
      class="mb-0"
      hover
      responsive
      show-empty
      tbody-tr-class="cursor-pointer tr-gov-resource-list"
      :busy="isLoading"
      :empty-text="$t('common.noObjectFound', { object: pluralizeAnyString(resource)})"
      :fields="columns"
      :items="items"
      @row-clicked="$emit('row-clicked', $event)">
      <template #table-busy>
        <div class="text-center text-danger p-3">
          <FrSpinner />
        </div>
      </template>
      <template
        v-for="(key, slotName) in $slots"
        #[slotName]="slotData">
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
      <template #cell(actions)="{ item }">
        <FrActionsCell
          :delete-option="false"
          :divider="false"
          edit-option
          @edit-clicked="$emit('row-clicked', item)" />
      </template>
    </BTable>
    <FrPagination
      :value="currentPage"
      :per-page="currentPageSize"
      :total-rows="totalRows"
      @input="pageChange($event)"
      @on-page-size-change="pageSizeChange($event)" />
  </BCard>
</template>

<script setup>
/**
 * This component is used to display a list of resources used for governance LCM.
 */
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BTable,
} from 'bootstrap-vue';
import {
  computed,
  ref,
  watch,
} from 'vue';
import { capitalize } from 'lodash';
import { pluralizeAnyString } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import i18n from '@/i18n';

defineEmits(['row-clicked']);

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  resourceFunction: {
    type: Function,
    required: true,
  },
  additionalQueryParams: {
    type: String,
    default: '',
  },
});

const isLoading = ref(false);
const items = ref([]);
const currentPage = ref(1);
const currentPageSize = ref(10);
const searchValue = ref('');
const totalRows = ref(0);

const resourcePath = computed(() => {
  switch (props.resource) {
    case 'user':
      return 'alpha_user';
    case 'role':
      return 'alpha_role';
    case 'organization':
      return 'alpha_organization';
    default:
      return props.resource;
  }
});

const totalResultsPath = computed(() => {
  switch (props.resource) {
    case 'user':
    case 'role':
    case 'organization':
      return 'totalPagedResults';
    case 'entitlement':
      return 'totalCount';
    default:
      return '';
  }
});

/**
 * Retrieves the query fields based on the provided resource type.
 *
 * @param {string} resourceType - The type of resource for which to get the query fields.
 * @returns {Array} An array of query fields corresponding to the specified resource type.
 */
function getQueryFields(resourceType) {
  switch (resourceType) {
    case 'user':
      return ['userName', 'givenName', 'sn', 'mail'];
    case 'role':
    case 'organization':
      return ['name', 'description'];
    case 'entitlement':
      return ['application', 'descriptor', 'entitlementOwner', 'item'];
    default:
      return [];
  }
}

/**
 * Generates query string fields based on the provided resource type.
 *
 * @param {string} resourceType - The type of resource for which to generate query string fields.
 * @returns {Array} An array containing the query string fields for the specified resource type.
 */
function getQueryStringFields(resourceType) {
  switch (resourceType) {
    case 'user':
    case 'role':
    case 'organization':
      return getQueryFields(resourceType).map((field) => `/${field}`);
    case 'entitlement':
      return ['descriptor.idx./entitlement.displayName'];
    default:
      return ['*'];
  }
}

/**
 * Generates a query parameter string for a given resource type.
 *
 * @param {string} resourceType - The type of resource to query.
 * @param {string} queryString - The query string to include in the parameters.
 * @param {number} page - The page number for pagination.
 * @param {number} pageSize - The number of items per page for pagination.
 * @returns {string} The generated query parameter string.
 */
function queryParamFunction(resourceType, queryString, page, pageSize) {
  const queryParams = {};
  queryParams.fields = getQueryFields(resourceType).join(',');
  queryParams.pageSize = pageSize;
  queryParams.pagedResultsOffset = (page - 1) * pageSize;

  // handle query string and additional query params
  let queryFilter;
  if (queryString) {
    const tempQuery = getQueryStringFields(resourceType).map((field) => `${field} co "${queryString}"`).join(' or ');
    queryFilter = props.additionalQueryParams
      ? [`(${tempQuery})`, `(${props.additionalQueryParams})`].join(' and ')
      : tempQuery;
  } else {
    queryFilter = props.additionalQueryParams
      ? props.additionalQueryParams
      : true;
  }
  queryParams.queryFilter = queryFilter;

  if (resourceType !== 'entitlement') queryParams.totalPagedResultsPolicy = 'EXACT';

  return queryParams;
}

/**
 * Asynchronously loads data for the component.
 * This function fetches necessary data and handles any required processing.
 */
async function loadData() {
  isLoading.value = true;
  try {
    const queryParams = queryParamFunction(props.resource, searchValue.value, currentPage.value, currentPageSize.value);
    const { data } = await props.resourceFunction(resourcePath.value, queryParams);
    items.value = data.result;
    totalRows.value = data[totalResultsPath.value];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.errorRetrievingResources', { resource: props.resource }));
    items.value = [];
    totalRows.value = 0;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Searches for resources based on the provided query.
 *
 * @param {string} query - The search query to filter resources.
 */
function search(query) {
  searchValue.value = query;
  loadData();
}

/**
 * Handles the change in page for the resource list.
 *
 * @param {number} pageNum - The new page number selected by the user.
 */
function pageChange(pageNum) {
  currentPage.value = pageNum;
  loadData();
}

/**
 * Handles the change in page size for the resource list.
 *
 * @param {number} size - The new page size selected by the user.
 */
function pageSizeChange(size) {
  currentPageSize.value = size;
  loadData();
}

loadData();

watch(() => props.additionalQueryParams, loadData);

</script>

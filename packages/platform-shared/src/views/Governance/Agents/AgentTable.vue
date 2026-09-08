<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    :class="{ 'px-0': isEmbedded }">
    <div :class="{ 'mt-5': !isEmbedded }">
      <FrHeader
        v-if="!isEmbedded"
        :title="$t('governance.agents.title')"
        :subtitle="$t('governance.agents.subtitle')" />
      <div>
        <div :class="{ 'my-5': !isEmbedded }">
          <BCard
            no-body
            :class="{ 'border-0': isEmbedded }">
            <BCardHeader class="p-0">
              <BButtonToolbar
                class="btn-toolbar d-flex flex-row justify-content-between p-3 border-bottom-0 app-toolbar">
                <FrSearchInput
                  class="ml-auto"
                  v-model="searchQuery"
                  :placeholder="$t('common.search')"
                  @clear="clear"
                  @search="search(1)" />
              </BButtonToolbar>
            </BCardHeader>
            <template v-if="tableLoading">
              <FrSpinner class="py-5" />
            </template>
            <BTable
              v-else-if="agents.length"
              class="mb-0"
              v-resizable-table="{ persistKey: 'agent-table' }"
              responsive
              hover
              tbody-tr-class="cursor-pointer"
              :fields="fields"
              :items="agents"
              @row-clicked="navigateToEdit($event.id)"
              no-local-sorting
              no-sort-reset
              :sort-desc="sortDesc"
              :sort-by="sortBy"
              @sort-changed="sortingChanged">
              <template #cell(application)="{ item }">
                <BMedia
                  class="align-items-center"
                  no-body>
                  <img
                    class="mr-3 size-28"
                    :alt="item.application.name"
                    :src="item.application.icon"
                    :onerror="onImageError">
                  <BMediaBody class="align-self-center">
                    <div class="m-0 h5">
                      {{ item.application.name }}
                    </div>
                    <small class="text-muted">
                      {{ item.application.templateName }}
                    </small>
                  </BMediaBody>
                </BMedia>
              </template>
              <template #head(actions)>
                <span class="sr-only">
                  {{ $t('common.actions') }}
                </span>
              </template>
              <template #cell(actions)="{ item }">
                <FrActionsCell
                  :divider="false"
                  :delete-option="false"
                  :edit-option="false">
                  <template #custom-bottom-actions>
                    <BDropdownItem @click="navigateToEdit(item.id)">
                      <FrIcon
                        icon-class="mr-2"
                        name="list_alt">
                        {{ $t('common.viewDetails') }}
                      </FrIcon>
                    </BDropdownItem>
                  </template>
                </FrActionsCell>
              </template>
            </BTable>
            <FrNoData
              v-else
              :card="false"
              class="mb-4"
              icon="inbox"
              :subtitle="$t('common.noResultsFound')" />
            <FrPagination
              v-if="totalPagedResults > entriesPerPage"
              :value="currentPage"
              :per-page="entriesPerPage"
              :total-rows="totalPagedResults"
              @input="search($event)"
              @on-page-size-change="pageSizeChange" />
          </BCard>
        </div>
      </div>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BCard,
  BCardHeader,
  BButtonToolbar,
  BContainer,
  BDropdownItem,
  BMedia,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getAccounts } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { escapeQueryFilterValue } from '@forgerock/platform-shared/src/utils/queryFilterUtils';
import { getAgentDisplayName } from './utils/agentUtility';
import agentConstants from './utils/agentConstants';
import i18n from '@/i18n';

const props = defineProps({
  // When set, the view renders without the page header and is scoped to
  // those applications (used when embedded in an application page)
  isEmbedded: {
    type: Boolean,
    default: false,
  },
  applicationIds: {
    type: Array,
    default: null,
  },
  applicationName: {
    type: String,
    default: '',
  },
  // Side-tab key this view is hosted under when embedded, so detail views can
  // return the breadcrumb to the originating side tab
  objectTab: {
    type: String,
    default: '',
  },
});

const router = useRouter();
const currentPage = ref(1);
const entriesPerPage = ref(10);
const totalPagedResults = ref(0);
const tableLoading = ref(true);
const agents = ref([]);
const sortBy = ref('displayName');
const sortDesc = ref(false);
const searchQuery = ref('');

const fields = [
  {
    key: 'application',
    class: 'w-240px',
    label: i18n.global.t('common.application'),
    sortable: true,
  },
  {
    key: 'displayName',
    label: i18n.global.t('common.displayName'),
    sortable: true,
  },
  {
    key: 'description',
    class: 'w-160px',
    label: i18n.global.t('governance.agents.description'),
    sortable: false,
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    class: 'w-5 justify-content-end col-actions',
  },
];

/**
 * Get the sort field to send to query
 * @returns String the sort parameter
 */
function getSortParam() {
  switch (sortBy.value) {
    case 'application':
      return 'application.name';
    case 'displayName':
      return 'descriptor.idx./account.displayName';
    default:
      return sortBy.value;
  }
}

/**
 * Builds the query filter: always scoped to this application's agents, ANDed
 * with the user's search
 * @returns String the composed query filter
 */
function getQueryFilter() {
  const escapedSearchQuery = escapeQueryFilterValue(searchQuery.value);
  const searchQueryFilter = searchQuery.value
    ? `(user.userName co '${escapedSearchQuery}' or descriptor.idx./account.displayName co '${escapedSearchQuery}')`
    : '';
  const applicationFilter = props.applicationIds?.length
    ? `(${props.applicationIds.map((app) => `application.id eq '${app}'`).join(' or ')})`
    : '';
  const agentFilter = `(glossary.idx./account.accountType eq "${agentConstants.ACCOUNT_TYPES.AGENT}")`;

  const filters = [searchQueryFilter, applicationFilter, agentFilter].filter(Boolean);
  return filters.length > 0 ? filters.join(' and ') : 'true';
}

/**
 * Search agents scoped to the hosting application
 * @param page number|null The page number to search for, if null current page is used
 */
async function search(page = null) {
  if (page) currentPage.value = page;

  tableLoading.value = true;
  try {
    const { data } = await getAccounts({
      pagedResultsOffset: (currentPage.value - 1) * entriesPerPage.value,
      pageSize: entriesPerPage.value,
      sortKeys: getSortParam(),
      sortDir: sortDesc.value ? 'desc' : 'asc',
      queryFilter: getQueryFilter(),
    });
    agents.value = (data?.result || []).map((item) => {
      const processedItem = { ...item };
      const applicationIcon = item?.application?.icon || getApplicationLogo(item.application);
      if (applicationIcon && processedItem.application) processedItem.application.icon = applicationIcon;
      processedItem.displayName = getAgentDisplayName(processedItem);
      processedItem.description = item.account?.description || blankValueIndicator;
      return processedItem;
    });
    totalPagedResults.value = data.totalCount;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.errors.errorSearchingAgents'));
  } finally {
    tableLoading.value = false;
  }
}

/**
 * Query params identifying the embedding application, so the details view can
 * return the breadcrumb to this application's Objects tab. Null when standalone.
 * @returns {Object|null} The origin query params, or null when not application-scoped
 */
function getOriginQuery() {
  if (!props.applicationIds?.length) return null;
  return {
    originAppId: props.applicationIds[0],
    originAppName: props.applicationName,
    ...(props.objectTab ? { originObjectTab: props.objectTab } : {}),
  };
}

/**
 * Navigate to the given agent by id
 * @param agentId string The agent ID to navigate to
 */
function navigateToEdit(agentId) {
  router.push({
    name: 'AgentsDetails',
    params: {
      agentId,
      tab: 'details',
    },
    ...(props.applicationIds?.length ? { query: getOriginQuery() } : {}),
  });
}

function sortingChanged(ctx) {
  sortBy.value = ctx.sortBy;
  sortDesc.value = ctx.sortDesc;
  currentPage.value = 1;
  search();
}

function clear() {
  searchQuery.value = '';
  search(1);
}

function pageSizeChange(pageSize) {
  entriesPerPage.value = pageSize;
  search();
}

onMounted(() => {
  search();
});
</script>

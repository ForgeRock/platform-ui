<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <div class="mt-5">
      <FrHeader
        :title="i18n.global.t('governance.agents.title')"
        :subtitle="i18n.global.t('governance.agents.subtitle')" />
      <div>
        <div
          class="my-5">
          <BCard
            no-body
            class="card-tabs-vertical">
            <BCardHeader class="p-0">
              <BButtonToolbar class="d-flex flex-row justify-content-end p-3 border-bottom-0 app-toolbar">
                <FrSearchInput
                  v-model="searchQuery"
                  :placeholder="i18n.global.t('common.search')"
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
              v-resizable-table="{ persistKey: 'agents' }"
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
              @sort-changed="sortingChanged"
            >
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
              <template #cell(agentId)="{ item }">
                <div
                  class="w-100px d-flex">
                  {{ item.account?.agentId || blankValueIndicator }}
                </div>
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
                        {{ i18n.global.t('common.viewDetails') }}
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
              :subtitle="i18n.global.t('common.noResultsFound')" />
            <FrPagination
              v-if="totalPagedResults > entriesPerPage"
              :value="currentPage"
              :per-page="entriesPerPage"
              :total-rows="totalPagedResults"
              @input="search()"
              @on-page-size-change="pageSizeChange"
            />
          </BCard>
        </div>
      </div>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BButtonToolbar,
  BCard,
  BCardHeader,
  BContainer,
  BDropdownItem,
  BMedia,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { capitalize } from 'lodash';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getAccounts } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import agentConstants from '@forgerock/platform-shared/src/views/Governance/Agents/utils/agentConstants';
import i18n from '@/i18n';

const router = useRouter();
const currentPage = ref(1);
const entriesPerPage = ref(10);
const totalPagedResults = ref(0);
const tableLoading = ref(true);
const agents = ref([]);
const sortBy = ref('displayName');
const sortDesc = ref(false);
const searchQuery = ref('');
const selectedApplications = ref([]);
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
    key: 'agentId',
    class: 'w-240px',
    label: i18n.global.t('governance.agents.agentId'),
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
 * Get sort field to send to query
 * @param sortByVal string The field to sort by
 */
function getSortParam(sortByVal) {
  switch (sortByVal.value) {
    case 'application':
      return 'application.name';
    case 'displayName':
    default:
      return 'descriptor.idx./account.displayName';
  }
}

/**
 * Builds the query filter for agents based on the current search query, selected applications, and the active tab
 * @param tab integer The tab key index to get the query filter for
 */
function getQueryFilterForAgents() {
  const searchQueryFilter = searchQuery.value
    ? `descriptor.idx./account.displayName co '${searchQuery.value.replace(/'/g, "\\'")}'`
    : '';
  const selectedApplicationQueryFilter = selectedApplications.value.length > 0
    ? `(${selectedApplications.value.map((app) => `application.id eq '${app}'`).join(' or ')})`
    : '';

  const { userId } = useUserStore();
  const userQueryFilter = `glossary.idx./account.accountType eq 'agent' and glossary.idx./account.actors eq 'managed/user/${userId}'`;
  const filters = [searchQueryFilter, selectedApplicationQueryFilter, userQueryFilter].filter(Boolean);
  return filters.length > 0 ? filters.join(' and ') : 'true';
}

/**
 * Search agents
 * @param page number|null The page number to search for, if null current page is used
 */
async function search(page = null) {
  if (page) currentPage.value = page;

  tableLoading.value = true;
  const searchParameters = {
    pageNumber: currentPage.value - 1,
    pageSize: entriesPerPage.value,
    sortKeys: getSortParam(sortBy),
    sortDir: sortDesc.value ? 'desc' : 'asc',
    queryFilter: getQueryFilterForAgents(),
  };

  try {
    const agentResults = await getAccounts(searchParameters);
    const { data } = agentResults;
    const processedData = data?.result.map((item) => {
      const processedItem = {
        ...item,
      };
      const applicationIcon = item?.application?.icon || getApplicationLogo(item.application);
      if (applicationIcon) processedItem.application.icon = applicationIcon;
      processedItem.displayName = processedItem?.descriptor?.idx?.['/account']?.displayName || blankValueIndicator;
      processedItem.type = capitalize(agentConstants.ACCOUNT_TYPES.MACHINE);
      return processedItem;
    });
    totalPagedResults.value = data.totalCount;
    agents.value = processedData;
  } catch (error) {
    showErrorMessage(error, error?.response?.data?.message || i18n.global.t('governance.agents.failedToLoad'));
    totalPagedResults.value = 0;
    agents.value = [];
  } finally {
    tableLoading.value = false;
  }
}

/**
 * Handles sort changes
 * @param ctx object The sorting context from the table
 */
function sortingChanged(ctx) {
  sortBy.value = ctx.sortBy;
  sortDesc.value = ctx.sortDesc;
  currentPage.value = 1;
  search();
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
    },
  });
}

/**
 * Clear search query and reset pagination
 */
function clear() {
  searchQuery.value = '';
  currentPage.value = 1;
  search();
}

/**
 * Handle page size changes
 * @param pageSize number The number of entries per page
 */
function pageSizeChange(pageSize) {
  entriesPerPage.value = pageSize;
  search();
}

onMounted(async () => {
  await loadAppTemplates();
  search();
});

</script>
<style lang="scss" scoped>
  .app-toolbar {
    .fr-search-input-holder {
      width: 30%;
    }
  }

:deep(.agent-tabs) {
  li {
    a {
      &.active {
        .badge {
          background-color: $blue;
          color: white;
        }
      }
    }
  }
}
</style>

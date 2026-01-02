<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrHeader
        :title="i18n.global.t('common.accounts')"
        :subtitle="i18n.global.t('governance.accounts.subtitle')" />
      <div>
        <div class="my-5">
          <BCard
            no-body
            class="card-tabs-vertical">
            <BTabs
              ref="accountTabs"
              v-if="selectedTab !== null"
              v-model="selectedTab"
              @activate-tab="tabActivated"
              nav-wrapper-class="d-none d-md-block account-tabs"
              content-class="overflow-hidden position-inherit"
              pills
              vertical>
              <BTab
                v-for="(tab, index) in tabItems"
                class="nav-item"
                :key="`${tab.resourceName}_${index}`"
                :title="tab.displayName">
                <template #title>
                  <div class="d-flex justify-content-between">
                    <span class="text-truncate mr-2">
                      {{ tab.displayName }}
                    </span>
                    <span class="badge badge-light badge-pill align-self-center">
                      {{ i18n.global.n(counts[tab.key] || 0) }}
                    </span>
                  </div>
                </template>
                <template v-if="selectedTab === index">
                  <BCardHeader class="p-0">
                    <BButtonToolbar
                      class="btn-toolbar d-flex flex-row justify-content-between p-3 border-bottom-0 app-toolbar">
                      <div class="w-50">
                        <FrApplicationSearch
                          @search:applications="searchApplications"
                          @update:applications="updateApplications"
                          :applications="selectedApplications"
                          :application-search-results="applicationSearchResults" />
                      </div>
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
                    v-else-if="accounts.length"
                    class="mb-0"
                    v-resizable-table="{ persistKey: 'accounts' }"
                    responsive
                    hover
                    tbody-tr-class="cursor-pointer"
                    :fields="fields"
                    :items="accounts"
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
                    <template #cell(user)="{ item }">
                      <div>
                        <BMedia
                          v-if="item.user"
                          class="align-items-center"
                          no-body>
                          <BImg
                            class="mr-3 rounded-circle size-28"
                            :alt="item.user.fullName"
                            :src="item.user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                          <BMediaBody class="owner-name text-truncate">
                            <div class="mb-0 h5">
                              {{ item.user.fullName }}
                            </div>
                            <div class="text-secondary m-0">
                              {{ item.user.userName }}
                            </div>
                          </BMediaBody>
                        </BMedia>
                        <div v-else>
                          {{ blankValueIndicator }}
                        </div>
                      </div>
                    </template>
                    <template #cell(type)="{ item }">
                      <BBadge
                        class="w-100px"
                        :variant="getAccountTypeVariant(item.type)">
                        {{ item.type }}
                      </BBadge>
                    </template>
                    <template #cell(accountSubType)="{ item }">
                      <div
                        class="w-100px d-flex">
                        <FrIcon
                          :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-3 color-dark${getIcon(item, 'iconColor')} bg-light${getIcon(item, 'iconColor')} mt-n25`"
                          :name="getIcon(item, 'icon')" />
                        {{ getAccountSubType(item) }}
                      </div>
                    </template>
                    <template #cell(actions)="{ item }">
                      <FrActionsCell
                        :divider="false"
                        :delete-option="false"
                        :edit-option="false">
                        <template #custom-bottom-actions>
                          <BDropdownItem @click="navigateToEdit(item.id)">
                            <template>
                              <FrIcon
                                icon-class="mr-2"
                                name="list_alt">
                                {{ i18n.global.t('common.viewDetails') }}
                              </FrIcon>
                            </template>
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
                    @input="search($event)"
                    @on-page-size-change="pageSizeChange" />
                </template>
              </BTab>
            </BTabs>
          </BCard>
        </div>
      </div>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BBadge,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BContainer,
  BImg,
  BMedia,
  BMediaBody,
  BTab,
  BTabs,
  BTable,
} from 'bootstrap-vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { capitalize, find } from 'lodash';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrApplicationSearch from '@forgerock/platform-shared/src/components/governance/ApplicationSearch/ApplicationSearch';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getAccounts } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import accountConstants from './utils/accountConstants';
import { getAccountTypeVariant, getAccountDisplayName } from './utils/accountUtility';
import i18n from '@/i18n';

const router = useRouter();
const currentPage = ref(1);
const entriesPerPage = ref(10);
const totalPagedResults = ref(0);
const tableLoading = ref(true);
const accounts = ref([]);
const sortBy = ref('displayName');
const sortDesc = ref(false);
const searchQuery = ref('');
const previousQuery = ref('');
const selectedTab = ref(0);
const applicationSearchResults = ref([]);
const selectedApplications = ref([]);
const queryAll = ref(true);
const fields = computed(() => {
  const tableFields = [
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
      key: 'type',
      class: 'w-160px',
      label: i18n.global.t('governance.accounts.type'),
      sortable: false,
    },
    {
      key: 'user',
      class: 'w-240px',
      label: i18n.global.t('governance.accounts.user'),
      sortable: false,
    },
    {
      key: 'accountSubType',
      class: 'w-240px',
      label: i18n.global.t('governance.accounts.accountSubType'),
      sortable: false,
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      class: 'w-5 justify-content-end col-actions',
    },
  ];
  // Don't show type or user for machine tab
  if (selectedTab.value === 3) {
    return tableFields.filter((field) => field.key !== 'type' && field.key !== 'user');
  }
  // Don't show user for uncorrelated tab
  if (selectedTab.value === 2) {
    return tableFields.filter((field) => field.key !== 'user' && field.key !== 'accountSubType');
  }
  if (selectedTab.value === 1 || selectedTab.value === 0) {
    return tableFields.filter((field) => field.key !== 'accountSubType');
  }
  return tableFields;
});
const tabItems = [
  {
    displayName: i18n.global.t('governance.accounts.tabs.all'),
    key: 'all',
    queryFilter: '',
  },
  {
    displayName: i18n.global.t('governance.accounts.tabs.correlated'),
    key: 'correlated',
    queryFilter: 'user.id sw ""',
  },
  {
    displayName: i18n.global.t('governance.accounts.tabs.uncorrelated'),
    key: 'uncorrelated',
    queryFilter: `!(user.id co "") and !(glossary.idx./account.accountType eq "${accountConstants.ACCOUNT_TYPES.MACHINE}")`,
  },
  {
    displayName: i18n.global.t('governance.accounts.tabs.machine'),
    key: 'machine',
    queryFilter: `glossary.idx./account.accountType eq "${accountConstants.ACCOUNT_TYPES.MACHINE}"`,
  },
];
const counts = ref({
  all: 0,
  correlated: 0,
  uncorrelated: 0,
  machine: 0,
});

/**
 * Get sort field to send to query
 * @param sortByVal string The field to sort by
 */
function getSortParam(sortByVal) {
  switch (sortByVal.value) {
    case 'application':
      return 'application.name';
    case 'displayName':
      return 'descriptor.idx./account.displayName';
    case 'user':
      return 'user.userName';
    default:
      return sortBy.value;
  }
}

/**
 * Builds the query filter for accounts based on the current search query, selected applications, and the active tab
 * @param tab integer The tab key index to get the query filter for
 */
function getQueryFilterForAccounts(tab) {
  const searchQueryFilter = searchQuery.value
    ? `user.userName co '${searchQuery.value}' or descriptor.idx./account.displayName co '${searchQuery.value}'`
    : '';
  const selectedApplicationQueryFilter = selectedApplications.value.length > 0
    ? `(${selectedApplications.value.map((app) => `application.id eq '${app}'`).join(' or ')})`
    : '';

  const tabQueryFilter = tabItems[tab]?.queryFilter || '';

  const filters = [searchQueryFilter, selectedApplicationQueryFilter, tabQueryFilter].filter(Boolean);
  return filters.length > 0 ? filters.join(' and ') : 'true';
}

/**
 * Sets the total counts on the local property
 * @param results Array The results from the API calls
 */
function setCounts(results) {
  const newCounts = {};
  for (let i = 0; i < tabItems.length; i += 1) {
    const tab = tabItems[i];
    if (queryAll.value || i === selectedTab.value) {
      newCounts[tab.key] = results[i]?.data?.totalCount || 0;
    } else {
      newCounts[tab.key] = counts.value[tab.key] || 0;
    }
  }
  counts.value = newCounts;
}

/**
 * Search accounts
 * @param page number|null The page number to search for, if null current page is used
 */
async function search(page = null) {
  if (page) currentPage.value = page;

  tableLoading.value = true;
  const searchParameters = {
    pagedResultsOffset: (currentPage.value - 1) * entriesPerPage.value,
    pageSize: entriesPerPage.value,
    sortKeys: getSortParam(sortBy),
    sortDir: sortDesc.value ? 'desc' : 'asc',
    queryFilter: getQueryFilterForAccounts(selectedTab.value),
  };

  if (previousQuery.value !== searchQuery.value) {
    // When search term changes, query all tabs to update counts
    queryAll.value = true;
    previousQuery.value = searchQuery.value;
  }

  try {
    const accountPromises = tabItems.map((tab, index) => {
      if (index === selectedTab.value) {
        return getAccounts(searchParameters);
      }
      if (queryAll.value) {
        return getAccounts({
          pageSize: 0,
          queryFilter: getQueryFilterForAccounts(index),
        });
      }
      return null;
    });
    const accountResults = await Promise.all(accountPromises);
    const { data } = accountResults[selectedTab.value];
    const processedData = data?.result.map((item) => {
      const processedItem = {
        ...item,
      };
      const applicationIcon = item?.application?.icon || getApplicationLogo(item.application);
      if (applicationIcon) processedItem.application.icon = applicationIcon;
      if (processedItem.user) {
        const fullName = i18n.global.t('common.userFullName', {
          givenName: processedItem.user.givenName,
          sn: processedItem.user.sn,
        }).trim();
        if (fullName) processedItem.user.fullName = fullName;
      }
      processedItem.displayName = getAccountDisplayName(processedItem);
      processedItem.type = capitalize(processedItem?.glossary?.idx?.['/account']?.accountType || accountConstants.ACCOUNT_TYPES.DEFAULT);
      return processedItem;
    });
    totalPagedResults.value = data.totalCount;
    accounts.value = processedData;
    setCounts(accountResults);
    queryAll.value = false;
  } catch (error) {
    showErrorMessage(error, error?.response?.data?.message || i18n.global.t('governance.accounts.failedToLoad'));
    totalPagedResults.value = 0;
    accounts.value = [];
    queryAll.value = true;
  } finally {
    tableLoading.value = false;
  }
}

/**
 * Handles sort changes
 * @param ctx object The sorting context from the table
 */
function sortingChanged(ctx) {
  const sortableFields = fields.value.filter((field) => field.sortable).map((field) => field.key);
  if (sortableFields.indexOf(ctx.sortBy) === -1) {
    // Ignore sort changes on non-sortable fields causing search issues
    return;
  }
  sortBy.value = ctx.sortBy;
  sortDesc.value = ctx.sortDesc;
  currentPage.value = 1;
  search();
}

/**
 * Navigate to the given account by id
 * @param accountId string The account ID to navigate to
 */
function navigateToEdit(accountId) {
  router.push({
    name: 'AccountsDetails',
    params: {
      accountId,
      tab: 'details',
    },
  });
}

/**
 * Navigate to the given account by id
 * @param item Account Object
 */
function getAccountSubType(item) {
  if (!item.glossary.idx['/account'].accountSubtype) {
    return blankValueIndicator;
  }
  return find(accountConstants.ACCOUNT_SUBTYPES, { value: item.glossary.idx['/account'].accountSubtype })?.text;
}

/**
 * Handle getting icon
 * @param item Account object
 * @param type Type of icon data being retrieved
 */
function getIcon(item, type) {
  if (type === 'iconColor') return find(accountConstants.ACCOUNT_SUBTYPES, { value: item.glossary.idx['/account'].accountSubtype })?.iconColor;
  return find(accountConstants.ACCOUNT_SUBTYPES, { value: item.glossary.idx['/account'].accountSubtype })?.icon;
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

function tabActivated(newTab) {
  if (newTab !== selectedTab.value) {
    selectedTab.value = newTab;
    search(1);
  }
}

/**
 * Search the IGA commons for applications for the entitlement application filter field
 * @param {String} queryString query string to search applications
 */
async function updateApplications(applications) {
  try {
    selectedApplications.value = applications;
    queryAll.value = true;
    search(1);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accounts.errors.errorSearchingAccounts'));
  }
}

/**
 * Search the IGA commons for applications for the entitlement application filter field
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

:deep(.account-tabs) {
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

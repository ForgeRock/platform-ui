<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrHeader
        :title="$t('governance.administer.agents.title')"
        :subtitle="$t('governance.administer.agents.subtitle')" />
      <div>
        <div class="my-5">
          <BRow class="mb-4">
            <BCol lg="6">
              <BCard>
                <div class="d-flex flex-column justify-content-center ml-2">
                  <div class="d-flex flex-row align-items-center">
                    <FrIcon
                      icon-class="size-28 d-flex align-items-center justify-content-center mr-1 color-darkgreen mt-n25"
                      name="travel_explore" />
                    <small class="font-weight-bold mb-0">
                      {{ $t('governance.agents.recentlyDiscovered') }}
                    </small>
                  </div>
                  <div class="d-flex align-items-end">
                    <p class="font-weight-bold mb-0 chart-text-large ml-1">
                      {{ $t('governance.agents.agentsCount', { count: counts.recentlyDiscovered }) }}
                    </p>
                    <small
                      v-if="recentlyDiscoveredIncrease !== 0"
                      class="d-flex align-items-end mr-2 align-self-center pb-1">
                      <FrIcon
                        icon-class="ml-1 mt-2 color-green"
                        name="arrow_drop_up" />
                      {{ $t('governance.agents.percentChange', { percent: Math.abs(recentlyDiscoveredIncrease) }) }}
                    </small>
                  </div>
                  <small class="text-muted ml-1">
                    {{ $t('governance.agents.recentlyDiscoveredText') }}
                  </small>
                </div>
              </BCard>
            </BCol>
            <BCol lg="6">
              <BCard>
                <div class="d-flex flex-row">
                  <FrCircleProgressBar
                    id="unreviewed-chart"
                    :progress="unreviewedPercentage"
                    :thickness="7"
                    :empty-thickness="7"
                    empty-color="#e7ebf0"
                    color="#ffb946"
                    :size="72">
                    <template #count="{}">
                      <small class="font-weight-bold mb-0">
                        {{ unreviewedPercentage }}%
                      </small>
                    </template>
                  </FrCircleProgressBar>
                  <div class="d-flex flex-column justify-content-center ml-3">
                    <div class="d-flex flex-row align-items-center">
                      <FrIcon
                        icon-class="size-28 d-flex align-items-center justify-content-center mr-1 color-darkyellow mt-n25"
                        name="history" />
                      <small class="font-weight-bold mb-0">
                        {{ $t('governance.agents.reviewPending') }}
                      </small>
                    </div>
                    <p class="text-muted ml-1 font-weight-bold mb-0 chart-text-large">
                      {{ $t('governance.agents.agentsCount', { count: counts.unreviewed }) }}
                    </p>
                    <small class="text-muted ml-1">
                      {{ $t('governance.agents.unreviewedAgentsText') }}
                    </small>
                  </div>
                </div>
              </BCard>
            </BCol>
          </BRow>
          <BRow class="mb-4">
            <BCol lg="6">
              <BCard>
                <div class="d-flex flex-row">
                  <FrCircleProgressBar
                    id="no-custodians-chart"
                    :progress="noCustodiansPercentage"
                    :thickness="7"
                    :empty-thickness="7"
                    empty-color="#e7ebf0"
                    color="#da3a2b"
                    :size="72">
                    <template #count="{}">
                      <small class="font-weight-bold mb-0">
                        {{ noCustodiansPercentage }}%
                      </small>
                    </template>
                  </FrCircleProgressBar>
                  <div class="d-flex flex-column justify-content-center ml-3">
                    <div class="d-flex flex-row align-items-center">
                      <FrIcon
                        icon-class="size-28 d-flex align-items-center justify-content-center mr-1 color-darkred mt-n25"
                        name="warning" />
                      <small class="font-weight-bold mb-0">
                        {{ $t('governance.agents.actionRequired') }}
                      </small>
                    </div>
                    <p class="text-muted ml-1 font-weight-bold mb-0 chart-text-large">
                      {{ $t('governance.agents.agentsCount', { count: counts.noCustodians }) }}
                    </p>
                    <small class="text-muted ml-1">
                      {{ $t('governance.agents.withoutCustodians') }}
                    </small>
                  </div>
                </div>
              </BCard>
            </BCol>
            <BCol lg="6">
              <BCard>
                <div class="d-flex flex-column justify-content-center ml-2">
                  <div class="d-flex flex-row align-items-center">
                    <FrIcon
                      :icon-class="`size-28 d-flex align-items-center justify-content-center mr-1 color-blue mt-n25`"
                      name="how_to_reg" />
                    <small class="font-weight-bold mb-0">
                      {{ $t('governance.agents.provisioned') }}
                    </small>
                  </div>
                  <p class="text-muted ml-1 font-weight-bold mb-0 chart-text-large">
                    {{ $t('governance.agents.accountsCount', { count: provisionedCount }) }}
                  </p>
                  <small class="text-muted ml-1">
                    {{ $t('governance.agents.provisionedAgentsText') }}
                  </small>
                </div>
              </BCard>
            </BCol>
          </BRow>
          <BCard
            no-body
            class="card-tabs-vertical">
            <BTabs
              v-if="selectedTab !== null"
              v-model="selectedTab"
              nav-wrapper-class="d-none d-md-block agent-tabs"
              content-class="overflow-hidden position-inherit"
              pills
              vertical
              @activate-tab="tabActivated">
              <BTab
                v-for="(tab, index) in tabItems"
                :key="tab.key"
                class="nav-item"
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
                    <BButtonToolbar class="btn-toolbar d-flex flex-row justify-content-between p-3 border-bottom-0 app-toolbar">
                      <div class="d-flex align-items-center w-50">
                        <BButton
                          v-if="allowCreate && governanceDevEnabled"
                          class="mr-3 flex-shrink-0"
                          variant="primary"
                          @click="showAddAgentModal">
                          <FrIcon
                            icon-class="mr-2"
                            name="add">
                            {{ $t('governance.administer.agents.newAgent') }}
                          </FrIcon>
                        </BButton>
                        <FrApplicationSearch
                          class="flex-grow-1 min-w-0"
                          :applications="selectedApplications"
                          :application-search-results="applicationSearchResults"
                          @search:applications="searchApplications"
                          @update:applications="updateApplications" />
                      </div>
                      <FrSearchInput
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
                    v-resizable-table="{ persistKey: 'lcm-agents' }"
                    responsive
                    hover
                    tbody-tr-class="cursor-pointer"
                    :fields="fields"
                    :items="agents"
                    no-local-sorting
                    no-sort-reset
                    :sort-desc="sortDesc"
                    :sort-by="sortBy"
                    @row-clicked="navigateToAgentDetails($event)"
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
                    <template #cell(actions)="{ item }">
                      <FrActionsCell
                        :divider="false"
                        :edit-option="false"
                        :delete-option="allowDelete && governanceDevEnabled"
                        @delete-clicked="showDeleteAgentModal(item)">
                        <template #custom-top-actions>
                          <BDropdownItem @click="navigateToAgentDetails(item)">
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
                    :page-sizes="[10, 20, 30]"
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
    <FrAddAgentModal @agent-created="search(1)" />
    <FrDeleteAgentModal
      :agent-id="deleteAgentId"
      @agent-deleted="search(1)" />
  </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { capitalize } from 'lodash';
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BCol,
  BContainer,
  BDropdownItem,
  BMedia,
  BMediaBody,
  BRow,
  BTab,
  BTabs,
  BTable,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrApplicationSearch from '@forgerock/platform-shared/src/components/governance/ApplicationSearch/ApplicationSearch';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getAgents } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { getPrivileges } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import agentConstants from '@forgerock/platform-shared/src/views/Governance/Agents/utils/agentConstants';
import { getAgentDisplayName, getAgentTemplateLabel } from '@forgerock/platform-shared/src/views/Governance/Agents/utils/agentUtility';
import { resolveAgentIcon, useAgentConfig } from '@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAddAgentModal from './Add/AddAgentModal';
import FrDeleteAgentModal from './Delete/DeleteAgentModal';
import i18n from '@/i18n';

const router = useRouter();
const { bvModal } = useBvModal();
const { userId } = useUserStore();
const { agentTemplateIcons, agentTemplateSources, loadConfig } = useAgentConfig();
const store = useStore();
// Agent create/delete are dev-only until the LCM write flows ship in a full release
const governanceDevEnabled = computed(() => (store?.state?.SharedStore?.governanceDevEnabled ?? false));

const agents = ref([]);
const allowCreate = ref(false);
const allowDelete = ref(false);
const chartTotalAll = ref(0);
const chartTotalsSet = ref(false);
const currentPage = ref(1);
const deleteAgentId = ref('');
const entriesPerPage = ref(10);
const previousQuery = ref('');
const provisionedCount = ref(0);
const queryAll = ref(true);
let latestSearchId = 0;
const searchQuery = ref('');
const selectedApplications = ref([]);
const applicationSearchResults = ref([]);
const selectedTab = ref(null);
const sortBy = ref('displayName');
const sortDesc = ref(false);
const tableLoading = ref(true);
const totalPagedResults = ref(0);

const tabItems = ref([]);
const counts = ref({
  all: 0,
  custom: 0,
  noCustodians: 0,
  recentlyDiscovered: 0,
  unreviewed: 0,
});

const fields = computed(() => [
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
]);

const noCustodiansPercentage = computed(() => {
  if (chartTotalAll.value === 0) return 0;
  const pct = Math.round((counts.value.noCustodians / chartTotalAll.value) * 100);
  return Number.isNaN(pct) ? 0 : pct;
});
const unreviewedPercentage = computed(() => {
  if (chartTotalAll.value === 0) return 0;
  const pct = Math.round((counts.value.unreviewed / chartTotalAll.value) * 100);
  return Number.isNaN(pct) ? 0 : pct;
});
const recentlyDiscoveredIncrease = computed(() => {
  const previous = chartTotalAll.value - counts.value.recentlyDiscovered;
  if (previous <= 0) return 0;
  const pct = Math.round((counts.value.recentlyDiscovered / previous) * 100);
  return Number.isNaN(pct) ? 0 : pct;
});

/**
 * Builds the queryFilter for a single named-template tab. Agents are matched either by
 * their application's templateName, or by application.aiAgentSource — since discovered
 * agents may not carry the template's own templateName. Without a configured discovery
 * source the template id itself is the aiAgentSource value (same as the admin Agents list).
 */
function buildTemplateQueryFilter(template, templateSources) {
  const templateNameFilter = `application.templateName sw "${template}"`;
  const sourceName = templateSources[template] || template;
  return `(${templateNameFilter} or application.aiAgentSource eq "${sourceName}")`;
}

function buildTabItems(templates, templateSources = {}, templateDisplayNames = {}) {
  return [
    { displayName: i18n.global.t('governance.agents.tabs.all'), key: 'all', queryFilter: '' },
    ...templates.map((template) => ({
      displayName: getAgentTemplateLabel({ id: template, displayName: templateDisplayNames[template] }),
      key: template,
      queryFilter: buildTemplateQueryFilter(template, templateSources),
    })),
    {
      displayName: i18n.global.t('governance.agents.tabs.custom'),
      key: 'custom',
      queryFilter: templates.length
        ? `!(${templates.map((t) => buildTemplateQueryFilter(t, templateSources)).join(' or ')})`
        : '',
    },
  ];
}

function buildCounts(templates) {
  return {
    all: 0,
    custom: 0,
    noCustodians: 0,
    recentlyDiscovered: 0,
    unreviewed: 0,
    ...templates.reduce((acc, t) => { acc[t] = 0; return acc; }, {}),
  };
}

function getSortParam(sortByVal) {
  switch (sortByVal.value) {
    case 'application': return 'application.name';
    case 'displayName': return 'descriptor.idx./account.displayName';
    default: return sortBy.value;
  }
}

function getQueryFilterForAgents(tab, additionalFilters = []) {
  const searchFilter = searchQuery.value
    ? `(user.userName co '${searchQuery.value}' or descriptor.idx./account.displayName co '${searchQuery.value}')`
    : '';
  const appFilter = selectedApplications.value.length > 0
    ? `(${selectedApplications.value.map((app) => `application.id eq '${app}'`).join(' or ')})`
    : '';
  const tabFilter = tabItems.value[tab]?.queryFilter || '';
  const filters = [searchFilter, appFilter, tabFilter, ...additionalFilters].filter(Boolean);
  return filters.length > 0 ? filters.join(' and ') : 'true';
}

function setCounts(results) {
  const newCounts = {};
  for (let i = 0; i < tabItems.value.length; i += 1) {
    const tab = tabItems.value[i];
    newCounts[tab.key] = (queryAll.value || i === selectedTab.value)
      ? (results[i]?.data?.totalCount || 0)
      : (counts.value[tab.key] || 0);
  }
  if (!chartTotalsSet.value) {
    chartTotalAll.value = newCounts.all || 0;
    newCounts.recentlyDiscovered = results[results.length - 3]?.data?.totalCount || 0;
    newCounts.noCustodians = results[results.length - 2]?.data?.totalCount || 0;
    newCounts.unreviewed = results[results.length - 1]?.data?.totalCount || 0;
    chartTotalsSet.value = true;
  } else {
    newCounts.recentlyDiscovered = counts.value.recentlyDiscovered;
    newCounts.noCustodians = counts.value.noCustodians;
    newCounts.unreviewed = counts.value.unreviewed;
  }
  counts.value = newCounts;
}

async function search(page = null) {
  if (page) currentPage.value = page;
  // Monotonic id: a slower earlier search (e.g. after rapid tab switches) must
  // not overwrite the state a newer search already wrote
  latestSearchId += 1;
  const requestId = latestSearchId;
  tableLoading.value = true;

  if (previousQuery.value !== searchQuery.value) {
    queryAll.value = true;
    previousQuery.value = searchQuery.value;
  }

  const searchParameters = {
    pagedResultsOffset: (currentPage.value - 1) * entriesPerPage.value,
    pageSize: entriesPerPage.value,
    sortKeys: getSortParam(sortBy),
    sortDir: sortDesc.value ? 'desc' : 'asc',
    queryFilter: getQueryFilterForAgents(selectedTab.value),
  };

  try {
    const agentPromises = tabItems.value.map((tab, index) => {
      if (index === selectedTab.value) return getAgents(searchParameters);
      if (queryAll.value) return getAgents({ pageSize: 0, queryFilter: getQueryFilterForAgents(index) });
      return null;
    });
    if (!chartTotalsSet.value) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      agentPromises.push(getAgents({ pageSize: 0, queryFilter: getQueryFilterForAgents(selectedTab.value, [`metadata.createdDate gt '${thirtyDaysAgo}'`]) }));
      agentPromises.push(getAgents({ pageSize: 0, queryFilter: getQueryFilterForAgents(selectedTab.value, ["!(glossary.idx./account.actors co '')"]) }));
      agentPromises.push(getAgents({ pageSize: 0, queryFilter: getQueryFilterForAgents(selectedTab.value, ["!(item.decision.certification.status eq 'signed-off')"]) }));
    }
    const agentResults = await Promise.all(agentPromises);
    if (requestId !== latestSearchId) return;
    const { data } = agentResults[selectedTab.value];
    agents.value = (data?.result || []).map((item) => {
      const processedItem = { ...item };
      const applicationIcon = resolveAgentIcon(
        item?.application,
        agentTemplateIcons.value,
        agentTemplateSources.value,
      ) || getApplicationLogo(item.application);
      if (applicationIcon && processedItem.application) processedItem.application.icon = applicationIcon;
      processedItem.displayName = getAgentDisplayName(processedItem);
      processedItem.description = item.account?.description || blankValueIndicator;
      processedItem.type = capitalize(processedItem?.glossary?.idx?.['/account']?.accountType || agentConstants.ACCOUNT_TYPES.DEFAULT);
      return processedItem;
    });
    totalPagedResults.value = data.totalCount;
    setCounts(agentResults);
    queryAll.value = false;
  } catch (error) {
    if (requestId !== latestSearchId) return;
    showErrorMessage(error, error?.response?.data?.message || i18n.global.t('governance.agents.failedToLoad'));
    agents.value = [];
    totalPagedResults.value = 0;
    queryAll.value = true;
  } finally {
    if (requestId === latestSearchId) tableLoading.value = false;
  }
}

function sortingChanged(ctx) {
  const sortable = fields.value.filter((f) => f.sortable).map((f) => f.key);
  if (!sortable.includes(ctx.sortBy)) return;
  sortBy.value = ctx.sortBy;
  sortDesc.value = ctx.sortDesc;
  currentPage.value = 1;
  search();
}

function tabActivated(newTab) {
  if (newTab !== selectedTab.value) {
    selectedTab.value = newTab;
    search(1);
  }
}

function clear() {
  searchQuery.value = '';
  currentPage.value = 1;
  search();
}

function pageSizeChange(pageSize) {
  entriesPerPage.value = pageSize;
  search();
}

function navigateToAgentDetails(agent) {
  router.push({ name: 'AdministerAgentDetails', params: { agentId: agent.id, tab: 'details' } });
}

function showAddAgentModal() {
  bvModal.value.show('add-agent-modal');
}

function showDeleteAgentModal(agent) {
  deleteAgentId.value = agent.id;
  bvModal.value.show('delete-agent-modal');
}

async function searchApplications(queryString) {
  try {
    const { data } = await getResource('application', { queryString, authoritative: false });
    applicationSearchResults.value = data?.result || [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorSearchingApplications'));
  }
}

async function updateApplications(applications) {
  selectedApplications.value = applications;
  queryAll.value = true;
  search(1);
}

async function loadPrivileges() {
  try {
    const { data } = await getPrivileges(userId);
    if (data.permissions.includes('createAgent')) allowCreate.value = true;
    if (data.permissions.includes('deleteAgent')) allowDelete.value = true;
  } catch {
    // permissions stay false — table still usable read-only
  }
}

onMounted(async () => {
  const [config] = await Promise.all([loadConfig(), loadAppTemplates()]);
  tabItems.value = buildTabItems(config.agentTemplates, config.agentTemplateSources, config.agentTemplateDisplayNames);
  counts.value = buildCounts(config.agentTemplates);
  selectedTab.value = 0;
  loadPrivileges();
  search();
});
</script>

<style lang="scss" scoped>
.app-toolbar {
  .fr-search-input-holder {
    width: 30%;
  }
}

.chart-text-large {
  font-size: 1.275rem;
}

:deep(.agent-tabs) {
  .nav-link {
    color: $gray-700 !important;

    &.active {
      color: $gray-800 !important;

      .badge {
        background-color: $blue !important;
        color: white !important;
      }
    }
  }
}
</style>

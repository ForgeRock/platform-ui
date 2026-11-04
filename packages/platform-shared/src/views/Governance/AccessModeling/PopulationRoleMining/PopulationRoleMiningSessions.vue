<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <FrHeader
          :title="$t('governance.accessModeling.populationRoleMining.title')"
          :subtitle="$t('governance.accessModeling.populationRoleMining.subtitle')" />
        <div class="d-flex">
          <BButton
            variant="outline-primary"
            class="mr-3"
            data-testid="refresh-sessions-button"
            @click="loadSessions">
            <FrIcon
              icon-class="mr-2"
              name="refresh">
              {{ $t('common.refresh') }}
            </FrIcon>
          </BButton>
          <BButton
            variant="primary"
            :disabled="atSessionLimit"
            data-testid="new-population-role-mining-session-button"
            @click="goToNewSession">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('governance.accessModeling.populationRoleMining.newDiscoverySession') }}
            </FrIcon>
          </BButton>
        </div>
      </div>
      <div
        v-if="atSessionLimit"
        class="text-muted mb-4">
        <small>{{ $t('governance.accessModeling.populationRoleMining.sessionLimitReached') }}</small>
        <br>
        <small>{{ $t('governance.accessModeling.populationRoleMining.sessionLimitPageOnly') }}</small>
      </div>
      <BRow class="mb-4">
        <BCol
          v-for="statCard in summaryStatCards"
          :key="statCard.key"
          md="4">
          <BCard class="summary-stat-card">
            <small class="text-muted">{{ statCard.label }}</small>
            <h2 class="h1 mt-2 mb-1">
              {{ statCard.value }}
            </h2>
            <small class="text-muted">{{ statCard.subtitle }}</small>
          </BCard>
        </BCol>
      </BRow>
      <BTabs
        v-model="activeTab"
        nav-class="fr-tabs"
        @activate-tab="handleTabChange">
        <BTab :title="$t('governance.accessModeling.populationRoleMining.tabs.sessions')" />
        <BTab :title="$t('governance.accessModeling.populationRoleMining.tabs.popBasedRoles')" />
      </BTabs>
      <template v-if="activeTab === 0">
        <FrSpinner
          v-if="isLoading"
          class="py-5" />
        <FrNoData
          v-else-if="!sessions.length"
          icon="groups"
          :subtitle="$t('governance.accessModeling.populationRoleMining.table.noResults')" />
        <BCard
          v-else
          no-body>
          <BTable
            class="mb-0"
            responsive
            :fields="sessionTableFields"
            :items="sessions"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            no-local-sorting
            :tbody-tr-class="rowClass"
            @row-clicked="handleRowClicked"
            @sort-changed="handleSortChanged">
            <template #cell(createdAt)="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template #cell(status)="{ item }">
              <BBadge
                class="text-capitalize pl-2 pr-2 font-weight-normal"
                :variant="statusVariants[item.status] || 'light'">
                {{ $t(`governance.accessModeling.populationRoleMining.status.${item.status}`) }}
              </BBadge>
            </template>
            <template #cell(sessionOwnerUserName)="{ item }">
              <span class="text-truncate">{{ item.sessionOwnerUserName || item.ownerId || blankValueIndicator }}</span>
            </template>
            <template #cell(identities)="{ item }">
              {{ item.populationSize ?? 0 }}
            </template>
            <template #cell(roles)="{ item }">
              {{ totalRoleCount(item) }}
            </template>
            <template #cell(actions)="{ item }">
              <FrActionsCell
                :item="item"
                :edit-option="false"
                :delete-option="false"
                :divider="false"
                :test-id="item.id">
                <template #custom-top-actions>
                  <BDropdownItem
                    :disabled="!isComplete(item)"
                    :data-testid="`view-results-${item.id}`"
                    @click="viewResults(item)">
                    <FrIcon
                      icon-class="mr-2"
                      name="visibility">
                      {{ $t('governance.accessModeling.populationRoleMining.sessionCard.viewResults') }}
                    </FrIcon>
                  </BDropdownItem>
                  <BDropdownItem
                    :data-testid="`duplicate-session-${item.id}`"
                    @click="duplicateSession(item)">
                    <FrIcon
                      icon-class="mr-2"
                      name="control_point_duplicate">
                      {{ $t('common.duplicate') }}
                    </FrIcon>
                  </BDropdownItem>
                </template>
                <template #custom-bottom-actions>
                  <BDropdownItem
                    v-if="canDeleteSession(item)"
                    :disabled="!isOwnSession(item) || isDeleting"
                    :data-testid="`delete-session-${item.id}`"
                    @click="handleDelete(item)">
                    <FrIcon
                      icon-class="mr-2"
                      name="delete">
                      {{ $t('governance.accessModeling.populationRoleMining.sessionCard.deleteSession') }}
                    </FrIcon>
                  </BDropdownItem>
                </template>
              </FrActionsCell>
            </template>
          </BTable>
          <FrPagination
            v-if="totalHits"
            class="p-3"
            :value="currentPage"
            :per-page="pageSize"
            :total-rows="totalHits"
            @input="handlePageChange"
            @on-page-size-change="handlePageSizeChange" />
        </BCard>
      </template>
      <FrAccessModelingTable
        v-else
        :roles="popBasedRoles"
        :title="$t('governance.accessModeling.populationRoleMining.tabs.popBasedRoles')"
        :is-loading="isRolesLoading"
        :total-rows="rolesTotalHits"
        :num-filters="roleNumFilters"
        @load-roles="searchRoles"
        @navigate-to-details="navigateToRoleDetails" />

      <FrDeleteModal
        :id="deleteModalId"
        :testid="`population-role-mining-session-${sessionToDelete?.id}`"
        :is-deleting="isDeleting"
        :translated-item-type="$t('governance.accessModeling.populationRoleMining.sessionLabel')"
        @delete-item="deleteSession()" />
    </div>
  </BContainer>
</template>

<script setup>
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BContainer,
  BDropdownItem,
  BRow,
  BTab,
  BTable,
  BTabs,
} from 'bootstrap-vue';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import FrAccessModelingTable from '@forgerock/platform-shared/src/components/governance/AccessModeling/AccessModelingTable';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  deleteRoleMiningSession,
  getRoleMiningSession,
  getRoleMiningSessionList,
} from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import { getRoleList } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

/**
 * Landing page for population-based role mining: shows aggregate session metrics and a table
 * of recent sessions (username, status, the four session stats, and View Results / Duplicate /
 * Delete actions — delete is dev-flag gated), and links to starting a new one. Up to 5
 * sessions may run concurrently cluster-wide.
 * @component PopulationRoleMiningSessions
 */

// Max concurrent sessions allowed cluster-wide, per the population-based role mining API (IGA-3955).
const MAX_CONCURRENT_SESSIONS = 5;

const store = useStore();
const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();
const { bvModal } = useBvModal();
const userStore = useUserStore();

// Delete ships behind the governance dev flag until the backend endpoint is finalized (IGA-5072)
const sessionDeleteEnabled = computed(() => !!store.state.SharedStore.governanceDevEnabled);

const sessions = ref([]);
const isLoading = ref(false);
const totalHits = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
// Server-side sort state - the Date column sorts against the backend, not locally
const sortBy = ref('createdAt');
const sortDesc = ref(true);
const isDeleting = ref(false);
const isDuplicating = ref(false);
const sessionToDelete = ref(null);

// Pop Based Roles tab: lists mining candidates (roles carrying a sessionId) with the shared
// access-modeling table. 0 = Sessions tab, 1 = Pop Based Roles tab.
const activeTab = ref(0);
const popBasedRoles = ref([]);
const isRolesLoading = ref(false);
const rolesTotalHits = ref(0);
const roleNumFilters = ref(0);
const roleEntriesPerPage = ref(10);

const deleteModalId = 'modal-delete-population-role-mining-session';

const statusVariants = {
  initializing: 'light',
  pending: 'light',
  running: 'warning',
  complete: 'success',
  failed: 'danger',
};

/**
 * Only completed sessions have results to open — pending/initializing/running/failed
 * rows are neither clickable nor actionable (mirrors ImportHistory's row gating).
 * @param {Object} session the row's session
 * @returns {Boolean} true when the session's results can be viewed
 */
function isComplete(session) {
  return session?.status === 'complete';
}

/**
 * Whether the delete action renders for a session row. Dev-flag gated, and the divider
 * only makes sense when there is something below it.
 * @param {Object} session the row's session
 * @returns {Boolean} true when the row shows a delete action
 */
function canDeleteSession(session) {
  return sessionDeleteEnabled.value && !!session;
}

/**
 * Users may only delete sessions they own (the backend enforces this too). The owner
 * arrives as sessionOwner or ownerId (full managed/user path or bare id) depending on
 * the endpoint, so normalise to the bare id before comparing.
 * @param {Object} session the row's session
 * @returns {Boolean} true when the current user owns the session
 */
function isOwnSession(session) {
  const owner = session?.sessionOwner ?? session?.ownerId;
  if (!owner) return false;
  const ownerId = String(owner).split('/').pop();
  return ownerId === String(userStore.userId).split('/').pop();
}

const sessionTableFields = computed(() => [
  {
    key: 'createdAt',
    label: i18n.global.t('common.date'),
    sortable: true,
  },
  { key: 'status', label: i18n.global.t('common.status') },
  { key: 'sessionOwnerUserName', label: i18n.global.t('common.user.userName') },
  { key: 'identities', label: i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.identities') },
  { key: 'roles', label: i18n.global.t('common.roles') },
  { key: 'actions', label: i18n.global.t('common.actions'), class: 'w-120px fr-no-resize' },
]);

const atSessionLimit = computed(() => (
  sessions.value.filter((session) => !isComplete(session) && session.status !== 'failed').length >= MAX_CONCURRENT_SESSIONS
));

const summaryStatCards = computed(() => [
  {
    key: 'sessionsRun',
    label: i18n.global.t('governance.accessModeling.populationRoleMining.statCards.sessionsRun'),
    value: totalHits.value,
    subtitle: i18n.global.t('governance.accessModeling.populationRoleMining.statCards.totalSessions'),
  },
  {
    key: 'candidateRolesFound',
    label: i18n.global.t('governance.accessModeling.populationRoleMining.statCards.candidateRolesFound'),
    value: sessions.value.reduce((total, session) => total + (session.candidateRoleCount || 0), 0),
    subtitle: i18n.global.t('governance.accessModeling.populationRoleMining.statCards.acrossAllSessions'),
  },
  // stat cards other than sessionsRun only cover the loaded page of results - the API has no
  // aggregate endpoint, so counts are computed client-side from the current rows
  {
    key: 'sessionsComplete',
    label: i18n.global.t('governance.accessModeling.populationRoleMining.statCards.sessionsComplete'),
    value: sessions.value.filter((session) => session.status === 'complete').length,
    subtitle: i18n.global.t('governance.accessModeling.populationRoleMining.statCards.readyForReview'),
  },
]);

/**
 * The combined role count for a session (layer 1 birthright + layer 2 candidate)
 * @param {Object} session the row's session
 * @returns {Number} total roles produced by the session
 */
function totalRoleCount(session) {
  return (session.layer1RoleCount ?? 0) + (session.candidateRoleCount ?? 0);
}

/**
 * Format the session's creation date with its time
 * @param {String} createdAt the session's creation timestamp
 * @returns {String} the formatted date, or the blank value indicator when missing
 */
function formatDate(createdAt) {
  if (!createdAt) return blankValueIndicator;
  return dayjs(createdAt).format('MMM D, YYYY h:mm A');
}

/**
 * Load the mining sessions for the current page, sorted by creation date server-side. The
 * date sort needs sortType: 'date' (see AccessModelingTable/Activity), and the minus prefix
 * on sortKeys encodes descending.
 */
async function loadSessions() {
  isLoading.value = true;
  try {
    const { data } = await getRoleMiningSessionList({
      _pageSize: pageSize.value,
      _pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
      _sortKeys: `${sortDesc.value ? '-' : ''}${sortBy.value}`,
      _sortType: 'date',
    });
    sessions.value = data?.result || [];
    totalHits.value = data?.totalHits ?? data?.totalCount ?? sessions.value.length;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedGettingSessions'));
    sessions.value = [];
    totalHits.value = 0;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Navigate to a session's results
 * @param {Object} session the session whose results to open
 */
function viewResults(session) {
  router.push({ name: 'PopulationRoleMiningSessionResults', params: { sessionId: session.id } });
}

/**
 * Search the roles produced by pop-mining sessions. Those roles are the only role documents
 * carrying a sessionId, so the tab clause selects them out of the shared roles index.
 * @param {Object} searchParams paging/sort params emitted by the shared table
 * @param {Object} queryFilter toolbar filters emitted by the shared table
 */
async function searchRoles(searchParams = {}, queryFilter = {}) {
  const pagedResultsOffset = searchParams.pagedResultsOffset || 0;
  if (!isEmpty(searchParams)) {
    roleEntriesPerPage.value = searchParams.pageSize || roleEntriesPerPage.value;
  }
  isRolesLoading.value = true;
  const sortKeys = searchParams.sortKeys || 'name';
  const searchParameters = {
    _pagedResultsOffset: pagedResultsOffset,
    _pageSize: roleEntriesPerPage.value,
    // minus prefix encodes descending, matching the sessions list sort
    _sortKeys: `${searchParams.sortDir === 'desc' ? '-' : ''}${sortKeys}`,
    roleStatus: 'candidate',
    // Only pop-mining stamps sessionId onto role documents — see compose_roles.py /
    // compute_universal.py in the mining pipeline; cluster-mined roles and drafts never
    // carry one, so this clause isolates the Pop Based Roles population.
    _queryFilter: 'sessionId co ""',
  };
  if (sortKeys === 'memberCount' || sortKeys === 'entitlementCount') {
    searchParameters._sortType = 'int';
  }
  if (queryFilter) {
    const query = ['sessionId co ""'];
    const filters = queryFilter;
    if (filters.applicationFilter) {
      query.push(`application.id eq "${filters.applicationFilter}"`);
    }
    if (filters.entitlementFilter) {
      query.push(`entitlements eq "${filters.entitlementFilter}"`);
    }
    if (filters.userFilter) {
      query.push(`addedRoleMembers eq "${filters.userFilter}"`);
    }
    if (filters.minMembersFilter > 0) {
      query.push(`memberCount gte ${filters.minMembersFilter}`);
    }
    if (filters.minEntitlementsFilter > 0) {
      query.push(`entitlementCount gte ${filters.minEntitlementsFilter}`);
    }
    roleNumFilters.value = query.length - 1;
    if (filters.nameFilter) {
      // Don't include nameFilter in the filter count badge
      query.push(`name co "${filters.nameFilter}"`);
    }
    searchParameters._queryFilter = query.join(' and ');
  }
  try {
    const { data } = await getRoleList('role', searchParameters);
    rolesTotalHits.value = data?.totalHits ?? 0;
    popBasedRoles.value = (data?.result ?? []).map((item) => ({
      ...item.role,
      entitlements: item.role.entitlements || [],
      memberCount: item.role.memberCount || 0,
      entitlementCount: item.role.entitlementCount || 0,
      status: item.role.status,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedGettingRoles'));
    rolesTotalHits.value = 0;
    popBasedRoles.value = [];
  } finally {
    isRolesLoading.value = false;
  }
}

/**
 * Open the pop-mining role details page for a role from the Pop Based Roles tab
 * @param {Object} role the clicked role
 */
function navigateToRoleDetails(role) {
  router.push({
    name: 'PopulationRoleMiningRoleDetails',
    params: {
      sessionId: role.sessionId,
      roleId: role.id,
    },
  });
}

/**
 * Reload page 1 of the active tab's list when the tab changes. activate-tab fires with a null
 * new index when a tab switch is vetoed, and with the current index on initial render.
 * @param {Number|null} newTabIndex the index of the tab being activated
 */
function handleTabChange(newTabIndex) {
  if (newTabIndex === null || newTabIndex === activeTab.value) return;
  activeTab.value = newTabIndex;
  if (newTabIndex === 1) {
    searchRoles({ pagedResultsOffset: 0, pageSize: roleEntriesPerPage.value });
  }
}

/**
 * Open the new-session page pre-populated with a session's settings and filter. The full
 * session (including its `parameters` map) is fetched fresh and handed to the new-session
 * page via router state — it must not be able to mutate the source session.
 * @param {Object} session the session row to duplicate
 */
async function duplicateSession(session) {
  isDuplicating.value = true;
  try {
    const { data } = await getRoleMiningSession(session.id);
    router.push({
      name: 'PopulationRoleMiningNewSession',
      state: { duplicatedSession: JSON.parse(JSON.stringify(data || {})) },
    });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedGettingSession'));
  } finally {
    isDuplicating.value = false;
  }
}

/**
 * Show the delete confirmation modal for a session
 * @param {Object} session the session to delete
 */
function handleDelete(session) {
  sessionToDelete.value = session;
  bvModal.value.show(deleteModalId);
}

/**
 * Delete the confirmed session, then reload the current page of sessions
 */
async function deleteSession() {
  if (!sessionToDelete.value) return;
  isDeleting.value = true;
  try {
    await deleteRoleMiningSession(sessionToDelete.value.id);
    displayNotification('success', i18n.global.t('governance.accessModeling.populationRoleMining.deleteSuccess', { name: sessionToDelete.value.name || sessionToDelete.value.id }));
    bvModal.value.hide(deleteModalId);
    await loadSessions();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedToDeleteSession'));
  } finally {
    isDeleting.value = false;
  }
}

/**
 * Open a session's results when its row is clicked (same destination as the View Results
 * action; only complete sessions navigate — in-flight and failed rows are inert)
 * @param {Object} session the clicked row's session
 */
function handleRowClicked(session) {
  if (isComplete(session)) {
    viewResults(session);
  }
}

/**
 * Pointer cursor only on clickable (complete) rows, matching the row-click gating
 * @param {Object} item the row's session
 * @returns {String} the row's css class
 */
function rowClass(item) {
  return item && isComplete(item) ? 'cursor-pointer' : '';
}

/**
 * Update the current page and reload the sessions for it
 * @param {Number} page the page to display
 */
function handlePageChange(page) {
  currentPage.value = page;
  loadSessions();
}

/**
 * Re-sort server-side when a sortable column header is clicked, resetting to the first page
 * @param {Object} sort the BTable sort-changed context (sortBy, sortDesc)
 */
function handleSortChanged(sort) {
  sortBy.value = sort.sortBy;
  sortDesc.value = sort.sortDesc;
  currentPage.value = 1;
  loadSessions();
}

/**
 * Change the page size and reload from the first page
 * @param {Number} size the new page size
 */
function handlePageSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1;
  loadSessions();
}

function goToNewSession() {
  router.push({ name: 'PopulationRoleMiningNewSession' });
}

onMounted(() => {
  setBreadcrumb('/access-modeling', i18n.global.t('governance.accessModeling.hub.title'));
  loadSessions();
});
</script>

<style lang="scss" scoped>
.summary-stat-card {
  height: 100%;
}
</style>

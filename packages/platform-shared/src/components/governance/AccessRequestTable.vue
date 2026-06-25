<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-wrap h-100 w-100">
    <FrFilterSidePanel
      v-if="showFilters"
      :id="filterPanelId"
      :title="$t('governance.access.filter.requestFilter')">
      <FrAccessFilter
        :input-fields="accessFilter"
        :input-filter-data="filterData"
      />
    </FrFilterSidePanel>
    <div class="d-flex h-100 table-container fr-table-panel">
      <BCard
        class="h-100 d-flex"
        no-body>
        <div class="d-flex flex-grow-1 table-container">
          <FrAccessRequestList
            :is-loading="isLoading"
            :list-name="title"
            :request-status="status"
            :requests="accessRequests"
            @open-detail="$emit('navigate-to-details', $event)">
            <template #header>
              <BButtonToolbar
                class="px-4 py-3 border-bottom-0 justify-content-end">
                <FrSortDropdown
                  class="px-3"
                  :selected-item="sortField"
                  :hide-labels-on-mobile="true"
                  :sort-by-options="sortByOptions"
                  @sort-field-change="handleSortChange"
                  @sort-direction-change="handleSortDirectionChange" />
                <BButton
                  @click="showFilters = !showFilters"
                  class="toolbar-link-text text-dark"
                  :aria-expanded="showFilters.toString()"
                  :aria-controls="filterPanelId"
                  aria-labelledby="filter-toggle-label"
                  data-testid="filter-toggle"
                  variant="link">
                  <FrIcon
                    icon-class="mr-lg-2"
                    name="filter_list">
                    <span
                      class="d-none d-lg-inline"
                      id="filter-toggle-label">
                      {{ showFilters ? $t('governance.toolbar.hideFilters') : $t('governance.toolbar.showFilters') }}
                    </span>
                  </FrIcon>
                  <BBadge
                    v-if="numFilters > 0"
                    pill
                    class="ml-1"
                    data-testid="filter-badge"
                    variant="primary">
                    {{ numFilters }}
                  </BBadge>
                </BButton>
              </BButtonToolbar>
              <!-- <FrRequestToolbar
                v-model:num-filters="numFilters"
                :sort-by-options="sortByOptions"
                :status-options="statusOptions"
                @filter-change="filterHandler({ filter: $event })"
                @sort-change="filterHandler({ sortKeys: $event })"
                @sort-direction-change="filterHandler({ sortDir: $event })"
                @status-change="filterHandler({ status: $event })" /> -->
            </template>
            <template #no-data>
              <FrNoData
                class="mb-4 border-top"
                icon="person_add"
                :card="false"
                :subtitle="$t('governance.accessRequest.noRequests', { status: getStatusText(statusOptions, status) })" />
            </template>
            <template #actions="{ item }">
              <FrRequestActionsCell
                v-if="status === 'in-progress' || status === 'suspended'"
                class="mr-3"
                :item="item"
                :status="status"
                :type="props.isAdmin ? detailTypes.ADMIN_REQUEST : detailTypes.USER_REQUEST"
                @action="handleAction($event, item)" />
            </template>
          </FrAccessRequestList>
        </div>
        <FrPagination
          v-if="totalRows"
          v-model="currentPage"
          :per-page="pageSize"
          :total-rows="totalRows"
          @input="filterHandler({ currentPage: $event })"
          @on-page-size-change="filterHandler({ pageSize: $event })" />
      </BCard>
    </div>
  </div>
  <FrRequestModal
    :type="modalType"
    :item="modalItem"
    @modal-closed="modalItem = {}"
    @update-list="loadRequests(true)" />
  <FrUpdateResumeDateModal
    v-if="modalItem"
    :loading="isSaving"
    :current-resume-date="resumeDate"
    @update-resume-date="updateResumeDate" />
</template>

<script setup>
import {
  BCard,
  BButton,
  BBadge,
  BButtonToolbar,
  BFormRadioGroup,
} from 'bootstrap-vue';
import {
  computed, getCurrentInstance, nextTick, onMounted, ref, watch,
} from 'vue';
import { debounce, find, startsWith } from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import {
  detailTypes,
  getAccessFilterConfig,
  getInitialRequestFilterData,
  getNumFilters,
  getRequestFilter,
  getStatusText,
  sortByOptions,
  sortKeysMap,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { requestAction, updateRequestResumeDate } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrAccessRequestList from '@forgerock/platform-shared/src/components/governance/AccessRequestList';
import FrRequestActionsCell from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrUpdateResumeDateModal from '@forgerock/platform-shared/src/components/governance/RequestDetails/UpdateResumeDateModal';
import FrAccessFilter from '@forgerock/platform-shared/src/components/governance/AccessFilter/AccessFilter';
import FrFilterSidePanel from '@forgerock/platform-shared/src/components/governance/FilterSidePanel';
import FrSortDropdown from '@forgerock/platform-shared/src/components/governance/SortDropdown';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSelectInput from '@forgerock/platform-shared/src/components/Field/SelectInput';
import FrPriorityFilter from '@forgerock/platform-shared/src/components/governance/PriorityFilter';
import store from '@/store';
import i18n from '@/i18n';

/**
 * Displays the list of Requests and the corresponding filters.
 * @component MyRequest
 */

const props = defineProps({
  accessRequests: {
    type: Array,
    default: () => [],
  },
  totalRows: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  /**
   * sessionStorage key used to persist filter/sort/pagination state across navigation.
   * Omit or pass an empty string to disable persistence entirely.
   */
  storageKey: {
    type: String,
    default: '',
  },
});

// Emits
const emit = defineEmits(['load-requests', 'navigate-to-details']);

// Composables
const { bvModal } = useBvModal();

// Hydrate persisted state from sessionStorage if a storageKey is provided
const storedState = (() => {
  if (!props.storageKey || !store.state.SharedStore.webStorageAvailable) return {};
  try {
    return JSON.parse(sessionStorage.getItem(props.storageKey)) || {};
  } catch (e) {
    return {};
  }
})();

// Data
const currentPage = ref(storedState.currentPage ?? 1);
const filter = ref(storedState.filter ?? {});
const modalItem = ref({});
const modalType = ref(REQUEST_MODAL_TYPES.CANCEL);
const pageSize = ref(storedState.pageSize ?? 10);
const resumeDate = ref(null);
const sortDir = ref(storedState.sortDir ?? 'desc');
const sortField = ref(storedState.sortField ?? 'date');
const sortKeys = ref(storedState.sortKeys ?? 'date');
const status = ref(storedState.status ?? 'in-progress');
const isSaving = ref(false);
const showFilters = ref(false);
const filterPanelId = `access-request-filter-panel-${getCurrentInstance().uid}`;
const statusOptions = ref([
  {
    text: i18n.global.t('governance.status.pending'),
    value: 'in-progress',
  },
  {
    text: i18n.global.t('governance.status.complete'),
    value: 'complete',
  },
  {
    text: i18n.global.t('governance.status.suspend'),
    value: 'suspended',
  },
  {
    text: i18n.global.t('governance.status.canceled'),
    value: 'cancelled',
  },
]);

const componentRefs = new Map([
  ['currentPage', currentPage],
  ['filter', filter],
  ['pageSize', pageSize],
  ['sortDir', sortDir],
  ['sortDir', sortDir],
  ['sortKeys', sortKeys],
  ['status', status],
  ['totalRows', props.totalRows],
]);

const filterData = ref(storedState.filterData ?? getInitialRequestFilterData(statusOptions.value[0].value));
const numFilters = computed(() => getNumFilters(filterData.value));
const accessFilter = ref(getAccessFilterConfig(
  {
    BFormRadioGroup,
    FrPriorityFilter,
    FrSelectInput,
    FrField,
    FrGovResourceSelect,
  },
  {
    statusOptions,
    filterData: filterData.value,
  },
));

/**
 * Get current users access requests based on query params and target filter
 */
async function loadRequests(goToFirstPage) {
  if (goToFirstPage) currentPage.value = 1;
  const payload = getRequestFilter(filter.value, status.value);
  const params = {
    pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    pageSize: pageSize.value,
    sortKeys: sortKeysMap[sortKeys.value],
    sortDir: sortDir.value,
  };
  if (status.value === 'draft') {
    params.sortKeys = 'metadata.modifiedDate';
  } else if (sortKeys.value === 'date') {
    params.sortType = 'date';
  }
  emit('load-requests', params, payload);
}

/**
 * Debounced handler that syncs filterData values into local state and triggers a fresh request load.
 * Resets pagination to the first page on each filter change.
 */
const syncFilterDataAndReload = debounce(() => {
  const {
    status: statusField,
    priorities,
    requestType,
    query,
    requester,
    user,
  } = filterData.value;
  status.value = statusField.value;
  filter.value = {
    priorities: priorities.value,
    requestType: requestType.value !== 'all' ? requestType.value : null,
    query: query.value || null,
    requester: requester.value || null,
    user: user.value || null,
  };
  loadRequests(true);
}, 300);

watch(filterData, syncFilterDataAndReload, { deep: true });

// Persist filter/sort/pagination state to sessionStorage when storageKey is provided
watch(
  [filterData, filter, status, currentPage, pageSize, sortDir, sortField, sortKeys],
  () => {
    if (!props.storageKey || !store.state.SharedStore.webStorageAvailable) return;
    try {
      sessionStorage.setItem(props.storageKey, JSON.stringify({
        filterData: filterData.value,
        filter: filter.value,
        status: status.value,
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        sortDir: sortDir.value,
        sortField: sortField.value,
        sortKeys: sortKeys.value,
      }));
    } catch (e) {
      // sessionStorage may be unavailable; ignore
    }
  },
  { deep: true },
);

/**
 * Opens a modal based on the provided item and type.
 * @param {Object} item - The item to show in the modal.
 * @param {string} type - The type of modal to open.
 */
function openModal(item, type) {
  // ActionsMenu component manages focus on trigger elements when modals are opened/closed.
  // To avoid conflicts, we defer showing the modal until the next tick.
  nextTick(() => {
    resumeDate.value = null;
    modalItem.value = item;
    modalType.value = REQUEST_MODAL_TYPES[type];
    if (modalType.value === 'CHANGERESUMEDATE') {
      resumeDate.value = item.details.resumeDate;
      bvModal.value.show('UpdateResumeDateModal');
    } else {
      bvModal.value.show('request_modal');
    }
  });
}

/**
 * Handles the specified action for a given item.
 * @param {string} action - The action to be performed.
 * @param {Object} item - The item on which the action is to be performed.
 */
function handleAction(action, item) {
  if (action === 'DETAILS') emit('navigate-to-details', item);
  else openModal(item, action);
}

/**
 * Handles filtering requests as well as updates to pagination
 * @param {Object} property updated property
 */
function filterHandler(property) {
  const [key, value] = Object.entries(property)[0];
  componentRefs.get(key).value = value;
  const resetPaging = (key !== 'currentPage');
  loadRequests(resetPaging);
}

function handleSortChange(field) {
  sortField.value = field;
  filterHandler({ sortKeys: field });
}

function handleSortDirectionChange(direction) {
  filterHandler({ sortDir: direction });
}

/**
 * Updates a suspended request's resume date.
 *
 * @param {String} newResumeTime - The new resume date for the request.
 * @param {String} justification - The justification for modifying the request's resume date.
 */
async function updateResumeDate(newResumeTime, justification) {
  isSaving.value = true;
  const requestId = modalItem.value.details.id;
  const waitTask = find(modalItem.value.rawData.decision?.phases, (phase) => startsWith(phase.name, 'waitTask'));
  const payload = {
    resumeDate: newResumeTime,
  };
  try {
    await updateRequestResumeDate(requestId, payload);
    await requestAction(requestId, 'comment', waitTask.name, { comment: justification });
    bvModal.value.hide('UpdateResumeDateModal');
    await loadRequests();
    displayNotification('success', i18n.global.t('governance.accessRequest.requestSaveSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.requestSaveError'));
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  if (!props.isAdmin) {
    statusOptions.value = [...statusOptions.value, {
      text: i18n.global.t('common.draft'),
      value: 'draft',
    }];
  }
  loadRequests();
});
</script>

<style lang="scss" scoped>
.table-container {
    flex: 1 1 auto;
    min-width: 0 !important;
    min-height: 300px;

    :deep(> div) {
      width: 100%;
    }
  }
.toolbar-link-text {
  color: $gray-900;
}

.fr-table-panel {
  flex: 1 1 0;
  min-width: 0;
}

  .table-container > * {
    overflow-x: auto;
  }

  .fr-access-viewer {
    padding-bottom: 72px;
  }
</style>

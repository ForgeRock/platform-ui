<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <FrAccessRequestList
      :is-loading="isLoading"
      :list-name="title"
      :requests="accessRequests"
      @open-detail="$emit('navigate-to-details', $event)">
      <template #header>
        <FrRequestToolbar
          v-model:num-filters="numFilters"
          :sort-by-options="sortByOptions"
          :status-options="statusOptions"
          @filter-change="filterHandler({ filter: $event })"
          @sort-change="filterHandler({ sortKeys: $event })"
          @sort-direction-change="filterHandler({ sortDir: $event })"
          @status-change="filterHandler({ status: $event })" />
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
          v-if="status === 'in-progress'"
          class="mr-3"
          :item="item"
          :type="allowForwarding ? detailTypes.ADMIN_REQUEST : detailTypes.USER_REQUEST"
          @action="handleAction($event, item)" />
      </template>
    </FrAccessRequestList>
    <FrPagination
      v-if="totalRows"
      v-model="currentPage"
      :per-page="pageSize"
      :total-rows="totalRows"
      @input="filterHandler({ currentPage: $event })"
      @on-page-size-change="filterHandler({ pageSize: $event })" />
  </BCard>
  <FrRequestModal
    :type="modalType"
    :item="modalItem"
    @modal-closed="modalItem = {}"
    @update-list="loadRequests(true)" />
</template>

<script setup>
import {
  BCard,
} from 'bootstrap-vue';
import { ref } from 'vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import {
  detailTypes,
  getRequestFilter,
  getStatusText,
  sortByOptions,
  sortKeysMap,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrAccessRequestList from '@forgerock/platform-shared/src/components/governance/AccessRequestList';
import FrRequestActionsCell from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActionsCell';
import FrRequestToolbar from '@forgerock/platform-shared/src/components/governance/RequestToolbar';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
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
  allowForwarding: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

// Emits
const emit = defineEmits(['load-requests', 'navigate-to-details']);

// Composables
const { bvModal } = useBvModal();

// Data
const currentPage = ref(1);
const filter = ref({});
const modalItem = ref({});
const modalType = ref(REQUEST_MODAL_TYPES.CANCEL);
const numFilters = ref(0);
const pageSize = ref(10);
const sortDir = ref('desc');
const sortKeys = ref('date');
const status = ref('in-progress');
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

  if (sortKeys.value === 'date') params.sortType = 'date';
  emit('load-requests', params, payload);
}

/**
 * Opens a modal based on the provided item and type.
 * @param {Object} item - The item to show in the modal.
 * @param {string} type - The type of modal to open.
 */
function openModal(item, type) {
  modalItem.value = item;
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.value.show('request_modal');
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
</script>

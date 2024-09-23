<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <FrAccessRequestList
      :is-loading="isLoading"
      :requests="accessRequests"
      @open-detail="$emit('navigate-to-details', $event)">
      <template #header>
        <FrRequestToolbar
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
        <div class="d-flex justify-content-end align-items-center">
          <div class="d-none d-lg-block mr-4">
            <BBadge
              class="w-100px font-weight-normal"
              :variant="status === 'complete' ? 'success' : 'light'">
              {{ getStatusText(statusOptions, status) }}
            </BBadge>
          </div>
          <FrActionsCell
            :delete-option="false"
            :divider="false"
            :edit-option="false"
            :enable-sr-only-label="true">
            <template #custom-top-actions>
              <BDropdownItem
                data-testid="view-details-button"
                @click="$emit('navigate-to-details', item)">
                <FrIcon
                  icon-class="mr-2"
                  name="list_alt">
                  {{ $t('common.viewDetails') }}
                </FrIcon>
              </BDropdownItem>
              <template v-if="status === 'in-progress'">
                <BDropdownDivider />
                <BDropdownItem
                  v-if="allowForwarding"
                  @click="openModal(item, 'REASSIGN')">
                  <FrIcon
                    icon-class="mr-2"
                    name="redo">
                    {{ $t('common.forward') }}
                  </FrIcon>
                </Bdropdownitem>
                <BDropdownItem @click="openModal(item, 'CANCEL')">
                  <FrIcon
                    icon-class="mr-2"
                    name="cancel">
                    {{ $t('governance.accessRequest.myRequests.cancelRequest') }}
                  </FrIcon>
                </Bdropdownitem>
              </template>
            </template>
          </FrActionsCell>
        </div>
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
  BBadge,
  BCard,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import { ref } from 'vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import {
  getRequestFilter,
  getStatusText,
  sortKeysMap,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrAccessRequestList from '@forgerock/platform-shared/src/components/governance/AccessRequestList';
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
});

const emit = defineEmits(['load-requests', 'navigate-to-details']);

// Composables
const { bvModal } = useBvModal();

const currentPage = ref(1);
const filter = ref({});
const modalItem = ref({});
const modalType = ref(REQUEST_MODAL_TYPES.CANCEL);
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

function openModal(item, type) {
  modalItem.value = item;
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.value.show('request_modal');
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

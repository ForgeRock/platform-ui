<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer>
      <!-- Header -->
      <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
        <BCol lg="8">
          <FrHeader
            :title="$t('pageTitles.MyRequests')"
            :subtitle="$t('pages.myRequests.subTitle')" />
        </BCol>
        <BCol
          v-if="!userStore.adminUser"
          lg="4">
          <div class="d-flex justify-content-lg-end">
            <BButton
              variant="primary"
              :aria-label="$t('governance.accessRequest.newRequest.newRequest')"
              @click="newRequest">
              <FrIcon
                icon-class="mr-2"
                name="add">
                {{ $t('governance.accessRequest.newRequest.newRequest') }}
              </FrIcon>
            </BButton>
          </div>
        </BCol>
      </BRow>
      <!-- Content -->
      <BRow>
        <BCol>
          <BCard no-body>
            <FrAccessRequestList
              :is-loading="isLoading"
              :requests="accessRequests"
              @open-detail="viewDetails">
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
                  data-testid="requests-no-data"
                  icon="person_add"
                  :card="false"
                  :subtitle="$t('governance.accessRequest.noRequests', { status: getStatusText(statusOptions, status) })" />
              </template>
              <template #actions="{ item }">
                <div class="d-flex justify-content-end align-items-center">
                  <div class="d-none d-lg-block mr-4">
                    <BBadge
                      class="w-100px font-weight-normal"
                      data-testid="status-badge"
                      :variant="status === 'complete' ? 'success' : 'light'">
                      {{ getStatusText(statusOptions, status) }}
                    </BBadge>
                  </div>
                  <FrActionsCell
                    test-id="cell-button"
                    :delete-option="false"
                    :divider="false"
                    :edit-option="false">
                    <template #custom-top-actions>
                      <BDropdownItem
                        data-testid="view-details-button"
                        @click="viewDetails(item)">
                        <FrIcon
                          icon-class="mr-2"
                          name="list_alt">
                          {{ $t('common.viewDetails') }}
                        </FrIcon>
                      </BDropdownItem>
                      <template v-if="status === 'in-progress'">
                        <BDropdownDivider />
                        <BDropdownItem
                          v-if="userStore.adminUser"
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
              v-if="totalRows > 0"
              v-model="currentPage"
              :per-page="pageSize"
              :total-rows="totalRows"
              @input="filterHandler({ currentPage: $event })"
              @on-page-size-change="filterHandler({ pageSize: $event })" />
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
    <FrNewRequestModal />
    <FrRequestModal
      :type="modalType"
      :item="modalItem"
      @modal-closed="modalItem = {}"
      @update-list="loadRequests(true)" />
  </div>
</template>

<script setup>
/**
 * Displays the list of Requests and the corresponding filters.
 * @component MyRequest
 */
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BContainer,
  BDropdownDivider,
  BDropdownItem,
  BRow,
} from 'bootstrap-vue';
import {
  computed,
  onMounted,
  ref,
} from 'vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import {
  getRequestFilter,
  getStatusText,
  sortKeysMap,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getRequests, getUserRequests } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrAccessRequestList from '@forgerock/platform-shared/src/components/governance/AccessRequestList';
import FrRequestToolbar from '@forgerock/platform-shared/src/components/governance/RequestToolbar';
import FrNewRequestModal from '@forgerock/platform-shared/src/components/governance/NewRequestModal';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useRouter } from 'vue-router';
import i18n from '@/i18n';

// Composables
const { userId, adminUser } = useUserStore();
const { bvModal } = useBvModal();
const router = useRouter();

const userStore = computed(() => ({
  userId,
  adminUser,
}));

const accessRequests = ref([]);
const currentPage = ref(1);
const filter = ref({});
const isLoading = ref(false);
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
const totalRows = ref(0);

const componentRefs = new Map([
  ['currentPage', currentPage],
  ['filter', filter],
  ['pageSize', pageSize],
  ['sortDir', sortDir],
  ['sortDir', sortDir],
  ['sortKeys', sortKeys],
  ['status', status],
  ['totalRows', totalRows],
]);

/**
 * Get current users access requests based on query params and target filter
 */
async function loadRequests(goToFirstPage) {
  isLoading.value = true;

  if (goToFirstPage) currentPage.value = 1;
  const payload = getRequestFilter(filter.value, status.value);
  const params = {
    pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    pageSize: pageSize.value,
    sortKeys: sortKeysMap[sortKeys.value],
    sortDir: sortDir.value,
  };

  if (sortKeys.value === 'date') params.sortType = 'date';

  try {
    const { data } = userStore.value.adminUser
      ? await getRequests(params, payload)
      : await getUserRequests(userId, params, payload);
    accessRequests.value = data.result;
    totalRows.value = data.totalCount;
  } catch (error) {
    accessRequests.value = [];
    totalRows.value = 0;
    showErrorMessage(error, i18n.global.t('governance.accessRequest.myRequests.errorGettingRequests'));
  } finally {
    isLoading.value = false;
  }
}

function newRequest() {
  bvModal.value.show('NewRequestModal');
}

function viewDetails(item) {
  router.push({
    name: 'MyRequestDetails',
    params: { requestId: item.details.id },
  });
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

onMounted(async () => {
  loadRequests();
});
</script>

<!-- Copyright 2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BCard
    no-body
    class="overflow-hidden">
    <BCardHeader class="px-3 py-2 d-flex align-items-center justify-content-between">
      <h5 class="card-title mb-0">
        {{ $t('governance.importHistory.title') }}
      </h5>
      <BButton
        variant="outline-primary"
        @click="emit('refresh')">
        <FrIcon
          icon-class="mr-2"
          name="refresh">
          {{ $t('governance.importHistory.refresh') }}
        </FrIcon>
      </BButton>
    </BCardHeader>
    <div class="table-responsive">
      <BTable
        :fields="historyFields"
        :items="items"
        :busy="isLoading"
        :tbody-tr-class="rowClass"
        show-empty
        style="min-width: 1100px"
        @row-clicked="onRowClicked">
        <template #table-busy>
          <FrSpinner class="py-4" />
        </template>
        <template #empty>
          <div class="text-center text-muted py-4">
            {{ $t('governance.importHistory.noHistory') }}
          </div>
        </template>
        <template #cell(timestamp)="{ item }">
          {{ item.uploadDate ? dayjs(item.uploadDate).format('MMM D, YYYY h:mm A') : blankValueIndicator }}
        </template>
        <template #cell(filename)="{ item }">
          {{ item.name || blankValueIndicator }}
          <FrIcon
            v-if="isDeleteUpload(item)"
            v-b-tooltip.hover
            name="warning"
            icon-class="text-warning ml-1"
            :title="$t('governance.importHistory.deleteUploadTooltip')" />
        </template>
        <template #cell(actions)="{ item }">
          <FrActionsCell
            v-if="isCompletedOrFailed(item)"
            :delete-option="false"
            :edit-option="false"
            :divider="false"
            class="py-2">
            <template #custom-top-actions>
              <BDropdownItem @click="viewFailures(item)">
                <FrIcon
                  icon-class="mr-2"
                  name="error_outline">
                  {{ $t('governance.importHistory.viewFailures') }}
                </FrIcon>
              </BDropdownItem>
              <BDropdownItem
                v-if="isCompleted(item)"
                @click="emit('run-delete-detection', item)">
                <FrIcon
                  icon-class="mr-2"
                  name="manage_search">
                  {{ $t('governance.importHistory.runDeleteDetection') }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </FrActionsCell>
        </template>
        <template #cell(objectType)="{ item }">
          {{ item.context?.applicationObjectType || blankValueIndicator }}
        </template>
        <template #cell(status)="{ item }">
          <BBadge
            v-if="item.context?.extractions?.[0]?.metadata?.status"
            :variant="getStatusVariant(item.context.extractions[0].metadata.status)">
            {{ capitalizeFirst(item.context.extractions[0].metadata.status) }}
          </BBadge>
          <span v-else>{{ blankValueIndicator }}</span>
        </template>
        <template #cell(imported)="{ item }">
          {{ item.context?.extractions?.[0]?.metadata?.inserted ?? blankValueIndicator }}
        </template>
        <template #cell(updated)="{ item }">
          {{ item.context?.extractions?.[0]?.metadata?.processed ?? blankValueIndicator }}
        </template>
        <template #cell(failed)="{ item }">
          {{ item.context?.extractions?.[0]?.metadata?.failed ?? blankValueIndicator }}
        </template>
        <template #row-details="{ item }">
          <div class="bg-light px-3 py-3">
            <h6 class="mb-3">
              {{ $t('governance.importHistory.failuresTitle') }}
            </h6>
            <FrSpinner
              v-if="failureState[item.id] && failureState[item.id].isLoading"
              class="py-3" />
            <template v-else>
              <BTable
                :fields="failureFields"
                :items="failureState[item.id] ? failureState[item.id].items : []"
                show-empty
                class="mb-0 bg-white rounded">
                <template #empty>
                  <div class="text-center text-muted py-3">
                    {{ $t('governance.importHistory.noFailures') }}
                  </div>
                </template>
                <template #cell(id)="{ item: failure }">
                  {{ failure.data?.id ?? blankValueIndicator }}
                </template>
                <template #cell(displayName)="{ item: failure }">
                  {{ failure.data?.displayName ?? blankValueIndicator }}
                </template>
                <template #cell(data)="{ item: failure }">
                  <template v-if="failure.data">
                    <BButton
                      variant="link"
                      class="p-0"
                      @click="failure._showData = !failure._showData">
                      {{ $t('governance.importHistory.showSourceData') }}
                    </BButton>
                    <pre
                      v-if="failure._showData"
                      class="small mt-2 mb-0">{{ JSON.stringify(failure.data, null, 2) }}</pre>
                  </template>
                  <span v-else>{{ blankValueIndicator }}</span>
                </template>
                <template #cell(reason)="{ item: failure }">
                  <template v-if="parseReasons(failure.message).length">
                    <div
                      v-for="(reason, index) in parseReasons(failure.message)"
                      :key="index"
                      class="text-danger small">
                      {{ reason }}
                    </div>
                  </template>
                  <span
                    v-else
                    class="text-danger small">
                    {{ blankValueIndicator }}
                  </span>
                </template>
              </BTable>
              <FrPagination
                v-if="failureState[item.id] && failureState[item.id].totalRows > failureState[item.id].perPage"
                :value="failureState[item.id].currentPage"
                :per-page="failureState[item.id].perPage"
                :total-rows="failureState[item.id].totalRows"
                class="border-top-0"
                @input="loadFailurePage(item, $event)"
                @on-page-size-change="onFailurePageSizeChange(item, $event)" />
            </template>
          </div>
        </template>
      </BTable>
    </div>
    <FrPagination
      v-if="totalRows > perPage"
      :value="currentPage"
      :per-page="perPage"
      :total-rows="totalRows"
      @input="emit('page-change', $event)"
      @on-page-size-change="emit('page-size-change', $event)" />
  </BCard>
</template>

<script setup>
import { reactive } from 'vue';
import {
  BBadge,
  BButton,
  BCard,
  BCardHeader,
  BDropdownItem,
  BTable,
  VBTooltip,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import dayjs from 'dayjs';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getApplicationUploadFailures } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const vBTooltip = VBTooltip;

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  perPage: {
    type: Number,
    default: 10,
  },
  totalRows: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['page-change', 'page-size-change', 'run-delete-detection', 'refresh']);

// keyed by item.id; each entry: { isLoading, items, currentPage, perPage, totalRows }
const failureState = reactive({});

const historyFields = [
  {
    key: 'timestamp',
    label: i18n.global.t('governance.importHistory.columns.timestamp'),
    sortable: true,
  },
  {
    key: 'objectType',
    label: i18n.global.t('governance.importHistory.columns.objectType'),
    sortable: true,
    class: 'w-200px',
  },
  {
    key: 'status',
    label: i18n.global.t('governance.importHistory.columns.status'),
    sortable: true,
    class: 'w-200px',
  },
  {
    key: 'imported',
    label: i18n.global.t('governance.importHistory.columns.imported'),
    sortable: false,
    class: 'w-120px',
  },
  {
    key: 'updated',
    label: i18n.global.t('governance.importHistory.columns.updated'),
    sortable: false,
    class: 'w-120px',
  },
  {
    key: 'failed',
    label: i18n.global.t('governance.importHistory.columns.failed'),
    sortable: false,
    class: 'w-120px',
  },
  {
    key: 'filename',
    label: i18n.global.t('governance.importHistory.columns.filename'),
    sortable: false,
  },
  {
    key: 'actions',
    label: i18n.global.t('common.actions'),
    sortable: false,
    class: 'w-120px fr-no-resize sticky-right',
  },
];

const failureFields = [
  {
    key: 'id',
    label: i18n.global.t('governance.importHistory.columns.failureId'),
    class: 'w-200px',
  },
  {
    key: 'displayName',
    label: i18n.global.t('governance.importHistory.columns.failureDisplayName'),
    class: 'w-200px',
  },
  {
    key: 'reason',
    label: i18n.global.t('governance.importHistory.columns.failureReason'),
  },
  {
    key: 'data',
    label: i18n.global.t('governance.importHistory.columns.failureData'),
  },
];

function parseReasons(message) {
  if (!message) return [];
  try {
    const parsed = JSON.parse(message);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [message];
  }
}

function isDeleteUpload(item) {
  return item.context?.type?.startsWith('delete-');
}

function getStatus(item) {
  return item.context?.extractions?.[0]?.metadata?.status?.toLowerCase();
}

function isCompleted(item) {
  return getStatus(item) === 'completed';
}

function isCompletedOrFailed(item) {
  const status = getStatus(item);
  return status === 'completed' || status === 'failed';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    processing: 'warning',
    failed: 'danger',
    completed: 'success',
  };
  return variants[status?.toLowerCase()] || 'secondary';
}

function getUploadId(item) {
  return item.context?.extractions?.[0]?.extractionId;
}

function initFailureState(item) {
  if (!failureState[item.id]) {
    failureState[item.id] = {
      isLoading: false,
      items: [],
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
    };
  }
}

async function loadFailurePage(item, page = 1) {
  initFailureState(item);
  const state = failureState[item.id];
  state.currentPage = page;
  state.isLoading = true;
  const uploadId = getUploadId(item);
  if (!uploadId) {
    state.isLoading = false;
    return;
  }
  try {
    const { data } = await getApplicationUploadFailures(props.applicationId, uploadId, {
      pagedResultsOffset: (page - 1) * state.perPage,
      pageSize: state.perPage,
    });
    state.items = data?.result || [];
    state.totalRows = data?.totalCount || 0;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.importHistory.errorLoadingFailures'));
  } finally {
    state.isLoading = false;
  }
}

function onFailurePageSizeChange(item, size) {
  initFailureState(item);
  failureState[item.id].perPage = size;
  loadFailurePage(item, 1);
}

async function viewFailures(item) {
  const isCurrentlyOpen = item._showDetails;
  // eslint-disable-next-line no-param-reassign
  item._showDetails = !isCurrentlyOpen;
  if (!isCurrentlyOpen) {
    await loadFailurePage(item, 1);
  }
}

function rowClass(item) {
  return item && isCompletedOrFailed(item) ? 'cursor-pointer' : '';
}

function onRowClicked(item) {
  if (isCompletedOrFailed(item)) {
    viewFailures(item);
  }
}
</script>

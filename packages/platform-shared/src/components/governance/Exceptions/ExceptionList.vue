<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <FrExceptionToolbar
      v-model="filters"
      :is-admin="isAdmin"
      :policy-rule-options="policyRuleOptions"
      :search-input-placeholder="searchInputPlaceholder"
      @get-policy-rule-options="$emit('get-policy-rule-options', $event)"
      @input="handleFilterChange"
      @open-columns-modal="openColumnsModal" />
    <BTable
      @row-clicked="$emit('view-exception-details', $event)"
      @sort-changed="sortChanged"
      class="mb-0"
      hover
      no-local-sorting
      no-sort-reset
      responsive
      show-empty
      :empty-text="$t('common.noRecordsToShow')"
      tbody-tr-class="cursor-pointer"
      :busy="isLoading"
      :fields="exceptionColumnsToShow"
      :items="items"
      :per-page="pageSize"
      :sort-by="sortBy"
      :sort-desc="sortDesc">
      <template #table-busy>
        <div class="text-center text-danger my-2">
          <FrSpinner />
        </div>
      </template>
      <template #cell(user)="{ item }">
        <div class="text-truncate">
          <h4 class="h5 mb-1">
            {{ item?.user?.givenName }} {{ item?.user?.sn }}
          </h4>
          <span class="text-body">
            {{ item?.user?.userName }}
          </span>
        </div>
      </template>
      <template #cell(policyRule)="{ item }">
        <div class="text-truncate">
          {{ item?.policyRule?.name }}
        </div>
      </template>
      <template #cell(initialViolation)="{ item }">
        <div class="text-truncate">
          {{ convertDate(item.initialViolation) }}
        </div>
      </template>
      <template #cell(latestViolation)="{ item }">
        <div class="text-truncate">
          {{ convertDate(item.latestViolation) }}
        </div>
      </template>
      <template #cell(expiration)="{ item }">
        <div class="text-truncate">
          {{ convertDate(item.expiration) }}
        </div>
      </template>
      <template #cell(actions)="{ item }">
        <FrExceptionActionsCell
          :is-admin="isAdmin"
          :item="item"
          @open-revoke-modal="openRevokeModal"
          @open-exception-modal="openExceptionModal"
          @open-forward-modal="openForwardModal" />
      </template>
    </BTable>
    <FrPagination
      v-if="tableRows?.length"
      v-model="currentPage"
      :per-page="pageSize"
      :total-rows="totalRowCount"
      @input="paginationChange"
      @on-page-size-change="updatePageSize" />
    <FrColumnOrganizer
      @update-columns="updateColumns"
      :active-columns="exceptionColumns"
      :available-columns="columnCategories" />
    <FrExceptionModal
      extend-exception
      @action="extendException"
      @view-violation-details="$emit('view-exception-details', selectedItem)"
      :violation="selectedItem" />
    <FrViolationForwardModal
      @forward-item="forwardItem" />
    <FrRevokeExceptionModal
      @revoke="revoke"
      :violation-id="selectedItemId" />
  </BCard>
</template>

<script setup>
/**
 * List of Exceptions. Can filter by user and rule.
 */
import { computed, ref } from 'vue';
import {
  BCard,
  BTable,
} from 'bootstrap-vue';
import {
  cloneDeep,
  groupBy,
} from 'lodash';
import dayjs from 'dayjs';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import FrColumnOrganizer from '@forgerock/platform-shared/src/components/ColumnOrganizer/ColumnOrganizer';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrExceptionToolbar from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionToolbar';
import FrExceptionActionsCell from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionActionsCell';
import FrExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionModal';
import FrRevokeExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/RevokeExceptionModal';
import FrViolationForwardModal from '@forgerock/platform-shared/src/components/governance/Violations/ViolationForwardModal';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { forwardViolation, allowException, revokeException } from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import i18n from '@/i18n';
import store from '@/store';

// Composables
const { bvModal } = useBvModal();

const emit = defineEmits([
  'get-policy-rule-options',
  'handle-search',
  'view-exception-details',
]);

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  policyRuleOptions: {
    type: Array,
    default: () => [],
  },
  searchInputPlaceholder: {
    type: String,
    default: i18n.global.t('common.search'),
  },
  tableRows: {
    type: Array,
    default: () => [],
  },
  totalRowCount: {
    type: Number,
    default: 0,
  },
});

const tableFields = [
  {
    key: 'user',
    label: i18n.global.t('common.user.user'),
    category: 'user',
    sortable: true,
    show: true,
  },
  {
    key: 'policyRule',
    label: i18n.global.t('governance.violations.rule'),
    category: 'rule',
    sortable: true,
    show: true,
  },
  {
    key: 'initialViolation',
    label: i18n.global.t('governance.exceptions.initialViolation'),
    category: 'violation',
    show: true,
  },
  {
    key: 'latestViolation',
    label: i18n.global.t('governance.exceptions.latestViolation'),
    category: 'violation',
    show: true,
  },
  {
    key: 'expiration',
    label: i18n.global.t('governance.exceptions.expiration'),
    category: 'violation',
    show: true,
  },
  {
    key: 'actions',
    class: 'w-100px',
    label: '',
    sortable: false,
    show: true,
  },
];

const formatedColumns = groupBy(tableFields, 'category');
const categories = [
  {
    name: 'violation',
    header: i18n.global.t('common.violation'),
    items: formatedColumns.violation,
  },
  {
    name: 'user',
    header: i18n.global.t('common.user.user'),
    items: formatedColumns.user,
  },
  {
    name: 'rule',
    header: i18n.global.t('governance.violations.rule'),
    items: formatedColumns.rule,
  },
];

const currentPage = ref(1);
const exceptionColumns = ref(tableFields);
const columnCategories = ref(categories);
const pageSize = ref(10);
const selectedItem = ref({});
const selectedItemId = ref('');
const sortBy = ref('created');
const sortDesc = ref(true);

const filters = ref({
  rule: '',
  user: 'managed/user/all',
});

// parse items information
const items = computed(() => {
  if (!props.tableRows?.length) return [];
  return props.tableRows.map((exception) => ({
    comments: exception.decision?.comments,
    expiration: exception.decision?.events?.exception?.date,
    id: exception.id,
    initialViolation: exception.decision?.startDate,
    latestViolation: exception.stats?.latestDetectionTime,
    phaseId: exception.decision?.phases[0]?.name,
    policyRule: exception.policyRule,
    rawData: exception,
    user: exception.user,
  }));
});

// exception columns to show
const exceptionColumnsToShow = computed(() => exceptionColumns.value.filter((col) => col.show));

/**
 * Updates the columns of the list in their corresponding order
 * @param {Object} columns all the information on the columns and their categories
 * @param {Array} columns.activeColumns active columns to be displayed
 * @param {Array} columns.availableColumns available columns separated by category
 */
function updateColumns({ activeColumns, availableColumns }) {
  exceptionColumns.value = activeColumns || cloneDeep(tableFields);
  columnCategories.value = availableColumns || cloneDeep(categories);
}

/**
 * Opens column organizer modal
 */
function openColumnsModal() {
  bvModal.value.show('ColumnOrganizerModal');
}

/**
 * Opens exception modal
 * @param {Object} item selected item information
 */
function openExceptionModal(item) {
  selectedItem.value = item;
  bvModal.value.show('ExceptionModal');
}

/**
 * Open forward modal
 * @param {Object} item violation to forward
 */
function openForwardModal(item) {
  selectedItem.value = item;
  bvModal.value.show('violation-forward-modal');
}

/**
 * Opens revoke modal
 * @param {String} itemId selected item ID
 */
function openRevokeModal(itemId) {
  selectedItemId.value = itemId;
  bvModal.value.show('RevokeExceptionModal');
}

/**
 * Convert date into user friendly format
 * @param {String} date date string
 * @returns {String} user friendly date string
 */
function convertDate(date) {
  const utcOffset = dayjs().utcOffset();
  const dayjsDate = dayjs(date);

  // Subtract the local offset from the current date
  const dateWithoutOffset = dayjsDate.subtract(utcOffset, 'minute');
  return date ? dateWithoutOffset.format('MMM D, YYYY') : blankValueIndicator;
}

/**
 * Build target filter object used to filter api response
 * @param {Object} targetFilter contains various values used to filter request data
 * @returns {Object} IGA compatible target filter
 */
function getTargetFilter(targetFilter) {
  const filterPayload = {
    operator: 'AND',
    operand: [],
  };

  filterPayload.operand.push(getBasicFilter('EQUALS', 'decision.status', 'exception'));

  if (targetFilter.rule.length) {
    filterPayload.operand.push(getBasicFilter('EQUALS', 'policyRule.id', targetFilter.rule));
  }

  if (targetFilter.user && targetFilter.user !== 'managed/user/all') {
    const id = targetFilter.user.split('/').pop();
    filterPayload.operand.push(getBasicFilter('EQUALS', 'user.id', id));
  }

  if (targetFilter.searchValue) {
    filterPayload.operand.push({
      operator: 'OR',
      operand: [
        getBasicFilter('CONTAINS', 'user.userName', targetFilter.searchValue),
        getBasicFilter('CONTAINS', 'user.givenName', targetFilter.searchValue),
        getBasicFilter('CONTAINS', 'user.sn', targetFilter.searchValue),
        getBasicFilter('CONTAINS', 'policyRule.name', targetFilter.searchValue),
      ],
    });
  }

  return filterPayload;
}

/**
 * Builds request params and sends out event to request data from api
 * @param {Object} filterObj contains various values used to filter request data
 */
async function getData(filterObj) {
  const targetFilter = getTargetFilter(filterObj);

  const searchParams = {
    pageSize: pageSize.value,
    pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    sortDir: sortDesc.value ? 'desc' : 'asc',
    fields: 'id,user,policyRule,decision,stats',
  };
  const sortKeyMap = {
    user: 'user.userName',
    policyRule: 'policyRule.name',
    created: 'decision.startDate',
  };
  searchParams.sortKeys = sortKeyMap[sortBy.value];

  emit('handle-search', searchParams, targetFilter);
}

/**
 * Update the filter and call to get updated data
 * @event input
 * @param {Object} newFilters New filter values
 */
function handleFilterChange(newFilters) {
  filters.value = newFilters;
  getData(filters.value);
}

/**
 * Update the current page number and call to get updated data
 * @event input
 * @param {Number} page New page number
 */
function paginationChange(page) {
  currentPage.value = page;
  getData(filters.value);
}

/**
 * Update the sorting used in the table and call to get updated data
 * @event sort-changed
 * @param {Object} sortContext Current context of table sorting (sortDesc & sortBy)
 */
function sortChanged(sortContext) {
  sortDesc.value = sortContext.sortDesc;
  sortBy.value = sortContext.sortBy;
  getData(filters.value);
}

/**
 * Update the page size and call to get updated data
 * @event on-page-size-change
 * @param {Number} newPageSize New page size to be used
 */
function updatePageSize(newPageSize) {
  pageSize.value = newPageSize;
  getData(filters.value);
}

/**
 * Update the page size and call to get updated data
 * @param {Object} actionObject Object with call data
 * @param {String} actionObject.violationId violation id
 * @param {String} actionObject.phaseId phase id
 * @param {Object} payload Request payload
 */
async function extendException({ violationId, phaseId, payload }) {
  try {
    await allowException(violationId, phaseId, payload);
    // if the violation is allowed forever, it will be removed from the list
    if (!payload.exceptionExpirationDate) {
      store.commit('setViolationsCount', store.state.violationsCount - 1);
    }
    displayNotification('success', i18n.global.t('governance.violations.successExtendingException'));
    bvModal.value.hide('ExceptionModal');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorExtendingException'));
  } finally {
    getData(filters.value);
  }
}

/**
 * Forward an exception to a new user, with an optional comment
 * @param {String} actorId actor to forward to
 * @param {String} comment comment
 */
async function forwardItem({ actorId, comment }) {
  try {
    if (!selectedItem?.value?.rawData?.decision?.phases?.length) return;
    const phaseId = selectedItem.value.rawData.decision.phases[0].name;
    const permissions = {
      allow: true,
      comment: true,
      exception: true,
      reassign: true,
      remediate: true,
    };
    await forwardViolation(selectedItem.value.id, phaseId, actorId, permissions, comment);
    store.commit('setViolationsCount', store.state.violationsCount - 1);
    displayNotification('success', i18n.global.t('governance.violations.successForwardingViolation'));
    getData(filters.value);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorForwardingViolation'));
  }
}

/**
 * Update the page size and call to get updated data
 * @param {Object} dataObject info of the request
 * @param {String[]} dataObject.ids ids to ve revoked
 * @param {String} dataObject.comment comment of the revokation
 */
async function revoke(revokeObject) {
  try {
    await revokeException(revokeObject);
    displayNotification('success', i18n.global.t('governance.violations.successRevokingException'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorRevokingException'));
  } finally {
    getData(filters.value);
  }
}

getData(filters.value);
</script>

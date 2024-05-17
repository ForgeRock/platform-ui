<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <FrViolationToolbar
      v-model="filters"
      :is-admin="isAdmin"
      :policy-rule-options="policyRuleOptions"
      :search-input-placeholder="searchInputPlaceholder"
      @get-policy-rule-options="$emit('get-policy-rule-options', $event)"
      @input="handleFilterChange" />
    <BTable
      @row-clicked="$emit('viewViolationDetails', $event)"
      @sort-changed="sortChanged"
      class="mb-0"
      hover
      no-local-sorting
      no-sort-reset
      responsive
      show-empty
      tbody-tr-class="cursor-pointer"
      :busy="isLoading"
      :fields="tableFields"
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
      <template #cell(created)="{ item }">
        <div class="text-truncate">
          {{ convertDate(item.created) }}
        </div>
      </template>
      <template #cell(actions)="{ item }">
        <div class="d-flex justify-content-end">
          <template v-if="!isAdmin">
            <BButton
              @click="openExceptionModal(item)"
              class="mr-1"
              variant="outline-secondary"
              size="sm">
              <FrIcon
                icon-class="mr-2 text-success"
                name="check">
                {{ $t('common.allow') }}
              </FrIcon>
            </BButton>
            <BButton
              @click="() => {}"
              class="mr-1"
              variant="outline-secondary"
              size="sm">
              <FrIcon
                icon-class="mr-2 text-danger"
                name="block">
                {{ $t('common.revoke') }}
              </FrIcon>
            </BButton>
          </template>
          <BDropdown
            no-caret
            toggle-class="py-1 px-3"
            variant="link">
            <template #button-content>
              <FrIcon
                icon-class="text-dark md-24"
                name="more_horiz" />
            </template>
            <BDropdownItem @click="openForwardModal(item)">
              <FrIcon
                icon-class="mr-2"
                name="redo">
                {{ $t('common.forward') }}
              </FrIcon>
            </BDropdownItem>
            <template v-if="!isAdmin">
              <BDropdownDivider />
              <BDropdownItem @click="$emit('viewViolationDetails', item)">
                <FrIcon
                  icon-class="mr-2"
                  name="list_alt">
                  {{ $t('common.viewDetails') }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </BDropdown>
        </div>
      </template>
    </BTable>
    <FrPagination
      v-if="tableRows?.length"
      v-model="currentPage"
      :per-page="pageSize"
      :total-rows="totalRowCount"
      @input="paginationChange"
      @on-page-size-change="updatePageSize" />

    <!-- Forward Modal -->
    <FrViolationForwardModal
      @forward-item="forwardItem" />
    <ExceptionModal
      :violation="selectedViolation"
      @action="extendException"
      @view-violation-details="$emit('viewViolationDetails', selectedViolation)" />
  </BCard>
</template>

<script setup>
/**
 * List of SOD violations. Can filter by status, policy rule, user, and date range.
 */
import { computed, ref } from 'vue';
import {
  BCard,
  BDropdown,
  BDropdownItem,
  BTable,
  BButton,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { forwardViolation, allowException } from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrViolationToolbar from '@forgerock/platform-shared/src/components/governance/Violations/ViolationToolbar';
import FrViolationForwardModal from '@forgerock/platform-shared/src/components/governance/Violations/ViolationForwardModal';
import ExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionModal';
import i18n from '@/i18n';

// composables
const { bvModal } = useBvModal();

const emit = defineEmits(['get-policy-rule-options', 'handle-search', 'viewViolationDetails']);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  policyRuleOptions: {
    type: Array,
    default: () => [],
  },
  tableRows: {
    type: Array,
    default: () => [],
  },
  totalRowCount: {
    type: Number,
    default: 0,
  },
  searchInputPlaceholder: {
    type: String,
    default: i18n.global.t('common.search'),
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('created');
const sortDesc = ref(true);
const itemToForward = ref({});
const selectedViolation = ref({});

const filters = ref({
  status: 'pending',
  rule: '',
  user: 'managed/user/all',
  startDate: '',
  endDate: '',
});

const tableFields = [
  {
    key: 'user',
    label: i18n.global.t('common.user.user'),
    sortable: true,
  },
  {
    key: 'policyRule',
    label: i18n.global.t('governance.violations.rule'),
    sortable: true,
  },
  {
    key: 'created',
    label: i18n.global.t('common.created'),
    sortable: true,
    class: 'w-150px',
  },
  {
    key: 'actions',
    class: props.isAdmin ? 'w-120px' : '',
    label: '',
  },
];

const items = computed(() => {
  if (!props.tableRows?.length) return [];
  return props.tableRows.map((violation) => {
    // TODO: can remove this check and only use violation.decision.startDate
    // when IGA-2822 is complete
    const created = violation.decision?.violation
      ? violation.decision?.violation.startDate
      : violation.decision?.startDate;
    return {
      user: violation.user,
      policyRule: violation.policyRule,
      created,
      id: violation.id,
      phaseId: violation.decision?.violation?.phases[0]?.name,
      rawData: violation,
    };
  });
});

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

  if (targetFilter.status === 'pending') {
    filterPayload.operand.push({
      operator: 'OR',
      operand: [
        getBasicFilter('EQUALS', 'decision.violation.status', targetFilter.status),
        getBasicFilter('EQUALS', 'decision.violation.status', 'in-progress'),
      ],
    });
  } else {
    filterPayload.operand.push(getBasicFilter('EQUALS', 'decision.violation.status', targetFilter.status));
  }

  if (targetFilter.rule.length) {
    filterPayload.operand.push(getBasicFilter('EQUALS', 'policyRule.id', targetFilter.rule));
  }

  if (targetFilter.user && targetFilter.user !== 'managed/user/all') {
    const id = targetFilter.user.split('/').pop();
    filterPayload.operand.push(getBasicFilter('EQUALS', 'user.userId', id));
  }

  if (targetFilter.startDate.length) {
    let startDate = dayjs(targetFilter.startDate).toISOString().split('.')[0];
    startDate = `${startDate}+00:00`;
    filterPayload.operand.push(getBasicFilter('GTE', 'decision.violation.startDate', startDate));
  }

  if (targetFilter.endDate.length) {
    let endDate = dayjs(targetFilter.endDate).toISOString().split('.')[0];
    endDate = `${endDate}+00:00`;
    filterPayload.operand.push(getBasicFilter('LTE', 'decision.violation.startDate', endDate));
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
    fields: 'id,user,policyRule,decision',
  };
  const sortKeyMap = {
    user: 'user.userName',
    policyRule: 'policyRule.name',
    created: 'decision.violation.startDate',
  };
  searchParams.sortKeys = sortKeyMap[sortBy.value];

  emit('handle-search', searchParams, targetFilter);
}

/**
 * Forward a violation to a new user, with an optional comment
 * @param {String} actorId actor to forward to
 * @param {String} comment comment
 */
async function forwardItem({ actorId, comment }) {
  try {
    if (!itemToForward?.value?.rawData?.decision?.violation?.phases?.length) return;
    const phaseId = itemToForward.value.rawData.decision.violation.phases[0].name;
    const permissions = {
      allow: true,
      comment: true,
      exception: true,
      reassign: true,
      remediate: true,
    };
    await forwardViolation(itemToForward.value.id, phaseId, actorId, permissions, comment);
    displayNotification('success', i18n.global.t('governance.violations.successForwardingViolation'));
    getData(filters.value);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorForwardingViolation'));
  }
}

/**
 * Open forward modal
 * @param {Object} item violation to forward
 */
function openForwardModal(item) {
  itemToForward.value = item;
  bvModal.value.show('violation-forward-modal');
}

/**
 * Convert date into user friendly format
 * @param {String} date date string
 * @returns {String} user friendly date string
 */
function convertDate(date) {
  return dayjs(date).format('MMM D, YYYY');
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
 * Opens exception modal
 * @param {Object} item selected item information
 */
function openExceptionModal(item) {
  selectedViolation.value = item;
  bvModal.value.show('ExceptionModal');
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
    displayNotification('success', i18n.global.t('governance.violations.successAllowingException'));
    getData(filters.value);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorAllowingException'));
  }
}

getData(filters.value);

</script>

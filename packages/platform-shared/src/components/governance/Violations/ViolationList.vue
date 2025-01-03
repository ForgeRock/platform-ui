<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

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
      @input="handleFilterChange"
      @open-columns-modal="openColumnsModal" />
    <BTable
      @row-clicked="$emit('viewViolationDetails', $event)"
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
      :fields="violationColumnsToShow"
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
      <template #cell(reviewers)="{ item }">
        <div
          v-if="item.reviewers.length"
          @click.stop="clickReviewersRow(item)">
          <FrAvatarGroup
            :id="item.id"
            :users="item.reviewers" />
        </div>
        <div v-else>
          {{ blankValueIndicator }}
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
        <div
          v-if="!isComplete"
          class="d-flex justify-content-end">
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
              @click="$emit('revoke-violation', item)"
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
            v-if="item.status !== 'pending'"
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
    <FrColumnOrganizer
      @update-columns="updateColumns"
      :active-columns="violationColumns"
      :available-columns="columnCategories"
      :is-testing="isTesting" />
    <!-- Forward Modal -->
    <FrViolationForwardModal
      @forward-item="forwardItem" />
    <ExceptionModal
      :violation="selectedViolation"
      @action="extendException"
      @view-violation-details="$emit('viewViolationDetails', selectedViolation)" />
    <FrViolationReviewersModal
      :violation="selectedViolation"
      @hidden="closeReviewersModal" />
  </BCard>
</template>

<script setup>
/**
 * List of SOD violations. Can filter by status, policy rule, user, and date range.
 */
import { computed, ref, watch } from 'vue';
import {
  BCard,
  BDropdown,
  BDropdownItem,
  BTable,
  BButton,
} from 'bootstrap-vue';
import {
  cloneDeep,
  groupBy,
  some,
} from 'lodash';
import dayjs from 'dayjs';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { forwardViolation, allowException } from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import ExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionModal';
import FrAvatarGroup from '@forgerock/platform-shared/src/components/AvatarGroup/AvatarGroup';
import FrColumnOrganizer from '@forgerock/platform-shared/src/components/ColumnOrganizer/ColumnOrganizer';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrViolationForwardModal from '@forgerock/platform-shared/src/components/governance/Violations/ViolationForwardModal';
import FrViolationReviewersModal from '@forgerock/platform-shared/src/components/governance/Violations/ViolationReviewersModal';
import FrViolationToolbar from '@forgerock/platform-shared/src/components/governance/Violations/ViolationToolbar';
import i18n from '@/i18n';
import store from '@/store';

// composables
const { bvModal } = useBvModal();

const emit = defineEmits(['get-policy-rule-options', 'handle-search', 'viewViolationDetails', 'revoke-violation']);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  searchInputPlaceholder: {
    type: String,
    default: i18n.global.t('common.search'),
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
});

const currentPage = ref(1);
const itemToForward = ref({});
const pageSize = ref(10);
const selectedViolation = ref({});
const sortBy = ref('created');
const sortDesc = ref(true);

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
    category: 'user',
    label: i18n.global.t('common.user.user'),
    show: true,
    sortable: true,
  },
  {
    key: 'reviewers',
    category: 'user',
    label: i18n.global.t('common.reviewers'),
    show: true,
  },
  {
    key: 'policyRule',
    category: 'rule',
    label: i18n.global.t('governance.violations.rule'),
    show: true,
    sortable: true,
  },
  {
    key: 'created',
    category: 'violation',
    class: 'w-150px',
    label: i18n.global.t('common.created'),
    show: true,
    sortable: true,
  },
  {
    key: 'actions',
    class: props.isAdmin ? 'w-120px' : '',
    label: '',
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

const tableFieldsEnduser = tableFields.filter((col) => col.key !== 'reviewers');
const categoriesEnduser = categories.map((category) => ({
  ...category,
  items: category.items.filter((item) => item.key !== 'reviewers'),
}));

const violationColumns = props.isAdmin ? ref(tableFields) : ref(tableFieldsEnduser);
const columnCategories = props.isAdmin ? ref(categories) : ref(categoriesEnduser);

const violationColumnsToShow = computed(() => violationColumns.value.filter((col) => col.show));
const isComplete = computed(() => filters.value.status === 'complete');

const items = computed(() => {
  if (!props.tableRows?.length) return [];
  return props.tableRows.map((violation) => ({
    created: violation.decision?.startDate,
    id: violation.id,
    phaseId: violation.decision?.phases?.[0]?.name,
    policyRule: violation.policyRule,
    rawData: violation,
    reviewers: violation.decision?.actors?.active || [],
    status: violation.decision?.status,
    user: violation.user,
  }));
});

// show/hide the reviewers column according to the status filter
watch(() => filters.value.status, (newStatus) => {
  // if it is enduser no change is made
  if (!props.isAdmin) return;

  // on the other hand, verify the change to pending or completed
  const columnsClone = cloneDeep(violationColumns.value);
  const categoriesClone = cloneDeep(columnCategories.value);
  const hasReviewersCategory = some(categoriesClone, (section) => some(section.items, { key: 'reviewers' }));
  if (newStatus === 'complete') {
    // hide reviewers column for completed violations
    violationColumns.value = columnsClone.filter((col) => col.key !== 'reviewers');
    columnCategories.value = categoriesClone.map((category) => ({
      ...category,
      items: category.items.filter((item) => item.key !== 'reviewers'),
    }));
  } else {
    // add the reviewers category only if it was previously removed
    if (hasReviewersCategory) return;
    const reviewersColumn = {
      key: 'reviewers',
      category: 'user',
      label: i18n.global.t('common.reviewers'),
      show: true,
    };
    columnsClone.splice(1, 0, reviewersColumn);
    violationColumns.value = columnsClone;
    const userSection = categoriesClone.find((category) => category.name === 'user');
    userSection.items.push(reviewersColumn);
    columnCategories.value = categoriesClone;
  }
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
        getBasicFilter('EQUALS', 'decision.status', targetFilter.status),
        getBasicFilter('EQUALS', 'decision.status', 'in-progress'),
      ],
    });
  } else {
    filterPayload.operand.push(getBasicFilter('EQUALS', 'decision.status', targetFilter.status));
  }

  if (targetFilter.rule.length) {
    filterPayload.operand.push(getBasicFilter('EQUALS', 'policyRule.id', targetFilter.rule));
  }

  if (targetFilter.user && targetFilter.user !== 'managed/user/all') {
    const id = targetFilter.user.split('/').pop();
    filterPayload.operand.push(getBasicFilter('EQUALS', 'user.id', id));
  }

  if (targetFilter.startDate.length) {
    let startDate = dayjs(targetFilter.startDate).toISOString().split('.')[0];
    startDate = `${startDate}+00:00`;
    filterPayload.operand.push(getBasicFilter('GTE', 'decision.startDate', startDate));
  }

  if (targetFilter.endDate.length) {
    let endDate = dayjs(targetFilter.endDate).add(1, 'day').toISOString().split('.')[0];
    endDate = `${endDate}+00:00`;
    filterPayload.operand.push(getBasicFilter('LTE', 'decision.startDate', endDate));
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
    _pageSize: pageSize.value,
    _pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    _sortDir: sortDesc.value ? 'desc' : 'asc',
    _fields: 'id,user,policyRule,decision',
  };

  // enduser violation search must include actorStatus=inactive for complete violations
  if (filterObj.status === 'complete' && !props.isAdmin) {
    searchParams.actorStatus = 'inactive';
  }

  const sortKeyMap = {
    user: 'user.userName',
    policyRule: 'policyRule.name',
    created: 'decision.startDate',
  };
  searchParams._sortKeys = sortKeyMap[sortBy.value];

  emit('handle-search', searchParams, targetFilter);
}

/**
 * Forward a violation to a new user, with an optional comment
 * @param {String} actorId actor to forward to
 * @param {String} comment comment
 */
async function forwardItem({ actorId, comment }) {
  try {
    if (!itemToForward?.value?.rawData?.decision?.phases?.length) return;
    const phaseId = itemToForward.value.rawData.decision.phases[0].name;
    const permissions = {
      allow: true,
      comment: true,
      exception: true,
      reassign: true,
      remediate: true,
    };
    await forwardViolation(itemToForward.value.id, phaseId, actorId, permissions, comment);
    store.commit('setViolationsCount', store.state.violationsCount - 1);
    displayNotification('success', i18n.global.t('governance.violations.successForwardingViolation'));
    getData(filters.value);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorForwardingViolation'));
  }
}

/**
 * Updates the columns of the list in their corresponding order
 * @param {Object} columns all the information on the columns and their categories
 * @param {Array} columns.activeColumns active columns to be displayed
 * @param {Array} columns.availableColumns available columns separated by category
 */
function updateColumns({ activeColumns, availableColumns }) {
  violationColumns.value = activeColumns || cloneDeep(tableFields);
  columnCategories.value = availableColumns || cloneDeep(categories);
}

/**
 * Opens column organizer modal
 */
function openColumnsModal() {
  bvModal.value.show('ColumnOrganizerModal');
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
 * Open reviewers modal
 * @param {Object} item violation clicked
 */
function openReviewersModal(item) {
  selectedViolation.value = item;
  bvModal.value.show('ViolationReviewersModal');
}

/**
 * Restore selected violation on reviewers modal close
 */
function closeReviewersModal() {
  selectedViolation.value = {};
}

/**
 * Determines what action to take when clicking on Reviewers row
 * @param {Object} item violation clicked
 */
function clickReviewersRow(item) {
  // if click on an item with more than one reviewer, open reviewers modal
  if (item.reviewers.length > 1) {
    openReviewersModal(item);
  } else {
    // otherwise view will be redirected to the Violation details
    emit('viewViolationDetails', item);
  }
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
  currentPage.value = 1;
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
    // if the violation is allowed forever, it will be removed from the list
    if (!payload.exceptionExpirationDate) {
      store.commit('setViolationsCount', store.state.violationsCount - 1);
    }
    displayNotification('success', i18n.global.t('governance.violations.successAllowingException'));
    getData(filters.value);
    bvModal.value.hide('ExceptionModal');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorAllowingException'));
  }
}

getData(filters.value);

</script>

<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <FrAccessModelingList
      :is-loading="isLoading"
      :list-name="title"
      :role-status="status"
      :roles="roles"
      :sort-params="sortParams"
      @sort-change="handleSortChanged"
      @open-detail="$emit('navigate-to-details', $event)">
      <template #header>
        <FrRoleToolbar
          :sort-by-options="sortByOptions"
          hide-status-filter
          :hide-search-filter="false"
          :num-filters="numFilters"
          :status-options="statusOptions"
          @filter-change="updateRoleFilters($event)" />
      </template>
      <template #no-data>
        <FrNoData
          class="mb-4 border-top"
          icon="person_add"
          :card="false"
          :subtitle="$t('governance.accessModeling.noResults', { status })" />
      </template>
      <template #actions="{ item }">
        <FrActionsCell
          class="mr-3"
          :item="item"
          :status="status"
          @delete-clicked="handleDelete(item)"
          @edit-clicked="handleAction(item)" />
      </template>
    </FrAccessModelingList>
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
    @update-list="loadRoles()" />
  <FrDeleteModal
    id="modal-delete"
    :is-deleting="isDeleting"
    :translated-item-type="$t('common.role')"
    :custom-message="$t('common.deleteRole')"
    @delete-item="deleteItem()" />
</template>

<script setup>
import {
  BCard,
} from 'bootstrap-vue';
import { ref } from 'vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { deleteRole } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import {
  sortByOptions,
} from '@forgerock/platform-shared/src/utils/governance/accessModeling';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrRoleToolbar from '@forgerock/platform-shared/src/components/governance/RoleToolbar';
import FrAccessModelingList from '@forgerock/platform-shared/src/components/governance/AccessModeling/AccessModelingList';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import i18n from '@/i18n';

/**
 * Displays the list of roles and the corresponding filters.
 * @component AccessModelingTable
 */

defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
  numFilters: {
    type: Number,
    default: 0,
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
});

// Emits
const emit = defineEmits(['load-roles', 'navigate-to-details']);

// Composables
const { bvModal } = useBvModal();

// Data
const currentPage = ref(1);
const modalItem = ref({});
const modalType = ref(REQUEST_MODAL_TYPES.CANCEL);
const searchFilters = ref(null);
const sortParams = ref({
  sortKeys: 'name',
  sortDir: 'asc',
});
const pageSize = ref(10);
const pagedResultsOffset = ref(0);
const sortDir = ref('asc');
const sortKeys = ref('name');
const status = ref('active');
const isDeleting = ref(false);
const statusOptions = ref([
  {
    text: i18n.global.t('governance.status.candidate'),
    value: 'candidate',
  },
  {
    text: i18n.global.t('governance.status.draft'),
    value: 'draft',
  },
]);

/**
 * Get current roles based on query params and target filter
 */
async function loadRoles(queryFilter = {}) {
  const params = {
    pagedResultsOffset: pagedResultsOffset.value,
    pageSize: pageSize.value,
    sortKeys: sortKeys.value,
    sortDir: sortDir.value,
  };
  if (sortKeys.value === 'date') params.sortType = 'date';
  emit('load-roles', params, queryFilter);
}

/**
 * Get current roles based on query params and target filter
 */
async function handleSortChanged(sort) {
  currentPage.value = 1;
  sortKeys.value = sort.sortBy;
  sortDir.value = sort.sortDesc ? 'desc' : 'asc';
  const newSortParams = {
    pagedResultsOffset: (currentPage.value - 1) * pageSize.value,
    sortKeys: sort.sortBy,
    sortDir: sort.sortDesc ? 'desc' : 'asc',
  };
  sortParams.value = newSortParams;
  emit('load-roles', newSortParams, searchFilters.value);
}

/**
 * Handles the specified action for a given item.
 * @param {Object} item - The role on which the action is to be performed.
 */
function handleAction(item) {
  emit('navigate-to-details', item);
}

/**
 * Show the delete confirmation modal for the specified item.
 * @param {Object} item - The role to delete.
 */
function handleDelete(item) {
  modalItem.value = item;
  bvModal.value.show('modal-delete');
}

/**
 * Delete the specified role.
 */
async function deleteItem() {
  isDeleting.value = true;
  try {
    await deleteRole(modalItem.value.id, modalItem.value.status);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.deleteObject', { object: 'role' }));
  } finally {
    isDeleting.value = false;
    displayNotification('success', i18n.global.t('governance.accessModeling.deleteSuccess', { object: modalItem.value.name }));
    await loadRoles();
    bvModal.value.hide('modal-delete');
  }
}

/**
 * Handles filtering roles as well as updates to pagination
 * @param {Object} property updated property
 */
function filterHandler(property) {
  const [key, value] = Object.entries(property)[0];
  if (key === 'currentPage') {
    currentPage.value = value;
    pagedResultsOffset.value = (value - 1) * pageSize.value;
  } else if (key === 'pageSize') {
    pageSize.value = property.pageSize;
    pagedResultsOffset.value = 0;
    currentPage.value = 1;
  }
  loadRoles(searchFilters.value);
}

/**
 * Handles updates to the role filters modal
 * @param {Object} property updated property
 */
function updateRoleFilters(filters) {
  searchFilters.value = filters;
  loadRoles(filters);
}
</script>

<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <BCardHeader class="p-0 border-bottom-0 flex-column flex-lg-row">
      <BButtonToolbar class="justify-content-between">
        <BButton
          variant="primary"
          @click="bvModal.show('addMembersToEntitlementModal')">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('common.addObject', { object: $t('governance.administer.roles.members') }) }}
          </FrIcon>
        </BButton>
        <BButton
          v-show="selected.length > 0"
          class="ml-2"
          variant="outline-primary"
          @click="showRemoveModal()">
          {{ $t('common.revoke') }}
        </BButton>
        <FrSearchInput
          v-model="searchValue"
          class="ml-auto"
          @clear="search('')"
          @search="search(searchValue)" />
      </BButtonToolbar>
    </BCardHeader>
    <BTable
      :ref="(el) => grid = el"
      class="mb-0"
      responsive
      show-empty
      :busy="isLoading || isSaving"
      :empty-text="$t('common.noObjectFound', { object: $t('common.users') })"
      :fields="columns"
      :items="items"
      selectable
      @row-selected="onRowSelected">
      <template #table-busy>
        <div class="text-center text-danger p-3">
          <FrSpinner />
        </div>
      </template>
      <template #head(selected)>
        <div
          v-if="!isLoading && !isSaving"
          class="cursor-pointer"
          @click="toggleSelectAll">
          <BFormCheckbox
            class="pl-3"
            disabled
            v-model="allRowsSelected">
            <span class="sr-only">
              {{ $t('common.select') }}
            </span>
          </BFormCheckbox>
        </div>
      </template>
      <template #cell(selected)="data">
        <BFormCheckbox
          class="pl-3"
          :id="`rowSelectCheckbox_user_${data.index}`"
          @change="onCheckboxClicked(data)"
          v-model="data.rowSelected">
          <span class="sr-only">
            {{ $t('common.selectSelection', { selection: data.item.name || '' }) }}
          </span>
        </BFormCheckbox>
      </template>
      <template #cell(name)="{ item }">
        <FrUserBasicInfo
          v-if="item.user"
          :pic-dimension="28"
          :user="item.user" />
        <template v-else>
          {{ blankValueIndicator }}
        </template>
      </template>
      <template #cell(account)="{ item }">
        {{ item.descriptor?.idx?.['/account']?.displayName || blankValueIndicator }}
      </template>
      <template #cell(actions)="{ item }">
        <FrActionsCell
          :divider="false"
          :edit-option="false"
          :delete-option="false">
          <template #custom-top-actions>
            <BDropdownItem @click="showRemoveModal(item)">
              <FrIcon
                icon-class="mr-2"
                name="delete">
                {{ $t('common.revoke') }}
              </FrIcon>
            </BDropdownItem>
          </template>
        </FrActionsCell>
      </template>
    </BTable>
    <FrPagination
      :value="currentPage"
      :per-page="currentPageSize"
      :total-rows="totalRows"
      @input="pageChange($event)"
      @on-page-size-change="pageSizeChange($event)" />
    <BModal
      cancel-variant="link"
      id="addMembersToEntitlementModal"
      no-close-on-backdrop
      no-close-on-esc
      title-class="h5"
      title-tag="h2"
      :ok-disabled="newMembers.length === 0"
      :ok-title="$t('common.save')"
      ref="addMembersToEntitlementModal"
      :static="isTesting"
      :title="$t('common.addObject', { object: $t('governance.administer.roles.members') })"
      size="lg"
      @ok="updateEntitlementMembers('add')">
      <FrRelationshipEdit
        v-if="relationshipArrayProperty"
        parent-resource="managed/alpha_role"
        :relationship-property="relationshipArrayProperty"
        :show-time-constraints-switch="false"
        :index="0"
        @setValue="onSelectAdditionalMembers" />
    </BModal>
    <BModal
      id="removeMembersModal"
      ref="removeMembersModal"
      no-close-on-backdrop
      no-close-on-esc
      title-class="h5"
      title-tag="h2"
      cancel-variant="outline-secondary"
      ok-variant="danger"
      :static="isTesting"
      :ok-title="$t('common.revoke')"
      :title="$t('pages.access.removeModalTitle')"
      @cancel="hideRemoveModal()"
      @ok="updateEntitlementMembers('remove')">
      <div>
        {{ $t('pages.access.removeConfirm', { type: $t('common.users') }) }}
      </div>
    </BModal>
    <FrRequestSubmitSuccessModal
      :request-id="requestId[0]"
      router-path="AdministerEntitlements"
      :success-text="$t('governance.entitlements.modifyMembersSuccess')" />
  </BCard>
</template>

<script setup>
import {
  ref,
  computed,
} from 'vue';
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BDropdownItem,
  BModal,
  BTable,
} from 'bootstrap-vue';
import { find, map } from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getEntitlementUsers } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrRequestSubmitSuccessModal from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccessModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import i18n from '@/i18n';

const { bvModal } = useBvModal();

const props = defineProps({
  entitlementId: {
    type: String,
    required: true,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const grid = ref(null);
const allRowsSelected = ref(false);
const currentPage = ref(1);
const currentPageSize = ref(10);
const isLoading = ref(false);
const isSaving = ref(false);
const items = ref([]);
const newMembers = ref([]);
const queryFields = ['user.givenName', 'user.sn', 'user.userName', 'descriptor.idx./account.displayName'];
const relationshipArray = ref([]);
const removeMembersModal = ref(null);
const requestId = ref('');
const searchValue = ref('');
const selected = ref([]);
const totalRows = ref(0);
const columns = [
  {
    key: 'selected',
    label: '',
    class: 'checkbox-column',
  },
  {
    key: 'name',
    label: i18n.global.t('common.name'),
  },
  {
    key: 'account',
    label: i18n.global.t('common.account'),
  },
  {
    key: 'actions',
    label: '',
    class: 'w-70px fr-no-resize sticky-right',
  },
];

const relationshipArrayProperty = computed(() => find(relationshipArray.value, (schema) => schema.propName === 'members'));

/**
 * Get the role glossary schema.
 */
async function getSchemaData() {
  try {
    // get glossary schema and values
    const roleData = await getSchema('managed/alpha_role');
    relationshipArray.value = map(roleData?.data.properties, (prop, key) => ({
      ...prop,
      propName: key,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.glossaryError'));
  }
}

/**
 * Retrieves query parameters for a given query string, page number, and page size.
 * @param {string} queryString - The query string to be parsed.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of items per page.
 * @returns {Object} An object containing the parsed query parameters.
 */
function getQueryParams(queryString, page, pageSize) {
  const queryParams = {};
  queryParams.pageSize = pageSize;
  queryParams.pagedResultsOffset = (page - 1) * pageSize;
  queryParams.queryFilter = queryString
    ? queryFields.map((field) => `${field} co "${queryString}"`).join(' or ')
    : true;
  return queryParams;
}

/**
 * Load the list of users for an entitlement
 */
async function loadUsers() {
  isLoading.value = true;
  try {
    await getSchemaData();
    const { data } = await getEntitlementUsers(props.entitlementId, getQueryParams(searchValue.value, currentPage.value, currentPageSize.value));
    items.value = data.result;
    totalRows.value = data.totalCount;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.errorRetrievingResources', { resource: i18n.global.t('common.users') }));
    items.value = [];
    totalRows.value = 0;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handle checkbox click to select row.
 * @param {Object} row - The row with the selected checkbox.
 */
function onCheckboxClicked(row) {
  if (row.rowSelected) {
    grid.value.selectRow(row.index);
  } else {
    grid.value.unselectRow(row.index);
  }
}

/**
 * Handle row selection.
 * @param {Array} selectedItems - The selected row items.
 */
function onRowSelected(selectedItems) {
  selected.value = selectedItems;
  allRowsSelected.value = selectedItems.length === items.value.length;
}

/**
 * Handle selecting all rows.
 */
function toggleSelectAll() {
  if (!allRowsSelected.value) {
    grid.value.selectAllRows();
  } else {
    grid.value.clearSelected();
  }
}

/**
 * Handle selecting additional members
 * @param {Array} val - The array of selected users.
 */
async function onSelectAdditionalMembers(val) {
  if (!val || val.length === 0) {
    newMembers.value = [];
    return;
  }
  try {
    const userFilter = val.map((user) => `_id eq '${user._ref.split('/').pop()}'`).join(' or ');
    const params = {
      _queryFilter: userFilter,
      fields: 'userName,sn,givenName,profileImage,_id',
      sortKeys: 'userName',
    };
    const { data } = await getManagedResourceList('alpha_user', params);
    newMembers.value = data?.result?.map((user) => ({
      ...user,
      usr_id: user._id,
      usr_name: `${user.givenName} ${user.sn}`,
    })) || [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.errorRetrievingResources', { resource: i18n.global.t('common.users') }));
    newMembers.value = [];
  }
}

/**
 * Show the remove users confirmation modal.
 * @param {Object} item - The table row with the user to remove.
 */
function showRemoveModal(item) {
  if (item) {
    selected.value = [item];
  }
  removeMembersModal.value.show();
}

/**
 * Hide the remove users confirmation modal.
 */
function hideRemoveModal() {
  selected.value = [];
  grid.value.clearSelected();
  removeMembersModal.value.hide();
}

/**
 * Update members of the entitlement.
 * @param {string} operation - The operation to perform ('add' or 'remove').
 */
async function updateEntitlementMembers(operation) {
  const userStore = useUserStore();
  isSaving.value = true;
  let users = map(selected.value, (item) => item.user.id);
  const requestType = operation === 'add' ? 'entitlementGrant' : 'entitlementRemove';
  if (operation === 'add') {
    users = newMembers.value.map((member) => member._id);
    newMembers.value = [];
  }
  const payload = {
    common: {
      entitlementId: props.entitlementId,
    },
  };

  if (userStore.adminUser) {
    payload.common.context = {
      type: 'admin',
    };
  }
  try {
    const successIds = [];
    await Promise.all(map(users, async (userId) => {
      const userPayload = {
        common: {
          ...payload.common,
          userId,
        },
      };
      const { data } = await requestAction(requestType, 'publish', null, userPayload);
      successIds.push(data.id);
    }));
    requestId.value = successIds;
    bvModal.value.show('successful-submit');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.entitlements.errorSubmittingRequest'));
  } finally {
    isSaving.value = false;
    if (operation === 'remove') {
      hideRemoveModal();
    }
  }
}

/**
 * Searches for users based on the provided query.
 * @param {string} query - The search query to filter resources.
 */
function search(query) {
  searchValue.value = query;
  loadUsers();
}

/**
 * Handles the change in page
 * @param {number} pageNum - The new page number selected by the user.
 */
function pageChange(pageNum) {
  currentPage.value = pageNum;
  loadUsers();
}

/**
 * Handles the change in page size
 * @param {number} size - The new page size selected by the user.
 */
function pageSizeChange(size) {
  currentPageSize.value = size;
  loadUsers();
}

loadUsers();
</script>

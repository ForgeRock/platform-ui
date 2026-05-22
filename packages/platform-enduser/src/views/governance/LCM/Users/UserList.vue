<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="my-5">
    <FrHeader
      class="mb-4"
      :title="$t('governance.administer.users.title')"
      :subtitle="$t('governance.administer.users.subtitle')" />
    <FrGovResourceList
      v-if="activeColumns.length && queryFields.length"
      class="mb-5"
      resource="user"
      :columns="activeColumns"
      :query-fields="queryFields"
      :resource-function="getManagedResourceList"
      :custom-filter="customUserFilter"
      :show-add-button="allowCreate"
      :query-threshold="queryThreshold"
      @row-clicked="navigateToUserDetails"
      @add-clicked="showAddUserModal"
      @delete-clicked="showDeleteModal">
      <template #toolbar-right>
        <BButton
          class="ml-2 toolbar-link-text"
          variant="link"
          @click="openColumnsModal">
          <FrIcon
            icon-class="md-24"
            name="view_column" />
        </BButton>
      </template>
      <template #cell(name)="{ item }">
        <FrUserBasicInfo
          :pic-dimension="28"
          :user="item" />
      </template>
      <template #cell(manager)="{ item }">
        <FrUserBasicInfo
          v-if="item.manager"
          :pic-dimension="28"
          :user="item.manager" />
      </template>
      <template #cell(email)="{ item }">
        {{ item.mail }}
      </template>
      <template #cell(status)="{ item }">
        <BBadge
          class="w-100px"
          :variant="item.accountStatus === 'active' ? 'success' : 'light'">
          {{ $t(item.accountStatus === 'active' ? 'common.active' : 'common.inactive') }}
        </BBadge>
      </template>
    </FrGovResourceList>
    <FrColumnPicker
      v-bind="pickerProps"
      :available-columns="tableFields" />
    <FrAddUserModal />
    <FrDeleteUserModal
      :user-id="deleteUserId" />
  </BContainer>
</template>

<script setup>
/**
 * This component is used to display the entitlements list.
 * Supports searching and pagination
 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BBadge,
  BContainer,
} from 'bootstrap-vue';
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';
import { has } from 'lodash';
import FrGovResourceList from '@forgerock/platform-shared/src/components/governance/GovResourceList';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getPrivileges } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useGovernanceStore } from '@forgerock/platform-shared/src/stores/governance';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import store from '@/store';
import FrAddUserModal from './Add/AddUserModal';
import FrDeleteUserModal from './Delete/DeleteUserModal';
import i18n from '@/i18n';

// composables
const router = useRouter();
const { bvModal } = useBvModal();
const { userId } = useUserStore();
const { setPrivileges, privileges } = useGovernanceStore();
const userAgentProperty = store.state.govAgentProperty;
const customUserFilter = computed(() => (userAgentProperty ? `!(${userAgentProperty} eq 'agent')` : null)); // Filter out a subset of users automatically

// data
const allowCreate = ref(false);
const deleteUserId = ref(null);
const filterSchemaFields = ref([]);
const userViewPrivileges = ref([]);
const queryThreshold = ref(0);
const availableColumns = [
  {
    column: {
      key: 'name',
      label: i18n.global.t('common.name'),
      initialSort: true,
      sortable: true,
      sortKey: 'givenName',
    },
    permissions: ['userName', 'givenName', 'sn'],
  },
  {
    column: {
      key: 'email',
      label: i18n.global.t('common.email'),
      sortable: true,
      sortKey: 'mail',
    },
    permissions: ['mail'],
  },
  {
    column: {
      key: 'status',
      label: i18n.global.t('common.status'),
      class: 'w-250px',
      sortable: true,
      sortKey: 'accountStatus',
    },
    permissions: ['accountStatus'],
  },
];

/**
 * Displays a modal dialog to confirm the deletion of a user.
 * @param {Object} user - The user object containing details of the user to be deleted.
 */
function showDeleteModal(user) {
  deleteUserId.value = user._id;
  bvModal.value.show('delete-user-modal');
}

/**
 * Displays the modal for adding a new user.
 */
function showAddUserModal() {
  bvModal.value.show('add-user-modal');
}

/**
 * Navigates to the details page of the specified user.
 * @param {Object} user - The user object containing details to navigate to.
 */
function navigateToUserDetails(user) {
  router.push({
    name: 'UserDetails',
    params: { userId: user._id },
  });
}

/**
 * Checks if the current user has the required privilege for a specific field.
 *
 * @param {string} field - The name of the field to check privileges for.
 * @returns {boolean} - Returns true if the user has the privilege, otherwise false.
 */
function hasPrivilege(field) {
  return userViewPrivileges.value.indexOf(field) > -1;
}

const columnsWithPermissions = computed(() => availableColumns.map((column) => {
  if (column.permissions.every((permission) => hasPrivilege(permission))) {
    return column;
  }
  return null;
}).filter((column) => column !== null));

const tableFields = computed(() => {
  const columns = columnsWithPermissions.value.map((column) => column.column);

  columns.push(...filterSchemaFields.value);

  columns.push({
    key: 'actions',
    label: i18n.global.t('common.actions'),
    class: 'w-120px fr-no-resize sticky-right',
  });

  return columns;
});

const {
  activeColumns,
  open: openColumnsModal,
  pickerProps,
} = useColumnPicker(
  () => tableFields.value,
  {
    storageKey: () => 'governance-users-column-picker',
    defaultColumns: () => tableFields.value.filter(
      (col) => col.key === 'actions' || columnsWithPermissions.value.some((c) => c.column.key === col.key),
    ),
  },
);

const queryFields = computed(() => {
  const fields = [];

  columnsWithPermissions.value.forEach((column) => {
    column.permissions.forEach((permission) => {
      fields.push(permission);
    });
  });

  activeColumns.value.forEach((column) => {
    const schemaField = filterSchemaFields.value.find((f) => f.key === column.key);
    if (schemaField) {
      if (schemaField.type === 'managedObject') {
        fields.push(column.key, `${column.key}/*`);
      } else {
        fields.push(column.key);
      }
    }
  });

  return fields;
});

/**
 * Fetches the list of privileges for the user from IDA and IGA.
 * IDM permissions are used to determine the columns to be displayed in the user list.
 * IGA permissions are used to determine if the user can create a new user.
 */
async function getIdmAndIgaPrivileges() {
  try {
    const [, { data: privilegesData }] = await Promise.all([
      setPrivileges('managed/alpha_user'),
      getPrivileges(userId),
    ]);
    userViewPrivileges.value = privileges['managed/alpha_user'].VIEW?.allowed
      ? privileges['managed/alpha_user'].VIEW.properties || []
      : [];
    if (privilegesData.permissions.includes('createUser')) allowCreate.value = true;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.user.errorGettingPrivileges'));
  }
}

/**
 * Fetches the filter schema and populates filterSchemaFields with the fields
 * the current user has permission to view.
 */
async function loadFilterSchemaFields() {
  try {
    const { data: schemaData } = await getFilterSchema();
    filterSchemaFields.value = (schemaData.user || [])
      .filter((field) => ((field.type !== 'managedObject' && field.type !== 'object') || field.name === 'manager') && !field.isMultiValue && userViewPrivileges.value.includes(field.name))
      .map((field) => ({ key: field.name, label: field.displayName, type: field.type }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.user.errorGettingSchema'));
  }
}

/**
 * Gets the minimumUIFilterLength setting from uiConfig and if no setting exists there does a _countOnly query
 * on the specified managed object then if the number of records exceeds 1000 the minimumUIFilterLength is set to 3
 * else it is set to 0.
 *
 * @param {string} managedObjectName - Required name of managed object to get minimumUIFilterLength for
 * @returns {number} number representing minimumUIFilterLength
 */
async function getMinimumUIFilterLength(managedObjectName) {
  const defaultMinimumUIFilterLength = 3;
  const { uiConfig } = store.state.SharedStore;
  queryThreshold.value = uiConfig && has(uiConfig.configuration?.platformSettings?.managedObjectsSettings, `${managedObjectName}.minimumUIFilterLength`) ? uiConfig.configuration.platformSettings.managedObjectsSettings[managedObjectName].minimumUIFilterLength : defaultMinimumUIFilterLength;
}

getIdmAndIgaPrivileges().then(loadFilterSchemaFields);
getMinimumUIFilterLength('alpha_user');

</script>

<style lang="scss" scoped>
:deep {
  .w-70px {
    width: 70px;
  }
}

.toolbar-link-text {
  color: $gray-900;
}
</style>

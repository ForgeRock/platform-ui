<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5 p-2">
    <FrHeader
      class="mb-4"
      :title="$t('governance.administer.users.title')"
      :subtitle="$t('governance.administer.users.subtitle')" />
    <FrGovResourceList
      v-if="userColumns.length && queryFields.length"
      class="mb-5"
      resource="user"
      :columns="userColumns"
      :query-fields="queryFields"
      :resource-function="getManagedResourceList"
      :show-add-button="allowCreate"
      @row-clicked="navigateToUserDetails"
      @add-clicked="showAddUserModal"
      @delete-clicked="showDeleteModal">
      <template #cell(name)="{ item }">
        <FrUserBasicInfo
          :pic-dimension="28"
          :user="item" />
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
import FrGovResourceList from '@forgerock/platform-shared/src/components/governance/GovResourceList';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getPrivileges } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useGovernanceStore } from '@forgerock/platform-shared/src/stores/governance';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAddUserModal from './Add/AddUserModal';
import FrDeleteUserModal from './Delete/DeleteUserModal';
import i18n from '@/i18n';

// composables
const router = useRouter();
const { bvModal } = useBvModal();
const { userId } = useUserStore();
const { setPrivileges, privileges } = useGovernanceStore();

// data
const allowCreate = ref(false);
const deleteUserId = ref(null);
const userViewPrivileges = ref([]);
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

const userColumns = computed(() => {
  const columns = columnsWithPermissions.value.map((column) => column.column);

  columns.push({
    key: 'actions',
    label: '',
    class: 'w-70px',
  });

  return columns;
});

const queryFields = computed(() => {
  const fields = [];

  columnsWithPermissions.value.forEach((column) => {
    column.permissions.forEach((permission) => {
      fields.push(permission);
    });
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
    await setPrivileges('managed/alpha_user');
    userViewPrivileges.value = privileges['managed/alpha_user'].VIEW?.allowed
      ? privileges['managed/alpha_user'].VIEW.properties || []
      : [];
    const { data: privilegesData } = await getPrivileges(userId);
    if (privilegesData.permissions.includes('createUser')) allowCreate.value = true;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.user.errorGettingPrivileges'));
  }
}

getIdmAndIgaPrivileges();

</script>

<style lang="scss" scoped>
:deep {
  .w-70px {
    width: 70px;
  }
}
</style>

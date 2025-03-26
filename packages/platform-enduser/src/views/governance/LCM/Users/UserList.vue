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
      @row-clicked="navigateToUserDetails">
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
import { getResourceTypePrivilege } from '@forgerock/platform-shared/src/api/PrivilegeApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

// composables
const router = useRouter();

// data
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
 * Fetches the list of privileges for the user.
 * This function is asynchronous and retrieves data related to user permissions.
 */
async function getPrivileges() {
  try {
    const { data } = await getResourceTypePrivilege('managed/alpha_user');
    userViewPrivileges.value = data.VIEW?.allowed
      ? data.VIEW.properties || []
      : [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.user.errorGettingPrivileges'));
  }
}

getPrivileges();

</script>

<style lang="scss" scoped>
:deep {
  .w-70px {
    width: 70px;
  }
}
</style>

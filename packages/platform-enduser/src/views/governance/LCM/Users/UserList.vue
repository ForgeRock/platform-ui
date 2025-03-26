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
      class="mb-5"
      resource="user"
      :columns="userColumns"
      :resource-function="getManagedResourceList">
      <template #cell(name)="{ item }">
        <FrUserBasicInfo
          :pic-dimension="28"
          :user="item" />
      </template>
      <template #cell(email)="{ item }">
        {{ item.mail }}
      </template>
    </FrGovResourceList>
  </BContainer>
</template>

<script setup>
/**
 * This component is used to display the entitlements list.
 * Supports searching and pagination
 */
// import { useRouter } from 'vue-router';
import {
  BContainer,
} from 'bootstrap-vue';
import FrGovResourceList from '@forgerock/platform-shared/src/components/governance/GovResourceList';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import i18n from '@/i18n';

// composables
// const router = useRouter();

// data
const userColumns = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
    initialSort: true,
    sortable: true,
    sortKey: 'givenName',
  },
  {
    key: 'email',
    label: i18n.global.t('common.email'),
    sortable: true,
    sortKey: 'mail',
  },
  {
    key: 'actions',
    label: '',
    class: 'w-70px',
  },
];

/**
 * Navigates to the details page of the specified entitlement.
 * @param {Object} entitlement - The entitlement object containing details to navigate to.
 */
// function navigateToUserDetails(user) {
//   router.push({
//     name: 'UserDetails',
//     params: { userId: user._id },
//   });
// }

</script>

<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="my-5">
    <FrSpinner
      v-if="isEmpty(user)"
      class="py-5" />
    <template v-else>
      <BMedia
        class="align-items-center mb-4"
        no-body>
        <BMediaAside class="align-self-center">
          <BImg
            class="mr-3 rounded-circle"
            :height="104"
            :width="104"
            :alt="$t('common.profilePicture')"
            :aria-hidden="true"
            :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        </BMediaAside>
        <BMediaBody class="align-self-center overflow-hidden text-nowrap">
          <h3 class="h5 text-muted">
            {{ $t('common.user.user') }}
          </h3>
          <h2 class="h1 mb-2">
            {{ $t('common.userFullName', {
              givenName: user.givenName,
              sn: user.sn,
            }) }}
          </h2>
          <span class="text-muted">
            {{ user.userName }}
          </span>
        </BMediaBody>
      </BMedia>
      <BCard no-body>
        <BTabs
          class="card-tabs-vertical"
          nav-class="w-200px"
          pills
          vertical
          lazy>
          <BTab :title="$t('governance.user.profile')">
            <FrProfile
              :user="user"
              :read-only="!modifyPermissions" />
          </BTab>
          <template v-if="viewUserAccess">
            <BTab
              v-for="(tab, index) in grantTabItems"
              class="nav-item"
              :key="`${tab.grantType}_${index}`"
              :title="tab.displayName">
              <FrGovResourceTable
                add-event="add-clicked"
                allow-add
                :grant-type="tab.grantType"
                :fields="tab.fields"
                :items="resourceItems"
                :total-count="resourceTotalCount"
                :modal-id="`${tab.displayName}-modal`"
                @add-clicked="handleAdd(tab.grantType, userId)"
                @load-data="queryResource($event, tab.grantType)"
                @revoke-items="revokeResourcesAndCloseModal($event, userId, `${tab.displayName}-modal-revoke`)" />
            </BTab>
          </template>
        </BTabs>
      </BCard>
    </template>
  </BContainer>
</template>

<script setup>
import { isEmpty } from 'lodash';
import { ref, onMounted } from 'vue';
import {
  BContainer,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { useRoute, useRouter } from 'vue-router';
import { getManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getGovernanceGrants, revokeResourcesFromIGA } from '@forgerock/platform-shared/src/utils/governance/resource';
import { getPermissionsForUser } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import FrProfile from './Tabs/Profile';
import i18n from '@/i18n';
import store from '@/store';

// Composables
const route = useRoute();
const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();
const { bvModal } = useBvModal();

const userId = ref(route.params.userId);
const user = ref({});
const resourceItems = ref([]);
const resourceTotalCount = ref(0);
const modifyPermissions = ref(false);
const viewUserAccess = ref(false);
const grantTabItems = [
  {
    displayName: i18n.global.t('common.accounts'),
    grantType: 'account',
    fields: [
      {
        key: 'appName',
        label: i18n.global.t('common.name'),
        sortable: true,
      },
      {
        key: 'status',
        label: i18n.global.t('common.status'),
      },
      {
        key: 'actions',
        label: '',
        thClass: 'w-100px',
      },
    ],
  },
  {
    displayName: i18n.global.t('common.entitlements'),
    grantType: 'entitlement',
    fields: [
      {
        key: 'appName',
        label: i18n.global.t('common.application'),
        sortable: true,
      },
      {
        key: 'entitlementName',
        label: i18n.global.t('common.name'),
        sortable: true,
      },
      {
        key: 'accountName',
        label: i18n.global.t('pages.myAccess.accountName'),
        sortable: true,
      },
      {
        key: 'actions',
        label: '',
        class: 'p-3',
        sortable: false,
        thClass: 'w-100px',
      },
    ],
  },
  {
    displayName: i18n.global.t('common.roles'),
    grantType: 'role',
    fields: [
      {
        key: 'roleName',
        label: i18n.global.t('common.name'),
        sortable: true,
      },
      {
        key: 'timeConstraint',
        label: i18n.global.t('pages.myAccess.timeConstraint'),
      },
      {
        key: 'assignment',
        label: i18n.global.t('common.assignment'),
      },
      {
        key: 'actions',
        label: '',
        class: 'p-3',
        sortable: false,
        thClass: 'w-100px',
      },
    ],
  },
];

/**
 * Queries a resource with the given parameters.
 *
 * @param {Object} params - The parameters to query the resource with.
 * @param {string} grantType - The type of grant to query.
 */
async function queryResource(params, grantType) {
  const response = await getGovernanceGrants(grantType, userId.value, params);
  resourceItems.value = response.items;
  resourceTotalCount.value = response.totalCount;
}

/**
 * Get the user details by ID.
 */
async function loadUser() {
  try {
    const { data: permissionsData } = await getPermissionsForUser(userId.value);
    modifyPermissions.value = permissionsData.result?.[0]?.permissions?.modifyUser;
    viewUserAccess.value = permissionsData.result?.[0]?.permissions?.viewUserAccess;
    const { data } = await getManagedResource('alpha_user', userId.value, { fields: '*,manager/*' });
    user.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.user.errorGettingSchema'));
  }
}

onMounted(() => {
  setBreadcrumb('/administer/users', i18n.global.t('pageTitles.AdministerUsers'));
  loadUser();
});

/**
 * Revokes resources associated with a given resource ID and closes the specified modal.
 *
 * @param {Object} requestPayload - The payload containing the necessary data for the revoke request.
 * @param {string} resourceId - The unique identifier of the resource to be revoked.
 * @param {string} modalId - The identifier of the modal to be closed after revoking the resource.
 */
async function revokeResourcesAndCloseModal(requestPayload, resourceId, modalId) {
  await revokeResourcesFromIGA(requestPayload, resourceId, false);
  bvModal.value.hide(modalId);
}

/**
 * Handles the addition of a new item based on the specified grant type.
 *
 * @param {string} grantType - The type of grant to be added
 */
function handleAdd(grantType) {
  const userToRequest = {
    id: userId.value,
    name: i18n.global.t('common.userFullName', {
      givenName: user.value.givenName,
      sn: user.value.sn,
    }),
    profileImage: user.value.profileImage,
    userName: user.value.userName,
  };

  let catalogTab = '';
  switch (grantType) {
    case 'account':
      catalogTab = 'application';
      break;
    case 'entitlement':
      catalogTab = 'entitlement';
      break;
    case 'role':
      catalogTab = 'role';
      break;
    default:
      break;
  }

  store.commit('setRequestCartUsers', [userToRequest]);
  router.push({ name: 'AccessRequestNew', params: { catalogTab, returnPath: route.path } });
}

</script>

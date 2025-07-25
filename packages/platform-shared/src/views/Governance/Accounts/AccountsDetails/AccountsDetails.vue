<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <FrSpinner
      v-if="isLoading && Object.keys(account).length === 0"
      class="py-5" />
    <div v-else>
      <div class="mt-5 mb-3 d-flex">
        <BMedia
          no-body
          class="border">
          <img
            class="d-flex justify-content-center align-items-center m-4"
            width="48"
            height="48"
            :src="account?.application?.icon"
            :onerror="onImageError">
        </BMedia>
        <FrHeader
          class="ml-3"
          :title="account?.displayName"
          :subtitle="account?.application?.name"
        />
      </div>
      <BTabs
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        @activate-tab="tabActivated">
        <BTab
          :title="i18n.global.t('governance.accounts.details.tabs.details')"
          key="details"
          :active="tabIndex === 0"
          lazy>
          <FrDetailsTab
            :account="account"
            :read-only="readOnly" />
        </BTab>
        <BTab
          :title="$t('governance.accounts.details.tabs.objectProperties')"
          key="objectProps"
          lazy>
          <FrAccountObjectProperties
            :object-properties="objectProperties"
          />
        </BTab>
        <BTab
          :title="$t('governance.accounts.details.tabs.entitlements')"
          v-if="isCorrelated"
          key="entitlements"
          lazy>
          <FrGovResourceTable
            :fields="entitlementTableFields"
            grant-type="entitlement"
            :items="entitlementList"
            parent-resource-name="account"
            :saving-status="savingGovernanceResourcesStatus"
            show-view-details
            :total-count="entitlementTotalCount"
            @load-data="queryAccountEntitlements"
            @revoke-items="revokeEntitlement" />
        </BTab>
      </BTabs>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BContainer,
  BMedia,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { omit } from 'lodash';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getAccountById, getAccountEntitlements } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import { revokeResourcesFromIGA } from '@forgerock/platform-shared/src/utils/governance/resource';
import { getAccountAttribute } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import FrDetailsTab from './DetailsTab';
import FrAccountObjectProperties from './ObjectProperties';
import { getAccountDisplayName } from '../utils/accountUtility';
import i18n from '@/i18n';

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: true,
  },
  isEndUser: {
    type: Boolean,
    default: true,
  },
});
const { setBreadcrumb } = useBreadcrumb();
const route = useRoute();
const tabIndex = ref(0);
const account = ref({});
const isLoading = ref(true);
const objectProperties = ref([]);
const entitlementList = ref([]);
const entitlementTotalCount = ref(0);
const id = route.params.accountId;
const isCorrelated = computed(() => account.value.user);
const savingGovernanceResourcesStatus = ref('');
const tabs = isCorrelated.value ? ['details', 'objectProperties', 'entitlements'] : ['details', 'objectProperties'];
const entitlementTableFields = [
  {
    key: 'entitlementNameAppName',
    label: i18n.global.t('common.name'),
    sortable: true,
    class: 'w-50',
  },
  {
    key: 'item.objectType',
    label: i18n.global.t('objectType'),
    class: 'w-25',
  },
  {
    key: 'item.accountAttribute',
    label: i18n.global.t('common.accountAttribute'),
    class: 'w-25',
  },
  {
    key: 'assignment',
    label: i18n.global.t('common.assignment'),
    class: 'w-25',
  },
  {
    key: 'actions',
    label: '',
    class: 'col-actions',
  },
];

/**
 * Queries the entitlements that belong to the given account
 * @param params query parameters
 */
async function queryAccountEntitlements(params = {}) {
  if (params.queryString) {
    params.queryFilter = `descriptor.idx./entitlement.displayName co '${params.queryString}'`;
  }
  if (params.sortBy) {
    params.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy}`;
  }

  const queryParams = omit(params, ['queryString', 'sortBy', 'sortDir', 'grantType']);
  queryParams._fields = 'application,catalog,descriptor,entitlement,entitlementOwner,glossary,item,keys,relationship';
  const { data } = await getAccountEntitlements(id, queryParams);
  data.result.forEach((entitlement) => {
    entitlement.item.accountAttribute = getAccountAttribute(entitlement);
  });
  entitlementList.value = data?.result;
  entitlementTotalCount.value = data?.totalCount;
}
/**
 * Sends off revoke entitlement request
 * @param {Object} payload Contains metadata for revoke request
 */
async function revokeEntitlement(payload) {
  const userId = account.value?.user.id;
  if (!userId) {
    return; // This should not happen as the tab is only shown for correlated accounts, but precautionary.
  }
  savingGovernanceResourcesStatus.value = 'saving';
  const response = await revokeResourcesFromIGA(payload, userId, true);
  savingGovernanceResourcesStatus.value = response.status;
}
/**
 * Sets the routing url
 * @param {number} index - currently selected tab index
 */
function tabActivated(index) {
  const accountsTab = tabs[index];
  window.history.pushState(window.history.state, '', `#/accounts/${id}/${accountsTab}`);
}

/**
 * Retrieves the account from the API and sets the account data.
*/
async function getAccount() {
  try {
    isLoading.value = true;
    const { data } = await getAccountById(id);
    account.value = { ...data };

    const applicationIcon = account.value?.application?.icon || getApplicationLogo(account.value?.application);
    account.value.application.icon = applicationIcon;

    account.value.displayName = getAccountDisplayName(account.value);

    objectProperties.value = data.account || {};
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.accounts.failedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(async () => {
  const matchedTab = tabs
    .findIndex((key) => key === route.params.tab);
  tabIndex.value = matchedTab > -1 ? matchedTab : 0;
  if (props.isEndUser) {
    setBreadcrumb('/my-machine-accounts', i18n.global.t('sideMenu.endUser.machineAccounts'));
  } else {
    setBreadcrumb('/accounts', i18n.global.t('common.accounts'));
  }
  await loadAppTemplates();
  getAccount();
});
</script>

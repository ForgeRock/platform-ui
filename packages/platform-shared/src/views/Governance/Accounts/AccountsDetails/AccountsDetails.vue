<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <FrSpinner
      v-if="isLoading && Object.keys(account).length === 0"
      class="py-5" />
    <div v-else>
      <FrHeaderWithImage
        class="mt-5 mb-3"
        :title="account?.displayName"
        :subtitle="account?.application?.name"
        :image-source="account?.application?.icon" />
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
            :schema="accountSchema"
          />
        </BTab>
        <BTab
          :title="$t('governance.accounts.details.tabs.entitlements')"
          v-if="isCorrelated || isDisconnected"
          key="entitlements"
          lazy>
          <FrGovResourceTable
            allow-add
            :entitlement-options="entitlements"
            :fields="entitlementTableFields"
            grant-type="entitlement"
            :initial-application-id="account.application?.id"
            :initial-application-logo="account.application?.icon"
            :initial-application-name="account.application?.name"
            :items="entitlementList"
            parent-resource-name="account"
            :saving-status="savingGovernanceResourcesStatus"
            show-view-details
            :total-count="entitlementTotalCount"
            @assign-resources="assignGovernanceResources"
            @get-entitlements="getGovernanceEntitlements"
            @load-data="queryAccountEntitlements"
            @revoke-items="revokeEntitlement" />
        </BTab>
        <BTab
          v-if="!props.isEndUser"
          :title="$t('governance.accounts.details.tabs.activity')"
          key="activity"
          lazy>
          <FrActivity
            :object-id="id"
            :object-types="['account']"
            :parent-resource-name="$t('common.account')" />
        </BTab>
      </BTabs>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BContainer,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { omit } from 'lodash';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getAccountById, getAccountEntitlements } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import { getEntitlements } from '@forgerock/platform-shared/src/utils/governance/resource';
import { getAccountAttribute, getObjectTypeFromAccountId } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import FrAccountObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import FrActivity from '@forgerock/platform-shared/src/views/Governance/Activity/Activity';
import FrHeaderWithImage from '@forgerock/platform-shared/src/components/HeaderWithImage/HeaderWithImage';
import FrDetailsTab from './DetailsTab';
import { getAccountDisplayName } from '../utils/accountUtility';
import store from '@/store';
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
const accountSchema = ref({});
const isLoading = ref(true);
const objectProperties = ref([]);
const entitlementList = ref([]);
const entitlementTotalCount = ref(0);
const id = route.params.accountId;
const isCorrelated = computed(() => account.value.user);
const isDisconnected = computed(() => account.value.application?.isDisconnected);
const savingGovernanceResourcesStatus = ref('');
const entitlements = ref([]);
const tabs = computed(() => [
  'details',
  'objectProperties',
  ...((isCorrelated.value || isDisconnected.value) ? ['entitlements'] : []),
  ...(!props.isEndUser ? ['activity'] : []),
]);
const entitlementTableFields = [
  {
    key: 'entitlementNameAppName',
    label: i18n.global.t('common.name'),
    sortable: true,
    class: 'w-50',
  },
  {
    key: 'item.objectType',
    label: i18n.global.t('common.objectType'),
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
    class: 'w-120px fr-no-resize sticky-right',
  },
];

/**
 * Retrieves list of entitlements related to specified application and using search value
 * @param {*} queryParams Contains parameters to search for entitlements
 */
async function getGovernanceEntitlements({ searchValue = '', selectedApplicationId }) {
  const user = account.value?.user;
  if (!user) {
    return;
  }
  entitlements.value = await getEntitlements(false, searchValue, selectedApplicationId, `managed/${store.state.realm}_assignment`, props.isEndUser);
}

/**
 * Assigns entitlements to the account via IGA
 * @param {Array} resourceIds IDs of entitlements to assign
 */
async function assignGovernanceResources(resourceIds) {
  const userId = account.value?.user?.id;
  if (!userId) {
    return;
  }
  savingGovernanceResourcesStatus.value = 'saving';
  const accountId = account.value?.keys?.accountId;
  const requests = resourceIds.map((entitlementId) => {
    const common = { entitlementId: entitlementId.split('/')[2], userId };
    if (!props.isEndUser) common.context = { type: 'admin' };
    if (accountId) common.accountId = accountId;
    return submitCustomRequest('entitlementGrant', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    displayNotification('success', i18n.global.t('governance.resource.successfullyAdded', { resource: i18n.global.t('common.entitlements') }));
    savingGovernanceResourcesStatus.value = 'success';
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    savingGovernanceResourcesStatus.value = 'error';
  }
}

/**
 * Queries the entitlements that belong to the given account
 * @param params query parameters
 */
async function queryAccountEntitlements(params = {}) {
  if (params.queryString) {
    params.queryFilter = `descriptor.idx./entitlement.displayName co '${params.queryString.replace(/'/g, "\\'")}'`;
  }
  if (params.sortBy) {
    params.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy}`;
  }
  if (params.pageNumber != null && params.pageSize != null) {
    params.pagedResultsOffset = params.pageNumber * params.pageSize;
    delete params.pageNumber;
  }

  const queryParams = omit(params, ['queryString', 'sortBy', 'sortDir', 'grantType']);
  queryParams._fields = 'application,catalog,descriptor,entitlement,entitlementOwner,glossary,item,keys,relationship,assignment.id';
  const { data } = await getAccountEntitlements(id, queryParams);
  data.result.forEach((entitlement) => {
    entitlement.assignmentId = entitlement.assignment?.id;
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
  const userId = account.value?.user?.id;
  if (!userId) {
    return;
  }
  savingGovernanceResourcesStatus.value = 'saving';
  const accountId = account.value?.keys?.accountId;
  const requests = payload.itemsToRevoke.map((item) => {
    const common = { entitlementId: item?.assignmentId, userId };
    if (!props.isEndUser) common.context = { type: 'admin' };
    if (accountId) common.accountId = accountId;
    if (payload.justification) common.justification = payload.justification;
    if (payload.priority) common.priority = payload.priority;
    return submitCustomRequest('entitlementRemove', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    displayNotification('success', i18n.global.t('governance.request.requestSuccess'));
    savingGovernanceResourcesStatus.value = 'requestsRevoked';
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.request.requestError'));
    savingGovernanceResourcesStatus.value = 'error';
  }
}
/**
 * Sets the routing url
 * @param {number} index - currently selected tab index
 */
function tabActivated(index) {
  const accountsTab = tabs.value[index];
  window.history.pushState(window.history.state, '', `#/accounts/${encodeURIComponent(id)}/${accountsTab}`);
}

async function getAccountSchema(applicationId, objectType) {
  if (!applicationId || !objectType) return;
  try {
    const { data } = await getObjectTypeSchema(applicationId, objectType);
    const properties = data?.properties || {};
    accountSchema.value = Object.fromEntries(
      Object.entries(properties).map(([key, val]) => [key, val.displayName || key]),
    );
  } catch {
    // schema is optional — fall back to raw keys
  }
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

    await getAccountSchema(data.application?.id, getObjectTypeFromAccountId(data.item, data.keys, data.application?.isDisconnected));
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.accounts.failedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(async () => {
  if (props.isEndUser) {
    setBreadcrumb('/my-machine-accounts', i18n.global.t('sideMenu.endUser.machineAccounts'));
  } else {
    setBreadcrumb('/accounts', i18n.global.t('common.accounts'));
  }
  await loadAppTemplates();
  await getAccount();
  const matchedTab = tabs.value
    .findIndex((key) => key === route.params.tab);
  tabIndex.value = matchedTab > -1 ? matchedTab : 0;
});
</script>

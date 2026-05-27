<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <FrSpinner
      v-if="isLoading && Object.keys(agent).length === 0"
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
            :src="agent?.application?.icon"
            :onerror="onImageError">
        </BMedia>
        <FrHeader
          class="ml-3"
          :title="agent?.displayName"
          :subtitle="agent?.application?.name"
        />
      </div>
      <BTabs
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        @activate-tab="tabActivated">
        <BTab
          :title="$t('governance.agents.details.tabs.details')"
          key="details"
          :active="tabIndex === 0"
          lazy>
          <FrDetailsTab
            :agent="agent"
            :is-end-user="props.isEndUser"
            :read-only="readOnly" />
        </BTab>
        <BTab
          :title="$t('governance.agents.details.tabs.entitlements')"
          key="entitlements"
          lazy>
          <FrGovResourceTable
            allow-add
            :entitlement-options="entitlements"
            :fields="entitlementTableFields"
            :grant-type="$t('governance.agents.entitlement')"
            :initial-application-id="agent.application?.id"
            :initial-application-logo="agent.application?.icon"
            :initial-application-name="agent.application?.name"
            :items="entitlementList"
            :parent-resource-name="$t('governance.agents.agent')"
            :saving-status="savingGovernanceResourcesStatus"
            show-view-details
            :total-count="entitlementTotalCount"
            @assign-resources="assignGovernanceResources"
            @get-entitlements="getGovernanceEntitlements"
            @load-data="queryAgentEntitlements"
            @revoke-items="revokeEntitlement" />
        </BTab>
        <BTab
          v-if="!props.isEndUser"
          :title="$t('governance.agents.details.tabs.activity')"
          key="activity"
          lazy>
          <FrActivity
            :object-id="id"
            :object-types="['agent', 'account']"
            :parent-resource-name="$t('common.agent')" />
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
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { omit } from 'lodash';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getAccountById, getAccountEntitlements } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import { getEntitlements } from '@forgerock/platform-shared/src/utils/governance/resource';
import { getAccountAttribute } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrActivity from '@forgerock/platform-shared/src/views/Governance/Activity/Activity';
import FrDetailsTab from './DetailsTab';
import store from '@/store';
import { getAgentDisplayName } from '../utils/agentUtility';
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
const agent = ref({});
const isLoading = ref(true);
const entitlementList = ref([]);
const entitlementTotalCount = ref(0);
const id = route.params.agentId;
const savingGovernanceResourcesStatus = ref('');
const entitlements = ref([]);
const tabs = ['details', 'entitlements', 'activity'];
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
    class: 'w-120px fr-no-resize sticky-right',
  },
];
/**
 * Sets the routing url
 * @param {number} index - currently selected tab index
 */
function tabActivated(index) {
  tabIndex.value = index;
}

/**
 * Retrieves list of entitlements related to specified application and using search value
 * @param {*} queryParams Contains parameters to search for entitlements
 *   {String} searchValue User-entered value to filter entitlements by
 *   {String} selectedApplicationId Id of application to filter entitlements by
 */
async function getGovernanceEntitlements({ searchValue = '', selectedApplicationId }) {
  const user = agent.value?.user;
  if (!user) {
    return;
  }
  entitlements.value = await getEntitlements(false, searchValue, selectedApplicationId, `managed/${store.state.realm}_assignment`, props.isEndUser);
}

/**
 * Assigns entitlements to the agent via IGA
 * @param {Array} resourceIds IDs of entitlements to assign
 */
async function assignGovernanceResources(resourceIds) {
  const userId = agent.value?.user?.id;
  if (!userId) {
    return;
  }
  savingGovernanceResourcesStatus.value = 'saving';
  const accountId = agent.value?.keys?.accountId;
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
 * Sends off revoke entitlement request
 * @param {Object} payload Contains metadata for revoke request
 */
async function revokeEntitlement(payload) {
  const userId = agent.value?.user?.id;
  if (!userId) {
    return;
  }
  savingGovernanceResourcesStatus.value = 'saving';
  const accountId = agent.value?.keys?.accountId;
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
 * Queries the entitlements that belong to the given agent
 * @param params query parameters
 */
async function queryAgentEntitlements(params = {}) {
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
 * Retrieves the agent from the API and sets the agent data.
*/
async function getAgent() {
  try {
    isLoading.value = true;
    const { data } = await getAccountById(id);
    agent.value = { ...data };

    const applicationIcon = agent.value?.application.icon || getApplicationLogo(agent.value?.application);
    agent.value.application.icon = applicationIcon;

    agent.value.displayName = getAgentDisplayName(agent.value);
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.agents.failedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(async () => {
  const matchedTab = tabs
    .findIndex((key) => key === route.params.tab);
  tabIndex.value = matchedTab > -1 ? matchedTab : 0;
  if (props.isEndUser) {
    setBreadcrumb('/my-agents', i18n.global.t('sideMenu.endUser.agents'));
  } else {
    setBreadcrumb('/agents', i18n.global.t('governance.agents.title'));
  }
  await loadAppTemplates();
  getAgent();
});
</script>

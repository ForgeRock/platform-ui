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
            :read-only="readOnly" />
        </BTab>
        <BTab
          :title="$t('governance.agents.details.tabs.entitlements')"
          key="entitlements"
          lazy>
          <FrGovResourceTable
            :fields="entitlementTableFields"
            :grant-type="$t('governance.agents.entitlement')"
            :items="entitlementList"
            :parent-resource-name="$t('governance.agents.agent')"
            :saving-status="savingGovernanceResourcesStatus"
            show-view-details
            :total-count="entitlementTotalCount"
            @load-data="queryAgentEntitlements"
            @revoke-items="revokeEntitlement" />
        </BTab>
        <BTab
          :title="$t('governance.agents.details.tabs.activity')"
          key="activity"
          lazy>
          <FrGovResourceTable
            :fields="activityTableFields"
            :grant-type="$t('governance.activity.logs')"
            :items="activityLogList"
            :parent-resource-name="$t('common.agent')"
            show-view-details
            :total-count="activityLogTotalCount"
            @load-data="queryAgentActivity" />
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
import dayjs from 'dayjs';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getAccountById, getAccountEntitlements } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { getActivityLogs } from '@forgerock/platform-shared/src/api/governance/ActivityApi';
import { getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import { revokeResourcesFromIGA } from '@forgerock/platform-shared/src/utils/governance/resource';
import { getAccountAttribute } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import FrDetailsTab from './DetailsTab';
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
const activityLogList = ref([]);
const activityLogTotalCount = ref(0);
const id = route.params.agentId;
const savingGovernanceResourcesStatus = ref('');
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
    class: 'col-actions',
  },
];
const activityTableFields = [
  {
    key: 'actor.display_name',
    label: i18n.global.t('governance.activity.user'),
    sortable: true,
    class: 'w-25',
  },
  {
    key: 'event_time',
    label: i18n.global.t('common.date'),
    class: 'w-25',
  },
  {
    key: 'action',
    label: i18n.global.t('common.action'),
    class: 'w-25',
  },
  {
    key: 'outcome',
    label: i18n.global.t('common.outcome'),
    class: 'w-25',
  },
  {
    key: 'actions',
    label: '',
    class: 'col-actions',
  },
];

function transformActivityLog(log) {
  return {
    ...log,
    event_time: dayjs(log.event_time).format('MMM DD, YYYY h:mm:ss A'),
  };
}

/**
 * Queries the activity logs that belong to the given agent
 * @param params query parameters
 */
async function queryAgentActivity(params = {}) {
  params.queryFilter = `(object_id eq "${id}" and (object_type eq "agent" or object_type eq "account"))`;
  if (params.queryString) {
    params.queryFilter += ` and actor.display_name co '${params.queryString.replace(/'/g, "\\'")}'`; // Decide what fields are best as default search for activity
  }
  if (params.sortBy) {
    params.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy}`;
  }

  const queryParams = omit(params, ['queryString', 'sortBy', 'sortDir', 'grantType']);
  try {
    const { data } = await getActivityLogs(queryParams);
    activityLogList.value = data?.result?.map(transformActivityLog);
    activityLogTotalCount.value = data?.totalCount;
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.activity.activityLogsFailedToLoad'));
  }
}

/**
 * Sets the routing url
 * @param {number} index - currently selected tab index
 */
function tabActivated(index) {
  tabIndex.value = index;
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
  const response = await revokeResourcesFromIGA(payload, userId, true);
  savingGovernanceResourcesStatus.value = response.status;
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

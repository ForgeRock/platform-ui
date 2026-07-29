<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    v-if="!agent.user?.id"
    no-body>
    <FrNoData
      icon="person_off"
      body-class="mb-5"
      :subtitle="$t('governance.agents.accessTab.noIdentity')" />
  </BCard>
  <BCard
    v-else
    no-body>
    <BTabs
      class="card-tabs-vertical"
      content-class="tab-scroll"
      pills
      vertical>
      <BTab
        lazy
        :title="$t('common.accounts')">
        <FrGovResourceTable
          :fields="accountTableFields"
          grant-type="account"
          :items="accountList"
          :parent-resource-name="$t('governance.agents.agent')"
          :saving-status="savingAccountsStatus"
          show-view-details
          :total-count="accountTotalCount"
          add-event="open-add-account"
          allow-add
          @load-data="queryAccountGrants"
          @open-add-account="openAddAccountsModal"
          @row-clicked="openAccountModal" />
      </BTab>
      <BTab
        lazy
        :title="$t('common.entitlements')">
        <FrGovResourceTable
          allow-add
          external-view-details
          :entitlement-options="entitlements"
          :fields="entitlementTableFields"
          :grant-type="$t('governance.agents.entitlement')"
          :items="entitlementList"
          :parent-resource-name="$t('governance.agents.agent')"
          :require-request-justification="props.requireRequestJustification"
          :saving-status="savingGovernanceResourcesStatus"
          scope-permission="view"
          show-view-details
          :total-count="entitlementTotalCount"
          @assign-resources="assignGovernanceResources"
          @get-entitlements="getGovernanceEntitlements"
          @load-data="queryEntitlementGrants"
          @revoke-items="revokeEntitlement"
          @row-clicked="openEntitlementModal" />
      </BTab>
      <BTab
        lazy
        :title="$t('common.roles')">
        <FrGovResourceTable
          add-event="open-add-role"
          allow-add
          :fields="roleTableFields"
          grant-type="role"
          :items="roleList"
          :parent-resource-name="$t('governance.agents.agent')"
          :saving-status="savingRolesStatus"
          :total-count="roleTotalCount"
          @load-data="queryRoleGrants"
          @open-add-role="openAddRolesModal"
          @revoke-items="revokeRole" />
      </BTab>
    </BTabs>
  </BCard>
  <FrAccountModal
    :grant="selectedGrant"
    modal-id="agent-access-accountGrant" />
  <FrRequestSubmitSuccessModal
    :request-id="submittedRequestId"
    :success-text="$t('governance.resource.successfullyAdded', { resource: $t('common.entitlements') })" />
  <FrEntitlementModal
    :entitlement="selectedEntitlementGrant"
    :glossary-schema="entitlementGlossarySchema || []"
    modal-id="agent-access-entitlementGrant" />
  <BModal
    id="addRolesModal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="$t('common.addObject', { object: $t('common.roles') })"
    @hidden="onAddRolesModalHidden"
    @show="searchRoles('')">
    <FrField
      internal-search
      name="role-select"
      open-direction="bottom"
      type="multiselect"
      :label="$t('governance.agents.accessTab.selectRoles')"
      :options="roleSearchOptions"
      :value="selectedRoles"
      @input="selectedRoles = $event"
      @search-change="searchRoles" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.save')"
        :disabled="!selectedRoles.length || savingRolesStatus === 'saving'"
        :show-spinner="savingRolesStatus === 'saving'"
        :spinner-text="$t('common.saving')"
        @click="assignRoles" />
    </template>
  </BModal>
  <BModal
    id="addAccountsModal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="$t('common.addObject', { object: $t('common.accounts') })"
    @hidden="onAddAccountsModalHidden"
    @show="searchApplications('')">
    <FrField
      internal-search
      name="account-select"
      open-direction="bottom"
      type="multiselect"
      :label="$t('governance.agents.accessTab.selectApplications')"
      :options="applicationSearchOptions"
      :value="selectedApplications"
      @input="selectedApplications = $event"
      @search-change="searchApplications" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.save')"
        :disabled="!selectedApplications.length || savingAccountsStatus === 'saving'"
        :show-spinner="savingAccountsStatus === 'saving'"
        :spinner-text="$t('common.saving')"
        @click="assignAccounts" />
    </template>
  </BModal>
</template>

<script setup>
import { ref } from 'vue';
import {
  BButton,
  BCard,
  BModal,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { omit } from 'lodash';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrAccountModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/AccountModal';
import FrRequestSubmitSuccessModal from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccessModal';
import FrEntitlementModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/EntitlementModal';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getAgentGrants } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getApplications } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getEntitlementList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getRoleList } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { getAccountAttribute } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import { escapeQueryFilterValue } from '@forgerock/platform-shared/src/utils/queryFilterUtils';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import store from '@/store';
import i18n from '@/i18n';

const { bvModal } = useBvModal();

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
  agentId: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isEndUser: {
    type: Boolean,
    default: true,
  },
  requireRequestJustification: {
    type: Boolean,
    default: false,
  },
});

const selectedGrant = ref({});
const submittedRequestId = ref('');
const selectedEntitlementGrant = ref({});
const entitlementGlossarySchema = ref(null);
const selectedRoles = ref([]);
const selectedApplications = ref([]);
// Trigger element (the "Add" button) that opened the current add modal; re-armed as
// the success modal's return-focus target when the two modals are chained, so focus
// doesn't fall back to an element inside the closed modal. See the sub-modal pattern
// in .claude/skills/review-accessibility/SKILL.md.
let addModalTriggerEl = null;

/**
 * Opens the add-roles modal, remembering the button that triggered it.
 * @param {Event} event - DOM click event emitted by the GovResourceTable add button.
 */
function openAddRolesModal(event) {
  addModalTriggerEl = event?.currentTarget instanceof Element ? event.currentTarget : null;
  bvModal.value.show('addRolesModal');
}

/**
 * Opens the add-accounts modal, remembering the button that triggered it.
 * @param {Event} event - DOM click event emitted by the GovResourceTable add button.
 */
function openAddAccountsModal(event) {
  addModalTriggerEl = event?.currentTarget instanceof Element ? event.currentTarget : null;
  bvModal.value.show('addAccountsModal');
}

const entitlementList = ref([]);
const entitlementTotalCount = ref(0);
const savingGovernanceResourcesStatus = ref('');
const entitlements = ref([]);

const accountList = ref([]);
const accountTotalCount = ref(0);
const savingAccountsStatus = ref('');

const roleList = ref([]);
const roleTotalCount = ref(0);
const savingRolesStatus = ref('');

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

const accountTableFields = [
  {
    key: 'appName',
    label: i18n.global.t('common.application'),
    sortable: true,
    class: 'w-25',
  },
  {
    key: 'accountName',
    label: i18n.global.t('common.name'),
    sortable: true,
    class: 'w-50',
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

const roleTableFields = [
  {
    key: 'role.name',
    label: i18n.global.t('common.name'),
    sortable: true,
    class: 'w-50',
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

const roleSearchOptions = ref([]);

async function searchRoles(query) {
  try {
    const params = { _pageSize: 10, roleStatus: 'active' };
    if (query) params._queryFilter = `role.name co '${escapeQueryFilterValue(query)}'`;
    const { data } = await getRoleList('role', params);
    const selectedIdSet = new Set(selectedRoles.value);
    const fresh = (data?.result || [])
      .map((item) => ({ text: item.role.name || item.role.id, value: item.role.id }))
      .filter((opt) => !selectedIdSet.has(opt.value));
    const selectedOpts = roleSearchOptions.value.filter((o) => selectedIdSet.has(o.value));
    roleSearchOptions.value = [...selectedOpts, ...fresh];
  } catch {
    // keep existing options so selected tags still render
  }
}

function onAddRolesModalHidden() {
  selectedRoles.value = [];
  roleSearchOptions.value = [];
}

async function assignRoles() {
  const userId = props.agent?.user?.id;
  if (!userId) return;
  savingRolesStatus.value = 'saving';
  const requests = selectedRoles.value.map((roleId) => {
    const common = { userId, roleId };
    if (props.isAdmin) common.context = { type: 'admin' };
    return submitCustomRequest('roleGrant', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    const firstSuccess = results.find((r) => r.status === 'fulfilled');
    submittedRequestId.value = firstSuccess?.value?.data?.id || '';
    savingRolesStatus.value = 'success';
    // Chained modal: hand the original trigger to the success modal so the closed
    // add-roles modal doesn't return focus to an element that no longer exists.
    bvModal.value.hide('addRolesModal');
    bvModal.value.show('successful-submit', addModalTriggerEl);
    addModalTriggerEl = null;
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    savingRolesStatus.value = 'error';
  }
}

const applicationSearchOptions = ref([]);

async function searchApplications(query) {
  try {
    // governance/application returns catalog apps; the queryFilter converts to a
    // targetFilter server-side. End users only see requestable applications.
    const filters = [];
    if (!props.isAdmin) filters.push('glossary.idx./application.requestable eq "true"');
    if (query) filters.unshift(`application.name co '${escapeQueryFilterValue(query)}'`);
    const params = { pageSize: 10 };
    if (filters.length) params.queryFilter = filters.join(' and ');
    const { data } = await getApplications(null, params);
    const selectedIdSet = new Set(selectedApplications.value);
    const fresh = (data?.result || [])
      .map((item) => ({ text: item.application?.name || item.name || item.id, value: item.id }))
      .filter((opt) => !selectedIdSet.has(opt.value));
    const selectedOpts = applicationSearchOptions.value.filter((o) => selectedIdSet.has(o.value));
    applicationSearchOptions.value = [...selectedOpts, ...fresh];
  } catch {
    // keep existing options so selected tags still render
  }
}

function onAddAccountsModalHidden() {
  selectedApplications.value = [];
  applicationSearchOptions.value = [];
}

async function assignAccounts() {
  const userId = props.agent?.user?.id;
  if (!userId) return;
  savingAccountsStatus.value = 'saving';
  const requests = selectedApplications.value.map((applicationId) => {
    const common = { userId, applicationId };
    if (props.isAdmin) common.context = { type: 'admin' };
    return submitCustomRequest('applicationGrant', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    const firstSuccess = results.find((r) => r.status === 'fulfilled');
    submittedRequestId.value = firstSuccess?.value?.data?.id || '';
    savingAccountsStatus.value = 'success';
    // Chained modal: hand the original trigger to the success modal so the closed
    // add-accounts modal doesn't return focus to an element that no longer exists.
    bvModal.value.hide('addAccountsModal');
    bvModal.value.show('successful-submit', addModalTriggerEl);
    addModalTriggerEl = null;
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    savingAccountsStatus.value = 'error';
  }
}

function openAccountModal(grant) {
  selectedGrant.value = grant;
  bvModal.value.show('agent-access-accountGrant');
}

async function openEntitlementModal(grant) {
  selectedEntitlementGrant.value = grant;
  if (!entitlementGlossarySchema.value) {
    try {
      const { data } = await getGlossarySchema();
      entitlementGlossarySchema.value = data['/openidm/managed/assignment'] || [];
    } catch {
      entitlementGlossarySchema.value = [];
    }
  }
  bvModal.value.show('agent-access-entitlementGrant');
}

async function getGovernanceEntitlements({ searchValue = '', selectedApplicationId }) {
  try {
    const queryParams = {
      pageSize: 10,
      sortBy: 'descriptor.idx./entitlement.displayName',
    };
    const filters = [`application.id eq "${selectedApplicationId}"`];
    if (searchValue) filters.push(`descriptor.idx./entitlement.displayName co '${escapeQueryFilterValue(searchValue)}'`);
    queryParams.queryFilter = filters.join(' and ');
    const { data } = await getEntitlementList('resource', queryParams);
    entitlements.value = (data?.result || []).map((result) => ({
      value: `managed/${store.state.realm}_assignment/${result.id}`,
      text: result.descriptor?.idx?.['/entitlement']?.displayName || result.id,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorSearchingCatalog'));
    entitlements.value = [];
  }
}

async function assignGovernanceResources(payload) {
  const { entitlements: resourceIds, justification } = payload;
  const userId = props.agent?.user?.id;
  if (!userId) return;
  savingGovernanceResourcesStatus.value = 'saving';
  const accountId = props.agent?.keys?.accountId;
  const requests = resourceIds.map(({ entitlementId }) => {
    const common = { entitlementId: entitlementId.split('/').slice(2).join('/'), userId };
    if (props.isAdmin) common.context = { type: 'admin' };
    if (accountId) common.accountId = accountId;
    if (justification?.trim()) common.justification = justification.trim();
    return submitCustomRequest('entitlementGrant', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    const firstSuccess = results.find((r) => r.status === 'fulfilled');
    submittedRequestId.value = firstSuccess?.value?.data?.id || '';
    savingGovernanceResourcesStatus.value = 'success';
    bvModal.value.show('successful-submit');
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    savingGovernanceResourcesStatus.value = 'error';
  }
}

async function revokeEntitlement(payload) {
  savingGovernanceResourcesStatus.value = 'saving';
  const requests = payload.itemsToRevoke.map((item) => {
    const userId = item?.user?.id;
    const accountId = item?.keys?.accountId;
    const common = { entitlementId: item?.assignmentId, userId };
    if (props.isAdmin) common.context = { type: 'admin' };
    if (accountId) common.accountId = accountId;
    if (payload.justification) common.justification = payload.justification;
    if (payload.priority) common.priority = payload.priority;
    return submitCustomRequest('entitlementRemove', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    const firstSuccess = results.find((r) => r.status === 'fulfilled');
    submittedRequestId.value = firstSuccess?.value?.data?.id || '';
    savingGovernanceResourcesStatus.value = 'requestsRevoked';
    bvModal.value.show('successful-submit');
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.request.requestError'));
    savingGovernanceResourcesStatus.value = 'error';
  }
}

async function revokeRole(payload) {
  savingRolesStatus.value = 'saving';
  const requests = payload.itemsToRevoke.map((item) => {
    const userId = item?.user?.id;
    const roleId = item?.role?.id;
    const common = { userId, roleId };
    if (props.isAdmin) common.context = { type: 'admin' };
    if (payload.justification) common.justification = payload.justification;
    if (payload.priority) common.priority = payload.priority;
    return submitCustomRequest('roleRemove', { common });
  });
  const results = await Promise.allSettled(requests);
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length < results.length) {
    const firstSuccess = results.find((r) => r.status === 'fulfilled');
    submittedRequestId.value = firstSuccess?.value?.data?.id || '';
    savingRolesStatus.value = 'requestsRevoked';
    bvModal.value.show('successful-submit');
  }
  if (failed.length > 0) {
    showErrorMessage(failed[0].reason, i18n.global.t('governance.request.requestError'));
    savingRolesStatus.value = 'error';
  }
}

const grantTypeFilterMap = {
  entitlement: 'entitlementGrant',
  account: 'accountGrant',
  role: 'roleMembership',
};

const searchFieldByGrantType = {
  entitlement: 'descriptor.idx./entitlement.displayName',
  account: 'descriptor.idx./account.displayName',
  role: 'role.name',
};

async function queryAgentGrants(grantType, params = {}) {
  const itemType = grantTypeFilterMap[grantType];
  if (params.queryString) {
    const searchField = searchFieldByGrantType[grantType];
    params.queryFilter = `item.type eq "${itemType}" and ${searchField} co '${escapeQueryFilterValue(params.queryString)}'`;
  } else {
    params.queryFilter = `item.type eq "${itemType}"`;
  }
  if (params.sortBy) {
    params.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy}`;
  }
  if (params.pageNumber != null && params.pageSize != null) {
    params.pagedResultsOffset = params.pageNumber * params.pageSize;
    delete params.pageNumber;
  }
  const queryParams = omit(params, ['queryString', 'sortBy', 'sortDir', 'grantType']);
  const fieldsByGrantType = {
    entitlement: 'account,application,catalog,descriptor,entitlement,entitlementOwner,glossary,item,keys,relationship,user,assignment.id',
    account: 'account,application,catalog,descriptor,glossary,item,keys,relationship,user',
    role: 'role,roleOwner,glossary,item,keys,relationship,user',
  };
  queryParams._fields = fieldsByGrantType[grantType];
  const { data } = await getAgentGrants(props.agentId, queryParams);
  data.result.forEach((grant) => {
    grant.assignmentId = grant.assignment?.id;
    if (grant.item?.accountAttribute === undefined) {
      grant.item = grant.item || {};
      grant.item.accountAttribute = getAccountAttribute(grant);
    }
  });
  return data;
}

async function queryEntitlementGrants(params = {}) {
  const data = await queryAgentGrants('entitlement', params);
  entitlementList.value = data?.result;
  entitlementTotalCount.value = data?.totalCount;
}

async function queryAccountGrants(params = {}) {
  const data = await queryAgentGrants('account', params);
  accountList.value = data?.result;
  accountTotalCount.value = data?.totalCount;
}

async function queryRoleGrants(params = {}) {
  const data = await queryAgentGrants('role', params);
  roleList.value = data?.result;
  roleTotalCount.value = data?.totalCount;
}
</script>

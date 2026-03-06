<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTabs
    v-if="roleRequestData"
    v-model="tabIndex">
    <BTab :title="$t('governance.certificationTask.roleDetails')">
      <BRow
        v-if="roleRequestData"
        class="mt-4">
        <BCol xs="12">
          <FrField
            v-model="roleRequestData.role.object.name"
            :disabled="props.readOnly"
            class="mb-3"
            :label="$t('common.name')"
          />
        </BCol>
      </BRow>
      <BRow v-if="roleRequestData">
        <BCol xs="12">
          <FrField
            v-model="roleRequestData.role.object.description"
            :disabled="props.readOnly"
            class="mb-3"
            :label="$t('common.description')"
          />
        </BCol>
      </BRow>
      <h3 class="h5 mb-4">
        {{ $t('governance.entitlements.glossaryAttributes') }}
      </h3>
      <FrGlossaryEditForm
        v-if="isInitialized"
        class="mb-2"
        :glossary-schema="glossarySchema"
        :read-only="props.readOnly"
        :model-value="roleRequestData.glossary"
        @update:modelValue="updateGlossaryAndEmit" />
    </BTab>
    <BTab :title="$t('governance.administer.roles.entitlements')">
      <FrEntitlementsTab
        :items="entitlementList"
        :count="entitlementTotalCount"
        :is-loading="savingRequest || isQuerying"
        :request="request"
        :read-only="props.readOnly"
        :role-id="roleRequestData.role.roleId"
        :role-schema="glossarySchema"
        :role-status="roleRequestData.role.status"
        @load-data="queryRoleEntitlements"
        @update-tab-data="updateTabData" />
    </BTab>
    <BTab
      :title="$t('governance.administer.roles.members')">
      <FrMembersTab
        :items="memberList"
        :count="membersCurrentCount"
        :is-loading="savingRequest || isQuerying"
        :read-only="props.readOnly"
        :request="request"
        :role-schema="roleSchema"
        @load-data="queryRoleMembers"
        @update-tab-data="updateTabData" />
    </BTab>
  </BTabs>
</template>

<script setup>
/**
 * Displays the role details of the request
 * @component RequestRoleDetails
 * @prop {Object} item - Request details info
 * @prop {String} type - The details type for this item
 * @prop {Boolean} readOnly - Flag to determine if this item is read-only
 */
import {
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  BCol,
  BRow,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import {
  filter, map, omit, uniq,
} from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrEntitlementsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/EntitlementsTab';
import FrMembersTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/MembersTab';
import i18n from '@/i18n';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
  request: {
    type: Object,
    default: () => ({}),
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  updateRole: {
    type: Function,
    required: true,
  },
});

const { bvModal } = useBvModal();

const tabIndex = ref(0);
const savingRequest = ref(false);
const roleRequestData = ref(null);
const glossarySchema = ref(null);
const roleSchema = ref(null);
const isInitialized = ref(false);
const isQuerying = ref(false);
const glossaryValues = ref(null);
const saveOnUpdate = ref(false);
const memberList = ref([]);
const membersCurrentCount = ref(0);
const entitlementList = ref([]);
const entitlementTotalCount = ref(0);

/**
 * Extracts role request details from the request object.
 * @param {Object} request - The request object containing role details.
 * @returns {Object} - The extracted role request details.
 */
function getRoleRequestDetails(request) {
  return {
    role: request.role,
    glossary: request.role.glossary,
    entitlements: request.role.object.entitlements,
    members: request.role.object.addedRoleMembers,
  };
}

/**
 * Get the role glossary schema.
 */
async function getSchemaData() {
  try {
    // get glossary schema and values
    const glossaryData = await getGlossarySchema('role');
    glossarySchema.value = glossaryData;
    const roleData = await getSchema('managed/alpha_role');
    roleSchema.value = map(roleData?.data.properties, (prop, key) => ({
      ...prop,
      propName: key,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationTask.errors.glossaryError'));
  }
}

/**
 * Updates the tab data based on the provided parameters.
 * @param {String} tabUpdated - The tab that was updated.
 * @param {String} operation - The operation performed on the tab data.
 * @param {Object} data - The data associated with the operation.
 */
async function updateTabData(tabUpdated, operation, data) {
  console.log(tabUpdated, operation, data);
  if (tabUpdated === 'entitlements') {
    if (operation === 'add') {
      const idsToAdd = map(data, 'id');
      roleRequestData.value.entitlements = uniq([...roleRequestData.value.entitlements, ...idsToAdd]);
      bvModal.value.hide('govCreateResourceModal');
    } else if (operation === 'remove') {
      const idsToRemove = map(data, 'id');
      const newEntitlements = filter(roleRequestData.value.entitlements, (entitlement) => idsToRemove.indexOf(entitlement) < 0);
      roleRequestData.value.entitlements = newEntitlements;
      bvModal.value.hide('revoke-from-role-modal');
    }
  } else if (tabUpdated === 'members') {
    if (operation === 'add') {
      const idsToAdd = map(data, (member) => member.id || member._id);
      roleRequestData.value.members = uniq([...roleRequestData.value.members, ...idsToAdd]);
    } else if (operation === 'remove') {
      const idsToRemove = map(data, (member) => member.id || member._id);
      const newMembers = filter(roleRequestData.value.members, (member) => idsToRemove.indexOf(member) < 0);
      roleRequestData.value.members = newMembers;
    }
  }
  if (!props.readOnly && (tabUpdated === 'members' || tabUpdated === 'entitlements')) {
    saveOnUpdate.value = true;
  }
}

/**
 * Updates the glossary with the provided value
 * @param {Object} value - new glossary value.
 */
function updateGlossaryAndEmit(value) {
  glossaryValues.value = value;
  roleRequestData.value.glossary = value;
}

/**
 * Queries the entitlements that belong to the given role
 * @param params query parameters
 */
async function queryRoleEntitlements(params = {}) {
  isQuerying.value = true;
  try {
    entitlementList.value = [];
    if (params.queryString) {
      params._queryFilter = `descriptor.idx./entitlement.displayName co '${params.queryString}'`;
      delete params.queryString;
    }
    if (params.sortBy) {
      params.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy}`;
    }
    if (params.currentPage) {
      params._pagedResultsOffset = (params.currentPage - 1) * (params.pageSize || 10);
    }

    const queryParams = omit(params, ['queryString', 'sortBy', 'sortDir', 'grantType']);
    queryParams._fields = 'application,catalog,descriptor,entitlement,entitlementOwner,glossary,item,keys,relationship';
    const newRequestId = !roleRequestData.value.role.roleId ? props.request.id : null; // Draft requests have no role id, so we need to pass the request id to fetch the correct entitlements
    const { data } = await getRoleDataById(roleRequestData.value.role.roleId, roleRequestData.value.role.status, 'entitlements', queryParams, newRequestId);
    entitlementList.value = data?.result;
    entitlementTotalCount.value = data?.totalCount;
  } finally {
    isQuerying.value = false;
  }
}

/**
 * Update the member list with the members that have been added directly
 * @param members the updated list of members to set
 */
function enrichMemberList(members) {
  const addedRoleMembers = roleRequestData.value.role?.addedRoleMembers || [];
  const isDraftRequest = !roleRequestData.value.role?.roleId;
  memberList.value = map(members, (member) => {
    const isAddedMember = addedRoleMembers.includes(member.id);
    member.editable = isAddedMember || isDraftRequest;
    return member;
  });
}

/**
 * Queries the members that belong to the given role
 * @param params query parameters
 */
async function queryRoleMembers(params = {}) {
  isQuerying.value = true;
  try {
    if (params.queryString) {
      params._queryFilter = `userName co '${params.queryString}' or givenName co '${params.queryString}' or sn co '${params.queryString}'`;
      delete params.queryString;
    }
    params._sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy || 'userName'}`;
    if (params.currentPage) {
      params._pagedResultsOffset = (params.currentPage - 1) * (params.pageSize || 10);
    }
    const newRequestId = !roleRequestData.value.role.roleId ? props.request.id : null; // Draft requests have no role id, so we need to pass the request id to fetch the correct members
    const { data } = await getRoleDataById(roleRequestData.value.role.roleId, roleRequestData.value.role.status, 'members', params, newRequestId);
    enrichMemberList(data?.result);
    membersCurrentCount.value = data?.totalHits;
  } finally {
    isQuerying.value = false;
  }
}

watch(roleRequestData, async (newVal) => {
  try {
    savingRequest.value = true;
    await props.updateRole(newVal, saveOnUpdate.value);
    if (saveOnUpdate.value) {
      await Promise.all([queryRoleMembers(), queryRoleEntitlements()]);
    }
    saveOnUpdate.value = false;
  } finally {
    savingRequest.value = false;
  }
}, { deep: true, immediate: true });

onMounted(async () => {
  roleRequestData.value = await getRoleRequestDetails(props.item.rawData.request);
  await Promise.all([getSchemaData(), queryRoleMembers(), queryRoleEntitlements()]);
  isInitialized.value = true;
});
</script>

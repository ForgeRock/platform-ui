<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template
  :key="roleId">
  <BContainer
    fluid>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <div v-else>
      <div class="mt-5 mb-3 d-flex justify-content-between">
        <FrHeader
          class="ml-3"
          :title="role?.role?.name"
        />
        <BButton
          variant="outline-primary"
          @click="downloadRole()">
          <FrIcon
            icon-class="mr-2"
            name="file_download">
            {{ $t('common.export') }}
          </FrIcon>
        </BButton>
      </div>
      <BCard class="mb-3">
        <BRow
          class="w-100 align-items-center d-flex justify-content-between mb-2">
          <BCol>
            <small>
              {{ i18n.global.t('governance.accessModeling.roleDetails.lastUpdated', { date: lastUpdated}) }}
            </small>
          </BCol>
          <BCol class="badge-col">
            <BBadge
              class="w-100px mr-2"
              :variant="getRoleStatusVariant(status)">
              <span>{{ capitalize(status) }}</span>
            </BBadge>
          </BCol>
          <BCol
            class="d-flex justify-content-end">
            <small>
              {{ i18n.global.t('governance.accessModeling.roleDetails.idDisplay', { id: role?.role?.id}) }}
            </small>
          </BCol>
        </BRow>
      </BCard>
      <BRow
        class="mb-4">
        <BCol sm="6">
          <BCard class="access-card">
            <div class="d-flex align-items-center justify-content-start">
              <h2 class="h5 mb-0">
                {{ i18n.global.t('governance.accessModeling.roleDetails.charts.identityCoverage.title') }}
              </h2>
              <div
                id="identityCoverage-tooltip"
                class="tooltip-button"
                tabindex="0">
                <FrIcon
                  icon-class="ml-1 mt-1"
                  name="info" />
                <BTooltip
                  no-fade
                  target="identityCoverage-tooltip"
                  triggers="hover"
                  position="top">
                  {{ $t('governance.accessModeling.tooltips.identityCoverageDetails') }}
                </BTooltip>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-4">
              <FrSpinner
                v-if="isLoading"
                class="fr-spinner"
                size="md" />
              <FrCircleProgressBar
                v-else
                :progress="identityCoverage"
                :size="196"
              >
                <template #count>
                  <h1 class="mb-0 display-4">
                    {{ `${identityCoverage}%` }}
                  </h1>
                </template>
                <template #caption>
                  <p data-testid="campaign-progress-caption-text">
                    {{
                      i18n.global.t('governance.accessModeling.roleDetails.charts.identityCoverage.percentSubtitle', {
                        total: role?.role?.totalSystemUsers?.toLocaleString() || '0'
                      })
                    }}
                  </p>
                </template>
              </FrCircleProgressBar>
            </div>
            <div class="d-flex justify-content-center mt-1">
              <small
                v-if="identityCoverageDifference !== 0"
                class="d-flex align-items-end mr-2">
                <FrIcon
                  :icon-class="`ml-1 mt-2 ${identityCoverageDifference > 0 ? 'color-green' : 'color-red'}`"
                  :name="identityCoverageDifference > 0 ? 'arrow_drop_up' : 'arrow_drop_down'" />
                {{ i18n.global.t('governance.accessModeling.roleDetails.charts.candidateRoleComparison', { percent: Math.abs(identityCoverageDifference) }) }}
              </small>
            </div>
          </BCard>
        </BCol>
        <BCol sm="6">
          <BCard class="access-card">
            <div class="d-flex align-items-center justify-content-start">
              <h2 class="h5 mb-0">
                {{ i18n.global.t('governance.accessModeling.roleDetails.charts.assignmentConfidence.title') }}
              </h2>
              <div
                id="assignmentConfidence-tooltip"
                class="tooltip-button"
                tabindex="0">
                <FrIcon
                  icon-class="ml-1 mt-1"
                  name="info" />
                <BTooltip
                  no-fade
                  target="assignmentConfidence-tooltip"
                  triggers="hover"
                  position="top">
                  {{ $t('governance.accessModeling.tooltips.assignmentConfidenceDetails') }}
                </BTooltip>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-4">
              <FrSpinner
                v-if="isLoading"
                class="fr-spinner"
                size="md" />
              <FrCircleProgressBar
                v-else
                :progress="averageAssignmentConfidence"
                :size="196"
                :color="styles.green"
              >
                <template #count>
                  <h1 class="mb-0 display-4">
                    {{ `${averageAssignmentConfidence}%` }}
                  </h1>
                </template>
                <template #caption>
                  <p data-testid="campaign-progress-caption-text">
                    {{
                      i18n.global.t('governance.accessModeling.roleDetails.charts.assignmentConfidence.percentSubtitle', {
                        total: role?.role?.entitlementCount || 0
                      })
                    }}
                  </p>
                </template>
              </FrCircleProgressBar>
            </div>
            <div class="d-flex justify-content-center mt-1">
              <small
                v-if="averageAssignmentConfidenceDifference !== 0"
                class="d-flex align-items-end mr-2">
                <FrIcon
                  :icon-class="`ml-1 mt-2 ${averageAssignmentConfidenceDifference > 0 ? 'color-green' : 'color-red'}`"
                  :name="averageAssignmentConfidenceDifference > 0 ? 'arrow_drop_up' : 'arrow_drop_down'" />
                {{ i18n.global.t('governance.accessModeling.roleDetails.charts.candidateRoleComparison', { percent: Math.abs(averageAssignmentConfidenceDifference) }) }}
              </small>
            </div>
          </BCard>
        </BCol>
      </BRow>
      <BTabs
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        @activate-tab="tabActivated">
        <BTab
          :title="i18n.global.t('governance.accessModeling.roleDetails.tabs.details')"
          key="details"
          :active="tabIndex === 0"
          lazy>
          <FrDetailsTab
            :items="role"
            :read-only="role?.role?.status !== 'draft'"
            :type="'details'"
            :is-loading="isSaving"
            @update-tab-data="updateTabData" />
        </BTab>
        <BTab
          :title="$t('governance.accessModeling.roleDetails.tabs.entitlements')"
          key="entitlements"
          lazy>
          <BCard>
            <FrSearchInput
              v-model="entitlementSearchQuery"
              class="col-12 col-lg-auto p-0"
              data-testid="search-gov-resource-table"
              :placeholder="$t('common.search')"
              @clear="queryRoleEntitlements({ queryString: null })"
              @search="queryRoleEntitlements({ queryString: entitlementSearchQuery })" />
          </BCard>
          <FrEntitlementsTab
            :items="entitlementList"
            :count="entitlementTotalCount"
            is-active
            :is-loading="isSaving || isQuerying"
            :read-only="role.role.status !== 'draft'"
            :role-id="roleId"
            :role-schema="roleSchema"
            :role-status="status"
            @load-data="queryRoleEntitlements"
            @row-clicked="showEntitlementDetails"
            @update-tab-data="updateRoleRelationships" />
          <FrEntitlementModal
            :entitlement="selectedEntitlement"
            :glossary-schema="entitlementSchema || []"
            modal-id="roleEntitlementDetails" />
        </BTab>
        <BTab
          :title="$t('governance.accessModeling.roleDetails.tabs.members')"
          key="members">
          <BCard>
            <h3
              class="h5 mb-3">
              {{ $t('governance.accessModeling.attributeDistribution') }}
            </h3>
            <BRow class="d-flex align-items-baseline">
              <BCol sm="4">
                <FrField
                  v-model="selectedAttribute"
                  type="select"
                  :name="$t('common.status')"
                  :options="attributeDropdownOptions"
                  :placeholder="$t('common.status')" />
              </BCol>
              <BCol sm="4">
                <small v-if="selectedAttribute">
                  {{ $t('governance.accessModeling.attributeUniqueValueCount', { count: attributeDistributionData[selectedAttribute].properties.length }) }}
                </small>
              </BCol>
            </BRow>
            <div
              v-if="selectedAttribute"
              class="mb-3">
              <div
                v-for="(prop, index) in attributeDistributionData[selectedAttribute].properties"
                :key="prop.key">
                <BRow
                  v-if="index < 5"
                  class="mt-4">
                  <BCol sm="2">
                    <small>{{ prop.key === 'NONE' ? $t('governance.accessModeling.attributeNone') : prop.key }}</small>
                  </BCol>
                  <BCol sm="7">
                    <BProgress
                      :max="membersTotalCount"
                      :value="prop.count" />
                  </BCol>
                  <BCol sm="3">
                    {{ `${prop.count} (${round((prop.count / membersTotalCount) * 100, 0)}%)` }}
                  </BCol>
                </BRow>
              </div>
              <div
                v-if="attributeDistributionData[selectedAttribute].properties.length > 5"
                class="mt-1" />
              <BCollapse v-model="showAll">
                <div
                  v-for="(prop, index) in attributeDistributionData[selectedAttribute].properties"
                  :key="prop.key">
                  <BRow
                    v-if="index >= 5"
                    class="mt-4">
                    <BCol sm="2">
                      <small>{{ prop.key }}</small>
                    </BCol>
                    <BCol sm="7">
                      <BProgress
                        :max="membersTotalCount"
                        :value="prop.count" />
                    </BCol>
                    <BCol sm="3">
                      {{ `${prop.count} (${round((prop.count / membersTotalCount) * 100, 0)}%)` }}
                    </BCol>
                  </BRow>
                </div>
              </BCollapse>
              <BButton
                v-if="attributeDistributionData[selectedAttribute].properties.length > 5"
                variant="link"
                class="p-0 mt-2"
                @click="showAll = !showAll">
                {{ showAll ? $t('common.showLess') : $t('common.showMore') }}
              </BButton>
            </div>
          </BCard>
          <BCard>
            <BRow>
              <BCol>
                <FrSearchInput
                  v-model="userSearchQuery"
                  class="w-100"
                  data-testid="search-gov-resource-table"
                  :placeholder="$t('common.search')"
                  @clear="queryRoleMembers({ queryString: null })"
                  @search="queryRoleMembers({ queryString: userSearchQuery })" />
              </BCol>
              <FrListOrganizer
                class="d-flex justify-content-end"
                :column-organizer-key="'role_mining_members_columns'"
                v-model="availableAttributeColumns"
                @list-updated="updateColumnList" />
            </BRow>
          </BCard>
          <FrMembersTab
            :read-only="role?.role?.status !== 'draft'"
            :custom-columns="attributeColumns"
            :items="memberList"
            :count="membersCurrentCount"
            :is-loading="isQuerying || isSaving"
            :role="role"
            :role-id="roleId"
            :role-status="status"
            :role-schema="roleSchema"
            @load-data="queryRoleMembers"
            @update-tab-data="updateRoleRelationships" />
        </BTab>
        <BTab
          v-if="tabs.includes('accessPatterns')"
          :title="$t('governance.accessModeling.roleDetails.tabs.accessPatterns')"
          key="accessPatterns"
          lazy>
          <FrAccessPatterns
            :role="role.role"
            :user-schema="userSchema"
            :is-saving="isSaving"
            :available-attributes="availableAttributes"
            :save-patterns="updateRoleRelationships" />
        </BTab>
        <BTab
          v-if="tabs.includes('recommendations')"
          :title="$t('governance.accessModeling.roleDetails.tabs.recommendations')"
          key="recommendations"
          lazy>
          <FrRecommendations
            :entitlements="allEntitlementData"
            :role="role"
            :candidate-role="candidateRole"
            :user-schema="userSchema"
            :is-loading="isSaving"
            @save-recommendations="updateRoleRelationships" />
        </BTab>
      </BTabs>
      <BCard
        v-if="tabIndex === 0">
        <div class="d-flex float-left">
          <BButton
            variant="danger"
            :disabled="isSaving"
            @click="bvModal.show('modal-delete');">
            {{ $t('common.delete') }}
          </BButton>
        </div>
        <div class="d-flex float-right">
          <BButton
            v-if="status === 'draft'"
            variant="outline-secondary"
            class="save-button"
            :disabled="!isFormChanged || isSaving"
            @click="saveRole">
            {{ $t('common.save') }}
          </BButton>
          <BButton
            v-if="status === 'draft'"
            :disabled="isSaving"
            variant="primary"
            @click="publishRole()">
            <FrIcon
              icon-class="mr-2"
              name="publish">
              {{ $t('common.publish') }}
            </FrIcon>
          </BButton>
          <BButton
            v-else-if="status === 'candidate'"
            :disabled="isSaving"
            variant="primary"
            @click="createDraftRole()">
            <FrIcon
              icon-class="mr-2"
              name="publish">
              {{ $t('common.draftRole') }}
            </FrIcon>
          </BButton>
        </div>
      </BCard>
      <FrDeleteModal
        id="modal-delete"
        :is-deleting="isSaving"
        :translated-item-type="$t('common.role')"
        :custom-message="$t('common.deleteRole')"
        @delete-item="deleteItem" />
    </div>
    <FrRequestSubmitSuccessModal
      :request-id="requestId"
      router-path="AdministerRoles"
      :success-text="i18n.global.t('governance.administer.roles.successPublish')" />
  </BContainer>
</template>
<script setup>
import {
  BButton,
  BCol,
  BCollapse,
  BContainer,
  BProgress,
  BRow,
  BTabs,
  BTab,
  BTooltip,
  BCard,
} from 'bootstrap-vue';
import {
  ref, onBeforeMount, computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  capitalize, cloneDeep, isNull, filter, find, map, omit, round, isUndefined, uniq,
} from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrEntitlementModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/EntitlementModal';
import FrDetailsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/RoleDetailsTabs/DetailsTab';
import FrEntitlementsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/EntitlementsTab';
import FrMembersTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/MembersTab';
import FrListOrganizer from '@forgerock/platform-shared/src/components/ListOrganizer';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import {
  getRoleDataById, getRoleList, deleteRole, createRole, modifyRole, getMemberDistribution,
} from '@forgerock/platform-shared/src/api/governance/RoleApi';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getRoleStatusVariant, getRoleDateText } from '@forgerock/platform-shared/src/utils/governance/accessModeling';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import FrRequestSubmitSuccessModal from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccessModal';
import { downloadFile } from '@forgerock/platform-shared/src/utils/downloadFile';
import FrAccessPatterns from './AccessModelingTabs/AccessPatterns';
import FrRecommendations from './AccessModelingTabs/Recommendations';
import i18n from '@/i18n';
import styles from '@/scss/main.scss';

const { setBreadcrumb } = useBreadcrumb();
const { bvModal } = useBvModal();

const route = useRoute();
const router = useRouter();
const isFormChanged = ref(false);
const tabIndex = ref(0);
const role = ref({});
const candidateRole = ref({});
const isLoading = ref(true);
const memberList = ref([]);
const membersCurrentCount = ref(0);
const membersTotalCount = ref(0);
const entitlementList = ref([]);
const selectedEntitlement = ref({});
const candidateEntitlementList = ref([]);
const entitlementTotalCount = ref(0);
const selectedAttribute = ref(null);
const showAll = ref(false);
const attributeColumns = ref([]);
const availableAttributes = ref([]);
const availableAttributeColumns = ref([]);
const attributeDistributionData = ref({});
const attributeDropdownOptions = ref([]);
const isQuerying = ref(false);
const { roleId, status } = route.params;
const userSchema = ref({});
const glossarySchema = ref({});
const roleSchema = ref({});
const entitlementSchema = ref({});
const userSearchQuery = ref('');
const entitlementSearchQuery = ref('');
const requestId = ref('');

const lastUpdated = computed(() => getRoleDateText(role.value?.role?.metadata?.modifiedDate));
const identityCoverage = computed(() => (round((role.value?.role?.memberCount / role.value?.role?.totalSystemUsers) * 100, 1) || 0));
const identityCoverageDifference = computed(() => round(identityCoverage.value - ((round((candidateRole.value?.role?.memberCount / candidateRole.value?.role?.totalSystemUsers) * 100, 1) || 0)), 1));
const averageAssignmentConfidence = computed(() => round(role.value.role?.confidence * 100, 1) || 0);
const averageAssignmentConfidenceDifference = computed(() => round(averageAssignmentConfidence.value - (round(candidateRole.value?.role?.confidence * 100, 1) || 0), 1));
const allEntitlementData = computed(() => entitlementList.value.concat(candidateEntitlementList.value));
const isSaving = ref(false);
const tabs = computed(() => (role.value?.role?.candidateRoleId?.length > 0
  ? ['details', 'entitlements', 'members', 'accessPatterns', 'recommendations']
  : ['details', 'entitlements', 'members', 'accessPatterns']));

/**
 * Download/export the role to a .json file
 */
function downloadRole() {
  const roleToExport = role.value;
  const roleJSON = JSON.stringify(roleToExport.role, null, '  ');
  const fileName = roleToExport.role.name || roleId;
  downloadFile(roleJSON, 'application/json', `role-${fileName}.json`);
}

function showEntitlementDetails(entitlement) {
  selectedEntitlement.value = entitlement;
  bvModal.value.show('roleEntitlementDetails');
}

async function getMembersTotalCount() {
  const { data } = await getRoleDataById(roleId, status, 'members', { _pageSize: 0 });
  membersTotalCount.value = data?.totalHits;
}

/**
 * Get the role glossary schema.
 */
async function getGlossarySchemaData() {
  try {
    // get glossary schema and values
    const data = await getGlossarySchema('role');
    const entitlementSchemaData = await getGlossarySchema('assignment');
    const roleSchemaData = await getSchema('managed/alpha_role');
    glossarySchema.value = data;
    entitlementSchema.value = entitlementSchemaData;
    roleSchema.value = map(roleSchemaData?.data.properties, (prop, key) => ({
      ...prop,
      propName: key,
    }));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.administer.entitlements.errorGettingEntitlement'));
  }
}

/**
 * Queries the entitlements that belong to the given role
 * @param params query parameters
 */
async function queryRoleEntitlements(params = {}) {
  isQuerying.value = true;
  entitlementList.value = [];
  if (params.queryString && !isNull(params.queryString)) {
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
  const { data } = await getRoleDataById(roleId, status, 'entitlements', queryParams);
  entitlementList.value = data?.result;
  entitlementTotalCount.value = data?.totalCount;
  isQuerying.value = false;
}

/**
 * Parse the member attribute distribution data to be displayed in the members tab
 * @param distributionData the distribution data to parse
 */
function parseAttributeDistribution(distributionData) {
  const newAttributeDropdownOptions = [];
  const newAttributeDistributionData = {};
  const newAvailableAttributes = [];
  const newAttributeColumns = [{
    key: 'userName',
    label: i18n.global.t('common.user.userName'),
    initialSort: true,
    sortKey: 'userName',
    sortable: true,
    enabled: true,
  }];
  map(distributionData.memberProperties, (property) => {
    const matchingSchema = find(userSchema.value, (schema) => schema.key === property);
    const matchingDistributionProp = distributionData.distribution[property];
    newAttributeDistributionData[property] = {
      displayName: matchingSchema?.displayName,
      key: property,
      properties: matchingDistributionProp,
    };
    newAttributeDropdownOptions.push({
      text: matchingSchema?.displayName,
      value: property,
    });
    newAttributeColumns.push({
      key: property,
      label: matchingSchema?.displayName,
      sortKey: property,
      sortable: true,
      enabled: newAttributeColumns.length < 5,
    });
    if (matchingSchema) {
      newAvailableAttributes.push(matchingSchema);
    }
  });
  attributeDistributionData.value = newAttributeDistributionData;
  attributeDropdownOptions.value = newAttributeDropdownOptions;
  availableAttributes.value = newAvailableAttributes;
  const selectedAttributeColumns = cloneDeep(newAttributeColumns).slice(0, 5);
  selectedAttributeColumns.unshift({
    key: 'selected',
    label: '',
    class: 'checkbox-column',
  });
  attributeColumns.value = selectedAttributeColumns;
  availableAttributeColumns.value = newAttributeColumns;
  selectedAttribute.value = newAttributeDropdownOptions[0]?.value || null;
}

/**
 * Update the member list with the members that have been added directly
 * @param members the updated list of members to set
 */
function enrichMemberList(members) {
  const addedRoleMembers = role.value?.role?.addedRoleMembers || [];
  memberList.value = members.map((member) => {
    const isAddedMember = addedRoleMembers.includes(member.id);
    member.editable = isAddedMember;
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
    if (params.queryString && !isNull(params.queryString)) {
      params._queryFilter = `userName co '${params.queryString}' or givenName co '${params.queryString}' or sn co '${params.queryString}'`;
      delete params.queryString;
    }
    params._sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy || 'userName'}`;
    if (params.currentPage) {
      params._pagedResultsOffset = (params.currentPage - 1) * (params.pageSize || 10);
    }
    const { data } = await getRoleDataById(roleId, status, 'members', params);

    enrichMemberList(data?.result);
    membersCurrentCount.value = data?.totalHits;
  } finally {
    isQuerying.value = false;
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
 * Retrieves the account from the API and sets the account data.
*/
async function getRole() {
  try {
    const rolePromises = [
      getRoleDataById(roleId, status),
      queryRoleEntitlements(),
      queryRoleMembers(),
      getMemberDistribution(roleId, status),
    ];
    const results = await Promise.all(rolePromises);
    parseAttributeDistribution(results[3].data);
    const roleData = { ...results[0].data };
    if (roleData.role.candidateRoleId) {
      const searchParameters = {
        roleStatus: 'candidate',
        _queryFilter: `id eq '${roleData.role.candidateRoleId}'`,
      };
      const { data } = await getRoleList('role', searchParameters);
      const candidate = find(data.result, (r) => r.role.roleId !== roleId && r.role.entitlements?.length);
      let hasAdditionalEntitlements = false;
      if (candidate && candidate.role.entitlements) {
        map(candidate.role.entitlements, (entitlement) => {
          if (roleData.role.entitlements?.includes(entitlement)) {
            hasAdditionalEntitlements = true;
          }
        });
        if (hasAdditionalEntitlements) {
          const candidateData = await getRoleDataById(candidate.role.id, 'candidate', 'entitlements');
          candidateEntitlementList.value = candidateData.data?.result || [];
        }
      }
      candidateRole.value = candidate;
    }
    roleData.glossary = roleData.glossary?.idx?.['/role'] || {};
    role.value = roleData;
    enrichMemberList(memberList.value);
    getMembersTotalCount();
  } catch (e) {
    showErrorMessage(e, i18n.global.t('governance.accessModeling.failedGettingRole'));
  }
}

/**
 * Retrieves the user schema from the API to parse access patterns.
 */
async function getUserSchema() {
  const { data } = await getFilterSchema();
  userSchema.value = data.user;
}

async function deleteItem() {
  try {
    isSaving.value = true;
    await deleteRole(roleId, status);
    router.push({ name: 'AccessModeling' });
    displayNotification('success', i18n.global.t('governance.accessModeling.deleteSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.deleteObject', { object: 'role' }));
  } finally {
    isSaving.value = false;
  }
}

/**
 * Show the success modal on save.
 */
function showSuccessModal() {
  bvModal.value.show('successful-submit');
}

/**
 * Updates the local list of columns
 * @param updatedColumnList List of columns to update
 */
function updateColumnList(updatedColumnList) {
  availableAttributeColumns.value = updatedColumnList;
  attributeColumns.value = updatedColumnList.filter((column) => column.enabled);
  attributeColumns.value.unshift({
    key: 'selected',
    label: '',
    class: 'checkbox-column',
  });
}

/**
 * Save the request to publish a role.
 */
async function publishRole() {
  isSaving.value = true;

  const { id, roleStatus, ...object } = role.value.role;
  const payload = {
    role: {
      roleId: id,
      status,
      object,
      glossary: role.value.glossary,
    },
  };
  try {
    const { data } = await requestAction('publishRole', 'publish', null, payload);
    requestId.value = data.id;
    showSuccessModal();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: 'role' }));
  } finally {
    isSaving.value = false;
  }
}

/**
 * Save the request as a draft role.
 */
async function createDraftRole() {
  isSaving.value = true;
  const { id, name } = role.value.role;
  const payload = {
    role: {
      candidateRoleId: id,
      name,
    },
  };
  let newRoleId;
  try {
    const { data } = await createRole(payload);
    newRoleId = data.role.id;
    displayNotification('success', i18n.global.t('governance.accessModeling.draftSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: 'role' }));
  } finally {
    isSaving.value = false;
    if (newRoleId) {
      router.push({
        name: 'AccessModelingDetails',
        params: {
          status: 'draft',
          roleId: newRoleId,
          tab: 'details',
        },
      });
    }
  }
}

async function saveRole(relationships = {}) {
  const {
    name, description, justifications, entitlements, addedRoleMembers,
  } = role.value.role;
  if (role.value.glossary?.idx) {
    delete role.value.glossary.idx;
  }
  const payload = {
    role: {
      ...role.value.role,
      name,
      description,
      justifications: justifications || [],
      entitlements: relationships?.entitlements || entitlements,
      addedRoleMembers: relationships?.addedRoleMembers || addedRoleMembers,
    },
    glossary: {
      ...role.value.glossary,
    } || {},
  };
  delete payload.role.metadata;
  isSaving.value = true;
  try {
    await modifyRole(roleId, status, payload);
    displayNotification('success', i18n.global.t('governance.accessModeling.roleDetails.saveSuccess'));
    await getRole();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: 'role' }));
  } finally {
    isSaving.value = false;
  }
}

/**
 * Queries the entitlements that belong to the given role
 * @param params query parameters
 */
async function updateRoleRelationships(type, operation, data) {
  if (operation === 'load') return; // Role LCM functionality
  const relationshipData = {};
  if (type === 'entitlements') {
    let roleEntitlements = role.value.role.entitlements || [];
    map(data, (entitlement) => {
      if (!entitlement.operation) {
        // For components that pass in a global operation, set it on each entitlement for easier processing in this function
        entitlement.operation = operation;
      }
      if (entitlement.operation === 'add') {
        roleEntitlements.push(entitlement.id);
      } else {
        roleEntitlements = filter(roleEntitlements, (id) => id !== entitlement.id);
      }
    });
    relationshipData.entitlements = uniq(roleEntitlements);
    saveRole(relationshipData);
  } else if (type === 'members') {
    if (operation === 'add') {
      relationshipData.addedRoleMembers = uniq((role.value.role.addedRoleMembers || []).concat(map(data, (member) => (member.id || member._id))));
      saveRole(relationshipData);
    } else if (operation === 'remove') {
      const idsToRemove = map(data, 'id');
      const newMembers = filter((role.value.role.addedRoleMembers || []), (member) => idsToRemove.indexOf(member) < 0);
      relationshipData.addedRoleMembers = newMembers;
      saveRole(relationshipData);
    }
  } else if (type === 'justifications') {
    if (!role.value.role.justifications) {
      role.value.role.justifications = [];
    }
    map(data, (justification) => {
      if (justification.operation === 'add') {
        role.value.role.justifications.push(justification.id);
      } else if (justification.operation === 'remove') {
        role.value.role.justifications = filter(role.value.role.justifications, (j) => j !== justification.id);
      }
    });
    role.value.role.justifications = uniq(role.value.role.justifications);
    await saveRole();
  }
}

/**
 * Handles changes to all tabs and saves the updates locally.
 * * * @param {String} tabUpdated - The tab being updated.
 * * * @param {String} operation - The operation being performed.
 * * * @param {Array | Object} data - The data associated with the operation.
 */
async function updateTabData(tabUpdated, operation, data) {
  if (isUndefined(data)) return;
  if (tabUpdated === 'details') {
    role.value.role = {
      ...role.value.role,
      ...data.role,
    };
    role.value.glossary = {
      ...role.value.glossary,
      ...data.glossary,
    };
  }
  isFormChanged.value = true;
}

onBeforeMount(async () => {
  isFormChanged.value = false;
  const matchedTab = tabs.value
    .findIndex((key) => key === route.params.tab);
  tabIndex.value = matchedTab > -1 ? matchedTab : 0;
  setBreadcrumb('/access-modeling', i18n.global.t('governance.accessModeling.title'));
  isLoading.value = true;
  await getUserSchema();
  await getGlossarySchemaData();
  await getRole();
  isLoading.value = false;
});

</script>

<style lang="scss" scoped>
.access-card {
  height: 325px;
}

.save-button {
  margin-right: 5px;
}

.badge-col {
  text-align: center;
}
</style>

<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrHeader
        :title="i18n.global.t('governance.accessModeling.title')"
        :subtitle="i18n.global.t('governance.accessModeling.subtitle')" />
      <div class="d-flex flex-column my-5">
        <BRow
          class="mb-4">
          <BCol sm="4">
            <BCard class="access-card">
              <div class="d-flex align-items-center justify-content-start">
                <h2 class="h5 mb-0">
                  {{ i18n.global.t('governance.accessModeling.charts.assignmentCoverage.title') }}
                </h2>
                <div
                  id="assignmentCoverage-tooltip"
                  class="tooltip-button"
                  tabindex="0">
                  <FrIcon
                    icon-class="ml-1 mt-1"
                    name="info" />
                </div>
                <BTooltip
                  no-fade
                  target="assignmentCoverage-tooltip"
                  triggers="hover"
                  position="top">
                  {{ $t('governance.accessModeling.tooltips.assignmentCoverage') }}
                </BTooltip>
              </div>
              <div>
                <small>
                  {{ i18n.global.t('governance.accessModeling.charts.assignmentCoverage.subtitle') }}
                </small>
              </div>
              <div class="d-flex justify-content-center mt-4">
                <FrSpinner
                  v-if="metricsLoading"
                  class="fr-spinner"
                  size="md" />
                <FrCircleProgressBar
                  v-else
                  :progress="roleMetrics.covered_assignments_percent * 100"
                  :size="196"
                >
                  <template #count>
                    <h3 class="mb-0 h1">
                      {{ `${round(roleMetrics.covered_assignments_percent * 100, 2)}%` }}
                    </h3>
                  </template>
                </FrCircleProgressBar>
              </div>
            </BCard>
          </BCol>
          <BCol sm="4">
            <BCard class="access-card">
              <div class="d-flex align-items-center justify-content-start">
                <h2 class="h5 mb-0">
                  {{ i18n.global.t('governance.accessModeling.charts.assignmentConfidence.title') }}
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
                    {{ $t('governance.accessModeling.tooltips.assignmentConfidence') }}
                  </BTooltip>
                </div>
              </div>
              <div>
                <small>
                  {{ i18n.global.t('governance.accessModeling.charts.assignmentConfidence.subtitle') }}
                </small>
              </div>
              <div class="d-flex justify-content-center mt-4">
                <FrSpinner
                  v-if="metricsLoading"
                  class="fr-spinner"
                  size="md" />
                <FrCircleProgressBar
                  v-else
                  :progress="roleMetrics.average_confidence * 100"
                  :size="196"
                  :color="styles.green"
                >
                  <template #count>
                    <h3 class="mb-0 h1">
                      {{ `${round(roleMetrics.average_confidence * 100, 2)}%` }}
                    </h3>
                  </template>
                </FrCircleProgressBar>
              </div>
            </BCard>
          </BCol>
          <BCol sm="4">
            <BCard class="access-card">
              <div class="d-flex justify-content-between">
                <div class="d-flex align-items-center justify-content-start w-50">
                  <h2 class="h5 mb-0">
                    {{ i18n.global.t('governance.accessModeling.charts.jobInfo.title') }}
                  </h2>
                  <div
                    :id="`jobInfo-tooltip`"
                    class="tooltip-button"
                    tabindex="0">
                    <FrIcon
                      icon-class="ml-1 mt-1"
                      name="info" />
                    <BTooltip
                      no-fade
                      target="jobInfo-tooltip"
                      triggers="hover"
                      position="top">
                      {{ $t('governance.accessModeling.tooltips.jobInfo') }}
                    </BTooltip>
                  </div>
                </div>
                <BButton
                  variant="primary"
                  :disabled="isRoleMiningJobLaunching || isRoleMiningJobRunning"
                  @click="runRoleMiningJob">
                  {{ i18n.global.t('governance.accessModeling.charts.jobInfo.runJob') }}
                </BButton>
              </div>
              <div class="d-flex justify-content-center mt-4">
                <FrSpinner
                  v-if="metricsLoading"
                  class="fr-spinner"
                  size="md" />
                <div
                  class="flex-grow-1"
                  v-else>
                  <div
                    v-for="(value, key) in jobInfo"
                    class="d-flex justify-content-between mb-1 align-items-center"
                    sm="12"
                    :key="key">
                    <div class="d-flex flex-row">
                      <div class="h5">
                        {{ i18n.global.t(`governance.accessModeling.charts.jobInfo.${key}`) }}
                      </div>
                      <div
                        v-if="key === 'confidenceThreshold' || key === 'entitlementsThreshold'"
                        :id="`jobInfo-${key}-tooltip`"
                        class="tooltip-button"
                        tabindex="0">
                        <FrIcon
                          icon-class="ml-1 mb-2"
                          name="info" />
                        <BTooltip
                          no-fade
                          :target="`jobInfo-${key}-tooltip`"
                          triggers="hover"
                          position="top">
                          {{ $t(`governance.accessModeling.tooltips.${key}`) }}
                        </BTooltip>
                      </div>
                    </div>
                    <div class="d-flex align-items-center">
                      <template v-if="EDITABLE_JOB_INFO_KEYS.includes(key) && editingField === key">
                        <div class="mr-2">
                          <!-- type="text" + inputmode follows the FrBasicInput number-field pattern:
                               spinner buttons and browser validation quirks hurt a11y, while
                               inputmode/pattern still give mobile users a numeric keyboard -->
                          <BFormInput
                            v-model="editValue"
                            size="sm"
                            class="w-90px"
                            type="text"
                            inputmode="decimal"
                            pattern="[0-9]*[.]?[0-9]*"
                            :min="key === 'confidenceThreshold' ? 0.01 : 1"
                            :max="key === 'confidenceThreshold' ? 1 : null"
                            :step="key === 'confidenceThreshold' ? 0.01 : 1"
                            :aria-label="i18n.global.t(`governance.accessModeling.charts.jobInfo.${key}`)"
                            :aria-invalid="editError ? 'true' : null"
                            :aria-describedby="editError ? `jobInfo-${key}-edit-error` : null"
                            :state="editError ? false : null"
                            @input="editError = null" />
                          <small
                            v-if="editError"
                            :id="`jobInfo-${key}-edit-error`"
                            role="alert"
                            class="text-danger">
                            {{ editError }}
                          </small>
                        </div>
                        <BButton
                          variant="link"
                          class="p-0 mr-1"
                          :disabled="isSavingThreshold"
                          :aria-label="i18n.global.t('common.save')"
                          @click="saveEdit(key)">
                          <FrIcon name="check" />
                        </BButton>
                        <BButton
                          variant="link"
                          class="p-0"
                          :aria-label="i18n.global.t('common.cancel')"
                          :disabled="isSavingThreshold"
                          @click="cancelEdit">
                          <FrIcon name="close" />
                        </BButton>
                      </template>
                      <template v-else>
                        {{ value }}
                        <BButton
                          v-if="EDITABLE_JOB_INFO_KEYS.includes(key)"
                          variant="link"
                          class="p-0 ml-1"
                          :disabled="!roleMiningConfigLoaded || isSavingThreshold"
                          :aria-label="i18n.global.t('common.edit')"
                          @click="startEdit(key, value)">
                          <FrIcon name="edit" />
                        </BButton>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </BCard>
          </BCol>
        </BRow>
        <FrAccessModelingTable
          :roles="roles"
          :title="$t('governance.accessModeling.title')"
          :is-loading="isLoading"
          :total-rows="totalPagedResults"
          :page-size="entriesPerPage"
          :num-filters="numFilters"
          @load-roles="search"
          @navigate-to-details="navigateToDetails" />
      </div>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BButton,
  BCard,
  BCol,
  BContainer,
  BFormInput,
  BRow,
  BTooltip,
} from 'bootstrap-vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  isEmpty, isNil, map, mapValues, omitBy, round,
} from 'lodash';
import dayjs from 'dayjs';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  getRoleMetrics, getRoleMiningConfig, launchRoleMiningJob, putRoleMiningConfig,
} from '@forgerock/platform-shared/src/api/governance/AccessModelingApi';
import { getRoleList } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getRoleRecommendationsCount } from '@forgerock/platform-shared/src/utils/governance/accessModeling';
import FrAccessModelingTable from '@forgerock/platform-shared/src/components/governance/AccessModeling/AccessModelingTable';
import i18n from '@/i18n';
import styles from '@/scss/main.scss';

const router = useRouter();
const candidateRoles = ref([]);
const entriesPerPage = ref(10);
const totalPagedResults = ref(0);
const numFilters = ref(0);
const tableLoading = ref(true);
const roles = ref([]);
const sortBy = ref('name');
const sortDesc = ref(false);
const metricsLoading = ref(false);
const isLoading = ref(false);
const isRoleMiningJobLaunching = ref(false);
const isRoleMiningJobRunning = ref(false);
const editingField = ref(null);
const editValue = ref(null);
const editError = ref(null);
// True while a threshold PUT is in flight. editingField is cleared before the PUT resolves, so
// without this the user can start and save a second field while the first PUT is pending,
// producing two overlapping PUTs whose payloads can race each other.
const isSavingThreshold = ref(false);
// Inline editing PUTs the full threshold set, so it stays disabled until a config load
// succeeds; otherwise a save would overwrite configured values with Number(null) = 0.
const roleMiningConfigLoaded = ref(false);
const EDITABLE_JOB_INFO_KEYS = ['confidenceThreshold', 'entitlementsThreshold', 'minimumRoleMembership'];
const jobInfo = ref({
  runId: null,
  runDate: null,
  confidenceThreshold: null,
  entitlementsThreshold: null,
  minimumRoleMembership: null,
  removeRedundant: false,
});
const roleMetrics = ref({
  average_confidence: 0,
  covered_assignments_count: 0,
  covered_assignments_percent: 0,
  existing_assignments_count: 0,
  new_assignments_count: 0,
  new_assignments_percent: 0,
});

/**
 * Run the role mining job
 */
async function runRoleMiningJob() {
  try {
    isRoleMiningJobLaunching.value = true;
    await launchRoleMiningJob();
    isRoleMiningJobRunning.value = true;
    displayNotification('success', i18n.global.t('governance.accessModeling.roleMiningJobLaunched'));
  } catch (error) {
    if (error.status === 409) {
      isRoleMiningJobRunning.value = true;
    }
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedToRunJob'));
  } finally {
    isRoleMiningJobLaunching.value = false;
  }
}

/**
 * Fill jobInfo thresholds from the last job run's run_config, but only for fields that still
 * have no value from either source (mining config or a previous fallback). Checking the field,
 * not the config-load flag, keeps the two concurrent loads order-independent: the config's
 * non-nil values always assign (authoritative), while run_config only fills still-empty fields
 * — including fields the config resolved but left null.
 * @param {Object|null} runConfig - The run_config object from the role metrics response.
 * @returns {void}
 */
function applyThresholdFallbacks(runConfig) {
  if (runConfig == null) return;
  if (runConfig.conf_threshold != null && jobInfo.value.confidenceThreshold == null) jobInfo.value.confidenceThreshold = runConfig.conf_threshold;
  if (runConfig.ent_threshold != null && jobInfo.value.entitlementsThreshold == null) jobInfo.value.entitlementsThreshold = runConfig.ent_threshold;
  if (runConfig.freq_threshold != null && jobInfo.value.minimumRoleMembership == null) jobInfo.value.minimumRoleMembership = runConfig.freq_threshold;
}

/**
 * Get the Assignment Coverage, Average Assignment Confidence, and Latest Role Mining job statistics
 */
async function queryRoleMetrics() {
  metricsLoading.value = true;
  const keys = Object.keys(roleMetrics.value);
  try {
    const { data } = await getRoleMetrics();
    keys.forEach((key) => {
      if (data[key] !== undefined) {
        roleMetrics.value[key] = data[key];
      }
    });
    jobInfo.value.runId = data.run_id;
    jobInfo.value.runDate = data.run_date ? dayjs(data.run_date).format('MMM D, YYYY h:mm A') : blankValueIndicator;
    jobInfo.value.removeRedundant = data.run_config?.stem_enabled;
    // The mining config is authoritative for the threshold fields; run_config (last job
    // run) is only a fallback for fields the config load did not populate. Neither writer
    // is guaranteed to resolve first, so order-independence matters: whoever resolves
    // later must not clobber values already shown from the other source.
    applyThresholdFallbacks(data.run_config);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedGettingMetrics'));
  } finally {
    metricsLoading.value = false;
  }
}

/**
 * Load the role mining configuration and populate threshold values in jobInfo. Non-nil config
 * values overwrite whatever is displayed; null fields keep any value already shown (e.g. from a
 * run_config fallback) rather than blanking it.
 */
async function loadRoleMiningConfig() {
  try {
    const { data } = await getRoleMiningConfig();
    if (data.roleMiningConfidenceThreshold != null) jobInfo.value.confidenceThreshold = data.roleMiningConfidenceThreshold;
    if (data.roleMiningEntitlementThreshold != null) jobInfo.value.entitlementsThreshold = data.roleMiningEntitlementThreshold;
    if (data.roleMiningMembershipThreshold != null) jobInfo.value.minimumRoleMembership = data.roleMiningMembershipThreshold;
    roleMiningConfigLoaded.value = true;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedGettingRoleMiningConfig'));
  }
}

/**
 * Search roles
 * @param page number|null The page number to search for, if null current page is used
 */
async function search(searchParams = {}, queryFilter = {}) {
  const pagedResultsOffset = searchParams.pagedResultsOffset || 0;
  if (!isEmpty(searchParams)) {
    entriesPerPage.value = searchParams.pageSize || entriesPerPage.value;
    sortBy.value = searchParams.sortKeys || 'name';
    sortDesc.value = searchParams.sortDir === 'desc';
  }
  tableLoading.value = true;
  const searchParameters = {
    _pagedResultsOffset: pagedResultsOffset,
    _pageSize: entriesPerPage.value,
    _sortKeys: sortBy.value,
    roleStatus: 'candidate',
  };
  if (searchParameters._sortKeys === 'memberCount' || searchParameters._sortKeys === 'entitlementCount') {
    searchParameters._sortType = 'int';
  }
  if (sortDesc.value === true) {
    searchParameters._sortKeys = `-${searchParameters._sortKeys}`;
  }
  if (queryFilter) {
    const query = [];
    const { statusFilter, ...filters } = queryFilter;
    if (statusFilter) {
      searchParameters.roleStatus = statusFilter;
    }
    if (filters.applicationFilter) {
      query.push(`application.id eq "${filters.applicationFilter}"`);
    }
    if (filters.entitlementFilter) {
      query.push(`entitlements eq "${filters.entitlementFilter}"`);
    }
    if (filters.userFilter) {
      query.push(`addedRoleMembers eq "${filters.userFilter}"`);
    }
    if (filters.minMembersFilter > 0) {
      query.push(`memberCount gte ${filters.minMembersFilter}`);
    }
    if (filters.minEntitlementsFilter > 0) {
      query.push(`entitlementCount gte ${filters.minEntitlementsFilter}`);
    }
    numFilters.value = query.length;
    if (filters.nameFilter) {
      // Don't include nameFilter in the filter count badge
      query.push(`name co "${filters.nameFilter}"`);
    }
    searchParameters._queryFilter = query.join(' and ');
  }
  const rolesWithCandidateId = [];
  try {
    isLoading.value = true;
    const { data } = await getRoleList('role', searchParameters);
    const processedData = data?.result.map((item) => {
      if (item.role.candidateRoleId) {
        rolesWithCandidateId.push({ roleId: item.role.id, candidateRoleId: item.role.candidateRoleId });
      }
      const processedItem = {
        ...item.role,
        entitlements: item.role.entitlements || [],
        memberCount: item.role.memberCount || 0,
        entitlementCount: item.role.entitlementCount || 0,
        status: item.role.status,
      };
      return processedItem;
    });
    totalPagedResults.value = data.totalHits;
    if (rolesWithCandidateId.length) {
      const candidateRoleQueryFilter = map(rolesWithCandidateId, (role) => `id eq '${role.candidateRoleId}'`).join(' or ');
      const candidateQueryParams = {
        ...searchParameters,
        roleStatus: 'candidate',
        _queryFilter: candidateRoleQueryFilter,
      };
      const candidateResponse = await getRoleList('role', candidateQueryParams);
      if (candidateResponse?.data?.result) {
        candidateRoles.value = candidateResponse.data.result;
        map(processedData, (role) => {
          const matchingCandidateRole = candidateRoles.value.find((r) => r.role.id === role.candidateRoleId);
          if (matchingCandidateRole) {
            role.recommendations = getRoleRecommendationsCount(role, matchingCandidateRole.role);
          }
          return role;
        });
      }
    }
    roles.value = processedData;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedGettingRoles'));
    totalPagedResults.value = 0;
    roles.value = [];
  } finally {
    tableLoading.value = false;
    isLoading.value = false;
  }
}

function navigateToDetails(role) {
  router.push({
    name: 'AccessModelingDetails',
    params: {
      status: role.status,
      roleId: role.id,
      tab: 'details',
    },
  });
}

function startEdit(key, value) {
  if (isSavingThreshold.value) return;
  editingField.value = key;
  editValue.value = value;
  editError.value = null;
}

function cancelEdit() {
  if (isSavingThreshold.value) return;
  editingField.value = null;
  editValue.value = null;
  editError.value = null;
}

async function saveEdit(key) {
  if (isSavingThreshold.value) return;
  if (key === 'confidenceThreshold') {
    const num = Number(editValue.value);
    if (Number.isNaN(num) || num < 0.01 || num > 1) {
      editError.value = i18n.global.t('governance.accessModeling.invalidConfidenceThreshold');
      return;
    }
  } else if (key === 'entitlementsThreshold' || key === 'minimumRoleMembership') {
    const val = editValue.value;
    const num = Number(val);
    if (val === null || val === '' || val === undefined || !Number.isInteger(num) || num <= 0) {
      editError.value = i18n.global.t('governance.accessModeling.invalidIntegerThreshold');
      return;
    }
  }
  const originalValue = jobInfo.value[key];
  // Store the numeric conversion, not the input's raw string, so jobInfo stays
  // consistently typed (the template renders and the PUT payload both expect numbers).
  jobInfo.value[key] = Number(editValue.value);
  editingField.value = null;
  editValue.value = null;
  editError.value = null;
  isSavingThreshold.value = true;
  try {
    // Omit thresholds that were never loaded (null) rather than sending Number(null) = 0,
    // which would silently clobber configured values (and 0 is invalid for every field).
    // Omit before converting: Number(null) is 0, which isNil no longer catches.
    const loadedThresholds = omitBy({
      roleMiningConfidenceThreshold: jobInfo.value.confidenceThreshold,
      roleMiningMembershipThreshold: jobInfo.value.minimumRoleMembership,
      roleMiningEntitlementThreshold: jobInfo.value.entitlementsThreshold,
    }, isNil);
    await putRoleMiningConfig(mapValues(loadedThresholds, Number));
  } catch (error) {
    jobInfo.value[key] = originalValue;
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedSavingRoleMiningConfig'));
  } finally {
    isSavingThreshold.value = false;
  }
}

onMounted(async () => {
  queryRoleMetrics();
  loadRoleMiningConfig();
  search();
});

</script>
<style lang="scss" scoped>
.access-card {
  height: 325px;
}

</style>

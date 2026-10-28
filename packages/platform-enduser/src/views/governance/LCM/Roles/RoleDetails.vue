<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="my-5">
    <BMedia
      class="align-items-center mb-2"
      no-body>
      <BMediaAside class="align-self-center">
        <img
          v-if="role.icon"
          class="d-flex justify-content-center align-items-center m-4"
          height="48"
          :src="role.icon"
          :alt="$t('common.logo')">
        <img
          v-else
          width="54"
          height="54"
          class="align-self-center"
          :onerror="onImageError"
          :src="require('@forgerock/platform-shared/src/assets/images/custom.svg')"
          :alt="$t('common.logo')">
      </BMediaAside>
      <BMediaBody class="align-self-center overflow-hidden text-nowrap">
        <p class="text-muted mb-2">
          {{ $t('common.role') }}
        </p>
        <h1>
          {{ roleId === 'new' ? $t('governance.administer.roles.newRole') : role?.role?.name }}
        </h1>
      </BMediaBody>
      <div class="d-flex justify-content-end">
        <BButton
          class="mr-2"
          v-if="getSavingPermissions() && roleId === 'new'"
          variant="outline-secondary"
          :disabled="!isFormChanged || isLoading || isSaving"
          @click="saveRoleData('save')">
          {{ $t('common.saveAsDraft') }}
        </BButton>
        <BButton
          class="mr-2"
          v-if="roleStatus === 'draft' && roleId !== 'new'"
          variant="outline-secondary"
          :disabled="isLoading || isSaving"
          @click="saveRoleData('publish', true)">
          {{ $t('common.publish') }}
        </BButton>
        <BButton
          v-if="getSavingPermissions()"
          variant="primary"
          :disabled="!isFormChanged || isLoading || isSaving"
          @click="saveRoleData()">
          {{ $t('common.save') }}
        </BButton>
      </div>
    </BMedia>
    <BCard class="d-flex card-tabs-vertical role-tab-card">
      <BTabs
        pills
        vertical
        class="flex-nowrap card-tabs-vertical"
        content-class="position-inherit"
        v-model="tabIndex">
        <BTab
          v-for="(tab, idx) in tabsToShow"
          :key="tab.title"
          :title="tab.title"
          class="p-0">
          <Component
            v-if="roleSchema"
            :is="tab.component"
            :role="role"
            :role-id="roleId"
            :role-schema="roleSchema"
            :role-status="roleStatus"
            :create-role-permission="createRolePermission"
            :is-active="tabIndex === idx"
            :is-loading="isLoading"
            :items="itemsForTab"
            :count="countForTab"
            :hide-actions="tab.hideActions"
            :read-only="isReadOnly"
            :type="tab.type"
            @load-data="loadDataForTab"
            @update-tab-data="updateTabData" />
        </BTab>
      </BTabs>
    </BCard>
    <FrRequestSubmitSuccessModal
      :request-id="requestId"
      router-path="AdministerRoles"
      :success-text="successMessage"
      :heading-text="successHeading" />
    <FrRoleRequestProgressModal
      :is-testing="isTesting"
      :step-state="progressSteps"
      :similar-roles="similarRoles"
      :outcome="progressOutcome"
      :is-submitting="isSubmittingRequest"
      :can-continue="canReviewSimilarRoles"
      @close="closeProgressModal"
      @retry="retryProgressStep"
      @continue="submitRoleRequest" />
  </BContainer>
</template>

<script setup>
/**
 * Displays the list of roles with recommendations.
 * @component RoleDetails
 * @prop {Boolean} isLoading - Determines if the information is loading
 * @prop {Array} roles - All roles with recommendations
 */
import {
  BButton,
  BCard,
  BContainer,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import {
  ref,
  computed,
  onMounted,
} from 'vue';
import { useRoute } from 'vue-router';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import {
  filter, forEach, isUndefined, map,
} from 'lodash';
import { getApiErrorMessage, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { getPrivileges } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getRoleDataById, getRoleSimilarity, getRoleSimilarityById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrEntitlementsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/EntitlementsTab';
import FrMembersTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/MembersTab';
import FrDetailsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/RoleDetailsTabs/DetailsTab';
import FrRoleRequestProgressModal from '@forgerock/platform-shared/src/components/governance/LCM/Roles/RoleRequestProgressModal';
import FrRequestSubmitSuccessModal from '@/views/governance/LCM/RequestSubmitSuccessModal';
import i18n from '@/i18n';

// Composables
const route = useRoute();
const { bvModal } = useBvModal();
const { setBreadcrumb } = useBreadcrumb();
const { userId } = useUserStore();

const roleId = ref(route.params.roleId);
const roleStatus = ref(route.params.roleStatus);
const isLoading = ref(null);
const isSaving = ref(null);
const role = ref({});
const roleSchema = ref(null);
const entitlements = ref([]);
const entitlementCount = ref(0);
const members = ref([]);
const memberCount = ref(0);
const formData = ref({});
const isFormChanged = ref(false);
const requestId = ref('');
const successMessage = ref('');
const successHeading = ref('');
const createRolePermission = ref(false);
const modifyRolePermission = ref(false);
const similarRoles = ref([]);
const isTesting = ref(false);
const pendingSaveAction = ref(null);
const pendingSaveIsPublishDraftRequest = ref(false);
const progressSteps = ref({
  similarity: { state: 'pending', note: '' },
  submit: { state: 'pending', note: '' },
});
const progressOutcome = ref('');
const canReviewSimilarRoles = ref(false);
const isSubmittingRequest = ref(false);
// The modal can be dismissed mid-check (Esc/backdrop/Cancel while not
// submitting); this flag stops the in-flight step's continuation from
// submitting or re-opening the review for a canceled save
const saveFlowActive = ref(false);

const isReadOnly = computed(() => {
  if (roleId.value === 'new') return !createRolePermission.value;
  return !modifyRolePermission.value;
});

const tabs = [
  {
    component: FrDetailsTab,
    key: 'details',
    title: i18n.global.t('common.details'),
    type: 'role',
  },
  {
    component: FrEntitlementsTab,
    key: 'entitlements',
    title: i18n.global.t('governance.administer.roles.entitlements'),
  },
  {
    component: FrMembersTab,
    key: 'members',
    title: i18n.global.t('governance.administer.roles.members'),
  },
];

const tabIndex = ref(0);

/**
 * Check whether the user has permissions to save based on the current role status.
 */
function getSavingPermissions() {
  return (modifyRolePermission.value && roleId.value !== 'new') || (createRolePermission.value && roleId.value === 'new');
}

/**
 * Set which role permissions the user has.
 */
async function getPermissions() {
  const { data: privilegesData } = await getPrivileges(userId);
  if (privilegesData.permissions.includes('createRole')) createRolePermission.value = true;
  if (privilegesData.permissions.includes('modifyRole')) modifyRolePermission.value = true;
}

/**
 * Get the role details by ID.
 */
async function loadRole() {
  const queryParams = {
    fields: 'role, glossary',
    pageSize: 10,
  };
  const { data } = await getRoleDataById(roleId.value, roleStatus.value, null, queryParams);
  role.value = data;
  formData.value.role = data.role;
  formData.value.glossary = data.glossary?.idx['/role'] || {};
}

/**
 * Get the role's entitlements.
 */
async function loadRoleEntitlements() {
  isLoading.value = true;
  const { data } = await getRoleDataById(roleId.value, roleStatus.value, 'entitlements');
  entitlements.value = data.result;
  entitlementCount.value = data.resultCount;
  isLoading.value = false;
}

/**
 * Update the member list with the members that have been added directly
 * @param memberList the updated list of members to set
 */
function enrichMemberList(memberList) {
  const addedRoleMembers = role.value?.addedRoleMembers || [];
  const enrichedList = memberList.map((member) => {
    const isAddedMember = addedRoleMembers.includes(member.id);
    member.editable = isAddedMember || roleStatus.value === 'active';
    return member;
  });
  return enrichedList;
}

/**
 * Get the role's members.
 */
async function loadRoleMembers() {
  isLoading.value = true;
  const { data } = await getRoleDataById(roleId.value, roleStatus.value, 'members');
  members.value = enrichMemberList(data.result);
  memberCount.value = data.resultCount;
  isLoading.value = false;
}

/**
 * Show the success modal after saving.
 */
function showSuccessModal() {
  bvModal.value.show('successful-submit');
}

/**
 * Build the request payload for saving the role.
 * @param {Object} roleFormData - The role form data to save.
 * @returns {Object} The request payload, along with the request type and success message.
 */
function buildRoleSavePayload(roleFormData) {
  const {
    name, description, justifications,
  } = roleFormData.role;
  const payload = {
    role: {
      status: roleStatus.value,
      object: {
        name,
        description,
        justifications: justifications || [],
        entitlements: map(roleFormData.entitlements, 'id'),
      },
      glossary: roleFormData.glossary,
    },
  };
  let requestType = 'createRole';
  let successText = i18n.global.t('governance.administer.roles.successCreate');
  successHeading.value = '';
  if (pendingSaveIsPublishDraftRequest.value && roleStatus.value === 'draft') {
    requestType = 'publishRole';
    payload.role.roleId = roleId.value;
    successText = i18n.global.t('governance.administer.roles.successPublish');
  } else if (roleId.value !== 'new') {
    requestType = 'modifyRole';
    payload.role.roleId = roleId.value;
    // Saving an existing draft keeps it a draft — it is a save, not a request
    if (roleStatus.value === 'draft') {
      successHeading.value = i18n.global.t('governance.administer.roles.successDraftSaved');
    }
    successText = i18n.global.t('governance.administer.roles.successUpdate');
  } else if (pendingSaveAction.value === 'save') {
    // "Save as Draft" on a new role is a save, not a request
    successHeading.value = i18n.global.t('governance.administer.roles.successDraftSaved');
    successText = i18n.global.t('governance.administer.roles.successDraftCreate');
  }
  return { payload, requestType, successText };
}

/**
 * Perform the request submission step and route to the success modal.
 */
async function submitRoleRequest() {
  isSubmittingRequest.value = true;
  progressSteps.value.submit = { state: 'active', note: '' };
  try {
    const { payload, requestType, successText } = buildRoleSavePayload(formData.value);
    successMessage.value = successText;
    const { data } = await requestAction(requestType, pendingSaveAction.value, null, payload);
    if (!saveFlowActive.value) return;
    requestId.value = data.id;
    progressSteps.value.submit = {
      state: 'done',
      note: i18n.global.t('governance.administer.roles.requestProgress.noteRequestCreated', { requestId: data.id }),
    };
    progressOutcome.value = 'success';
    bvModal.value.hide('role-request-progress-modal');
    showSuccessModal();
  } catch (error) {
    if (!saveFlowActive.value) return;
    progressSteps.value.submit = {
      state: 'error',
      note: i18n.global.t('governance.administer.roles.requestProgress.noteSubmitFailed'),
    };
    progressOutcome.value = 'error';
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: 'role' }));
  } finally {
    isSubmittingRequest.value = false;
    isSaving.value = false;
  }
}

/**
 * Whether the similarity check should run: the backend rejects the call with
 * "Entitlements must be provided for this endpoint." when the role has no
 * entitlements to compare, so a role without them skips the check entirely.
 */
function roleHasEntitlementsToCompare() {
  return map(formData.value.entitlements, 'id').length > 0;
}

/**
 * Run the similarity check step. Auto-submits the request when the check
 * finds nothing to review (no entitlements to compare, or no similar roles);
 * only when matches are found does the user confirm via the Submit button.
 *
 * For an existing role the check compares the role as currently persisted on
 * the server (per the IGA-5059 contract for updates), not the unsaved form
 * data that gets submitted.
 */
async function runSimilarityStep() {
  progressSteps.value.similarity = { state: 'active', note: '' };
  try {
    let similarRolesResult = [];
    if (roleHasEntitlementsToCompare()) {
      let data;
      if (roleId.value !== 'new') {
        // Compares the role as currently persisted on the server
        ({ data } = await getRoleSimilarityById(roleId.value, roleStatus.value));
      } else {
        data = (await getRoleSimilarity({
          entitlements: map(formData.value.entitlements, 'id'),
          threshold: 30,
          limit: 10,
        })).data;
      }
      similarRolesResult = data?.result || [];
    }
    if (!saveFlowActive.value) return;
    similarRoles.value = similarRolesResult;
    progressSteps.value.similarity = {
      state: 'done',
      note: similarRolesResult.length
        ? i18n.global.t('governance.administer.roles.requestProgress.noteSimilarFound', { count: similarRolesResult.length })
        : i18n.global.t('governance.administer.roles.requestProgress.noteNoSimilar'),
    };
    if (similarRolesResult.length) {
      // Similar matches found: the user confirms submission via the Submit button
      canReviewSimilarRoles.value = true;
    } else {
      // Nothing to review: submit straight away
      await submitRoleRequest();
    }
  } catch (error) {
    if (!saveFlowActive.value) return;
    // If the backend still rejects the check because the role has no
    // entitlements to compare, treat the check as passed rather than failed.
    // Matches the backend message verbatim — a wording change flips this into a
    // check failure (pinned by the "no-entitlements backend error" test below).
    if (getApiErrorMessage(error, '').includes('Entitlements must be provided')) {
      similarRoles.value = [];
      progressSteps.value.similarity = {
        state: 'done',
        note: i18n.global.t('governance.administer.roles.requestProgress.noteNoSimilar'),
      };
      await submitRoleRequest();
      return;
    }
    progressSteps.value.similarity = {
      state: 'error',
      note: i18n.global.t('governance.administer.roles.requestProgress.noteCheckFailed'),
    };
    progressOutcome.value = 'error';
  }
}

/**
 * Retry from the progress modal: re-run only the failed step, reusing
 * results from steps that already completed.
 */
async function retryProgressStep() {
  progressOutcome.value = '';
  if (progressSteps.value.similarity.state === 'error') {
    await runSimilarityStep();
  } else if (progressSteps.value.submit.state === 'error') {
    await submitRoleRequest();
  }
}

/**
 * Close the progress modal from Cancel/Done without submitting, and reset the
 * save flow so the header save buttons are re-enabled for another attempt.
 */
function closeProgressModal() {
  saveFlowActive.value = false;
  bvModal.value.hide('role-request-progress-modal');
  isSaving.value = false;
  canReviewSimilarRoles.value = false;
  progressOutcome.value = '';
  progressSteps.value = {
    similarity: { state: 'pending', note: '' },
    submit: { state: 'pending', note: '' },
  };
}

/**
 * Handle a Save/Save as Draft click: open the progress modal and run the
 * similarity check step, then continue based on the check result.
 * @param {String} action - The action to perform for the role update request.
 * @param {Boolean} isPublishDraftRequest - Whether the request is to publish a draft role.
 */
async function saveRoleData(action = 'publish', isPublishDraftRequest = false) {
  isSaving.value = true;
  saveFlowActive.value = true;
  pendingSaveAction.value = action;
  pendingSaveIsPublishDraftRequest.value = isPublishDraftRequest;
  similarRoles.value = [];
  canReviewSimilarRoles.value = false;
  progressOutcome.value = '';
  progressSteps.value = {
    similarity: { state: 'pending', note: '' },
    submit: { state: 'pending', note: '' },
  };
  bvModal.value.show('role-request-progress-modal');
  await runSimilarityStep();
}

/**
 * Retrieve all role data, then save it locally in the formData object.
 */
async function loadAllRoleDataForForm() {
  formData.value = {
    role: {},
    glossary: {},
    entitlements: [],
    members: [],
  };
  try {
    if (roleId.value !== 'new') {
      await Promise.all([
        loadRole(),
        loadRoleEntitlements(),
        loadRoleMembers(),
      ]);
      formData.value = {
        role: role.value.role,
        glossary: role.value.glossary?.idx?.['/role'] || {},
        entitlements: entitlements.value,
        members: members.value,
      };
    } else {
      formData.value.role = {
        name: '',
        description: '',
      };
    }
  } catch (e) {
    showErrorMessage(e, i18n.global.t('errors.errorRetrievingResource'));
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
    formData.value.role = {
      ...formData.value.role,
      ...data.role,
    };
    formData.value.glossary = {
      ...formData.value.glossary,
      ...data.glossary,
    };
  }
  if (tabUpdated === 'entitlements') {
    if (operation === 'load') {
      formData.value.entitlements = data.result;
      entitlementCount.value = data.resultCount;
    } else if (operation === 'add') {
      forEach(data, (entitlement) => {
        formData.value.entitlements.push(entitlement);
      });
      bvModal.value.hide('govCreateResourceModal');
    } else if (operation === 'remove') {
      const idsToRemove = map(data, 'id');
      const newEntitlements = filter(formData.value.entitlements, (entitlement) => idsToRemove.indexOf(entitlement.id) < 0);
      formData.value.entitlements = newEntitlements;
      bvModal.value.hide('revoke-from-role-modal');
    }
  }
  if (tabUpdated === 'members') {
    if (operation === 'load') {
      formData.value.members = data.result;
      memberCount.value = data.resultCount;
    } else if (operation === 'add') {
      const memberIds = map(data, (member) => member.usr_id || member._id || member.id);
      const results = await Promise.allSettled(
        memberIds.map((memberId) => requestAction('roleGrant', 'publish', null, { common: { userId: memberId, roleId: roleId.value } })),
      );
      await loadRoleMembers();
      formData.value.members = members.value;
      const firstRejected = results.find((r) => r.status === 'rejected');
      if (firstRejected) {
        showErrorMessage(firstRejected.reason, i18n.global.t('errors.savingObject', { object: 'role' }));
      } else {
        requestId.value = results[0]?.value?.data?.id;
        successMessage.value = i18n.global.t('governance.administer.roles.successMemberAdded');
        successHeading.value = '';
        showSuccessModal();
      }
    } else if (operation === 'remove') {
      const memberIds = map(data, (member) => member.user?.id || member._id || member.id);
      const results = await Promise.allSettled(
        memberIds.map((memberId) => requestAction('roleRemove', 'publish', null, { common: { userId: memberId, roleId: roleId.value } })),
      );
      await loadRoleMembers();
      formData.value.members = members.value;
      const firstRejected = results.find((r) => r.status === 'rejected');
      if (firstRejected) {
        showErrorMessage(firstRejected.reason, i18n.global.t('errors.savingObject', { object: 'role' }));
      } else {
        requestId.value = results[0]?.value?.data?.id;
        successMessage.value = i18n.global.t('governance.administer.roles.successMemberRemoved');
        successHeading.value = '';
        showSuccessModal();
      }
    }
    return;
  }
  isFormChanged.value = true;
}

const tabsToShow = computed(() => tabs.filter((tab) => tab.component !== FrMembersTab || roleId.value !== 'new'));
const activeTabKey = computed(() => tabsToShow.value[tabIndex.value]?.key);
const itemsForTab = computed(() => {
  if (activeTabKey.value === 'details') {
    return {
      role: formData.value.role,
      glossary: formData.value.glossary,
    };
  }
  if (activeTabKey.value === 'entitlements') {
    return formData.value.entitlements;
  }
  if (activeTabKey.value === 'members') {
    return formData.value.members;
  }
  return [];
});
const countForTab = computed(() => {
  if (activeTabKey.value === 'entitlements') {
    return entitlementCount.value;
  }
  if (activeTabKey.value === 'members') {
    return memberCount.value;
  }
  return [];
});
const loadDataForTab = computed(() => {
  if (activeTabKey.value === 'entitlements') {
    return loadRoleEntitlements;
  }
  if (activeTabKey.value === 'members') {
    return loadRoleMembers;
  }
  return [];
});

onMounted(async () => {
  isFormChanged.value = false;
  setBreadcrumb('/administer/roles', i18n.global.t('pageTitles.AdministerRoles'));
  const { data } = await getSchema('managed/alpha_role');
  roleSchema.value = map(data.properties, (prop, key) => ({
    ...prop,
    propName: key,
  }));
  loadAllRoleDataForForm();
  getPermissions();
});

</script>
<style lang="scss" scoped>
span.icon-large {
  width: 104px;
  height: 104px;
}

.role-tab-card {
  :deep(.card-body) {
    padding: 0 !important;
  }
}

:deep(.w-65) {
  width: 65% !important;
}

:deep(.tab-content) {
  overflow-x: visible !important;
}

:deep(.nav-pills .nav-link:not(.active)) {
  color: $gray-700;
}
</style>

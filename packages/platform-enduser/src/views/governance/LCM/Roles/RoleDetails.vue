<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

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
          :disabled="!isFormChanged"
          @click="saveRoleData('save')">
          {{ $t('common.saveAsDraft') }}
        </BButton>
        <BButton
          class="mr-2"
          v-if="roleStatus === 'draft'"
          variant="outline-secondary"
          :disabled="isLoading"
          @click="saveRoleData('publish', true)">
          {{ $t('common.publish') }}
        </BButton>
        <FrButtonWithSpinner
          v-if="getSavingPermissions()"
          variant="primary"
          :disabled="!isFormChanged || isLoading"
          :show-spinner="isSaving"
          @click="saveRoleData()" />
      </div>
    </BMedia>
    <BCard class="d-flex card-tabs-vertical role-tab-card">
      <BTabs
        pills
        vertical
        class="flex-nowrap"
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
      :success-text="successMessage" />
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
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { getPrivileges } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrEntitlementsTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/EntitlementsTab';
import FrMembersTab from '@forgerock/platform-shared/src/components/governance/LCM/Roles/MembersTab';
import FrDetailsTab from './RoleDetailsTabs/DetailsTab';
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
const createRolePermission = ref(false);
const modifyRolePermission = ref(false);

const isReadOnly = computed(() => {
  if (roleId.value === 'new') return !createRolePermission.value;
  return !modifyRolePermission.value;
});

const tabs = [
  {
    component: FrDetailsTab,
    title: i18n.global.t('common.details'),
    type: 'role',
  },
  {
    component: FrEntitlementsTab,
    title: i18n.global.t('governance.administer.roles.entitlements'),
  },
  {
    component: FrMembersTab,
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
  entitlementCount.value = data.totalCount;
  isLoading.value = false;
}

/**
 * Get the role's members.
 */
async function loadRoleMembers() {
  isLoading.value = true;
  const { data } = await getRoleDataById(roleId.value, roleStatus.value, 'members');
  members.value = data.result;
  memberCount.value = data.totalHits;
  isLoading.value = false;
}

/**
 * Show the success modal after saving.
 */
function showSuccessModal() {
  bvModal.value.show('successful-submit');
}

/**
 * Send the updated role to the server to save.
 * @param {String} action - The action to perform for the role update request.
 * @param {Boolean} isPublishDraftRequest - Whether the request is to publish a draft role.
 */
async function saveRoleData(action = 'publish', isPublishDraftRequest) {
  isSaving.value = true;
  try {
    const {
      name, description, justifications,
    } = formData.value.role;
    const payload = {
      role: {
        status: roleStatus.value,
        object: {
          name,
          description,
          justifications: justifications || [],
          entitlements: map(formData.value.entitlements, 'id'),
          addedRoleMembers: map(formData.value.members, (member) => member._id || member.id),
        },
        glossary: formData.value.glossary,
      },
    };
    let requestType = 'createRole';
    successMessage.value = i18n.global.t('governance.administer.roles.successCreate');
    if (isPublishDraftRequest && roleStatus.value === 'draft') {
      requestType = 'publishRole';
      payload.role.roleId = roleId.value;
      successMessage.value = i18n.global.t('governance.administer.roles.successPublish');
    } else if (roleId.value !== 'new') {
      requestType = 'modifyRole';
      payload.role.roleId = roleId.value;
      successMessage.value = i18n.global.t('governance.administer.roles.successUpdate');
    }
    const { data } = await requestAction(requestType, action, null, payload);
    requestId.value = data.id;
    showSuccessModal();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: 'role' }));
  } finally {
    isSaving.value = false;
  }
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
      entitlementCount.value = data.totalHits;
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
      memberCount.value = data.totalHits;
    } else if (operation === 'add') {
      const existingIds = map(formData.value.members, 'usr_id');
      forEach(data, (member) => {
        if (existingIds.indexOf(member.usr_id) < 0) {
          formData.value.members.push(member);
        }
      });
    } else if (operation === 'remove') {
      const idsToRemove = map(data, 'userId');
      const newMembers = filter(formData.value.members, (member) => idsToRemove.indexOf(member.userId) < 0);
      formData.value.members = newMembers;
    }
  }
  isFormChanged.value = true;
}

const tabsToShow = computed(() => tabs.filter(({ hide }) => !hide));
const itemsForTab = computed(() => {
  if (tabIndex.value === 0) {
    return {
      role: formData.value.role,
      glossary: formData.value.glossary,
    };
  }
  if (tabIndex.value === 1) {
    return formData.value.entitlements;
  }
  if (tabIndex.value === 2) {
    return formData.value.members;
  }
  return [];
});
const countForTab = computed(() => {
  if (tabIndex.value === 1) {
    return entitlementCount.value;
  }
  if (tabIndex.value === 2) {
    return memberCount.value;
  }
  return [];
});
const loadDataForTab = computed(() => {
  if (tabIndex.value === 1) {
    return loadRoleEntitlements;
  }
  if (tabIndex.value === 2) {
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
</style>

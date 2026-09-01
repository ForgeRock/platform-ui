<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButton
      variant="outline-secondary"
      type="button"
      class="d-inline-flex align-items-center mb-3"
      :aria-label="$t('governance.accessAnalysis.simulator.backToSimulator')"
      @click="$emit('back')">
      <FrIcon
        name="arrow_back"
        icon-class="mr-1 text-body" />
      <span>{{ $t('governance.accessAnalysis.simulator.backToSimulator') }}</span>
    </BButton>

    <h2 class="h5 mb-3">
      {{ title }}
    </h2>

    <BCard
      :class="{ 'd-none': isLoading || isLoadingRevokeOptions || !selectorsReady }"
      class="mb-4">
      <BRow class="align-items-end">
        <BCol md="5">
          <FrGovResourceSelect
            v-model="selectedUserValue"
            name="sim-user-select"
            resource-path="user"
            :initial-data="selectedUserInfo || {}"
            :label="$t('governance.accessAnalysis.simulator.userLabel')"
            :placeholder="$t('governance.accessAnalysis.simulator.searchByName')"
            :resource-function="igaUserResourceFunction"
            :query-param-function="igaUserQueryParamFunction"
            :option-function="igaUserOptionFunction"
            :set-initial-value="false"
            @get-user-info="(info) => selectedUserInfo = info"
            @input="(val) => selectedUserValue = val"
            @loaded="userSelectorReady = true" />
        </BCol>
        <BCol md="5">
          <FrGovResourceSelect
            v-if="showSecondaryDropdown"
            :key="isAdd ? `sim-secondary-${props.simulationType}` : `sim-secondary-${props.simulationType}-${selectedUserId}`"
            v-model="selectedRoleValue"
            name="sim-role-select"
            :resource-path="isRole ? 'role' : 'scope'"
            :label="roleLabel"
            :placeholder="isRole ? $t('governance.accessAnalysis.simulator.searchByRoleName') : $t('governance.accessAnalysis.simulator.searchByScopeName')"
            :resource-function="isAdd ? (isRole ? roleResourceFunction : scopeResourceFunction) : revokeResourceFunction"
            :query-param-function="isAdd ? (isRole ? roleQueryParamFunction : scopeQueryParamFunction) : revokeQueryParamFunction"
            :option-function="isRole ? roleOptionFunction : scopeOptionFunction"
            :set-initial-value="false"
            @input="(val) => selectedRoleValue = val"
            @loaded="roleSelectorReady = true" />
          <FrSpinner
            v-else-if="!isAdd && isLoadingRevokeOptions"
            class="py-2" />
          <p
            v-else-if="!isAdd && !isLoadingRevokeOptions && !selectedUserId"
            class="text-muted small mb-0 mt-2">
            {{ $t('governance.accessAnalysis.simulator.selectUserFirst') }}
          </p>
          <p
            v-else-if="!isAdd && !isLoadingRevokeOptions && selectedUserId && !revokeOptions.length"
            class="text-muted small mb-0 mt-2">
            {{ $t('governance.accessAnalysis.simulator.noOptionsFound') }}
          </p>
        </BCol>
        <BCol md="2">
          <BButton
            variant="primary"
            block
            :disabled="!canRun || isLoading"
            @click="runSimulation">
            {{ $t('governance.accessAnalysis.simulator.runSimulation') }}
          </BButton>
        </BCol>
      </BRow>
    </BCard>

    <FrSpinner
      v-if="isLoading || !selectorsReady"
      class="py-5" />

    <BCard
      v-if="!isLoading && selectorsReady"
      no-body>
      <BTableSimple
        v-if="hasRun && allResults.length"
        hover
        class="mb-0">
        <BThead>
          <BTr>
            <BTh class="fr-simulator__col-name">
              {{ $t('common.name') }}
            </BTh>
            <BTh class="fr-simulator__col-type">
              {{ $t('common.type') }}
            </BTh>
            <BTh class="fr-simulator__col-application">
              {{ $t('common.application') }}
            </BTh>
            <BTh class="fr-simulator__col-status">
              {{ $t('common.status') }}
            </BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr
            v-for="item in allResults"
            :key="`${item.type}-${item.id}`">
            <BTd class="fr-simulator__col-name">
              {{ item.name }}
            </BTd>
            <BTd class="fr-simulator__col-type text-muted">
              {{ item.type }}
            </BTd>
            <BTd class="fr-simulator__col-application">
              <div
                v-if="item.application"
                class="d-flex align-items-center">
                <div class="size-36 fr-app-logo-bg d-flex align-items-center justify-content-center mr-2">
                  <img
                    class="size-28"
                    alt=""
                    :src="getApplicationLogo(item.application)"
                    :onerror="onImageError">
                </div>
                {{ item.application.name || item.application.id }}
              </div>
              <span v-else>—</span>
            </BTd>
            <BTd class="fr-simulator__col-status">
              <div class="d-flex align-items-center">
                <FrIcon
                  :name="item.icon"
                  :icon-class="`mr-1 ${item.iconClass}`" />
                <span :class="`text-${item.labelVariant}`">{{ item.label }}</span>
              </div>
            </BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
      <FrNoData
        v-else
        :card="false"
        icon="inbox"
        :subtitle="$t(hasRun ? 'governance.accessAnalysis.simulator.noImpact' : 'governance.accessAnalysis.simulator.selectInputs', { resource: roleLabel.toLowerCase() })" />
    </BCard>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  BButton,
  BCard,
  BCol,
  BRow,
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getUsers, getUserById, getUserGrants } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getRoleDataById, getRoleList } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { getDefaultGovOption } from '@forgerock/platform-shared/src/utils/governance/select';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  simulationType: {
    type: String,
    required: true,
    validator: (v) => ['addRole', 'removeRole', 'addScope', 'removeScope'].includes(v),
  },
  getScopeList: { type: Function, default: null },
  getScopeById: { type: Function, default: null },
});

defineEmits(['back']);

const isAdd = computed(() => props.simulationType === 'addRole' || props.simulationType === 'addScope');
const isRole = computed(() => props.simulationType === 'addRole' || props.simulationType === 'removeRole');

const title = computed(() => i18n.global.t(`governance.accessAnalysis.simulator.${props.simulationType}.title`));
const roleLabel = computed(() => {
  const key = isRole.value ? 'governance.accessAnalysis.simulator.role' : 'governance.accessAnalysis.simulator.scope';
  return i18n.global.t(key);
});

// User select
const selectedUserValue = ref('');
const selectedUserInfo = ref(null);
const userSelectorReady = ref(false);
const roleSelectorReady = ref(false);

// Role/scope select
const selectedRoleValue = ref('');
const selectedRoleId = computed(() => selectedRoleValue.value?.split('/').pop() || '');

// For revoke modes: populated from the user's existing grants/scopes once a user is chosen
const revokeOptions = ref([]);
const isLoadingRevokeOptions = ref(false);
const selectedUserId = computed(() => selectedUserValue.value?.split('/').pop() || '');
const selectorsReady = computed(() => userSelectorReady.value
  && (isAdd.value ? roleSelectorReady.value : !selectedUserId.value || !isLoadingRevokeOptions.value));

const showSecondaryDropdown = computed(() => {
  if (isAdd.value) return true;
  return !isLoadingRevokeOptions.value && revokeOptions.value.length > 0;
});
const canRun = computed(() => !!selectedUserId.value && !!selectedRoleId.value);

// Results
const isLoading = ref(false);
const hasRun = ref(false);
const entitlementResults = ref([]);
const applicationResults = ref([]);
const scopeResults = ref([]);

watch(selectedUserId, () => {
  selectedRoleValue.value = '';
  hasRun.value = false;
  entitlementResults.value = [];
  applicationResults.value = [];
  scopeResults.value = [];
});

const allResults = computed(() => [
  ...entitlementResults.value,
  ...applicationResults.value,
  ...scopeResults.value,
]);

// User search adapters (same as CompareUserAccess)
function igaUserResourceFunction(_resource, params) {
  return getUsers(params);
}
function igaUserQueryParamFunction(queryString) {
  const params = { pageSize: 10, sortBy: 'userName', sortDir: 'asc' };
  if (queryString) {
    params._queryFilter = ['sn', 'givenName', 'userName', 'mail']
      .map((field) => `${field} co "${queryString}"`)
      .join(' or ');
  }
  return params;
}
function igaUserOptionFunction(resource) {
  return getDefaultGovOption(resource, 'user');
}

// Role search adapters
function roleResourceFunction(_resource, params) {
  return getRoleList('role', params);
}
function roleQueryParamFunction(queryString) {
  const params = { _pageSize: 10, roleStatus: 'active' };
  if (queryString) {
    params._queryFilter = `name co "${queryString}"`;
  }
  return params;
}
function roleOptionFunction(resource) {
  const role = resource?.role || resource;
  return {
    text: role.name || role.id,
    value: role.id,
    ...role,
  };
}

// Scope search adapters (addScope only)
function scopeResourceFunction(_resource, params) {
  return props.getScopeList(params);
}
function scopeQueryParamFunction(queryString) {
  const params = { _pageSize: 10 };
  if (queryString) {
    params._queryFilter = `name co "${queryString}"`;
  }
  return params;
}
function scopeOptionFunction(resource) {
  return {
    text: resource.name || resource.id,
    value: resource.id,
    ...resource,
  };
}

// Revoke adapters — filter against the pre-loaded revokeOptions list
function revokeResourceFunction(_resource, params) {
  const query = params?._queryFilter?.match(/co "(.*)"/)?.[1]?.toLowerCase() || '';
  const filtered = query
    ? revokeOptions.value.filter((o) => o.text.toLowerCase().includes(query))
    : revokeOptions.value;
  return Promise.resolve({ data: { result: filtered, resultCount: filtered.length } });
}
function revokeQueryParamFunction(queryString) {
  const params = {};
  if (queryString) params._queryFilter = `name co "${queryString}"`;
  return params;
}

async function loadRevokeOptions(userId) {
  revokeOptions.value = [];
  selectedRoleValue.value = '';
  if (!userId) return;
  isLoadingRevokeOptions.value = true;
  try {
    if (isRole.value) {
      const res = await getUserGrants(userId, { _queryFilter: "item.type eq 'roleMembership'", _pageSize: 100 });
      revokeOptions.value = (res?.data?.result || []).map((g) => {
        const id = g.role?.id || g.id;
        const name = g.role?.name || id;
        return {
          text: name,
          value: id,
          id,
          name,
        };
      });
    } else {
      const res = await getUserById(userId);
      const user = res?.data?.result?.[0];
      const scopeIds = [...new Set(
        Object.values(user?.scopes || {}).flat().map((s) => s?.id).filter(Boolean),
      )];
      if (scopeIds.length) {
        const scopeDetails = await Promise.allSettled(scopeIds.map((id) => props.getScopeById(id)));
        revokeOptions.value = scopeDetails.map((r, i) => {
          const scope = r.status === 'fulfilled' ? r.value?.data : null;
          const id = scopeIds[i];
          const name = scope?.name || id;
          return {
            text: name,
            value: id,
            id,
            name,
          };
        });
      }
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessAnalysis.simulator.errorRunning'));
  } finally {
    isLoadingRevokeOptions.value = false;
  }
}

watch(selectedUserId, (userId) => {
  if (!isAdd.value) loadRevokeOptions(userId);
});

function buildResultItem(item, userHas, addMode, type) {
  const name = item.descriptor?.idx?.['/entitlement']?.displayName
    || item.application?.name
    || item.name
    || item.id;

  if (userHas) {
    return {
      id: item.id,
      name,
      type,
      application: item.application,
      icon: 'check_circle',
      iconClass: 'text-muted',
      label: i18n.global.t('governance.accessAnalysis.simulator.alreadyHeld'),
      labelVariant: 'muted',
    };
  }
  if (addMode) {
    return {
      id: item.id,
      name,
      type,
      application: item.application,
      icon: 'add_circle',
      iconClass: 'text-success',
      label: i18n.global.t('governance.accessAnalysis.simulator.willBeGained'),
      labelVariant: 'success',
    };
  }
  return {
    id: item.id,
    name,
    type,
    application: item.application,
    icon: 'remove_circle',
    iconClass: 'text-danger',
    label: i18n.global.t('governance.accessAnalysis.simulator.willBeLost'),
    labelVariant: 'danger',
  };
}

async function runRoleSimulation() {
  const selectedRole = revokeOptions.value.find((o) => o.id === selectedRoleId.value);
  const roleType = i18n.global.t('governance.accessAnalysis.simulator.types.role');

  if (!isAdd.value) {
    // Always show the role itself as will be lost
    entitlementResults.value.push(buildResultItem(
      { id: selectedRoleId.value, name: selectedRole?.name || selectedRoleId.value, application: null },
      false,
      false,
      roleType,
    ));
  }

  const [roleEntResponse, userGrantsEntResponse, userGrantsAppResponse] = await Promise.allSettled([
    getRoleDataById(selectedRoleId.value, 'active', 'entitlements', { _pageSize: 100 }),
    getUserGrants(selectedUserId.value, { _queryFilter: "item.type eq 'entitlementGrant'", _pageSize: 100 }),
    getUserGrants(selectedUserId.value, { _queryFilter: "item.type eq 'accountGrant'", _pageSize: 100 }),
  ]);

  const roleEntitlements = roleEntResponse.status === 'fulfilled'
    ? (roleEntResponse.value?.data?.result || []) : [];
  const userEntitlementIds = new Set(
    (userGrantsEntResponse.status === 'fulfilled' ? userGrantsEntResponse.value?.data?.result || [] : [])
      .map((g) => g.id),
  );
  const userAppIds = new Set(
    (userGrantsAppResponse.status === 'fulfilled' ? userGrantsAppResponse.value?.data?.result || [] : [])
      .map((g) => g.id),
  );

  roleEntitlements.forEach((item) => {
    const isApplication = !item.descriptor?.idx?.['/entitlement'];
    const type = isApplication
      ? i18n.global.t('governance.accessAnalysis.simulator.types.application')
      : i18n.global.t('governance.accessAnalysis.simulator.types.entitlement');

    let resultItem;
    if (isAdd.value) {
      const userAlreadyHas = isApplication ? userAppIds.has(item.id) : userEntitlementIds.has(item.id);
      resultItem = buildResultItem(item, userAlreadyHas, true, type);
    } else {
      // For remove: show all role entitlements/apps as will be lost
      resultItem = buildResultItem(item, false, false, type);
    }

    if (isApplication) {
      applicationResults.value.push(resultItem);
    } else {
      entitlementResults.value.push(resultItem);
    }
  });
}

async function runScopeSimulation() {
  if (props.simulationType === 'addScope') {
    const [scopeResponse, userResponse] = await Promise.allSettled([
      props.getScopeById(selectedRoleId.value),
      getUserById(selectedUserId.value),
    ]);

    const scope = scopeResponse.status === 'fulfilled' ? scopeResponse.value?.data : null;
    const user = userResponse.status === 'fulfilled' ? userResponse.value?.data?.result?.[0] : null;
    const userScopeIds = new Set(
      Object.values(user?.scopes || {}).flat().map((s) => s?.id).filter(Boolean),
    );
    const userAlreadyHas = userScopeIds.has(selectedRoleId.value);
    scopeResults.value.push(buildResultItem(
      { id: selectedRoleId.value, name: scope?.name || selectedRoleId.value, application: null },
      userAlreadyHas,
      true,
      i18n.global.t('governance.accessAnalysis.simulator.types.scope'),
    ));
  } else {
    // removeScope — user already picked from their own scopes via revokeOptions
    const selected = revokeOptions.value.find((o) => o.id === selectedRoleId.value);
    const name = selected?.name || selectedRoleId.value;
    scopeResults.value.push(buildResultItem(
      { id: selectedRoleId.value, name, application: null },
      false,
      false,
      i18n.global.t('governance.accessAnalysis.simulator.types.scope'),
    ));
  }
}

async function runSimulation() {
  isLoading.value = true;
  hasRun.value = false;
  entitlementResults.value = [];
  applicationResults.value = [];
  scopeResults.value = [];

  try {
    if (isRole.value) {
      await runRoleSimulation();
    } else {
      await runScopeSimulation();
    }
    hasRun.value = true;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessAnalysis.simulator.errorRunning'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.fr-simulator {
  &__col-name {
    width: 50%;
    font-weight: 600;
  }

  &__col-type {
    width: 25%;
  }

  &__col-application {
    width: 25%;
  }

  &__col-status {
    width: 25%;
  }
}
</style>

<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <!-- Selector card -->
    <FrSpinner
      v-if="!selectorsReady"
      class="py-5" />
    <BCard
      :class="{ 'd-none': !selectorsReady }"
      class="mb-3">
      <BRow class="align-items-center">
        <BCol md="5">
          <FrGovResourceSelect
            :key="`user-a-${swapKey}`"
            v-model="userAValue"
            name="user-a-select"
            resource-path="user"
            :initial-data="userAInfo || {}"
            :label="$t('governance.accessAnalysis.userA')"
            :resource-function="igaUserResourceFunction"
            :query-param-function="igaUserQueryParamFunction"
            :option-function="igaUserOptionFunction"
            :set-initial-value="false"
            @get-user-info="(info) => userAInfo = info"
            @input="(val) => userAValue = val"
            @loaded="userASelectorReady = true" />
        </BCol>
        <BCol
          md="2"
          class="d-flex justify-content-center">
          <BButton
            variant="outline-secondary"
            class="fr-access-analysis__swap-btn"
            :aria-label="$t('governance.accessAnalysis.swapUsers')"
            @click="swapUsers">
            <FrIcon name="swap_horiz" />
          </BButton>
        </BCol>
        <BCol md="5">
          <FrGovResourceSelect
            :key="`user-b-${swapKey}`"
            v-model="userBValue"
            name="user-b-select"
            resource-path="user"
            :initial-data="userBInfo || {}"
            :label="$t('governance.accessAnalysis.userB')"
            :resource-function="igaUserResourceFunction"
            :query-param-function="igaUserQueryParamFunction"
            :option-function="igaUserOptionFunction"
            :set-initial-value="false"
            @get-user-info="(info) => userBInfo = info"
            @input="(val) => userBValue = val"
            @loaded="userBSelectorReady = true" />
        </BCol>
      </BRow>
    </BCard>

    <!-- Comparison tabs — only shown when both users selected -->
    <BTabs
      v-if="bothSelected"
      v-model="comparisonTabIndex"
      content-class="mt-0"
      nav-class="fr-tabs fr-access-analysis__comparison-tabs mb-0">
      <BTab>
        <template #title>
          <div class="d-flex align-items-center">
            <span class="mr-2">{{ $t('governance.accessAnalysis.compareTabs.attributes') }}</span>
            <span class="badge badge-primary badge-pill align-self-center">{{ attributeCount }}</span>
          </div>
        </template>
      </BTab>
      <BTab>
        <template #title>
          <div class="d-flex align-items-center">
            <span class="mr-2">{{ $t('governance.accessAnalysis.compareTabs.roles') }}</span>
            <span class="badge badge-primary badge-pill align-self-center">{{ rolesCount }}</span>
          </div>
        </template>
      </BTab>
      <BTab>
        <template #title>
          <div class="d-flex align-items-center">
            <span class="mr-2">{{ $t('governance.accessAnalysis.compareTabs.applications') }}</span>
            <span class="badge badge-primary badge-pill align-self-center">{{ applicationsCount }}</span>
          </div>
        </template>
      </BTab>
      <BTab>
        <template #title>
          <div class="d-flex align-items-center">
            <span class="mr-2">{{ $t('governance.accessAnalysis.compareTabs.entitlements') }}</span>
            <span class="badge badge-primary badge-pill align-self-center">{{ entitlementsCount }}</span>
          </div>
        </template>
      </BTab>
      <BTab v-if="userStore.adminUser">
        <template #title>
          <div class="d-flex align-items-center">
            <span class="mr-2">{{ $t('governance.accessAnalysis.compareTabs.scopes') }}</span>
            <span class="badge badge-primary badge-pill align-self-center">{{ scopesCount }}</span>
          </div>
        </template>
      </BTab>
    </BTabs>

    <!-- Results card -->
    <BCard :class="bothSelected ? 'mt-3' : ''">
      <p
        v-if="!bothSelected"
        class="text-center text-muted my-4 mb-0">
        {{ $t('governance.accessAnalysis.selectTwoIdentities') }}
      </p>
      <template v-else>
        <FrUserAttributesTab
          v-show="comparisonTabIndex === 0"
          :user-a-id="userAId"
          :user-b-id="userBId"
          :user-a-name="userADisplayName"
          :user-b-name="userBDisplayName"
          @update:count="(n) => attributeCount = n" />
        <FrUserGrantsTab
          v-show="comparisonTabIndex === 1"
          grant-type="roleMembership"
          :user-a-id="userAId"
          :user-b-id="userBId"
          :user-a-name="userADisplayName"
          :user-b-name="userBDisplayName"
          :column-label="$t('governance.accessAnalysis.compareTabs.roles')"
          @update:count="(n) => rolesCount = n"
          @open-details="openGrantDetails" />
        <FrUserGrantsTab
          v-show="comparisonTabIndex === 2"
          grant-type="accountGrant"
          :user-a-id="userAId"
          :user-b-id="userBId"
          :user-a-name="userADisplayName"
          :user-b-name="userBDisplayName"
          :column-label="$t('governance.accessAnalysis.compareTabs.applications')"
          @update:count="(n) => applicationsCount = n"
          @open-details="openGrantDetails" />
        <FrUserGrantsTab
          v-show="comparisonTabIndex === 3"
          grant-type="entitlementGrant"
          :user-a-id="userAId"
          :user-b-id="userBId"
          :user-a-name="userADisplayName"
          :user-b-name="userBDisplayName"
          :column-label="$t('governance.accessAnalysis.compareTabs.entitlements')"
          @update:count="(n) => entitlementsCount = n"
          @open-details="openGrantDetails" />
        <FrUserScopesTab
          v-if="userStore.adminUser"
          v-show="comparisonTabIndex === 4"
          :user-a-id="userAId"
          :user-b-id="userBId"
          :user-a-name="userADisplayName"
          :user-b-name="userBDisplayName"
          :get-scope-by-id="getScopeById"
          @update:count="(n) => scopesCount = n" />
      </template>
    </BCard>
    <FrAccountModal
      v-if="modalNode"
      :grant="modalNode"
      modal-id="access-analysis-account-grant" />
    <FrEntitlementModal
      v-if="modalNode"
      :entitlement="modalNode"
      :glossary-schema="glossarySchema.entitlementGrant || []"
      modal-id="access-analysis-entitlement-grant" />
    <FrRoleModal
      v-if="modalNode"
      :role-details="modalNode"
      :glossary-schema="glossarySchema.roleMembership || []"
      modal-id="access-analysis-role-membership" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import {
  BButton,
  BCard,
  BCol,
  BRow,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import {
  getGlossarySchema,
  getUserGrants,
  getUsers,
} from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getDefaultGovOption } from '@forgerock/platform-shared/src/utils/governance/select';
import FrAccountModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/AccountModal';
import FrEntitlementModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/EntitlementModal';
import FrRoleModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/RoleModal/RoleModal';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrUserAttributesTab from './UserAttributesTab';
import FrUserGrantsTab from './UserGrantsTab';
import FrUserScopesTab from './UserScopesTab';

// Adapters that plug the IGA governance/user endpoint into GovResourceSelect
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

defineProps({
  getScopeById: { type: Function, default: null },
});

const emit = defineEmits(['update:userA', 'update:userB']);

const userStore = useUserStore();
const { bvModal } = useBvModal();
const modalNode = ref(null);
const glossarySchema = ref({});

const userAValue = ref('');
const userBValue = ref('');
const userASelectorReady = ref(false);
const userBSelectorReady = ref(false);
const selectorsReady = computed(() => userASelectorReady.value && userBSelectorReady.value);
const userAInfo = ref(null);
const userBInfo = ref(null);
const comparisonTabIndex = ref(0);
const attributeCount = ref(0);
const swapKey = ref(0);
const rolesCount = ref(0);
const applicationsCount = ref(0);
const entitlementsCount = ref(0);
const scopesCount = ref(0);

// Extract the bare ID from the managed/user/{id} path emitted by GovResourceSelect
const userAId = computed(() => userAValue.value?.split('/').pop() || '');
const userBId = computed(() => userBValue.value?.split('/').pop() || '');
const bothSelected = computed(() => !!userAId.value && !!userBId.value);

const userADisplayName = computed(() => userAInfo.value?.userName || userAId.value);
const userBDisplayName = computed(() => userBInfo.value?.userName || userBId.value);

watch(userAValue, (val) => emit('update:userA', { value: val, info: userAInfo.value }));
watch(userBValue, (val) => emit('update:userB', { value: val, info: userBInfo.value }));

// Reset to Attributes tab and clear stale counts when either user changes
watch(bothSelected, () => {
  comparisonTabIndex.value = 0;
  attributeCount.value = 0;
  rolesCount.value = 0;
  applicationsCount.value = 0;
  entitlementsCount.value = 0;
  scopesCount.value = 0;
});

/**
 * Swaps User A and User B — User A drives pagination so swapping resets
 * the primary user context to whoever was previously User B.
 */
async function openGrantDetails({ grant, userId }) {
  if (!grant || !userId) return;
  try {
    const response = await getUserGrants(userId, {
      _queryFilter: `compositeId eq "${grant.compositeId}"`,
    });
    modalNode.value = response?.data?.result?.[0] || grant;
    if (!Object.keys(glossarySchema.value).length) {
      const schemaResponse = await getGlossarySchema();
      const schema = schemaResponse?.data || {};
      glossarySchema.value = {
        accountGrant: schema['/iga/governance/account'] || [],
        entitlementGrant: schema['/openidm/managed/assignment'] || [],
        roleMembership: schema['/openidm/managed/role'] || [],
      };
    }
    bvModal.value.show(`access-analysis-${grant.item?.type}`);
  } catch (error) {
    // The existing grant remains usable if enrichment fails.
    modalNode.value = grant;
    bvModal.value.show(`access-analysis-${grant.item?.type}`);
  }
}

function swapUsers() {
  const tempValue = userAValue.value;
  const tempInfo = userAInfo.value;
  userAValue.value = userBValue.value;
  userAInfo.value = userBInfo.value;
  userBValue.value = tempValue;
  userBInfo.value = tempInfo;
  swapKey.value += 1;
}
</script>

<style lang="scss" scoped>
.fr-access-analysis {
  &__swap-btn {
    min-width: 2.5rem;
    padding: 0.375rem 0.625rem;
  }

  &__comparison-tabs {
    border-bottom: 0;

    :deep(.nav-item .nav-link) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}
</style>

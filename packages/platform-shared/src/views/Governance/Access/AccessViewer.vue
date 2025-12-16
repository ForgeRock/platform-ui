<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      class="fr-access-viewer vh-100"
      :class="{ fullscreen }">
      <FrNavbar
        v-if="!fullscreen">
        <template #center-content>
          <BCol
            cols="4"
            class="d-flex justify-content-center align-items-center">
            <FrUserDetails
              :user-object="userObj" />
          </BCol>
        </template>
      </FrNavbar>
      <div class="d-flex h-100 w-100">
        <BCard
          v-if="leftPanelExpanded"
          class="fr-left-panel h-100 p-0 rounded-0"
          no-body>
          <div class="pb-0 w-100">
            <div class="d-flex px-4 align-items-center justify-content-between">
              <div class="d-flex py-3 align-items-center">
                <h2 class="h5 mb-0 py-3">
                  {{ $t('governance.access.filter.filters') }}
                </h2>
              </div>
              <div class="d-flex border-0 px-0 py-3 align-items-center">
                <BButtonClose
                  id="btnClosePanel"
                  class="text-dark"
                  variant="none"
                  :aria-label="$t('governance.access.filter.hideFilters')"
                  @click="leftPanelExpanded = false">
                  <FrIcon
                    icon-class="md-24"
                    name="close" />
                </BButtonClose>
                <BTooltip
                  target="btnClosePanel"
                  triggers="hover"
                  placement="bottom">
                  {{ $t('governance.access.filter.hideFilters') }}
                </BTooltip>
              </div>
            </div>
          </div>
          <div class="border-top p-2 flex-grow-1 overflow-auto">
            <!-- Filter component will be here next commit-->
          </div>
        </BCard>
        <div class="d-flex flex-column h-100 w-100 ">
          <FrAccessToolbar
            :fullscreen="fullscreen"
            :hide-filter="!leftPanelExpanded"
            :selected-types="grantTypes"
            @show-filter="leftPanelExpanded = true"
            @toggle-fullscreen="fullscreen = !fullscreen"
            @toggle-selected-type="toggleSelectedType"
            @zoom="zoomValue = $event" />
          <div
            v-if="loading"
            class="d-flex flex-column justify-content-center py-5 w-100 h-100">
            <FrSpinner />
            <div class="py-4 d-flex justify-content-center">
              {{ $t('governance.access.loadingAccess') }}
            </div>
          </div>
          <div
            v-else
            class="d-flex w-100 h-100 overflow-hidden">
            <div class="flex-fill">
              <FrAccessCanvas
                v-if="hasAccessToShow"
                :active-node-id="activeNodeId"
                :user-access="totalAccess"
                :read-only="true"
                :zoom-value="zoomValue"
                :selected-types="grantTypes"
                @change-selected-access="activeNodeId = $event" />
              <FrNoData
                v-else
                :card="false"
                class="mb-4 mt-4"
                icon="inbox"
                :title="$t('governance.access.noAccessFound')"
                :subtitle="$t('governance.access.noAccessFoundSubtitle')" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <FrAccountModal
      :grant="modalNode"
      modal-id="access-accountGrant" />
    <FrEntitlementModal
      :entitlement="modalNode"
      :glossary-schema="glossarySchema[modalNode?.item?.type] || []"
      modal-id="access-entitlementGrant" />
    <FrRoleModal
      :glossary-schema="glossarySchema[modalNode?.item?.type] || []"
      :role-details="modalNode"
      modal-id="access-roleMembership" />
  </div>
</template>

<script setup>
/**
  * Access viewer body contains the access canvas, side panels, and navigation bars
  */
import { isEqual } from 'lodash';
import {
  BButtonClose,
  BCard,
  BCol,
  BTooltip,
} from 'bootstrap-vue';
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
} from 'vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { useRoute } from 'vue-router';
import {
  getUserGrants, getGlossarySchema, getFilterSchema, getIgaAutoIdConfig,
} from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrAccountModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/AccountModal';
import FrEntitlementModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/EntitlementModal';
import FrRoleModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/RoleModal/RoleModal';
import { getManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import FrAccessToolbar from './components/AccessToolbar';
import FrAccessCanvas from './components/AccessCanvas';
import accessConstants from './utils/accessConstants';
import i18n from '@/i18n';

// Composables
const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();

// Data
const activeNodeId = ref(null);
const fullscreen = ref(false);
const leftPanelExpanded = ref(true);
const loading = ref(true);
const { resourceId } = route.params;
const userObj = ref({});
const userGrants = ref({});
const refreshPanel = ref(false);
const zoomValue = ref(80);
const modalNode = ref({});
const glossarySchema = ref({});
const filterSchema = ref({});
const autoIdSettings = ref({});
const queryFilters = ref({
  all: 'true',
  ...Object.fromEntries(Object.values(accessConstants.GRANT_TYPES).map((type) => [type, 'true'])),
});
const grantTypes = ref(Object.fromEntries(Object.values(accessConstants.GRANT_TYPES).map((type) => [type, true])));

// Computed
const userId = computed(() => resourceId.split('/').pop());
const totalAccess = computed(() => Object.values(userGrants.value).flat());
const selectedGrantTypes = computed(() => Object.keys(grantTypes.value).filter((type) => grantTypes.value[type]));
const hasAccessToShow = computed(() => totalAccess.value.length > 0);

/**
 * Get grants that belong to the selected user
 * @param params Query parameters
 * @param grantType Grant type(s) to query for specifically, uses selected types if null
 */
async function getGrantsForUser(params, specificGrantTypes) {
  try {
    const commonFields = ['compositeId', 'descriptor', 'keys', 'item', 'metadata', 'relationship', 'prediction'];
    const paramsMap = {
      [accessConstants.GRANT_TYPES.ACCOUNT]: {
        _fields: [...commonFields, 'application', 'account.__NAME__'],
        _sortKeys: 'application.name',
        _queryFilter: queryFilters.value[accessConstants.GRANT_TYPES.ACCOUNT] || 'true',
      },
      [accessConstants.GRANT_TYPES.ENTITLEMENT]: {
        _fields: [...commonFields, 'application', 'account.__NAME__', 'entitlement.__NAME__'],
        _sortKeys: 'application.name',
        _queryFilter: queryFilters.value[accessConstants.GRANT_TYPES.ENTITLEMENT] || 'true',
      },
      [accessConstants.GRANT_TYPES.ROLE]: {
        _fields: [...commonFields, 'role.name'],
        _sortKeys: 'role.name',
        _queryFilter: queryFilters.value[accessConstants.GRANT_TYPES.ROLE] || 'true',
      },
    };
    const grantTypesToQuery = specificGrantTypes || selectedGrantTypes.value;
    const unselectedTypes = Object.values(accessConstants.GRANT_TYPES).filter((type) => !grantTypesToQuery.includes(type));
    const grantPromises = [];
    grantTypesToQuery.forEach((type) => {
      const typeParams = {
        ...params,
        _fields: paramsMap[type]._fields,
        _sortKeys: paramsMap[type]._sortKeys,
        _queryFilter: paramsMap[type]._queryFilter && paramsMap[type]._queryFilter !== 'true' ? `item.type eq '${type}' and (${paramsMap[type]._queryFilter})` : `item.type eq '${type}'`,
      };
      grantPromises.push(getUserGrants(userId.value, typeParams));
    });
    const responses = await Promise.all(grantPromises);

    // Set the new responses
    grantTypesToQuery.forEach((type, index) => {
      const { data } = responses[index];
      userGrants.value[type] = data.result;
    });

    // Remove unselected data
    unselectedTypes.forEach(((type) => {
      delete userGrants.value[type];
    }));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.access.errorGettingData', { grantType: i18n.global.t('governance.access.access') }));
  }
}

/**
 * Set breadcrumb and query for all the initial required data, including user data, user grants, schema config, and IGA configurations
 */
onMounted(async () => {
  setBreadcrumb(`/managed-identities/managed/alpha_user/${userId.value}`, i18n.global.t('governance.access.backToUser'));
  try {
    loading.value = true;
    const userQueryParams = {
      _fields: ['givenName', 'sn', 'mail', 'id', 'userName', 'profileImage'],
    };
    const grantQueryParams = {
      _pageSize: 100,
    };
    const userPromises = [
      getManagedResource('alpha_user', userId.value, userQueryParams),
      getGrantsForUser(grantQueryParams),
      getGlossarySchema(),
      getFilterSchema(),
      getIgaAutoIdConfig(),
    ];
    const responses = await Promise.all(userPromises);
    userObj.value = responses[0].data;
    loading.value = false;
    glossarySchema.value = {
      accountGrant: responses[2].data['/iga/governance/account'],
      entitlementGrant: responses[2].data['/openidm/managed/assignment'],
      roleMembership: responses[2].data['/openidm/managed/role'],
    };
    filterSchema.value = responses[3].data;
    autoIdSettings.value = responses[4].data;
  } catch (error) {
    loading.value = false;
    showErrorMessage(error, i18n.global.t('governance.access.errorGettingUser'));
  }
});

/**
 * Toggles the selected access types to show/hide on the canvas
 * @param type Type of access to show/hide
 */
async function toggleSelectedType(type) {
  loading.value = true;
  grantTypes.value[type] = !grantTypes.value[type];
  await getGrantsForUser({});
  loading.value = false;
}

watch(
  () => activeNodeId.value,
  (newVal, oldVal) => {
    if (newVal && oldVal && !isEqual(newVal, oldVal)) {
      refreshPanel.value = true;
      nextTick(() => {
        refreshPanel.value = false;
      });
    }
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.fr-access-viewer {
  padding-bottom: 72px;

  :deep(.fr-main-navbar) {
    .dropdown-toggle::after {
      right: 0.15rem;
    }

    .dropdown-item.active:after {
      border: none;
      content: "check";
      position: absolute;
      right: 10px;
      top: 14px;
      font-family: Material Icons Outlined;
      font-size: 1rem;
      line-height: 1;
      color: $green;
      vertical-align: middle;
    }
  }

  .w-100vw {
    width: 100vw;
  }

  .z-index-0 {
    z-index: 0;
  }

  &.fullscreen {
    padding-bottom: 0;
  }

  .fr-left-panel {
    min-width: 300px;
    display: flex;
  }

  :deep(.fr-handle) {
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    top: 0;
    left: -5px;
    height: 100%;
    cursor: ew-resize;
    z-index: 1;
  }
}
</style>

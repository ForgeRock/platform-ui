<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="shadow-none h-100"
    header-class="p-3 text-truncate">
    <template #header>
      <div class="d-flex align-items-center">
        <FrIcon
          name="shield"
          class="mr-2" />
        <span class="font-weight-bold">
          {{ headerTitle }}
        </span>
      </div>
    </template>
    <BRow v-if="isRoleRequestType">
      <BCol lg="6">
        <small class="d-block mb-2">
          {{ $t('common.role') }}
        </small>
        <BButton
          variant="link"
          class="p-0 text-left"
          @click="bvModal.show('requestDetailsRoleModal')">
          {{ roleName || blankValueIndicator }}
        </BButton>
      </BCol>
    </BRow>
    <FrRoleModal
      v-if="isRoleRequestType"
      :glossary-schema="glossarySchema.role || []"
      :role-details="roleDetails"
      modal-id="requestDetailsRoleModal" />
    <div v-else>
      <div
        v-if="isEntitlementRequestType"
        class="mb-3">
        <small class="d-block mb-2">
          {{ $t('common.entitlement') }}
        </small>
        <BButton
          variant="link"
          class="p-0 text-left"
          @click="bvModal.show('requestDetailsEntitlementModal')">
          {{ entitlementName || blankValueIndicator }}
        </BButton>
      </div>
      <div>
        <small class="d-block mb-2">
          {{ $t('common.application') }}
        </small>
        <BButton
          class="text-dark p-0 mb-3"
          variant="link"
          @click="bvModal.show('requestDetailsApplicationModal')">
          <BMedia
            class="align-items-center"
            no-body>
            <div class="size-36 fr-app-logo-bg d-flex align-items-center justify-content-center mr-2">
              <img
                class="size-28"
                alt=""
                :onerror="onImageError"
                :src="applicationLogo">
            </div>
            <div class="media-body align-self-center overflow-hidden text-nowrap">
              <span class="text-dark">
                {{ applicationName || blankValueIndicator }}
              </span>
            </div>
          </BMedia>
        </BButton>
      </div>
      <div
        v-if="accountName"
        class="mb-3">
        <small class="d-block mb-2">
          {{ $t('common.account') }}
        </small>
        <BButton
          variant="link"
          class="p-0 text-left"
          @click="bvModal.show('requestDetailsAccountModal')">
          {{ accountName }}
        </BButton>
      </div>
    </div>
    <template v-if="!isRoleRequestType">
      <FrAccountModal
        :grant="request"
        modal-id="requestDetailsAccountModal" />
      <FrEntitlementModal
        :entitlement="request"
        :glossary-schema="glossarySchema.entitlement || []"
        modal-id="requestDetailsEntitlementModal" />
      <FrApplicationModal
        :application="{ ...request.application, applicationOwners: request.applicationOwner, glossary: request.glossary } || {}"
        :glossary-schema="glossarySchema.application || []"
        modal-id="requestDetailsApplicationModal" />
    </template>
  </BCard>
</template>

<script setup>
/**
 * Card displayed at the top of the DetailsTab for entitlement or role grant/revoke requests.
 * For entitlement requests: shows entitlement name and target application (clickable modals).
 * For role requests: shows the role name.
 * @component RequestedItemCard
 * @prop {Object} request - The raw request data object
 * @prop {Object} glossarySchema - Glossary schemas keyed by type (application, entitlement, role)
 * @prop {String} requestType - The request type (e.g. 'entitlementGrant', 'roleGrant')
 */
import { computed } from 'vue';
import {
  BButton,
  BCard,
  BCol,
  BMedia,
  BRow,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAccountModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/AccountModal';
import FrApplicationModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/TaskList/modals/ApplicationModal';
import FrEntitlementModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/EntitlementModal';
import FrRoleModal from '@forgerock/platform-shared/src/components/governance/ObjectModals/RoleModal/RoleModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

const props = defineProps({
  request: {
    type: Object,
    default: () => ({}),
  },
  glossarySchema: {
    type: Object,
    default: () => ({ application: [], entitlement: [], role: [] }),
  },
  requestType: {
    type: String,
    default: '',
  },
});

const { bvModal } = useBvModal();

const isRoleRequestType = computed(() => ['roleGrant', 'roleRemove'].includes(props.requestType));
const isEntitlementRequestType = computed(() => ['entitlementGrant', 'entitlementRemove'].includes(props.requestType));
const headerTitle = computed(() => {
  if (isRoleRequestType.value) return i18n.global.t('governance.requestModal.detailsTab.roleInformation');
  if (['applicationGrant', 'applicationRemove'].includes(props.requestType)) return i18n.global.t('governance.requestModal.detailsTab.applicationInformation');
  return i18n.global.t('governance.requestModal.detailsTab.entitlementInformation');
});
const roleDetails = computed(() => ({
  role: props.request?.role,
  glossary: props.request?.glossary,
  roleOwner: props.request?.roleOwner,
  applications: props.request?.role?.applications || props.request?.applications,
}));
const roleName = computed(() => props.request?.role?.name);
const accountName = computed(() => props.request?.descriptor?.idx?.['/account']?.displayName);
const entitlementName = computed(() => props.request?.descriptor?.idx?.['/entitlement']?.displayName);
const applicationName = computed(() => props.request?.application?.name);
const applicationLogo = computed(() => getApplicationLogo(props.request?.application));
</script>

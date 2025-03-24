<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <div v-if="entitlement">
      <BMedia
        class="align-items-center mb-2"
        no-body>
        <BMediaAside class="align-self-center">
          <img
            class="d-flex justify-content-center align-items-center m-4"
            height="48"
            :onerror="onImageError"
            :src="getApplicationLogo(entitlement.application)"
            :alt="$t('common.logo')">
        </BMediaAside>
        <BMediaBody class="align-self-center overflow-hidden text-nowrap">
          <p class="text-muted mb-2">
            {{ getApplicationDisplayName(entitlement.application) }} {{ entitlement.item?.objectType }}
          </p>
          <h1>
            {{ entitlement.descriptor?.idx?.['/entitlement']?.displayName }}
          </h1>
        </BMediaBody>
      </BMedia>
      <BTabs
        nav-class="fr-tabs"
        lazy>
        <BTab
          class="mt-4"
          :title="$t('common.details')">
          <FrDetails
            :entitlement="entitlement" />
        </BTab>
        <BTab
          v-if="viewGrants"
          class="mt-4"
          :title="$t('common.users')">
          <FrUsers
            :entitlement-id="entitlementId" />
        </BTab>
      </BTabs>
    </div>
  </BContainer>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import {
  BContainer,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { useRoute } from 'vue-router';
import { getEntitlementById } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrDetails from './Tabs/Details';
import FrUsers from './Tabs/Users';
import i18n from '@/i18n';

// Composables
const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();

const entitlementId = ref(route.params.entitlementId);
const entitlement = ref(null);
const viewGrants = computed(() => (entitlement.value?.permissions?.viewGrants));

/**
 * Get the entitlement details by ID.
 */
async function loadEntitlement() {
  const { data } = await getEntitlementById(entitlementId.value);
  entitlement.value = data;
}

onMounted(() => {
  setBreadcrumb('/administer/entitlements', i18n.global.t('pageTitles.AdministerEntitlements'));
  loadEntitlement();
});

</script>

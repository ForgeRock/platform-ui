<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="my-5">
    <div v-if="entitlement">
      <FrHeaderWithImage
        :title="`${getApplicationDisplayName(entitlement.application)} ${entitlement.item?.objectType}`"
        :subtitle="entitlement.descriptor?.idx?.['/entitlement']?.displayName"
        :image-source="getApplicationLogo(entitlement.application)" />
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
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { useRoute } from 'vue-router';
import { getEntitlementById } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrHeaderWithImage from '@forgerock/platform-shared/src/components/HeaderWithImage/HeaderWithImage';
import FrDetails from './Tabs/Details';
import FrUsers from './Tabs/Users';
import i18n from '@/i18n';

const userStore = useUserStore();

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
  let breadcrumbPath = '/administer/entitlements';
  if (userStore.adminUser) {
    breadcrumbPath = '/entitlements';
  }
  setBreadcrumb(breadcrumbPath, i18n.global.t('pageTitles.AdministerEntitlements'));
  loadEntitlement();
});

</script>

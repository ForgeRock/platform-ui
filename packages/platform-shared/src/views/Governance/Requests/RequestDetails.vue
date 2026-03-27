<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrAccessRequestDetails
    :type="detailTypes.ADMIN_REQUEST"
    :request-id="requestId"
    :auto-id-settings="autoIdSettings"
    @navigate-to-list="$router.push({ name: requestsComponentName });" />
</template>

<script setup>
import FrAccessRequestDetails from '@forgerock/platform-shared/src/components/governance/AccessRequestDetails';
import { getIgaAutoIdConfig } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import i18n from '@/i18n';

const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();
const userStore = useUserStore();

const { requestId } = route.params;

const autoIdSettings = ref({});
const requestsComponentName = ref('UserAdminRequests');

onMounted(async () => {
  setBreadcrumb('/requests', i18n.global.t('sideMenu.adminRequests'));
  if (userStore.adminUser) {
    requestsComponentName.value = 'GovernanceRequests';
  }

  try {
    // User recommendations and predictions
    const { data: autoIdData } = await getIgaAutoIdConfig();
    autoIdSettings.value = autoIdData;
  } catch (error) {
    // No need to show an error message here
  }
});
</script>

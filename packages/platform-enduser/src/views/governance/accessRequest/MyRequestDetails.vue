<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAccessRequestDetails
    :request-id="requestId"
    @navigate-to-list="$router.push({ name: 'MyRequests' });" />
</template>

<script setup>
import FrAccessRequestDetails from '@forgerock/platform-shared/src/components/governance/AccessRequestDetails';
import { onMounted } from 'vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { useRoute } from 'vue-router';
import i18n from '@/i18n';

const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();

const { requestId } = route.params;

onMounted(async () => {
  setBreadcrumb('/my-requests', i18n.global.t('sideMenu.requests'));
});
</script>

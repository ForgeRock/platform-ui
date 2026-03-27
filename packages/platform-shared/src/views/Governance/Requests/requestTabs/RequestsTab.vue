<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrAccessRequestTable
    is-admin
    :access-requests="accessRequests"
    :is-loading="isLoading"
    :title="title"
    :total-rows="totalAccessRequests"
    @load-requests="loadRequests"
    @navigate-to-details="$router.push({
      name: 'RequestDetails',
      params: { requestId: $event.details.id },
    })" />
</template>

<script setup>
import { getRequests } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrAccessRequestTable from '@forgerock/platform-shared/src/components/governance/AccessRequestTable';
import { getRequestFilter, getRequestTypeDisplayNames } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { ref } from 'vue';
import i18n from '@/i18n';

defineProps({
  title: {
    type: String,
    default: '',
  },
});

const accessRequests = ref([]);
const totalAccessRequests = ref(0);
const isLoading = ref(false);

/**
 * Get current users access requests based on query params and target filter
 * @param {Object} params - query params
 * @param {Object} payload - target filter
 */
async function loadRequests(params = {
  pagedResultsOffset: 0,
  pageSize: 10,
  sortKeys: 'decision.startDate',
  sortDir: 'desc',
  sortType: 'date',
}, payload = getRequestFilter({}, 'in-progress')) {
  isLoading.value = true;
  try {
    const { data } = await getRequests(params, payload);
    accessRequests.value = await getRequestTypeDisplayNames(data.result);
    totalAccessRequests.value = data.totalCount;
  } catch (error) {
    totalAccessRequests.value = 0;
    showErrorMessage(error, i18n.global.t('governance.administer.requests.errorGettingRequests'));
  } finally {
    isLoading.value = false;
  }
}

loadRequests();
</script>

<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer>
      <!-- Header -->
      <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
        <BCol lg="8">
          <FrHeader
            :title="$t('pageTitles.MyRequests')"
            :subtitle="$t('pages.myRequests.subTitle')" />
        </BCol>
        <BCol lg="4">
          <div class="d-flex justify-content-lg-end">
            <BButton
              variant="primary"
              :aria-label="$t('governance.accessRequest.newRequest.newRequest')"
              @click="newRequest">
              <FrIcon
                icon-class="mr-2"
                name="add">
                {{ $t('governance.accessRequest.newRequest.newRequest') }}
              </FrIcon>
            </BButton>
          </div>
        </BCol>
      </BRow>
      <!-- Content -->
      <BRow>
        <BCol>
          <FrAccessRequestTable
            :access-requests="accessRequests"
            :is-loading="isLoading"
            :title="$t('pageTitles.MyRequests')"
            :total-rows="totalAccessRequests"
            @load-requests="loadRequests"
            @navigate-to-details="$router.push({
              name: 'MyRequestDetails',
              params: { requestId: $event.details.id },
            })" />
        </BCol>
      </BRow>
    </BContainer>
    <FrNewRequestModal />
  </div>
</template>

<script setup>
import {
  BButton,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNewRequestModal from '@forgerock/platform-shared/src/components/governance/NewRequestModal';
import FrAccessRequestTable from '@forgerock/platform-shared/src/components/governance/AccessRequestTable';
import { ref } from 'vue';
import { getUserRequests } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getRequestFilter, getRequestTypeDisplayNames } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import i18n from '@/i18n';

/**
 * Component to display user's access requests
 * @component
 */

const { userId } = useUserStore();
const { bvModal } = useBvModal();

const accessRequests = ref([]);
const totalAccessRequests = ref(0);
const isLoading = ref(false);

function newRequest() {
  bvModal.value.show('NewRequestModal');
}

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
    const { data } = await getUserRequests(userId, params, payload);
    accessRequests.value = await getRequestTypeDisplayNames(data.result);
    totalAccessRequests.value = data.totalCount;
  } catch (error) {
    accessRequests.value = [];
    totalAccessRequests.value = 0;
    showErrorMessage(error, i18n.global.t('governance.accessRequest.myRequests.errorGettingRequests'));
  } finally {
    isLoading.value = false;
  }
}

loadRequests();
</script>

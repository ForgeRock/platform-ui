<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <template v-if="!isLoading">
      <!-- Header -->
      <BMedia
        data-testId="request-detail-header"
        class="mb-4 align-items-center">
        <template #aside>
          <div class="d-flex align-items-center justify-content-center p-3 mr-2 rounded border border-darkened app-logo">
            <FrIcon
              v-if="isTypeRole(item.rawData.requestType)"
              class="mr-1 md-28 rounded-circle"
              :name="item.details.icon" />
            <BImg
              v-else
              width="54"
              height="54"
              class="align-self-center"
              :src="item.details.icon"
              :alt="$t('common.logo')" />
          </div>
        </template>
        <BMediaBody class="align-self-center text-truncate">
          <h2 class="h5 text-muted mb-2">
            {{ item.details.type }}
          </h2>
          <h1 class="pb-1 text-truncate">
            {{ item.details.name }}
          </h1>
        </BMediaBody>
      </BMedia>

      <!-- Request details -->
      <BCard
        data-testId="request-detail"
        class="mb-3"
        no-body>
        <FrRequestDetails
          @add-comment="openModal('COMMENT')"
          :item="item" />
      </BCard>

      <!-- Cancel panel -->
      <BCard
        data-testId="request-detail-cancel"
        v-if="item.rawData.decision.status === 'in-progress'"
        class="mb-5">
        <h3 class="h5 card-title">
          {{ $t('governance.requestModal.cancelRequest') }}
        </h3>
        <p class="text-danger">
          {{ $t('common.cannotBeUndone') }}
        </p>
        <BButton
          variant="danger"
          @click="openModal('CANCEL')">
          {{ $t('governance.requestModal.cancelRequest') }}
        </BButton>
      </BCard>
    </template>
    <FrRequestModal
      :type="modalType"
      :item="item"
      is-approvals
      @modal-closed="modalType = null"
      @update-item="getRequestData"
      @update-list="toListView" />
  </BContainer>
</template>

<script setup>
import {
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue';
import {
  BButton,
  BCard,
  BContainer,
  BImg,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import router from '@/router';
import { getRequest } from '@/api/governance/AccessRequestApi';
import { getFormattedRequest, getRequestObjectType, isTypeRole } from '@/components/utils/governance/AccessRequestUtils';
import FrRequestDetails from '@/components/governance/RequestDetails';
import FrRequestModal, { REQUEST_MODAL_TYPES } from '@/components/governance/RequestModal';
import i18n from '@/i18n';

const { proxy: { $route, _bv__modal: bvModal } } = getCurrentInstance();

// Composables
const { setBreadcrumb } = useBreadcrumb();

// Data
const { requestId } = $route.params;
const item = ref({});
const isLoading = ref(true);
const modalType = ref('');

async function getRequestData() {
  isLoading.value = true;
  try {
    const { data } = await getRequest(requestId);
    item.value = getFormattedRequest(data, getRequestObjectType(data.requestType));
  } catch (error) {
    showErrorMessage(error, i18n.t('governance.accessRequest.myRequests.errorGettingRequests'));
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  setBreadcrumb('/my-requests', i18n.t('sideMenu.requests'));

  await getRequestData();
});

function openModal(type) {
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.show('request_modal');
}

function toListView() {
  router.push({ name: 'MyRequests' });
}
</script>

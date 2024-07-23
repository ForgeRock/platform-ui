<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

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
            <BImg
              v-if="item.details.isCustom"
              :src="require('@forgerock/platform-shared/src/assets/images/applications/custom.svg')"
              :alt="$t('governance.accessRequest.customRequestAltText')"
              width="24" />
            <FrIcon
              v-else-if="isTypeRole(item.rawData.requestType)"
              icon-class="mr-1 md-28 rounded-circle"
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

      <!-- Actions -->
      <div
        data-testId="request-detail-actions"
        v-if="isActive && adminUser"
        class="mb-4">
        <BButton
          @click="openModal('REASSIGN')"
          class="mr-1"
          variant="outline-secondary">
          <FrIcon
            icon-class="mr-2"
            name="redo">
            {{ $t('common.forward') }}
          </FrIcon>
        </BButton>
      </div>

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
        v-if="isActive"
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
  computed,
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
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { getRequest, getRequestType } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { useRoute, useRouter } from 'vue-router';
import {
  getFormattedRequest,
  isTypeRole,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrRequestDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestDetails';
import i18n from '@/i18n';

// Composables
const router = useRouter();
const route = useRoute();
const { bvModal } = useBvModal();
const { setBreadcrumb } = useBreadcrumb();
const { adminUser } = useUserStore();

// Data
const { requestId } = route.params;
const item = ref({});
const isLoading = ref(true);
const modalType = ref('');

const isActive = computed(() => item.value.rawData?.decision?.status === 'in-progress');
const routerVariables = computed(() => {
  if (adminUser) {
    return {
      breadcrumbRoute: '/requests',
      breadcrumbText: 'sideMenu.governanceRequests',
      listViewRouteName: 'GovernanceRequests',
    };
  }
  return {
    breadcrumbRoute: '/my-requests',
    breadcrumbText: 'sideMenu.requests',
    listViewRouteName: 'MyRequests',
  };
});

async function getRequestData() {
  isLoading.value = true;
  try {
    const { data } = await getRequest(requestId);
    const { data: requestTypeData } = await getRequestType(data.requestType);
    data.requestTypeDisplayName = requestTypeData.displayName;
    item.value = getFormattedRequest(data);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.myRequests.errorGettingRequests'));
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  setBreadcrumb(routerVariables.value.breadcrumbRoute, i18n.global.t(routerVariables.value.breadcrumbText));

  await getRequestData();
});

function openModal(type) {
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.value.show('request_modal');
}

function toListView() {
  router.push({ name: routerVariables.value.listViewRouteName });
}
</script>

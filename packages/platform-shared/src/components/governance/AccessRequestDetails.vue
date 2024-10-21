<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <template v-if="!isLoading">
      <!-- Header -->
      <FrRequestHeader
        :item="item" />

      <!-- Actions -->
      <FrRequestActions
        v-if="isActive && type === detailTypes.ADMIN_REQUEST"
        :permissions="{ reassign: true }"
        :type="detailTypes.ADMIN_REQUEST"
        @action="openModal($event)"
        class="mb-4" />

      <!-- Request details -->
      <BCard
        data-testId="request-detail"
        class="mb-3"
        no-body>
        <FrRequestDetails
          @add-comment="openModal('COMMENT')"
          :hide-actions="{ modify: true }"
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
      @modal-closed="modalType = null"
      @update-item="getRequestData"
      @update-list="$emit('navigate-to-list')" />
  </BContainer>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  BButton,
  BCard,
  BContainer,
} from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { getRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import {
  detailTypes,
  getFormattedRequest,
  getRequestTypeDisplayName,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrRequestDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestDetails';
import FrRequestHeader from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestHeader';
import FrRequestActions from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActions';
import i18n from '@/i18n';

const props = defineProps({
  requestId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
});

defineEmits(['navigate-to-list']);

// Composables
const { bvModal } = useBvModal();

// Data
const item = ref({});
const isLoading = ref(true);
const modalType = ref('');

const isActive = computed(() => item.value.rawData?.decision?.status === 'in-progress');

async function getRequestData() {
  isLoading.value = true;
  try {
    const { data } = await getRequest(props.requestId);
    const { data: requestTypeData } = await getRequestTypeDisplayName(data.requestType);
    data.requestTypeDisplayName = requestTypeData.displayName;
    item.value = getFormattedRequest(data);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.myRequests.errorGettingRequests'));
  } finally {
    isLoading.value = false;
  }
}

function openModal(type) {
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.value.show('request_modal');
}

getRequestData();
</script>

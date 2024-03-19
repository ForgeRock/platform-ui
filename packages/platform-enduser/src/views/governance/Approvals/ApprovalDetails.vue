<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <template v-if="!isEmpty(item)">
      <!-- Header -->
      <BMedia
        data-testId="approval-detail-header"
        class="mb-4 align-items-center">
        <template #aside>
          <div class="d-flex align-items-center justify-content-center p-3 mr-2 rounded border border-darkened app-logo">
            <FrIcon
              v-if="isTypeRole(item.rawData.requestType)"
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
        data-testId="approval-detail-actions"
        v-if="isActive"
        class="mb-4">
        <BButton
          v-if="actionPermissions.approve"
          @click="openModal('APPROVE')"
          class="mr-1"
          variant="outline-secondary">
          <FrIcon
            icon-class="text-success mr-2"
            name="check">
            {{ $t('common.approve') }}
          </FrIcon>
        </BButton>
        <BButton
          v-if="actionPermissions.reject"
          @click="openModal('REJECT')"
          class="mr-1"
          variant="outline-secondary">
          <FrIcon
            icon-class="text-danger mr-2"
            name="block">
            {{ $t('common.reject') }}
          </FrIcon>
        </BButton>
        <BButton
          v-if="actionPermissions.reassign"
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
        data-testId="approval-detail"
        class="mb-3"
        no-body>
        <FrRequestDetails
          @add-comment="openModal('COMMENT')"
          :hide-actions="{ comment: !actionPermissions.comment }"
          :item="item" />
      </BCard>
    </template>
    <FrRequestModal
      :type="modalType"
      :item="item"
      is-approvals
      :require-approve-justification="requireApproveJustification"
      :require-reject-justification="requireRejectJustification"
      @modal-closed="modalType = null"
      @update-item="getRequestData"
      @update-list="toListView" />
  </BContainer>
</template>

<script setup>
import {
  onMounted,
  ref,
  computed,
} from 'vue';
import {
  BButton,
  BCard,
  BContainer,
  BMedia,
  BMediaBody,
  BImg,
} from 'bootstrap-vue';
import { isEmpty } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { getRequest, getUserApprovals } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getIgaAccessRequest } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import {
  getFormattedRequest,
  getRequestObjectType,
  isTypeRole,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import { useRoute, useRouter } from 'vue-router';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrRequestDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestDetails';
import i18n from '@/i18n';

// Composables
const router = useRouter();
const route = useRoute();
const { bvModal } = useBvModal();
const { setBreadcrumb } = useBreadcrumb();

// Data
const { requestId } = route.params;
const isActive = ref(false);
const item = ref({});
const modalType = ref('');
const actionPermissions = ref({
  approve: false,
  reject: false,
  reassign: false,
  comment: false,
});
let requireApproveJustification = false;
let requireRejectJustification = false;
let allowSelfApproval = false;

const userId = computed(() => useUserStore().userId);

async function getBaseRequest() {
  try {
    const { data } = await getRequest(requestId);
    item.value = getFormattedRequest(data, getRequestObjectType(data.requestType));
    isActive.value = false;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.approval.errorGettingApprovals'));
  }
}

function currentUserId() {
  return `managed/user/${userId.value}`;
}

function updateActionsPermissions() {
  const actorInfo = item.value?.rawData?.decision.actors.active.find((actor) => actor.id === currentUserId());
  const isSelfApprover = userId.value === item.value?.rawData.user.id;
  actionPermissions.value = {
    ...actorInfo?.permissions,
    approve: allowSelfApproval ? actorInfo?.permissions.approve : !isSelfApprover && actorInfo?.permissions.approve,
  };
}

async function getApproval() {
  try {
    const params = {
      actorStatus: 'active',
      _action: 'search',
    };
    const filter = getBasicFilter('EQUALS', 'id', requestId);
    const { data } = await getUserApprovals(userId.value, params, filter);
    if (data?.result?.length) {
      const request = data.result[0];
      item.value = getFormattedRequest(request, getRequestObjectType(request.requestType));
      isActive.value = true;
      updateActionsPermissions();
    }
  } catch (error) {
    showErrorMessage('error', i18n.global.t('governance.approval.errorGettingApprovals'));
  }
}

// active approvals are returned by the first api call
// completed approvals are returned by the second api call
async function getRequestData() {
  item.value = {};

  await getApproval();
  if (isEmpty(item.value)) await getBaseRequest();
}

onMounted(async () => {
  setBreadcrumb('/approvals', i18n.global.t('sideMenu.approvals'));

  await getRequestData();
  try {
    const { data } = await getIgaAccessRequest();
    requireApproveJustification = !data.requireApproveJustification;
    requireRejectJustification = !data.requireRejectJustification;
    allowSelfApproval = !data.allowSelfApproval;
  } catch {
    // We don't need to show an error here
  }
});

function openModal(type) {
  modalType.value = REQUEST_MODAL_TYPES[type];
  bvModal.value.show('request_modal');
}

function toListView() {
  router.push({ name: 'Approvals' });
}
</script>

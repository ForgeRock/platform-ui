<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <template v-if="!isEmpty(item)">
      <!-- Header -->
      <FrRequestHeader
        :item="item" />

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
          is-approval
          :hide-actions="{ comment: !actionPermissions.comment, modify: !actionPermissions.modify }"
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
} from 'bootstrap-vue';
import { isEmpty } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { getRequest, getUserApprovals, getRequestType } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getIgaAccessRequest } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getFormattedRequest } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import { useRoute, useRouter } from 'vue-router';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrRequestDetails from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestDetails';
import FrRequestHeader from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestHeader';
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
  modify: false,
});
let requireApproveJustification = false;
let requireRejectJustification = false;
let allowSelfApproval = false;

const userId = computed(() => useUserStore().userId);

async function getBaseRequest() {
  try {
    const { data } = await getRequest(requestId);
    const { data: requestTypeData } = await getRequestType(data.requestType);
    data.requestTypeDisplayName = requestTypeData.displayName;
    item.value = getFormattedRequest(data);
    isActive.value = false;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.approval.errorGettingApprovals'));
  }
}

function updateActionsPermissions() {
  const permissions = item.value?.rawData?.phases?.[0]?.permissions;
  const isSelfApprover = item.value?.rawData?.user?.id
    ? userId.value === item.value.rawData.user.id
    : false;

  if (permissions) {
    actionPermissions.value = {
      ...permissions,
      approve: allowSelfApproval ? permissions.approve : !isSelfApprover && permissions.approve,
    };
  }
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
      const { data: requestTypeData } = await getRequestType(request.requestType);
      request.requestTypeDisplayName = requestTypeData.displayName;
      item.value = getFormattedRequest(request);
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
    requireApproveJustification = data.requireApproveJustification;
    requireRejectJustification = data.requireRejectJustification;
    allowSelfApproval = data.allowSelfApproval;
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

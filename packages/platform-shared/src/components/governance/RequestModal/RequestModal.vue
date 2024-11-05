<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    ref="observer"
    as="span">
    <BModal
      ref="governance-request-modal"
      title-class="h5"
      title-tag="h2"
      :hide-footer="loading"
      :id="modalId"
      :size="componentComputed.size"
      :static="isTesting"
      :title="componentComputed.title"
      @hidden="$emit('modal-closed')">
      <template v-if="loading">
        <FrSpinner
          class="py-5"
          data-testid="loading-modal" />
        <div
          class="text-center"
          data-testid="loading-text">
          {{ componentComputed.loadingText }}
        </div>
      </template>
      <Component
        v-else
        v-bind="componentComputed.props"
        :is="componentComputed.component"
        :item="item"
        @change-modal-type="modalType = REQUEST_MODAL_TYPES[$event]"
        @request-comment="updateComment"
        @request-update-actors="updateActors"
      />
      <template #modal-footer="{ cancel, ok}">
        <BCol
          data-testid="others-footer">
          <BRow class="justify-content-end">
            <BButton
              @click="cancel"
              :class="['mr-2', modalType === REQUEST_MODAL_TYPES.CANCEL ? 'text-danger' : '']"
              data-testid="governance-request-modal-cancel-btn"
              variant="link">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              :variant="modalType === REQUEST_MODAL_TYPES.CANCEL ? 'danger' : 'primary'"
              data-testid="governance-request-modal-confirm-btn"
              :disabled="!valid"
              @click="modalAction(item, ok)">
              {{ componentComputed.buttonName }}
            </BButton>
          </BRow>
        </BCol>
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
/**
 * Centralizes the modal for taking actions of requests.
 * @component RequestModal
 * @prop {String} type - Modal type
 * @prop {Object} item - Request information
 * @prop {Boolean} isTesting - Determines if the component is in a test environment
 */
import {
  BButton, BModal, BRow, BCol,
} from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { Form as VeeForm } from 'vee-validate';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import {
  ACCESS_REQUEST_PERMISSIONS,
  FULFILLMENT_TASK_PERMISSIONS,
  REQUEST_MODAL_TYPES,
} from '@forgerock/platform-shared/src/utils/governance/constants';
import { getPhaseName } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrAddComment from './AddComment';
import FrApproveRequest from './ApproveRequest';
import FrCancelRequest from './CancelRequest';
import FrForwardRequest from './ForwardRequest';
import FrFulfillTask from './FulfillTask';
import FrRejectRequest from './RejectRequest';
import FrRejectTask from './RejectTask';
import i18n from '@/i18n';

const emit = defineEmits([
  'modal-closed',
  'update-item',
  'update-list',
  'modal-success',
]);

const props = defineProps({
  type: {
    type: String,
    default: null,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  isTask: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  requireApproveJustification: {
    default: false,
    type: Boolean,
  },
  requireRejectJustification: {
    default: false,
    type: Boolean,
  },
});

const comment = ref('');
const loading = ref(false);
const modalId = ref('request_modal');
const modalType = ref(REQUEST_MODAL_TYPES[props.type]);

const actors = computed(() => (
  {
    id: null,
    permissions: props.isTask
      ? FULFILLMENT_TASK_PERMISSIONS
      : ACCESS_REQUEST_PERMISSIONS,
  }
));

const componentComputed = computed(() => {
  switch (modalType.value) {
    case REQUEST_MODAL_TYPES.CANCEL:
      return {
        buttonName: i18n.global.t('governance.requestModal.cancelRequest'),
        component: FrCancelRequest,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorCancel'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingCancel'),
        message: i18n.global.t('governance.requestModal.messages.cancel'),
        size: 'md',
        title: i18n.global.t('governance.requestModal.titles.cancel'),
      };
    case REQUEST_MODAL_TYPES.COMMENT:
      return {
        buttonName: i18n.global.t('governance.requestModal.addComment'),
        component: FrAddComment,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorComment'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingComment'),
        message: i18n.global.t('governance.requestModal.messages.comment'),
        size: 'lg',
        title: i18n.global.t('governance.requestModal.titles.addComment'),
      };
    case REQUEST_MODAL_TYPES.DENY:
      return {
        buttonName: i18n.global.t('common.reject'),
        component: FrRejectTask,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorRejectTask'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingRejectTask'),
        message: i18n.global.t('governance.requestModal.messages.rejectTask'),
        size: 'lg',
        title: i18n.global.t('governance.requestModal.titles.rejectTask'),
      };
    case REQUEST_MODAL_TYPES.FULFILL:
      return {
        buttonName: i18n.global.t('common.complete'),
        component: FrFulfillTask,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorComplete'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingComplete'),
        message: i18n.global.t('governance.requestModal.messages.taskComplete'),
        size: 'lg',
        title: i18n.global.t('governance.requestModal.titles.complete'),
      };
    case REQUEST_MODAL_TYPES.REASSIGN:
      return {
        buttonName: i18n.global.t('common.forward'),
        component: FrForwardRequest,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorForward'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingForward'),
        message: i18n.global.t('governance.requestModal.messages.forward'),
        size: 'lg',
        title: i18n.global.t('governance.requestModal.titles.forward'),
      };
    case REQUEST_MODAL_TYPES.REJECT:
      return {
        buttonName: i18n.global.t('common.reject'),
        component: FrRejectRequest,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorReject'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingReject'),
        message: i18n.global.t('governance.requestModal.messages.reject'),
        props: {
          requireJustification: props.requireRejectJustification,
        },
        size: 'lg',
        title: i18n.global.t('governance.requestModal.titles.reject'),
      };
    case REQUEST_MODAL_TYPES.APPROVE:
    default:
      return {
        buttonName: i18n.global.t('common.approve'),
        component: FrApproveRequest,
        errorMessage: i18n.global.t('governance.requestModal.messages.errorApprove'),
        loadingText: i18n.global.t('governance.requestModal.messages.loadingApprove'),
        message: i18n.global.t('governance.requestModal.messages.approve'),
        props: {
          requireJustification: props.requireApproveJustification,
        },
        size: 'lg',
        title: i18n.global.t('governance.requestModal.titles.approve'),
      };
  }
});

/**
  * @param {Function} cancel close modal function
  */
function close(cancel) {
  if (modalType.value === REQUEST_MODAL_TYPES.COMMENT) {
    emit('update-item', props.item.details.id);
  } else {
    emit('update-list');
  }
  cancel();
}

/**
  * @param {Object} item item the request is going to be applied to
  * @param {Function} ok close modal function
  */
function modalAction(item, ok) {
  const action = modalType.value.toLowerCase();
  const phaseName = getPhaseName(item.rawData);
  loading.value = true;
  const requestPayload = {};
  switch (action) {
    case 'reassign':
      requestPayload.updatedActors = [actors.value];
      requestPayload.comment = comment.value;
      break;
    case 'approve':
    case 'reject':
      requestPayload.justification = comment.value;
      break;
    case 'fulfill':
    case 'deny':
      break;
    default:
      requestPayload.comment = comment.value;
  }
  requestAction(item.details.id, action, phaseName, requestPayload).then(() => {
    displayNotification('success', componentComputed.value.message);
    emit('modal-success');
  }).catch(() => {
    showErrorMessage('', componentComputed.value.errorMessage);
  }).finally(() => {
    loading.value = false;
    close(ok);
  });
}

/**
  * @param {Array} newActors Update actors the request will be forwarded to
  */
function updateActors(newActors) {
  actors.value.id = newActors;
}

/**
  * @param {String} newComment Update comment of the request
  */
function updateComment(newComment) {
  comment.value = newComment;
}

watch(() => props.type, (newValue) => {
  modalType.value = REQUEST_MODAL_TYPES[newValue];
});
</script>

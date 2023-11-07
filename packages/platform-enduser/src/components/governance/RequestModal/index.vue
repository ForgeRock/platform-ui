<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    v-slot="{ invalid }"
    ref="observer">
    <BModal
      ref="governance-request-modal"
      title-class="h5"
      title-tag="h2"
      :hide-footer="loading"
      :id="modalId"
      :size="size"
      :static="isTesting"
      :title="title"
      @hidden="$emit('modal-closed')">
      <template v-if="loading">
        <FrSpinner
          class="py-5"
          data-testid="loading-modal" />
        <div
          class="text-center"
          data-testid="loading-text">
          {{ loadingText }}
        </div>
      </template>
      <Component
        v-else
        :is="component"
        :item="item"
        @change-modal-type="modalType = REQUEST_MODAL_TYPES[$event]"
        @request-comment="updateComment"
        @request-update-actors="updateActors"
      />
      <template #modal-footer="{cancel}">
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
              :disabled="invalid"
              @click="modalAction(item, cancel)">
              {{ buttonName }}
            </BButton>
          </BRow>
        </BCol>
      </template>
    </BModal>
  </ValidationObserver>
</template>

<script>
import {
  BButton, BModal, BRow, BCol,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { requestAction } from '../../../api/governance/AccessRequestApi';
import FrAddComment from './AddComment';
import FrApproveRequest from './ApproveRequest';
import FrForwardRequest from './ForwardRequest';
import FrRejectRequest from './RejectRequest';
import FrCancelRequest from './CancelRequest';

/**
 * @typedef {string} REQUEST_MODAL_TYPE
 * */

/**
 * @enum {REQUEST_MODAL_TYPE}
 */
export const REQUEST_MODAL_TYPES = {
  APPROVE: 'APPROVE',
  CANCEL: 'CANCEL',
  COMMENT: 'COMMENT',
  REASSIGN: 'REASSIGN',
  REJECT: 'REJECT',
};

export default {
  name: 'RequestModal',
  components: {
    BButton,
    BModal,
    BRow,
    BCol,
    FrAddComment,
    FrApproveRequest,
    FrCancelRequest,
    FrForwardRequest,
    FrIcon,
    FrRejectRequest,
    FrSpinner,
    ValidationObserver,
  },
  props: {
    type: {
      type: String,
      default: null,
    },
    item: {
      type: Object,
      default: () => ({}),
    },
    isApprovals: {
      type: Boolean,
      default: false,
    },
    isMyRequests: {
      type: Boolean,
      default: false,
    },
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [
    NotificationMixin,
  ],
  data() {
    return {
      REQUEST_MODAL_TYPES,
      actors: {
        id: null,
        permissions: {
          approve: true,
          comment: true,
          modify: true,
          reject: true,
          reassign: true,
        },
      },
      comment: '',
      loading: false,
      modalId: 'request_modal',
      modalType: REQUEST_MODAL_TYPES[this.type],
    };
  },
  computed: {
    buttonName() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.CANCEL:
          return this.$t('governance.requestModal.cancelRequest');
        case REQUEST_MODAL_TYPES.COMMENT:
          return this.$t('governance.requestModal.addComment');
        case REQUEST_MODAL_TYPES.REASSIGN:
          return this.$t('common.forward');
        case REQUEST_MODAL_TYPES.REJECT:
          return this.$t('common.reject');
        default:
          return this.$t('common.approve');
      }
    },
    component() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.APPROVE:
          return 'FrApproveRequest';
        case REQUEST_MODAL_TYPES.CANCEL:
          return 'FrCancelRequest';
        case REQUEST_MODAL_TYPES.COMMENT:
          return 'FrAddComment';
        case REQUEST_MODAL_TYPES.REASSIGN:
          return 'FrForwardRequest';
        case REQUEST_MODAL_TYPES.REJECT:
          return 'FrRejectRequest';
        default:
          return '';
      }
    },
    errorMessage() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.CANCEL:
          return this.$t('governance.requestModal.messages.errorCancel');
        case REQUEST_MODAL_TYPES.COMMENT:
          return this.$t('governance.requestModal.messages.errorComment');
        case REQUEST_MODAL_TYPES.REASSIGN:
          return this.$t('governance.requestModal.messages.errorForward');
        case REQUEST_MODAL_TYPES.REJECT:
          return this.$t('governance.requestModal.messages.errorReject');
        default:
          return this.$t('governance.requestModal.messages.errorApprove');
      }
    },
    loadingText() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.CANCEL:
          return this.$t('governance.requestModal.messages.loadingCancel');
        case REQUEST_MODAL_TYPES.COMMENT:
          return this.$t('governance.requestModal.messages.loadingComment');
        case REQUEST_MODAL_TYPES.REASSIGN:
          return this.$t('governance.requestModal.messages.loadingForward');
        case REQUEST_MODAL_TYPES.REJECT:
          return this.$t('governance.requestModal.messages.loadingReject');
        default:
          return this.$t('governance.requestModal.messages.loadingApprove');
      }
    },
    message() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.CANCEL:
          return this.$t('governance.requestModal.messages.cancel');
        case REQUEST_MODAL_TYPES.COMMENT:
          return this.$t('governance.requestModal.messages.comment');
        case REQUEST_MODAL_TYPES.REASSIGN:
          return this.$t('governance.requestModal.messages.forward');
        case REQUEST_MODAL_TYPES.REJECT:
          return this.$t('governance.requestModal.messages.reject');
        default:
          return this.$t('governance.requestModal.messages.approve');
      }
    },
    size() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.CANCEL:
          return 'md';
        default:
          return 'lg';
      }
    },
    showRequestDetailsLink() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.CANCEL:
        case REQUEST_MODAL_TYPES.COMMENT:
        case REQUEST_MODAL_TYPES.REASSIGN:
          return false;
        default:
          return true;
      }
    },
    title() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.COMMENT:
          return this.$t('governance.requestModal.titles.addComment');
        case REQUEST_MODAL_TYPES.APPROVE:
          return this.$t('governance.requestModal.titles.approve');
        case REQUEST_MODAL_TYPES.CANCEL:
          return this.$t('governance.requestModal.titles.cancel');
        case REQUEST_MODAL_TYPES.REASSIGN:
          return this.$t('governance.requestModal.titles.forward');
        case REQUEST_MODAL_TYPES.REJECT:
          return this.$t('governance.requestModal.titles.reject');
        default:
          return '';
      }
    },
  },
  methods: {
    /**
    * @param {Function} cancel close modal function
    */
    close(cancel) {
      if (this.modalType === REQUEST_MODAL_TYPES.COMMENT) {
        this.$emit('update-item', this.item.details.id);
      } else {
        this.$emit('update-list');
      }
      cancel();
    },

    /**
    *
    * @param {Object} item item the request is going to be applied to
    * @param {Function} cancel close modal function
    */
    modalAction(item, cancel) {
      const action = this.modalType.toLowerCase();
      this.loading = true;
      requestAction(item.details.id, action, item.rawData?.phases?.[0]?.name, this.comment, [this.actors]).then(() => {
        this.displayNotification('success', this.message);
        this.$emit('modal-success');
      }).catch(() => {
        this.showErrorMessage('', this.errorMessage);
      }).finally(() => {
        this.loading = false;
        this.close(cancel);
      });
    },
    /**
    * @param {Array} newActors Update actors the request will be forwarded to
    */
    updateActors(newActors) {
      this.actors.id = newActors;
    },
    /**
    * @param {String} newComment Update comment of the request
    */
    updateComment(newComment) {
      this.comment = newComment;
    },
  },
  watch: {
    type(value) {
      this.modalType = REQUEST_MODAL_TYPES[value];
    },
  },
};
</script>

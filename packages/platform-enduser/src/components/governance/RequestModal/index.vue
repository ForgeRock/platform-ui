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
      :body-class="modalType === REQUEST_MODAL_TYPES.DETAILS ? 'p-0' : ''"
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
        :hide-actions="hideActions"
        @change-modal-type="modalType = REQUEST_MODAL_TYPES[$event]"
        @request-comment="updateComment"
        @request-update-actors="updateActors"
      />
      <template #modal-footer="{cancel}">
        <BCol
          v-if="component === 'FrRequestDetailTabs'"
          data-testid="details-footer">
          <BRow class="justify-content-between">
            <BCol class="pl-0">
              <template v-if="!hideActions">
                <template v-if="isApprovals">
                  <BButton
                    variant="outline-secondary"
                    class="mx-1 mb-2 mb-lg-0"
                    @click="modalType = REQUEST_MODAL_TYPES.APPROVE"
                    data-testid="governance-request-modal-goto-approve-btn">
                    <FrIcon
                      class="text-success mr-2"
                      name="check" />
                    {{ $t('common.approve') }}
                  </BButton>
                  <BButton
                    variant="outline-secondary"
                    class="mx-1 mb-2 mb-lg-0"
                    @click="modalType = REQUEST_MODAL_TYPES.REJECT"
                    data-testid="governance-request-modal-goto-reject-btn">
                    <FrIcon
                      class="text-danger mr-2"
                      name="block" />
                    {{ $t('common.reject') }}
                  </BButton>
                  <BButton
                    variant="outline-secondary"
                    class="mx-1"
                    @click="modalType = REQUEST_MODAL_TYPES.REASSIGN"
                    data-testid="governance-request-modal-goto-forward-btn">
                    <FrIcon
                      class="mr-2"
                      name="redo" />
                    {{ $t('common.forward') }}
                  </BButton>
                </template>
                <BButton
                  v-if="isMyRequests"
                  variant="outline-danger"
                  @click="modalType = REQUEST_MODAL_TYPES.CANCEL"
                  data-testid="governance-request-modal-goto-cancelrequest-btn">
                  <FrIcon name="cancel" />
                  {{ $t('governance.requestModal.cancelRequest') }}
                </BButton>
              </template>
            </BCol>
            <BButton
              variant="outline-primary"
              @click="cancel()"
              data-testid="governance-request-modal-done-btn">
              {{ $t('common.done') }}
            </BButton>
          </BRow>
        </BCol>
        <BCol
          v-else-if="!hideActions"
          data-testid="others-footer">
          <BRow class="justify-content-between">
            <BCol class="pl-0">
              <BButton
                v-if="showRequestDetailsLink"
                variant="link"
                class="mx-1"
                @click="modalType = REQUEST_MODAL_TYPES.DETAILS"
                data-testid="governance-request-modal-goto-details-link">
                {{ $t('governance.requestModal.requestDetailsLink') }}
              </BButton>
            </BCol>
            <BButton
              :class="['mr-2', modalType === REQUEST_MODAL_TYPES.CANCEL ? 'text-danger' : '']"
              variant="link"
              @click="close(cancel)"
              data-testid="governance-request-modal-cancel-btn">
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
import FrRequestDetailTabs from './DetailTabs';

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
  DETAILS: 'DETAILS',
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
    FrRequestDetailTabs,
    FrSpinner,
    ValidationObserver,
  },
  props: {
    type: {
      type: String,
      default: null,
    },
    hideActions: {
      type: Boolean,
      default: false,
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
      previousModal: null,
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
          return 'FrRequestDetailTabs';
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
          return this.$t('governance.requestModal.titles.details');
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
        if (this.previousModal === REQUEST_MODAL_TYPES.DETAILS) {
          this.modalType = REQUEST_MODAL_TYPES.DETAILS;
        } else {
          cancel();
        }
      } else if (this.previousModal === REQUEST_MODAL_TYPES.DETAILS
        && this.modalType === REQUEST_MODAL_TYPES.CANCEL) {
        this.modalType = REQUEST_MODAL_TYPES.DETAILS;
      } else {
        this.$emit('update-list');
        cancel();
      }
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
    modalType(value, oldValue) {
      this.previousModal = oldValue;
    },
  },
};
</script>

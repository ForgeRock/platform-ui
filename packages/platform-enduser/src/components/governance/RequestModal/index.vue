<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    v-slot="{ invalid }"
    ref="observer">
    <BModal
      :body-class="modalType === REQUEST_MODAL_TYPES.DETAILS ? 'p-0' : ''"
      size="lg"
      :id="modalId"
      :title="title"
      :static="isTesting"
      ref="governance-request-modal"
      :hide-footer="loading"
      @hidden="resetModal()"
    >
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
        @request-comment="updateComment"
        @request-update-actors="updateActors"
      />
      <template #modal-footer="{cancel}">
        <BCol
          v-if="component === 'FrRequestDetailTabs'"
          data-testid="details-footer">
          <BRow class="justify-content-between">
            <BCol class="pl-0">
              <BButton
                variant="outline-secondary"
                class="mx-1"
                @click="modalType = REQUEST_MODAL_TYPES.APPROVE"
                data-testid="governance-request-modal-goto-approve-btn">
                <FrIcon
                  class="text-success mr-2"
                  name="check" />
                {{ $t('common.approve') }}
              </BButton>
              <BButton
                variant="outline-secondary"
                class="mx-1"
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
            </BCol>
            <BButton
              variant="outline-primary"
              @click="close(cancel)"
              data-testid="governance-request-modal-done-btn">
              {{ $t('common.done') }}
            </BButton>
          </BRow>
        </BCol>
        <BCol
          v-else
          data-testid="others-footer">
          <BRow class="justify-content-between">
            <BCol class="pl-0">
              <BButton
                v-if="showRequestDetailsLink()"
                variant="link"
                class="mx-1"
                @click="modalType = REQUEST_MODAL_TYPES.DETAILS"
                data-testid="governance-request-modal-goto-details-link">
                {{ $t('governance.requestModal.requestDetailsLink') }}
              </BButton>
            </BCol>
            <BButton
              class="mr-2"
              variant="link"
              @click="close(cancel)"
              data-testid="governance-request-modal-cancel-btn">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              variant="primary"
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
import FrRequestDetailTabs from './DetailTabs';

export const REQUEST_MODAL_TYPES = {
  APPROVE: 'APPROVE',
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
      required: true,
    },
    item: {
      type: Object,
      default: () => ({}),
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
      actors: '',
      comment: '',
      loading: false,
      modalId: 'request_modal',
      modalType: REQUEST_MODAL_TYPES[this.type],
      previousModal: null,
    };
  },
  computed: {
    title() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.APPROVE:
          return this.$t('governance.requestModal.titles.approve');
        case REQUEST_MODAL_TYPES.COMMENT:
          return this.$t('governance.requestModal.titles.addComment');
        case REQUEST_MODAL_TYPES.REASSIGN:
          return this.$t('governance.requestModal.titles.forward');
        case REQUEST_MODAL_TYPES.REJECT:
          return this.$t('governance.requestModal.titles.reject');
        default:
          return this.$t('governance.requestModal.titles.details');
      }
    },
    buttonName() {
      switch (this.modalType) {
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
    message() {
      switch (this.modalType) {
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
    loadingText() {
      switch (this.modalType) {
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
  },
  methods: {
    /**
    * @param {Function} cancel close modal function
    */
    close(cancel) {
      if (this.previousModal === REQUEST_MODAL_TYPES.DETAILS && this.modalType === REQUEST_MODAL_TYPES.COMMENT) {
        this.modalType = REQUEST_MODAL_TYPES.DETAILS;
      } else if (this.previousModal === REQUEST_MODAL_TYPES.DETAILS && this.modalType === REQUEST_MODAL_TYPES.REASSIGN) {
        this.modalType = REQUEST_MODAL_TYPES.DETAILS;
      } else {
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
      requestAction(item.id, action, item.phaseName, this.comment, this.actors).then(() => {
        this.displayNotification('success', this.message);
      }).catch(() => {
        this.showErrorMessage('', this.errorMessage);
      }).finally(() => {
        this.loading = false;
        this.close(cancel);
      });
    },
    /**
    * Reseting modal to original values of the current component
    */
    resetModal() {
      this.modalType = REQUEST_MODAL_TYPES[this.type];
      this.previousModal = null;
    },
    showRequestDetailsLink() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.COMMENT:
        case REQUEST_MODAL_TYPES.REASSIGN:
          return false;
        default:
          return true;
      }
    },
    /**
    * @param {Array} newActors Update actors the request will be forwarded to
    */
    updateActors(newActors) {
      this.actors = newActors;
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

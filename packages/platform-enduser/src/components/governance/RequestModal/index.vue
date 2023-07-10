<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    size="lg"
    :id="modalId"
    :title="title"
    :static="isTesting"
    ref="governance-request-modal">
    <Component
      :is="component"
      :item="item"
    />
    <template #modal-footer="{cancel}">
      <BCol v-if="component === 'FrRequestDetailTabs'">
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
              @click="modalType = REQUEST_MODAL_TYPES.FORWARD"
              data-testid="governance-request-modal-goto-forward-btn">
              <FrIcon
                class="mr-2"
                name="redo" />
              {{ $t('common.forward') }}
            </BButton>
          </BCol>
          <BButton
            variant="outline-primary"
            @click="cancel"
            data-testid="governance-request-modal-done-btn">
            {{ $t('common.done') }}
          </BButton>
        </BRow>
      </BCol>
      <BCol v-else>
        <BRow class="justify-content-between">
          <BCol class="pl-0">
            <BButton
              variant="link"
              class="mx-1"
              @click="modalType = REQUEST_MODAL_TYPES.DETAILS"
              data-testid="governance-request-modal-goto-details-link">
              {{ $t('requestDetailsLink') }}
            </BButton>
          </BCol>
          <BButton
            class="mr-2"
            variant="link"
            @click="cancel"
            data-testid="governance-request-modal-cancel-btn">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            data-testid="governance-request-modal-confirm-btn">
            {{ $t('common.approve') }}
          </BButton>
        </BRow>
      </BCol>
    </template>
  </BModal>
</template>

<script>
import {
  BButton, BModal, BRow, BCol,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrRequestDetailTabs from './DetailsTabs';
import FrApproveRequest from './ApproveRequest';

export const REQUEST_MODAL_TYPES = {
  DETAILS: 'DETAILS',
  REJECT: 'REJECT',
  APPROVE: 'APPROVE',
  FORWARD: 'FORWARD',
};

export default {
  name: 'RequestModal',
  components: {
    BButton,
    BModal,
    BRow,
    BCol,
    FrApproveRequest,
    FrIcon,
    FrRequestDetailTabs,
  },
  props: {
    type: {
      type: String,
      default: REQUEST_MODAL_TYPES.DETAILS,
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
  data() {
    return {
      REQUEST_MODAL_TYPES,
      modalId: 'request_modal',
      modalType: REQUEST_MODAL_TYPES[this.type],
    };
  },
  computed: {
    title() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.APPROVE:
          return this.$t('common.approve');
        default:
          return this.$t('governance.requestModal.defaultTitle');
      }
    },
    component() {
      switch (this.modalType) {
        case REQUEST_MODAL_TYPES.APPROVE:
          return 'FrApproveRequest';
        default:
          return 'FrRequestDetailTabs';
      }
    },
  },
};
</script>

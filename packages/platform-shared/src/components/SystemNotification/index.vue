<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BAlert
      class="mb-0 rounded-0 position-fixed w-100"
      :variant="data.variant"
      :show="active"
      data-testid="system-notification">
      <div class="d-flex align-items-center justify-content-center h-100">
        <span class="w-100 text-center">
          <span
            class="d-inline-block"
            v-html="data.content" />
          <BButton
            v-if="data.modal"
            variant="link"
            class="d-inline-block alert-link p-0 align-top"
            @click="showModal()"
            data-testid="notification-view-details">
            {{ $t('common.viewDetails') }}
          </BButton>
        </span>
        <BButton
          variant="link"
          :aria-label="$t('common.close')"
          class="close"
          @click="$emit('hide-system-notification')"
          data-testid="notification-close">
          <FrIcon name="close" />
        </BButton>
      </div>
    </BAlert>
    <BModal
      v-if="data.modal"
      id="SystemNotificationModal"
      ref="SystemNotificationModal"
      @hidden="$emit('bv::hide::modal', 'SystemNotificationModal')"
      ok-only
      ok-variant="outline-primary"
      :ok-title="$t('common.done')"
      data-testid="system-notification-modal"
      :static="isTesting">
      <template #modal-title>
        <span
          data-testid="system-notification-modal-title"
          v-html="data.modal.title" />
      </template>
      <div
        data-testid="system-notification-modal-content"
        v-html="data.modal.content" />
    </BModal>
  </div>
</template>

<script>
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { BAlert, BButton, BModal } from 'bootstrap-vue';

/**
 * Displays an alert message at the top of the page with an optional view details
 * modal for displaying further information
 */
export default {
  name: 'SystemNotification',
  components: {
    BAlert,
    BButton,
    BModal,
    FrIcon,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    active: {
      type: Boolean,
      default: false,
    },
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    showModal() {
      this.$bvModal.show('SystemNotificationModal');
    },
  },
};
</script>

<style lang="scss" scoped>

.alert {
  z-index: 10000; // Modified to appear above navigation bars
  height: $fr-system-notification-height;
  color: $gray-700;

  .btn {
    color: $gray-700;
    text-decoration: none;
  }

  .close span {
    font-size: 26px;
    vertical-align: initial;
  }
}

#SystemNotificationModal___BV_modal_outer_ {
  z-index: 100000 !important; // Needs to appear above alert
}

</style>

<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

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
            v-html="contentWithLocalizedDate(data.content)" />
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
      data-testid="system-notification-modal">
      <template
        #modal-title>
        <span
          data-testid="system-notification-modal-title"
          v-html="data.modal.title" />
      </template>
      <div
        data-testid="system-notification-modal-content"
        v-html="contentWithLocalizedDate(data.modal.content)" />
    </BModal>
  </div>
</template>

<script>
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { BAlert, BButton, BModal } from 'bootstrap-vue';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
// These extentions to the day.js library are both required to localize dates
// contained in the system notification message.
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

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
  },
  methods: {
    showModal() {
      this.$root.$emit('bv::show::modal', 'SystemNotificationModal');
    },
    /*
     * Migration messages can sometimes contain dates. They are denoted by a
     * {{placeholder_management_migration_date}} placeholder. An example message
     * would be "Scheduled Tenant Migration {{placeholder_management_migration_date}}"
     * If it exists, we want to replace this placeholder with a localized date
     */
    contentWithLocalizedDate(content) {
      const { placeholderManagementMigrationDate } = this.data;
      const placeholderRegex = /{{placeholder_management_migration_date}}/g;
      if (placeholderManagementMigrationDate) {
        const localDate = dayjs(placeholderManagementMigrationDate).format('MMMM D, YYYY h:mm A z');
        return content.replace(placeholderRegex, localDate);
      }
      return content;
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

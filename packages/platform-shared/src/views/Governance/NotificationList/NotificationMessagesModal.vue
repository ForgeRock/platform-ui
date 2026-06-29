<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="pb-0"
    content-class="border-0"
    footer-class="justify-content-end"
    :id="modalId"
    no-close-on-backdrop
    scrollable
    size="lg"
    @hidden="onHidden">
    <template #modal-header="{ close }">
      <h5 class="modal-title">
        {{ $t('governance.notifications.systemMessagesModal.title', { count: systemMessages.length }) }}
      </h5>
      <BButtonClose
        class="ml-auto"
        variant="link"
        @click="close">
        <FrIcon
          icon-class="md-24"
          name="close" />
      </BButtonClose>
    </template>

    <template v-if="!systemMessages.length">
      <p class="text-muted py-4 text-center">
        {{ $t('governance.notifications.systemMessagesModal.empty') }}
      </p>
    </template>

    <template v-else>
      <BTable
        borderless
        class="mb-0"
        thead-class="d-none"
        :fields="fields"
        :items="systemMessages"
        :current-page="currentPage"
        :per-page="itemsPerPage">
        <template #cell(icon)>
          <div class="d-flex flex-column mr-4 position-absolute h-100 message-icon">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center py-2">
              <FrIcon
                icon-class="md-18"
                name="chat_bubble_outline" />
            </div>
            <div class="thread-line flex-grow-1 my-2" />
          </div>
        </template>
        <template #cell(message)="{ item }">
          <div class="media-body my-2 pr-5 border-bottom">
            <div class="text-muted mb-1 small">
              {{ formatDate(item.timeStamp) }}
            </div>
            <p class="mb-0">
              {{ item.comment }}
            </p>
          </div>
        </template>
      </BTable>
      <FrPagination
        v-model="currentPage"
        boundary="scrollParent"
        hide-border
        :per-page="itemsPerPage"
        :total-rows="systemMessages.length"
        @on-page-size-change="itemsPerPage = $event" />
    </template>

    <template #modal-footer="{ cancel }">
      <BButton
        variant="outline-primary"
        @click="cancel()">
        {{ $t('common.done') }}
      </BButton>
    </template>
  </BModal>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import {
  BButton,
  BButtonClose,
  BModal,
  BTable,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';

defineProps({
  modalId: {
    type: String,
    default: 'NotificationMessagesModal',
  },
  systemMessages: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close-modal']);

const currentPage = ref(1);
const itemsPerPage = ref(10);

const fields = [
  { key: 'icon', class: 'column icon-column position-relative' },
  { key: 'message', class: 'column' },
];

/**
 * Resets pagination and emits close-modal when the modal hides.
 * Resetting currentPage ensures a subsequent opening starts at page 1
 * regardless of which page the user was on when they closed the modal.
 */
function onHidden() {
  currentPage.value = 1;
  emit('close-modal');
}

/**
 * Formats a system message timestamp for display inside the modal.
 * @param {string} date - ISO date string
 * @returns {string} Formatted date (e.g. "May 7, 2026 2:30 PM") or empty string if falsy
 */
function formatDate(date) {
  return date ? dayjs(date).format('MMM DD, YYYY h:mm:ss A') : '';
}
</script>

<style lang="scss" scoped>
.message-icon {
  top: 0.5rem;

  .rounded-circle {
    width: 2rem;
    height: 2rem;
  }
}

:deep {
  .modal-body {
    min-height: 200px;
  }

  .column {
    padding: 0;
  }

  .icon-column {
    width: 56px;
  }

  .thread-line {
    width: 2px;
    background: $gray-300;
    margin-left: 0.875rem;
  }

  tr:last-child {
    .thread-line {
      display: none;
    }

    .media-body {
      border-bottom: none !important;
    }
  }
}
</style>

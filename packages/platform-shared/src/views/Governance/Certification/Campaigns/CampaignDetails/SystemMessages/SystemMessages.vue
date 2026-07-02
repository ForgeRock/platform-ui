<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <div v-if="allMessages.length">
      <ul class="list-feed px-4 pt-4 pb-0 mb-0 border-bottom">
        <BMedia
          v-for="item in visibleMessages"
          :key="`${item.date}-${item.type}-${item.message}`"
          tag="li"
          no-body
          class="list-feed-item pb-0 align-items-stretch">
          <div class="d-flex flex-column">
            <div class="fr-system-messages__icon-circle d-flex align-items-center justify-content-center rounded-circle bg-light mr-4 my-2">
              <span class="sr-only">{{ item.type === 'error' ? $t('common.error') : $t('governance.certificationDetails.systemMessages.typeInfo') }}</span>
              <FrIcon :name="item.type === 'error' ? 'error_outline' : 'message'" />
            </div>
            <div class="thread-line flex-grow-1 py-2" />
          </div>
          <BMediaBody class="my-2 pr-5 border-bottom">
            <BMedia class="align-items-center mb-2">
              <div class="text-dark d-flex flex-wrap justify-content-start">
                <div>
                  {{ formatDate(item.date) }}
                </div>
              </div>
            </BMedia>
            <div class="pr-lg-5">
              <p>{{ item.message }}</p>
            </div>
          </BMediaBody>
        </BMedia>
      </ul>
      <FrPagination
        v-if="allMessages.length > itemsPerPage"
        v-model="currentPage"
        :per-page="itemsPerPage"
        :total-rows="allMessages.length"
        @on-page-size-change="updatePageSize" />
    </div>
    <FrNoData
      v-else
      :card="false"
      class="mb-4"
      icon="inbox"
      :title="$t('governance.certificationDetails.systemMessages.noMessagesTitle')"
      :subtitle="$t('governance.certificationDetails.systemMessages.noMessagesSubtitle')" />
  </BCard>
</template>

<script setup>
import dayjs from 'dayjs';
import { BCard, BMedia, BMediaBody } from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';

// component props
const props = defineProps({
  systemMessages: {
    type: Object,
    default: () => ({ errors: [], info: [] }),
  },
});

// data
const currentPage = ref(1);
const itemsPerPage = ref(10);

/**
 * Merged, type-tagged, date-ascending list of all system messages.
 * @type {import('vue').ComputedRef<Array<{message: string, date: string, type: string}>>}
 */
const allMessages = computed(() => {
  const errors = (props.systemMessages?.errors || []).map((item) => ({ ...item, type: 'error' }));
  const info = (props.systemMessages?.info || []).map((item) => ({ ...item, type: 'info' }));
  return [...errors, ...info].sort((a, b) => new Date(a.date) - new Date(b.date));
});

/**
 * The slice of allMessages visible on the current page.
 * @type {import('vue').ComputedRef<Array>}
 */
const visibleMessages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return allMessages.value.slice(start, start + itemsPerPage.value);
});

/**
 * Update the current page size
 * @param {Number} value updated page size
 */
function updatePageSize(value) {
  itemsPerPage.value = value;
}

watch(() => props.systemMessages, () => {
  currentPage.value = 1;
}, { deep: true });

/**
 * Format a date string for display
 * @param {String} date date to parse
 * @returns {String} formatted date
 */
function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}
</script>

<style lang="scss" scoped>
.thread-line {
  width: 2px;
  background: $light-gray;
  margin-left: 0.875rem;
}

.fr-system-messages__icon-circle {
  width: 2rem;
  height: 2rem;
}

.list-feed > .list-feed-item:last-child {
  .thread-line {
    display: none
  }
  .media-body {
    border-bottom: none !important;
  }
}
</style>

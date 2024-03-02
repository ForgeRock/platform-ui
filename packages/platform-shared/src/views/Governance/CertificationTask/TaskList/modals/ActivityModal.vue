<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    :ok-title="$t('common.done')"
    :title="$t('governance.certificationTask.lineItemActivityModal.title')"
    @hidden="$emit('close-modal')"
    body-class="pb-0"
    content-class="border-0"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    scrollable
    size="lg">
    <div v-if="activity.length">
      <!-- Activity list -->
      <BTable
        :current-page="currentPage"
        :fields="fields"
        :items="activity"
        :per-page="itemsPerPage"
        borderless
        class="mb-0"
        thead-class="d-none">
        <!-- Icon -->
        <template #cell(icon)="{ item }">
          <div class="d-flex flex-column mr-4 position-absolute h-100 activity-icon">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center py-2">
              <FrIcon
                :name="getIcon(item.action)"
                icon-class="md-18" />
            </div>
            <div class="thread-line flex-grow-1 my-2" />
          </div>
        </template>

        <!-- Item -->
        <template #cell(activity)="{ item }">
          <BMediaBody class="my-2 pr-5 border-bottom">
            <BMedia
              class="align-items-center mb-2"
              no-body>
              <BImg
                class="mr-3 rounded-circle"
                height="16"
                width="16"
                :alt="$t('common.userFullName', { givenName: item.user.givenName, sn: item.user.sn })"
                :src="item.user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                fluid />
              <BMediaBody>
                <div class="text-dark d-flex justify-content-start">
                  <div class="font-weight-bold">
                    {{ $t('common.userFullName', { givenName: currentGivenName(item.user), sn: item.user.sn }) }}
                    <span class="text-secondary">
                      {{ item.user.userName }}
                    </span>
                  </div>
                  <span class="mx-2 opacity-50">
                    •
                  </span>
                  <div>{{ formatDate(item.timeStamp) }}</div>
                </div>
              </BMediaBody>
            </BMedia>

            <div class="pr-lg-5">
              <p>
                {{ item.comment }}
              </p>
            </div>
          </BMediaBody>
        </template>
      </BTable>

      <!-- Pagination -->
      <FrPagination
        v-model="currentPage"
        boundary="scrollParent"
        hide-border
        :per-page="itemsPerPage"
        :total-rows="activity.length"
        @on-page-size-change="updatePageSize" />
    </div>
    <FrNoData
      v-else
      :card="false"
      class="mb-4"
      icon="inbox"
      :subtitle="$t('governance.certificationTask.lineItemActivityModal.noActivity')" />
  </BModal>
</template>

<script setup>
import dayjs from 'dayjs';
import {
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import { ref } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';

/**
 * Activity icons
 * @constant
 * @type {Map<String, String>}
 * @default
 */
const ICONS = new Map([
  ['approve', 'check'],
  ['certify', 'check'],
  ['comment', 'chat_bubble_outline'],
  ['exception', 'schedule'],
  ['forward', 'redo'],
  ['reassign', 'person_add'],
  ['remediation', 'redo'],
  ['remove', 'person_remove'],
  ['revoke', 'block'],
]);

defineEmits(['close-modal']);

// component props
defineProps({
  activity: {
    type: Array,
    default: () => [],
  },
  modalId: {
    type: String,
    default: 'CertificationTaskActivityAccountModal',
  },
});

// data
const currentPage = ref(1);
const itemsPerPage = ref(5);
const fields = ref([
  {
    class: 'column icon-column position-relative',
    key: 'icon',
  },
  {
    class: 'column',
    key: 'activity',
  },
]);

/**
 * Update the current page size
 * @param {Number} value updated page size
 */
function updatePageSize(value) {
  itemsPerPage.value = value;
}

/**
 * Format the date to display it in the modal
 * @param {String} date date to parse
 */
function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

/**
 * Returns the name of the user who made the event
 * @param {Object} activity activity info object
 * @param {String} activity.givenName user given name
 * @param {String} activity.id user ID
 */
function currentGivenName({ givenName, id }) {
  if (id === 'SYSTEM') {
    return 'SYSTEM';
  }
  return givenName;
}

/**
 * Returns the icon corresponding to the action
 * @param {String} action type of action
 */
function getIcon(action) {
  return ICONS.get(action);
}
</script>

<style lang="scss" scoped>
.activity-icon {
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
    padding:0;
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

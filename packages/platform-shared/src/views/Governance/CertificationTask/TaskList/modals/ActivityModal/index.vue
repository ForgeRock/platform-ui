<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :ok-title="$t('common.done')"
    :title="$t('governance.certificationTask.lineItemActivityModal.title')"
    @hidden="$emit('close-modal')"
    body-class="pb-0"
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    scrollable
    size="lg">
    <!-- Activity list -->
    <BTable
      class="mb-0"
      borderless
      thead-class="d-none"
      :current-page="currentPage"
      :items="activity"
      :fields="fields"
      :per-page="itemsPerPage">
      <!-- Icon -->
      <template #cell(icon)="{ item }">
        <div
          class="d-flex flex-column mr-4 position-absolute h-100 activity-icon">
          <div
            class="rounded-circle bg-light d-flex align-items-center justify-content-center py-2">
            <FrIcon
              :name="getIcon(item.action)"
              class="md-18"
            />
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
      @input="updateCurrentPage"
      @on-page-size-change="updatePageSize" />
  </BModal>
</template>

<script>
import dayjs from 'dayjs';
import {
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';

/**
 * Activity icons
 * @constant
 * @type {Map<String, String>}
 * @default
 */
const ICONS = new Map([
  ['approve', 'check'],
  ['comment', 'chat_bubble_outline'],
  ['exception', 'schedule'],
  ['forward', 'redo'],
  ['reassign', 'person_add'],
  ['remediation', 'redo'],
  ['remove', 'person_remove'],
  ['revoke', 'block'],
]);

export default {
  name: 'ActivityModal',
  components: {
    BMediaBody,
    BModal,
    BTable,
    FrIcon,
    FrPagination,
  },
  props: {
    activity: {
      type: Array,
      default: () => [],
    },
    modalId: {
      type: String,
      default: 'CertificationTaskActivityAccountModal',
    },
  },
  data() {
    return {
      activityFiltered: [],
      currentPage: 1,
      itemsPerPage: 5,
      fields: [
        {
          class: 'column icon-column position-relative',
          key: 'icon',
        },
        {
          class: 'column',
          key: 'activity',
        },
      ],
    };
  },
  methods: {
    updateCurrentPage(value) {
      this.currentPage = value;
    },
    updatePageSize(pageSize) {
      this.itemsPerPage = pageSize;
    },
    formatDate(date) {
      return dayjs(date).format('MMM D, YYYY h:mm A');
    },
    currentGivenName({ givenName, id }) {
      if (id === 'SYSTEM') {
        return 'SYSTEM';
      }
      return givenName;
    },
    getIcon(action) {
      return ICONS.get(action);
    },
  },
};
</script>

<style lang="scss" scoped>
.activity-icon {
  top: 0.5rem;

  .rounded-circle {
    width: 2rem;
    height: 2rem;
  }
}

::v-deep {
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

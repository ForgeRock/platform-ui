<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    @hidden="$emit('close-modal')"
    body-class="pb-0"
    content-class="border-0"
    footer-class="justify-content-between"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    scrollable
    size="lg">
    <template #modal-header="{ close }">
      <h5 class="modal-title">
        {{ $t('governance.certificationTask.lineItemCommentsModal.title', { count: comments.length }) }}
      </h5>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>

    <!-- Loading spinner -->
    <template v-if="!comments.length">
      <FrSpinner class="py-5" />
    </template>

    <!-- Content -->
    <template v-else>
      <BTable
        class="mb-0"
        borderless
        thead-class="d-none"
        :current-page="commentsCurrentPage"
        :items="comments"
        :fields="commentsFields"
        :per-page="commentsItemsPerPage">
        <template #cell(icon)>
          <div
            class="d-flex flex-column mr-4 position-absolute h-100 comment-icon">
            <div
              class="rounded-circle bg-light d-flex align-items-center justify-content-center py-2">
              <FrIcon
                name="chat_bubble_outline"
                icon-class="md-18" />
            </div>
            <div class="thread-line flex-grow-1 my-2" />
          </div>
        </template>
        <template #cell(comment)="{ item }">
          <div class="media-body my-2 pr-5 border-bottom">
            <BMedia
              class="align-items-center mb-2"
              no-body>
              <BImg
                v-if="item.user"
                class="mr-3 rounded-circle"
                height="16"
                width="16"
                :alt="$t('common.userFullName', { givenName: item.user.givenName, sn: item.user.sn })"
                :src="item.user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                fluid />
              <div class="media-body">
                <div class="text-dark d-flex justify-content-start">
                  <div
                    class="font-weight-bold"
                    v-if="item.user"
                  >
                    {{ $t('common.userFullName', { givenName: item.user.givenName, sn: item.user.sn }) }}
                    <span class="text-secondary">
                      {{ item.user.userName }}
                    </span>
                  </div>
                  <span class="mx-2 opacity-50">
                    •
                  </span>
                  <div>{{ formatDate(item.timeStamp) }}</div>
                </div>
              </div>
            </BMedia>
            <div class="pr-lg-5">
              <p>
                {{ item.comment }}
              </p>
            </div>
          </div>
        </template>
      </BTable>
      <FrPagination
        v-model="commentsCurrentPage"
        boundary="scrollParent"
        hide-border
        :per-page="commentsItemsPerPage"
        :total-rows="comments.length"
        @input="commentsPaginationChange"
        @on-page-size-change="commentsPageSizeChange" />
    </template>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="outline-primary"
        @click="openAddCommentModal()">
        <FrIcon
          name="add"
          icon-class="md-15">
          {{ $t('governance.certificationTask.actions.addComment') }}
        </FrIcon>
      </BButton>
      <BButton
        variant="outline-primary"
        @click="cancel()">
        {{ $t('common.done') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import dayjs from 'dayjs';
import {
  BButtonClose,
  BModal,
  BTable,
  BButton,
  BMedia,
  BImg,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';

export default {
  name: 'CommentsModal',
  components: {
    BButton,
    BButtonClose,
    BImg,
    BMedia,
    BModal,
    BTable,
    FrIcon,
    FrPagination,
    FrSpinner,
  },
  props: {
    comments: {
      type: Array,
      default: () => [],
    },
    modalId: {
      type: String,
      default: 'CertificationTaskCommentsAccountModal',
    },
  },
  data() {
    return {
      commentsCurrentPage: 1,
      commentsFiltered: [],
      commentsItemsPerPage: 10,
      commentsFields: [
        {
          class: 'column icon-column position-relative',
          key: 'icon',
        },
        {
          class: 'column',
          key: 'comment',
        },
      ],
    };
  },
  methods: {
    commentsPaginationChange(value) {
      this.commentsCurrentPage = value;
    },
    commentsPageSizeChange(pageSize) {
      this.commentsItemsPerPage = pageSize;
    },
    formatDate(date) {
      return dayjs(date).format('MMM D, YYYY h:mm A');
    },
    openAddCommentModal() {
      this.$emit('open-add-comment-modal');
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-icon {
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

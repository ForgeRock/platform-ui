<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      v-if="filteredComments.length === 0"
      class="px-4 py-5 h-100 text-center">
      <div
        class="mb-4 mt-3 opacity-20">
        <FrIcon
          name="chat_bubble_outline"
          class="md-48" />
      </div>
      <h2 class="h5">
        {{ $t('governance.requestModal.noComments') }}
      </h2>
      <BButton
        variant="link"
        @click="$emit('change-modal-type', REQUEST_MODAL_TYPES.COMMENT)">
        <FrIcon
          class="mr-2"
          name="add" />{{ $t('governance.requestModal.addComment') }}
      </BButton>
    </div>
    <div
      v-else
      class="scroll-comments py-4 px-2 p-lg-4">
      <div
        class="d-flex justify-content-between align-items-start mb-2 pb-1">
        <h2 class="h5">
          {{ $t('common.comments') }}
        </h2>
        <BButton
          class="py-0 px-2"
          variant="link"
          @click="$emit('change-modal-type', REQUEST_MODAL_TYPES.COMMENT)">
          <FrIcon
            class="mr-2"
            name="add" />{{ $t('governance.requestModal.addComment') }}
        </BButton>
      </div>
      <ul
        id="commentsList"
        class="list-feed pl-0 mb-0">
        <BMedia
          v-for="(commentObj, index) in pagedComments"
          :key="index"
          tag="li"
          no-body
          class="list-feed-item pb-0 align-items-stretch">
          <div class="d-flex flex-column">
            <div
              class="d-flex align-items-center justify-content-center rounded-circle bg-light mr-4 my-2"
              style="width: 2rem; height: 2rem;">
              <FrIcon name="chat_bubble_outline" />
            </div>
            <div class="thread-line flex-grow-1 py-2" />
          </div>
          <BMediaBody class="my-2 pr-5 border-bottom">
            <BMedia class="align-items-center mb-2">
              <template #aside>
                <BImg
                  class="rounded-circle"
                  height="28"
                  width="28"
                  alt=""
                  :aria-hidden="true"
                  :src="commentObj.user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              </template>
              <div class="text-dark d-flex flex-wrap justify-content-start">
                <div class="font-weight-bold">
                  {{ $t('common.userFullName', { givenName: commentObj.user.givenName, sn: commentObj.user.sn }) }}
                  <span class="text-secondary">
                    {{ commentObj.user.userName }}
                  </span>
                </div>
                <span class="d-none d-lg-block mx-2 opacity-50">
                  •
                </span>
                <div>
                  {{ dayjs(commentObj.timeStamp).format('MMM D, YYYY h:mm A') }}
                </div>
              </div>
            </BMedia>
            <div
              class="pr-lg-5">
              <p>
                {{ commentObj.comment }}
              </p>
            </div>
          </BMediaBody>
        </BMedia>
      </ul>
      <FrPagination
        v-if="filteredComments.length > 10"
        class="border-top-0"
        v-model="currentPage"
        :per-page="entriesPerPage"
        :total-rows="filteredComments.length"
        @on-page-size-change="(size) => { entriesPerPage = size }"
      />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import {
  BButton,
  BImg, BMedia, BMediaBody,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { REQUEST_MODAL_TYPES } from '@/components/governance/RequestModal';

export default {
  name: 'RequestModalComments',
  components: {
    BButton,
    BImg,
    BMedia,
    BMediaBody,
    FrIcon,
    FrPagination,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      REQUEST_MODAL_TYPES,
      comments: this.item.rawData.decision.comments,
      currentPage: 1,
      entriesPerPage: 10,
    };
  },
  computed: {
    filteredComments() {
      return this.comments.filter(({ action }) => action === 'comment');
    },
    // All comment's are included in the object but we only want to show a portion of them
    pagedComments() {
      const start = (this.currentPage - 1) * this.entriesPerPage;
      const end = start + this.entriesPerPage;
      return this.filteredComments.slice(start, end);
    },
  },
  methods: {
    dayjs,
  },
};
</script>

<style lang="scss" scoped>
.thread-line {
  width: 2px;
  background: $light-gray;
  margin-left: 0.875rem;
}

.list-feed > .list-feed-item:last-child {
  .thread-line {
    display: none
  }
  .media-body {
    border-bottom: none !important;
  }
}
.scroll-comments {
    height: 70vh;
    overflow-y: auto;
}
</style>

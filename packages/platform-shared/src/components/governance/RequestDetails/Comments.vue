<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div>
      <div
        class="d-flex justify-content-between align-items-start py-3 px-4 border-bottom">
        <BButton
          v-if="!hideActions"
          data-testid="btn-add-comments"
          variant="primary"
          @click="$emit('add-comment')">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('governance.requestModal.addComment') }}
          </FrIcon>
        </BButton>
        <BButtonGroup>
          <BDropdown
            variant="link"
            toggle-class="text-dark px-0 d-flex">
            <template #button-content>
              <div class="p-0 toolbar-link-text">
                <span class="font-weight-bold mr-1">
                  {{ $t('governance.requestModal.comments.viewType', { type: filterOptions[selectedFilterIndex].label }) }}
                </span>
              </div>
            </template>

            <template #default>
              <BDropdownItem
                v-for="(filterItem, index) in filterOptions"
                :active="selectedFilterIndex === index"
                :key="`${filterItem.label}_DropdownItem`"
                @click="setFilterIndex(index)">
                {{ filterItem.label }}
              </BDropdownItem>
            </template>
          </BDropdown>
        </BButtonGroup>
      </div>
      <div
        v-if="filteredComments.length === 0"
        class="px-4 py-5 text-center">
        <div class="mb-4 mt-3 opacity-20">
          <FrIcon
            name="chat_bubble_outline"
            icon-class="md-48" />
        </div>
        <h2 class="h5">
          {{ $t('governance.requestModal.noComments') }}
        </h2>
        <p class="mb-4">
          {{ $t('governance.requestModal.noCommentsSubtitle') }}
        </p>
      </div>
      <ul
        id="commentsList"
        class="list-feed px-4 pt-4 pb-0 mb-0 border-bottom">
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
                  class="rounded-circle size-28"
                  alt=""
                  :aria-hidden="true"
                  :src="commentObj.user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              </template>
              <div class="text-dark d-flex flex-wrap justify-content-start">
                <div class="font-weight-bold">
                  {{ commentObj.user?.id === 'SYSTEM' ? $t('common.system') : $t('common.userFullName', { givenName: commentObj.user.givenName, sn: commentObj.user.sn }) }}
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
        class="border-top-0 pb-0"
        v-model="currentPage"
        :per-page="entriesPerPage"
        :total-rows="filteredComments.length"
        @on-page-size-change="(size) => { entriesPerPage = size }" />
    </div>
  </div>
</template>

<script setup>
/**
 * Displays the list of comments made and provides the option to add new ones.
 * @component Comments
 * @prop {Object} item - The object that has the information with the comments and ID to add new ones
 * @prop {Boolean} hideActions - Variable that determines whether or not to show the component's actions
 */
import dayjs from 'dayjs';
import {
  BButton,
  BImg,
  BMedia,
  BMediaBody,
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import i18n from '@/i18n';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  hideActions: {
    type: Boolean,
    default: false,
  },
});

const currentPage = ref(1);
const entriesPerPage = ref(10);
const filterOptions = [
  { id: 'all', label: i18n.global.t('governance.requestModal.comments.all') },
  { id: 'user', label: i18n.global.t('governance.requestModal.comments.user') },
];
const selectedFilterIndex = ref(0);

function setFilterIndex(index) {
  selectedFilterIndex.value = index;
}

/**
 * Returns whether or not a specific comment should appear in the table
 * @param {Object}  comment Comment object
 */
function isCommentShown(comment) {
  const filterId = filterOptions[selectedFilterIndex.value]?.id;
  switch (filterId) {
    case 'user':
      return comment?.user?.id !== 'SYSTEM';
    case 'all':
    default:
      return true;
  }
}

const filteredComments = computed(() => props.item.rawData.decision.comments.filter(isCommentShown));
// All comment's are included in the object but we only want to show a portion of them
const pagedComments = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value;
  const end = start + entriesPerPage.value;
  return filteredComments.value.slice(start, end);
});
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
</style>

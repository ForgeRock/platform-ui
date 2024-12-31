<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BListGroup
      v-if="requestItems && requestItems.length"
      class="list-group-flush mb-0"
      role="group"
      :aria-label="listName">
      <template
        v-for="(item, index) in requestItems"
        :key="index">
        <BListGroupItem
          button
          :aria-label="item.name"
          class="d-flex align-items-center px-3 "
          data-testid="request-item-list"
          :class="{'cursor-pointer fr-hover-item': frHover}"
          :style="context === 'accessItem' ? 'min-height: 100px' : ''"
          @click="frHover ? $emit('requested-item-click', item.id) : ''">
          <BMedia
            no-body
            class="w-100 align-items-center">
            <div
              v-if="context === 'accessItem' && item.itemType === 'role'"
              class="rounded-circle bg-lightblue text-primary d-flex align-items-center justify-content-center mr-3"
              data-testid="role-icon"
              style="width: 24px; height: 24px;">
              <FrIcon name="assignment_ind" />
            </div>
            <BImg
              v-else
              class="mr-3"
              width="24"
              height="24"
              :alt="item.name"
              :class="{ 'rounded-circle': context === 'user' }"
              :src="item.icon || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            <BMediaBody class="overflow-hidden">
              <template v-if="context === 'accessItem'">
                <div class="mb-1 h6 text-muted font-weight-normal text-uppercase">
                  {{ item.itemType }}
                </div>
                <div class="text-truncate mb-0 h5">
                  {{ item.name }}
                </div>
                <div
                  v-if="item.description"
                  class="text-truncate pr-3"
                  data-testid="description-container">
                  <small class="d-block text-truncate text-muted">
                    {{ item.description }}
                  </small>
                </div>
              </template>
              <template v-else>
                <div class="mb-0 h5">
                  {{ item.name }}
                </div>
                <small class="text-muted">
                  {{ item.userName }}
                </small>
              </template>
            </BMediaBody>
            <BButton
              v-if="showDeleteButton"
              class="text-dark p-0"
              variant="link"
              data-testid="remove-requested-item-button"
              @click.stop="$emit('remove-requested-item', context, item.id)">
              <FrIcon
                icon-class="mr-2"
                name="delete" />
            </BButton>
          </BMedia>
        </BListGroupItem>
      </template>
    </BListGroup>
    <div
      v-else-if="showEmptyState"
      class="d-flex flex-column align-items-center justify-content-center text-center h-100 pb-4"
      data-testid="empty-request-items-container">
      <slot>
        <FrIcon
          icon-class="opacity-30 mb-3 md-48 pt-4"
          name="add" />
        <h3 class="h5">
          {{ $t('governance.accessRequest.newRequest.noRequestedItemsYet') }}
        </h3>
        <p>
          {{ $t('governance.accessRequest.newRequest.addItems') }}
        </p>
      </slot>
    </div>
  </div>
</template>

<script>
import {
  BImg,
  BButton,
  BListGroup,
  BListGroupItem,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
/**
 * Lists out the selected access request items
 */
export default {
  name: 'RequestItemsList',
  components: {
    BImg,
    BButton,
    BListGroup,
    BListGroupItem,
    BMedia,
    BMediaBody,
    FrIcon,
  },
  props: {
    context: {
      type: String,
      default: 'user',
      validator(value) {
        return ['user', 'accessItem'].includes(value);
      },
    },
    frHover: {
      type: Boolean,
      default: false,
    },
    listName: {
      type: String,
      default: undefined,
    },
    requestItems: {
      type: Array,
      default: () => [],
    },
    showDeleteButton: {
      type: Boolean,
      default: true,
    },
    showEmptyState: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
  .fr-hover-item:hover {
    background-color: $gray-100;
  }
</style>

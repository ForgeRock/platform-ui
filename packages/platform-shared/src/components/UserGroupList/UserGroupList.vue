<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrUserBasicInfo
    v-for="user in usersToRender"
    data-testid="user-info"
    class="row-height mb-3"
    :key="user.id"
    :is-role="user.id?.includes('role')"
    :user="user"
  />
  <template v-if="renderShowMore">
    <BButton
      @click="showMore = !showMore;"
      data-testid="show-more-button"
      class="pl-0 pb-4"
      variant="link">
      {{ showMore ? $t('common.hideMore', { count: usersToShowMore.length }) : $t('common.showMore', { count: usersToShowMore.length}) }}
    </BButton>
    <BCollapse v-model="showMore">
      <FrUserBasicInfo
        v-for="user in usersToShowMore"
        class="row-height mb-3"
        :key="user.id"
        :user="user"
        :is-role="user.id?.includes('role')"
      />
    </BCollapse>
  </template>
</template>

<script setup>
/**
 * Component for rendering a list of basic user information.
 * @component UserGroupList
 * @prop {Boolean} hideShowMore - Option to determine if want to hide the 'show more' option.
 * @prop {Array} usersList - The array of user objects to display.
 * @prop {Number} usersToDisplay - The maximum number of users to display initially.
 */
import {
  BButton,
  BCollapse,
} from 'bootstrap-vue';
import { ref, watch } from 'vue';
import FrUserBasicInfo from './UserBasicInfo';

const prop = defineProps({
  hideShowMore: {
    type: Boolean,
    default: false,
  },
  usersList: {
    type: Object,
    required: true,
  },
  usersToDisplay: {
    type: Number,
    default: 5,
  },
});

const usersToRender = ref([]);
const usersToShowMore = ref([]);
const showMore = ref(false);
const renderShowMore = ref(false);

watch(
  () => prop.usersList,
  (newVal) => {
    if (prop.hideShowMore) {
      usersToRender.value = newVal;
      return;
    }
    const exceedsRendering = newVal.length > prop.usersToDisplay;
    renderShowMore.value = exceedsRendering;
    if (exceedsRendering) {
      usersToRender.value = newVal.slice(0, prop.usersToDisplay);
      usersToShowMore.value = newVal.slice(prop.usersToDisplay);
    } else {
      usersToRender.value = newVal;
    }
  }, { immediate: true },
);
</script>

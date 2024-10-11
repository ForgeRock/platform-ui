<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="card-tabs-vertical">
    <BTabs
      class="w-100"
      style="min-height: 375px;"
      pills
      card
      vertical
      v-model="tabIndex">
      <BTab
        v-for="(tab, index) in tabsToShow"
        :key="tab.title"
        :title="tab.title"
        class="p-0"
        :data-testid="`tab-${tab}`">
        <template
          v-if="tab.component === 'FrComments'"
          #title>
          {{ tab.title }}
          <BBadge
            class="ml-3"
            pill
            :variant="tabIndex === index ? 'primary': 'secondary'">
            {{ commentsCount }}
          </BBadge>
        </template>
        <Component
          :is="tab.component"
          :item="item"
          :hide-actions="tab.hideActions"
          :is-approval="tab.isApproval"
          :read-only="tab.readOnly"
          v-on="$listeners" />
      </BTab>
    </BTabs>
  </div>
</template>

<script setup>
/**
 * Displays the Request details on tabs
 * @component RequestDetails
 * @prop {Object} item - All request data
 * @prop {Boolean} hideActions - Variable that determines whether or not to show the component's actions
 */
import {
  BBadge, BTabs, BTab,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import FrComments from './Comments';
import FrDetailsTab from './DetailsTab';
import FrTasks from './Tasks';
import FrWorkflow from './Workflow';
import i18n from '@/i18n';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  hideActions: {
    type: Object,
    default: () => ({ comment: false }),
  },
  hideTracking: {
    type: Boolean,
    default: false,
  },
  isApproval: {
    type: Boolean,
    default: false,
  },
});

const tabs = ref([
  {
    component: FrDetailsTab,
    title: i18n.global.t('common.details'),
    isApproval: props.isApproval,
    readOnly: props.hideActions.modify,
  },
  {
    component: FrWorkflow,
    title: i18n.global.t('governance.requestModal.titles.tracking'),
    hide: props.hideTracking,
  },
  {
    component: FrComments,
    title: i18n.global.t('common.comments'),
    hideActions: props.hideActions.comment,
  },
  {
    component: FrTasks,
    title: i18n.global.t('common.tasks'),
  },
]);
const tabsToShow = computed(() => tabs.value.filter(({ hide }) => !hide));
const tabIndex = ref(0);

const commentsCount = computed(() => props.item.rawData.decision.comments.filter(({ action }) => action === 'comment').length);
</script>

<style lang="scss" scoped>
  :deep(.nav-pills) {
    padding: 0px;
  }

  :deep(.tabs > .col-auto) {
    min-width: 160px;
  }

  .card-tabs-vertical :deep(.nav) {
    margin-left: -1px;
  }
</style>

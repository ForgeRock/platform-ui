<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <h2 class="h5 mb-2 pb-1">
      {{ $t('governance.requestModal.titles.tracking') }}
    </h2>
    <ul class="list-unstyled">
      <li
        v-for="(status, index) in currentStatuses"
        :key="index"
        :class="['list-workflow-item', { 'complete': status.complete }, { 'active': status.active }]">
        <div>
          <small v-if="status.complete && status.date">
            {{ status.date }}
          </small>
          <small v-else-if="status.complete">
            {{ $t('common.complete') }}
          </small>
          <small v-else>
            {{ $t('common.pending') }}
          </small>
        </div>
        <div>
          {{ status.title }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export const statuses = ['in-progress', 'provisioning', 'complete'];

export default {
  name: 'RequestModalWorkflow',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentStatusIndex: statuses.findIndex((key) => key === this.item.rawData.decision.status),
    };
  },
  computed: {
    currentStatuses() {
      return [
        {
          title: this.$t('governance.requestModal.detailsTab.requestSubmitted'),
          complete: true,
          date: dayjs(this.item.details.date).format('MMM D, YYYY'),
        }, {
          title: this.$t('governance.requestModal.detailsTab.awaitingApproval'),
          complete: this.currentStatusIndex > 0,
          active: this.currentStatusIndex === 0,
        }, {
          title: this.$t('governance.requestModal.detailsTab.provisioning'),
          complete: this.currentStatusIndex > 1,
          active: this.currentStatusIndex === 1,
        }, {
          title: this.$t('governance.requestModal.detailsTab.requestComplete'),
          complete: this.currentStatusIndex === 2,
          date: dayjs(this.item.rawData.decision.completionDate).format('MMM D, YYYY'),
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.list-workflow-item {
    padding: 0.75rem 1.25rem 0.75rem 3rem;
    position: relative;

    &:after {
      content: "";
      font-family: Material Icons;
      font-size: 1rem;
      color: $blue;
      width: 1rem;
      height: 1rem;
      background-color: $gray-300;
      border: 4px solid $white;
      position: absolute;
      border-radius: 1rem;
      top: 1rem;
      left: 0.375rem;
      line-height: 1;
  }
  &.complete:after {
      content: "check_circle";
      background-color: $white;
      border: none;
  }
  &.active:after {
      background-color: $white;
      border-color: $blue;
  }

  &:before {
    content: "";
    border-left: 2px solid $gray-200;
    position: absolute;
    left: 0.8125rem;
    height: 100%;
    top: 0;
  }
  &:first-child:before  {
    height: 50%;
    top: 35px;
  }
  &:last-child:before  {
    height: 48%;
  }
}
</style>

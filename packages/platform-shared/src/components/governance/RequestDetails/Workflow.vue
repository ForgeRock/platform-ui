<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

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
        :class="['list-workflow-item', { 'complete': status.complete }, { 'active': status.active, 'failed': status.failed }]"
        @click="status.failed ? errorDetailsVisible = !errorDetailsVisible : null">
        <div>
          <small v-if="status.failed">
            {{ $t('governance.requestModal.detailsTab.failed') }}
          </small>
          <small v-else-if="status.complete && status.date">
            {{ status.date }}
          </small>
          <small v-else-if="status.complete">
            {{ $t('common.complete') }}
          </small>
          <small v-else>
            {{ $t('common.pending') }}
          </small>
        </div>
        <div class="d-flex flex-column">
          <span :class="{'text-decoration-underline': status.failed }">
            {{ status.title }}
            <FrIcon
              v-if="status.failed"
              icon-class="mr-2"
              :name="errorDetailsVisible ? 'expand_less' : 'expand_more'" />
          </span>
          <BCollapse
            v-if="status.failed"
            v-model="errorDetailsVisible">
            <div class="alert fr-alert alert-danger mt-2">
              <FrIcon
                icon-class="mr-2"
                name="error_outline">
                {{ status.collapseText }}
              </FrIcon>
            </div>
          </BCollapse>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { BCollapse } from 'bootstrap-vue';
import { isNull } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import dayjs from 'dayjs';

export const statuses = ['in-progress', 'provisioning', 'complete'];

export default {
  name: 'RequestModalWorkflow',
  components: { BCollapse, FrIcon },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentStatusIndex: statuses.findIndex((key) => key === this.item.rawData.decision.status),
      errorDetailsVisible: false,
    };
  },
  computed: {
    hasFailure() {
      return this.item.rawData.decision?.comments?.some((c) => c.action === 'failure');
    },
    failureComment() {
      return this.item.rawData.decision?.comments?.find((c) => c.action === 'failure');
    },
    currentStatuses() {
      const hasDecision = !isNull(this.item.rawData?.decision?.decision);
      const steps = [
        {
          title: this.$t('governance.requestModal.detailsTab.requestSubmitted'),
          complete: true,
          date: dayjs(this.item.details.date).format('MMM D, YYYY'),
        },
      ];

      if (this.hasFailure) {
        if (hasDecision) {
          steps.push({
            title: this.$t('governance.requestModal.detailsTab.awaitingApproval'),
            complete: this.currentStatusIndex > 0,
            active: this.currentStatusIndex === 0,
          },
          {
            title: this.$t('governance.requestModal.detailsTab.provisioning'),
            // complete: true,
            failed: true,
            collapseText: this.failureComment?.comment,
          });
        } else {
          steps.push({
            title: this.$t('governance.requestModal.detailsTab.awaitingApproval'),
            // complete: true,
            failed: true,
            collapseText: this.failureComment?.comment,
            date: this.failureComment?.timeStamp ? dayjs(this.failureComment.timeStamp).format('MMM D, YYYY') : undefined,
          });
        }
      } else {
        steps.push({
          title: this.$t('governance.requestModal.detailsTab.awaitingApproval'),
          complete: this.currentStatusIndex > 0,
          active: this.currentStatusIndex === 0,
        },
        {
          title: this.$t('governance.requestModal.detailsTab.provisioning'),
          complete: this.currentStatusIndex > 1,
          active: this.currentStatusIndex === 1,
        });
      }

      steps.push({
        title: this.$t('governance.requestModal.detailsTab.requestComplete'),
        complete: this.currentStatusIndex === 2,
        date: dayjs(this.item.rawData.decision.completionDate).format('MMM D, YYYY'),
      });

      return steps;
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-alert {
  display: flex;
  line-height: 1.25;

  &.alert-danger {
    border-left: 5px solid $danger;
    background-color: $fr-alert-danger-bg-color;
    color: $fr-alert-text-color;
  }
}

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
      content: "check_circle";
      background-color: $white;
      border-color: $blue;
  }

    &.failed:after {
      content: "cancel";
      background-color: $white;
      border: none;
      color: $danger;
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

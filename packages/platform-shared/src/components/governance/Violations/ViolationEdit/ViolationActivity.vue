<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <ul class="list-unstyled">
      <li
        v-for="(step, index) in steps"
        :key="index"
        :class="['list-workflow-item', { 'complete': step.complete }, { 'active': step.active }]">
        <div>
          <small v-if="step.complete && step.date">
            {{ step.date }}
          </small>
          <small v-else-if="step.complete">
            {{ $t('common.complete') }}
          </small>
          <small v-else>
            {{ $t('common.pending') }}
          </small>
        </div>
        <div>
          {{ step.title }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
/**
 * Shows activity that has taken place for a violation
 */
import { ref, watch } from 'vue';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import i18n from '@/i18n';

const props = defineProps({
  violation: {
    type: Object,
    default: () => {},
  },
});

const steps = ref([]);

/**
 * Get a step object with a title and data
 * @param {String} title title of step
 * @param {String} date date of step
 * @returns {Object} step used it display in graph
 */
function getStep(title, date) {
  return {
    complete: true,
    active: false,
    title,
    date,
  };
}

/**
 * Parse the comments of a violation and generate steps
 * @param {Object[]} comments comments on a violation
 * @returns {Object[]} comments parsed as steps to display in graph
 */
function parseComments(comments) {
  const tempSteps = [];
  let exceptionComment = '';
  comments.forEach((comment) => {
    switch (comment.action) {
      case 'assignment':
      case 'reassign':
      case 'remediate':
      case 'cancel-exception':
        tempSteps.push(getStep(comment.comment, dayjs(comment.timeStamp).format('MMM D, YYYY')));
        break;
      case 'allow':
        tempSteps.push(getStep(
          i18n.global.t('governance.violations.exceptionAllowed'),
          dayjs(comment.timeStamp).format('MMM D, YYYY'),
        ));
        break;
      case 'exception':
        if (comment.comment.includes('Exception granted until') || comment.comment.includes('Exception extended until')) {
          let message = comment.comment;
          if (exceptionComment.length) message = `${comment.comment} - ${exceptionComment}`;
          tempSteps.push(getStep(message, dayjs(comment.timeStamp).format('MMM D, YYYY')));
          exceptionComment = '';
        } else {
          exceptionComment = comment.comment;
        }
        break;
      default:
        break;
    }
  });

  return tempSteps;
}

/**
 * Given a violation, generate a graph representing the activity
 * @param {Object} violation SOD violation object
 */
function generateSteps(violation) {
  const violationSteps = [];
  if (isEmpty(violation)) return;

  violationSteps.push(getStep(
    i18n.global.t('governance.violations.initialViolation'),
    dayjs(violation.decision?.startDate).format('MMM D, YYYY'),
  ));

  if (!violation?.decision?.comments?.length) return;

  violationSteps.push(...parseComments(violation.decision.comments));

  if (!violation.decision.completionDate) {
    violationSteps[violationSteps.length - 1].complete = false;
    violationSteps[violationSteps.length - 1].active = false;
  }
  steps.value = violationSteps;
}

watch(
  () => props.violation,
  (val) => generateSteps(val),
  { immediate: true, deep: true },
);
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

<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTable
    class="mb-0"
    hover
    no-local-sorting
    responsive
    show-empty
    :empty-text="$t('common.noRecordsToShow')"
    tbody-tr-class="cursor-pointer"
    :fields="tableColumns"
    :items="tableData"
    @row-clicked="showTaskDetailsModal($event)">
    <template #cell(task)="{ item }">
      <h2 class="h5">
        {{ item.displayName || capitalize(item.name) }}
      </h2>
      <small>
        {{ parseDate(item.startDate) }}
      </small>
    </template>

    <template #cell(approvers)="{ item }">
      <BButton
        class="btn-unstyled"
        @keydown.enter="showTaskDetailsModal(item)"
        @keydown.space="showTaskDetailsModal(item)"
        @click="showTaskDetailsModal(item)">
        <FrAvatarGroup
          :id="item.name"
          :users="item.actors"
        />
      </BButton>
    </template>

    <template #cell(status)="{ item }">
      <BBadge
        class="px-4"
        :variant="getBadgeVariant(item.decision || item.status)">
        {{ getStatus(item.decision || item.status) }}
      </BBadge>
    </template>
  </BTable>
  <FrTaskDetailsModal
    :task-details="taskDetails"
    @hidden="closeTaskDetailsModal"
  />
</template>

<script setup>
/**
 * Component for displaying a table of tasks with details and actions status.
 * @component Tasks
 * @prop {Object} item - The task item to display.
 */
import { capitalize } from 'lodash';
import {
  BBadge,
  BButton,
  BTable,
} from 'bootstrap-vue';
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAvatarGroup from '@forgerock/platform-shared/src/components/AvatarGroup/AvatarGroup';
import FrTaskDetailsModal from './TaskDetailsModal';
import i18n from '@/i18n';

/**
 * Status badge value
 * @typedef {Object} BadgeValue
 * @property {String} name Badge name
 * @property {String} variant Badge variant color
 */

const { bvModal } = useBvModal();

const tableColumns = [
  {
    key: 'task',
    label: i18n.global.t('common.task'),
    class: 'text-truncate',
  },
  {
    key: 'approvers',
    label: i18n.global.t('common.approvers'),
  },
  {
    key: 'status',
    label: i18n.global.t('common.status'),
  },
];

const prop = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const requestOutcome = ref(null);
const tableData = ref(null);
const taskDetails = ref({});

watch(
  () => prop.item,
  ({ rawData }) => {
    // get actors and phases data
    const {
      decision: {
        actors = {},
        outcome = null,
        phases = [],
      },
    } = rawData;
    requestOutcome.value = outcome;
    const allActors = [
      ...actors.active,
      ...actors.inactive,
    ];
    const phaseActors = allActors.filter(({ phase }) => !!phase);

    // parse information to render on table
    tableData.value = phases.map((phase) => ({
      ...phase,
      actors: phaseActors.filter((actor) => actor.phase === phase.name),
    }));
  }, { immediate: true },
);

/**
 * Returns values for status badge
 * @param {String} type Item decision
 * @return {BadgeValue} Badge parameters
 */
function setDecisionValue(type) {
  switch (type) {
    case 'approve':
      return {
        name: i18n.global.t('governance.decisions.approved'),
        variant: 'success',
      };
    case 'fulfill':
      return {
        name: i18n.global.t('governance.decisions.fulfilled'),
        variant: 'success',
      };
    case 'in-progress':
      return {
        name: i18n.global.t('governance.status.in-progress'),
        variant: 'success',
      };
    case 'cancelled':
      return {
        name: i18n.global.t('governance.decisions.canceled'),
        variant: 'light',
      };
    case 'reject':
      return {
        name: i18n.global.t('governance.decisions.rejected'),
        variant: 'danger',
      };
    case 'deny':
      return {
        name: i18n.global.t('governance.decisions.denied'),
        variant: 'danger',
      };
    default:
      return {
        name: i18n.global.t('governance.decisions.pending'),
        variant: 'light',
      };
  }
}

/**
 * Returns selected item variant
 * @param {String} type Item decision
 * @return {String} Item variant value
 */
function getBadgeVariant(type) {
  const parsedType = type === 'complete' && requestOutcome.value
    ? requestOutcome.value
    : type;
  return setDecisionValue(parsedType).variant;
}

/**
 * Returns selected item name
 * @param {String} type Item decision
 * @return {String} Item name value
 */
function getStatus(type) {
  const parsedType = type === 'complete' && requestOutcome.value
    ? requestOutcome.value
    : type;
  return setDecisionValue(parsedType).name;
}

/**
 * Returns date on proper format
 * @param {String} date formatted date
 */
function parseDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}

/**
 * Displays task details in a modal based on the given task item
 * @param {Object} currentItem The task item containing details to be displayed
 * @param {Array} currentItem.actors Array of approvers for the task
 * @param {String} currentItem.name Name of the task
 * @param {String} currentItem.startDate Start date of the task
 * @param {String} currentItem.decision Decision of the task
 * @param {String} currentItem.status Status of the task
 * @param {String} currentItem.workflowTaskId ID of the workflow task
 */
function showTaskDetailsModal(currentItem) {
  taskDetails.value = {
    approvers: currentItem.actors,
    name: currentItem.displayName || currentItem.name,
    startDate: parseDate(currentItem.startDate),
    status: getStatus(currentItem.decision || currentItem.status),
    statusBadge: getBadgeVariant(currentItem.decision || currentItem.status),
    workflowId: currentItem.workflowTaskId,
  };
  bvModal.value.show('TaskDetailsModal');
}

function closeTaskDetailsModal() {
  taskDetails.value = {};
}
</script>

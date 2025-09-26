<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTable
    class="mb-0"
    v-resizable-table="{ persistKey: `request-tasks-${type}` }"
    hover
    no-local-sorting
    responsive
    show-empty
    :empty-text="$t('common.noRecordsToShow')"
    tbody-tr-class="cursor-pointer"
    :fields="getTableColumns(type)"
    :items="tableData"
    @row-clicked="showTaskDetailsModal($event)">
    <template #cell(task)="{ item }">
      <h2 class="h5">
        {{ item.displayName || capitalize(item.name) }}
      </h2>
      <small>
        {{ getDateDisplay(item) }}
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
    <template #cell(actions)="{ item }">
      <FrRequestActionsCell
        class="mr-3"
        :item="item"
        :status="item.status"
        :type="getTypeOfTask(item)"
        @action="handleAction($event, item)" />
    </template>
  </BTable>
  <FrTaskDetailsModal
    :task-details="taskDetails"
    @hidden="closeTaskDetailsModal"
  />
  <FrUpdateResumeDateModal
    v-if="type === detailTypes.ADMIN_REQUEST"
    :loading="savingRequest"
    :current-resume-date="item.events?.scheduled?.date"
    @update-resume-date="updateResumeDate" />
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
import { requestAction, updateRequestResumeDate } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAvatarGroup from '@forgerock/platform-shared/src/components/AvatarGroup/AvatarGroup';
import FrRequestActionsCell from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActionsCell';
import FrUpdateResumeDateModal from '@forgerock/platform-shared/src/components/governance/RequestDetails/UpdateResumeDateModal';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import FrTaskDetailsModal from './TaskDetailsModal';
import i18n from '@/i18n';

/**
 * Status badge value
 * @typedef {Object} BadgeValue
 * @property {String} name Badge name
 * @property {String} variant Badge variant color
 */

const { bvModal } = useBvModal();
const emit = defineEmits(['update-item', 'action']);

const prop = defineProps({
  item: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: detailTypes.USER_REQUEST,
  },
});

const requestOutcome = ref(null);
const tableData = ref(null);
const taskDetails = ref({});
const savingRequest = ref(false);

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

function getTableColumns(type) {
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

  if (type === detailTypes.ADMIN_REQUEST) {
    tableColumns.push({
      key: 'actions',
      label: '',
      class: 'col-actions',
    });
  }
  return tableColumns;
}

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
    completionDate: currentItem.completionDate ? parseDate(currentItem.completionDate) : null,
    resumeDate: currentItem.events?.scheduled?.date ? parseDate(currentItem.events?.scheduled?.date) : null,
    status: getStatus(currentItem.decision || currentItem.status),
    statusBadge: getBadgeVariant(currentItem.decision || currentItem.status),
    type: currentItem.type,
    workflowId: currentItem.workflowTaskId,
  };
  bvModal.value.show('TaskDetailsModal');
}

function closeTaskDetailsModal() {
  taskDetails.value = {};
}

/**
 * Shows the "Update Resume Date" modal
 */
function openResumeDateModal() {
  bvModal.value.show('UpdateResumeDateModal');
}

/**
 * Closes the "Update Resume Date" modal
 */
function closeModal() {
  bvModal.value.hide('UpdateResumeDateModal');
}

/**
 * Given an access request, find the ID of the in-progress wait task
 * @param item Access request object
 * @returns {String} ID (name) of the wait task
 */
function getWaitTaskId(item) {
  return item.decision?.phases.find((phase) => phase.type === 'scheduled' && phase.status === 'in-progress')?.name;
}
/**
 * Updates a suspended request's resume date.
 *
 * @param {Object} values - The values to modify the request with.
 */
async function updateResumeDate(newResumeTime, justification) {
  savingRequest.value = true;
  const payload = {
    events: {
      scheduled: {
        date: newResumeTime,
      },
    },
  };
  try {
    const waitTaskId = getWaitTaskId(prop.item.rawData);
    await updateRequestResumeDate(prop.item.details.id, waitTaskId, payload);
    await requestAction(prop.item.details.id, 'comment', waitTaskId, { comment: justification });
    displayNotification('success', i18n.global.t('governance.accessRequest.requestSaveSuccess'));
    closeModal();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.requestSaveError'));
  } finally {
    savingRequest.value = false;
    emit('update-item');
  }
}

/**
 * Opens a modal based on the provided item and type.
 * @param {Object} item - The item to show in the modal.
 * @param {string} type - The type of modal to open.
 */
function openModal(item, action) {
  emit('action', action, item.name);
  bvModal.value.show('request_modal');
}

/*
 * Handles the specified action for a given item.
 * @param {string} action - The action to be performed.
 * @param {Object} item - The item on which the action is to be performed.
 */
function handleAction(action, item) {
  if (action === 'DETAILS') {
    showTaskDetailsModal(item);
  } else if (action === 'CHANGERESUMEDATE') {
    openResumeDateModal();
  } else {
    openModal(item, action);
  }
}

/**
 * Given an access request phase, get the corresponding detailType
 * @param item Phase task item
 * @returns {String} Detail type of phase task
 */
function getTypeOfTask(item) {
  if (item.type === 'request') {
    return detailTypes.APPROVAL;
  }
  return item.type;
}

/**
 * Get the date display to show under the task name
 * @param item Task item
 */
function getDateDisplay(item) {
  if (item.type === 'scheduled' && item.status === 'in-progress') {
    return i18n.global.t('governance.accessRequest.untilDate', { date: parseDate(item.events?.scheduled?.date) });
  }
  return parseDate(item.startDate);
}
</script>

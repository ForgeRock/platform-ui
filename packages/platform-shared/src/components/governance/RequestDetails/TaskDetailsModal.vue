<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :ok-title="$t('common.done')"
    id="TaskDetailsModal"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    scrollable
    size="lg"
    :visible="visible"
    :static="visible"
    @hidden="$emit('hidden')">
    <template #modal-header="{ close }">
      <div class="w-100 d-flex align-items-start">
        <div>
          <small class="mb-0">
            {{ $t('governance.requestModal.titles.taskDetails') }}
          </small>
          <h1 class="h5 modal-title text-capitalize">
            {{ taskDetails.name }}
          </h1>
        </div>
        <BButtonClose
          variant="link"
          class="ml-auto"
          @click="close">
          <FrIcon
            name="close"
            icon-class="text-muted md-24" />
        </BButtonClose>
      </div>
    </template>
    <BRow>
      <!-- Approvers -->
      <BCol
        lg="4"
        class="font-weight-bold row-height">
        {{ $t('common.approvers') }}
      </BCol>
      <BCol lg="8">
        <FrUserGroupList :users-list="taskDetails.approvers" />
      </BCol>
      <!-- Status -->
      <BCol
        lg="4"
        class="font-weight-bold row-height">
        {{ $t('common.status') }}
      </BCol>
      <BCol lg="8">
        <BBadge
          class="px-4"
          data-testid="status-badge"
          :variant="taskDetails.statusBadge">
          {{ taskDetails.status }}
        </BBadge>
      </BCol>
      <!-- Task Name -->
      <BCol
        lg="4"
        class="font-weight-bold row-height">
        {{ $t('governance.requestModal.titles.taskName') }}
      </BCol>
      <BCol
        lg="8"
        data-testid="task-name"
        class="text-capitalize">
        {{ taskDetails.name }}
      </BCol>
      <!-- Start Date -->
      <BCol
        lg="4"
        class="font-weight-bold row-height">
        {{ $t('common.startDate') }}
      </BCol>
      <BCol
        lg="8"
        data-testid="start-date">
        {{ taskDetails.startDate }}
      </BCol>
      <!-- Workflow ID -->
      <BCol
        lg="4"
        class="font-weight-bold row-height">
        {{ $t('governance.requestModal.titles.workFlowId') }}
      </BCol>
      <BCol
        lg="8"
        data-testid="workflow-id">
        {{ taskDetails.workflowId }}
      </BCol>
    </BRow>
  </BModal>
</template>

<script setup>
/**
 * Component for displaying detailed information about a task within a modal.
 * @component TaskDetailsModal
 * @prop {Object} taskDetails - Object containing details of the task to display.
 */
import {
  BBadge,
  BButtonClose,
  BCol,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserGroupList from '@forgerock/platform-shared/src/components/UserGroupList/UserGroupList';

defineProps({
  taskDetails: {
    type: Object,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.row-height {
  min-height: 52.5px;
}
</style>

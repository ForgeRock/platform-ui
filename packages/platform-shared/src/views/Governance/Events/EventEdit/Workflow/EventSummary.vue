<!-- Copyright 2024-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="p-4 flex-grow-1 overflow-auto h-100"
    data-testid="event-summary">
    <BContainer
      fluid
      class="mt-4">
      <FrEventDetailsSummary
        :event-trigger-name="eventTriggerName"
        :summary="summary" />
      <hr>
      <BRow>
        <BCol lg="3">
          <h2 class="h5 mb-4">
            {{ $t('governance.events.edit.workflowDetails') }}
          </h2>
        </BCol>
        <BCol lg="9">
          <small class="mb-1 d-block">
            {{ $t('governance.events.newEventModal.workflow') }}
          </small>
          <dd data-testid="workflow">
            {{ summary.workflow || blankValueIndicator }}
          </dd>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import {
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import FrEventDetailsSummary from '../EventDetailsSummary';

defineProps({
  eventTriggerName: {
    type: String,
    default: '',
  },
  summary: {
    type: Object,
    default: () => ({}),
  },
});
</script>

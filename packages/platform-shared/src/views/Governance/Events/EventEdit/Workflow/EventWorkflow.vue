<!-- Copyright 2024-2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="h-100">
    <FrFormWizard
      @save="saveEvent()"
      breadcrumb-path="/governance-events"
      :breadcrumb-title="$t('pageTitles.GovernanceEvents')"
      data-testid="form-wizard"
      :edit="edit"
      :tabs="tabComponents"
      :title="title"
      :valid-form="isValid"
      progress-dots>
      <template
        v-for="tab in tabComponents"
        :key="tab.title"
        #[tab.title]>
        <Component
          v-model="forms[tab.formPath]"
          :is="tab.component"
          :event-trigger-name="eventTriggerName"
          :filter-properties="filterProperties"
          :summary="summary"
          @toggle-valid="isValid = $event" />
      </template>
    </FrFormWizard>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isEmpty, camelCase } from 'lodash';
import FrFormWizard from '@forgerock/platform-shared/src/components/FormWizard/FormWizard';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { buildEventWorkflowPayload, buildEventWorkflowForm } from '@forgerock/platform-shared/src/views/Governance/utils/events';
import { createEvent, putEvent } from '@forgerock/platform-shared/src/api/governance/EventApi';
import FrEventDetails from '../EventDetails';
import FrEventSummary from './EventSummary';
import FrWorkflowDetails from './WorkflowDetails';
import i18n from '@/i18n';

// composables
const route = useRoute();
const router = useRouter();

// props
const props = defineProps({
  event: {
    type: Object,
    default: () => ({}),
  },
  filterProperties: {
    type: Array,
    default: () => [],
  },
});

// data
const { eventId } = route.params;
const { eventTrigger } = route.query;
const edit = ref(false);
const isValid = ref(true);
const tabComponents = [
  {
    component: FrEventDetails,
    formPath: 'eventDetails',
    title: i18n.global.t('governance.events.edit.eventDetails'),
  },
  {
    component: FrWorkflowDetails,
    formPath: 'workflowDetails',
    title: i18n.global.t('governance.events.edit.workflowDetails'),
  },
  {
    component: FrEventSummary,
    formPath: 'summary',
    title: i18n.global.t('common.summary'),
  },
];

const forms = ref({
  eventDetails: {
    eventDescription: '',
    eventName: '',
    eventOwners: [],
    filter: {},
  },
  workflowDetails: {
    workflow: '',
    workflowVariables: [{ variable: '', value: '' }],
  },
  status: 'active',
});

function getEventTypeFromEvent(entityType, mutationType) {
  return camelCase(`${entityType} ${mutationType}`);
}

// computed
const summary = computed(() => ({
  description: forms.value.eventDetails.eventDescription,
  eventName: forms.value.eventDetails.eventName,
  eventOwners: forms.value.eventDetails.eventOwners,
  workflow: forms.value.workflowDetails.workflow,
}));

const eventTriggerType = computed(() => {
  const trigger = isEmpty(props.event)
    ? eventTrigger
    : getEventTypeFromEvent(props.event.entityType, props.event.mutationType);
  return trigger;
});

const eventTriggerName = computed(() => (i18n.global.t(`governance.events.types.${eventTriggerType.value}`)));

const title = computed(() => (edit.value
  ? i18n.global.t('governance.events.edit.editWorkflowEvent')
  : i18n.global.t('governance.events.edit.newWorkflowEvent')
));

async function saveEvent() {
  try {
    const payload = buildEventWorkflowPayload(forms.value, eventTriggerType.value);
    if (eventId === 'new') await createEvent(payload);
    else await putEvent(eventId, payload);
    displayNotification('success', i18n.global.t('governance.events.edit.saveSuccess'));

    router.push({ name: 'GovernanceEvents' });
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.events.edit.saveError'));
  }
}

function buildFormFromEvent(event) {
  forms.value = buildEventWorkflowForm(event);
  edit.value = true;
}

watch(
  () => props.event,
  (val) => {
    if (!isEmpty(val)) buildFormFromEvent(val);
  },
  { immediate: true, deep: true },
);
</script>

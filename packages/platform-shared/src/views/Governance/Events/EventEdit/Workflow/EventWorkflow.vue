<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
          :entity-type="entityContext.entityType"
          :mutation-type="entityContext.mutationType"
          :event-trigger-name="eventTriggerName"
          :filter-properties="filterProperties"
          :schema-resource="schemaResource"
          :summary="summary"
          @toggle-valid="isValid = $event" />
      </template>
    </FrFormWizard>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isEmpty } from 'lodash';
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
  entityType: {
    type: String,
    default: '',
  },
  mutationType: {
    type: String,
    default: '',
  },
  eventTriggerName: {
    type: String,
    default: '',
  },
  /** Schema resource prefix (see EventEditManager); empty keeps the entity-type default. */
  schemaResource: {
    type: String,
    default: '',
  },
});

// data
const { eventId } = route.params;
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

// computed
const summary = computed(() => ({
  description: forms.value.eventDetails.eventDescription,
  eventName: forms.value.eventDetails.eventName,
  eventOwners: forms.value.eventDetails.eventOwners,
  workflow: forms.value.workflowDetails.workflow,
}));

// Props win (create flow); the loaded event's values in the edit flow (immutable).

const entityContext = computed(() => ({
  entityType: props.entityType || props.event.entityType || '',
  mutationType: props.mutationType || props.event.mutationType || '',
}));

// Manager's resolved resource, else the entity context, else user.

const schemaResource = computed(() => props.schemaResource
  || entityContext.value.entityType
  || 'user');

const title = computed(() => (edit.value
  ? i18n.global.t('governance.events.edit.editWorkflowEvent')
  : i18n.global.t('governance.events.edit.newWorkflowEvent')
));

async function saveEvent() {
  try {
    const payload = buildEventWorkflowPayload(forms.value, entityContext.value);
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

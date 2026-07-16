<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrEditTemplate
    @save-event="saveEvent($event)"
    event-based
    :event-cert="eventCert"
    :entity-type="entityContext.entityType"
    :mutation-type="entityContext.mutationType"
    :event-trigger-name="eventTriggerName"
    :event-filter-properties="filterProperties"
    :schema-resource="schemaResource"
    :is-saving-event="isSavingEvent"
    :type="types.IDENTITY" />
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cloneDeep, isEmpty } from 'lodash';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrEditTemplate from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/EditTemplate';
import { types } from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/templateTypes';
import { buildSavePayload } from '@forgerock/platform-shared/src/views/Governance/utils/certification';
import { buildEventCertificationPayload, buildEventCertificationForm } from '@forgerock/platform-shared/src/views/Governance/utils/events';
import { createEvent, putEvent } from '@forgerock/platform-shared/src/api/governance/EventApi';
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

// Props win (create flow); the loaded event's values in the edit flow (immutable).

const entityContext = computed(() => ({
  entityType: props.entityType || props.event.entityType || '',
  mutationType: props.mutationType || props.event.mutationType || '',
}));

// Manager's resolved resource, else the entity context, else user.

const schemaResource = computed(() => props.schemaResource
  || entityContext.value.entityType
  || 'user');

const eventCert = computed(() => {
  if (isEmpty(props.event)) return {};
  return { eventDetails: buildEventCertificationForm(props.event), certDetails: props.event.action.template };
});

const eventStatus = computed(() => (props.event?.status || 'active'));

const isSavingEvent = ref(false);
async function saveEvent({ forms, id }) {
  isSavingEvent.value = true;
  const eventDetails = cloneDeep(forms.FrEventDetails);
  eventDetails.status = eventStatus.value;
  const certDetails = cloneDeep(forms);
  delete certDetails.FrEventDetails;

  const certPayload = buildSavePayload(types.IDENTITY, certDetails, true);

  try {
    const payload = buildEventCertificationPayload(eventDetails, certPayload, id, entityContext.value);
    if (eventId === 'new') await createEvent(payload);
    else await putEvent(eventId, payload);

    displayNotification('success', i18n.global.t('governance.events.edit.saveSuccess'));
    router.push({ name: 'GovernanceEvents' });
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.events.edit.saveError'));
  } finally {
    isSavingEvent.value = false;
  }
}
</script>

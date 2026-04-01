<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrEditTemplate
    @save-event="saveEvent($event)"
    event-based
    :event-cert="eventCert"
    :event-trigger-name="eventTriggerName"
    :event-filter-properties="filterProperties"
    :is-saving-event="isSavingEvent"
    :type="types.IDENTITY" />
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { camelCase, cloneDeep, isEmpty } from 'lodash';
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
});

// data
const { eventId } = route.params;
const { eventTrigger } = route.query;

function getEventTypeFromEvent(entityType, mutationType) {
  return camelCase(`${entityType} ${mutationType}`);
}

const eventTriggerType = computed(() => {
  const trigger = isEmpty(props.event)
    ? eventTrigger
    : getEventTypeFromEvent(props.event.entityType, props.event.mutationType);
  return trigger;
});

const eventTriggerName = computed(() => (i18n.global.t(`governance.events.types.${eventTriggerType.value}`)));

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
    const payload = buildEventCertificationPayload(eventDetails, certPayload, id, eventTriggerType.value);
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

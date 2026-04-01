<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <Component
    v-if="!isLoading"
    :data-testid="`event-${eventAction}`"
    :is="component"
    :event="event"
    :filter-properties="filterProperties" />
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getEvent, getFilterProperties } from '@forgerock/platform-shared/src/api/governance/EventApi';
import FrEventCertification from './Certification/EventCertification';
import FrEventWorkflow from './Workflow/EventWorkflow';
import i18n from '@/i18n';

// composables
const route = useRoute();

// data
const { eventAction } = route.query;
const { eventId } = route.params;
const event = ref({});
const filterProperties = [];
const isLoading = ref(true);

// computed
const component = computed(() => {
  const type = eventAction || event?.value?.action?.type;
  let comp;

  switch (type) {
    case 'certification':
      comp = FrEventCertification;
      break;
    case 'orchestration':
    case 'workflow':
      comp = FrEventWorkflow;
      break;
    default:
      comp = FrEventWorkflow;
  }
  return comp;
});

async function loadEvent(id) {
  if (id === 'new') {
    return;
  }
  try {
    const { data } = await getEvent(id);
    event.value = { ...data };
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.events.errors.getEventError'));
  }
}

onMounted(async () => {
  await loadEvent(eventId);
  try {
    const { data } = await getFilterProperties();
    Object.entries(data.schema).forEach(([key, property]) => {
      const propertyName = key.split('.')[2];
      if (propertyName && filterProperties.findIndex((filterProperty) => filterProperty.value === propertyName) === -1 && property.type !== 'array') {
        filterProperties.push({
          label: property.displayName || propertyName,
          value: propertyName,
          type: property.type,
          path: property.reference || property.item?.reference,
        });
      }
    });
    filterProperties.sort((a, b) => {
      if (a.label > b.label) {
        return 1;
      }
      if (a.label < b.label) {
        return -1;
      }
      return 0;
    });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.events.errors.getPropertiesError'));
  }
  isLoading.value = false;
});

</script>

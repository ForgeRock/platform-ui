<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Component
    v-if="!isLoading && component"
    :data-testid="`event-${eventAction}`"
    :is="component"
    :event="event"
    :entity-type="entityType"
    :mutation-type="mutationType"
    :event-trigger-name="eventTriggerName"
    :filter-properties="filterProperties"
    :schema-resource="schemaResource" />
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { capitalize } from 'lodash';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getEvent, getFilterProperties } from '@forgerock/platform-shared/src/api/governance/EventApi';
import { getEventTriggerName } from '@forgerock/platform-shared/src/views/Governance/utils/events';
import { useGovernanceStore } from '@forgerock/platform-shared/src/stores/governance';
import FrEventCertification from './Certification/EventCertification';
import FrEventWorkflow from './Workflow/EventWorkflow';
import i18n from '@/i18n';

// composables
const route = useRoute();
const governanceStore = useGovernanceStore();

// data
const { eventId } = route.params;
const {
  entityType: queryEntityType,
  mutationType: queryMutationType,
  eventAction: queryEventAction,
} = route.query;
const event = ref({});
const entityType = ref('');
const mutationType = ref('');
const eventAction = ref('');
const filterProperties = [];
const isLoading = ref(true);
const eventLoadFailed = ref(false);

/**
 * Schema resource prefix: agent events observe the account change stream, so
 * they emit `account.` paths. Unknown entities fall back to user.
 * @type {import('vue').ComputedRef<String>}
 */
const schemaResource = computed(() => {
  if (entityType.value === 'agent') return 'account';
  return entityType.value || 'user';
});

// computed
// Wizard for the action type; unsupported values render nothing (error raised).
// A failed edit-flow fetch with no route context also renders nothing: the
// entity defaults would be user-flavored guesses over the error toast.

const component = computed(() => {
  if (eventLoadFailed.value && !queryEntityType) return null;
  switch (eventAction.value) {
    case 'certification':
      return FrEventCertification;
    case 'orchestration':
    case 'workflow':
      return FrEventWorkflow;
    default:
      return null;
  }
});

/** Trigger display name from the (best-effort) cached event config, with fallbacks. */
const eventTriggerName = computed(() => {
  const configEntity = governanceStore.eventConfig?.entityTypes
    ?.find((entity) => entity.name === entityType.value);
  const displayName = configEntity?.displayName || capitalize(entityType.value);
  return getEventTriggerName(displayName, mutationType.value);
});

/**
 * Resolves the entity context: route query (create flow) or the loaded event
 * (edit flow — entityType, mutationType and action.type are immutable once created).
 */
function setEntityContext() {
  entityType.value = queryEntityType || event.value.entityType || '';
  mutationType.value = queryMutationType || event.value.mutationType || '';
  eventAction.value = queryEventAction || event.value.action?.type || '';
}

async function loadEvent(id) {
  if (id === 'new') {
    return;
  }
  try {
    const { data } = await getEvent(id);
    event.value = { ...data };
  } catch (error) {
    // Edit flow: without the event there is no entity context, and rendering
    // the user-flavored default wizard over the error toast misleads. The
    // wizard is suppressed unless the route itself supplies the context.
    eventLoadFailed.value = true;
    showErrorMessage(error, i18n.global.t('governance.events.errors.getEventError'));
  }
}

/**
 * Filter properties for the entity type; keys parse shape-agnostically so
 * dotted field names survive; dedupe, array-typed excluded.
 */
async function loadFilterProperties() {
  try {
    const { data } = await getFilterProperties(entityType.value || 'user');
    Object.entries(data.schema).forEach(([key, property]) => {
      const propertyName = key.split('.').slice(2).join('.');
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
}

onMounted(async () => {
  await loadEvent(eventId);
  setEntityContext();

  // No wizard will render: stop before the property fetches. A present-but-unsupported
  // action type is surfaced loudly; an absent one (fetch failure or missing context)
  // has already shown its fetch error.
  if (!component.value) {
    if (eventAction.value) {
      showErrorMessage(null, i18n.global.t('governance.events.errors.unsupportedActionType'));
    }
    isLoading.value = false;
    return;
  }

  // Failed edit-flow fetch with no route context: the entity defaults would be
  // user-flavored guesses. Keep the error state instead of rendering a wizard
  // for the wrong entity. (The component computed already returns null for
  // this case; this guard additionally skips the property fetch.)
  if (eventLoadFailed.value && !queryEntityType) {
    isLoading.value = false;
    return;
  }

  await loadFilterProperties();
  isLoading.value = false;

  // Config fetch is best-effort here: non-blocking, failures ignored — the
  // trigger name falls back to the capitalized entity type.
  try {
    await governanceStore.setEventConfig();
  } catch {
    // Best-effort only; the fallback trigger name is already rendered.
  }
});

</script>

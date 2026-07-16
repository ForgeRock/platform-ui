<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="newEventModal"
    no-close-on-backdrop
    size="xl"
    title-class="h5"
    title-tag="h2"
    :title="$t('common.newObject', { object: $t('governance.events.event') })"
    @show="onShow"
    @hidden="onHide">
    <h3 class="h5">
      {{ stepGenerals.title }}
    </h3>
    <p class="mb-4">
      {{ stepGenerals.subTitle }}
    </p>
    <FrSpinner
      v-if="configLoading"
      class="py-5" />
    <div
      v-else-if="configError"
      class="alert alert-danger"
      role="alert">
      {{ $t('governance.events.errors.getConfigError') }}
    </div>
    <BRow v-else>
      <BCol
        v-for="option in currentOptions"
        :key="option.value"
        v-bind="optionColAttrs"
        class="mb-3">
        <FrCardRadioInput
          :radio-value="option.value"
          :value="currentStep ? selectedAction : selectedEvent"
          @change="changeSelection"
          class="h-100">
          <div class="d-flex align-items-center">
            <FrIcon
              :name="option.icon"
              :icon-class="`size-36 rounded-circle d-flex align-items-center justify-content-center mr-3 ${option.iconClasses}`" />
            <h3
              class="h5 mb-0"
              :aria-label="option.name">
              {{ option.name }}
            </h3>
          </div>
          <div class="small mt-2">
            {{ option.description }}
          </div>
        </FrCardRadioInput>
      </BCol>
    </BRow>

    <template #modal-footer="{ cancel }">
      <div :class="`w-100 d-flex ${footerClasses}`">
        <BButton
          v-if="currentStep"
          variant="link"
          @click="previousStep">
          {{ $t('common.previous') }}
        </BButton>
        <div>
          <BButton
            variant="link"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            :disabled="nextDisabled"
            @click="nextStep">
            {{ $t('common.next') }}
          </BButton>
        </div>
      </div>
    </template>
  </BModal>
</template>

<script setup>
import {
  BButton,
  BCol,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { capitalize } from 'lodash';
import { useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { useGovernanceStore } from '@forgerock/platform-shared/src/stores/governance';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import {
  getEventEntityMeta,
  getEventTriggerName,
} from '@forgerock/platform-shared/src/views/Governance/utils/events';
import i18n from '@/i18n';

/**
 * @typedef OptionsElement
 * @property {String} description
 * @property {String} icon
 * @property {String} iconClasses
 * @property {String} name
 * @property {String} value
*/

/** Icon/class metadata for known action types; unknown fall back to DEFAULT_ACTION_META. @type {Object} */
const EVENT_ACTION_META_MAP = {
  certification: {
    icon: 'grading',
    iconClasses: 'text-warning bg-lightyellow',
  },
  orchestration: {
    icon: 'account_tree',
    iconClasses: 'color-blue bg-lightblue',
  },
};

/** Fallback metadata for action types missing from EVENT_ACTION_META_MAP. @type {Object} */
const DEFAULT_ACTION_META = {
  icon: 'event',
  iconClasses: 'text-muted bg-light',
};

/** Description i18n keys per known action type; unknown fall back to actionFallback. @type {Object} */
const ACTION_DESCRIPTION_KEYS = {
  certification: 'governance.events.newEventModal.triggerCertification',
  orchestration: 'governance.events.newEventModal.triggerWorkflow',
};

// composables
const router = useRouter();
const governanceStore = useGovernanceStore();

// data
const currentStep = ref(0);
const selectedAction = ref(null);
const selectedEvent = ref(null);
const configError = ref(false);
const configLoading = ref(false);

// computed

/**
 * Lowercase mutation label from the listView i18n keys, fallback = raw type.
 * @param {String} mutationType raw mutation type, e.g. 'create'
 * @returns {String} mutation label, e.g. 'created'
 */
function getMutationLabel(mutationType) {
  const key = `governance.events.listView.${mutationType}`;
  const translated = i18n.global.t(key);
  return translated === key ? mutationType : translated;
}

/**
 * Entity types from the cached event config (see `useGovernanceStore`).
 * Empty until the config has loaded.
 * @type {import('vue').ComputedRef<Array>}
 */
const entityTypes = computed(() => governanceStore.eventConfig?.entityTypes ?? []);

/**
 * One trigger card per (entityType, mutationType) pair; value is the composite
 * "{entityName}:{mutationType}" key, parsed again on navigation.
 * @type {import('vue').ComputedRef<OptionsElement[]>}
 */
const triggerOptions = computed(() => entityTypes.value.flatMap((entityType) => {
  const displayName = entityType.displayName || capitalize(entityType.name);
  return (entityType.mutationTypes ?? []).map((mutationType) => {
    const meta = getEventEntityMeta(entityType.name, mutationType);
    return {
      // no `capitalize` wrap here: the template is already sentence-cased and
      // lodash `capitalize` would lower-case the entity display name
      description: i18n.global.t('governance.events.newEventModal.entityTrigger', { entity: displayName, action: getMutationLabel(mutationType) }),
      icon: meta.icon,
      iconClasses: meta.iconClasses,
      name: getEventTriggerName(displayName, mutationType),
      value: `${entityType.name}:${mutationType}`,
    };
  });
}));

/**
 * The selected trigger's config entity entry, e.g. `{ name: 'account', ... }`.
 * @type {import('vue').ComputedRef<Object|null>}
 */
const selectedEntityConfig = computed(() => {
  if (!selectedEvent.value) return null;
  const [entityName] = selectedEvent.value.split(':');
  return entityTypes.value.find((entityType) => entityType.name === entityName) ?? null;
});

/**
 * Action options from the selected entity's `actionTypes`.
 * @type {import('vue').ComputedRef<OptionsElement[]>}
 */
const actionOptions = computed(() => (selectedEntityConfig.value?.actionTypes ?? []).map((actionType) => {
  const meta = EVENT_ACTION_META_MAP[actionType] ?? DEFAULT_ACTION_META;
  const nameKey = `governance.events.listView.${actionType}`;
  const translated = i18n.global.t(nameKey);
  return {
    // no `capitalize` wrap on the description: the fallback templates are
    // already sentence-cased and lodash `capitalize` would lower-case the rest
    description: i18n.global.t(ACTION_DESCRIPTION_KEYS[actionType] ?? 'governance.events.newEventModal.actionFallback'),
    icon: meta.icon,
    iconClasses: meta.iconClasses,
    name: capitalize(translated === nameKey ? actionType : translated),
    value: actionType,
  };
}));

const currentOptions = computed(() => (currentStep.value ? actionOptions.value : triggerOptions.value));

/**
 * Card grid spans: triggers 3-across at xl, actions 2-up; 2-up at md, 1 below.
 * @type {import('vue').ComputedRef<Object>}
 */
const optionColAttrs = computed(() => (currentStep.value
  ? { cols: '12', md: '6' }
  : { cols: '12', md: '6', xl: '4' }));
const footerClasses = computed(() => (currentStep.value ? 'justify-content-between' : 'flex-row-reverse'));
const stepGenerals = computed(() => (currentStep.value
  ? {
    title: i18n.global.t('governance.events.newEventModal.eventAction'),
    subTitle: i18n.global.t('governance.events.newEventModal.chooseAction'),
  }
  : {
    title: i18n.global.t('governance.events.newEventModal.eventTrigger'),
    subTitle: i18n.global.t('governance.events.newEventModal.chooseEvent'),
  }));
const nextDisabled = computed(() => (
  configLoading.value
  || configError.value
  || (currentStep.value === 0 && !selectedEvent.value)
  || (currentStep.value !== 0 && !selectedAction.value)));

/**
 * update corresponding selection
 * @param {String} option selected option
 */
function changeSelection(option) {
  if (currentStep.value) {
    selectedAction.value = option;
    return;
  }
  selectedEvent.value = option;
}

/**
 * Change to the next step
 */
function nextStep() {
  if (currentStep.value === 1) {
    const [entityType, mutationType] = selectedEvent.value.split(':');
    router.push({
      name: 'GovernanceEventEdit',
      params: { eventId: 'new' },
      query: {
        entityType,
        mutationType,
        eventAction: selectedAction.value,
      },
    });
    return;
  }
  currentStep.value += 1;
}

/**
 * Return to previous step
 */
function previousStep() {
  currentStep.value -= 1;
}

/**
 * Load the event config on show; cached by the store (retry on reopen after failure).
 */
async function onShow() {
  if (governanceStore.eventConfig !== null) return;
  configLoading.value = true;
  configError.value = false;
  try {
    await governanceStore.setEventConfig();
  } catch (error) {
    configError.value = true;
    showErrorMessage(error, i18n.global.t('governance.events.errors.getConfigError'));
  } finally {
    configLoading.value = false;
  }
}

/**
 * Reset the modal
 */
function onHide() {
  currentStep.value = 0;
  selectedAction.value = null;
  selectedEvent.value = null;
  configError.value = false;
  configLoading.value = false;
}

// a changed trigger may not support the previously selected action
watch(selectedEvent, () => {
  selectedAction.value = null;
});

</script>

<style lang="scss" scoped>
// stretch cards to equal height within each grid row
:deep(.card-input) {
  height: 100%;
}
</style>

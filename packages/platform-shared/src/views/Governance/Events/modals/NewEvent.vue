<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="newEventModal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="$t('common.newObject', { object: $t('governance.events.event') })"
    @hidden="onHide">
    <BRow>
      <BCol lg="4">
        <h3 class="h5">
          {{ stepGenerals.title }}
        </h3>
        <p class="mb-4">
          {{ stepGenerals.subTitle }}
        </p>
      </BCol>
      <BCol lg="8">
        <div class="pl-lg-4">
          <FrCardRadioInput
            v-for="option in currentOptions"
            :key="option.value"
            :radio-value="option.value"
            :value="currentStep ? selectedAction : selectedEvent"
            @change="changeSelection"
            class="mb-3">
            <BMedia no-body>
              <FrIcon
                :name="option.icon"
                :icon-class="`wh-34px rounded-circle d-flex align-items-center justify-content-center mr-3 ${option.iconClasses}`" />
              <BMediaBody>
                <h3
                  class="h5"
                  :aria-label="option.name">
                  {{ option.name }}
                </h3>
                <div class="d-block mb-3">
                  {{ option.description }}
                </div>
              </BMediaBody>
            </BMedia>
          </FrCardRadioInput>
        </div>
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
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { capitalize } from 'lodash';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

/**
 * @typedef OptionsElement
 * @property {String} description
 * @property {String} icon
 * @property {String} iconClasses
 * @property {String} name
 * @property {String} value
*/

// composables
const router = useRouter();

// data
const currentStep = ref(0);
const selectedAction = ref(null);
const selectedEvent = ref(null);

/**
 * Event triggers options
 * @type {OptionsElement[]}
 */
const EVENT_TRIGGERS = [
  {
    description: capitalize(i18n.global.t('governance.events.newEventModal.userTrigger', { userAction: i18n.global.t('common.created') })),
    icon: 'person_add_alt',
    iconClasses: 'text-success bg-lightgreen',
    name: capitalize(i18n.global.t('governance.events.newEventModal.userAction', { action: i18n.global.t('common.created') })),
    value: 'userCreate',
  },
  {
    description: capitalize(i18n.global.t('governance.events.newEventModal.userTrigger', { userAction: i18n.global.t('common.updated') })),
    icon: 'manage_accounts',
    iconClasses: 'text-success bg-lightgreen',
    name: capitalize(i18n.global.t('governance.events.newEventModal.userAction', { action: i18n.global.t('common.updated') })),
    value: 'userUpdate',
  },
];

/**
 * Event actions options
 * @type {OptionsElement[]}
 */
const EVENT_ACTIONS = [
  {
    description: capitalize(i18n.global.t('governance.events.newEventModal.triggerCertification')),
    icon: 'grading',
    iconClasses: 'text-warning bg-lightyellow',
    name: capitalize(i18n.global.t('governance.events.newEventModal.certification')),
    value: 'certification',
  },
  {
    description: capitalize(i18n.global.t('governance.events.newEventModal.triggerWorkflow')),
    icon: 'account_tree',
    iconClasses: 'text-info bg-lightblue',
    name: capitalize(i18n.global.t('governance.events.newEventModal.workflow')),
    value: 'workflow',
  },
];

// computed
const currentOptions = computed(() => (currentStep.value ? EVENT_ACTIONS : EVENT_TRIGGERS));
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
  (currentStep.value === 0 && !selectedEvent.value)
  || (currentStep.value !== 0 && !selectedAction.value)
));

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
    router.push({
      name: 'GovernanceEventEdit',
      params: { eventId: 'new' },
      query: {
        eventTrigger: selectedEvent.value,
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
 * Reset the modal
 */
function onHide() {
  currentStep.value = 0;
  selectedAction.value = null;
  selectedEvent.value = null;
}

</script>

<style lang="scss" scoped>
.wh-34px {
  width: 34px;
  height: 34px;
}
</style>

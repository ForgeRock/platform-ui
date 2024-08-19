<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BModal
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    id="related-entity-settings-modal"
    :static="isTesting"
    :title="$t('reports.template.relationshipSettings')"
    @hidden="resetValues">
    <BFormGroup
      v-slot="{ ariaDescribedby }"
      :label="$t('reports.template.joinTypes.title')">
      <BFormRadioGroup
        v-model="joinTypeSelection"
        :options="joinTypeRadios"
        :aria-describedby="ariaDescribedby"
        name="related-entity-join-type"
        stacked />
    </BFormGroup>
    <template #modal-footer="{ cancel }">
      <div class="d-flex">
        <BButton
          variant="link"
          :disabled="isSaving"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :disabled="isSaving"
          :show-spinner="isSaving"
          variant="primary"
          @click="emit('set-related-entity-type', joinTypeSelection)" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * @description
 * Modal for setting a related entity join type
 */
import { ref, watch } from 'vue';
import {
  BButton,
  BFormGroup,
  BFormRadioGroup,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import i18n from '@/i18n';

// Definitions
const emit = defineEmits(['hidden', 'set-related-entity-type',
]);
const props = defineProps({
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  joinType: {
    type: String,
    default: 'left',
  },
});

// Globals
const joinTypeSelection = ref('left');
const joinTypeRadios = [
  { text: i18n.global.t('reports.template.joinTypes.includeParentMatch'), value: 'left' },
  { text: i18n.global.t('reports.template.joinTypes.includeParentNonMatch'), value: 'right' },
  { text: i18n.global.t('reports.template.joinTypes.includeMatch'), value: 'inner' },
  // API cannot currently handle this option so this has been requested to be hidden for now.
  // { text: i18n.global.t('reports.template.joinTypes.includeAll'), value: 'full' },
];

// Functions
function resetValues() {
  joinTypeSelection.value = 'left';
  emit('hidden');
}

// Watchers
watch(() => props.joinType, (type) => {
  if (type) {
    joinTypeSelection.value = type;
  }
});
</script>

<style lang="scss" scoped>
:deep(.custom-radio) {
  margin-bottom: 5px;
}
</style>

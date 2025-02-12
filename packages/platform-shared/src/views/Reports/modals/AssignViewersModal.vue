<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="assign-viewers-modal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('reports.menu.assignReport')"
    @hidden="hidden">
    <FrReportSettingsAssignViewersForm
      :model-value="viewers"
      @update:modelValue="viewers = $event" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        :disabled="isSaving"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :button-text="$t('common.save')"
        :disabled="isSaving"
        :show-spinner="isSaving"
        @click="$emit('save', viewers)" />
    </template>
  </BModal>
</template>

<script setup>
import { BButton, BModal } from 'bootstrap-vue';
import { ref, watch } from 'vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrReportSettingsAssignViewersForm from '../ReportTemplate/ReportSettingsAssignViewersForm';

/**
 * @description Modal for assigning viewers to a report
 *
 * @prop {Array} reportViewers - array of viewers to assign to the report
 * @prop {Boolean} isSaving - flag to determine if the modal is saving
 * @prop {Boolean} isTesting - flag to determine if the modal is in testing mode
 *
 * @emits save - emits the viewers array when the save button is clicked
 * @emits hidden - emits when the modal is hidden
 */

const props = defineProps({
  reportViewers: {
    type: Array,
    default: () => [],
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'hidden']);

const viewers = ref(props.reportViewers);

function hidden() {
  viewers.value = [];
  emit('hidden');
}

watch(() => props.reportViewers, (newVal) => {
  viewers.value = newVal;
});
</script>

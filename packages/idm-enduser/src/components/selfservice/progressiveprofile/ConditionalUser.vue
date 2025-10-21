<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    as="div"
    v-slot="{ meta: { valid } }">
    <BForm
      @keyup.enter="save()"
      @submit.prevent
      v-if="selfServiceDetails.requirements?.uiConfig">
      <BFormGroup
        class="mb-4"
        v-for="property in selfServiceDetails.requirements.attributes"
        :key="property.name">
        <FrField
          v-if="property.schema.type !== 'boolean'"
          :label="property.schema.title"
          :validation="property.isRequired ? 'required' : ''"
          :value="property.value"
          @input="saveDetails[property.name] = $event"
          type="text" />
        <FrField
          v-else
          v-model="saveDetails[property.name]"
          :label="property.schema.title || property.schema.description"
          type="checkbox" />
      </BFormGroup>

      <div
        v-if="selfServiceDetails.requirements.terms"
        v-html="selfServiceDetails.requirements.terms"
        class="mb-4 bg-light p-3 border border-light rounded text-left tc-scrolling-display" />

      <FrKBAUpdate
        v-if="selfServiceDetails.requirements.definitions"
        @update:data="kbaFormGroupData = $event"
        :self-service-details="selfServiceDetails" />

      <BButton
        @click="save()"
        :disabled="!valid"
        variant="primary"
        block
        class="mt-1">
        {{ selfServiceDetails.requirements.uiConfig.buttonText }}
      </BButton>
    </BForm>
  </VeeForm>
</template>

<script setup>
/**
 * @description Selfservice stage for progressive profile, will auto generate fields based on the configuring for progressive profiling
 * */
import { Form as VeeForm } from 'vee-validate';
import { ref, watch } from 'vue';
import {
  BButton,
  BForm,
  BFormGroup,
} from 'bootstrap-vue';
import {
  isEmpty,
  clone,
  each,
  has,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrKBAUpdate from './KBAUpdate';

const props = defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['advanceStage']);

const kbaFormGroupData = ref(null);
const saveDetails = ref({});

/**
 * Retrieves the data from user properties.
 * @returns {Object} The data object containing properties used by the component.
 */
function getData() {
  const details = clone(saveDetails.value);
  // loop over the form attributes and set empty strings to null
  each(details, (val, key) => {
    if (val === '') {
      details[key] = null;
    }
  });

  return { attributes: details };
}

/**
 * Emits the advanceStage event with the correct payload based on the current requirements.
 */
function save() {
  if (has(props.selfServiceDetails, 'requirements.terms')) {
    emit('advanceStage', { accept: 'true' });
  } else if (has(props.selfServiceDetails, 'requirements.properties.kba')) {
    emit('advanceStage', kbaFormGroupData.value);
  } else {
    emit('advanceStage', getData());
  }
}

watch(() => props.selfServiceDetails, () => {
  if (!isEmpty(props.selfServiceDetails.requirements)) {
    each(props.selfServiceDetails.requirements.attributes, (property) => {
      saveDetails.value[property.name] = property.value;
    });
  }
}, { deep: true });

</script>
<style lang="scss" scoped>
.tc-scrolling-display {
    overflow-y: scroll;
    height:310px;
}
</style>

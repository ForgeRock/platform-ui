<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-for="(field, index) in displayDetails">
      <BFormGroup
        :label="startCase(field.key)"
        label-for="field.key"
        horizontal
        :key="`group-1-genericField${index}`"
        v-if="(field.type === 'string' || field.type === 'number')">
        <FrField
          :ref="index === 0 ? 'focusInput' : ''"
          v-if="field.type === 'string'"
          v-model.trim="saveFields[field.key]"
          class="mb-4"
          :label="field.text"
          :autocomplete="field.key" />

        <FrField
          :ref="index === 0 ? 'focusInput' : ''"
          v-else-if="field.type === 'number'"
          :name="field.key"
          type="number"
          :autocomplete="field.key"
          v-model.number="saveFields[field.key]" />
      </BFormGroup>

      <!-- for boolean values -->
      <BFormGroup
        :key="`group-2-genericField${index}`"
        v-else-if="field.type === 'boolean'">
        <FrField
          v-model="saveFields[field.key]"
          class="mb-4"
          :name="field.key"
          :label="startCase(field.key)"
          type="checkbox" />
      </BFormGroup>
    </template>
    <BButton
      @click="save"
      class="mt-4"
      block
      size="lg"
      variant="primary">
      {{ $t("common.form.submit") }}
    </BButton>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { each, startCase } from 'lodash';
import {
  BButton,
  BFormGroup,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

/**
 * @description Selfservice stage for multiple selfservice flows, attempts to auto generate a form for a user to fill out. Currently
 * generates only numbers, strings and boolean fields. This stage will only load when no other stage is found.
 */

const props = defineProps({
  selfServiceDetails: { type: Object, required: true },
});

const emit = defineEmits(['advance-stage']);

const saveData = {};
const displayDetails = ref([]);

const saveFields = reactive(saveData);

function loadFields() {
  if (props.selfServiceDetails?.requirements?.properties) {
    each(props.selfServiceDetails.requirements.properties, (prop, key) => {
      displayDetails.value.push({
        type: prop.type,
        text: prop.description,
        key,
      });

      if (prop.type === 'string') {
        saveData[key] = '';
      } else if (prop.type === 'boolean') {
        saveData[key] = false;
      } else {
        saveData[key] = null;
      }
    });
  }
}

function getData() {
  return saveFields;
}

function save() {
  emit('advance-stage', getData());
}

function isValid() {
  return Promise.resolve(true);
}

defineExpose({
  getData,
  isValid,
  startCase,
});

onMounted(() => {
  loadFields();
});
</script>

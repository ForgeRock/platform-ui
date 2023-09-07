<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="fieldOptionsModel"
    class="mb-3"
    close-on-select
    type="multiselect"
    :internal-search="false"
    :label="fieldOptionsModel.length ? label : ''"
    :name="name"
    :options="fieldOptions"
    :placeholder="placeholder">
    <template #tag="{ option, remove }">
      <div class="multiselect__tag">
        <BMedia
          no-body
          class="d-flex align-items-center">
          <FrIcon
            :class="`text-${option.text.color}`"
            :name="option.text.icon" />
          <BMediaBody class="pl-1">
            <div
              class="text-dark"
              tabindex="0">
              {{ option.text.label }}
            </div>
          </BMediaBody>
        </BMedia>
        <span
          class="multiselect__tag-icon"
          tabindex="0"
          :aria-label="$t('common.remove')"
          @click.prevent="remove(option)"
          @keydown.enter="remove(option)" />
      </div>
    </template>
    <template #option="{ option }">
      <BMedia
        no-body
        class="d-flex align-items-center">
        <FrIcon
          :class="`text-${option.text.color}`"
          :name="option.text.icon" />
        <BMediaBody class="pl-2">
          <div class="text-dark">
            {{ option.text.label }}
          </div>
        </BMediaBody>
      </BMedia>
    </template>
  </FrField>
</template>

<script setup>
/**
 * @description Displays the default run reports field, with custom tags, for running reports
 */
import { ref, watch } from 'vue';
import {
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';

defineProps({
  fieldOptions: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['field-value-update']);

const fieldOptionsModel = ref([]);
watch(fieldOptionsModel, (value) => emit('field-value-update', value));
</script>

<style lang="scss" scoped>
.fr-close-icon {
  position: absolute;
  top: -2px;
  right: 4px;

  span {
    color: $gray-600;
    font-size: 11px;
    font-weight: 700;

    &:hover {
      color: $black;
    }
  }
}
</style>

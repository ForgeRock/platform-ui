<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver v-slot="{ invalid }">
    <div class="mb-2">
      <label class="text-secondary w-100">
        <span
          :id="keyModel.label"
          tabindex="0"
          class="fr-label-text">
          {{ keyModel.label }}
        </span>
      </label>
      <FrBasicInput
        v-model="keyModel.value"
        type="string"
        :autofocus="autofocus"
        :name="keyModel.label"
        :validation="validationRules" />
    </div>
    <div class="mb-2">
      <label class="text-secondary w-100">
        <span
          :id="valueModel.label"
          tabindex="0"
          class="fr-label-text">
          {{ valueModel.label }}
        </span>
      </label>
      <FrTextArea
        v-model="valueModel.value"
        validation="required"
        :data-vv-as="valueModel.label"
        :name="valueModel.label" />
    </div>
    <div class="fr-key-value-add-panel-footer mt-3">
      <div class="pt-3 mr-3">
        <span
          class="fr-link"
          @click="$emit('cancel')">
          {{ $t('common.cancel') }}
        </span>
      </div>
      <BButton
        @click="saveKeyValue"
        :disabled="invalid"
        variant="outline-primary">
        {{ $t('common.save') }}
      </BButton>
    </div>
  </ValidationObserver>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrBasicInput from '@forgerock/platform-shared/src/components/Field/BasicInput';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';

/**
 * New/Edit Key value pair component
 */
export default {
  name: 'KeyValuePanel',
  components: {
    BButton,
    FrBasicInput,
    FrTextArea,
    ValidationObserver,
  },
  props: {
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {},
    },
    validationRules: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      keyModel: {
        label: this.$t('trees.editPanel.key'),
        value: '',
      },
      valueModel: {
        label: this.$t('trees.editPanel.value'),
        value: '',
      },
    };
  },
  mounted() {
    this.keyModel.value = this.value.key;
    this.valueModel.value = this.value.value;
  },
  methods: {
    /**
      * Emits an input change to notify v-model that the component has updated
      */
    saveKeyValue() {
      this.$emit('save-key-value', { key: this.keyModel.value, value: this.valueModel.value });
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-key-value-add-panel-footer {
  display: flex;
  justify-content: flex-end;
}

.fr-link {
  color: $blue;

  &:hover {
    cursor: pointer;
    color: $hover-blue;
  }
}
</style>

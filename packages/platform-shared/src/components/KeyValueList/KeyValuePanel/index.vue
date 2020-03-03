<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="fr-key-value-panel p-3">
    <label class="text-secondary mb-1">
      {{ $t('trees.editPanel.key') }}
    </label>
    <ValidationObserver v-slot="{ invalid }">
      <ValidationProvider
        mode="aggressive"
        :rules="validationRules"
        v-slot="{ errors }">
        <BFormInput
          v-model.trim="keyText"
          :state="errors.length > 0 ? false : null" />
        <FrValidationError
          class="error-message"
          :validator-errors="errors" />
      </ValidationProvider>
      <label class="text-secondary mb-1 mt-3">
        {{ $t('trees.editPanel.value') }}
      </label>
      <ValidationProvider
        mode="aggressive"
        rules="required"
        v-slot="{ errors }">
        <BFormTextarea
          v-model.trim="valueText"
          :state="errors.length > 0 ? false : null" />
        <FrValidationError
          class="error-message"
          :validator-errors="errors" />
      </ValidationProvider>
      <div class="fr-key-value-add-panel-footer mt-3">
        <div class="pt-3 mr-3">
          <span
            class="fr-key-link"
            @click="$emit('cancel')">
            {{ $t('common.cancel') }}
          </span>
        </div>
        <BButton
          @click="saveKeyValue"
          :disabled="invalid"
          variant="outline-primary">
          Save
        </BButton>
      </div>
    </ValidationObserver>
  </div>
</template>

<script>
import {
  BButton, BFormInput, BFormTextarea,
} from 'bootstrap-vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';

/**
 * New/Edit Key value pair component
 */
export default {
  name: 'KeyValuePanel',
  components: {
    BButton,
    BFormInput,
    BFormTextarea,
    FrValidationError: ValidationErrorList,
    ValidationObserver,
    ValidationProvider,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    validationRules: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      keyText: '',
      valueText: '',
    };
  },
  mounted() {
    this.keyText = this.value.key;
    this.valueText = this.value.value;
  },
  methods: {
    /**
      * Emits an input change to notify v-model that the component has updated
      */
    saveKeyValue() {
      this.$emit('saveKeyValue', { key: this.keyText, value: this.valueText });
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-key-value-panel {
  background-color: $gray-100;
}

.fr-key-value-add-panel-footer {
  display: flex;
  justify-content: flex-end;
}

.fr-key-link {
  color: $blue;

  &:hover {
    cursor: pointer;
    color: $hover-blue;
  }
}
</style>

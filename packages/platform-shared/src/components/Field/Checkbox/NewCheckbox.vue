<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex">
      <BFormCheckbox
        v-model="inputValue"
        v-bind="$attrs"
        class="mr-0 zindex-1 align-middle"
        role="checkbox"
        inline
        :aria-label="switchLabel"
        :disabled="disabled"
        :name="name"
        :data-testid="testid"
        :value="$attrs.cbcheckedvalue"
        :unchecked-value="$attrs.cbuncheckedvalue">
        <slot name="prepend" />
        <template v-if="switchLabel">
          <div
            class="mb-1 text-secondary"
            :class="{'d-inline': inline}">
            {{ switchLabel }}
          </div>
        </template>
        <slot
          name="label"
          :is-inline-label="true" />
      </BFormCheckbox>
    </div>
    <FrValidationError
      class="error-messages flex-grow-1"
      :validator-errors="combinedErrors"
      :field-name="name" />
    <template v-if="description">
      <small
        v-if="isHtml"
        :id="`${internalId}_helpText`"
        v-html="description"
        class="form-text text-muted" />
      <small
        v-else
        :id="`${internalId}_helpText`"
        class="form-text text-muted">
        {{ getTranslation(description) }}
      </small>
    </template>
  </div>
</template>

<script>
import { useField } from 'vee-validate';
import { BFormCheckbox } from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { toRef } from 'vue';
import uuid from 'uuid/v4';
import FrValidationError from '@forgerock/platform-shared/src/components/ValidationErrorList';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Checkbox with a label to the right
 *
 * @Mixes InputMixin - default props and methods for inputs
 * @param {Boolean} value default ''
 * @slot append - Checkbox label
 */
export default {
  name: 'FrCheckbox',
  compatConfig: {
    INSTANCE_LISTENERS: false,
  },
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BFormCheckbox,
    FrValidationError,
  },
  inheritAttrs: false,
  props: {
    inline: {
      type: Boolean,
      default: false,
    },
    testid: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const {
      value: inputValue,
      errors: fieldErrors,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, type: 'checkbox', initialValue: '' });
    return { inputValue, fieldErrors };
  },
  computed: {
    switchLabel() {
      return this.label || this.description;
    },
    combinedErrors() {
      return this.errors.concat(this.fieldErrors);
    },
  },
};
</script>

<style lang="scss" scoped>
.zindex-1 {
  z-index: 1;
}
</style>

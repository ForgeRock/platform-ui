<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex">
      <ValidationProvider
        :rules="validation"
        :name="name"
        v-slot="{ validate }">
        <BFormCheckbox
          v-model="inputValue"
          v-on="$listeners"
          @change="validate($event)"
          class="mr-0 zindex-1"
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
          <slot name="append" />
        </BFormCheckbox>
      </ValidationProvider>
    </div>
    <template v-if="description">
      <small
        v-if="isHtml"
        :id="`${id}_helpText`"
        v-html="description"
        class="form-text text-muted" />
      <small
        v-else
        :id="`${id}_helpText`"
        class="form-text text-muted">
        {{ getTranslation(description) }}
      </small>
    </template>
  </div>
</template>

<script>
import { ValidationProvider } from 'vee-validate';
import { BFormCheckbox } from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
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
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BFormCheckbox,
    ValidationProvider,
  },
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
  computed: {
    switchLabel() {
      return this.label || this.description;
    },
  },
};
</script>

<style lang="scss" scoped>
.zindex-1 {
  z-index: 1;
}
</style>

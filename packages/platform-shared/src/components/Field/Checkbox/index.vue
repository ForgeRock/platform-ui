<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex">
      <BFormCheckbox
        v-model="inputValue"
        v-on="$listeners"
        class="mr-0 zindex-1"
        role="checkbox"
        inline
        :aria-label="switchLabel"
        :disabled="disabled"
        :name="name"
        :data-testid="testid"
        :value="$attrs.cbcheckedvalue"
        :unchecked-value="$attrs.cbuncheckedvalue" />
      <label class="mb-1 text-secondary">
        {{ switchLabel }}
      </label>
      <slot name="append" />
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
import { BFormCheckbox } from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Checkbox with a label to the right
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Boolean} value default ''
 */
export default {
  name: 'FrCheckbox',
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BFormCheckbox,
  },
  props: {
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

<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    class="password-field"
    v-bind="{...$attrs}"
    :label="showLabelOverField ? $t('common.answer') : $attrs.label"
    v-on="$listeners">
    <template #label>
      <label
        data-test-id="aboveFieldLabel"
        ref="aboveFieldLabel"
        :aria-hidden="!showLabelOverField"
        :class="{'invisible position-absolute text-nowrap': !showLabelOverField}">
        {{ $attrs.label }}
      </label>
    </template>
  </FrField>
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'PasswordCallback',
  components: {
    FrField,
  },
  data() {
    return {
      inputLabelWidth: null,
      aboveFieldLabelWidth: null,
      inputLabelObserver: null,
      aboveFieldLabelObserver: null,
    };
  },
  computed: {
    showLabelOverField() {
      if (!this.inputLabelWidth || !this.aboveFieldLabelWidth) {
        return false;
      }
      return this.aboveFieldLabelWidth >= this.inputLabelWidth;
    },
  },
  methods: {
    /**
     * @description fetches the labels
     * the inputLabel refers to the text shown inside an input as a placeholder/hint
     * the aboveFieldLabel refers to an invisible label used to compare the widths
     * this function sets up two observers, one for each of the labels
     * that change the component's aboveFieldLabelWidth and inputLabelWidth properties
     * which are used to determine if the label should be shown above the field
     * or inside
     */
    fetchElements() {
      const inputLabel = this.$el.querySelector('.password-field .form-label-group-input label');
      const { aboveFieldLabel } = this.$refs;
      this.inputLabelObserver = new ResizeObserver(([newInputLabel]) => {
        this.inputLabelWidth = newInputLabel.contentRect.width;
      });
      this.inputLabelObserver.observe(inputLabel);
      this.aboveFieldLabelObserver = new ResizeObserver(([newAboveFieldLabel]) => {
        this.aboveFieldLabelWidth = newAboveFieldLabel.contentRect.width;
      });
      this.aboveFieldLabelObserver.observe(aboveFieldLabel);
    },
  },
  mounted() {
    this.fetchElements();
  },
  destroyed() {
    this.inputLabelObserver.disconnect();
    this.aboveFieldLabelObserver.disconnect();
  },
};
</script>

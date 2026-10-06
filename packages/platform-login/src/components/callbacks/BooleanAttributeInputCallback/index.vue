<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="text-left mb-2">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value">
    <FrField
      v-model="value"
      type="checkbox"
      :id="'boolean_callback_' + index"
      :label="getTranslation(getLocalizedFieldLabel(callback))"
      @change="onToggle()" />
  </div>
</template>

<script>
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { getLocalizedFieldLabel } from '@forgerock/platform-shared/src/utils/translations';
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'BooleanAttributeInputCallback',
  mixins: [
    TranslationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  components: {
    FrField,
  },
  methods: {
    // FrCheckbox renders the label prop verbatim, so getTranslation must wrap
    // the resolver here to keep the overrides.<prompt> localization.
    getLocalizedFieldLabel,
    onToggle() {
      this.callback.setInputValue(this.value);
    },
  },
  data() {
    return {
      name: `callback_${this.index}`,
      value: this.callback?.getInputValue() || false,
    };
  },
};
</script>

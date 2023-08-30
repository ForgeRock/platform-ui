<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

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
      :label="getTranslation(callback.getPrompt())"
      @change="onToggle()" />
  </div>
</template>

<script>
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
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
  data() {
    return {
      name: `callback_${this.index}`,
      value: this.callback?.getInputValue() || false,
    };
  },
  methods: {
    onToggle() {
      this.callback.setInputValue(this.value);
    },
  },
};
</script>

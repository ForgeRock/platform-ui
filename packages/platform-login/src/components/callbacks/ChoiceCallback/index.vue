<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="selected.value"
      type="select"
      :label="selected.label"
      :name="selected.name"
      :options="selected.options"
      @input="callback.setInputValue(selected.value)" />
  </div>
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'ChoiceCallback',
  components: {
    FrField,
  },
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
  mounted() {
    const choices = this.getTranslation(this.callback.getChoices());
    this.selected.options = choices.map((item, itemIndex) => ({
      text: item,
      value: itemIndex,
    }));
  },
  data() {
    return {
      selected: {
        name: `callback_${this.index}`,
        label: this.callback.getPrompt(),
        value: this.callback.getDefaultChoice(),
        options: [],
      },
    };
  },
};
</script>

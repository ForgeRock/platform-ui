<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormGroup
    v-if="displayType === 'radio'"
    class="text-left"
    :label="getTranslation(selected.label)">
    <BFormRadioGroup
      v-model="selected.value"
      :options="selected.options"
      text-field="text"
      stacked
      @input="callback.setInputValue(selected.value)" />
  </BFormGroup>
  <FrField
    v-else
    v-model="selected.value"
    type="select"
    :floating-label="floatingLabel"
    :label="selected.label"
    :name="selected.name"
    :options="selected.options"
    @input="callback.setInputValue(selected.value)" />
</template>

<script>
import {
  BFormGroup,
  BFormRadioGroup,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'ChoiceCallback',
  components: {
    FrField,
    BFormGroup,
    BFormRadioGroup,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
    floatingLabel: {
      type: Boolean,
      default: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    /**
     * Stage info
     */
    stage: {
      type: Object,
      default: null,
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
  computed: {
    displayType() {
      try {
        return this.stage.displayType;
      } catch (e) {
        return 'select';
      }
    },
  },
};
</script>

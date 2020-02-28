<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved
Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrFloatingLabelInput
      type="select"
      :field-name="name"
      :label="callback.getPrompt()"
      v-model="selected"
      :select-options="options" />
  </div>
</template>
<script>
import { map } from 'lodash';
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';

export default {
  components: {
    FrFloatingLabelInput: FloatingLabelInput,
  },
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
    this.name = `callback_${this.index}`;
    this.loadOptions();
    this.selected = this.callback.getDefaultChoice();
  },
  data() {
    return {
      options: [],
      name: '',
      selected: null,
      choices: this.callback.getChoices(),
    };
  },
  watch: {
    selected(newVal) {
      this.callback.setInputValue(newVal);
    },
  },
  methods: {
    loadOptions() {
      this.options = map(this.choices, (item, itemIndex) => ({
        text: item,
        value: itemIndex.toString(),
      }));
    },
  },
};
</script>

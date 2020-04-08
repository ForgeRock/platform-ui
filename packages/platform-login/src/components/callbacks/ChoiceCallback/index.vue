<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved
Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrField :field="selected" />
  </div>
</template>
<script>
import { map } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  components: {
    FrField,
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
    this.loadOptions();
  },
  data() {
    return {
      selected: {
        key: `callback_${this.index}`,
        title: this.callback.getPrompt(),
        type: 'select',
        value: this.callback.getDefaultChoice(),
        options: [],
      },
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
      this.selected.options = map(this.choices, (item, itemIndex) => ({
        text: item,
        value: itemIndex.toString(),
      }));
    },
  },
};
</script>

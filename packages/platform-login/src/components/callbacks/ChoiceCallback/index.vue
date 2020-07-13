<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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
    selected: {
      handler(newVal) {
        this.callback.setInputValue(newVal.value);
      },
      deep: true,
    },
  },
  methods: {
    loadOptions() {
      this.selected.options = map(this.choices, (item, itemIndex) => ({
        text: item,
        value: itemIndex,
      }));
    },
  },
};
</script>

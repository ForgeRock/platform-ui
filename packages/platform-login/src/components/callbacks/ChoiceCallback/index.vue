<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <label>{{ callback.getPrompt() }}</label>
    <BFormSelect
      :options="options"
      :name="name"
      v-model="selected"
      class="mb-2"
      @change="setValue" />
  </div>
</template>

<script>
import { map } from 'lodash';
import { BFormSelect } from 'bootstrap-vue';

export default {
  components: {
    BFormSelect,
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
    this.selected = this.callback.getDefaultChoice();

    this.name = `callback_${this.index}`;

    this.loadOptions();
  },
  data() {
    return {
      options: [],
      name: '',
      selected: null,
      choices: this.callback.getChoices(),
    };
  },
  methods: {
    loadOptions() {
      this.name = `callback_${this.index}`;
      this.options = map(this.choices, (item, itemIndex) => ({
        text: item,
        value: itemIndex,
      }));
    },
    setValue() {
      this.callback.setInputValue(this.selected);
    },
  },
};
</script>

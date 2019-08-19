<template>
  <div>
    <label>{{ prompt }}</label>
    <BFormSelect
      :options="options"
      :name="name"
      v-model="selected"
      class="mb-2"
    />
  </div>
</template>

<script>
import {
  mapValues, keyBy, map, isArray,
} from 'lodash';
import { BFormSelect } from 'bootstrap-vue';

export default {
  components: {
    BFormSelect,
  },
  props: {
    callback: {
      type: Object,
      // make sure the callback has an output property that is an Array and has at least one item
      validator: prop => prop.output
                  && isArray(prop.output)
                  && prop.output.length > 0,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    prompt: {
      type: String,
      default: '',
    },
    choices: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    const callbackOutput = mapValues(keyBy(this.callback.output, 'name'), v => v.value);

    this.selected = callbackOutput.defaultChoice;

    this.loadOptions();
  },
  data() {
    return {
      options: [],
      name: '',
      selected: null,
    };
  },
  methods: {
    loadOptions() {
      this.name = `callback_${this.index}`;
      this.options = map(this.choices, item => ({
        text: item.value,
        value: item.key,
      }));
    },
  },
};
</script>

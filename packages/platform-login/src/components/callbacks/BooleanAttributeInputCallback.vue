<template>
  <div class="row text-left ml-1 mb-2">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value">
    <input
      class="ml-1 mt-1"
      type="checkbox"
      :id="'boolean_callback_' + index"
      :value="value"
      :checked="value"
      @change="onToggle()">
    <label
      class="ml-2"
      :for="'boolean_callback_' + index">
      {{ callback.getPrompt() }}
    </label>
  </div>
</template>

<script>

export default {
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

    this.value = this.callback.getInputValue();
  },
  data() {
    return {
      name: '',
      value: false,
    };
  },
  methods: {
    onToggle() {
      this.value = !this.value;

      this.callback.setInputValue(this.value);
    },
  },
};
</script>

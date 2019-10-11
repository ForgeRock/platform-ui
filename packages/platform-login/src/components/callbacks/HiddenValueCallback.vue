<template>
  <div class="row">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value"
      @change="onChange()">
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
      value: '',
    };
  },
  methods: {
    onChange() {
      this.callback.setInputValue(this.value);
    },
  },
};
</script>
